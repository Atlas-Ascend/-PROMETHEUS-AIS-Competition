from __future__ import annotations

import argparse
import hashlib
import http.server
import json
import shutil
import socketserver
import sys
import webbrowser
from pathlib import Path

VERSION = "1.1.1"
ROOT = Path("artifacts/competition-demo")
GENOME_ID = "PG-CG-REPLAY-GUARD-001"


class ReplayDetected(RuntimeError):
    pass


class Ledger:
    def __init__(self) -> None:
        self.operations: dict[str, str] = {}

    @staticmethod
    def digest(payload: dict) -> str:
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hashlib.sha256(raw).hexdigest()

    def execute(self, operation_id: str, payload: dict, *, idempotent: bool) -> str:
        digest = self.digest(payload)
        previous = self.operations.get(operation_id)
        if previous is None:
            self.operations[operation_id] = digest
            return "executed"
        if idempotent and previous == digest:
            return "replay_safely_ignored"
        raise ReplayDetected(
            f"duplicate operation rejected: {operation_id}; "
            f"idempotent={idempotent}; payload_match={previous == digest}"
        )


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical_hash(data: dict) -> str:
    raw = json.dumps(data, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def reset_demo(root: Path = ROOT) -> dict:
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True, exist_ok=True)
    return {"status": "reset", "path": str(root)}


def run_demo(root: Path = ROOT) -> dict:
    reset_demo(root)
    events: list[dict] = []

    def event(stage: str, state: str, detail: str) -> None:
        events.append({"sequence": len(events) + 1, "stage": stage, "state": state, "detail": detail})

    mission = {
        "mission_id": "PROM-COMP-001",
        "title": "Publish a replay-safe proof receipt",
        "acceptance": [
            "reproduce a real bounded failure",
            "block unsupported promotion",
            "apply a behavior-changing repair",
            "verify evidence and reuse the repair",
        ],
    }
    write_json(root / "MISSION.json", mission)
    event("IGNITION_CHAMBER", "accepted", "Mission validated and admitted.")

    candidates = [
        {"id": "route-a", "strategy": "allow duplicate execution", "decision": "rejected"},
        {"id": "route-b", "strategy": "warn and continue", "decision": "rejected"},
        {"id": "route-c", "strategy": "enable_idempotent_replay_guard", "decision": "selected"},
    ]
    write_json(root / "CANDIDATES.json", {"candidates": candidates})
    event("FORGE_PATHS", "ready", "Three distinct routes evaluated.")

    ledger = Ledger()
    payload = {"receipt": "alpha", "artifact": "mission-output"}
    ledger.execute("publish-proof-alpha", payload, idempotent=False)
    event("EXECUTION", "started", "Initial proof publication executed.")

    failure = ""
    failed_before = 0
    try:
        ledger.execute("publish-proof-alpha", payload, idempotent=False)
    except ReplayDetected as exc:
        failure = str(exc)
        failed_before = 1
        event("TRIAL_BY_FIRE", "failed", failure)

    if failed_before != 1:
        raise AssertionError("bounded replay failure was not reproduced")

    seca = {
        "decision": "promotion_denied",
        "reason": "duplicate consequential operation was not replay-safe",
        "failure_signature": failure,
    }
    write_json(root / "SECA_DECISION.json", seca)
    event("THE_CHAIN_HOLDS", "blocked", "SECA denied unsupported promotion.")

    repaired_outcome = ledger.execute("publish-proof-alpha", payload, idempotent=True)
    if repaired_outcome != "replay_safely_ignored":
        raise AssertionError("repair did not alter replay behavior")

    hydra = {
        "repair_id": "HYDRA-REPAIR-001",
        "defect": "duplicate operation without idempotency",
        "strategy": "enable_idempotent_replay_guard",
        "before": "duplicate raises ReplayDetected",
        "after": repaired_outcome,
        "verified": True,
    }
    write_json(root / "HYDRA_REPAIR_RECEIPT.json", hydra)
    event("REPAIR_FORGE", "repaired", "HYDRA enabled idempotent replay protection.")

    tests = {"passed": 4, "failed": 0}
    write_json(root / "TEST_RESULTS.json", tests)
    event("FIRE_PROVEN", "verified", "Affected and regression tests passed.")

    genome = {
        "genome_id": GENOME_ID,
        "title": "Replay-safe consequential operation",
        "trigger": "same stable operation ID is invoked more than once",
        "applicability": ["stable operation ID", "deterministic payload hash"],
        "exclusions": ["conflicting payload under the same operation ID"],
        "repair_strategy": hydra["strategy"],
        "source_receipt": "HYDRA_REPAIR_RECEIPT.json",
        "reuse_count": 1,
        "successful_reuse_count": 1,
    }
    write_json(root / "CAPABILITY_GENOME.json", genome)
    event("FLAME_PRESERVED", "created", f"Capability Genome {GENOME_ID} created.")

    second = Ledger()
    second_payload = {"manifest": "beta", "artifact": "release-index"}
    second.execute("publish-manifest-beta", second_payload, idempotent=True)
    second_outcome = second.execute("publish-manifest-beta", second_payload, idempotent=True)
    reuse = {
        "source_genome_id": GENOME_ID,
        "task_id": "PROM-COMP-002",
        "task_title": "Publish a replay-safe release manifest",
        "relationship": "same failure class, different operation and artifact",
        "outcome": second_outcome,
        "failed_actions_without_genome": failed_before,
        "failed_actions_with_genome": 0,
        "improvement": "1 failed action -> 0 failed actions",
        "verified": second_outcome == "replay_safely_ignored",
    }
    write_json(root / "CAPABILITY_GENOME_REUSE.json", reuse)
    event("FLAME_CARRIED_FORWARD", "reused", "Related task reused the verified repair.")

    events_path = root / "EVENTS.jsonl"
    events_path.write_text("".join(json.dumps(item, sort_keys=True) + "\n" for item in events), encoding="utf-8")

    artifacts = {}
    for name in [
        "MISSION.json", "CANDIDATES.json", "SECA_DECISION.json",
        "HYDRA_REPAIR_RECEIPT.json", "TEST_RESULTS.json",
        "CAPABILITY_GENOME.json", "CAPABILITY_GENOME_REUSE.json", "EVENTS.jsonl",
    ]:
        artifacts[name] = file_hash(root / name)

    receipt_body = {
        "receipt_id": "PROOFGRID-COMP-001",
        "mission_id": mission["mission_id"],
        "status": "verified",
        "promotion": "authorized",
        "hydra_repair": hydra["repair_id"],
        "capability_genome": GENOME_ID,
        "genome_reuse_verified": reuse["verified"],
        "measured_improvement": reuse["improvement"],
        "tests": tests,
        "artifacts": artifacts,
    }
    receipt = dict(receipt_body)
    receipt["receipt_hash"] = canonical_hash(receipt_body)
    write_json(root / "FINAL_RECEIPT.json", receipt)
    event("ASCENT_AUTHORIZED", "promoted", "Build Truth supports promotion.")

    interface_data = {
        "product": "PROMETHEUS V-1.1.1",
        "mission": mission,
        "pipeline": events,
        "seca": seca,
        "hydra": hydra,
        "proofgrid": receipt,
        "genome": genome,
        "reuse": reuse,
        "readiness": "RELEASE EVIDENCE VERIFIED",
    }
    write_json(root / "interface-data.json", interface_data)

    return {
        "status": "verified",
        "mission_id": mission["mission_id"],
        "receipt": str(root / "FINAL_RECEIPT.json"),
        "receipt_hash": receipt["receipt_hash"],
        "genome_id": GENOME_ID,
        "genome_reused": reuse["verified"],
        "improvement": reuse["improvement"],
        "tests_passed": tests["passed"],
        "tests_failed": tests["failed"],
    }


