# GACLC-1 Live Interface

Public Ghost Atlas command-to-proof surface for Atlas Thermal Spine V0.1.

## Live site

https://raw.githack.com/Atlas-Ascend/-PROMETHEUS-AIS-Competition/main/gaclc1-live/index.html

## Source

https://github.com/Atlas-Ascend/-PROMETHEUS-AIS-Competition/tree/main/gaclc1-live

## Included

- interactive closed-loop plant schematic
- browser-side virtual qualification sequence
- primary-pump fault injection and redundant recovery
- live thermal, flow, heat-recovery, and water indicators
- eight-stage data-center conversion path
- rack promotion state machine
- ProofGrid acceptance-gate inspector
- public mission contract, virtual runtime, and receipt verifier

## Run the repository proof

```bash
python gaclc1-live/run.py --mission gaclc1-live/mission.json --output .gaclc/runs
python gaclc1-live/verify.py .gaclc/runs/<run-id>/promotion-receipt.json
```

## Truth boundary

The live page proves the interface architecture, deterministic virtual mission logic, acceptance-gate model, and public source routing. It does not claim a commissioned physical data center, measured field savings, certified coolant chemistry, or independent engineering approval.
