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

// Ponto da seção transversal com a mesma fórmula da malha (P08 / camada 2): para 0 < tube < 1 a
// seção é um arco de círculo de raio R/blend centrado em p + n·R/blend; a normal do arco aponta
// para o centro. Como blend varia ao longo da pista, a superfície real também se inclina no
// sentido longitudinal: surfaceNormal() combina as duas direções tangentes (lateral × longitudinal).
function crossSection(st,u,hw,R){
 const {V}=loadP08(),blend=st.tube;
 if(!(blend>.001))return {point:V.add(st.p,V.mul(st.r,u*hw)),normal:st.n};
 const arc=hw+(Math.PI*R-hw)*blend,ang=u*arc/R*blend,rad=R/blend;
 const point=V.add(st.p,V.add(V.mul(st.r,rad*Math.sin(ang)),V.mul(st.n,rad*(1-Math.cos(ang)))));
 const center=V.add(st.p,V.mul(st.n,rad));return {point,normal:V.norm(V.sub(center,point))};
}

function surfaceNormal(S,i,u,hw,R){
 const {V}=loadP08(),j=i+1<S.length&&!S[i+1].gap?i+1:i-1,du=1e-3;
 if(j<0||!S[j]||S[j].gap)return null; // sem seção vizinha: não há direção longitudinal
 const a=crossSection(S[i],u,hw,R);
 const lat=V.sub(crossSection(S[i],Math.min(1,u+du),hw,R).point,crossSection(S[i],Math.max(-1,u-du),hw,R).point);
 let lon=V.sub(crossSection(S[j],u,hw,R).point,a.point);if(j<i)lon=V.mul(lon,-1);
 if(![...lon,...lat].every(Number.isFinite)||V.len(lon)<1e-9||V.len(lat)<1e-12)return null;
 let n=V.norm(V.cross(lon,lat));if(V.dot(n,a.normal)<0)n=V.mul(n,-1);return {normal:n,arcNormal:a.normal,longitudinal:V.norm(lon)};
}

function coverage(course,{every=2,lateral=[-.9,-.6,-.3,0,.3,.6,.9],tubeAngles=72,height}={}){
 const {V,profile}=loadP08(),h=height??profile.hoverHeight,S=course.stations,R=course.tubeRadius||26;
 const cat={plana:{secoes:0,amostras:0,falhas:0},tuboParcial:{secoes:0,amostras:0,falhas:0},tuboFechado:{secoes:0,amostras:0,falhas:0}};
 let misses=[],maxErr={plana:0,tuboParcial:0,tuboFechado:0},worst={},skipped=0;const partial={plano:0,longitudinalMalha:0,longitudinalAnalitica:0};
 const note=(k,i,where,hit,ideal)=>{cat[k].amostras++;if(!hit){cat[k].falhas++;misses.push({categoria:k,station:i,...where});return;}
  const e=deg(Math.acos(Math.min(1,V.dot(hit.normal,ideal))));if(e>maxErr[k]){maxErr[k]=e;worst[k]={station:i,...where};}};
 for(let i=0;i<S.length;i+=every){const st=S[i];if(st.gap)continue;
  const hw=(course.halfWidthAt||(()=>48))(st);
  if(st.tube>=1){cat.tuboFechado.secoes++;const c=V.add(st.p,V.mul(st.n,R));
   for(let k=0;k<tubeAngles;k++){const th=k/tubeAngles*2*Math.PI,radial=V.add(V.mul(st.r,Math.sin(th)),V.mul(st.n,-Math.cos(th))),p=V.add(c,V.mul(radial,R-h)),inward=V.mul(radial,-1);
    note('tuboFechado',i,{angle:+(th*180/Math.PI).toFixed(1)},course.surface(p,inward,6),inward);}
   continue;}
  const k=st.tube>0?'tuboParcial':'plana';cat[k].secoes++;
  for(const u of lateral){const cs=crossSection(st,u,hw,R);
   // V.norm do P08 devolve [0,1,0] para vetores inválidos: validar o ponto também
   if(![...cs.point,...cs.normal].every(Number.isFinite)){skipped++;continue;}
   const p=V.add(cs.point,V.mul(cs.normal,h));
   // erro de normal: na plana, só na linha central (fora dela a torção inclina a normal real);
   // no tubo parcial, contra a normal 3D analítica da superfície em todas as posições amostradas,
   // com a decomposição: erro no plano da seção e inclinação longitudinal.
   const hit=course.surface(p,cs.normal,6);
   if(k==='plana'&&u!==0){cat[k].amostras++;if(!hit){cat[k].falhas++;misses.push({categoria:k,station:i,u});}continue;}
   if(k==='tuboParcial'){const sn=surfaceNormal(S,i,u,hw,R);if(!sn){skipped++;continue;}note(k,i,{u},hit,sn.normal);
    // decomposição em relação ao eixo da pista (st.f): componente no plano da seção e inclinação longitudinal
    if(hit){const f=st.f,nf=V.dot(hit.normal,f),inPlane=V.norm(V.sub(hit.normal,V.mul(f,nf)));
     partial.plano=Math.max(partial.plano,deg(Math.acos(Math.min(1,V.dot(inPlane,sn.arcNormal)))));
     partial.longitudinalMalha=Math.max(partial.longitudinalMalha,deg(Math.asin(Math.min(1,Math.abs(nf)))));
     partial.longitudinalAnalitica=Math.max(partial.longitudinalAnalitica,deg(Math.asin(Math.min(1,Math.abs(V.dot(sn.normal,f))))));}
    continue;}
   note(k,i,{u},hit,cs.normal);}
 }
 const total=Object.values(cat).reduce((a,c)=>a+c.amostras,0),falhas=Object.values(cat).reduce((a,c)=>a+c.falhas,0);
 const tubeStations=S.filter(st=>!st.gap&&st.tube>0&&st.tube<1).length;
 const completa=skipped===0&&(tubeStations===0||cat.tuboParcial.secoes>0);
 return {completa,amostras:total,falhas,naoAmostradas:skipped,porCategoria:cat,primeirasFalhas:misses.slice(0,10),
  erroNormalMax:Object.fromEntries(Object.entries(maxErr).map(([k,v])=>[k,+v.toFixed(4)])),pior:worst,
  tuboParcialDecomposicao:{erroNoPlanoDaSecao:+partial.plano.toFixed(4),inclinacaoLongitudinalMalha:+partial.longitudinalMalha.toFixed(3),inclinacaoLongitudinalAnalitica:+partial.longitudinalAnalitica.toFixed(3)},
  observacao:completa?'plana, tubo parcial (0 < tube < 1) e tubo fechado amostrados':'COBERTURA INCOMPLETA: há seções não amostradas'};
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
module.exports={validate,closure,coverage,transitions,crossSection,surfaceNormal};
