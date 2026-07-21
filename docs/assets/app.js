const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));
const row = (label, value) => `<div class="data-row"><small>${esc(label)}</small><code>${esc(value)}</code></div>`;

const colorMap = {
  amber: "var(--amber)", orange: "var(--orange)", green: "var(--green)",
  red: "var(--red)", cyan: "var(--cyan)", blue: "var(--blue)",
  violet: "var(--violet)", gold: "var(--gold)"
};

let data;
let replayTimer = null;
let replayRun = 0;

async function load() {
  const response = await fetch("./data/demo.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`demo data ${response.status}`);
  data = await response.json();
  render();
  bind();
  setReplayState("ready", "Deterministic proof replay is connected and ready.");

  if (new URLSearchParams(location.search).get("screenshot") === "1") {
    document.body.classList.add("screenshot");
  }
}

function render() {
  document.title = `${data.product.name} ${data.product.version} · Command-to-Proof Console`;

  $("#release-metrics").innerHTML = [
    ["ENVIRONMENT", data.release.environment],
    ["AVAILABILITY", data.release.availability],
    ["RELEASE", data.release.status],
    ["PROOF MODE", data.release.last_proof],
    ["READINESS", `${data.release.readiness}%`]
  ].map(([key, value]) => `<div class="metric-tile"><small>${esc(key)}</small><b>${esc(value)}</b></div>`).join("");

  $("#mission-card").innerHTML =
    row("Mission ID", data.mission.id) +
    row("Title", data.mission.title) +
    row("Objective", data.mission.objective) +
    row("Acceptance gates", data.mission.acceptance.length);

  $("#pipeline").innerHTML = data.pipeline.map((item, index) => `
    <li data-step="${index}" aria-label="${esc(item.stage)}: ${esc(item.state)}">
      <div class="pipeline-step"><span>${String(index + 1).padStart(2, "0")}</span><i class="dot"></i></div>
      <b>${esc(item.stage)}</b>
      <p>${esc(item.organ)} · ${esc(item.state)}</p>
    </li>`).join("");

  $("#proof-card").innerHTML =
    row("Receipt", data.proofgrid.receipt_id) +
    row("Status", data.proofgrid.status) +
    row("Promotion", data.proofgrid.promotion) +
    row("Tests", `${data.proofgrid.tests.passed} passed / ${data.proofgrid.tests.failed} failed`) +
    row("Artifacts", `${data.proofgrid.artifacts_verified} / ${data.proofgrid.artifacts_total} verified`) +
    row("Receipt hash", data.proofgrid.receipt_hash);

  $("#seca-card").innerHTML =
    row("Decision", data.seca.decision) +
    row("Reason", data.seca.reason) +
    row("Failure signature", data.seca.failure_signature) +
    row("Resolution", data.seca.resolution);

  $("#hydra-card").innerHTML =
    row("Repair ID", data.hydra.repair_id) +
    row("Defect", data.hydra.defect) +
    row("Strategy", data.hydra.strategy) +
    row("Before", data.hydra.before) +
    row("After", data.hydra.after);

  $("#genome-card").innerHTML =
    row("Genome ID", data.genome.genome_id) +
    row("Trigger", data.genome.trigger) +
    row("Strategy", data.genome.repair_strategy) +
    row("Reuse outcome", data.genome.reuse.improvement);

  $("#systems-grid").innerHTML = data.systems.map(system => `
    <article class="system-card" id="system-${esc(system.id)}">
      <div class="system-top">
        <span class="dot" style="background:${colorMap[system.accent]};box-shadow:0 0 12px ${colorMap[system.accent]}"></span>
        <span class="system-badge accent-${esc(system.accent)}">${esc(system.status)}</span>
      </div>
      <h3>${esc(system.name)}</h3>
      <div class="role">${esc(system.role)}</div>
      <p>${esc(system.summary)}</p>
      <div class="mini-metrics">${system.metrics.map(metric => `
        <div class="mini-metric"><span>${esc(metric[0])}</span><b>${esc(metric[1])}</b></div>`).join("")}
      </div>
    </article>`).join("");

  const navSystems = [
    { id: "overview", name: "Overview", role: "Olympian Console", accent: "amber", anchor: "overview" },
    ...data.systems.map(system => ({ ...system, anchor: `system-${system.id}` }))
  ];
  $("#system-nav").innerHTML = navSystems.map((system, index) => `
    <a class="nav-link ${index === 0 ? "active" : ""}" href="#${esc(system.anchor)}">
      <i class="nav-icon accent-${esc(system.accent || "amber")}"></i>
      <span class="nav-copy"><b>${esc(system.name)}</b><small>${esc(system.role)}</small></span>
    </a>`).join("");

  $("#docs-list").innerHTML = data.documentation.map(doc => `
    <a class="doc-link" href="${esc(doc.path)}">
      <div><b>${esc(doc.name)}</b><small>${esc(doc.description)}</small></div>
      <span>↗</span>
    </a>`).join("");

  installReplayConsole();
}

function installReplayConsole() {
  const pipelineCard = $(".pipeline-card");
  if (!pipelineCard || $("#replay-console")) return;

  const consolePanel = document.createElement("div");
  consolePanel.id = "replay-console";
  consolePanel.setAttribute("aria-live", "polite");
  consolePanel.innerHTML = `
    <div class="replay-console-head">
      <span class="signal"></span>
      <b id="replay-status">DEMO READY</b>
      <small id="replay-counter">0 / ${data.pipeline.length}</small>
    </div>
    <div id="replay-stage">Press “Run deterministic replay” to execute the full proof chain.</div>
    <div id="replay-detail">The replay runs entirely in this hosted page. No local machine is required.</div>
  `;
  pipelineCard.appendChild(consolePanel);
}

function bind() {
  const startButton = $("#start-demo");
  const replayButton = $("#replay");

  if (startButton) startButton.addEventListener("click", replay);
  if (replayButton) replayButton.addEventListener("click", replay);

  $$(".nav-link").forEach(link => link.addEventListener("click", () => {
    $$(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  }));

  if ("IntersectionObserver" in window) {
    const targets = [...new Set($$(".nav-link").map(link => link.getAttribute("href")).filter(Boolean))]
      .map(hash => $(hash)).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      $$(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, .25, .6] });
    targets.forEach(target => observer.observe(target));
  }
}

