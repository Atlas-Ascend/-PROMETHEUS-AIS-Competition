import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "..");
const [html, app, demoText] = await Promise.all([
  readFile(path.join(docs, "index.html"), "utf8"),
  readFile(path.join(docs, "assets", "app.js"), "utf8"),
  readFile(path.join(docs, "data", "demo.json"), "utf8")
]);
const demo = JSON.parse(demoText);

for (const id of [
  "start-demo", "replay", "mission-cockpit", "cockpit-run", "cockpit-skip",
  "mission-terminal", "agent-fabric", "global-graph-line", "agent-graph-grid",
  "challenge-output", "challenge-copy", "proof-theater", "theater-terminal-output",
  "theater-launch", "theater-skip", "theater-replay", "verdict-close", "verdict-card"
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
}

assert.match(app, /const AGENTS = \[/, "canonical agent registry is missing");
assert.match(app, /function appendTerminal\(/, "terminal event engine is missing");
assert.match(app, /function updateAgentGraph\(/, "per-agent graph engine is missing");
assert.match(app, /function animatePacket\(index\)/, "packet animation engine is missing");
assert.match(app, /function finishTheater\(/, "verified closeout is missing");
assert.match(app, /finishTheater\(\{ immediate: true, source: "SKIP CONTROL" \}\)/, "skip is not wired");
assert.match(app, /verdict\.hidden\s*=\s*false;/, "verdict is never shown");
assert.match(app, /const telemetryPattern = \[/, "deterministic telemetry is missing");
assert.doesNotMatch(app, /Math\.random/, "telemetry must be deterministic");

const expectedAgents = [
  "PROMETHEUS", "AIS-Ω", "Adversarial Twin", "SECA",
  "HYDRA", "ProofGrid", "Capability Genome", "Build Truth"
];
assert.deepEqual(demo.pipeline.map(stage => stage.organ), expectedAgents, "pipeline naming drift");
assert.deepEqual(demo.systems.map(system => system.name), expectedAgents, "system map naming drift");
assert.equal(demo.pipeline.length, 8);
assert.equal(demo.systems.length, 8);
assert.equal(demo.proofgrid.tests.passed, 5);
assert.equal(demo.proofgrid.tests.failed, 0);
assert.equal(demo.proofgrid.artifacts_verified, 8);
assert.equal(demo.release.readiness, 100);

console.log("PROMETHEUS unified interface contract PASS: terminal, theater, packets, eight living graphs, canonical agents and proof closeout verified");
