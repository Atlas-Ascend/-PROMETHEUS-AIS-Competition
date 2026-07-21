const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const row = (label, value) => `<div class="data-row"><small>${esc(label)}</small><code>${esc(value)}</code></div>`;

const AGENTS = [
  { id: "prometheus", name: "PROMETHEUS", role: "Mission Orchestrator", accent: "amber" },
  { id: "ais", name: "AIS-Ω", role: "Candidate Route Engine", accent: "cyan" },
  { id: "adversarial", name: "Adversarial Twin", role: "Failure Reproduction", accent: "red" },
  { id: "seca", name: "SECA", role: "Fail-Closed Promotion Gate", accent: "red" },
  { id: "hydra", name: "HYDRA", role: "Behavioral Repair Forge", accent: "orange" },
  { id: "proofgrid", name: "ProofGrid", role: "Evidence and Receipt Verification", accent: "green" },
  { id: "genome", name: "Capability Genome", role: "Verified Capability Memory", accent: "violet" },
  { id: "buildtruth", name: "Build Truth", role: "Release Authority", accent: "gold" }
];

const PACKETS = ["MISSION","CANDIDATES","FAILURE","DENIAL","REPAIR","EVIDENCE","GENOME","PROMOTION"];
const CORE = ["INTENT","3 ROUTES","FAILURE","BLOCKED","REPAIRED","VERIFIED","GENOME","PROMOTED"];
const CONFIDENCE = [12,24,36,42,61,82,94,100];
const LOADS = [18,42,77,68,91,73,64,52];
const LATENCIES = [18,26,41,33,22,17,14,9];
const STATES = ["ADMITTED","ROUTED","FAILED","BLOCKED","REPAIRED","VERIFIED","PRESERVED","AUTHORIZED"];
const telemetryPattern = [78,70,62,74,55,66,48,57,39,49,31,42,25,34,19,29,15,23];
const AGENT_PATTERNS = AGENTS.map((_, i) => Array.from({length:18}, (_, j) => 92 - ((j * (i + 2) * 7 + i * 11) % 68)));
const CHALLENGES = {
  receipt: ["python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json","proofgrid/FINAL_RECEIPT.json"],
  evidence: ["python -m prometheus.cli contest evidence-verify","proofgrid/TEST_RESULTS.json"],
  claims: ["python -m prometheus.cli contest claims-verify","proofgrid/SECA_DECISION.json"],
  submission: ["python -m prometheus.cli contest submission-check","documentation/COMPETITION_READINESS.md"]
};

let data;
let runId = 0;
let timers = [];
let intervals = [];
let stageIndex = 0;
let ambientTimer;
let terminalStart = 0;
let lastFocusedElement;

async function load() {
  const response = await fetch("./data/demo.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`demo data ${response.status}`);
  data = await response.json();
  normalizeData();
  renderStatic();
  bind();
  resetMission();
  startAmbient();
}

function normalizeData() {
  data.pipeline = data.pipeline.slice(0, 8).map((item, index) => ({ ...item, organ: AGENTS[index].name }));
  data.systems = AGENTS.map((agent, index) => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    status: index === 7 ? "AUTHORITATIVE" : index === 2 ? "ADVERSARIAL" : "ACTIVE",
    accent: agent.accent,
    summary: data.pipeline[index].detail,
    metrics: [["Packet", PACKETS[index]],["State", STATES[index]],["Stage", String(index + 1).padStart(2,"0")]]
  }));
}

