(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const allowedSystems = new Set(["prometheus", "seca", "hydra", "proofgrid", "genome", "buildtruth"]);
  const packetLabels = ["MISSION", "CANDIDATES", "FAILURE", "DENIAL", "REPAIR", "EVIDENCE", "GENOME", "PROMOTION"];
  const confidence = [12, 24, 36, 42, 61, 82, 94, 100];
  const loads = [18, 42, 77, 68, 91, 73, 64, 52];
  const latencies = [18, 26, 41, 33, 22, 17, 14, 9];
  const graphPattern = [68, 61, 74, 52, 43, 58, 34, 49, 27, 39, 22, 31, 18, 28, 16, 24, 14, 20];
  const challenges = {
    receipt: {
      command: "python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json",
      label: "OPEN VERIFIED RECEIPT →",
      href: "proofgrid/FINAL_RECEIPT.json"
    },
    evidence: {
      command: "python -m prometheus.cli contest evidence-verify",
      label: "OPEN TEST RESULTS →",
      href: "proofgrid/TEST_RESULTS.json"
    },
    claims: {
      command: "python -m prometheus.cli contest claims-verify",
      label: "OPEN SECA DECISION →",
      href: "proofgrid/SECA_DECISION.json"
    },
    submission: {
      command: "python -m prometheus.cli contest submission-check",
      label: "OPEN READINESS CHECKLIST →",
      href: "documentation/COMPETITION_READINESS.md"
    }
  };

  let demo;
  let ambientIndex = -1;
  let ambientTimer;
  let chartTimer;
  let graphIndex = 0;
  let graphX = 0;
  let graphPoints = [];
  let packetCount = 0;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));

  async function init() {
    const response = await fetch("./data/demo.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`observatory data ${response.status}`);
    }

    demo = await response.json();
    renderAgentFabric();
    bindObservatory();
    installSystemScopeGuard();
    startAmbientMission();
  }

  function renderAgentFabric() {
    const grid = $("#ambient-agent-grid");
    if (!grid) {
      return;
    }

    grid.innerHTML = demo.pipeline.map((item, index) => `
      <div class="ambient-agent" data-ambient-stage="${index}">
        <i class="port"></i>
        <small>${String(index + 1).padStart(2, "0")} · ${escapeHtml(packetLabels[index])}</small>
        <b>${escapeHtml(item.organ)}</b>
        <span>${escapeHtml(item.stage)}</span>
        <i class="ambient-packet"></i>
      </div>
    `).join("");

    const stream = $("#ambient-command-stream");
    if (stream) {
      stream.innerHTML = [
        ambientLine("T+00:00", "PROMETHEUS", "Mission graph admitted to the governed runtime."),
        ambientLine("T+00:01", "BUILD TRUTH", "Unsupported completion claims disabled."),
        ambientLine("T+00:02", "PROOFGRID", "Public deterministic evidence snapshot mounted.")
      ].join("");
    }
  }

  function ambientLine(time, source, message, kind = "") {
    return `<div class="ambient-line ${kind}"><time>${escapeHtml(time)}</time><strong>${escapeHtml(source)}</strong><span>${escapeHtml(message)}</span></div>`;
  }

  function startAmbientMission() {
    window.clearInterval(ambientTimer);
    window.clearInterval(chartTimer);
    advanceAmbient();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ambientTimer = window.setInterval(advanceAmbient, reducedMotion ? 4200 : 1500);
    chartTimer = window.setInterval(advanceChart, reducedMotion ? 800 : 180);
  }

  function advanceAmbient() {
    if (!demo?.pipeline?.length) {
      return;
    }

    ambientIndex = (ambientIndex + 1) % demo.pipeline.length;
    const item = demo.pipeline[ambientIndex];

    $$(".ambient-agent").forEach((node, index) => {
      node.classList.toggle("active", index === ambientIndex);
      node.classList.toggle("done", ambientIndex !== 0 && index < ambientIndex);
      node.classList.toggle("failure", (ambientIndex === 2 || ambientIndex === 3) && index === ambientIndex);
    });

    const activeOrgan = $("#ambient-active-organ");
    const phase = $("#ambient-phase");
    const state = $("#ambient-state");
    if (activeOrgan) activeOrgan.textContent = item.organ;
    if (phase) phase.textContent = item.stage;
    if (state) state.textContent = item.state.toUpperCase();

    setAmbientDial("confidence", confidence[ambientIndex]);
    setAmbientDial("load", loads[ambientIndex]);

    const latency = $("#ambient-latency");
    const packets = $("#ambient-packets");
    const queue = $("#ambient-queue");
    const receipt = $("#ambient-receipt");

    packetCount += ambientIndex + 1;
    if (latency) latency.textContent = `${latencies[ambientIndex]}ms`;
    if (packets) packets.textContent = String(packetCount);
    if (queue) queue.textContent = ambientIndex === 2 ? "1" : "0";
    if (receipt) receipt.textContent = ambientIndex < 5 ? "PENDING" : ambientIndex === 5 ? "HASHING" : "SEALED";

    const kind = ambientIndex === 2 || ambientIndex === 3 ? "failure" : ambientIndex === 4 ? "repair" : "";
    const elapsed = String((ambientIndex + 1) * 3).padStart(2, "0");
    appendAmbientLine(`T+00:${elapsed}`, item.organ, item.detail, kind);

    if (ambientIndex > 0) {
      const previous = demo.pipeline[ambientIndex - 1].organ;
      appendAmbientLine(
        `T+00:${String((ambientIndex + 1) * 3 + 1).padStart(2, "0")}`,
        "HANDOFF",
        `${previous} → ${item.organ} · PKT-${String(ambientIndex).padStart(3, "0")} acknowledged`
      );
    }
  }

  function appendAmbientLine(time, source, message, kind = "") {
    const stream = $("#ambient-command-stream");
    if (!stream) {
      return;
    }

    stream.insertAdjacentHTML("beforeend", ambientLine(time, source, message, kind));
    while (stream.children.length > 8) {
      stream.firstElementChild?.remove();
    }
    stream.scrollTop = stream.scrollHeight;
  }

  function setAmbientDial(id, value) {
    const ring = $(`#ambient-${id}-ring`);
    const label = $(`#ambient-${id}`);
    if (ring) ring.style.setProperty("--value", String(value));
    if (label) label.textContent = `${value}%`;
  }

  function advanceChart() {
    const line = $("#ambient-telemetry-line");
    if (!line) {
      return;
    }

    graphX += 10;
    const y = graphPattern[graphIndex % graphPattern.length];
    graphIndex += 1;
    graphPoints.push(`${graphX},${y}`);

    if (graphX > 320) {
      graphPoints = graphPoints
        .map(point => {
          const [x, pointY] = point.split(",").map(Number);
          return `${x - 10},${pointY}`;
        })
        .filter(point => Number(point.split(",")[0]) >= 0);
      graphX = 320;
    }

    line.setAttribute("points", graphPoints.join(" "));
  }

  function bindObservatory() {
    $("#observatory-launch")?.addEventListener("click", () => {
      $("#start-demo")?.click();
      window.setTimeout(() => $("#theater-launch")?.click(), 120);
    });

    $("#observatory-verified")?.addEventListener("click", () => {
      $("#start-demo")?.click();
      window.setTimeout(() => $("#theater-skip")?.click(), 120);
    });

    $$("[data-challenge]").forEach(button => {
      button.addEventListener("click", () => selectChallenge(button.dataset.challenge));
    });

    $("#challenge-copy")?.addEventListener("click", copyChallengeCommand);
  }

  function selectChallenge(key) {
    const challenge = challenges[key] || challenges.receipt;
    $$("[data-challenge]").forEach(button => {
      button.classList.toggle("active", button.dataset.challenge === key);
    });

    const output = $("#challenge-output");
    const link = $("#challenge-link");
    if (output) output.textContent = challenge.command;
    if (link) {
      link.textContent = challenge.label;
      link.href = challenge.href;
    }
  }

  async function copyChallengeCommand() {
    const output = $("#challenge-output");
    const button = $("#challenge-copy");
    if (!output || !button) {
      return;
    }

    const command = output.textContent.trim();
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const area = document.createElement("textarea");
      area.value = command;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }

    button.textContent = "COPIED";
    button.classList.add("copied");
    window.setTimeout(() => {
      button.textContent = "COPY COMMAND";
      button.classList.remove("copied");
    }, 1400);
  }

  function installSystemScopeGuard() {
    const prune = () => {
      $$("#systems-grid .system-card").forEach(card => {
        const id = card.id.replace(/^system-/, "");
        if (!allowedSystems.has(id)) {
          card.remove();
        }
      });

      $$("#system-nav .nav-link").forEach(link => {
        const href = link.getAttribute("href") || "";
        const match = href.match(/^#system-(.+)$/);
        if (match && !allowedSystems.has(match[1])) {
          link.remove();
        }
      });
    };

    const grids = [$("#systems-grid"), $("#system-nav")].filter(Boolean);
    grids.forEach(grid => new MutationObserver(prune).observe(grid, { childList: true }));
    window.setTimeout(prune, 0);
    window.setTimeout(prune, 500);
  }

  init().catch(error => {
    console.error("PROMETHEUS observatory failed", error);
    const stream = $("#ambient-command-stream");
    if (stream) {
      stream.innerHTML = ambientLine("ERROR", "OBSERVATORY", "Visualization data could not be loaded.", "failure");
    }
  });
})();
