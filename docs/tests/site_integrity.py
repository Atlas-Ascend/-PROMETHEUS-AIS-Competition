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


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        element_id = attributes.get("id")
        if element_id:
            self.ids.append(element_id)

        for name in ("href", "src"):
            value = attributes.get(name)
            if value:
                self.references.append((name, value))


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

    clean = parsed.path
    if not clean:
        return None

    return DOCS / clean


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical_hash(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def verify_public_receipt() -> dict:
    proof_dir = DOCS / "proofgrid"
    receipt_path = proof_dir / "FINAL_RECEIPT.json"
    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))

    expected_receipt_hash = receipt.get("receipt_hash")
    if not expected_receipt_hash:
        fail("public ProofGrid receipt has no receipt_hash")

    body = dict(receipt)
    body.pop("receipt_hash")
    actual_receipt_hash = canonical_hash(body)
    if actual_receipt_hash != expected_receipt_hash:
        fail(
            "public ProofGrid receipt hash mismatch: "
            f"expected {expected_receipt_hash}, calculated {actual_receipt_hash}"
        )

    artifacts = receipt.get("artifacts")
    if not isinstance(artifacts, dict) or len(artifacts) != 8:
        fail("public ProofGrid receipt must contain exactly 8 artifact hashes")

    for name, expected_hash in artifacts.items():
        artifact = proof_dir / name
        if not artifact.exists():
            fail(f"receipt artifact missing: proofgrid/{name}")
        actual_hash = sha256(artifact)
        if actual_hash != expected_hash:
            fail(
                f"receipt artifact hash mismatch for {name}: "
                f"expected {expected_hash}, calculated {actual_hash}"
            )

    return receipt


def main() -> int:
    required_files = [
        INDEX,
        APP,
        DOCS / "assets" / "styles.css",
        DOCS / "assets" / "demo.css",
        DOCS / "assets" / "hardening.css",
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
        "start-demo",
        "replay",
        "proof-theater",
        "theater-launch",
        "theater-skip",
        "theater-replay",
        "theater-close",
        "verdict-close",
        "verdict-card",
        "evidence-stream",
        "theater-pipeline",
        "organ-stack",
    }
    missing_ids = sorted(required_ids.difference(parser.ids))
    if missing_ids:
        fail(f"required controls missing: {', '.join(missing_ids)}")

    for attribute, reference in parser.references:
        path = local_path(reference)
        if path is not None and not path.exists():
            fail(f"broken {attribute} reference: {reference}")

    app = APP.read_text(encoding="utf-8")
    contracts = {
        "skip control binding": 'finishTheater({ immediate: true, source: "SKIP CONTROL" });',
        "immediate verdict branch": "if (immediate)",
        "verdict visibility": "verdict.hidden = false;",
        "return-to-console binding": 'bindClick("#verdict-close", closeTheater);',
        "packet animation": "function animatePacket(index)",
        "deterministic telemetry": "const telemetryPattern =",
        "gauge engine": "function setGauge(id, value)",
    }
    for label, marker in contracts.items():
        if marker not in app:
            fail(f"demo contract missing: {label}")

    if "Math.random" in app:
        fail("deterministic replay must not use Math.random")

    demo = json.loads((DOCS / "data" / "demo.json").read_text(encoding="utf-8"))
    pipeline = demo.get("pipeline")
    if not isinstance(pipeline, list) or len(pipeline) != 8:
        fail("demo pipeline must contain exactly 8 governed stages")

    for index, stage in enumerate(pipeline, start=1):
        for key in ("stage", "organ", "state", "detail"):
            if not stage.get(key):
                fail(f"pipeline stage {index} missing {key}")

    proof = demo.get("proofgrid", {})
    if proof.get("tests") != {"passed": 5, "failed": 0}:
        fail("public proof snapshot must report 5 passed and 0 failed tests")
    if proof.get("artifacts_verified") != proof.get("artifacts_total"):
        fail("public proof snapshot contains unverified artifacts")
    if demo.get("release", {}).get("readiness") != 100:
        fail("public release readiness is not 100")

    receipt = verify_public_receipt()
    if proof.get("receipt_hash") != receipt.get("receipt_hash"):
        fail("Olympian Console receipt hash does not match public ProofGrid receipt")
    if proof.get("receipt_id") != receipt.get("receipt_id"):
        fail("Olympian Console receipt ID does not match public ProofGrid receipt")

    for document in demo.get("documentation", []):
        path = DOCS / document["path"]
        if not path.exists():
            fail(f"documentation entry is broken: {document['path']}")

    for folder in ("data", "proofgrid", "genomes"):
        for path in sorted((DOCS / folder).glob("*.json")):
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError as error:
                fail(f"invalid JSON in {path.relative_to(DOCS)}: {error}")

    print(
        "PROMETHEUS site integrity PASS: "
        f"{len(parser.ids)} unique ids, {len(parser.references)} references, "
        f"{len(pipeline)} replay stages, deterministic telemetry, verified-result skip wired, "
        "8/8 public artifacts hash-verified"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as error:
        print(f"PROMETHEUS site integrity FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
