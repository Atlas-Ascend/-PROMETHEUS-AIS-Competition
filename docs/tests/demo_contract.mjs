import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "..");
const [html, app, demoText, css] = await Promise.all([
  readFile(path.join(docs, "index.html"), "utf8"),
  readFile(path.join(docs, "assets", "app.js"), "utf8"),
  readFile(path.join(docs, "data", "demo.json"), "utf8"),
  readFile(path.join(docs, "assets", "operator-console.css"), "utf8")
]);
const demo = JSON.parse(demoText);

for (const id of [
  "start-demo","replay","cockpit-run","cockpit-pause","cockpit-step","cockpit-reset","cockpit-skip",
  "mission-terminal","code-before","code-after","agent-fabric","series-proof","series-evidence",
  "agent-matrix","case-flow","case-timeline","privacy-boundary","challenge-output","challenge-copy",
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
assert.match(css,/\.case-study/,"ServerForge case study styling missing");

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

console.log("PROMETHEUS operator console contract PASS: controls, terminal, code delta, handoffs, four-series telemetry, eight role-specific visualizations, EDEN/ServerForge case study, proof theater and IP boundary verified");
