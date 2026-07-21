# PROMETHEUS OpenAI Build Week Competition Readiness

Status: HARDENING MODE
Target track: Developer Tools
Submission deadline: July 21, 2026 at 5:00 PM Pacific Time
Judging period: July 22 through August 5, 2026

This document is the release-control checklist for the public PROMETHEUS AIS Competition Edition. It does not create a new architecture. It verifies that the existing Command-to-Proof build is installable, testable, understandable, and ready for judging.

## Release authority

A competition submission is ready only when all P0 gates are complete. P1 items improve score and judge confidence. P2 items are optional polish and must not endanger the working build.

## P0 submission gates

### Devpost account and eligibility

- [ ] Entrant is registered for OpenAI Build Week on Devpost.
- [ ] Entrant meets age and residency eligibility requirements.
- [ ] The authorized representative is identified if entering as a team or organization.
- [ ] The Developer Tools category is selected.
- [ ] The submission is finalized before 5:00 PM Pacific Time on July 21, 2026.

### Required submission material

- [ ] Project title and one-line tagline are complete.
- [ ] Text description clearly explains the problem, audience, features, and functionality.
- [ ] Public YouTube demo video is less than three minutes.
- [ ] Video includes clear audio.
- [ ] Video demonstrates the working product.
- [ ] Video explains how Codex and GPT-5.6 were used.
- [ ] Video contains no unlicensed music, copyrighted material, or third-party branding that creates a rights problem.
- [ ] Public repository URL is entered correctly, including the leading hyphen in the repository name.
- [ ] Public live-demo URL is entered correctly.
- [ ] `/feedback` Codex Session ID for the primary build thread is entered.
- [ ] All Devpost fields are saved and the final submission confirmation is visible.

### Repository and licensing

- [x] Repository is public.
- [x] Competition evaluation license is present at `LICENSE`.
- [x] Installation instructions are present.
- [x] Supported platform is stated: Python 3.10 or newer plus a modern browser.
- [x] Judges can test the project without rebuilding the hosted demo.
- [x] The repository excludes credentials, private prompts, local machine state, and patent-sensitive internal material.
- [ ] Repository remains available, free of charge, through the end of judging.

### Existing-project disclosure

OpenAI Build Week permits pre-existing projects only when the submission clearly distinguishes prior work from meaningful extensions completed during the submission period.

- [x] README contains a Build Week extension section.
- [x] Public commit history shows dated implementation and hardening work during the submission period.
- [ ] Codex session evidence is preserved.
- [ ] Devpost description explicitly distinguishes the prior PROMETHEUS concept from the new executable competition edition, proof loop, public console, deterministic replay, evidence package, and hardening gates.

### Functional verification

- [x] Static competition website is deployed through GitHub Pages.
- [x] Demo opens from both launch controls.
- [x] Agent handoffs are visible.
- [x] Packets move through the governed pipeline.
- [x] Gauges and telemetry update.
- [x] Evidence stream advances with each stage.
- [x] Failure, promotion denial, repair, verification, genome preservation, and promotion are visible.
- [x] Skip to Verified Results is wired to an immediate deterministic closeout.
- [x] Return to Console works after the final verdict.
- [x] Replay telemetry uses a fixed pattern rather than random values.
- [x] GitHub Actions validates the website and public evidence before deployment.
- [ ] Final GitHub Actions deployment is green after the last hardening commit.
- [ ] Live site is manually tested in Chrome, Android Chrome, Edge, and Firefox.
- [ ] Browser console shows zero errors.
- [ ] Every internal link and artifact opens successfully on the deployed Pages URL.

## P1 scoring alignment

The official judging criteria are equally weighted.

### 1. Technological Implementation

Judge question: How thoroughly and skillfully does the project use Codex, and is the implementation working and non-trivial?

Evidence:

- Executable Python Command-to-Proof loop.
- Real duplicate-operation failure reproduction.
- SECA fail-closed promotion gate.
- HYDRA behavior-changing idempotent replay repair.
- ProofGrid artifact hashing and receipt verification.
- Capability Genome extraction and related-task reuse.
- CLI doctor, demo, receipt, interface, and contest commands.
- Automated unit, package, evidence, website, and replay-contract gates.
- Public commit history and Codex collaboration narrative.

