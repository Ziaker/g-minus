/* P09 etapa 0 — perfilamento por subsistema da física do P08, sem modificar o P08.

   Usa uma instância isolada (createP08) e embrulha em tempo de execução só o que é
   observável de fora:
     - course.surface()      consulta de superfície (tempo exclusivo, sem candidates)
     - course.candidates()   busca na grade espacial, separada por quem chama:
                             dentro de surface() ou direto do P08 (colisão com pista/barreiras)
     - P01Profile.drive / fly / land / tickEnergy / activateBoost   pilotagem do Perfil C
     - restante = P.step − (acima): transporte de velocidade, restrição de altura, matemática
                  da colisão, voo assistido e integração — funções internas do fechamento do
                  P08, que não são observáveis separadamente sem alterar o código aprovado.
   O custo do próprio embrulho é calibrado e informado. Os estados físicos com e sem
   instrumentação são comparados para provar que o perfilamento não altera a simulação.

   NÃO EXISTE nesta etapa (logo, não é medido): colisão nave × nave, IA, regras de corrida e
   checkpoints com várias naves, renderização WebGL, HUD, VFX, câmera e áudio. */
'use strict';
const {createP08}=require('./load-p08.cjs');
const {makeTracker}=require('./frame.cjs');
const {SAFE_ZONES}=require('./perf.cjs');

const now=()=>process.hrtime.bigint();

function instrument(I,C){
 const acc={};const add=(k,ns)=>{const a=acc[k]||(acc[k]={ns:0,chamadas:0});a.ns+=ns;a.chamadas++;};
 let inSurface=0,childNs=0;
 const origSurface=C.surface,origCand=C.candidates;
 C.surface=function(...a){inSurface++;const saved=childNs;childNs=0;const t0=now();const r=origSurface.apply(this,a);const dt=Number(now()-t0);
  add('consultaSuperficie',dt-childNs);childNs=saved+dt;inSurface--;return r;};
 C.candidates=function(...a){const t0=now();const r=origCand.apply(this,a);const dt=Number(now()-t0);
  if(inSurface){add('gradeEspacial_daConsulta',dt);childNs+=dt;}else add('gradeEspacial_daColisao',dt);return r;};
 const prof=I.P.profile,orig={};
 for(const name of ['drive','fly','land','tickEnergy','activateBoost']){orig[name]=prof[name];
  prof[name]=function(...a){const t0=now();const r=orig[name].apply(this,a);add('perfilC_'+name,Number(now()-t0));return r;};}
 return {acc,restore(){C.surface=origSurface;C.candidates=origCand;for(const k in orig)prof[k]=orig[k];}};
}

function wrapperOverhead(reps=200000){
 const f=x=>x,w=function(x){const t0=now();const r=f(x);Number(now()-t0);return r;};
 let t0=now();for(let i=0;i<reps;i++)f(i);const base=Number(now()-t0);
 t0=now();for(let i=0;i<reps;i++)w(i);return +((Number(now()-t0)-base)/reps).toFixed(1);
}

function profileSubsystems({n=8,ticks=300,warmup=60}={}){
 const I=createP08(),{P,cfg,profile,air}=I,C=new P.Course();
 const spawn=i=>P.fresh(C,'A',cfg,SAFE_ZONES[i%SAFE_ZONES.length],400,8+i,profile);
 const bodies=Array.from({length:n},(_,i)=>spawn(i)),trackers=bodies.map(()=>makeTracker(C));
 const inputOf=(b,i)=>{const r=trackers[i].rel(b),e=.02*r.lateral+r.heading,keys=[];if(r.speed<400)keys.push('KeyX');if(e>.3)keys.push('ArrowRight');else if(e<-.3)keys.push('ArrowLeft');return {keys};};
 for(let k=0;k<warmup;k++)for(let i=0;i<n;i++)P.step(C,bodies[i],cfg,inputOf(bodies[i],i),profile,{air});
 const ins=instrument(I,C);let stepNs=0,steps=0;const counts={ativas:0,contato:0,paradas:0};
 for(let k=0;k<ticks;k++){for(let i=0;i<n;i++){const inp=inputOf(bodies[i],i);const t0=now();P.step(C,bodies[i],cfg,inp,profile,{air});stepNs+=Number(now()-t0);steps++;}
  for(const b of bodies){if(b.stopped)counts.paradas++;else{counts.ativas++;if(b.contact)counts.contato++;}}}
 ins.restore();
 const rows=Object.entries(ins.acc).map(([k,v])=>({subsistema:k,msTotal:+(v.ns/1e6).toFixed(2),chamadasPorPassoDeNave:+(v.chamadas/steps).toFixed(2),usPorChamada:+(v.ns/v.chamadas/1e3).toFixed(2),fracao:+(v.ns/stepNs*100).toFixed(1)}));
 const observed=Object.values(ins.acc).reduce((a,v)=>a+v.ns,0);
 rows.push({subsistema:'restante (interno ao P08: transporte, restrição, colisão, voo, integração)',msTotal:+((stepNs-observed)/1e6).toFixed(2),fracao:+((stepNs-observed)/stepNs*100).toFixed(1)});
 rows.sort((a,b)=>b.fracao-a.fracao);
 return {naves:n,passos:ticks,msPorPasso:+(stepNs/ticks/1e6).toFixed(3),
  mediaPorPasso:{ativas:+(counts.ativas/ticks).toFixed(2),emContato:+(counts.contato/ticks).toFixed(2),paradas:+(counts.paradas/ticks).toFixed(2)},
  subsistemas:rows,custoDoEmbrulhoNsPorChamada:wrapperOverhead(),
  naoExisteNestaEtapa:['colisão nave × nave','IA','regras de corrida e checkpoints com várias naves','renderização WebGL','HUD','VFX','câmera','áudio']};
}

// Prova de não interferência: mesma sequência de entradas com e sem instrumentação → estados idênticos.
function profilingIsTransparent({zone=4,speed=300,ticks=400}={}){
 const run=(wrap)=>{const I=createP08(),{P,cfg,profile,air}=I,C=new P.Course(),ins=wrap?instrument(I,C):null,s=P.fresh(C,'A',cfg,zone,speed,8,profile);
  for(let k=0;k<ticks;k++)P.step(C,s,cfg,{throttle:true,steer:Math.sin(k/30)>.5?1:0},profile,{air});if(ins)ins.restore();return JSON.stringify({...s,trace:0});};
 return run(false)===run(true);
}
module.exports={profileSubsystems,profilingIsTransparent,instrument,wrapperOverhead};
if(require.main===module)console.log(JSON.stringify(profileSubsystems(),null,1));
