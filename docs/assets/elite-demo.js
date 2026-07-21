(()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const systems=[
    {name:'PROMETHEUS',role:'Mission Orchestrator',stage:'IGNITION',packet:'MISSION',title:'A compound emergency mission enters.',copy:'PROMETHEUS binds seven simultaneous edge conditions, acceptance gates, recovery rules, and release authority into one governed campaign.',logs:['mission admitted','7 edge conditions bound','release authority locked pending proof']},
    {name:'AIS-Ω',role:'Candidate Route Engine',stage:'ROUTE FORGE',packet:'CANDIDATES',title:'Three competing recovery routes are generated.',copy:'AIS-Ω evaluates isolation-first, repair-first, and continuity-first strategies against safety, latency, reversibility, and evidence constraints.',logs:['route-a isolation-first → safe but too slow','route-b repair-first → fast but evidence-weak','route-c continuity-first → selected with fail-closed gates']},
    {name:'Adversarial Twin',role:'Failure Reproduction',stage:'TRIAL BY FIRE',packet:'EDGE-STORM',title:'The selected route is attacked from seven directions.',copy:'Malformed input, poisoned data, duplicate execution, secret exposure, dependency loss, receipt corruption, and rollback pressure are reproduced under controlled conditions.',logs:['malformed timestamp reproduced','duplicate operation race reproduced','private field leak reproduced','dependency outage and receipt corruption reproduced']},
    {name:'SECA',role:'Fail-Closed Promotion Gate',stage:'PROMOTION DENIAL',packet:'DENIAL',title:'SECA refuses the system’s own success claim.',copy:'Promotion is blocked because public output contains protected data, one requirement conflicts with another, and the receipt chain is incomplete.',logs:['unsupported claim detected','public/private boundary violated','receipt chain incomplete','PROMOTION DENIED']},
    {name:'HYDRA',role:'Behavioral Repair Forge',stage:'CONVERGENCE REPAIR',packet:'REPAIR',title:'HYDRA repairs behavior without replacing the system.',copy:'The existing path is patched with normalization, idempotency, secret redaction, dependency fallback, evidence regeneration, and bounded rollback recovery.',logs:['parser normalization applied','idempotent execution guard applied','protected fields redacted','fallback route activated','receipt regenerated']},
    {name:'ProofGrid',role:'Evidence Verification',stage:'PROOF CLOSURE',packet:'EVIDENCE',title:'ProofGrid verifies the repaired mission state.',copy:'Five executable tests, eight evidence artifacts, behavioral deltas, hashes, and the promotion receipt are checked as one evidence chain.',logs:['5/5 tests passed','8/8 artifacts verified','behavior delta confirmed','receipt hash sealed']},
    {name:'Capability Genome',role:'Verified Capability Memory',stage:'CAPABILITY PRESERVATION',packet:'GENOME',title:'The successful recovery becomes reusable capability.',copy:'The verified strategy is preserved with triggers, applicability, exclusions, rollback boundaries, and proof requirements for future missions.',logs:['recovery pattern extracted','trigger and exclusion rules bound','reuse simulation started','failed actions reduced 1 → 0']},
    {name:'Build Truth',role:'Release Authority',stage:'FINAL ADJUDICATION',packet:'PROMOTION',title:'Build Truth closes the entire mission.',copy:'All contradictions are resolved, blockers are zero, the capability is reused successfully, and release is authorized with a sealed ServerForge handoff envelope.',logs:['supported claims 4/4','contradictions 0','open blockers 0','PROMOTION AUTHORIZED','ServerForge envelope sealed']}
  ];
  const edges=['Malformed input','Poisoned data','Duplicate race','Secret exposure','Dependency loss','Receipt corruption','Rollback pressure'];
  const stageStarts=[0,20,42,64,84,110,136,158];
  const duration=180;
  let running=false,startTime=0,timer=null,current=-1;
  const terminalLines=['[READY] PROM-COMP-EDGE-001 staged','[READY] eight-system fabric online','[READY] seven-edge-condition mission armed'];
  function renderSystems(){
    $('#pipeline').innerHTML=systems.map((s,i)=>`<article class="system" data-system="${i}"><small>${String(i+1).padStart(2,'0')} · ${s.packet}</small><b>${s.name}</b><span>${s.role}</span></article>`).join('');
    $('#edge-grid').innerHTML=edges.map((e,i)=>`<div class="edge" data-edge="${i}"><small>EDGE ${String(i+1).padStart(2,'0')}</small><b>${e}</b></div>`).join('');
  }
  function stageFor(sec){let idx=0;for(let i=0;i<stageStarts.length;i++)if(sec>=stageStarts[i])idx=i;return idx;}
  function setStage(idx){
    if(idx===current)return; current=idx;
    $$('.system').forEach((el,i)=>{el.classList.toggle('active',i===idx);el.classList.toggle('done',i<idx);el.classList.toggle('failed',idx===3&&i===2)});
    const s=systems[idx];
    $('#stage-kicker').textContent=`${s.stage} · ${s.name}`;
    $('#stage-title').textContent=s.title;
    $('#stage-copy').textContent=s.copy;
    $('#packet').textContent=`PKT-${String(idx+1).padStart(3,'0')} · ${s.packet}`;
    s.logs.forEach(line=>terminalLines.push(`[${s.name.toUpperCase()}] ${line}`));
    $('#terminal').textContent=terminalLines.slice(-11).join('\n');
    if(idx===2){$$('.edge').forEach(e=>e.classList.add('hot'));$('#ev-failure').textContent='7 / 7 REPRODUCED';}
    if(idx===3){$('#ev-gate').textContent='DENIED';}
    if(idx===4){$$('.edge').forEach(e=>{e.classList.remove('hot');e.classList.add('closed')});}
    if(idx===5){$('#ev-tests').textContent='5 / 5';$('#ev-artifacts').textContent='8 / 8';}
    if(idx===6){$('#ev-reuse').textContent='VERIFIED';}
  }
  function setBar(name,val){$(`#bar-${name}`).style.width=`${val}%`;$(`#v-${name}`).textContent=`${Math.round(val)}%`;}
  function tick(){
    const sec=Math.min(duration,(Date.now()-startTime)/1000);
    const progress=sec/duration*100;
    const idx=stageFor(sec); setStage(idx);
    $('#clock').textContent=`T+${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
    $('#proof').textContent=`${Math.round(progress)}%`;$('#ring').style.setProperty('--progress',`${progress}%`);
    setBar('proof',progress);setBar('evidence',Math.max(0,(progress-10)*1.11));setBar('claims',Math.max(0,(progress-4)*1.04));
    const readiness=idx===3?0:Math.min(100,idx*13+progress*.35);setBar('readiness',readiness);setBar('load',Math.min(100,32+idx*8+(idx===4?24:0)));
    $('#ev-routes').textContent=idx<1?'0 / 3':idx===1?'3 / 3':'3 / 3';
    if(sec>=duration){finish();return}
    timer=requestAnimationFrame(tick);
  }
  function launch(){
    if(running)return;running=true;current=-1;startTime=Date.now();terminalLines.splice(3);$('#verdict').classList.remove('show');$('#release').textContent='LOCKED';$('#launch').disabled=true;$('#replay').disabled=true;
    $$('.edge').forEach(e=>e.className='edge');$('#ev-failure').textContent='PENDING';$('#ev-gate').textContent='LOCKED';$('#ev-tests').textContent='0 / 5';$('#ev-artifacts').textContent='0 / 8';$('#ev-reuse').textContent='PENDING';
    tick();
  }
  function finish(){
    running=false;cancelAnimationFrame(timer);setStage(7);$('#clock').textContent='T+03:00';$('#proof').textContent='100%';$('#ring').style.setProperty('--progress','100%');['proof','evidence','claims','readiness'].forEach(n=>setBar(n,100));setBar('load',52);$('#release').textContent='AUTHORIZED';$('#core-state').textContent='MISSION COMPLETE';$('#verdict').classList.add('show');$('#launch').disabled=false;$('#replay').disabled=false;$('#verdict').scrollIntoView({behavior:'smooth',block:'center'});
  }
  renderSystems();$('#launch').addEventListener('click',launch);$('#replay').addEventListener('click',launch);
})();