/* P09 etapa 0 — custo da física por passo com 1, 8, 16 e 30 naves (especificação §9).
   Mede só a física do P08 (contato A, consulta de superfície, colisão com pista e barreiras)
   na pista técnica. O núcleo do P08 não tem colisão nave × nave: esse custo fica para as
   etapas com várias naves. Tempos de CPU desta máquina; não substituem o hardware de
   referência (questão aberta da especificação). */
'use strict';
const {loadP08}=require('./load-p08.cjs');

function physicsCost({counts=[1,8,16,30],ticks=600,course}={}){
 const {P,cfg,profile,air}=loadP08();const C=course||new P.Course(),rows=[];
 for(const n of counts){
  const bodies=Array.from({length:n},(_,i)=>P.fresh(C,'A',cfg,[0,1,3,4,5,6,9][i%7],180+(i%5)*40,8+i,profile));
  for(let k=0;k<60;k++)for(const b of bodies)P.step(C,b,cfg,{throttle:true},profile,{air}); // aquecimento
  const t0=process.hrtime.bigint();
  for(let k=0;k<ticks;k++)for(const b of bodies)P.step(C,b,cfg,{throttle:true,steer:Math.sin(k/40+b.seed)>.6?1:0},profile,{air});
  const ms=Number(process.hrtime.bigint()-t0)/1e6/ticks;
  rows.push({naves:n,msPorPasso:+ms.toFixed(3),msPorNave:+(ms/n).toFixed(4),orcamento120Hz:+(ms/(1000/120)*100).toFixed(1)+' %'});
 }
 return {triangulos:C.triangles.length,linhas:rows};
}
module.exports={physicsCost};
if(require.main===module)console.log(JSON.stringify(physicsCost(),null,1));
