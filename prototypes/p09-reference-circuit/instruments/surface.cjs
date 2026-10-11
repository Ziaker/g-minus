/* P09 etapa 0 — camada 2 (superfície), separada do traçado.
   Recebe seções {p,f,n,r,s,zone,gap,tube} e monta a malha com as MESMAS regras do P08:
   tri() orientado por dica, smoothNormals() por vértice coincidente, consulta surface() e
   grade espacial. Os métodos vêm de P08.Course.prototype (não são copiados); só o laço de
   montagem é reescrito, com largura, raio do tubo e barreiras parametrizados.
   Com os parâmetros-padrão e as seções do P08, a malha resultante é idêntica bit a bit
   (verificado por compat.cjs e pelos testes). */
'use strict';
const {loadP08}=require('./load-p08.cjs');

const P08_DEFAULTS=Object.freeze({
 halfWidth:()=>48,          // meia largura da pista (u); no P08 é constante
 tubeRadius:26,             // raio do tubo (u)
 maxSegment:8,              // seções mais distantes que isto não são ligadas (lacunas)
 minSegment:.01,
 roadCols:4, tubeCols:32,
 barrier:(a)=>a.zone===0&&a.s<650,   // regra do P08: barreiras nos primeiros 650 u da reta
 barrierHeight:7,
});

function buildSurface(stations,zones,options={}){
 const {P,V}=loadP08();
 const o={...P08_DEFAULTS,...options};
 const C=Object.create(P.Course.prototype);
 C.triangles=[];C.stations=stations;C.zones=zones;C.grid=new Map();C.cell=48;
 C.length=stations.length?stations[stations.length-1].s:0;
 for(let i=0;i<stations.length-1;i++){
  const a=stations[i],b=stations[i+1];
  if(a.gap||b.gap||V.len(V.sub(a.p,b.p))>o.maxSegment||V.len(V.sub(a.p,b.p))<o.minSegment)continue;
  const tube=a.tube>0||b.tube>0,cols=tube?o.tubeCols:o.roadCols,R=o.tubeRadius;
  const point=(st,u)=>{const hw=o.halfWidth(st),blend=st.tube,arc=hw+(Math.PI*R-hw)*blend,ang=u*arc/R*blend,
   x=blend>.001?R*Math.sin(ang)/blend:u*hw,y=blend>.001?R*(1-Math.cos(ang))/blend:0;
   return V.add(st.p,V.add(V.mul(st.r,tube?x:u*hw),V.mul(st.n,tube?y:0)));};
  for(let k=0;k<cols;k++){const u=k/cols*2-1,v=(k+1)/cols*2-1,A=point(a,u),B=point(a,v),Cc=point(b,v),D=point(b,u);
   const mid=V.mul(V.add(A,B),.5),center=V.add(a.p,V.mul(a.n,R)),hint=tube?V.norm(V.sub(center,mid)):a.n;
   C.tri(A,B,Cc,hint,a.zone);C.tri(A,Cc,D,hint,a.zone);}
  if(o.barrier(a,b))for(const side of [-1,1]){const A=point(a,side),B=point(b,side),Cc=V.add(B,V.mul(b.n,o.barrierHeight)),D=V.add(A,V.mul(a.n,o.barrierHeight)),hint=V.mul(a.r,-side);
   C.tri(A,B,Cc,hint,a.zone,'barrier');C.tri(A,Cc,D,hint,a.zone,'barrier');}
 }
 C.smoothNormals();
 C.halfWidthAt=o.halfWidth;C.tubeRadius=o.tubeRadius;
 return C;
}
module.exports={buildSurface,P08_DEFAULTS};
