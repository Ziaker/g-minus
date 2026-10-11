/* P09 etapa 0 — envelope de curva com velocidade estabilizada (especificação §8.3).
   Plataforma plana e larga montada pela camada 2 (mesmas regras de malha e contato do P08).
   Para cada velocidade-alvo e fração de direção (toques de ← num ciclo de 100 ms), o
   acelerador é modulado para manter a velocidade. Depois de 1 s de acomodação, mede-se
   1 s: velocidade média, taxa de guinada ω e raio efetivo R = v/ω. Se a velocidade não se
   mantém dentro de ±2 %, o ponto é marcado como não estabilizado (a direção limita a
   velocidade sustentável). */
'use strict';
const {loadP08}=require('./load-p08.cjs');
const {buildSurface}=require('./surface.cjs');

function flatPad({length=4000,halfWidth=2000,spacing=7.5}={}){
 const S=[],n=Math.round(length/spacing);
 for(let j=0;j<=n;j++)S.push({p:[0,0,j*spacing],f:[0,0,1],n:[0,1,0],r:[1,0,0],s:j*spacing,zone:0,gap:false,tube:0});
 return buildSurface(S,[{id:'pad',name:'Plataforma de medição',index:0,start:0,length,station:0}],{halfWidth:()=>halfWidth,barrier:()=>false});
}

function measure(pad,target,duty,{settle=120,window=120,cycle=12}={}){
 const {P,cfg,profile,air}=loadP08();
 const s=P.fresh(pad,'A',cfg,0,target,8,profile),on=Math.round(duty*cycle);
 const heading=()=>Math.atan2(s.v[0],s.v[2]);let h0=null,acc=0,sumV=0,minV=Infinity,maxV=0,slip=0,unwrap=0,prev=null;
 for(let k=0;k<settle+window;k++){
  const v=Math.hypot(...s.v),keys=[];if(v<target)keys.push('KeyX');if(k%cycle<on)keys.push('ArrowLeft');
  P.step(pad,s,cfg,{keys},profile,{air});
  const h=heading();if(prev!==null){let d=h-prev;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;unwrap+=d;}prev=h;
  if(k===settle-1)h0=unwrap;
  if(k>=settle){const vv=Math.hypot(...s.v);sumV+=vv;minV=Math.min(minV,vv);maxV=Math.max(maxV,vv);slip=Math.max(slip,Math.abs(s.driver.slip||0));acc++;}
 }
 const vMean=sumV/acc,omega=Math.abs(unwrap-h0)/(window*P.DT),R=omega>1e-6?vMean/omega:Infinity;
 const stable=Math.abs(vMean-target)/target<=.02&&(maxV-minV)/target<=.04;
 return {alvo:target,kmh:Math.round(target*3.6),direcao:duty,velocidadeMedia:+vMean.toFixed(1),estabilizada:stable,
  omegaGrausS:+(omega*180/Math.PI).toFixed(2),raio:Number.isFinite(R)?+R.toFixed(1):null,aceleracaoLateral:+(vMean*omega).toFixed(0),
  emContato:s.contact,slipMax:+slip.toFixed(2)};
}

function curveEnvelope({speeds=[200,300,400,500],duties=[.25,.5,.75,1]}={}){
 const pad=flatPad(),rows=[];for(const v of speeds)for(const d of duties)rows.push(measure(pad,v,d));return rows;
}
module.exports={curveEnvelope,flatPad,measure};
if(require.main===module)console.table(curveEnvelope());
