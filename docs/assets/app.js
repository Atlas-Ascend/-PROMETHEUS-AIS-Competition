const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[character]));

const row = (label, value) =>
  `<div class="data-row"><small>${esc(label)}</small><code>${esc(value)}</code></div>`;

const colors = {
  amber: "var(--amber)",
  orange: "var(--orange)",
  green: "var(--green)",
  red: "var(--red)",
  cyan: "var(--cyan)",
  blue: "var(--blue)",
  violet: "var(--violet)",
  gold: "var(--gold)"
};

const coreValues = [
  "INTENT",
  "3 ROUTES",
  "FAILURE",
  "BLOCKED",
  "REPAIRED",
  "VERIFIED",
  "GENOME",
  "PROMOTED"
];

const stageLoads = [18, 42, 77, 68, 91, 73, 64, 52];
const stageLatencies = [18, 26, 41, 33, 22, 17, 14, 11];
const telemetryPattern = [58, 51, 44, 39, 47, 62, 71, 65, 53, 42, 36, 49, 67, 76, 69, 55, 43, 31];

let data;
let runId = 0;
let timers = [];
let clockTimer = null;
let telemetryTimer = null;
let startedAt = 0;
let lastFocusedElement = null;

async function load() {
  const response = await fetch("./data/demo.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`demo data ${response.status}`);
  }

  data = await response.json();
  renderPage();
  buildTheater();
  bind();
}