function renderStatic() {
  document.title = `${data.product.name} ${data.product.version} · Unified Command-to-Proof Console`;
  $("#release-metrics").innerHTML = [
    ["MISSION", data.mission.id],["AGENTS", "8 / 8"],["TESTS", "5 / 5"],["ARTIFACTS", "8 / 8"],["PROMOTION", "AUTHORIZED"]
  ].map(([k,v]) => `<div class="metric-tile"><small>${k}</small><b>${v}</b></div>`).join("");

  $("#mission-card").innerHTML = row("Mission ID", data.mission.id)+row("Title", data.mission.title)+row("Objective", data.mission.objective)+row("Acceptance gates", data.mission.acceptance.length);
  $("#proof-card").innerHTML = row("Receipt", data.proofgrid.receipt_id)+row("Status", data.proofgrid.status)+row("Promotion", data.proofgrid.promotion)+row("Tests", "5 passed / 0 failed")+row("Artifacts", "8 / 8 verified")+row("Receipt hash", data.proofgrid.receipt_hash);
  $("#seca-card").innerHTML = row("Decision", data.seca.decision)+row("Reason", data.seca.reason)+row("Failure", data.seca.failure_signature)+row("Resolution", data.seca.resolution);
  $("#hydra-card").innerHTML = row("Repair", data.hydra.repair_id)+row("Strategy", data.hydra.strategy)+row("Before", data.hydra.before)+row("After", data.hydra.after)+row("Behavior changed", data.hydra.behavior_changed);
  $("#genome-card").innerHTML = row("Genome", data.genome.genome_id)+row("Trigger", data.genome.trigger)+row("Strategy", data.genome.repair_strategy)+row("Reuse", data.genome.reuse.improvement);

  $("#pipeline").innerHTML = data.pipeline.map((item,index) => `<li data-pipeline-stage="${index}"><div class="pipeline-step"><span>${String(index+1).padStart(2,"0")}</span><i class="dot"></i></div><b>${esc(item.stage)}</b><p>${esc(item.organ)} · ${esc(item.state)}</p></li>`).join("");
  $("#agent-fabric").innerHTML = AGENTS.map((agent,index) => `<div class="fabric-agent" data-fabric-stage="${index}"><small>${String(index+1).padStart(2,"0")} · ${PACKETS[index]}</small><b>${esc(agent.name)}</b><span>${esc(agent.role)}</span><i></i></div>`).join("");
  $("#organ-stack").innerHTML = AGENTS.map((agent,index) => `<div class="organ-node" data-organ="${index}"><b>${esc(agent.name)}</b><span>${esc(agent.role)}</span><i class="handoff-port"></i></div>`).join("");
  $("#theater-pipeline").innerHTML = data.pipeline.map((item,index) => `<div class="theater-step" data-step="${index}"><b>${String(index+1).padStart(2,"0")} · ${esc(item.stage)}</b><span>${esc(item.organ)}</span><i class="packet-track"><i class="packet"></i></i></div>`).join("");

  $("#agent-graph-grid").innerHTML = AGENTS.map((agent,index) => `<article class="agent-graph-card" id="system-${agent.id}" data-agent-card="${index}"><header><div><small>${String(index+1).padStart(2,"0")} · ${PACKETS[index]}</small><h3>${esc(agent.name)}</h3><p>${esc(agent.role)}</p></div><span class="agent-state">STANDBY</span></header><svg viewBox="0 0 240 72" preserveAspectRatio="none" aria-label="${esc(agent.name)} activity graph"><line x1="0" y1="18" x2="240" y2="18"></line><line x1="0" y1="36" x2="240" y2="36"></line><line x1="0" y1="54" x2="240" y2="54"></line><polyline id="agent-line-${index}" points="0,66"></polyline></svg><footer><span>LOAD <b id="agent-load-${index}">0%</b></span><span>LATENCY <b id="agent-latency-${index}">--</b></span><span>PACKETS <b id="agent-packets-${index}">0</b></span></footer></article>`).join("");

  $("#systems-grid").innerHTML = data.systems.map(system => `<article class="system-card" id="map-${system.id}"><div class="system-top"><span class="dot accent-${system.accent}"></span><span class="system-badge accent-${system.accent}">${system.status}</span></div><h3>${esc(system.name)}</h3><div class="role">${esc(system.role)}</div><p>${esc(system.summary)}</p><div class="mini-metrics">${system.metrics.map(m => `<div class="mini-metric"><span>${esc(m[0])}</span><b>${esc(m[1])}</b></div>`).join("")}</div></article>`).join("");

  $("#system-nav").innerHTML = [{name:"Overview",role:"Mission Cockpit",anchor:"overview"},...AGENTS.map(a=>({name:a.name,role:a.role,anchor:`system-${a.id}`}))].map((item,index)=>`<a class="nav-link ${index===0?"active":""}" href="#${item.anchor}"><i class="nav-icon accent-${index===0?"amber":AGENTS[index-1].accent}"></i><span class="nav-copy"><b>${esc(item.name)}</b><small>${esc(item.role)}</small></span></a>`).join("");
  $("#docs-list").innerHTML = data.documentation.map(d=>`<a class="doc-link" href="${esc(d.path)}"><div><b>${esc(d.name)}</b><small>${esc(d.description)}</small></div><span>↗</span></a>`).join("");

  $("#theater-telemetry").innerHTML = `<p class="hud-label">MISSION TELEMETRY</p><div class="gauge-row"><div class="gauge"><svg viewBox="0 0 120 70"><path class="gauge-bg" d="M15 60 A45 45 0 0 1 105 60"/><path id="gauge-proof" class="gauge-fg" d="M15 60 A45 45 0 0 1 105 60"/></svg><b id="gauge-proof-value">0%</b><span>PROOF</span></div><div class="gauge"><svg viewBox="0 0 120 70"><path class="gauge-bg" d="M15 60 A45 45 0 0 1 105 60"/><path id="gauge-load" class="gauge-fg cyan" d="M15 60 A45 45 0 0 1 105 60"/></svg><b id="gauge-load-value">0%</b><span>LOAD</span></div></div><svg id="telemetry-graph" viewBox="0 0 300 90" preserveAspectRatio="none"><polyline id="telemetry-line" points="0,80"></polyline></svg><div class="telemetry-legend"><span>Latency <b id="latency">18ms</b></span><span>Packets <b id="packet-count">0</b></span><span>Agents <b id="agent-count">1</b></span></div>`;
}

