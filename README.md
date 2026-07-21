# PROMETHEUS AIS Competition Edition

**Repair. Prove. Remember. Evolve.**

PROMETHEUS is a self-proving, self-repairing AI engineering system that turns a software mission into an evidence-backed result.

## Always-available competition website

**Live site:** https://atlas-ascend.github.io/-PROMETHEUS-AIS-Competition/

The hosted Olympian Console is built directly from this repository and stays available when the local development machine is offline.

```text
GitHub
  → GitHub Actions
  → Static Competition Website
      → Interface
      → Demo data
      → Screenshots
      → ProofGrid receipts
      → Capability Genome
      → Documentation
```

The website implements one unified obsidian-and-molten-gold design system across:

- PROMETHEUS Command-to-Proof
- EDEN runtime and orchestration
- HYDRA Repair Forge
- ProofGrid evidence and receipts
- SECA promotion gate
- THOTH archive
- ServerForge observatory
- Packet OS execution
- Build Truth
- Capability Genome

## Deterministic proof chain

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

## Run the executable package

```bash
python -m pip install -e .
python -m unittest discover -s tests -v
python -m prometheus.cli doctor --json
python -m prometheus.cli demo reset
python -m prometheus.cli demo competition
python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json
python -m prometheus.cli interface competition
```

The local interface redirects into the same `docs/` website used for the hosted competition surface.

## Judge material

- [Hosted interface](https://atlas-ascend.github.io/-PROMETHEUS-AIS-Competition/)
- [Quickstart](docs/documentation/QUICKSTART.md)
- [Judge brief](docs/documentation/JUDGE_BRIEF.md)
- [Three-minute demo](docs/documentation/DEMO_SCRIPT.md)
- [ProofGrid receipt](docs/proofgrid/FINAL_RECEIPT.json)
- [Capability Genome](docs/genomes/CAPABILITY_GENOME.json)
- [Interface screenshot](docs/screenshots/prometheus-command-center.svg)

## Public boundary

This repository contains the executable judge-facing competition edition. It intentionally excludes credentials, private operating prompts, local machine state, unrelated estate systems, and patent-sensitive internal material.
