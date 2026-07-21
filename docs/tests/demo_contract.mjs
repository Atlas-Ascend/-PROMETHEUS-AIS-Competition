import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "..");

const [html, app, observatory, demoText] = await Promise.all([
  readFile(path.join(docs, "index.html"), "utf8"),
  readFile(path.join(docs, "assets", "app.js"), "utf8"),
  readFile(path.join(docs, "assets", "observatory.js"), "utf8"),
  readFile(path.join(docs, "data", "demo.json"), "utf8")
]);

const demo = JSON.parse(demoText);

for (const id of [
  "start-demo",
  "replay",
  "mission-observatory",
  "observatory-launch",
  "observatory-verified",
  "ambient-agent-grid",
  "ambient-command-stream",
  "ambient-telemetry-line",
  "challenge-output",
  "challenge-copy",
  "proof-theater",
  "theater-launch",
  "theater-skip",
  "theater-replay",
  "verdict-close",
  "verdict-card"
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
}

assert.match(
  app,
  /bindClick\("#theater-skip",[\s\S]*?finishTheater\(\{ immediate: true, source: "SKIP CONTROL" \}\);/,
  "skip control is not wired to immediate verified results"
);
assert.match(app, /function finishTheater\(/, "finishTheater is missing");
assert.match(app, /verdict\.hidden = false;/, "verified verdict is never shown");
assert.match(app, /bindClick\("#verdict-close", closeTheater\);/, "return-to-console control is not wired");
assert.match(app, /const telemetryPattern = \[/, "deterministic theater telemetry pattern is missing");
assert.doesNotMatch(app, /Math\.random/, "replay telemetry is not deterministic");

assert.match(observatory, /function renderAgentFabric\(/, "visible agent handoff fabric is missing");
assert.match(observatory, /function advanceAmbient\(/, "ambient mission engine is missing");
assert.match(observatory, /function advanceChart\(/, "living telemetry graph is missing");
assert.match(observatory, /function selectChallenge\(/, "judge challenge deck is missing");
assert.match(
  observatory,
  /const allowedSystems = new Set\(\["prometheus", "seca", "hydra", "proofgrid", "genome", "buildtruth"\]\);/,
  "competition UI is not scoped to PROMETHEUS proof organs"
);
assert.match(observatory, /PKT-\$\{String\(ambientIndex\)/, "visible packet handoff identifiers are missing");
assert.doesNotMatch(observatory, /Math\.random/, "observatory telemetry is not deterministic");

assert.equal(demo.pipeline.length, 8, "expected eight command-to-proof stages");
assert.equal(demo.proofgrid.tests.passed, 5, "expected five passing proof tests");
assert.equal(demo.proofgrid.tests.failed, 0, "expected zero failed proof tests");
assert.equal(demo.proofgrid.artifacts_verified, demo.proofgrid.artifacts_total, "artifact verification is incomplete");
assert.equal(demo.release.readiness, 100, "release readiness is not complete");

console.log(
  "PROMETHEUS demo contract PASS: living observatory, scoped proof organs, handoffs, packets, " +
  "telemetry, challenge deck, skip, replay and closeout controls verified"
);
