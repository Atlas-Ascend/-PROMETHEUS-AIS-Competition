(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));

  async function loadCaseStudy() {
    const response = await fetch("./data/case-study.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`case-study data ${response.status}`);
    return response.json();
  }

  function render(data) {
    const identity = data.identity;
    const server = data.observed_server;
    const receipt = data.observed_receipt;

    if ($("#case-report-head")) {
      $("#case-report-head").innerHTML = `
        <div class="institute-seal" aria-hidden="true">SF</div>
        <div class="report-identity">
          <p class="eyebrow">EXTERNAL PROOF DELIVERY</p>
          <h3>ServerForge Publication Route</h3>
          <strong>${esc(server.name)}</strong>
          <span>Verified mission outcomes are packaged for the existing EDEN publication connection.</span>
        </div>
        <dl class="report-register">
          <div><dt>APPLICATION</dt><dd>${esc(server.application)}</dd></div>
          <div><dt>PRIMARY</dt><dd>${esc(server.observed_channel)}</dd></div>
          <div><dt>PROOF</dt><dd>#proof-index</dd></div>
        </dl>`;
    }

    if ($("#case-evidence-strip")) {
      $("#case-evidence-strip").innerHTML = `
        <article class="evidence-chip"><small>PAYLOAD</small><b>READY</b><span>Sanitized public mission record</span></article>
        <article class="evidence-chip"><small>PRIVATE DATA</small><b>EXCLUDED</b><span>No credentials, webhooks, prompts, or local paths</span></article>
        <article class="evidence-chip"><small>ROUTE</small><b>SEALED</b><span>Existing ServerForge connection retained</span></article>
        <article class="evidence-chip"><small>RECEIPT</small><b>REQUIRED</b><span>Publication closes only with external confirmation</span></article>`;
    }

    if ($("#case-flow")) {
      $("#case-flow").innerHTML = [
        ["01 · PROMETHEUS", "Verified mission", "Final evidence-backed state"],
        ["02 · PUBLICATION ENVELOPE", "Sanitized payload", "Credential-free handoff package"],
        ["03 · EDEN", "Runtime authority", "Resolves the private connection locally"],
        ["04 · SERVERFORGE", "Existing publisher", "Posts without reconfiguration"],
        ["05 · DISCORD", "External proof surface", "#live-case-study and #proof-index"]
      ].map((item, index, all) => `
        <div class="case-node"><small>${item[0]}</small><b>${item[1]}</b><span>${item[2]}</span>${index < all.length - 1 ? '<i aria-hidden="true">→</i>' : ""}</div>`).join("");
    }

    if ($("#case-server-observation")) {
      $("#case-server-observation").innerHTML = `
        <div class="server-observation-head">
          <div class="discord-mark" aria-hidden="true">SF</div>
          <div><small>DESTINATION</small><h3>${esc(server.name)}</h3><p>Persistent public delivery for mission outcomes and proof references.</p></div>
          <span class="observed-badge">ROUTE VERIFIED</span>
        </div>
        <div class="server-observation-grid">
          <div><small>PLATFORM</small><b>${esc(server.platform)}</b></div>
          <div><small>APPLICATION</small><b>${esc(server.application)}</b></div>
          <div><small>CASE STUDY</small><b>${esc(server.observed_channel)}</b></div>
          <div><small>PROOF INDEX</small><b>#proof-index</b></div>
        </div>
        <p class="observation-note">Discord receives sanitized mission outcomes and proof references. Credentials and private orchestration remain inside EDEN.</p>`;
    }

    if ($("#case-receipt-exhibit")) {
      $("#case-receipt-exhibit").innerHTML = `
        <div class="receipt-exhibit-head"><div><small>SERVERFORGE DELIVERY STATE</small><h3>Ready for EDEN publication</h3></div><span>NO RECONFIGURATION</span></div>
        <div class="receipt-message">
          <div><small>SERVER</small><b>${esc(server.name)}</b></div>
          <div><small>CHANNELS</small><code>#live-case-study · #proof-index</code></div>
          <blockquote>The verified public payload is sealed. EDEN may publish it through the existing ServerForge connection when the runtime is reachable.</blockquote>
          <div class="receipt-digest"><small>LIVE RECEIPT POLICY</small><code>REQUIRED AFTER PUBLICATION</code></div>
        </div>
        <div class="receipt-analysis"><p>The browser demonstration remains complete while EDEN is offline. It does not fabricate a new Discord publication.</p></div>`;
    }

    const root = $("#case-study");
    if (root) root.dataset.gaiReport = identity.report_id;
  }

  function applyFinalClearcoat() {
    const style = document.createElement("style");
    style.dataset.prometheusFinalClearcoat = "true";
    style.textContent = `
      #challenge,
      .submission-panel,
      .case-channel-architecture,
      .case-methodology,
      .case-analysis-grid,
      .case-limitations,
      .case-credibility-model,
      .case-publication-boundary,
      .case-recording-sequence { display: none !important; }
      #case-study .gai-case-study { display: grid; gap: 1rem; }
      #final-proof.final-ledger { grid-template-columns: minmax(0, 1fr) !important; }
      #case-study { scroll-margin-top: 5rem; }
    `;
    if (!document.querySelector("style[data-prometheus-final-clearcoat]")) document.head.appendChild(style);

    const ribbon = document.querySelector(".ribbon-title small");
    if (ribbon) ribbon.textContent = "FINAL COMMAND-TO-PROOF DEMONSTRATION";

    const heroTitle = document.querySelector("#overview h1");
    if (heroTitle) heroTitle.textContent = "One mission enters. A verified capability leaves.";

    const heroLead = document.querySelector("#overview .lede");
    if (heroLead) heroLead.textContent = "PROMETHEUS evaluates competing routes, reproduces failure, blocks unsupported promotion, repairs behavior, verifies evidence, preserves the successful capability, and authorizes release.";

    const start = document.querySelector("#start-demo");
    if (start) start.textContent = "IGNITE COMMAND-TO-PROOF";

    const verified = document.querySelector("#hero-verified");
    if (verified) verified.style.display = "none";

    const agentHeading = document.querySelector("#agents h2");
    if (agentHeading) agentHeading.textContent = "Eight specialized systems execute one governed mission.";
    const agentCopy = document.querySelector("#agents .section-head p:last-child");
    if (agentCopy) agentCopy.textContent = "Each system performs a distinct responsibility inside the same synchronized Command-to-Proof chain.";

    const caseEyebrow = document.querySelector("#case-study .section-head .eyebrow");
    if (caseEyebrow) caseEyebrow.textContent = "SERVERFORGE";
    const caseHeading = document.querySelector("#case-study .section-head h2");
    if (caseHeading) caseHeading.textContent = "External proof delivery, sealed for the existing EDEN connection.";
    const caseCopy = document.querySelector("#case-study .section-head p:last-child");
    if (caseCopy) caseCopy.textContent = "The verified mission becomes a sanitized publication envelope for PROMETHEUS Forge, #live-case-study, and #proof-index. No credentials or webhooks are embedded.";

    const verdictTitle = document.querySelector("#final-proof .verdict-panel h2");
    if (verdictTitle) verdictTitle.textContent = "PROMETHEUS MISSION COMPLETE";

    const replay = document.querySelector("#replay");
    if (replay) replay.textContent = "REPLAY MISSION";

    const nav = document.querySelector("#system-nav");
    if (nav) {
      [...nav.querySelectorAll("a")].forEach(link => {
        if (link.getAttribute("href") === "#challenge") link.remove();
        if (link.getAttribute("href") === "#case-study") {
          const title = link.querySelector("b");
          const subtitle = link.querySelector("small");
          if (title) title.textContent = "ServerForge";
          if (subtitle) subtitle.textContent = "External proof delivery";
        }
        if (link.getAttribute("href") === "#final-proof") {
          const subtitle = link.querySelector("small");
          if (subtitle) subtitle.textContent = "Mission complete";
        }
      });
    }
  }

  async function init() {
    applyFinalClearcoat();
    try {
      const data = await loadCaseStudy();
      render(data);
      applyFinalClearcoat();
      window.setTimeout(() => { render(data); applyFinalClearcoat(); }, 700);
    } catch (error) {
      console.error("ServerForge publication route failed to load", error);
      const target = $("#case-report-head");
      if (target) target.innerHTML = `<div class="case-load-failure"><b>SERVERFORGE ROUTE DATA UNAVAILABLE</b><span>The Command-to-Proof mission remains available.</span></div>`;
    }
  }

  init();
})();