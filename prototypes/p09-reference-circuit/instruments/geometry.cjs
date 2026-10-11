/* P09 etapa 0 — validador geométrico (especificação §8.1).
   - fechamento: posição, direção e orientação entre a última e a primeira seção (pistas fechadas);
   - cobertura: consulta surface() em seções × posições laterais (tubo: volta completa);
   - erro de normal na linha central (tubo: normal radial);
   - transições: saltos de curvatura entre seções consecutivas (descontinuidades de traçado).
   Os limites de aceite são hipóteses da especificação; o validador só mede. */
'use strict';
const {loadP08}=require('./load-p08.cjs');
const {deg}=require('./frame.cjs');

function closure(course){
 const {V}=loadP08(),S=course.stations,a=S[S.length-1],b=S[0];
 return {posicao:V.len(V.sub(a.p,b.p)),direcao:deg(Math.acos(Math.min(1,V.dot(a.f,b.f)))),orientacao:deg(Math.acos(Math.min(1,V.dot(a.n,b.n))))};
}

function coverage(course,{every=2,lateral=[-.9,-.6,-.3,0,.3,.6,.9],tubeAngles=72,height}={}){
 const {V,profile}=loadP08(),h=height??profile.hoverHeight,S=course.stations,R=course.tubeRadius||26;
 let samples=0,misses=[],maxCenterErr=0,worst=null;
 for(let i=0;i<S.length;i+=every){const st=S[i];if(st.gap)continue;
  const hw=(course.halfWidthAt||(()=>48))(st);
  if(st.tube>=1){const c=V.add(st.p,V.mul(st.n,R));
   for(let k=0;k<tubeAngles;k++){const th=k/tubeAngles*2*Math.PI,radial=V.add(V.mul(st.r,Math.sin(th)),V.mul(st.n,-Math.cos(th))),p=V.add(c,V.mul(radial,R-h)),inward=V.mul(radial,-1);
    const hit=course.surface(p,inward,6);samples++;if(!hit){misses.push({station:i,angle:+(th*180/Math.PI).toFixed(1)});continue;}
    const e=deg(Math.acos(Math.min(1,V.dot(hit.normal,inward))));if(e>maxCenterErr){maxCenterErr=e;worst={station:i,angle:+(th*180/Math.PI).toFixed(1)};}}
   continue;}
  if(st.tube>0)continue; // transição aberta↔fechada: coberta pelos testes de contato, não por amostragem simples
  for(const u of lateral){const p=V.add(st.p,V.add(V.mul(st.r,u*hw),V.mul(st.n,h)));const hit=course.surface(p,st.n,6);samples++;
   if(!hit){misses.push({station:i,u});continue;}
   if(u===0){const e=deg(Math.acos(Math.min(1,V.dot(hit.normal,st.n))));if(e>maxCenterErr){maxCenterErr=e;worst={station:i,u};}}}
 }
 return {amostras:samples,falhas:misses.length,primeirasFalhas:misses.slice(0,10),erroNormalMax:+maxCenterErr.toFixed(4),pior:worst};
}

function transitions(course,{top=8}={}){
 const {V}=loadP08(),S=course.stations,k=[];
 // seções repetidas (ds = 0, fronteira entre áreas) são puladas, mas a comparação atravessa a
 // fronteira; lacunas (gap) interrompem a sequência.
 for(let i=1;i<S.length;i++){const a=S[i-1],b=S[i],ds=b.s-a.s;if(a.gap||b.gap){k.push(null);continue;}if(ds<=1e-9)continue;
  k.push({i,zone:b.zone,curvF:Math.acos(Math.min(1,V.dot(a.f,b.f)))/ds,curvN:Math.acos(Math.min(1,V.dot(a.n,b.n)))/ds});}
 const jumps=[];for(let j=1;j<k.length;j++){if(!k[j]||!k[j-1])continue;
  jumps.push({station:k[j].i,zone:k[j].zone,saltoCurvatura:Math.abs(k[j].curvF-k[j-1].curvF),saltoTorcao:Math.abs(k[j].curvN-k[j-1].curvN),curvatura:k[j].curvF});}
 jumps.sort((a,b)=>Math.max(b.saltoCurvatura,b.saltoTorcao)-Math.max(a.saltoCurvatura,a.saltoTorcao));
 return {maiores:jumps.slice(0,top).map(j=>({...j,saltoCurvatura:+j.saltoCurvatura.toExponential(3),saltoTorcao:+j.saltoTorcao.toExponential(3),raioApos:j.curvatura>1e-9?+(1/j.curvatura).toFixed(1):null}))};
}

function validate(course,{closed=false}={}){return {fechamento:closed?closure(course):'pista aberta (não se aplica)',cobertura:coverage(course),transicoes:transitions(course)};}
module.exports={validate,closure,coverage,transitions};
