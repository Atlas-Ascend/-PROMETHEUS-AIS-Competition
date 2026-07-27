(() => {
  "use strict";
  const manifest = Object.freeze({
    schema: "ghost-atlas.omnimind.public-safe-sync.v1",
    product: "OmniMind 4.0.2 Proof Cockpit",
    freeze_id: "OMNIMIND-4.0.2-CANONICAL-INTERFACE",
    version: "4.0.2-sync-20260727.1",
    mothership_source_sha: "fba474860006c1168c216c4c269f014c6663af17",
    remote_delivery_merge_sha: "579f987e2ccc0c993179ef53d219d61a5bb058e9",
    janus_source_sha: "739109d9c36c89fef64660aaad33088c782c69cd",
    workspace_count: 22,
    production_mutation: false,
    public_safe: true,
    overlay: "remote-overlay.js",
    generated_at: "2026-07-27T22:30:00Z"
  });
  window.__OMNIMIND_REMOTE_MANIFEST__ = manifest;
  window.dispatchEvent(new CustomEvent("omnimind:remote-manifest", {detail: manifest}));
})();
