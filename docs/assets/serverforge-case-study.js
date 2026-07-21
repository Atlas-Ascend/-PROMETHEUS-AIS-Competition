(() => {
  "use strict";

  const state = document.querySelector("#sf-envelope-state");
  const copyState = document.querySelector("#sf-copy-state");
  const copyButton = document.querySelector("#sf-copy-envelope");
  let envelope = null;

  function publicationText(data) {
    const message = data.discord_message;
    const summary = data.verified_summary;
    return [
      `# ${message.title}`,
      "",
      message.body,
      "",
      message.case_study_line,
      "",
      `Mission: ${data.mission_id}`,
      `Tests: ${summary.tests_passed}/${summary.tests_passed + summary.tests_failed}`,
      `Artifacts: ${summary.artifacts_verified}/${summary.artifacts_total}`,
      `Capability Genome: ${summary.capability_genome}`,
      `Promotion: ${summary.promotion}`,
      "",
      `Live demonstration: ${message.public_url}`,
      `ProofGrid receipt: ${data.public_evidence.proofgrid_receipt}`,
      `Repository: ${data.public_evidence.repository}`,
      "",
      `Publication envelope: ${data.envelope_id}`,
      `Envelope SHA-256: ${data.envelope_sha256}`
    ].join("\n");
  }

  async function loadEnvelope() {
    try {
      const response = await fetch("./serverforge/PUBLICATION_ENVELOPE.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`publication envelope ${response.status}`);
      envelope = await response.json();
      if (state) state.textContent = envelope.status.replaceAll("_", " ");
      if (copyState) {
        copyState.textContent = `Envelope ${envelope.envelope_id} is ready. EDEN resolves the private Discord transport locally.`;
        copyState.classList.add("good");
      }
      if (copyButton) copyButton.disabled = false;
    } catch (error) {
      console.error("ServerForge publication envelope unavailable", error);
      if (state) state.textContent = "ENVELOPE UNAVAILABLE";
      if (copyState) {
        copyState.textContent = "The public envelope could not be loaded. No Discord publication claim has been emitted.";
        copyState.classList.add("bad");
      }
      if (copyButton) copyButton.disabled = true;
    }
  }

  async function copyEnvelope() {
    if (!envelope) return;
    const text = publicationText(envelope);
    try {
      await navigator.clipboard.writeText(text);
      copyState.textContent = "Sanitized ServerForge payload copied. Paste or route it through the existing EDEN publication connection.";
      copyState.classList.remove("bad");
      copyState.classList.add("good");
    } catch (error) {
      console.error("Clipboard write failed", error);
      copyState.textContent = "Clipboard access was blocked. Open the publication envelope and copy the Discord message payload manually.";
      copyState.classList.remove("good");
      copyState.classList.add("bad");
    }
  }

  if (copyButton) {
    copyButton.disabled = true;
    copyButton.addEventListener("click", copyEnvelope);
  }

  loadEnvelope();
})();
