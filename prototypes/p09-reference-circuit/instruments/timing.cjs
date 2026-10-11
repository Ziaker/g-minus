/* P09 etapa 0 — cronômetro com linha exata (GDD [15]).
   Linha = plano transversal na seção indicada (normal = tangente da pista), limitado à
   largura e a uma faixa de altura. A passagem é detectada entre dois passos e o instante é
   interpolado linearmente pela distância assinada ao plano. Passagem no sentido contrário
   não conta volta e é registrada como aviso (GDD [19]). Instrumento de teste: não define
   regra de checkpoint nem validação de atalhos. */
'use strict';
const {loadP08}=require('./load-p08.cjs');

function makeLapTimer(station,{halfWidth=48,heightBand=60,dt}={}){
 const {V,P}=loadP08();const DT=dt??P.DT;
 const crossings=[],warnings=[];let prev=null,prevT=null,laps=0,debt=0;
 const signed=p=>V.dot(V.sub(p,station.p),station.f);
 function inside(p){const d=V.sub(p,station.p);return Math.abs(V.dot(d,station.r))<=halfWidth&&Math.abs(V.dot(d,station.n))<=heightBand;}
 // sample(p, t): posição após o passo e o tempo correspondente
 function sample(p,t){
  const d=signed(p);
  if(prev!==null){
   const d0=prev.d;
   if(d0<0&&d>=0||d0>0&&d<=0){const frac=d0/(d0-d),q=V.add(prev.p,V.mul(V.sub(p,prev.p),frac));
    if(inside(q)){const tc=prevT+(t-prevT)*frac;
     // contagem líquida: uma passagem para trás anula a próxima passagem para a frente
     if(d0<0){if(debt>0){debt--;warnings.push({type:'repassagem_apos_re',time:tc});}
      else{laps++;crossings.push({lap:laps,time:tc,lapTime:crossings.length?tc-crossings[crossings.length-1].time:null});}}
     else{debt++;warnings.push({type:'sentido_contrario',time:tc});}}}
  }
  prev={p:p.slice(),d};prevT=t;
 }
 return {sample,crossings,warnings,laps:()=>laps,signed};
}
module.exports={makeLapTimer};
