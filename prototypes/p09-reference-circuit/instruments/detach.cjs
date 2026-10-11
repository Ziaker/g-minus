/* P09 etapa 0 — classificador de desprendimentos (especificação §8.2).
   Envolve P08.step sem alterá-lo. A causa física é recalculada pelo instrumento a partir
   do estado antes do passo, com as mesmas grandezas do contato A (não depende do texto
   s.reason do P08, que sobrescreve o motivo de reação — pendência B-1).

   Causas físicas (o julgamento "dentro/fora do envelope seguro" é da etapa 2):
     intencional          trecho marcado como rampa/lacuna/salto pelo chamador
     liberacao_teste      impulso de diagnóstico (input.release)
     limite_reacao        reação exigida pelo transporte > limite do contato A
     velocidade_afastamento  velocidade normal acima do limite de captura
     saida_borda          sem superfície e desvio lateral além da meia largura
     sem_superficie       sem superfície dentro da pista — candidato a injustificado
     nao_classificado     nenhuma das anteriores — candidato a injustificado */
'use strict';
const {loadP08}=require('./load-p08.cjs');

const UNJUSTIFIED=new Set(['sem_superficie','nao_classificado']);

function makeClassifier(course,tracker,{intentional=()=>false,edgeMargin=1.5}={}){
 const {P,V}=loadP08();const events=[];
 function step(s,cfg,input,profile,options){
  const was=s.contact,h0=course.surface(s.p,s.up,cfg.reach),v0=s.v.slice(),n0=s.normal.slice();
  const rel0=tracker.rel(s);
  P.step(course,s,cfg,input,profile,options);
  if(was&&!s.contact){
   let cause,need=null,normalSpeed=null,limit=null;
   const hw=(course.halfWidthAt||(()=>48))(rel0.st);
   if(input&&input.release)cause='liberacao_teste';
   else if(intentional(rel0.st,rel0))cause='intencional';
   else if(!h0){cause=Math.abs(rel0.lateral)>hw-edgeMargin?'saida_borda':'sem_superficie';}
   else{normalSpeed=V.dot(v0,h0.normal);limit=Math.sqrt(2*cfg.magnet*Math.max(.2,cfg.reach-(h0.signed||0)));
    need=V.len(V.sub(P.transport(v0,n0,h0.normal),v0))/P.DT;
    if(need>cfg.magnet)cause='limite_reacao';else if(normalSpeed>=limit)cause='velocidade_afastamento';
    else if(Math.abs(rel0.lateral)>hw-edgeMargin)cause='saida_borda';else cause='nao_classificado';}
   events.push({tick:s.tick,time:+s.time.toFixed(4),cause,unjustifiedCandidate:UNJUSTIFIED.has(cause),zone:rel0.zone,station:rel0.i,
    lateral:+rel0.lateral.toFixed(3),speed:+V.len(v0).toFixed(2),reactionNeeded:need&&+need.toFixed(1),reactionLimit:cfg.magnet,
    normalSpeed:normalSpeed&&+normalSpeed.toFixed(3),captureLimit:limit&&+limit.toFixed(2),p08Reason:s.reason});
  }
  return s;
 }
 return {step,events,summary:()=>{const c={};for(const e of events)c[e.cause]=(c[e.cause]||0)+1;return {total:events.length,porCausa:c,candidatosInjustificados:events.filter(e=>e.unjustifiedCandidate).length};}};
}
module.exports={makeClassifier,UNJUSTIFIED};