function bind() {
  const bindClick = (selector, handler) => $(selector)?.addEventListener("click", handler);
  bindClick("#start-demo", () => openTheater(false));
  bindClick("#replay", () => openTheater(false));
  bindClick("#hero-verified", () => openTheater(true));
  bindClick("#cockpit-run", () => runMission(false));
  bindClick("#cockpit-skip", () => runMission(true));
  bindClick("#theater-close", closeTheater);
  bindClick("#theater-launch", runTheater);
  bindClick("#theater-replay", runTheater);
  bindClick("#verdict-close", closeTheater);
  bindClick("#theater-skip", event => { event.preventDefault(); event.stopPropagation(); finishTheater({ immediate: true, source: "SKIP CONTROL" }); });
  $$('[data-challenge]').forEach(button => button.addEventListener("click", () => selectChallenge(button.dataset.challenge)));
  bindClick("#challenge-copy", copyChallenge);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("#proof-theater")?.hidden) closeTheater(); });
}

function clearAll() { timers.forEach(clearTimeout); intervals.forEach(clearInterval); timers=[]; intervals=[]; }
function later(fn, ms) { const id=setTimeout(fn,ms); timers.push(id); return id; }
function every(fn, ms) { const id=setInterval(fn,ms); intervals.push(id); return id; }
function stamp(offset=0) { const seconds=Math.floor((Date.now()-terminalStart)/1000)+offset; return `T+${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`; }

function terminalLine(source, message, type="info") { return `${stamp()}  ${type.toUpperCase().padEnd(8)}  ${source.padEnd(20)}  ${message}`; }
function appendTerminal(source,message,type="info",target="#mission-terminal") { const el=$(target); if(!el) return; el.textContent += `${el.textContent?"\n":""}${terminalLine(source,message,type)}`; el.scrollTop=el.scrollHeight; }

function resetMission() {
  clearAll(); stageIndex=0; terminalStart=Date.now();
  $("#mission-terminal").textContent = terminalLine("PROMETHEUS","mission PROM-COMP-001 loaded","ready")+"\n"+terminalLine("BUILD TRUTH","unsupported completion claims disabled","guard");
  $("#theater-terminal-output").textContent = "PROMETHEUS> awaiting ignition";
  updateStage(-1);
  resetGraphs();
}

function runMission(skip=false) {
  runId += 1; const current=runId; resetMission(); terminalStart=Date.now();
  if(skip){ for(let i=0;i<8;i++) applyStage(i,true); return; }
  applyStage(0); for(let i=1;i<8;i++) later(()=>{ if(current===runId) applyStage(i); },i*1450); 
}

function applyStage(index, instant=false) {
  stageIndex=index; const item=data.pipeline[index], agent=AGENTS[index];
  updateStage(index);
  appendTerminal(agent.name, item.detail, index===2?"error":index===3?"blocked":index===4?"repair":"verified");
  if(index>0) appendTerminal("HANDOFF",`${AGENTS[index-1].name} -> ${agent.name}  ${PACKETS[index]}  PKT-${String(index).padStart(3,"0")}`,"packet");
  updateAgentGraph(index);
  if(index===7) appendTerminal("PROOFGRID",`receipt ${data.proofgrid.receipt_id} hash verified`,"sealed");
  if(instant && index===7) $("#mission-terminal").scrollTop=$("#mission-terminal").scrollHeight;
}

