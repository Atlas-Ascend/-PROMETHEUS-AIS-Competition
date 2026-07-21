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
        <div class="institute-seal" aria-hidden="true">GAI</div>
        <div class="report-identity">
          <p class="eyebrow">${esc(identity.classification)}</p>
          <h3>${esc(identity.issuer)}</h3>
          <strong>${esc(identity.title)}</strong>
          <span>${esc(identity.subject)}</span>
        </div>
        <dl class="report-register">
          <div><dt>REPORT</dt><dd>${esc(identity.report_id)}</dd></div>
          <div><dt>EVIDENCE</dt><dd>${esc(identity.evidence_status)}</dd></div>
          <div><dt>ISSUER ROLE</dt><dd>${esc(identity.issuer_role)}</dd></div>
        </dl>`;
    }

    if ($("#case-evidence-strip")) {
      $("#case-evidence-strip").innerHTML = data.evidence_objects.map(item => `
        <article class="evidence-chip">
          <small>${esc(item.id)} · ${esc(item.type)}</small>
          <b>${esc(item.title)}</b>
          <span>${esc(item.significance)}</span>
        </article>`).join("");
    }

    if ($("#case-flow")) {
      $("#case-flow").innerHTML = data.execution_chain.map((item, index) => `
        <div class="case-node">
          <small>${esc(item.label)}</small>
          <b>${esc(item.name)}</b>
          <span>${esc(item.detail)}</span>
          ${index < data.execution_chain.length - 1 ? '<i aria-hidden="true">→</i>' : ""}
        </div>`).join("");
    }

    if ($("#case-server-observation")) {
      $("#case-server-observation").innerHTML = `
        <div class="server-observation-head">
          <div class="discord-mark" aria-hidden="true">SF</div>
          <div><small>OBSERVED EXTERNAL NODE</small><h3>${esc(server.name)}</h3><p>${esc(server.function)}</p></div>
          <span class="observed-badge">SCREENSHOT GROUNDED</span>
        </div>
        <div class="server-observation-grid">
          <div><small>PLATFORM</small><b>${esc(server.platform)}</b></div>
          <div><small>APPLICATION</small><b>${esc(server.application)}</b></div>
          <div><small>PRIMARY OBSERVATION</small><b>${esc(server.observed_channel)}</b></div>
          <div><small>CAPTURE DISCIPLINE</small><b>OBSERVED STATE ONLY</b></div>
        </div>
        <p class="observation-note">${esc(server.observation_basis)} ${esc(server.capture_state)}</p>`;
    }

    if ($("#case-channel-map")) {
      $("#case-channel-map").innerHTML = data.channel_architecture.map(group => `
        <article class="channel-category">
          <header><small>${esc(group.category)}</small><b>${esc(group.purpose)}</b></header>
          ${group.channels.length ? `<div class="channel-list">${group.channels.map(channel => `
            <div><code>${esc(channel.name)}</code><span>${esc(channel.role)}</span></div>`).join("")}</div>` : `<p>${esc(group.observation)}</p>`}
        </article>`).join("");
    }

    if ($("#case-receipt-exhibit")) {
      $("#case-receipt-exhibit").innerHTML = `
        <div class="receipt-exhibit-head"><div><small>OBSERVED APPLICATION PUBLICATION · E-02</small><h3>${esc(receipt.message_title)}</h3></div><span>LIVE CASE-STUDY RECORD</span></div>
        <div class="receipt-message">
          <div><small>DISPLAYED TIME</small><b>${esc(receipt.displayed_time)}</b></div>
          <div><small>CAMPAIGN ID</small><code>${esc(receipt.campaign_id)}</code></div>
          <blockquote>${esc(receipt.statement)}</blockquote>
          <div class="receipt-digest"><small>SERVERFORGE DEPLOYMENT RECEIPT</small><code>${esc(receipt.serverforge_receipt)}</code></div>
        </div>
        <div class="receipt-analysis"><p>${esc(receipt.forensic_note)}</p><p><strong>OBJECT SEPARATION:</strong> ${esc(receipt.separation_note)}</p></div>`;
    }

    if ($("#case-method")) {
      $("#case-method").innerHTML = data.methodology.map(item => `
        <article><small>${esc(item.phase)}</small><p>${esc(item.detail)}</p></article>`).join("");
    }

    if ($("#case-timeline")) {
      $("#case-timeline").innerHTML = data.timeline.map(item => `
        <div class="timeline-item"><time>${esc(item.time)}</time><b>${esc(item.actor)}</b><span>${esc(item.event)}</span></div>`).join("");
    }

    if ($("#case-proof-list")) {
      $("#case-proof-list").innerHTML = data.findings.map((finding, index) => `<li><b>F-${String(index + 1).padStart(2, "0")}</b><span>${esc(finding)}</span></li>`).join("");
    }

    if ($("#case-limitations")) {
      $("#case-limitations").innerHTML = data.limitations.map((item, index) => `<li><b>L-${String(index + 1).padStart(2, "0")}</b><span>${esc(item)}</span></li>`).join("");
    }

    if ($("#case-credibility")) {
      $("#case-credibility").innerHTML = data.credibility_model.map(item => `
        <article><small>${esc(item.principle)}</small><b>${esc(item.test)}</b><p>${esc(item.implementation)}</p></article>`).join("");
    }

    if ($("#privacy-boundary")) {
      $("#privacy-boundary").innerHTML = `
        <div><h4>DISCLOSED</h4><ul>${data.ip_boundary.disclosed.map(item => `<li>${esc(item)}</li>`).join("")}</ul></div>
        <div><h4>WITHHELD</h4><ul>${data.ip_boundary.withheld.map(item => `<li>${esc(item)}</li>`).join("")}</ul></div>`;
    }

    if ($("#case-recording")) {
      $("#case-recording").innerHTML = data.recording_sequence.map((item, index) => `<li><b>${String(index + 1).padStart(2, "0")}</b><span>${esc(item)}</span></li>`).join("");
    }

    const root = $("#case-study");
    if (root) root.dataset.gaiReport = identity.report_id;
  }

  async function init() {
    try {
      const data = await loadCaseStudy();
      render(data);
      window.setTimeout(() => render(data), 700);
    } catch (error) {
      console.error("Ghost Atlas Institute case study failed to load", error);
      const target = $("#case-report-head");
      if (target) target.innerHTML = `<div class="case-load-failure"><b>CASE-STUDY DATA UNAVAILABLE</b><span>No institutional credibility claim is displayed without its source data.</span></div>`;
    }
  }

  init();
})();
