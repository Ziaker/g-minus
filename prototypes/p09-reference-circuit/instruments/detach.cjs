/* P09 etapa 0 — classificador de desprendimentos (especificação §8.2).
   Envolve P08.step sem alterá-lo. A causa física é recalculada pelo instrumento a partir
   do estado antes do passo, com as mesmas grandezas do contato A (não depende do texto
   s.reason do P08, que sobrescreve o motivo de reação — pendência B-1).

   Trechos intencionais: só contam os trechos MARCADOS explicitamente pelo chamador, cada um
   com intervalo de seções, tipo e motivo:
     {id, from, to, kind:'rampa_lancamento'|'lacuna'|'salto', motivo}
   Estar dentro de um trecho marcado NÃO basta. O evento só é "intencional" quando a causa
   física corresponde ao mecanismo de lançamento declarado pelo tipo (MECHANISM abaixo): fim de
   superfície ou separação balística. Qualquer outra causa física dentro do trecho (limite de
   reação, saída pela borda, causa não classificada) mantém a própria causa. A causa física
   (causaFisica) e o contexto do trecho (trecho) são sempre registrados separadamente, e
   `mecanismoEsperado` informa se a causa física bate com o tipo do trecho.

   Causas:
     intencional             dentro de trecho marcado (ver acima)
     liberacao_teste         impulso de diagnóstico (input.release)
     limite_reacao           reação exigida pelo transporte > limite do contato A
     velocidade_afastamento  velocidade normal acima do limite de captura
     saida_borda             desvio lateral além da meia largura
     sem_superficie          sem superfície dentro da pista — candidato a injustificado
     nao_classificado        nenhuma das anteriores — candidato a injustificado */
'use strict';
const {loadP08}=require('./load-p08.cjs');

const UNJUSTIFIED=new Set(['sem_superficie','nao_classificado']);
// Mecanismo físico de lançamento esperado para cada tipo de trecho marcado.
const MECHANISM={
 lacuna:new Set(['sem_superficie']),                                  // a pista acaba
 rampa_lancamento:new Set(['sem_superficie','velocidade_afastamento']), // borda ou separação na crista
 salto:new Set(['sem_superficie','velocidade_afastamento']),
};
const KINDS=new Set(Object.keys(MECHANISM));

function checkSegments(segments){
 for(const g of segments){
  if(!g||typeof g.id!=='string'||!Number.isInteger(g.from)||!Number.isInteger(g.to)||g.from>g.to)throw Error('trecho intencional inválido: '+JSON.stringify(g));
  if(!KINDS.has(g.kind))throw Error('tipo de trecho intencional inválido: '+g.kind);
  if(typeof g.motivo!=='string'||!g.motivo.trim())throw Error('trecho intencional sem motivo: '+g.id);}
 return segments;
}

function makeClassifier(course,tracker,{intentionalSegments=[],edgeMargin=1.5}={}){
 const {P,V}=loadP08();const events=[],segs=checkSegments(intentionalSegments);
 function step(s,cfg,input,profile,options){
  const was=s.contact,h0=course.surface(s.p,s.up,cfg.reach),v0=s.v.slice(),n0=s.normal.slice(),p0=s.p.slice();
  const rel0=tracker.rel(s);
  P.step(course,s,cfg,input,profile,options);
  if(was&&!s.contact){
   let physical,need=null,normalSpeed=null,limit=null;
   const hw=(course.halfWidthAt||(()=>48))(rel0.st),offEdge=Math.abs(rel0.lateral)>hw-edgeMargin;
   if(input&&input.release)physical='liberacao_teste';
   else if(!h0)physical=offEdge?'saida_borda':'sem_superficie';
   else{normalSpeed=V.dot(v0,h0.normal);limit=Math.sqrt(2*cfg.magnet*Math.max(.2,cfg.reach-(h0.signed||0)));
    need=V.len(V.sub(P.transport(v0,n0,h0.normal),v0))/P.DT;
    if(need>cfg.magnet)physical='limite_reacao';else if(normalSpeed>=limit)physical='velocidade_afastamento';
    else if(offEdge)physical='saida_borda';else physical='nao_classificado';}
   const seg=segs.find(g=>rel0.i>=g.from&&rel0.i<=g.to)||null;
   const matches=!!seg&&!offEdge&&MECHANISM[seg.kind].has(physical);
   const cause=matches?'intencional':physical;
   events.push({tick:s.tick,time:+s.time.toFixed(4),cause,causaFisica:physical,unjustifiedCandidate:UNJUSTIFIED.has(cause),
    mecanismoEsperado:seg?matches:null,
    trecho:seg&&{id:seg.id,tipo:seg.kind,motivo:seg.motivo,secoes:[seg.from,seg.to],mecanismosAceitos:[...MECHANISM[seg.kind]]},
    posicao:p0.map(x=>+x.toFixed(3)),zone:rel0.zone,station:rel0.i,lateral:+rel0.lateral.toFixed(3),speed:+V.len(v0).toFixed(2),
    reactionNeeded:need&&+need.toFixed(1),reactionLimit:cfg.magnet,normalSpeed:normalSpeed&&+normalSpeed.toFixed(3),captureLimit:limit&&+limit.toFixed(2),p08Reason:s.reason});
  }
  return s;
 }
 return {step,events,summary:()=>{const c={};for(const e of events)c[e.cause]=(c[e.cause]||0)+1;return {total:events.length,porCausa:c,candidatosInjustificados:events.filter(e=>e.unjustifiedCandidate).length};}};
}

// Trecho intencional da pista técnica do P08: fim da rampa de lançamento (zona 7) e lacuna
// sem pista (zona 8). Começa 8 seções (~24 u) antes da borda para cobrir a decolagem.
function p08IntentionalSegments(course){
 const ramp=course.zones[7],gap=course.zones[8],lip=gap.station-1;
 return [{id:'p08-borda-e-lacuna',from:lip-8,to:course.zones[9].station-1,kind:'lacuna',
  motivo:'P08: borda da '+ramp.name+' (seção '+lip+') e '+gap.name+' sem superfície (seções '+gap.station+'–'+(course.zones[9].station-1)+')'}];
}
module.exports={makeClassifier,p08IntentionalSegments,UNJUSTIFIED,checkSegments,MECHANISM};
