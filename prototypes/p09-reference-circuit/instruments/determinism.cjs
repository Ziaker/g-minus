/* P09 etapa 0 — determinismo: física em passo fixo de 120 Hz com agendamento equivalente a
   renderização a 30, 60 e 120 Hz (e intervalos irregulares com semente).

   SIMULAÇÃO DE AGENDAMENTO, não validação em navegador: cada "quadro" avança um acumulador
   de tempo e executa quantos passos fixos de 1/120 s couberem, como o laço do laboratório do
   P08. As entradas são função do passo físico (tick), então quadros diferentes devem produzir
   exatamente a mesma sequência de estados. A validação futura em navegador (requestAnimationFrame
   real, variação de quadro, amostragem de teclado por quadro, abas em segundo plano) NÃO é
   coberta aqui e fica para a etapa com laboratório.

   Também se mede, como diagnóstico, o efeito de amostrar o teclado por quadro: nesse caso a
   entrada muda só nos limites de quadro e os estados divergem entre 30/60/120 Hz — efeito de
   latência de entrada esperado, a avaliar no navegador. */
'use strict';
const {loadP08}=require('./load-p08.cjs');

function lcg(seed){let x=seed>>>0;return ()=>((x=(x*1664525+1013904223)>>>0)/4294967296);}

const SCENARIOS=[
 {name:'reta · manobras P01',zone:0,speed:42,seconds:6,input:(t,P)=>P.scripted(t,8)},
 {name:'parede → loop · direção alternada',zone:4,speed:300,seconds:5,input:t=>({throttle:true,steer:Math.sin(t*3)>0?1:-1})},
 {name:'tubo · volta com →',zone:6,speed:250,seconds:5,input:t=>({throttle:true,keys:t>.3&&t<1.3?['ArrowRight']:[]})},
 {name:'rampa · boost e ↑ no ar (revisão 4)',zone:7,speed:230,seconds:6,input:(t)=>({throttle:true,boost:Math.abs(t-1)<1/240,keys:t>.8?['ArrowUp']:[]})},
];

// frameDt(): duração de cada quadro de renderização. inputPerFrame: entrada amostrada no início do quadro.
function runScheduled(sc,frameDt,{inputPerFrame=false}={}){
 const {P,cfg,profile,air}=loadP08(),C=runScheduled.course||(runScheduled.course=new P.Course());
 const s=P.fresh(C,'A',cfg,sc.zone,sc.speed,8,profile),total=Math.round(sc.seconds/P.DT),states=[];let acc=0,frames=0;
 while(s.tick<total){const dt=frameDt();acc+=dt;frames++;const frameInput=sc.input(s.tick*P.DT,P);
  while(acc+1e-10>=P.DT&&s.tick<total){P.step(C,s,cfg,inputPerFrame?frameInput:sc.input(s.tick*P.DT,P),profile,{air});acc-=P.DT;states.push(JSON.stringify({...s,trace:0}));}}
 return {states,frames};
}

function compare(a,b){if(a.length!==b.length)return {iguais:false,motivo:'quantidade de passos',a:a.length,b:b.length};
 for(let i=0;i<a.length;i++)if(a[i]!==b[i])return {iguais:false,primeiroPasso:i+1};return {iguais:true};}

function determinism({scenarios=SCENARIOS,diagnostic=true}={}){
 const cadences=[['30 Hz',()=>1/30],['60 Hz',()=>1/60],['120 Hz',()=>1/120]];
 const jitter=()=>{const r=lcg(20261011);return ()=>(1/240)+r()*(1/20);}; // 4,2–54 ms por quadro
 const out=[];
 for(const sc of scenarios){
  const ref=runScheduled(sc,()=>1/120);
  const row={cenario:sc.name,passos:ref.states.length,porPasso:{}};
  for(const [name,f] of [...cadences,['irregular (semente)',jitter()]]){const r=runScheduled(sc,f);row.porPasso[name]={quadros:r.frames,...compare(ref.states,r.states)};}
  // diagnóstico: entrada amostrada por quadro
  if(diagnostic){const pf={};for(const [name,f] of cadences){const r=runScheduled(sc,f,{inputPerFrame:true});pf[name]=compare(ref.states,r.states);}
   row.diagnosticoEntradaPorQuadro=pf;}
  row.deterministico=Object.values(row.porPasso).every(x=>x.iguais);
  out.push(row);
 }
 return {modo:'simulação de agendamento (sem navegador)',cenarios:out,deterministico:out.every(r=>r.deterministico)};
}
module.exports={determinism,runScheduled,SCENARIOS};
if(require.main===module)console.log(JSON.stringify(determinism(),null,1));
