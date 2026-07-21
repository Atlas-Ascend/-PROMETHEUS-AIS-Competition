# PROMETHEUS AIS Competition Edition

**Repair. Prove. Remember. Evolve.**

PROMETHEUS is a self-proving, self-repairing AI engineering system that turns a software mission into an evidence-backed result.

This public competition edition executes a complete deterministic Command-to-Proof loop:

```text
mission
→ candidate routes
→ real bounded failure
→ SECA promotion block
→ HYDRA behavioral repair
→ affected and regression tests
→ ProofGrid receipt and hashes
→ Capability Genome extraction
→ related-task reuse
→ measured improvement
```

## What it proves

- SECA blocks unsupported promotion after a duplicate-operation failure.
- HYDRA changes replay behavior through an idempotent execution guard.
- ProofGrid creates a receipt whose artifact hashes can be independently verified.
- Capability Genome `PG-CG-REPLAY-GUARD-001` preserves the repair.
- A related but non-identical release-manifest task reuses the Genome, reducing failed actions from **1 to 0**.

## Run it

```bash
python -m pip install -e .
python -m prometheus.cli doctor --json
python -m prometheus.cli demo reset
python -m prometheus.cli demo competition
python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json
python -m unittest discover -s tests -v
```

## Launch the interface

```bash
python -m prometheus.cli interface competition
```

Open `http://127.0.0.1:8787/competition/interface/`.

## Judge material

- [Quickstart](competition/QUICKSTART.md)
- [Judge brief](competition/JUDGE_BRIEF.md)
- [Three-minute demo](competition/DEMO_SCRIPT.md)
- [Public interface](competition/interface/index.html)

## Public boundary

This repository contains the executable judge-facing competition edition. It intentionally excludes credentials, private operating prompts, local machine state, unrelated estate systems, and patent-sensitive internal material.