function renderPage() {
  document.title = `${data.product.name} ${data.product.version} · Command-to-Proof Console`;

  $("#release-metrics").innerHTML = [
    ["ENVIRONMENT", data.release.environment],
    ["AVAILABILITY", data.release.availability],
    ["RELEASE", data.release.status],
    ["PROOF MODE", data.release.last_proof],
    ["READINESS", `${data.release.readiness}%`]
  ].map(([key, value]) =>
    `<div class="metric-tile"><small>${esc(key)}</small><b>${esc(value)}</b></div>`
  ).join("");

  $("#mission-card").innerHTML =
    row("Mission ID", data.mission.id) +
    row("Title", data.mission.title) +
    row("Objective", data.mission.objective) +
    row("Acceptance gates", data.mission.acceptance.length);

  $("#pipeline").innerHTML = data.pipeline.map((item, index) => `
    <li aria-label="${esc(item.stage)}: ${esc(item.state)}">
      <div class="pipeline-step">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <i class="dot"></i>
      </div>
      <b>${esc(item.stage)}</b>
      <p>${esc(item.organ)} · ${esc(item.state)}</p>
    </li>
  `).join("");

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
        <span class="dot" style="background:${colors[system.accent]};box-shadow:0 0 12px ${colors[system.accent]}"></span>
        <span class="system-badge accent-${esc(system.accent)}">${esc(system.status)}</span>
      </div>
      <h3>${esc(system.name)}</h3>
      <div class="role">${esc(system.role)}</div>
      <p>${esc(system.summary)}</p>
      <div class="mini-metrics">
        ${system.metrics.map(metric => `
          <div class="mini-metric">
            <span>${esc(metric[0])}</span>
            <b>${esc(metric[1])}</b>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");

  const navigation = [
    { name: "Overview", role: "Olympian Console", accent: "amber", anchor: "overview" },
    ...data.systems.map(system => ({ ...system, anchor: `system-${system.id}` }))
  ];

  $("#system-nav").innerHTML = navigation.map((system, index) => `
    <a class="nav-link ${index === 0 ? "active" : ""}" href="#${esc(system.anchor)}">
      <i class="nav-icon accent-${esc(system.accent || "amber")}"></i>
      <span class="nav-copy">
        <b>${esc(system.name)}</b>
        <small>${esc(system.role)}</small>
      </span>
    </a>
  `).join("");

  $("#docs-list").innerHTML = data.documentation.map(documentation => `
    <a class="doc-link" href="${esc(documentation.path)}">
      <div>
        <b>${esc(documentation.name)}</b>
        <small>${esc(documentation.description)}</small>
      </div>
      <span>↗</span>
    </a>
  `).join("");
}

function buildTheater() {
  $("#theater-pipeline").innerHTML = data.pipeline.map((item, index) => `
    <div class="theater-step" data-step="${index}">
      <b>${String(index + 1).padStart(2, "0")} · ${esc(item.stage)}</b>
      <span>${esc(item.organ)}</span>
      <i class="packet-track"><i class="packet"></i></i>
    </div>
  `).join("");

  $("#organ-stack").innerHTML = data.pipeline.map((item, index) => `
    <div class="organ-node" data-organ="${index}">
      <b>${esc(item.organ)}</b>
      <span>${esc(item.stage)}</span>
      <i class="handoff-port"></i>
    </div>
  `).join("");

  const rightPanel = $(".theater-right");
  if (rightPanel && !$(".telemetry-hud", rightPanel)) {
    rightPanel.insertAdjacentHTML("afterbegin", `
      <div class="telemetry-hud">
        <p class="hud-label">LIVE TELEMETRY</p>
        <div class="gauge-row">
          <div class="gauge">
            <svg viewBox="0 0 120 70" aria-label="Proof confidence gauge">
              <path class="gauge-bg" d="M15 60 A45 45 0 0 1 105 60"/>
              <path id="gauge-proof" class="gauge-fg" d="M15 60 A45 45 0 0 1 105 60"/>
            </svg>
            <b id="gauge-proof-value">0%</b>
            <span>PROOF CONFIDENCE</span>
          </div>
          <div class="gauge">
            <svg viewBox="0 0 120 70" aria-label="Orchestration load gauge">
              <path class="gauge-bg" d="M15 60 A45 45 0 0 1 105 60"/>
              <path id="gauge-load" class="gauge-fg cyan" d="M15 60 A45 45 0 0 1 105 60"/>
            </svg>
            <b id="gauge-load-value">12%</b>
            <span>ORCHESTRATION LOAD</span>
          </div>
        </div>
        <div class="spark-wrap">
          <svg id="telemetry-graph" viewBox="0 0 300 100" preserveAspectRatio="none" aria-label="Deterministic replay telemetry">
            <polyline id="telemetry-line" points="0,80"/>
            <line x1="0" y1="25" x2="300" y2="25"/>
            <line x1="0" y1="50" x2="300" y2="50"/>
            <line x1="0" y1="75" x2="300" y2="75"/>
          </svg>
          <div class="telemetry-legend">
            <span>Latency <b id="latency">18ms</b></span>
            <span>Packets <b id="packet-count">0</b></span>
            <span>Agents <b id="agent-count">1</b></span>
          </div>
        </div>
      </div>
    `);
  }

  resetTheater();
}

function bind() {
  const bindClick = (selector, handler) => {
    const element = $(selector);
    if (element) {
      element.addEventListener("click", handler);
    }
  };

  bindClick("#start-demo", openTheater);
  bindClick("#replay", openTheater);
  bindClick("#theater-close", closeTheater);
  bindClick("#theater-launch", runTheater);
  bindClick("#theater-replay", runTheater);
  bindClick("#verdict-close", closeTheater);

  bindClick("#theater-skip", event => {
    event.preventDefault();
    event.stopPropagation();
    finishTheater({ immediate: true, source: "SKIP CONTROL" });
  });

  document.addEventListener("keydown", event => {
    const theater = $("#proof-theater");
    if (event.key === "Escape" && theater && !theater.hidden) {
      closeTheater();
    }
  });

  $$(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      $$(".nav-link").forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

function openTheater() {
  const theater = $("#proof-theater");
  if (!theater) {
    return;
  }

  lastFocusedElement = document.activeElement;
  theater.hidden = false;
  theater.setAttribute("aria-busy", "false");
  document.body.classList.add("theater-open");
  resetTheater();

  window.requestAnimationFrame(() => {
    $("#theater-launch")?.focus();
  });
}

function closeTheater() {
  runId += 1;
  clearAll();

  const theater = $("#proof-theater");
  if (theater) {
    theater.hidden = true;
    theater.setAttribute("aria-busy", "false");
  }

  document.body.classList.remove("theater-open");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function clearAll() {
  timers.forEach(timer => window.clearTimeout(timer));
  timers = [];

  if (clockTimer) {
    window.clearInterval(clockTimer);
  }

  if (telemetryTimer) {
    window.clearInterval(telemetryTimer);
  }

  clockTimer = null;
  telemetryTimer = null;
}

function later(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  timers.push(timer);
  return timer;
}

function resetTheater() {
  clearAll();

  const theater = $("#proof-theater");
  theater?.classList.remove("running", "failure", "success");
  theater?.setAttribute("aria-busy", "false");

  const verdict = $("#verdict-card");
  if (verdict) {
    verdict.hidden = true;
  }

  $("#stage-kicker").textContent = "AWAITING IGNITION";
  $("#stage-title").textContent = "PROMETHEUS IS READY";
  $("#stage-narrative").textContent =
    "Watch governed agents hand work to one another, move packets, surface a real defect, repair it, verify it, and preserve the capability.";

  $("#core-value").textContent = "READY";
  $("#core-subtitle").textContent = "EVIDENCE GOVERNED";
  $("#proof-core").className = "proof-core";

  $("#evidence-stream").innerHTML = `
    <div class="evidence-line"><strong>[GHOST ATLAS]</strong> Sovereign mission graph online.</div>
    <div class="evidence-line"><strong>[BUILD TRUTH]</strong> Unsupported completion claims disabled.</div>
    <div class="evidence-line"><strong>[REPLAY MODE]</strong> Deterministic visualization of a verified public snapshot.</div>
  `;

  $$(".theater-step, .organ-node").forEach(node => {
    node.classList.remove("active", "done", "handoff", "packet-moving");
  });

  $("#metric-tests").textContent = "0 / 5";
  $("#metric-artifacts").textContent = "0 / 8";
  $("#metric-receipt").textContent = "PENDING";
  $("#metric-genome").textContent = "UNEXTRACTED";

  setGauge("proof", 0);
  setGauge("load", 12);

  $("#latency").textContent = "18ms";
  $("#packet-count").textContent = "0";
  $("#agent-count").textContent = "1";
  $("#telemetry-line").setAttribute("points", "0,80");
  $("#theater-clock").textContent = "T+00:00";

  const launch = $("#theater-launch");
  if (launch) {
    launch.disabled = false;
    launch.textContent = "IGNITE COMMAND-TO-PROOF";
  }

  const skip = $("#theater-skip");
  if (skip) {
    skip.disabled = false;
    skip.textContent = "SKIP TO VERIFIED RESULTS";
  }
}

function runTheater() {
  runId += 1;
  const currentRun = runId;

  resetTheater();

  const theater = $("#proof-theater");
  theater.classList.add("running");
  theater.setAttribute("aria-busy", "true");

  const launch = $("#theater-launch");
  launch.disabled = true;
  launch.textContent = "LIVE MISSION RUNNING";

  startedAt = Date.now();
  clockTimer = window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    $("#theater-clock").textContent = `T+${minutes}:${seconds}`;
  }, 250);

  startTelemetry();
  appendEvidence("GHOST ATLAS", "Mission decomposed into governed packets and routed to PROMETHEUS.");
  later(() => advance(currentRun, 0), 650);
}

function advance(currentRun, index) {
  if (currentRun !== runId) {
    return;
  }

  if (index >= data.pipeline.length) {
    finishTheater({ source: "PIPELINE" });
    return;
  }

  const item = data.pipeline[index];

  $$(".theater-step").forEach((node, nodeIndex) => {
    node.classList.toggle("active", nodeIndex === index);
    node.classList.toggle("done", nodeIndex < index);
  });

  $$(".organ-node").forEach((node, nodeIndex) => {
    node.classList.toggle("active", nodeIndex === index);
    node.classList.toggle("done", nodeIndex < index);
    node.classList.toggle("handoff", nodeIndex === index || nodeIndex === index - 1);
  });

  animatePacket(index);

  $("#stage-kicker").textContent =
    `${String(index + 1).padStart(2, "0")} / ${String(data.pipeline.length).padStart(2, "0")} · ${item.organ}`;
  $("#stage-title").textContent = item.stage;
  $("#stage-narrative").textContent = item.detail;
  $("#core-value").textContent = coreValues[index];
  $("#core-subtitle").textContent = item.state.toUpperCase();

  const theater = $("#proof-theater");
  const core = $("#proof-core");

  theater.classList.remove("failure", "success");
  core.className = "proof-core";

  if (index === 2 || index === 3) {
    theater.classList.add("failure");
    core.classList.add("fail");
  }

  if (index >= 4) {
    core.classList.add("success");
  }

  appendEvidence(
    item.organ,
    item.detail,
    index === 2 || index === 3 ? "fail" : index === 4 ? "repair" : ""
  );

  appendHandoff(index);
  updateMetrics(index);

  later(() => advance(currentRun, index + 1), 1500);
}

function appendHandoff(index) {
  if (index === 0) {
    return;
  }

  const from = data.pipeline[index - 1].organ;
  const to = data.pipeline[index].organ;
  appendEvidence(
    "HANDOFF",
    `${from} → ${to} · packet PKT-${String(index).padStart(3, "0")} acknowledged`
  );
}

function animatePacket(index) {
  const step = $(`.theater-step[data-step="${index}"]`);
  if (!step) {
    return;
  }

  step.classList.remove("packet-moving");
  void step.offsetWidth;
  step.classList.add("packet-moving");

  const packetCount = Number($("#packet-count").textContent) + Math.max(1, index + 1);
  $("#packet-count").textContent = String(packetCount);
}

function updateMetrics(index) {
  setGauge("proof", Math.round(((index + 1) / data.pipeline.length) * 100));
  setGauge("load", stageLoads[index]);

  $("#agent-count").textContent = String(Math.min(8, index + 2));
  $("#latency").textContent = `${stageLatencies[index]}ms`;

  if (index >= 4) {
    $("#metric-tests").textContent = `${Math.min(5, index - 3)} / 5`;
  }

  if (index >= 5) {
    $("#metric-artifacts").textContent = `${Math.min(8, (index - 4) * 4)} / 8`;
    $("#metric-receipt").textContent = "HASHING";
  }

  if (index >= 6) {
    $("#metric-genome").textContent = "EXTRACTED";
  }
}

function setGauge(id, value) {
  const path = $(`#gauge-${id}`);
  const label = $(`#gauge-${id}-value`);

  if (!path || !label) {
    return;
  }

  const length = 141.4;
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length - (length * value / 100));
  label.textContent = `${value}%`;
}

function startTelemetry() {
  let points = [];
  let x = 0;
  let patternIndex = 0;

  telemetryTimer = window.setInterval(() => {
    x += 10;
    const y = telemetryPattern[patternIndex % telemetryPattern.length];
    patternIndex += 1;

    points.push(`${x},${y}`);

    if (x > 300) {
      points = points
        .map(point => {
          const [pointX, pointY] = point.split(",").map(Number);
          return `${pointX - 10},${pointY}`;
        })
        .filter(point => Number(point.split(",")[0]) >= 0);
      x = 300;
    }

    $("#telemetry-line").setAttribute("points", points.join(" "));
  }, 180);
}

function appendEvidence(source, message, kind = "") {
  const stream = $("#evidence-stream");
  if (!stream) {
    return;
  }

  const line = document.createElement("div");
  line.className = `evidence-line ${kind}`.trim();
  line.innerHTML = `<strong>[${esc(source)}]</strong> ${esc(message)}`;

  stream.appendChild(line);
  stream.scrollTop = stream.scrollHeight;
}

function finishTheater({ immediate = false, source = "PIPELINE" } = {}) {
  runId += 1;
  const verdictRun = runId;
  clearAll();

  const theater = $("#proof-theater");
  theater.hidden = false;
  theater.classList.remove("running", "failure");
  theater.classList.add("success");
  theater.setAttribute("aria-busy", "false");
  document.body.classList.add("theater-open");

  $$(".theater-step, .organ-node").forEach(node => {
    node.classList.remove("active", "handoff", "packet-moving");
    node.classList.add("done");
  });

  $("#stage-kicker").textContent = "08 / 08 · BUILD TRUTH";
  $("#stage-title").textContent = "PROMOTION AUTHORIZED";
  $("#stage-narrative").textContent =
    "ProofGrid verified the receipt and artifacts. Capability Genome preserved the repair. Build Truth now supports promotion.";

  $("#core-value").textContent = "PROVEN";
  $("#core-subtitle").textContent = "PROMOTION AUTHORIZED";
  $("#proof-core").className = "proof-core success";

  setGauge("proof", 100);
  setGauge("load", 38);

  $("#metric-tests").textContent = "5 / 5";
  $("#metric-artifacts").textContent = "8 / 8";
  $("#metric-receipt").textContent = "VERIFIED";
  $("#metric-genome").textContent = "REUSED";
  $("#agent-count").textContent = "8";
  $("#latency").textContent = "9ms";
  $("#packet-count").textContent = "36";

  if (source === "SKIP CONTROL") {
    appendEvidence(
      "DEMO CONTROL",
      "Fast-forwarded the deterministic replay to its stored verified outcome."
    );
  }

  appendEvidence("PROOFGRID", "Receipt hash verified. Build Truth authorizes promotion.");
  appendEvidence(
    "CAPABILITY GENOME",
    "PG-CG-REPLAY-GUARD-001 reused on a related task. Failure count reduced 1 → 0."
  );

  const launch = $("#theater-launch");
  if (launch) {
    launch.disabled = false;
    launch.textContent = "RUN FULL REPLAY";
  }

  const skip = $("#theater-skip");
  if (skip) {
    skip.disabled = true;
    skip.textContent = "VERIFIED RESULTS LOADED";
  }

  const showVerdict = () => {
    if (verdictRun !== runId) {
      return;
    }

    const verdict = $("#verdict-card");
    verdict.hidden = false;
    verdict.focus();
  };

  if (immediate) {
    showVerdict();
  } else {
    later(showVerdict, 650);
  }
}

load().catch(error => {
  console.error(error);
  document.body.innerHTML = `
    <main style="padding:40px">
      <h1>PROMETHEUS data load failed</h1>
      <p>${esc(error.message)}</p>
    </main>
  `;
});
