# PROMETHEUS OpenAI Build Week Submission Kit

## Category

Developer Tools

## Project title

PROMETHEUS V-1.1.1: The Self-Proving AI Engineering Organism

## One-line tagline

AI can claim completion. PROMETHEUS requires proof.

## Short description

PROMETHEUS is a Command-to-Proof developer system that turns a software mission into a governed, evidence-backed engineering outcome. It reproduces failure, blocks unsupported promotion, repairs behavior, verifies artifacts and hashes, preserves the repair as reusable capability, and authorizes release only when Build Truth supports the claim.

## Full Devpost description

Coding agents are increasingly capable of producing software, but output generation is not the same as verified completion. A system can write code, report success, and still leave consequential operations unsafe, repeated actions non-idempotent, artifacts unverified, or release claims unsupported.

PROMETHEUS closes that gap.

The competition edition demonstrates a complete Command-to-Proof loop:

1. A governed software mission enters the runtime.
2. Multiple candidate routes are evaluated.
3. A real duplicate-operation failure is reproduced.
4. SECA denies promotion rather than accepting an unsupported success claim.
5. HYDRA applies an idempotent replay guard that changes runtime behavior.
6. Affected and regression checks pass.
7. ProofGrid verifies the receipt, artifact hashes, and promotion evidence.
8. Capability Genome `PG-CG-REPLAY-GUARD-001` preserves the successful repair with its scope and exclusions.
9. A related but non-identical task reuses the Genome and improves from one failed action to zero.

The public Olympian Console makes the entire process visible. Judges can watch agents hand work to one another, see governed packets move through the system, inspect live telemetry and evidence, replay the deterministic verified run, skip directly to the verified result, open the machine-readable receipt, and run the executable proof loop locally.

PROMETHEUS is intended for software teams, platform engineers, DevOps organizations, and builders of consequential agentic workflows who need something stronger than a completion message. It provides a path from agent output to inspectable evidence, behavioral repair, reusable engineering memory, and release authority.

Built with Codex. Evolved through PROMETHEUS. Proven on EDEN.

## What was built during OpenAI Build Week

PROMETHEUS existed as a broader architecture before the submission period. The following competition implementation and meaningful extensions were created or substantially completed during OpenAI Build Week:

- Executable Python competition package and CLI.
- Deterministic Command-to-Proof mission.
- Reproducible duplicate-operation failure.
- SECA promotion denial evidence.
- HYDRA replay-safety repair.
- ProofGrid receipt and artifact hashing.
- Capability Genome extraction and related-task reuse.
- Public GitHub Pages Olympian Console.
- Full-screen Ghost Atlas proof theater.
- Visible agent handoffs and moving work packets.
- Deterministic telemetry, gauges, evidence stream, and final verdict.
- Competition quickstart, judge brief, demo script, public evidence, and hardening gates.
- GitHub Actions validation and deployment pipeline.

The dated public commit history and Codex session records document this work.

## How Codex and GPT-5.6 were used

Codex accelerated implementation, debugging, integration, and competition hardening across the executable package and public product surface. It was used to:

- Translate the Command-to-Proof concept into a runnable Python package.
- Implement the CLI and deterministic proof mission.
- Build and refine the public static interface.
- Diagnose GitHub Pages deployment problems.
- Repair replay controls and navigation.
- Add agent handoffs, packet movement, telemetry, gauges, and evidence choreography.
- Create CI validation for the package, website, evidence, and replay contract.
- Produce judge-facing documentation and submission-readiness checks.

The human creator retained the core product decisions: the PROMETHEUS architecture, Build Truth doctrine, system organs, proof semantics, public/private boundary, competition strategy, visual direction, and final release authority.

Add the primary `/feedback` Codex Session ID to the Devpost form before submission.

## Key features

- Governed mission intake.
- Candidate-route evaluation.
- Adversarial failure reproduction.
- Fail-closed promotion gate.
- Behavior-changing repair.
- Test and artifact verification.
- Machine-readable ProofGrid receipt.
- Reusable Capability Genome.
- Related-task capability inheritance.
- Public deterministic replay.
- Live agent handoffs and moving packets.
- Telemetry, gauges, evidence feed, and promotion verdict.
- Executable local verification commands.

## Technical stack

- Python 3.10 or newer.
- Standard-library execution and receipt verification.
- Static HTML, CSS, and JavaScript interface.
- GitHub Actions validation and GitHub Pages deployment.
- JSON proof receipts and capability artifacts.

## Testing instructions for judges

### Fastest path

Open the public demo and select **Launch live Command-to-Proof demo**.

- Select **IGNITE COMMAND-TO-PROOF** for the full replay.
- Select **SKIP TO VERIFIED RESULTS** for immediate verified closeout.
- Select **RUN IT AGAIN** to replay.
- Select **RETURN TO CONSOLE** to exit.
- Open the ProofGrid receipt from the main console.

### Local executable path

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
```

## Three-minute video voice track

### Opening

"AI can claim completion. PROMETHEUS requires proof."

### Mission

"This mission asks PROMETHEUS to publish a replay-safe proof receipt. The system evaluates multiple routes and hands governed packets between specialized agents."

### Failure and denial

"The Adversarial Twin reproduces a real duplicate-operation failure. SECA refuses to promote the result. The system does not accept its own success claim without evidence."

### Repair

"HYDRA applies an idempotent replay guard. The same repeated operation now resolves safely instead of failing."

### Proof

"ProofGrid verifies the tests, artifacts, receipt, and hashes. Build Truth authorizes promotion only after the evidence chain closes."

### Reuse

"The repair becomes Capability Genome PG-CG-REPLAY-GUARD-001. A related task inherits it and improves from one failed action to zero."

### Close

"PROMETHEUS does not merely generate code. It repairs, proves, remembers, and evolves."

## Final fields to supply manually

- Public YouTube video URL.
- Public repository URL.
- Public demo URL.
- Primary `/feedback` Codex Session ID.
- Entrant or team representative details.
- Final Devpost confirmation.