function updateStage(index) {
  const ready=index<0, i=Math.max(index,0), item=data.pipeline[i], agent=AGENTS[i];
  $("#live-agent").textContent=ready?"PROMETHEUS":agent.name;
  $("#live-phase").textContent=ready?"IGNITION":item.stage;
  $("#live-packet").textContent=ready?"MISSION":PACKETS[i];
  $("#live-gate").textContent=ready?"READY":STATES[i];
  $("#live-proof").textContent=`${ready?0:CONFIDENCE[i]}%`;
  $("#fabric-state").textContent=ready?"MISSION READY":`${agent.name} · ${STATES[i]}`;
  $("#live-latency").textContent=`${ready?18:LATENCIES[i]}ms`;
  $("#live-packets").textContent=String(ready?0:(i+1)*(i+2)/2);
  $("#live-queue").textContent=i===2?"1":"0";
  $("#live-receipt").textContent=i<5?"PENDING":i===5?"HASHING":"SEALED";
  $("#fabric-packet b").textContent=ready?"MISSION":PACKETS[i];
  $("#fabric-packet span").textContent=`PKT-${String(ready?0:i).padStart(3,"0")}`;
  $("#global-graph-value").textContent=`${ready?0:CONFIDENCE[i]}%`;
  setDial("proof",ready?0:CONFIDENCE[i]); setDial("load",ready?12:LOADS[i]);
  $("#global-graph-line").setAttribute("points", graphPoints(telemetryPattern.slice(0, ready?1:Math.min(18,(i+1)*2+2)),800,150));
  $$(".fabric-agent").forEach((n,j)=>{n.classList.toggle("active",j===index);n.classList.toggle("done",index>=0&&j<index);n.classList.toggle("failure",(index===2||index===3)&&j===index);});
  $$("[data-pipeline-stage]").forEach((n,j)=>{n.classList.toggle("active",j===index);n.classList.toggle("complete",index>=0&&j<=index);});
  $("#progress-bar").style.width=`${ready?0:((i+1)/8)*100}%`;
}

function graphPoints(values,w,h) { if(values.length===1) return `0,${h-10}`; return values.map((v,i)=>`${Math.round(i/(values.length-1)*w)},${Math.round(v/100*(h-20)+10)}`).join(" "); }
function resetGraphs(){ AGENTS.forEach((_,i)=>{ $(`#agent-line-${i}`)?.setAttribute("points","0,66"); $(`#agent-load-${i}`).textContent="0%"; $(`#agent-latency-${i}`).textContent="--"; $(`#agent-packets-${i}`).textContent="0"; const card=$(`[data-agent-card="${i}"]`); card?.classList.remove("active","done","failure"); card?.querySelector(".agent-state")?.replaceChildren(document.createTextNode("STANDBY")); }); }
function updateAgentGraph(index){ AGENTS.forEach((_,i)=>{ const card=$(`[data-agent-card="${i}"]`); card?.classList.toggle("active",i===index); card?.classList.toggle("done",i<index); card?.classList.toggle("failure",i===index&&(index===2||index===3)); if(i<=index){$(`#agent-line-${i}`).setAttribute("points",graphPoints(AGENT_PATTERNS[i],240,72));$(`#agent-load-${i}`).textContent=`${LOADS[i]}%`;$(`#agent-latency-${i}`).textContent=`${LATENCIES[i]}ms`;$(`#agent-packets-${i}`).textContent=String(i+1);card.querySelector(".agent-state").textContent=i===index?STATES[i]:"COMPLETE";} }); }
function setDial(id,value){ const ring=$(`#${id}-dial`); const label=$(`#${id}-dial-value`); ring?.style.setProperty("--value",String(value)); if(label) label.textContent=`${value}%`; }

function startAmbient(){ if(ambientTimer) clearInterval(ambientTimer); let index=-1; ambientTimer=setInterval(()=>{ if(!$("#proof-theater")?.hidden) return; index=(index+1)%8; applyStage(index); },2200); }

function openTheater(skip){ lastFocusedElement=document.activeElement; const theater=$("#proof-theater"); theater.hidden=false; document.body.classList.add("theater-open"); resetTheater(); if(skip) later(()=>finishTheater({immediate:true,source:"SKIP CONTROL"}),100); else $("#theater-launch")?.focus(); }
function closeTheater(){ runId+=1; clearAll(); const theater=$("#proof-theater"); theater.hidden=true; theater.setAttribute("aria-busy","false"); document.body.classList.remove("theater-open"); lastFocusedElement?.focus?.(); startAmbient(); }