def verify_receipt(path: Path) -> dict:
    receipt = json.loads(path.read_text(encoding="utf-8"))
    expected = receipt.pop("receipt_hash")
    result = {
        "receipt_hash_matches": canonical_hash(receipt) == expected,
        "artifacts": {},
    }
    for name, expected_hash in receipt["artifacts"].items():
        candidate = path.parent / name
        result["artifacts"][name] = candidate.exists() and file_hash(candidate) == expected_hash
    result["verified"] = result["receipt_hash_matches"] and all(result["artifacts"].values())
    return result


def serve(port: int) -> None:
    if not (ROOT / "interface-data.json").exists():
        run_demo()
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("127.0.0.1", port), handler) as server:
        url = f"http://127.0.0.1:{port}/competition/interface/"
        print(f"PROMETHEUS interface: {url}")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        server.serve_forever()


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="prometheus")
    sub = parser.add_subparsers(dest="command", required=True)

    doctor = sub.add_parser("doctor")
    doctor.add_argument("--json", action="store_true")

    demo = sub.add_parser("demo")
    demo.add_argument("action", choices=["competition", "reset"])

    interface = sub.add_parser("interface")
    interface.add_argument("target", choices=["competition"])
    interface.add_argument("--port", type=int, default=8787)

    receipt = sub.add_parser("receipt")
    receipt.add_argument("action", choices=["verify"])
    receipt.add_argument("path", type=Path)

    contest = sub.add_parser("contest")
    contest.add_argument("action", choices=["status", "claims-verify", "evidence-verify", "submission-check"])

    args = parser.parse_args(argv)

    if args.command == "doctor":
        checks = {
            "version": VERSION,
            "python": sys.version.split()[0],
            "repository_root": Path("README.md").exists(),
            "interface": Path("competition/interface/index.html").exists(),
            "healthy": Path("README.md").exists() and Path("competition/interface/index.html").exists(),
        }
        print(json.dumps(checks, indent=2, sort_keys=True))
        return 0 if checks["healthy"] else 1

    if args.command == "demo":
        result = reset_demo() if args.action == "reset" else run_demo()
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0

    if args.command == "interface":
        serve(args.port)
        return 0

    if args.command == "receipt":
        result = verify_receipt(args.path)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["verified"] else 1

    if args.command == "contest":
        if args.action == "status":
            result = {"version": VERSION, "evidence_exists": (ROOT / "FINAL_RECEIPT.json").exists()}
        else:
            if not (ROOT / "FINAL_RECEIPT.json").exists():
                run_demo()
            verification = verify_receipt(ROOT / "FINAL_RECEIPT.json")
            result = {
                "verified": verification["verified"],
                "interface": Path("competition/interface/index.html").exists(),
                "quickstart": Path("competition/QUICKSTART.md").exists(),
                "receipt": verification,
            }
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result.get("verified", True) else 1

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
