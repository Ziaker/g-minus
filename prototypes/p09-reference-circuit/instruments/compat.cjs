/* P09 etapa 0 — verificação de compatibilidade com o P08 (especificação §5.1).
   Cenário equivalente: a pista técnica do P08 reconstruída pela camada 2 (surface.cjs)
   a partir das próprias seções do P08. Compara a malha e os estados físicos passo a passo. */
'use strict';
const {loadP08}=require('./load-p08.cjs');
const {buildSurface}=require('./surface.cjs');

function meshDiff(A,B){
 const out={triangles:[A.triangles.length,B.triangles.length],different:0,first:null};
 const n=Math.max(A.triangles.length,B.triangles.length);
 for(let i=0;i<n;i++){const a=A.triangles[i],b=B.triangles[i];
  const same=a&&b&&a.kind===b.kind&&a.zone===b.zone&&JSON.stringify([a.a,a.b,a.c,a.n,a.vn||null])===JSON.stringify([b.a,b.b,b.c,b.n,b.vn||null]);
  if(!same){out.different++;if(!out.first)out.first=i;}}
 return out;
}

// Cenários: cada área do P08 com acelerador; manobras; voo com recuperação aérea da revisão 4.
function scenarios(){
 const s=[];
 for(let zone=0;zone<10;zone++)s.push({name:'área '+zone+' · acelerador',zone,speed:zone===5?250:zone===7?230:180,ticks:600,input:()=>({throttle:true})});
 s.push({name:'reta · manobras P01 (scripted)',zone:0,speed:42,ticks:900,input:(st,P)=>P.scripted(st.time,8)});
 s.push({name:'parede · direção alternada',zone:4,speed:300,ticks:500,input:(st)=>({throttle:true,steer:Math.sin(st.time*3)>0?1:-1})});
 s.push({name:'rampa · boost no ar ↑',zone:7,speed:230,ticks:600,input:(st)=>({throttle:true,boost:st.tick===120,keys:st.contact?[]:['ArrowUp']})});
 return s;
}

function runCompare(){
 const {P,cfg,profile,air}=loadP08();
 const ref=new P.Course(),rebuilt=buildSurface(ref.stations,ref.zones);
 const mesh=meshDiff(ref,rebuilt),results=[];
 for(const sc of scenarios()){
  const a=P.fresh(ref,'A',cfg,sc.zone,sc.speed,8,profile),b=P.fresh(rebuilt,'A',cfg,sc.zone,sc.speed,8,profile);
  let firstDiff=null;
  for(let k=0;k<sc.ticks;k++){const ia=sc.input(a,P),ib=sc.input(b,P);P.step(ref,a,cfg,ia,profile,{air});P.step(rebuilt,b,cfg,ib,profile,{air});
   const ja=JSON.stringify({...a,trace:undefined}),jb=JSON.stringify({...b,trace:undefined});if(ja!==jb){firstDiff=k+1;break;}}
  results.push({cenario:sc.name,passos:sc.ticks,identico:firstDiff===null,primeiraDiferenca:firstDiff,desprendimentos:a.detachments,pousos:a.landings});
 }
 return {malha:mesh,cenarios:results,equivalente:mesh.different===0&&results.every(r=>r.identico)};
}
module.exports={runCompare,meshDiff};
if(require.main===module)console.log(JSON.stringify(runCompare(),null,1));
