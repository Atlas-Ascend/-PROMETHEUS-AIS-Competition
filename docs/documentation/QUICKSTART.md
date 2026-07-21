# PROMETHEUS Competition Quickstart

## Always-available website

The `docs/` directory is the complete static competition website. GitHub Actions publishes it to GitHub Pages after every push to `main` only after the executable package, proof evidence, website, replay controls, and Build Truth alignment gates pass.

Public URL:

`https://atlas-ascend.github.io/-PROMETHEUS-AIS-Competition/`

## Fast judge path

1. Open the public URL.
2. Select **Launch live Command-to-Proof demo**.
3. Select **IGNITE COMMAND-TO-PROOF** for the full deterministic replay.
4. Select **SKIP TO VERIFIED RESULTS** to jump immediately to the verified ProofGrid verdict.
5. Select **RUN IT AGAIN** to replay or **RETURN TO CONSOLE** to exit.
6. Open the machine-readable ProofGrid receipt from the main console.

The hosted proof theater is a deterministic visualization of a verified public snapshot. It does not claim to execute the local engineering runtime inside GitHub Pages.

## Run the executable proof locally

```bash
python -m pip install -e .
python -m unittest discover -s tests -v
python -m prometheus.cli doctor --json
python -m prometheus.cli demo reset
python -m prometheus.cli demo competition
python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json
python -m prometheus.cli contest claims-verify
python -m prometheus.cli contest evidence-verify
python -m prometheus.cli contest submission-check
python -m prometheus.cli interface competition
```

The interface command serves the same visual system included in the public website. The executable repository regenerates fresh local receipts and verifies their hashes.

## Public evidence

- `proofgrid/FINAL_RECEIPT.json`
- `proofgrid/HYDRA_REPAIR_RECEIPT.json`
- `genomes/CAPABILITY_GENOME.json`
- `genomes/CAPABILITY_GENOME_REUSE.json`
- `data/demo.json`

## Submission control

- `documentation/JUDGE_BRIEF.md`
- `documentation/DEMO_SCRIPT.md`
- `documentation/COMPETITION_READINESS.md`
- `documentation/SUBMISSION_KIT.md`

The public repository remains deliberately narrow. Credentials, private prompts, local machine state, unrelated estate systems, and patent-sensitive material are excluded.
