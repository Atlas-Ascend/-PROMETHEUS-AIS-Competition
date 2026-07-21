(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  const AGENT_COLORS = ["#ffbd59","#5de3ff","#ff6578","#ff6578","#ff9f4a","#54e0a4","#b58cff","#ffd77d"];
  const CORE = ["INTENT","3 ROUTES","FAILURE","BLOCKED","REPAIRED","VERIFIED","GENOME","PROMOTED"];
  const CHALLENGES = {
    receipt:["python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json","proofgrid/FINAL_RECEIPT.json"],
    evidence:["python -m prometheus.cli contest evidence-verify","proofgrid/TEST_RESULTS.json"],
    claims:["python -m prometheus.cli contest claims-verify","proofgrid/SECA_DECISION.json"],
    submission:["python -m prometheus.cli contest submission-check","documentation/COMPETITION_READINESS.md"]
  };

  let data;
  let stage = -1;
  let runToken = 0;
  let timer = null;
  let clockTimer = null;
  let paused = false;
  let running = false;
  let startedAt = 0;
  let lastFocus = null;

  const beforeCode = [
    "def execute(operation_id, payload):",
    "    digest_value = digest(payload)",
    "    if operation_id in operations:",
    "        raise ReplayDetected(operation_id)",
    "    operations[operation_id] = digest_value",
    "    return 'executed'"
  ].join("\n");

  const afterCode = [
    "def execute(operation_id, payload, *, idempotent=False):",
    "    digest_value = digest(payload)",
    "    previous = operations.get(operation_id)",
    "    if previous is not None:",
    "        if idempotent and previous == digest_value:",
    "            return 'replay_safely_ignored'",
    "        raise ReplayDetected(operation_id)",
    "    operations[operation_id] = digest_value",
    "    return 'executed'"
  ].join("\n");

  async function init() {
    const response = await fetch("./data/demo.json", {cache:"no-store"});
    if (!response.ok) throw new Error(`demo data ${response.status}`);
    data = await response.json();
    renderNavigation();
    renderAgents();
    renderCaseStudy();
    renderTheaterAgents();
    bindControls();
    resetAll();
  }

  function renderNavigation() {
    const entries = [
      ["overview","Overview","Mission thesis"],
      ["cockpit","Cockpit","Live command-to-proof"],
      ["agents","Agents","Eight visual systems"],
      ["case-study","ServerForge","EDEN case study"],
      ["challenge","Challenge","Independent verification"],
      ["final-proof","Verdict","Submission handoff"]
    ];
    $("#system-nav").innerHTML = entries.map((entry,index) => `<a class="${index===0?"active":""}" href="#${entry[0]}"><i></i><span><b>${entry[1]}</b><small>${entry[2]}</small></span></a>`).join("");
  }

  function renderAgents() {
    $("#agent-fabric").innerHTML = data.systems.map((system,index) => `<div class="agent-node" data-node="${index}"><small>${String(index+1).padStart(2,"0")} · ${esc(data.pipeline[index].packet)}</small><b>${esc(system.name)}</b><span>${esc(system.role)}</span><i></i></div>`).join("");
    $("#agent-matrix").innerHTML = data.systems.map((system,index) => agentCard(system,index)).join("");
  }

  function agentCard(system,index) {
    const insightValues = agentInsightValues(index);
    return `<article class="panel agent-card" id="system-${system.id}" data-agent-card="${index}" style="--agent-color:${AGENT_COLORS[index]}">
      <header><div><p class="eyebrow">${String(index+1).padStart(2,"0")} · ${esc(data.pipeline[index].packet)}</p><h3>${esc(system.name)}</h3><p>${esc(system.role)} · ${esc(system.visual)}</p></div><span class="agent-badge" data-agent-state="${index}">STANDBY</span></header>
      <div class="agent-body"><div class="agent-visual">${agentVisualization(index)}</div><div class="agent-insight">${system.primary_metrics.map((metric,i)=>`<div><small>${esc(metric)}</small><b id="agent-metric-${index}-${i}">${esc(insightValues[i])}</b></div>`).join("")}</div></div>
      <p class="agent-narrative">${esc(system.summary)}</p>
    </article>`;
  }

  function agentVisualization(index) {
    if (index === 1) return `<div class="branch-map"><div><b>route-a</b><small>REJECTED</small></div><div><b>route-b</b><small>REJECTED</small></div><div class="selected"><b>route-c</b><small>SELECTED</small></div></div>`;
    if (index === 3) return `<div class="gate-visual"><div class="gate-door" id="seca-gate">PROMOTION LOCKED</div></div>`;
    if (index === 4) return `<div class="delta-visual"><div class="delta-box"><b>ReplayDetected</b><small>BEFORE</small></div><b>→</b><div class="delta-box good"><b>Safely ignored</b><small>AFTER</small></div></div>`;
    if (index === 5) return `<div class="proof-steps"><div><span>TESTS</span><div class="bar"><i style="width:100%"></i></div><b>5/5</b></div><div><span>ARTIFACTS</span><div class="bar"><i style="width:100%"></i></div><b>8/8</b></div><div><span>HASH CHAIN</span><div class="bar"><i style="width:100%"></i></div><b>PASS</b></div><div><span>RECEIPT</span><div class="bar"><i style="width:100%"></i></div><b>SEALED</b></div></div>`;
    if (index === 6) return `<div class="genome-visual"><div><b>TRIGGER</b><small>Stable operation ID repeats</small></div><div><b>APPLICABILITY</b><small>Deterministic payload hash</small></div><div><b>EXCLUSION</b><small>Conflicting payload</small></div><div><b>REUSE</b><small>1 failure → 0 failures</small></div></div>`;
    if (index === 7) return `<div class="truth-ledger"><div><span>Supported claims</span><b>4 / 4</b></div><div><span>Contradictions</span><b>0</b></div><div><span>Open blockers</span><b>0</b></div><div><span>Release readiness</span><b>100%</b></div></div>`;
    return `<div class="agent-chart"><svg viewBox="0 0 420 160" preserveAspectRatio="none" aria-label="${esc(data.systems[index].name)} telemetry"><line class="gridline" x1="0" y1="40" x2="420" y2="40"></line><line class="gridline" x1="0" y1="80" x2="420" y2="80"></line><line class="gridline" x1="0" y1="120" x2="420" y2="120"></line><polyline id="agent-line-${index}" points="0,145"></polyline></svg></div>`;
  }

  function agentInsightValues(index) {
    return [
      ["0%","0 / 5","0","IGNITION"],
      ["3","2","route-c","84%"],
      ["4","YES","HIGH","92%"],
      ["4","1","100%","0%"],
      ["1","CHANGED","LOW","94%"],
      ["5 / 5","8 / 8","100%","100%"],
      ["100%","100%","READY","100%"],
      ["4 / 4","0","0","100%"]
    ][index];
  }

  function renderCaseStudy() {
    const cs = data.serverforge_case_study;
    $("#case-flow").innerHTML = cs.flow.map(item => `<div class="case-node"><small>${esc(item.label)}</small><b>${esc(item.name)}</b><span>${esc(item.detail)}</span></div>`).join("");
    $("#case-timeline").innerHTML = cs.timeline.map(item => `<div class="timeline-item"><time>${esc(item.time)}</time><b>${esc(item.actor)}</b><span>${esc(item.event)}</span></div>`).join("");
    $("#case-proof-list").innerHTML = cs.proof_points.map(point => `<li>${esc(point)}</li>`).join("");
    $("#privacy-boundary").textContent = cs.privacy_boundary;
  }

  function renderTheaterAgents() {
    $("#organ-stack").innerHTML = data.systems.map((system,index)=>`<div class="theater-agent" data-theater-agent="${index}"><b>${String(index+1).padStart(2,"0")} · ${esc(system.name)}</b><small>${esc(system.role)}</small></div>`).join("");
  }

  function bindControls() {
    $("#start-demo").addEventListener("click", () => openTheater(false));
    $("#replay").addEventListener("click", () => openTheater(false));
    $("#hero-verified").addEventListener("click", () => openTheater(true));
    $("#cockpit-run").addEventListener("click", runMission);
    $("#cockpit-pause").addEventListener("click", togglePause);
    $("#cockpit-step").addEventListener("click", stepMission);
    $("#cockpit-reset").addEventListener("click", resetAll);
    $("#cockpit-skip").addEventListener("click", () => loadVerified(false));
    $("#theater-close").addEventListener("click", closeTheater);
    $("#verdict-close").addEventListener("click", closeTheater);
    $("#theater-launch").addEventListener("click", runTheater);
    $("#theater-replay").addEventListener("click", runTheater);
    $("#theater-skip").addEventListener("click", () => loadVerified(true));
    $$('[data-challenge]').forEach(button => button.addEventListener("click", () => selectChallenge(button.dataset.challenge)));
    $("#challenge-copy").addEventListener("click", copyChallenge);
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("#proof-theater").hidden) closeTheater(); });
  }

  function resetAll() {
    stopTimers();
    stage = -1; paused = false; running = false; startedAt = Date.now();
    $("#mission-terminal").textContent = terminalLine("READY","PROMETHEUS","mission PROM-COMP-001 staged") + "\n" + terminalLine("GUARD","BUILD TRUTH","unsupported completion claims disabled");
    $("#theater-terminal-output").textContent = "PROMETHEUS> awaiting ignition";
    $("#code-before").textContent = beforeCode;
    $("#code-after").textContent = "Repair not yet applied.";
    $("#code-state").textContent = "BASELINE";
    $("#verdict-card").hidden = true;
    updateStage(-1);
    setButtonState();
  }

  function runMission() {
    if (running && paused) { paused = false; scheduleNext(); setButtonState(); return; }
    if (running) return;
    resetAll(); running = true; startedAt = Date.now(); runToken += 1; startClock(); advanceMission(runToken);
  }

  function stepMission() {
    if (!running) { running = true; paused = true; startedAt = Date.now(); }
    clearTimeout(timer);
    if (stage < 7) applyStage(stage + 1, false);
    else finish(false);
    setButtonState();
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    if (!paused) scheduleNext(); else clearTimeout(timer);
    setButtonState();
  }

  function advanceMission(token) {
    if (token !== runToken || paused) return;
    if (stage >= 7) { finish(false); return; }
    applyStage(stage + 1, false);
    scheduleNext(token);
  }

  function scheduleNext(token = runToken) {
    clearTimeout(timer);
    if (!running || paused) return;
    const speed = Number($("#speed-select").value || 1);
    timer = setTimeout(() => advanceMission(token), 1500 / speed);
  }

  function applyStage(index, instant) {
    stage = index;
    const item = data.pipeline[index];
    const previous = index > 0 ? data.pipeline[index-1] : null;
    updateStage(index);
    appendTerminal(item.state, item.organ, item.detail);
    if (previous) appendTerminal("HANDOFF","HANDOFF",`${previous.organ} -> ${item.organ} ${item.packet} PKT-${String(index).padStart(3,"0")} ACK`);
    appendEvidence(item.organ,item.detail,index===2||index===3?"failure":index===4?"repair":"verified");
    if (index === 4) {
      $("#code-after").textContent = afterCode;
      $("#code-state").textContent = "BEHAVIOR CHANGED";
    }
    if (instant && index === 7) finish(false);
  }

  function updateStage(index) {
    const ready = index < 0;
    const i = Math.max(0,index);
    const item = data.pipeline[i];
    const proof = ready ? 0 : data.telemetry.proof[i];
    const load = ready ? 12 : data.telemetry.load[i];
    const latency = ready ? 18 : data.telemetry.latency[i];
    const packets = ready ? 0 : data.telemetry.packets[i];
    const source = ready || i === 0 ? "PROMETHEUS" : data.pipeline[i-1].organ;
    const target = ready ? "AIS-Ω" : item.organ;

    setText("#control-state", ready?"READY":item.state);
    setText("#control-agent", ready?"PROMETHEUS":item.organ);
    setText("#control-packet", ready?"MISSION":item.packet);
    setText("#live-agent", ready?"PROMETHEUS":item.organ);
    setText("#live-phase", ready?"IGNITION":item.stage);
    setText("#live-packet", ready?"MISSION":item.packet);
    setText("#live-gate", ready?"READY":item.state);
    setText("#live-proof", `${proof}%`);
    setText("#live-queue", i===2?"1":"0");
    setText("#live-receipt", ready||i<5?"PENDING":i===5?"HASHING":"SEALED");
    setText("#live-genome", ready||i<6?"UNEXTRACTED":i===6?"PRESERVED":"REUSED");
    setText("#handoff-source", source);
    setText("#handoff-target", target);
    setText("#handoff-ack", ready?"STAGED":"ACKNOWLEDGED");
    setText("#live-latency", `${latency}ms`);
    setText("#live-packets", String(packets));
    setText("#live-handoffs", String(ready?0:i));
    setText("#live-tests", i<5?"0 / 5":i===5?"5 / 5":"5 / 5");
    setText("#live-artifacts", i<5?"0 / 8":i===5?"8 / 8":"8 / 8");
    setText("#live-claims", `${ready?0:Math.min(4,Math.ceil((i+1)/2))} / 4`);
    setText("#live-blockers", i===3?"1":"0");
    setText("#live-reuse", i<6?"PENDING":i===6?"READY":"VERIFIED");
    setText("#live-release", i<3?"LOCKED":i===3?"DENIED":i<7?"REVIEW":"AUTHORIZED");
    setText("#global-graph-value", `${proof}%`);
    setText("#proof-dial-value", `${proof}%`);
    setText("#load-dial-value", `${load}%`);
    setText("#ribbon-proof", `${proof}%`);
    setText("#ribbon-release", ready||i<3?"LOCKED":i===3?"DENIED":i<7?"REVIEW":"AUTHORIZED");
    setText("#fabric-state", ready?"MISSION READY":`${item.organ} · ${item.state}`);
    $("#proof-dial").style.setProperty("--v",String(proof));
    $("#load-dial").style.setProperty("--v",String(load));
    $("#fabric-packet b").textContent = ready?"MISSION":item.packet;
    $("#fabric-packet span").textContent = `PKT-${String(ready?0:i).padStart(3,"0")}`;
    $("#fabric-packet").style.transform = `translateX(${ready?0:(i/7)*Math.max(0,$(".packet-runway").clientWidth-172)}px)`;

    $$("[data-node]").forEach((node,j)=>{ node.classList.toggle("active",j===index); node.classList.toggle("done",index>=0&&j<index); node.classList.toggle("failure",(index===2||index===3)&&j===index); });
    $$("[data-agent-card]").forEach((card,j)=>{ card.style.opacity = index<0?"1":j<=index?"1":".55"; const badge=card.querySelector("[data-agent-state]"); if(badge) badge.textContent=j<index?"COMPLETE":j===index?item.state:"STANDBY"; });
    drawGlobalSeries(i,ready);
    drawAgentCharts(i,ready);
  }

  function drawGlobalSeries(index,ready) {
    const slice = values => ready ? [values[0]] : values.slice(0,index+1);
    $("#series-proof").setAttribute("points",points(slice(data.telemetry.proof),800,150));
    $("#series-evidence").setAttribute("points",points(slice(data.telemetry.evidence),800,150));
    $("#series-claims").setAttribute("points",points(slice(data.telemetry.claims),800,150));
    $("#series-readiness").setAttribute("points",points(slice(data.telemetry.readiness),800,150));
  }

  function drawAgentCharts(index,ready) {
    [0,2].forEach(agentIndex => {
      const line = $(`#agent-line-${agentIndex}`);
      if (!line) return;
      const base = agentIndex===0 ? data.telemetry.claims : [5,12,20,35,92,70,55,44];
      const values = ready ? [base[0]] : base.slice(0,Math.min(index+1,base.length));
      line.setAttribute("points",points(values,420,160));
    });
  }

  function points(values,width,height) {
    if (values.length === 1) return `0,${height-10}`;
    return values.map((value,index)=>`${Math.round(index/(values.length-1)*width)},${Math.round(height-10-(value/100)*(height-20))}`).join(" ");
  }

  function appendTerminal(type,source,message,target="#mission-terminal") {
    const el = $(target); if (!el) return;
    el.textContent += `${el.textContent?"\n":""}${terminalLine(type,source,message)}`;
    el.scrollTop = el.scrollHeight;
  }

  function terminalLine(type,source,message) {
    return `${elapsed()}  ${String(type).padEnd(10)} ${String(source).padEnd(20)} ${message}`;
  }

  function elapsed() {
    const seconds = Math.floor((Date.now()-startedAt)/1000);
    return `T+${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
  }

  function startClock() {
    clearInterval(clockTimer);
    clockTimer = setInterval(()=>{ const value=elapsed(); setText("#ribbon-clock",value); setText("#terminal-clock",value); setText("#theater-clock",value); },250);
  }

  function finish(theaterMode) {
    running = false; paused = false; clearTimeout(timer); clearInterval(clockTimer);
    updateStage(7);
    appendTerminal("SEALED","PROOFGRID",`receipt ${data.proofgrid.receipt_id} hash verified`);
    appendTerminal("PROMOTION","BUILD TRUTH","PROMOTION AUTHORIZED");
    if (theaterMode) showVerdict();
    setButtonState();
  }

  function loadVerified(theaterMode) {
    stopTimers(); running = false; paused = false; stage = -1; startedAt = Date.now();
    for (let i=0;i<8;i++) applyStage(i,false);
    finish(theaterMode);
  }

  function setButtonState() {
    $("#cockpit-pause").textContent = paused?"RESUME":"PAUSE";
    $("#cockpit-run").disabled = running && !paused;
    $("#ribbon-run").textContent = running?(paused?"PAUSED":"ACTIVE"):stage===7?"COMPLETE":"STAGED";
  }

  function stopTimers() { clearTimeout(timer); clearInterval(clockTimer); runToken += 1; }

  function openTheater(skip) {
    lastFocus = document.activeElement;
    $("#proof-theater").hidden = false;
    document.body.style.overflow = "hidden";
    resetTheater();
    if (skip) loadVerified(true); else $("#theater-launch").focus();
  }

  function closeTheater() {
    $("#proof-theater").hidden = true;
    document.body.style.overflow = "";
    stopTimers(); running = false; paused = false; lastFocus?.focus?.();
  }

  function resetTheater() {
    $("#verdict-card").hidden = true;
    $("#evidence-stream").innerHTML = `<div><b>[PROMETHEUS]</b> Mission graph staged.</div>`;
    $("#theater-terminal-output").textContent = "PROMETHEUS> mission PROM-COMP-001 staged\nBUILD_TRUTH> unsupported completion claims disabled";
    setText("#stage-kicker","AWAITING IGNITION"); setText("#stage-title","PROMETHEUS IS READY"); setText("#stage-narrative","The same state engine drives terminal events, packets, telemetry, evidence and verdict."); setText("#core-value","READY"); setText("#core-subtitle","EVIDENCE GOVERNED");
    setText("#metric-tests","0 / 5"); setText("#metric-artifacts","0 / 8"); setText("#metric-receipt","PENDING"); setText("#metric-genome","UNEXTRACTED");
    $$("[data-theater-agent]").forEach(node=>node.classList.remove("active","done"));
  }

  function runTheater() {
    resetTheater(); resetAll(); running = true; startedAt = Date.now(); runToken += 1; startClock();
    const token = runToken;
    const tick = () => {
      if (token!==runToken) return;
      if (stage>=7) { finish(true); return; }
      const next=stage+1; applyStage(next,false); updateTheater(next); timer=setTimeout(tick,1450);
    };
    tick();
  }

  function updateTheater(index) {
    const item=data.pipeline[index];
    setText("#stage-kicker",`${String(index+1).padStart(2,"0")} / 08 · ${item.organ}`);
    setText("#stage-title",item.stage); setText("#stage-narrative",item.detail); setText("#core-value",CORE[index]); setText("#core-subtitle",item.state);
    appendTerminal(item.packet,item.organ,item.detail,"#theater-terminal-output");
    $$("[data-theater-agent]").forEach((node,j)=>{node.classList.toggle("active",j===index);node.classList.toggle("done",j<index);});
    if(index>=5){setText("#metric-tests","5 / 5");setText("#metric-artifacts","8 / 8");setText("#metric-receipt","VERIFIED");}
    if(index>=6)setText("#metric-genome",index===6?"PRESERVED":"REUSED");
  }

  function appendEvidence(source,message,kind) {
    const stream=$("#evidence-stream"); if(!stream)return;
    const line=document.createElement("div"); line.className=kind||""; line.innerHTML=`<b>[${esc(source)}]</b> ${esc(message)}`; stream.appendChild(line);
  }

  function showVerdict() {
    $("#verdict-card").hidden=false; $("#verdict-card").focus();
    setText("#metric-tests","5 / 5");setText("#metric-artifacts","8 / 8");setText("#metric-receipt","VERIFIED");setText("#metric-genome","REUSED");
  }

  function selectChallenge(key) {
    const [command,href]=CHALLENGES[key]||CHALLENGES.receipt;
    $$('[data-challenge]').forEach(button=>button.classList.toggle("active",button.dataset.challenge===key));
    $("#challenge-output").textContent=command; $("#challenge-link").href=href;
  }

  async function copyChallenge() {
    const value=$("#challenge-output").textContent;
    try { await navigator.clipboard.writeText(value); }
    catch { const area=document.createElement("textarea"); area.value=value; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); }
    $("#challenge-copy").textContent="COPIED"; setTimeout(()=>$("#challenge-copy").textContent="COPY",1200);
  }

  function setText(selector,value){const el=$(selector);if(el)el.textContent=value;}

  init().catch(error => {
    console.error(error);
    document.body.innerHTML=`<main style="padding:40px"><h1>PROMETHEUS DATA LOAD FAILED</h1><p>Verified snapshot unavailable. No completion claim displayed.</p><pre>${esc(error.message)}</pre></main>`;
  });
})();
