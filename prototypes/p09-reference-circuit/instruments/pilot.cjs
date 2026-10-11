/* P09 etapa 0 — piloto de teste (instrumento; especificação §8.5).
   Usa só entradas válidas do jogo: acelerador (X), ← e →. Lê desvio lateral e rumo em
   relação à linha central com atraso de percepção, decide em intervalos discretos e dá
   toques proporcionais ao erro. Demonstra que uma passagem é possível; NÃO comprova
   diversão nem facilidade, e não é a IA do jogo. */
'use strict';
const {loadP08}=require('./load-p08.cjs');
const {makeTracker}=require('./frame.cjs');
const {makeClassifier}=require('./detach.cjs');

const DEFAULT_PILOT=Object.freeze({delayMs:250,periodMs:100,k1:.02,k2:1,deadband:.3,maxPulse:1,targetSpeed:null});

function runPilot(course,{zone=0,speed=300,untilStation,maxTicks=6000,pilot={},intentional,closed=false,onStep}={}){
 const {P,cfg,profile,air}=loadP08();const o={...DEFAULT_PILOT,...pilot};
 const tracker=makeTracker(course,{closed}),cls=makeClassifier(course,tracker,{intentional});
 const s=P.fresh(course,'A',cfg,zone,speed,8,profile),delay=Math.round(o.delayMs/1000/P.DT),period=Math.max(1,Math.round(o.periodMs/1000/P.DT));
 const hist=[];let pulse=0,dir=0,taps=0,steerTicks=0,maxLat=0,ticks=0,last=tracker.rel(s);
 for(;ticks<maxTicks;ticks++){
  const r=tracker.rel(s);hist.push(r);const seen=hist[Math.max(0,hist.length-1-delay)];
  if(ticks%period===0){const e=o.k1*seen.lateral+o.k2*seen.heading;if(Math.abs(e)>o.deadband){dir=e>0?1:-1;pulse=Math.min(o.maxPulse,Math.max(1,Math.round(Math.abs(e))));taps++;}}
  const keys=[];if(o.targetSpeed===null||r.speed<o.targetSpeed)keys.push('KeyX');
  if(pulse>0){keys.push(dir===1?'ArrowRight':'ArrowLeft');pulse--;steerTicks++;}
  cls.step(s,cfg,{keys},profile,{air});last=tracker.rel(s);if(onStep)onStep(s,last);
  maxLat=Math.max(maxLat,Math.abs(last.lateral));
  if(s.stopped||(untilStation!==undefined&&last.i>=untilStation))break;}
 const reached=untilStation===undefined?null:last.i>=untilStation,sum=cls.summary(),notIntentional=sum.total-(sum.porCausa.intencional||0);
 // concluir = chegar à seção final em contato, sem desprendimento fora de trecho intencional
 return {concluiu:reached===null?null:reached&&s.contact&&notIntentional===0,chegouAoFim:reached,emContatoNoFim:s.contact,passos:ticks+1,toques:taps,fracaoDirecao:+(steerTicks/(ticks+1)).toFixed(4),desvioMax:+maxLat.toFixed(2),
  velocidadeFinal:+(Math.hypot(...s.v)).toFixed(1),desprendimentos:sum,eventos:cls.events,parametros:o};
}
module.exports={runPilot,DEFAULT_PILOT};
