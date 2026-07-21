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
CASE_APP = DOCS / "assets" / "case-study.js"
CASE_DATA = DOCS / "data" / "case-study.json"
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
    required=[
        INDEX,APP,CASE_APP,
        DOCS/"assets"/"operator-console.css",
        DOCS/"assets"/"case-study.css",
        DOCS/"data"/"demo.json",
        CASE_DATA,
        DOCS/"proofgrid"/"FINAL_RECEIPT.json",
        DOCS/"documentation"/"OPERATOR_CONSOLE_TECHNICAL_SPEC.md",
        DOCS/"documentation"/"EDEN_SERVERFORGE_CASE_STUDY.md",
        DOCS/".nojekyll"
    ]
    for path in required:
        if not path.exists() or (path.name!=".nojekyll" and path.stat().st_size==0): fail(f"required file missing or empty: {path.relative_to(DOCS.parent)}")

    parser=SiteParser(); parser.feed(INDEX.read_text())
    duplicates=[i for i,c in Counter(parser.ids).items() if c>1]
    if duplicates: fail(f"duplicate ids: {duplicates}")
    required_ids={
        "start-demo","cockpit-run","cockpit-pause","cockpit-step","cockpit-reset","cockpit-skip",
        "mission-terminal","code-before","code-after","agent-fabric","series-proof","series-evidence",
        "series-claims","series-readiness","agent-matrix","case-report-head","case-evidence-strip",
        "case-flow","case-server-observation","case-channel-map","case-receipt-exhibit","case-method",
        "case-timeline","case-proof-list","case-limitations","case-credibility","privacy-boundary",
        "case-recording","challenge-output","challenge-copy","proof-theater","theater-terminal-output",
        "theater-launch","theater-skip","theater-replay","verdict-close","verdict-card"
    }
    missing=sorted(required_ids.difference(parser.ids))
    if missing: fail(f"required controls missing: {', '.join(missing)}")
    for attribute,reference in parser.references:
        path=local_path(reference)
        if path is not None and not path.exists(): fail(f"broken {attribute}: {reference}")

    app=APP.read_text()
    for marker in ("function runMission(","function stepMission(","function togglePause(","function applyStage(","function drawGlobalSeries(","function drawAgentCharts(","function renderCaseStudy(","function openTheater(","function loadVerified(","function showVerdict("):
        if marker not in app: fail(f"operator console contract missing: {marker}")
    if "Math.random" in app: fail("deterministic visualization may not use Math.random")

    case_app=CASE_APP.read_text()
    for marker in ("loadCaseStudy", "case-study.json", "OBJECT SEPARATION", "case-credibility"):
        if marker not in case_app: fail(f"Ghost Atlas Institute renderer missing: {marker}")

    demo=json.loads((DOCS/"data"/"demo.json").read_text())
    if [x["organ"] for x in demo["pipeline"]]!=EXPECTED_AGENTS: fail("pipeline naming drift")
    if [x["name"] for x in demo["systems"]]!=EXPECTED_AGENTS: fail("system naming drift")
    if len(demo["telemetry"]["proof"])!=8: fail("telemetry must cover all eight stages")
    proof=demo["proofgrid"]
    if proof["tests"]!={"passed":5,"failed":0} or proof["artifacts_verified"]!=8: fail("proof snapshot incomplete")

    case=json.loads(CASE_DATA.read_text())
    if case.get("identity",{}).get("issuer")!="Ghost Atlas Institute": fail("case-study issuer drift")
    if case.get("identity",{}).get("report_id")!="GAI-FR-20260721-PROM-SF-001": fail("case-study report ID drift")
    observed=case.get("observed_receipt",{})
    if observed.get("campaign_id")!="HYDRA-SERVERFORGE-20260719T023826Z": fail("observed ServerForge campaign ID drift")
    if len(observed.get("serverforge_receipt",""))!=64: fail("observed ServerForge receipt is not SHA-256 length")
    if "distinct from the current ProofGrid mission receipt" not in observed.get("separation_note",""): fail("receipt object separation missing")
    if len(case.get("evidence_objects",[]))!=4: fail("case-study evidence inventory incomplete")
    if len(case.get("channel_architecture",[]))!=5: fail("Discord channel architecture incomplete")
    if len(case.get("credibility_model",[]))!=6: fail("Ghost Atlas credibility model incomplete")
    if "Private prompts and orchestration instructions" not in case.get("ip_boundary",{}).get("withheld",[]): fail("case-study IP boundary incomplete")

    receipt=verify_public_receipt()
    if proof["receipt_hash"]!=receipt["receipt_hash"] or proof["receipt_id"]!=receipt["receipt_id"]: fail("console receipt drift")
    for document in demo.get("documentation",[]):
        if not (DOCS/document["path"]).exists(): fail(f"documentation entry broken: {document['path']}")

    print("PROMETHEUS operator console PASS: synchronized mission, eight visual systems, screenshot-grounded Ghost Atlas Institute ServerForge field report, receipt separation, IP boundary and 8/8 ProofGrid artifacts verified")
    return 0

if __name__=="__main__":
    try: raise SystemExit(main())
    except AssertionError as error:
        print(f"PROMETHEUS site integrity FAIL: {error}",file=sys.stderr); raise SystemExit(1)
