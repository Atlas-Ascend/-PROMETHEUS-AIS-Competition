const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[char]));
const row = (label, value) => `<div class="data-row"><small>${esc(label)}</small><code>${esc(value)}</code></div>`;

const colorMap = {
  amber:"var(--amber)", orange:"var(--orange)", green:"var(--green)",
  red:"var(--red)", cyan:"var(--cyan)", blue:"var(--blue)",
  violet:"var(--violet)", gold:"var(--gold)"
};

let data;
let replayTimer;

async function load() {
  const response = await fetch("data/demo.json", {cache:"no-store"});
  if (!response.ok) throw new Error(`demo data ${response.status}`);
  data = await response.json();
  render();
  bind();
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
  ].map(([k,v]) => `<div class="metric-tile"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("");

  $("#mission-card").innerHTML =
    row("Mission ID", data.mission.id) +
    row("Title", data.mission.title) +
    row("Objective", data.mission.objective) +
    row("Acceptance gates", data.mission.acceptance.length);

  $("#pipeline").innerHTML = data.pipeline.map((item, index) => `
    <li data-step="${index}">
      <div class="pipeline-step"><span>${String(index + 1).padStart(2,"0")}</span><i class="dot"></i></div>
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
    <article class="system-card" id="${esc(system.id)}">
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
    {id:"overview",name:"Overview",role:"Olympian Console",accent:"amber"},
    ...data.systems
  ];
  $("#system-nav").innerHTML = navSystems.map((system, index) => `
    <a class="nav-link ${index === 0 ? "active" : ""}" href="#${esc(system.id)}">
      <i class="nav-icon accent-${esc(system.accent || "amber")}"></i>
      <span class="nav-copy"><b>${esc(system.name)}</b><small>${esc(system.role)}</small></span>
    </a>`).join("");

  $("#docs-list").innerHTML = data.documentation.map(doc => `
    <a class="doc-link" href="${esc(doc.path)}">
      <div><b>${esc(doc.name)}</b><small>${esc(doc.description)}</small></div>
      <span>↗</span>
    </a>`).join("");
}

function bind() {
  $("#start-demo").addEventListener("click", replay);
  $("#replay").addEventListener("click", replay);

  $$(".nav-link").forEach(link => link.addEventListener("click", () => {
    $$(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  }));

  const targets = [...new Set($$(".nav-link").map(link => link.getAttribute("href")).filter(Boolean))]
    .map(hash => $(hash)).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    $$(".nav-link").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, {rootMargin:"-30% 0px -55% 0px", threshold:[0,.25,.6]});
  targets.forEach(target => observer.observe(target));
}

function replay() {
  clearInterval(replayTimer);
  const steps = $$("#pipeline li");
  steps.forEach(step => step.classList.remove("active","done"));
  $("#progress-bar").style.width = "0%";
  $("#readiness").textContent = "0%";
  let current = 0;

  const advance = () => {
    steps.forEach((step,index) => {
      step.classList.toggle("active", index === current);
      step.classList.toggle("done", index < current);
    });
    const pct = Math.round(((current + 1) / steps.length) * 100);
    $("#progress-bar").style.width = `${pct}%`;
    $("#readiness").textContent = `${pct}%`;
    current += 1;

    if (current >= steps.length) {
      clearInterval(replayTimer);
      setTimeout(() => {
        steps.forEach(step => { step.classList.remove("active"); step.classList.add("done"); });
        $("#readiness").textContent = "100%";
      }, 650);
    }
  };

  advance();
  replayTimer = setInterval(advance, 720);
}

load().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main style="padding:40px"><h1>PROMETHEUS data load failed</h1><p>${esc(error.message)}</p></main>`;
});
