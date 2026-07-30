from __future__ import annotations

import argparse, csv, hashlib, json, math
from datetime import datetime, timezone
from pathlib import Path


def canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()


def load_fraction(minute: float) -> float:
    if minute < 15:
        return 0.25
    if minute < 30:
        return 0.50
    if minute < 45:
        return 0.75
    return 1.00


def run(mission_path: Path, output_root: Path) -> Path:
    mission = json.loads(mission_path.read_text())
    run_id = f"{mission['mission_id']}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    out = output_root / run_id
    out.mkdir(parents=True, exist_ok=False)
    dt_s = mission['sample_interval_seconds']
    duration_s = mission['test_duration_minutes'] * 60
    cp = mission['coolant']['specific_heat_kj_kg_k']
    density = mission['coolant']['density_kg_l']
    flow_lpm = mission['plant']['design_flow_lpm']
    fault_s = mission['fault']['inject_after_minutes'] * 60
    recover_s = fault_s + mission['fault']['redundant_start_seconds']
    rows, heat_kwh, useful_kwh = [], 0.0, 0.0

    for t in range(0, duration_s + 1, dt_s):
        minute = t / 60
        frac = load_fraction(minute)
        load_kw = mission['target_thermal_load_kw'] * frac
        pump, flow = 'primary', flow_lpm
        if fault_s <= t < recover_s:
            pump, flow = 'transition', flow_lpm * 0.35
        elif t >= recover_s:
            pump = 'secondary'
        supply = mission['plant']['supply_setpoint_c'] + 0.35 * math.sin(t / 360)
        delta_t = load_kw / max((flow / 60 * density) * cp, 0.01)
        return_c = supply + delta_t
        capture = load_kw * (0.97 if flow >= flow_lpm * 0.9 else 0.88)
        useful = capture * mission['plant']['heat_recovery_fraction']
        heat_kwh += capture * dt_s / 3600
        useful_kwh += useful * dt_s / 3600
        rows.append({
            'elapsed_s': t,
            'load_kw': round(load_kw, 4),
            'flow_lpm': round(flow, 4),
            'pump': pump,
            'supply_c': round(supply, 4),
            'return_c': round(return_c, 4),
            'captured_kw': round(capture, 4),
            'useful_heat_kw': round(useful, 4),
        })

    with (out / 'raw-telemetry.csv').open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    total_it_kwh = sum(row['load_kw'] * dt_s / 3600 for row in rows)
    cooling_kw = (
        mission['plant']['secondary_pump_kw']
        + mission['plant']['dry_cooler_kw']
        + mission['plant']['controls_kw']
    )
    result = {
        'trial_id': mission['mission_id'],
        'status': 'PENDING',
        'simulation': True,
        'thermal_load_kw': mission['target_thermal_load_kw'],
        'test_duration_minutes': mission['test_duration_minutes'],
        'peak_supply_temperature_c': max(row['supply_c'] for row in rows),
        'peak_return_temperature_c': max(row['return_c'] for row in rows),
        'coolant_loss_liters': 0.0,
        'external_cooling_water_liters': 0.0,
        'it_energy_kwh': round(total_it_kwh, 4),
        'heat_captured_kwh_th': round(heat_kwh, 4),
        'useful_heat_delivered_kwh_th': round(useful_kwh, 4),
        'heat_capture_fraction': round(heat_kwh / total_it_kwh, 4),
        'useful_heat_fraction': round(useful_kwh / heat_kwh, 4),
        'cooling_power_kw': cooling_kw,
        'pump_failure_detected_seconds': mission['fault']['detection_seconds'],
        'stable_recovery_seconds': mission['fault']['redundant_start_seconds'],
    }
    acceptance = mission['acceptance']
    gates = {
        'supply_temperature': result['peak_supply_temperature_c'] <= acceptance['max_supply_temperature_c'],
        'return_temperature': result['peak_return_temperature_c'] <= acceptance['max_return_temperature_c'],
        'recovery_time': result['stable_recovery_seconds'] <= acceptance['max_recovery_seconds'],
        'heat_capture': result['heat_capture_fraction'] >= acceptance['min_heat_capture_fraction'],
        'useful_heat': result['useful_heat_fraction'] >= acceptance['min_useful_heat_fraction'],
        'external_water': result['external_cooling_water_liters'] <= acceptance['max_external_cooling_water_liters'],
        'coolant_retention': result['coolant_loss_liters'] <= acceptance['max_coolant_loss_liters'],
        'cooling_power': result['cooling_power_kw'] <= acceptance['max_cooling_power_kw'],
    }
    result['acceptance_gates'] = gates
    result['status'] = 'PASSED' if all(gates.values()) else 'FAILED'

    (out / 'mission.json').write_text(json.dumps(mission, indent=2))
    (out / 'acceptance-results.json').write_text(json.dumps(result, indent=2))
    receipt = {
        'schema': 'ghost-atlas.proofgrid.receipt.v1',
        'run_id': run_id,
        'result': result,
        'evidence': {},
    }
    for name in ['mission.json', 'raw-telemetry.csv', 'acceptance-results.json']:
        receipt['evidence'][name] = hashlib.sha256((out / name).read_bytes()).hexdigest()
    receipt['proof_hash'] = hashlib.sha256(canonical(receipt)).hexdigest()
    (out / 'promotion-receipt.json').write_text(json.dumps(receipt, indent=2))
    print(json.dumps({'run_id': run_id, 'status': result['status'], 'proof_hash': receipt['proof_hash'], 'output': str(out)}, indent=2))
    return out


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--mission', required=True, type=Path)
    parser.add_argument('--output', default=Path('.gaclc/runs'), type=Path)
    args = parser.parse_args()
    run(args.mission, args.output)
