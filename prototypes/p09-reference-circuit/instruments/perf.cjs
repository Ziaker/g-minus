/* P09 etapa 0 — custo da física por passo com 1, 8, 16 e 30 naves (especificação §9).

   Validade do benchmark: a cada passo, conta quantas naves estão ativas, em contato, no ar e
   paradas. P08.step() retorna imediatamente quando s.stopped é verdadeiro (custo de dezenas de
   ns), então nave parada não pode entrar como custo de nave ativa. O tempo de cada chamada a
   P.step é atribuído ao estado da nave ANTES do passo (contato, ar, parada).

   Dois modos:
     livre     — acelerador e direção senoidal, como na primeira medição: muitas naves saem da
                 pista e voam; NÃO representa uma corrida.
     pilotado  — cada nave segue a linha central com o piloto de teste (sem atraso) a 400 u/s;
                 nave parada ou fora de contato por mais de 2 s é recolocada (contado à parte;
                 o custo da recolocação e do piloto não entra no tempo de física).

   Mede só a física do P08 (contato A, consulta de superfície, colisão com pista e barreiras).
   Não existe nesta etapa: colisão nave × nave, IA, regras de corrida, renderização. Tempos de
   CPU desta máquina; não substituem o hardware de referência (questão aberta). */
'use strict';
const {loadP08}=require('./load-p08.cjs');
const {makeTracker}=require('./frame.cjs');

const SAFE_ZONES=[0,1,2,3,4,5,6,9];   // sem rampa/lacuna: o modo pilotado deve ficar em contato

function steerFor(tracker,s,{k1=.02,k2=1,deadband=.3,target=400}={}){
 const r=tracker.rel(s),e=k1*r.lateral+k2*r.heading,keys=[];
 if(r.speed<target)keys.push('KeyX');if(e>deadband)keys.push('ArrowRight');else if(e<-deadband)keys.push('ArrowLeft');return {keys};
}

function benchmark({n,mode='pilotado',ticks=600,warmup=60,course}={}){
 const {P,cfg,profile,air}=loadP08();const C=course||new P.Course();
 const spawn=i=>P.fresh(C,'A',cfg,SAFE_ZONES[i%SAFE_ZONES.length],mode==='pilotado'?400:180+(i%5)*40,8+i,profile);
 const bodies=Array.from({length:n},(_,i)=>spawn(i)),trackers=bodies.map(()=>makeTracker(C)),offSince=bodies.map(()=>0);
 const input=(b,i,k)=>mode==='pilotado'?steerFor(trackers[i],b):{throttle:true,steer:Math.sin(k/40+b.seed)>.6?1:0};
 const acc={contato:{ns:0,passos:0},ar:{ns:0,passos:0},parada:{ns:0,passos:0}};let respawns=0,totalNs=0;
 const counts={ativas:0,contato:0,ar:0,paradas:0};
 for(let k=0;k<warmup+ticks;k++){
  const measured=k>=warmup;
  for(let i=0;i<n;i++){const b=bodies[i],inp=input(b,i,k),state=b.stopped?'parada':b.contact?'contato':'ar';
   const t0=process.hrtime.bigint();P.step(C,b,cfg,inp,profile,{air});const dt=Number(process.hrtime.bigint()-t0);
   if(measured){acc[state].ns+=dt;acc[state].passos++;totalNs+=dt;}
   if(mode==='pilotado'){offSince[i]=b.contact?0:offSince[i]+1;
    if(b.stopped||offSince[i]>240){bodies[i]=spawn(i+k);trackers[i].reset();offSince[i]=0;if(measured)respawns++;}}}
  if(measured)for(const b of bodies){if(b.stopped)counts.paradas++;else{counts.ativas++;if(b.contact)counts.contato++;else counts.ar++;}}
 }
 const per=x=>x.passos?+(x.ns/x.passos/1e6).toFixed(4):null,msTick=totalNs/ticks/1e6;
 return {naves:n,modo:mode,
  mediaPorPasso:{ativas:+(counts.ativas/ticks).toFixed(2),emContato:+(counts.contato/ticks).toFixed(2),noAr:+(counts.ar/ticks).toFixed(2),paradas:+(counts.paradas/ticks).toFixed(2)},
  recolocacoes:respawns,msPorPasso:+msTick.toFixed(3),orcamento120Hz:+(msTick/(1000/120)*100).toFixed(1),
  msPorPassoDeNave:{contato:per(acc.contato),ar:per(acc.ar),parada:per(acc.parada)},
  passosPorEstado:{contato:acc.contato.passos,ar:acc.ar.passos,parada:acc.parada.passos}};
}

function stoppedStepCost(reps=200000){
 const {P,cfg,profile,air}=loadP08(),C=new P.Course(),s=P.fresh(C,'A',cfg,0,180,8,profile);s.stopped=true;const before=JSON.stringify(s);
 const t0=process.hrtime.bigint();for(let k=0;k<reps;k++)P.step(C,s,cfg,{throttle:true},profile,{air});
 return {nsPorPasso:+(Number(process.hrtime.bigint()-t0)/reps).toFixed(1),estadoInalterado:JSON.stringify(s)===before};
}

function physicsCost({counts=[1,8,16,30],ticks=600,course}={}){
 const {P}=loadP08();const C=course||new P.Course();
 return {triangulos:C.triangles.length,naveParada:stoppedStepCost(),
  pilotado:counts.map(n=>benchmark({n,mode:'pilotado',ticks,course:C})),
  livre:counts.map(n=>benchmark({n,mode:'livre',ticks,course:C}))};
}
module.exports={physicsCost,benchmark,stoppedStepCost,SAFE_ZONES};
if(require.main===module)console.log(JSON.stringify(physicsCost(),null,1));