function setReplayState(state, message, step = 0) {
  const status = $("#replay-status");
  const stage = $("#replay-stage");
  const detail = $("#replay-detail");
  const counter = $("#replay-counter");
  const startButton = $("#start-demo");
  const replayButton = $("#replay");

  if (status) status.textContent = state === "running" ? "PROOF REPLAY RUNNING" : state === "complete" ? "PROOF REPLAY VERIFIED" : "DEMO READY";
  if (stage) stage.textContent = message;
  if (counter) counter.textContent = `${step} / ${data.pipeline.length}`;
  if (detail && state === "ready") detail.textContent = "The replay runs entirely in this hosted page. No local machine is required.";
  if (startButton) startButton.textContent = state === "running" ? "Running proof…" : state === "complete" ? "Replay again" : "Run deterministic replay";
  if (replayButton) replayButton.textContent = state === "running" ? "Running…" : "Replay proof";
}

function replay() {
  replayRun += 1;
  const thisRun = replayRun;
  if (replayTimer) window.clearTimeout(replayTimer);

  const steps = $$("#pipeline li");
  if (!steps.length) {
    setReplayState("ready", "Replay could not start because the pipeline is unavailable.");
    return;
  }

  document.body.classList.add("replay-running");
  steps.forEach(step => step.classList.remove("active", "done"));
  $("#progress-bar").style.width = "0%";
  $("#readiness").textContent = "0%";
  setReplayState("running", "Initializing governed mission replay…", 0);

  const pipelineCard = $(".pipeline-card");
  if (pipelineCard) pipelineCard.scrollIntoView({ behavior: "smooth", block: "center" });

  let current = 0;

  const advance = () => {
    if (thisRun !== replayRun) return;
    const item = data.pipeline[current];

    steps.forEach((step, index) => {
      step.classList.toggle("active", index === current);
      step.classList.toggle("done", index < current);
    });

    const pct = Math.round(((current + 1) / steps.length) * 100);
    $("#progress-bar").style.width = `${pct}%`;
    $("#readiness").textContent = `${pct}%`;
    setReplayState("running", `${item.stage} · ${item.organ} · ${item.state}`, current + 1);
    $("#replay-detail").textContent = item.detail;

    current += 1;
    if (current < steps.length) {
      replayTimer = window.setTimeout(advance, 1050);
      return;
    }

    replayTimer = window.setTimeout(() => {
      if (thisRun !== replayRun) return;
      steps.forEach(step => {
        step.classList.remove("active");
        step.classList.add("done");
      });
      $("#readiness").textContent = "100%";
      $("#progress-bar").style.width = "100%";
      document.body.classList.remove("replay-running");
      setReplayState("complete", "Command-to-Proof replay complete. Promotion authorized by verified evidence.", steps.length);
      $("#replay-detail").textContent = `${data.proofgrid.tests.passed} tests passed · ${data.proofgrid.artifacts_verified}/${data.proofgrid.artifacts_total} artifacts verified · ${data.genome.reuse.improvement}`;
    }, 900);
  };

  replayTimer = window.setTimeout(advance, 450);
}

load().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main style="padding:40px"><h1>PROMETHEUS data load failed</h1><p>${esc(error.message)}</p></main>`;
});
