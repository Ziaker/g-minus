/* P09 etapa 0 — executa todos os instrumentos e grava as evidências em JSON.
   Uso: node prototypes/p09-reference-circuit/instruments/run-etapa0.cjs [pasta-de-saída]
   Padrão: docs/evidence/p09-etapa0/. Determinístico (passo fixo de 120 Hz, sementes fixas),
   exceto os tempos de CPU de perf.cjs. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {loadP08}=require('./load-p08.cjs');
const {runCompare}=require('./compat.cjs');
const {validate}=require('./geometry.cjs');
const {curveEnvelope,flatPad,measure}=require('./envelope.cjs');
const {runPilot}=require('./pilot.cjs');
const {makeTracker}=require('./frame.cjs');
const {makeClassifier,p08IntentionalSegments}=require('./detach.cjs');
const {makeLapTimer}=require('./timing.cjs');
const {physicsCost}=require('./perf.cjs');


function classifierCases(C){
 const {P,cfg,profile,air}=loadP08(),out=[];
 const cases=[
  {nome:'curva aberta sem direção',zone:1,speed:180,ticks:400,input:()=>({throttle:true})},
  {nome:'parede 90° → loop sem direção',zone:4,speed:300,ticks:400,input:()=>({throttle:true})},
  {nome:'tubo: volta de 360° com → mantida',zone:6,speed:250,ticks:600,input:(s,k)=>({throttle:true,keys:k>=40&&k<160?['ArrowRight']:[]})},
  {nome:'rampa e lacuna (trecho intencional marcado)',zone:7,speed:230,ticks:600,input:()=>({throttle:true})},
  {nome:'rampa: saída lateral antes da borda',zone:7,speed:230,ticks:400,input:()=>({throttle:true,steer:1})},
  {nome:'impulso de diagnóstico J',zone:0,speed:180,ticks:120,input:(s,k)=>({throttle:true,release:k===30})},
 ];
 for(const c of cases){const tr=makeTracker(C),cl=makeClassifier(C,tr,{intentionalSegments:p08IntentionalSegments(C)});const s=P.fresh(C,'A',cfg,c.zone,c.speed,8,profile);
  for(let k=0;k<c.ticks&&!s.stopped;k++)cl.step(s,cfg,c.input(s,k),profile,{air});
  out.push({cenario:c.nome,...cl.summary(),eventos:cl.events.slice(0,6)});}
 return out;
}

function timerCheck(C){
 const {P,cfg,profile,air}=loadP08(),st=C.stations[C.zones[0].station+200],timer=makeLapTimer(st);
 const s=P.fresh(C,'A',cfg,0,500,8,profile);let prev=s.p.slice(),exact=null;
 for(let k=0;k<200;k++){P.step(C,s,cfg,{throttle:true},profile,{air});
  const d0=timer.signed(prev),d1=timer.signed(s.p);if(exact===null&&d0<0&&d1>=0)exact=(s.time-P.DT)+P.DT*d0/(d0-d1);
  timer.sample(s.p,s.time);prev=s.p.slice();}
 // verificação analítica: movimento uniforme a 600 u/s, passagem em instante conhecido
 const line={p:[0,0,100],f:[0,0,1],r:[1,0,0],n:[0,1,0]},t2=makeLapTimer(line),z0=37.3,v=600,tExact=(100-z0)/v;
 for(let k=0;k<=60;k++){const t=k*P.DT;t2.sample([0,2.1,z0+v*t],t);}
 const analitico={velocidade:v,instanteExato:tExact,medido:t2.crossings[0]&&t2.crossings[0].time,erro:t2.crossings[0]?Math.abs(t2.crossings[0].time-tExact):null};
 return {analitico,linhaNaSecao:C.zones[0].station+200,velocidade:500,passagens:timer.crossings,instanteEsperado:exact,erro:timer.crossings.length?Math.abs(timer.crossings[0].time-exact):null};
}

function pilotWallLoop(C){
 const end=C.zones[6].station-3,rows=[];
 for(const speed of [180,300,400,500])for(const delayMs of [0,250,350]){
  const r=runPilot(C,{zone:4,speed,untilStation:end,pilot:{delayMs},intentionalSegments:p08IntentionalSegments(C)});
  rows.push({velocidadeInicial:speed,atrasoMs:delayMs,concluiu:r.concluiu,desprendimentos:r.desprendimentos.total,toques:r.toques,desvioMax:r.desvioMax,fracaoDirecao:r.fracaoDirecao});}
 return rows;
}

function main(outDir){
 const {P}=loadP08(),C=new P.Course(),t0=Date.now();
 const results={
  data:new Date().toISOString(),observacao:'Instrumentos de teste do P09 (etapa 0). Não definem regras de corrida, IA nem pistas.',
  compatibilidade:runCompare(),
  geometriaPistaP08:validate(C),
  envelopeCurva:curveEnvelope(),
  envelopeRegressaoContato:measure(flatPad(),300,.25,{perturb:k=>k===5?{release:true}:{}}),
  trechosIntencionaisP08:p08IntentionalSegments(C),
  classificador:classifierCases(C),
  cronometro:timerCheck(C),
  pilotoParedeLoop:pilotWallLoop(C),
  custoFisica:physicsCost({course:C}),
 };
 results.duracaoS=(Date.now()-t0)/1000;
 fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'etapa0-results.json'),JSON.stringify(results,null,1)+'\n');
 return results;
}
module.exports={main};
if(require.main===module){const out=process.argv[2]||path.resolve(__dirname,'../../../docs/evidence/p09-etapa0');const r=main(out);
 console.log('equivalência P08:',r.compatibilidade.equivalente,'| cobertura falhas:',r.geometriaPistaP08.cobertura.falhas,'| erro cronômetro:',r.cronometro.erro,'| saída:',out);}
