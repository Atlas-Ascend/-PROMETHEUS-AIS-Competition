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
EXPECTED_AGENTS = ["PROMETHEUS", "AIS-Ω", "Adversarial Twin", "SECA", "HYDRA", "ProofGrid", "Capability Genome", "Build Truth"]

class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(); self.ids=[]; self.references=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get("id"): self.ids.append(a["id"])
        for name in ("href","src"):
            if a.get(name): self.references.append((name,a[name]))

def fail(message: str) -> None: raise AssertionError(message)
def local_path(reference: str):
    if reference.startswith(("#","mailto:","tel:","data:")): return None
    parsed=urlsplit(reference)
    if parsed.scheme or parsed.netloc: return None
    if reference.startswith("/"): fail(f"root-absolute path unsafe for project Pages: {reference}")
    return DOCS / parsed.path if parsed.path else None
def sha256(path: Path) -> str: return hashlib.sha256(path.read_bytes()).hexdigest()
def canonical_hash(payload: dict) -> str: return hashlib.sha256(json.dumps(payload,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def verify_public_receipt() -> dict:
    proof_dir=DOCS/"proofgrid"; receipt=json.loads((proof_dir/"FINAL_RECEIPT.json").read_text())
    body=dict(receipt); expected=body.pop("receipt_hash",None)
    if not expected or canonical_hash(body)!=expected: fail("public ProofGrid receipt hash mismatch")
    artifacts=receipt.get("artifacts")
    if not isinstance(artifacts,dict) or len(artifacts)!=8: fail("public receipt must contain eight artifact hashes")
    for name,expected_hash in artifacts.items():
        path=proof_dir/name
        if not path.exists() or sha256(path)!=expected_hash: fail(f"receipt artifact verification failed: {name}")
    return receipt

def main() -> int:
    required=[INDEX,APP,DOCS/"assets"/"operator-console.css",DOCS/"data"/"demo.json",DOCS/"proofgrid"/"FINAL_RECEIPT.json",DOCS/"documentation"/"OPERATOR_CONSOLE_TECHNICAL_SPEC.md",DOCS/"documentation"/"EDEN_SERVERFORGE_CASE_STUDY.md",DOCS/".nojekyll"]
    for path in required:
        if not path.exists() or (path.name!=".nojekyll" and path.stat().st_size==0): fail(f"required file missing or empty: {path.relative_to(DOCS.parent)}")

    parser=SiteParser(); parser.feed(INDEX.read_text())
    duplicates=[i for i,c in Counter(parser.ids).items() if c>1]
    if duplicates: fail(f"duplicate ids: {duplicates}")
    required_ids={"start-demo","cockpit-run","cockpit-pause","cockpit-step","cockpit-reset","cockpit-skip","mission-terminal","code-before","code-after","agent-fabric","series-proof","series-evidence","series-claims","series-readiness","agent-matrix","case-flow","case-timeline","privacy-boundary","challenge-output","challenge-copy","proof-theater","theater-terminal-output","theater-launch","theater-skip","theater-replay","verdict-close","verdict-card"}
    missing=sorted(required_ids.difference(parser.ids))
    if missing: fail(f"required controls missing: {', '.join(missing)}")
    for attribute,reference in parser.references:
        path=local_path(reference)
        if path is not None and not path.exists(): fail(f"broken {attribute}: {reference}")

    app=APP.read_text()
    for marker in ("function runMission(","function stepMission(","function togglePause(","function applyStage(","function drawGlobalSeries(","function drawAgentCharts(","function renderCaseStudy(","function openTheater(","function loadVerified(","function showVerdict("):
        if marker not in app: fail(f"operator console contract missing: {marker}")
    if "Math.random" in app: fail("deterministic visualization may not use Math.random")

    demo=json.loads((DOCS/"data"/"demo.json").read_text())
    if [x["organ"] for x in demo["pipeline"]]!=EXPECTED_AGENTS: fail("pipeline naming drift")
    if [x["name"] for x in demo["systems"]]!=EXPECTED_AGENTS: fail("system naming drift")
    if len(demo["telemetry"]["proof"])!=8: fail("telemetry must cover all eight stages")
    case=demo.get("serverforge_case_study",{})
    if len(case.get("flow",[]))!=5 or "Private prompts" not in case.get("privacy_boundary",""): fail("ServerForge case study or IP boundary incomplete")
    proof=demo["proofgrid"]
    if proof["tests"]!={"passed":5,"failed":0} or proof["artifacts_verified"]!=8: fail("proof snapshot incomplete")
    receipt=verify_public_receipt()
    if proof["receipt_hash"]!=receipt["receipt_hash"] or proof["receipt_id"]!=receipt["receipt_id"]: fail("console receipt drift")
    for document in demo.get("documentation",[]):
        if not (DOCS/document["path"]).exists(): fail(f"documentation entry broken: {document['path']}")

    print("PROMETHEUS operator console PASS: full replacement UI, synchronized state engine, four-series telemetry, eight role-specific system visualizations, EDEN/ServerForge case study, proof theater, IP boundary and 8/8 receipt artifacts verified")
    return 0

if __name__=="__main__":
    try: raise SystemExit(main())
    except AssertionError as error:
        print(f"PROMETHEUS site integrity FAIL: {error}",file=sys.stderr); raise SystemExit(1)
