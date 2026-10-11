/* P09 etapa 0 — referencial de pista: seção mais próxima, desvio lateral, altura e rumo
   relativos à linha central. Busca em janela em torno da última seção para custo O(janela). */
'use strict';
const {loadP08}=require('./load-p08.cjs');
const deg=x=>x*180/Math.PI;

function makeTracker(course,{window=80,closed=false}={}){
 const {V}=loadP08(),S=course.stations,N=S.length;let last=-1;
 function nearest(p){
  let lo,hi;if(last<0){lo=0;hi=N-1;}else{lo=last-window;hi=last+window;}
  let best=-1,bd=Infinity;
  for(let j=lo;j<=hi;j++){const i=closed?((j%N)+N)%N:Math.max(0,Math.min(N-1,j));const d=V.len(V.sub(p,S[i].p));if(d<bd){bd=d;best=i;}}
  if(best<0||bd>500){for(let i=0;i<N;i++){const d=V.len(V.sub(p,S[i].p));if(d<bd){bd=d;best=i;}}}
  last=best;return best;}
 function rel(s){const i=nearest(s.p),st=S[i],d=V.sub(s.p,st.p),fp=V.norm(V.sub(s.f,V.mul(st.n,V.dot(s.f,st.n))));
  return {i,st,zone:st.zone,lateral:V.dot(d,st.r),height:V.dot(d,st.n),along:V.dot(d,st.f),
   heading:deg(Math.atan2(V.dot(fp,st.r),V.dot(fp,st.f))),lateralSpeed:V.dot(s.v,st.r),speed:V.len(s.v)};}
 return {nearest,rel,reset:()=>{last=-1;}};
}
module.exports={makeTracker,deg};
