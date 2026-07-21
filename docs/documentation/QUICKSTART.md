# PROMETHEUS Operator Console Quickstart

## Public site

`https://atlas-ascend.github.io/-PROMETHEUS-AIS-Competition/`

The `docs/` directory is the complete static competition website. GitHub Actions validates the JavaScript, interface contract, receipt hashes, canonical agent order, EDEN and ServerForge case study, IP boundary and local references before publishing it to GitHub Pages.

## Fast judge path

1. Open the public URL in a modern browser.
2. Confirm the page title reads **PROMETHEUS Operator Console**.
3. Select **IGNITE FULL MISSION**.
4. Select **IGNITE COMMAND-TO-PROOF** in the full-screen theater.
5. Observe the eight-agent sequence, terminal, handoffs, behavioral code change, telemetry, evidence and final verdict.
6. Select **SKIP TO VERIFIED RESULTS** to test the immediate proof closeout.
7. Return to the console and inspect the EDEN and ServerForge case study.
8. Use Judge Challenge Mode to open or independently verify the receipt, evidence, claims or readiness.

The hosted theater is a deterministic visualization of a verified public snapshot. It does not claim to execute the local engineering runtime inside GitHub Pages.

## Operator controls

The main cockpit supports:

- Run
- Pause and resume
- Step
- Reset
- 0.5×, 1×, 1.5× and 2× speed
- Load verified state
- Full-screen theater

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

The executable repository regenerates fresh local receipts and verifies their hashes.

## Public evidence

- `proofgrid/FINAL_RECEIPT.json`
- `proofgrid/HYDRA_REPAIR_RECEIPT.json`
- `proofgrid/TEST_RESULTS.json`
- `genomes/CAPABILITY_GENOME.json`
- `genomes/CAPABILITY_GENOME_REUSE.json`
- `data/demo.json`

## Presentation and case-study documentation

- `documentation/OPERATOR_CONSOLE_TECHNICAL_SPEC.md`
- `documentation/EDEN_SERVERFORGE_CASE_STUDY.md`
- `documentation/DEMO_SCRIPT.md`
- `documentation/JUDGE_BRIEF.md`
- `documentation/COMPETITION_READINESS.md`
- `documentation/SUBMISSION_KIT.md`

## Public boundary

The public repository discloses system roles, observable state transitions, test results, receipt lineage and a high-level local-to-public deployment path. Credentials, private prompts, proprietary routing logic, patent-sensitive mechanisms, local machine paths, private state and unrelated estate architecture remain excluded.
