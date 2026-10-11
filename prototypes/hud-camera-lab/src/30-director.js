/* P12 V2 — DIRETOR DE ALERTAS: regras explícitas de prioridade entre informações.
   Classes: P0 segurança imediata · P1 combate · P2 corrida · P3 informação.
   Regras: (1) maior prioridade primeiro; empate → mais recente; (2) P0 sempre visível, mesmo
   acima da capacidade; (3) mensagens de mesma chave se fundem dentro da janela (ex.: +3 posições);
   (4) intervalo mínimo por tipo; (5) estados com histerese (energia crítica, borda, recarga);
   (6) mensagens ocultas por preempção expiram no próprio prazo — informação velha não reaparece.
   A capacidade do canal de texto é parte do conceito de cada HUD (HUD_CHANNELS). */
const MSG={
 threat:{prio:0,label:'ATAQUE IMINENTE'},critical:{prio:0,label:'ENERGIA CRÍTICA'},edge:{prio:0,label:'BORDA ABERTA'},
 hitTaken:{prio:1,label:'IMPACTO'},hitLanded:{prio:1,label:'ACERTO'},
 countdown:{prio:2,label:'LARGADA'},go:{prio:2,label:'GO'},position:{prio:2,label:'POSIÇÃO'},lap:{prio:2,label:'VOLTA'},finalLap:{prio:2,label:'VOLTA FINAL'},rivalNear:{prio:2,label:'RIVAL'},finish:{prio:2,label:'CHEGADA'},
 boostReady:{prio:3,label:'IMPULSO LIBERADO'},recharge:{prio:3,label:'RECARGA'},dash:{prio:3,label:'PLACA'},corner:{prio:3,label:'CURVA'},airborne:{prio:3,label:'NO AR'}
};
const MSG_COOLDOWN={dash:1,rivalNear:10,edge:2,corner:0,boostReady:999};
const MERGE_WINDOW={position:1.2,hitTaken:.5,hitLanded:.6};
// capacidade do canal de texto e pesos de categoria por HUD (conceito, não slider)
const HUD_CHANNELS={A:{cap:2,bias:{position:-.6,lap:-.3,hitLanded:-.2}},B:{cap:2,bias:{hitTaken:-.4,hitLanded:-.4,rivalNear:-.5,position:.4}},C:{cap:2,bias:{lap:-.5,corner:-.6,rivalNear:-.2,position:.2}}};
const EXIT_TIME=.22;
function directorInit(){return {msgs:[],seq:0,cool:{},flags:{critical:false,edge:false,recharge:false,rival:false,air:false},corners:{}};}
function directorClone(d){return {msgs:d.msgs.map(m=>({...m,data:m.data?{...m.data}:null,vis:{A:{...m.vis.A},B:{...m.vis.B},C:{...m.vis.C}}})),seq:d.seq,cool:{...d.cool},flags:{...d.flags},corners:{...d.corners}};}
function directorTick(race,d){
 const t=raceTime(race._st),ships=race._st.ships,P=ships[0];
 const add=(type,dur,data,key)=>{if(MSG_COOLDOWN[type]&&d.cool[type]>t)return null;
  if(key&&MERGE_WINDOW[type]){const m=d.msgs.find(m=>m.key===key&&t-m.t0<MERGE_WINDOW[type]&&m.t1>t);if(m){mergeData(m,data);m.t1=Math.max(m.t1,t+dur);return m;}}
  const m={id:++d.seq,type,prio:MSG[type].prio,t0:t,t1:t+dur,data:data||{},key:key||null,vis:{A:{on:false,since:-1,off:-1},B:{on:false,since:-1,off:-1},C:{on:false,since:-1,off:-1}}};
  d.msgs.push(m);if(MSG_COOLDOWN[type])d.cool[type]=t+MSG_COOLDOWN[type];return m;};
 const end=(pred)=>{for(const m of d.msgs)if(pred(m)&&m.t1>t)m.t1=t;};
 const sideOf=(id)=>Math.sign(ships[id].lane-P.lane)||1;
 for(const e of race.tickEvents){
  switch(e.type){
   case 'countdown':add('countdown',.98,{n:e.data.n});break;
   case 'go':add('go',1.3,{});break;
   case 'sideWindup':if(e.b===0)add('threat',SIM.SIDE_WIND+SIM.SIDE_LUNGE+.05,{from:e.a,side:sideOf(e.a),kind:'side',rival:e.a===race.rivalId},'threat'+e.a);break;
   case 'sideLunge':break;
   case 'sideHit':case 'sideMiss':
    if(e.b===0){end(m=>m.key==='threat'+e.a);if(e.type==='sideHit')add('hitTaken',1.3,{dmg:e.data.dmg,side:-e.data.dir,kind:'side',by:e.a},'hit');}
    if(e.a===0&&e.type==='sideHit')add('hitLanded',1.1,{dmg:e.data.dmg,target:e.b,kind:'side'},'landed');break;
   case 'spinHit':if(e.b===0)add('hitTaken',1.2,{dmg:e.data.dmg,side:-e.data.dir,kind:'spin',by:e.a},'hit');if(e.a===0)add('hitLanded',1.1,{dmg:e.data.dmg,target:e.b,kind:'spin'},'landed');break;
   case 'collision':if(e.a===0)add('hitTaken',1,{dmg:e.data.dmg,side:e.data.dir,kind:'collision',by:e.b},'hit');else if(e.b===0)add('hitTaken',1,{dmg:e.data.dmg,side:-e.data.dir,kind:'collision',by:e.a},'hit');break;
   case 'barrier':if(e.a===0)add('hitTaken',1,{dmg:e.data.dmg,side:e.data.side,kind:'barrier',by:-1},'hit');break;
   case 'position':if(e.a===0){// troca de posição substitui a anterior (nunca duas leituras contraditórias na tela)
    for(const o of d.msgs)if(o.type==='position'&&o.t1>t&&t-o.t0>=MERGE_WINDOW.position)o.t1=t;
    const m=add('position',1.5,{from:e.data.from,to:e.data.to},'pos');if(m&&m.data.from===m.data.to)m.t1=t;}break;
   case 'lap':if(e.a===0){add('lap',2.6,{...e.data});if(e.data.lap===1)add('boostReady',2.2,{});}break;
   case 'finalLap':if(e.a===0)add('finalLap',2.8,{});break;
   case 'finish':if(e.a===0)add('finish',1e9,{time:e.data.time,place:P.rank});break;
   case 'dash':if(e.a===0)add('dash',.9,{});break;
   case 'takeoff':if(e.a===0){add('airborne',2,{h:e.data.h});d.flags.air=true;}break;
   case 'landing':if(e.a===0){end(m=>m.type==='airborne');d.flags.air=false;}break;
  }
 }
 if(P.finished&&(d.flags.critical||d.flags.edge||d.flags.recharge)){for(const k of ['critical','edge','recharge'])d.flags[k]=false;end(m=>['critical','edge','recharge','rivalNear','corner','threat'].includes(m.type));}
 if(t>=SIM.GO&&!P.finished){
  // energia crítica (histerese já aplicada na simulação)
  if(P.crit&&!d.flags.critical){d.flags.critical=true;add('critical',1e9,{});}
  if(!P.crit&&d.flags.critical){d.flags.critical=false;end(m=>m.type==='critical');}
  // borda aberta: dentro do trecho (ou a 1,2 s dele) e a menos de 5 m da borda; saída acima de 7 m
  const oe=TRACK.features.openEdge,ls=wrap(P.s,TRACK.L),inZone=ls>oe.s0-P.v*1.2&&ls<oe.s1,edgeDist=trackHw(P.s)-SIM.HALF_WID-P.lane;
  if(!d.flags.edge&&inZone&&edgeDist<5){const m=add('edge',1e9,{dist:edgeDist});if(m)d.flags.edge=true;}
  if(d.flags.edge){const m=d.msgs.find(m=>m.type==='edge'&&m.t1>t);if(m)m.data.dist=edgeDist;if(!inZone||edgeDist>7){d.flags.edge=false;end(m=>m.type==='edge');d.cool.edge=t+MSG_COOLDOWN.edge;}}
  // recarga
  if(P.inRecharge&&!d.flags.recharge){d.flags.recharge=true;add('recharge',1e9,{});}
  if(!P.inRecharge&&d.flags.recharge){d.flags.recharge=false;end(m=>m.type==='recharge');}
  // rival a menos de 1 s (intervalo estimado por distância/velocidade)
  const R=ships[race.rivalId],gap=(R.s-P.s)/Math.max(60,P.v);
  if(Math.abs(gap)<1&&!d.flags.rival){const m=add('rivalNear',2.6,{ahead:gap>0,gap});if(m)d.flags.rival=true;}
  if(Math.abs(gap)>1.6)d.flags.rival=false;
  // curvas severas a 2,5 s (uma vez por curva por volta)
  const lapIdx=Math.floor(P.s/TRACK.L);for(const [ci,c] of TRACK.features.corners.entries()){if(c.severity<4)continue;const dist=wrap(c.s0-ls,TRACK.L);if(dist<P.v*2.5&&dist>P.v*.4&&d.corners[ci]!==lapIdx){d.corners[ci]=lapIdx;add('corner',Math.max(.6,dist/Math.max(60,P.v)-.2),{corner:ci,dir:c.dir,severity:c.severity,name:c.name});}}
 }
 // canais de texto por HUD: seleção determinística com registro de entrada/saída
 for(const hud of ['A','B','C']){const ch=HUD_CHANNELS[hud],alive=d.msgs.filter(m=>m.t0<=t&&m.t1>t);
  alive.sort((a,b)=>(a.prio+(ch.bias[a.type]||0))-(b.prio+(ch.bias[b.type]||0))||b.t0-a.t0||b.id-a.id);
  const show=new Set();let k=0;for(const m of alive){if(m.prio===0||k<ch.cap){show.add(m.id);if(m.prio!==0)k++;}}
  for(const m of d.msgs){const v=m.vis[hud],on=show.has(m.id);if(on&&!v.on){v.on=true;v.since=t;v.off=-1;}if(!on&&v.on){v.on=false;v.off=t;}}}
 d.msgs=d.msgs.filter(m=>m.t1>t-2&&(m.t1>t||m.vis.A.on||m.vis.B.on||m.vis.C.on||t-Math.max(m.vis.A.off,m.vis.B.off,m.vis.C.off)<EXIT_TIME+.05));
}
function mergeData(m,data){if(m.type==='position'){m.data.to=data.to;}else if(m.type==='hitTaken'||m.type==='hitLanded'){m.data.dmg=(m.data.dmg||0)+(data.dmg||0);m.data.side=data.side??m.data.side;m.data.kind=data.kind;m.data.count=(m.data.count||1)+1;}else Object.assign(m.data,data);}
// mensagens visíveis (ou saindo) de um HUD no instante atual
function hudMessages(d,hud,t){const out=[];for(const m of d.msgs){const v=m.vis[hud];if(v.on)out.push({m,age:t-v.since,exit:0});else if(v.off>=0&&t-v.off<EXIT_TIME&&v.since>=0)out.push({m,age:t-v.since,exit:(t-v.off)/EXIT_TIME});}return out.sort((a,b)=>a.m.prio-b.m.prio||b.m.t0-a.m.t0);}
