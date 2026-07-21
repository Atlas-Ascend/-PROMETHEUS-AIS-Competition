import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "..");
const [html, app, demoText, css, caseApp, caseCss, caseText] = await Promise.all([
  readFile(path.join(docs, "index.html"), "utf8"),
  readFile(path.join(docs, "assets", "app.js"), "utf8"),
  readFile(path.join(docs, "data", "demo.json"), "utf8"),
  readFile(path.join(docs, "assets", "operator-console.css"), "utf8"),
  readFile(path.join(docs, "assets", "case-study.js"), "utf8"),
  readFile(path.join(docs, "assets", "case-study.css"), "utf8"),
  readFile(path.join(docs, "data", "case-study.json"), "utf8")
]);
const demo = JSON.parse(demoText);
const caseStudy = JSON.parse(caseText);

for (const id of [
  "start-demo","replay","cockpit-run","cockpit-pause","cockpit-step","cockpit-reset","cockpit-skip",
  "mission-terminal","code-before","code-after","agent-fabric","series-proof","series-evidence",
  "agent-matrix","case-report-head","case-evidence-strip","case-flow","case-server-observation",
  "case-channel-map","case-receipt-exhibit","case-method","case-timeline","case-proof-list",
  "case-limitations","case-credibility","privacy-boundary","case-recording","challenge-output","challenge-copy",
  "proof-theater","theater-terminal-output","theater-launch","theater-skip","theater-replay","verdict-close","verdict-card"
]) assert.match(html,new RegExp(`id=["']${id}["']`),`missing #${id}`);

for (const marker of [
  "function runMission(","function stepMission(","function togglePause(","function applyStage(",
  "function drawGlobalSeries(","function drawAgentCharts(","function renderCaseStudy(",
  "function openTheater(","function loadVerified(","function showVerdict("
]) assert.match(app,new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),`missing ${marker}`);

assert.doesNotMatch(app,/Math\.random/,"telemetry must remain deterministic");
assert.match(css,/\.ops-shell/,"operator console visual system missing");
assert.match(css,/\.agent-matrix/,"agent matrix styling missing");
assert.match(caseCss,/\.case-report-head/,"institutional report styling missing");
assert.match(caseCss,/\.case-channel-map/,"Discord channel architecture styling missing");
assert.match(caseCss,/\.case-credibility/,"credibility model styling missing");
assert.match(caseApp,/loadCaseStudy/,"case-study data loader missing");
assert.match(caseApp,/OBJECT SEPARATION/,"receipt separation rendering missing");

const expected=["PROMETHEUS","AIS-Ω","Adversarial Twin","SECA","HYDRA","ProofGrid","Capability Genome","Build Truth"];
assert.deepEqual(demo.pipeline.map(stage=>stage.organ),expected,"pipeline naming drift");
assert.deepEqual(demo.systems.map(system=>system.name),expected,"system naming drift");
assert.equal(demo.systems.length,8);
assert.equal(demo.proofgrid.tests.passed,5);
assert.equal(demo.proofgrid.tests.failed,0);
assert.equal(demo.proofgrid.artifacts_verified,8);
assert.equal(demo.release.readiness,100);
assert.equal(demo.serverforge_case_study.flow.length,5);
assert.match(demo.serverforge_case_study.privacy_boundary,/Private prompts/);

assert.equal(caseStudy.identity.issuer,"Ghost Atlas Institute");
assert.equal(caseStudy.identity.report_id,"GAI-FR-20260721-PROM-SF-001");
assert.equal(caseStudy.observed_server.name,"PROMETHEUS Forge — Live Case Study");
assert.equal(caseStudy.observed_receipt.campaign_id,"HYDRA-SERVERFORGE-20260719T023826Z");
assert.equal(caseStudy.observed_receipt.serverforge_receipt.length,64);
assert.match(caseStudy.observed_receipt.separation_note,/distinct from the current ProofGrid mission receipt/);
assert.equal(caseStudy.channel_architecture.length,5);
assert.equal(caseStudy.evidence_objects.length,4);
assert.ok(caseStudy.findings.length >= 10);
assert.ok(caseStudy.limitations.length >= 5);
assert.equal(caseStudy.credibility_model.length,6);
assert.ok(caseStudy.ip_boundary.withheld.includes("Private prompts and orchestration instructions"));

console.log("PROMETHEUS operator console contract PASS: controls, telemetry, eight agent visualizations, screenshot-grounded Ghost Atlas Institute field report, Discord evidence separation, proof theater and IP boundary verified");
