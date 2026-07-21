from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

DOCS = Path(__file__).resolve().parents[1]
INDEX = DOCS / "index.html"
APP = DOCS / "assets" / "app.js"
EXPECTED_AGENTS = [
    "PROMETHEUS", "AIS-Ω", "Adversarial Twin", "SECA",
    "HYDRA", "ProofGrid", "Capability Genome", "Build Truth",
]


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.append(attributes["id"])
        for name in ("href", "src"):
            if attributes.get(name):
                self.references.append((name, attributes[name]))


def fail(message: str) -> None:
    raise AssertionError(message)


def local_path(reference: str) -> Path | None:
    if reference.startswith(("#", "mailto:", "tel:", "data:")):
        return None
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc:
        return None
    if reference.startswith("/"):
        fail(f"root-absolute path is unsafe for project Pages: {reference}")
    return DOCS / parsed.path if parsed.path else None


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical_hash(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def verify_public_receipt() -> dict:
    proof_dir = DOCS / "proofgrid"
    receipt = json.loads((proof_dir / "FINAL_RECEIPT.json").read_text(encoding="utf-8"))
    expected = receipt.get("receipt_hash")
    body = dict(receipt)
    body.pop("receipt_hash", None)
    if not expected or canonical_hash(body) != expected:
        fail("public ProofGrid receipt hash mismatch")
    artifacts = receipt.get("artifacts")
    if not isinstance(artifacts, dict) or len(artifacts) != 8:
        fail("public ProofGrid receipt must contain exactly 8 artifact hashes")
    for name, expected_hash in artifacts.items():
        path = proof_dir / name
        if not path.exists() or sha256(path) != expected_hash:
            fail(f"receipt artifact verification failed: {name}")
    return receipt


def main() -> int:
    required_files = [
        INDEX, APP,
        DOCS / "assets" / "styles.css",
        DOCS / "assets" / "demo.css",
        DOCS / "assets" / "hardening.css",
        DOCS / "assets" / "unified.css",
        DOCS / "data" / "demo.json",
        DOCS / "proofgrid" / "FINAL_RECEIPT.json",
        DOCS / "proofgrid" / "HYDRA_REPAIR_RECEIPT.json",
        DOCS / "genomes" / "CAPABILITY_GENOME.json",
        DOCS / "genomes" / "CAPABILITY_GENOME_REUSE.json",
        DOCS / ".nojekyll",
    ]
    for path in required_files:
        if not path.exists():
            fail(f"required file missing: {path.relative_to(DOCS.parent)}")
        if path.name != ".nojekyll" and path.stat().st_size == 0:
            fail(f"required file is empty: {path.relative_to(DOCS.parent)}")

    parser = SiteParser()
    parser.feed(INDEX.read_text(encoding="utf-8"))
    duplicates = sorted(identifier for identifier, count in Counter(parser.ids).items() if count > 1)
    if duplicates:
        fail(f"duplicate HTML ids: {', '.join(duplicates)}")

    required_ids = {
        "start-demo", "replay", "mission-cockpit", "cockpit-run", "cockpit-skip",
        "mission-terminal", "agent-fabric", "global-graph-line", "agent-graph-grid",
        "challenge-output", "challenge-copy", "proof-theater", "theater-terminal-output",
        "theater-launch", "theater-skip", "theater-replay", "theater-close",
        "verdict-close", "verdict-card", "evidence-stream", "theater-pipeline", "organ-stack",
    }
    missing = sorted(required_ids.difference(parser.ids))
    if missing:
        fail(f"required controls missing: {', '.join(missing)}")

    for attribute, reference in parser.references:
        path = local_path(reference)
        if path is not None and not path.exists():
            fail(f"broken {attribute} reference: {reference}")

    app = APP.read_text(encoding="utf-8")
    for marker in (
        "const AGENTS = [", "function appendTerminal(", "function updateAgentGraph(",
        "function animatePacket(index)", "function finishTheater(",
        "finishTheater({ immediate: true, source: \"SKIP CONTROL\" })",
        "const telemetryPattern =", "function setGauge(",
    ):
        if marker not in app:
            fail(f"unified demo contract missing: {marker}")
    if "Math.random" in app:
        fail("deterministic visualization must not use Math.random")

    demo = json.loads((DOCS / "data" / "demo.json").read_text(encoding="utf-8"))
    pipeline = demo.get("pipeline", [])
    systems = demo.get("systems", [])
    if [stage.get("organ") for stage in pipeline] != EXPECTED_AGENTS:
        fail("pipeline canonical agent names or order drifted")
    if [system.get("name") for system in systems] != EXPECTED_AGENTS:
        fail("system map canonical agent names or order drifted")
    if len(pipeline) != 8 or len(systems) != 8:
        fail("interface must expose exactly eight canonical agents")

    proof = demo.get("proofgrid", {})
    if proof.get("tests") != {"passed": 5, "failed": 0}:
        fail("public proof snapshot must report 5 passed and 0 failed tests")
    if proof.get("artifacts_verified") != proof.get("artifacts_total") != 8:
        fail("public proof snapshot artifact count is incomplete")
    if demo.get("release", {}).get("readiness") != 100:
        fail("release readiness is not 100")

    receipt = verify_public_receipt()
    if proof.get("receipt_hash") != receipt.get("receipt_hash"):
        fail("console receipt hash does not match ProofGrid")
    if proof.get("receipt_id") != receipt.get("receipt_id"):
        fail("console receipt ID does not match ProofGrid")

    for document in demo.get("documentation", []):
        if not (DOCS / document["path"]).exists():
            fail(f"documentation entry is broken: {document['path']}")

    print(
        "PROMETHEUS unified interface PASS: terminal + theater + packets + 8 living graphs + "
        "canonical agent naming + deterministic telemetry + skip + 8/8 artifact hashes"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as error:
        print(f"PROMETHEUS site integrity FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