function resetTheater(){ clearAll(); const theater=$("#proof-theater"); theater.className="proof-theater"; theater.setAttribute("aria-busy","false"); $("#verdict-card").hidden=true; $("#stage-kicker").textContent="AWAITING IGNITION"; $("#stage-title").textContent="PROMETHEUS IS READY"; $("#stage-narrative").textContent="Watch the same eight agents move through terminal code, handoffs, packets, graphs, repair, proof, memory, and promotion."; $("#core-value").textContent="READY"; $("#core-subtitle").textContent="EVIDENCE GOVERNED"; $("#proof-core").className="proof-core"; $("#theater-terminal-output").textContent="PROMETHEUS> mission PROM-COMP-001 staged\nBUILD_TRUTH> unsupported completion claims disabled"; $("#evidence-stream").innerHTML="<div class='evidence-line'><strong>[PROMETHEUS]</strong> Canonical eight-agent graph online.</div>"; $$(".theater-step,.organ-node").forEach(n=>n.classList.remove("active","done","handoff","packet-moving")); $("#metric-tests").textContent="0 / 5"; $("#metric-artifacts").textContent="0 / 8"; $("#metric-receipt").textContent="PENDING"; $("#metric-genome").textContent="UNEXTRACTED"; setGauge("proof",0);setGauge("load",12);$("#latency").textContent="18ms";$("#packet-count").textContent="0";$("#agent-count").textContent="1";$("#telemetry-line").setAttribute("points","0,80");$("#theater-clock").textContent="T+00:00";$("#theater-launch").disabled=false;$("#theater-launch").textContent="IGNITE COMMAND-TO-PROOF";$("#theater-skip").disabled=false;$("#theater-skip").textContent="SKIP TO VERIFIED RESULTS"; }