Closer action:

- [ ] Include one concise before-and-after code or runtime example in the Devpost description or video.
- [ ] Show the receipt verification command returning verified status.
- [ ] State exactly which implementation tasks Codex accelerated.

### 2. Design

Judge question: Is this a complete, coherent product experience rather than a technical proof of concept?

Evidence:

- Olympian Console landing experience.
- Full-screen Ghost Atlas proof theater.
- Synchronized organ activation, packet movement, telemetry, evidence stream, and verdict.
- Public receipt, documentation, screenshots, and capability artifacts.
- Responsive mobile layout and accessible controls.

Closer action:

- [ ] Record the video from a clean browser profile with no personal tabs or notifications.
- [ ] Use a large cursor and readable terminal font.
- [ ] Keep every video frame visually purposeful.

### 3. Potential Impact

Judge question: Does the project solve a credible problem for a real audience?

Primary audience:

- Software teams using coding agents.
- DevOps and platform engineering teams.
- AI engineering organizations that need auditable completion claims.
- Teams operating consequential automated workflows.

Problem:

AI coding systems can produce output and claim completion without proving that consequential operations are safe, repeatable, tested, and backed by inspectable evidence.

Impact claim:

PROMETHEUS converts an engineering mission into a governed chain of candidate evaluation, adversarial failure, repair, verification, reusable capability, and evidence-backed release authority.

Closer action:

- [ ] Lead the Devpost description with the real problem, not the internal organ names.
- [ ] State the measurable demonstration outcome: one failed action becomes zero failed actions on related-task reuse.
- [ ] Describe where this matters in real engineering operations.

### 4. Quality of the Idea

Judge question: Is the concept creative, novel, and meaningfully different?

Novelty surface:

- The system denies its own promotion when proof is missing.
- Repair is not accepted until behavior changes and evidence verifies it.
- Verified repair knowledge becomes a bounded reusable Capability Genome.
- Build Truth acts as evidence-backed release authority.
- The public console makes multi-agent accountability visible rather than hiding it behind a chat response.

Closer action:

- [ ] Use the line: "AI can claim completion. PROMETHEUS requires proof."
- [ ] Make the Capability Genome reuse moment the intellectual close of the video.

## Three-minute judge path

### 0:00 to 0:15

Show the live console.

Narration: "AI can claim completion. PROMETHEUS requires proof."

### 0:15 to 0:45

Launch the mission. Show governed routing and candidate evaluation.

### 0:45 to 1:10

Show the real duplicate-operation failure and SECA denying promotion.

### 1:10 to 1:35

Show HYDRA selecting and applying the idempotent replay guard.

### 1:35 to 2:00

Show tests, artifacts, telemetry, and ProofGrid verification.

### 2:00 to 2:25

Show the final receipt, receipt hash, and independent verification command.

### 2:25 to 2:50

Show Capability Genome `PG-CG-REPLAY-GUARD-001` reused on a related task.

### 2:50 to 3:00

Close on: "One failed action became zero. Repair. Prove. Remember. Evolve."

## Judge challenge mode

After the formal run, offer one direct challenge:

> Choose what you want verified: the receipt, the evidence package, the competition claims, or the submission readiness.

Available commands:

```bash
python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json
python -m prometheus.cli contest claims-verify
python -m prometheus.cli contest evidence-verify
python -m prometheus.cli contest submission-check
```

## Final operator sequence

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

Then verify:

- [ ] Git working tree is clean.
- [ ] Final GitHub Actions run is green.
- [ ] Live Pages URL loads in an incognito window.
- [ ] Demo launch works.
- [ ] Skip works.
- [ ] Replay works.
- [ ] Return to Console works.
- [ ] Receipt opens.
- [ ] Judge brief opens.
- [ ] Quickstart opens.
- [ ] Capability Genome opens.
- [ ] YouTube video is public and under three minutes.
- [ ] Devpost submission is finalized.
- [ ] Confirmation screenshot is preserved outside the repository.

## Release verdict

The codebase and public demo may be marked READY only after the final CI deployment is green and all external Devpost gates are manually confirmed. No new architecture is authorized during hardening mode. Only blocker repair, truth alignment, submission completion, and judge-facing polish are allowed.
