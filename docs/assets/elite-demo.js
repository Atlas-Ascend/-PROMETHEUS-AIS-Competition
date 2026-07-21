(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const systems = [
    {
      name: 'PROMETHEUS',
      role: 'Mission Orchestrator',
      stage: 'IGNITION',
      packet: 'MISSION',
      title: 'A compound emergency mission enters.',
      copy: 'PROMETHEUS binds seven simultaneous edge conditions, acceptance gates, recovery rules, and release authority into one governed campaign.',
      logs: ['mission admitted', '7 edge conditions bound', 'release authority locked pending proof']
    },
    {
      name: 'AIS-Ω',
      role: 'Candidate Route Engine',
      stage: 'ROUTE FORGE',
      packet: 'CANDIDATES',
      title: 'Three competing recovery routes are generated.',
      copy: 'AIS-Ω evaluates isolation-first, repair-first, and continuity-first strategies against safety, latency, reversibility, and evidence constraints.',
      logs: ['route-a isolation-first → safe but too slow', 'route-b repair-first → fast but evidence-weak', 'route-c continuity-first → selected with fail-closed gates']
    },
    {
      name: 'Adversarial Twin',
      role: 'Failure Reproduction',
      stage: 'TRIAL BY FIRE',
      packet: 'EDGE-STORM',
      title: 'The selected route is attacked from seven directions.',
      copy: 'Malformed input, poisoned data, duplicate execution, secret exposure, dependency loss, receipt corruption, and rollback pressure are reproduced under controlled conditions.',
      logs: ['malformed timestamp reproduced', 'duplicate operation race reproduced', 'private field leak reproduced', 'dependency outage and receipt corruption reproduced']
    },
    {
      name: 'SECA',
      role: 'Fail-Closed Promotion Gate',
      stage: 'PROMOTION DENIAL',
      packet: 'DENIAL',
      title: 'SECA refuses the system’s own success claim.',
      copy: 'Promotion is blocked because public output contains protected data, one requirement conflicts with another, and the receipt chain is incomplete.',
      logs: ['unsupported claim detected', 'public/private boundary violated', 'receipt chain incomplete', 'PROMOTION DENIED']
    },
    {
      name: 'HYDRA',
      role: 'Behavioral Repair Forge',
      stage: 'CONVERGENCE REPAIR',
      packet: 'REPAIR',
      title: 'HYDRA repairs behavior without replacing the system.',
      copy: 'The existing path is patched with normalization, idempotency, secret redaction, dependency fallback, evidence regeneration, and bounded rollback recovery.',
      logs: ['parser normalization applied', 'idempotent execution guard applied', 'protected fields redacted', 'fallback route activated', 'receipt regenerated']
    },
    {
      name: 'ProofGrid',
      role: 'Evidence Verification',
      stage: 'PROOF CLOSURE',
      packet: 'EVIDENCE',
      title: 'ProofGrid verifies the repaired mission state.',
      copy: 'Five executable tests, eight evidence artifacts, behavioral deltas, hashes, and the promotion receipt are checked as one evidence chain.',
      logs: ['5/5 tests passed', '8/8 artifacts verified', 'behavior delta confirmed', 'receipt hash sealed']
    },
    {
      name: 'Capability Genome',
      role: 'Verified Capability Memory',
      stage: 'CAPABILITY PRESERVATION',
      packet: 'GENOME',
      title: 'The successful recovery becomes reusable capability.',
      copy: 'The verified strategy is preserved with triggers, applicability, exclusions, rollback boundaries, and proof requirements for future missions.',
      logs: ['recovery pattern extracted', 'trigger and exclusion rules bound', 'reuse simulation started', 'failed actions reduced 1 → 0']
    },
    {
      name: 'Build Truth',
      role: 'Release Authority',
      stage: 'FINAL ADJUDICATION',
      packet: 'PROMOTION',
      title: 'Build Truth closes the entire mission.',
      copy: 'All contradictions are resolved, blockers are zero, the capability is reused successfully, and release is authorized with a sealed ServerForge handoff envelope.',
      logs: ['supported claims 4/4', 'contradictions 0', 'open blockers 0', 'PROMOTION AUTHORIZED', 'ServerForge envelope sealed']
    }
  ];

  const edges = [
    'Malformed input',
    'Poisoned data',
    'Duplicate race',
    'Secret exposure',
    'Dependency loss',
    'Receipt corruption',
    'Rollback pressure'
  ];

  const stageStarts = [0, 18, 39, 59, 77, 101, 125, 145];
  const duration = 165;
  const finalClock = 'T+02:45';

  let running = false;
  let startTime = 0;
  let timer = null;
  let current = -1;

  const terminalLines = [
    '[READY] PROM-COMP-EDGE-001 staged',
    '[READY] eight-system fabric online',
    '[READY] seven-edge-condition mission armed'
  ];

  function renderSystems() {
    $('#pipeline').innerHTML = systems.map((system, index) => `
      <article class="system" data-system="${index}">
        <small>${String(index + 1).padStart(2, '0')} · ${system.packet}</small>
        <b>${system.name}</b>
        <span>${system.role}</span>
      </article>
    `).join('');

    $('#edge-grid').innerHTML = edges.map((edge, index) => `
      <div class="edge" data-edge="${index}">
        <small>EDGE ${String(index + 1).padStart(2, '0')}</small>
        <b>${edge}</b>
      </div>
    `).join('');
  }

  function stageFor(seconds) {
    let index = 0;
    for (let i = 0; i < stageStarts.length; i += 1) {
      if (seconds >= stageStarts[i]) index = i;
    }
    return index;
  }

  function setStage(index) {
    if (index === current) return;
    current = index;

    $$('.system').forEach((element, systemIndex) => {
      element.classList.toggle('active', systemIndex === index);
      element.classList.toggle('done', systemIndex < index);
      element.classList.toggle('failed', index === 3 && systemIndex === 2);
      element.setAttribute('aria-current', systemIndex === index ? 'step' : 'false');
    });

    const system = systems[index];
    $('#stage-kicker').textContent = `${system.stage} · ${system.name}`;
    $('#stage-title').textContent = system.title;
    $('#stage-copy').textContent = system.copy;
    $('#packet').textContent = `PKT-${String(index + 1).padStart(3, '0')} · ${system.packet}`;

    system.logs.forEach(line => terminalLines.push(`[${system.name.toUpperCase()}] ${line}`));
    $('#terminal').textContent = terminalLines.slice(-11).join('\n');

    if (index === 2) {
      $$('.edge').forEach(edge => edge.classList.add('hot'));
      $('#ev-failure').textContent = '7 / 7 REPRODUCED';
    }

    if (index === 3) {
      $('#ev-gate').textContent = 'DENIED';
    }

    if (index === 4) {
      $$('.edge').forEach(edge => {
        edge.classList.remove('hot');
        edge.classList.add('closed');
      });
    }

    if (index === 5) {
      $('#ev-tests').textContent = '5 / 5';
      $('#ev-artifacts').textContent = '8 / 8';
    }

    if (index === 6) {
      $('#ev-reuse').textContent = 'VERIFIED';
    }
  }

  function setBar(name, value) {
    $(`#bar-${name}`).style.width = `${value}%`;
    $(`#v-${name}`).textContent = `${Math.round(value)}%`;
  }

  function formatClock(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const remainder = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `T+${minutes}:${remainder}`;
  }

  function tick() {
    const seconds = Math.min(duration, (Date.now() - startTime) / 1000);
    const progress = seconds / duration * 100;
    const index = stageFor(seconds);

    setStage(index);

    $('#clock').textContent = formatClock(seconds);
    $('#proof').textContent = `${Math.round(progress)}%`;
    $('#ring').style.setProperty('--progress', `${progress}%`);

    setBar('proof', progress);
    setBar('evidence', Math.max(0, (progress - 10) * 1.11));
    setBar('claims', Math.max(0, (progress - 4) * 1.04));

    const readiness = index === 3 ? 0 : Math.min(100, index * 13 + progress * .35);
    setBar('readiness', readiness);
    setBar('load', Math.min(100, 32 + index * 8 + (index === 4 ? 24 : 0)));

    $('#ev-routes').textContent = index < 1 ? '0 / 3' : '3 / 3';

    if (seconds >= duration) {
      finish();
      return;
    }

    timer = requestAnimationFrame(tick);
  }

  function resetRuntime() {
    current = -1;
    terminalLines.splice(3);

    $('#clock').textContent = 'T+00:00';
    $('#release').textContent = 'LOCKED';
    $('#proof').textContent = '0%';
    $('#core-state').textContent = 'MISSION READY';
    $('#ring').style.setProperty('--progress', '0%');
    $('#verdict').classList.remove('show');

    $$('.system').forEach(system => {
      system.className = 'system';
      system.setAttribute('aria-current', 'false');
    });

    $$('.edge').forEach(edge => {
      edge.className = 'edge';
    });

    $('#ev-routes').textContent = '0 / 3';
    $('#ev-failure').textContent = 'PENDING';
    $('#ev-gate').textContent = 'LOCKED';
    $('#ev-tests').textContent = '0 / 5';
    $('#ev-artifacts').textContent = '0 / 8';
    $('#ev-reuse').textContent = 'PENDING';

    ['proof', 'evidence', 'claims', 'readiness', 'load'].forEach(name => setBar(name, 0));
  }

  function launch() {
    if (running) return;

    running = true;
    resetRuntime();
    startTime = Date.now();

    $('#launch').disabled = true;
    $('#replay').disabled = true;

    tick();
  }

  function finish() {
    running = false;
    cancelAnimationFrame(timer);

    setStage(7);
    $('#clock').textContent = finalClock;
    $('#proof').textContent = '100%';
    $('#ring').style.setProperty('--progress', '100%');

    ['proof', 'evidence', 'claims', 'readiness'].forEach(name => setBar(name, 100));
    setBar('load', 52);

    $('#release').textContent = 'AUTHORIZED';
    $('#core-state').textContent = 'MISSION COMPLETE';
    $('#verdict').classList.add('show');
    $('#launch').disabled = false;
    $('#replay').disabled = false;

    $('#verdict').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  renderSystems();
  resetRuntime();

  $('#launch').addEventListener('click', launch);
  $('#replay').addEventListener('click', launch);
})();