function runTheater(){ runId+=1; const current=runId; resetTheater(); const theater=$("#proof-theater"); theater.classList.add("running");theater.setAttribute("aria-busy","true");$("#theater-launch").disabled=true;$("#theater-launch").textContent="LIVE MISSION RUNNING"; terminalStart=Date.now(); every(()=>{const s=Math.floor((Date.now()-terminalStart)/1000);$("#theater-clock").textContent=`T+${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;},250); startTheaterTelemetry(); later(()=>advance(current,0),350); }

function advance(current,index){ if(current!==runId)return; if(index>=8){finishTheater({source:"PIPELINE"});return;} const item=data.pipeline[index],agent=AGENTS[index]; $$(".theater-step").forEach((n,j)=>{n.classList.toggle("active",j===index);n.classList.toggle("done",j<index);}); $$(".organ-node").forEach((n,j)=>{n.classList.toggle("active",j===index);n.classList.toggle("done",j<index);n.classList.toggle("handoff",j===index||j===index-1);}); animatePacket(index); $("#stage-kicker").textContent=`${String(index+1).padStart(2,"0")} / 08 · ${agent.name}`;$("#stage-title").textContent=item.stage;$("#stage-narrative").textContent=item.detail;$("#core-value").textContent=CORE[index];$("#core-subtitle").textContent=STATES[index]; const theater=$("#proof-theater"),core=$("#proof-core");theater.classList.remove("failure","success");core.className="proof-core";if(index===2||index===3){theater.classList.add("failure");core.classList.add("fail");}if(index>=4)core.classList.add("success"); appendEvidence(agent.name,item.detail,index===2||index===3?"fail":index===4?"repair":""); appendTheaterTerminal(agent.name,item.detail,index); if(index>0){appendEvidence("HANDOFF",`${AGENTS[index-1].name} → ${agent.name} · ${PACKETS[index]} packet acknowledged`);appendTheaterTerminal("HANDOFF",`${AGENTS[index-1].name} -> ${agent.name} ${PACKETS[index]} PKT-${String(index).padStart(3,"0")}`,index);} updateMetrics(index); later(()=>advance(current,index+1),1450); }

function appendTheaterTerminal(source,message,index){ const el=$("#theater-terminal-output");el.textContent+=`\n${stamp()}  ${PACKETS[Math.max(0,index)].padEnd(10)} ${source.padEnd(20)} ${message}`;el.scrollTop=el.scrollHeight; }
function animatePacket(index){const step=$(`.theater-step[data-step="${index}"]`);if(!step)return;step.classList.remove("packet-moving");void step.offsetWidth;step.classList.add("packet-moving");$("#packet-count").textContent=String((index+1)*(index+2)/2);}
function updateMetrics(index){setGauge("proof",CONFIDENCE[index]);setGauge("load",LOADS[index]);$("#agent-count").textContent=String(index+1);$("#latency").textContent=`${LATENCIES[index]}ms`;if(index>=4)$("#metric-tests").textContent=`${Math.min(5,index-3)} / 5`;if(index>=5){$("#metric-artifacts").textContent=`${Math.min(8,(index-4)*4)} / 8`;$("#metric-receipt").textContent="HASHING";}if(index>=6)$("#metric-genome").textContent="EXTRACTED";}
function setGauge(id,value){const path=$(`#gauge-${id}`),label=$(`#gauge-${id}-value`);if(!path||!label)return;const length=141.4;path.style.strokeDasharray=String(length);path.style.strokeDashoffset=String(length-(length*value/100));label.textContent=`${value}%`;}
function startTheaterTelemetry(){let idx=0;every(()=>{idx=(idx+1)%telemetryPattern.length;$("#telemetry-line").setAttribute("points",graphPoints(telemetryPattern.slice(0,idx+1),300,90));},180);}
function appendEvidence(source,message,kind=""){const stream=$("#evidence-stream");const line=document.createElement("div");line.className=`evidence-line ${kind}`.trim();line.innerHTML=`<strong>[${esc(source)}]</strong> ${esc(message)}`;stream.appendChild(line);stream.scrollTop=stream.scrollHeight;}

function finishTheater({ immediate = false, source = "PIPELINE" } = {}) { runId+=1; const verdictRun=runId; clearAll(); const theater=$("#proof-theater");theater.hidden=false;theater.classList.remove("running","failure");theater.classList.add("success");theater.setAttribute("aria-busy","false");$$(".theater-step,.organ-node").forEach(n=>{n.classList.remove("active","handoff","packet-moving");n.classList.add("done");});$("#stage-kicker").textContent="08 / 08 · BUILD TRUTH";$("#stage-title").textContent="PROMOTION AUTHORIZED";$("#stage-narrative").textContent="All eight PROMETHEUS agents completed the same canonical handoff chain. ProofGrid verified the evidence, Capability Genome preserved the repair, and Build Truth authorized promotion.";$("#core-value").textContent="PROVEN";$("#core-subtitle").textContent="PROMOTION AUTHORIZED";$("#proof-core").className="proof-core success";setGauge("proof",100);setGauge("load",52);$("#metric-tests").textContent="5 / 5";$("#metric-artifacts").textContent="8 / 8";$("#metric-receipt").textContent="VERIFIED";$("#metric-genome").textContent="REUSED";$("#agent-count").textContent="8";$("#latency").textContent="9ms";$("#packet-count").textContent="36";if(source==="SKIP CONTROL")appendEvidence("DEMO CONTROL","Fast-forwarded to the stored verified outcome.");appendEvidence("PROOFGRID","Receipt hash verified. Build Truth authorizes promotion.");appendEvidence("CAPABILITY GENOME","PG-CG-REPLAY-GUARD-001 reused. Failure count reduced 1 → 0.");$("#theater-terminal-output").textContent+="\nT+00:12  SEALED     PROOFGRID            receipt hash verified\nT+00:13  PROMOTION  BUILD TRUTH          PROMOTION AUTHORIZED";$("#theater-launch").disabled=false;$("#theater-launch").textContent="RUN FULL REPLAY";$("#theater-skip").disabled=true;$("#theater-skip").textContent="VERIFIED RESULTS LOADED";const showVerdict=()=>{if(verdictRun!==runId)return;const verdict=$("#verdict-card");verdict.hidden=false;verdict.focus();};if(immediate)showVerdict();else later(showVerdict,600); }

function selectChallenge(key){const [command,href]=CHALLENGES[key]||CHALLENGES.receipt;$$('[data-challenge]').forEach(b=>b.classList.toggle("active",b.dataset.challenge===key));$("#challenge-output").textContent=command;$("#challenge-link").href=href;}
async function copyChallenge(){const value=$("#challenge-output").textContent;try{await navigator.clipboard.writeText(value);}catch{const area=document.createElement("textarea");area.value=value;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove();}$("#challenge-copy").textContent="COPIED";later(()=>$("#challenge-copy").textContent="COPY",1200);}

load().catch(error => { console.error(error); document.body.innerHTML=`<main style="padding:40px"><h1>PROMETHEUS data load failed</h1><p>${esc(error.message)}</p></main>`; });
