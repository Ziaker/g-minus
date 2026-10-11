/* P12 V2 — PISTA DE TESTE (não definitiva; P09 continua responsável pelos circuitos).
   Planta 2D (retas e arcos) + perfil de altitude + loop vertical + salto, reamostrada a passo
   constante. Referenciais por transporte paralelo (sem eixo vertical global), com correção de
   holonomia distribuída e inclinação lateral aplicada depois. 1 u = 1 m. */
const TRACK_DS=4;                     // passo de amostragem (m)
const ROAD_HW=24;                     // meia largura padrão (m)
const TF={barrierL:1,barrierR:2,gap:4,dash:8,recharge:16,openEdge:32,loop:64,narrow:128,ramp:256};
// Planta: S = reta, A = arco (graus, + = esquerda). tags guiam metadados e sinalização.
const TRACK_PLAN=[
 {k:'S',len:1000,tags:['start']},
 {k:'A',deg:-40,R:1300,bank:10,name:'Curva Ampla'},
 {k:'S',len:700,tags:['dash']},
 {k:'A',deg:115,R:420,bank:26,name:'Grampo do Drift'},
 {k:'S',len:420,solve:true},
 {k:'A',deg:32,R:700,bank:12,narrow:true,name:'Chicane E'},
 {k:'A',deg:-32,R:700,bank:12,narrow:true,name:'Chicane D'},
 {k:'S',len:900,tags:['openEdge']},
 {k:'S',len:300,tags:['loopIn']},
 {k:'L',R:115,offset:30,name:'Loop Vertical'},
 {k:'S',len:320},
 {k:'S',len:1400,tags:['recharge']},
 {k:'A',deg:125,R:760,bank:30,name:'Curva Inclinada'},
 {k:'S',len:260,solve:true},
 {k:'S',len:150,tags:['ramp']},
 {k:'S',len:340,tags:['gap'],name:'Salto'},
 {k:'S',len:520,tags:['landing']},
 {k:'A',deg:70,R:520,bank:22,name:'Curva Descendente'},
 {k:'S',len:1100,tags:['dash']},
 {k:'A',deg:-40,R:900,bank:14,name:'Esse Final D'},
 {k:'A',deg:40,R:650,bank:12,name:'Esse Final E'},
 {k:'S',len:400},
 {k:'A',deg:90,R:900,bank:14,name:'Curva de Retorno'},
 {k:'S',len:300}
];
function buildTrack(){
 // 1) planta + altitude provisória em passos finos
 const fine=[];let x=0,z=0,th=0,sp=0;const marks=[];
 let si=0;const push=()=>fine.push({x,y:0,z,th,sp,si});
 // solução de fechamento: duas retas marcadas com solve recebem comprimentos extras
 const plan=TRACK_PLAN.map(o=>({...o}));
 const walk=(dry)=>{x=0;z=0;th=0;sp=0;let lx=0,lz=0;const out=[];
  for(const seg of plan){
   if(seg.k==='S'){const n=Math.ceil(seg.len/1);for(let i=0;i<n;i++){const d=seg.len/n;x+=Math.sin(th)*d;z+=Math.cos(th)*d;sp+=d;}}
   else if(seg.k==='A'){const a=seg.deg*D2R,len=Math.abs(a)*seg.R,n=Math.ceil(len);for(let i=0;i<n;i++){const d=len/n;th+=a/n/2;x+=Math.sin(th)*d;z+=Math.cos(th)*d;th+=a/n/2;sp+=d;}}
   else if(seg.k==='L'){x+=-Math.cos(th)*seg.offset;z+=Math.sin(th)*seg.offset;}
  }return {x,z,th};};
 // ajuste das duas retas 'solve' para fechar a planta exatamente
 const solveIdx=plan.map((s,i)=>s.solve?i:-1).filter(i=>i>=0);
 for(let iter=0;iter<4;iter++){
  const end=walk();
  // a heading de cada reta 'solve' é a heading acumulada até ela (retas não giram)
  const h=[];{let t=0;for(const [i,seg] of plan.entries()){if(solveIdx.includes(i))h.push(t);if(seg.k==='A')t+=seg.deg*D2R;}}
  const u=h.map(t=>[Math.sin(t),Math.cos(t)]),det=u[0][0]*u[1][1]-u[0][1]*u[1][0];
  const da=(-end.x*u[1][1]+end.z*u[1][0])/det,db=(-u[0][0]*end.z+u[0][1]*end.x)/det;
  plan[solveIdx[0]].len+=da;plan[solveIdx[1]].len+=db;
  if(Math.hypot(end.x,end.z)<1e-6)break;
 }
 if(typeof DEBUG_TRACK!=='undefined')console.log(solveIdx.map(i=>plan[i].len));for(const i of solveIdx)if(plan[i].len<100)throw Error('fechamento da pista inválido');
 // 2) gera pontos finos (passo 1 m) com marcações de segmento
 x=0;z=0;th=0;sp=0;const segs=[];
 for(const [index,seg] of plan.entries()){
  const start=sp;si=index;
  if(seg.k==='S'){const n=Math.max(1,Math.round(seg.len));for(let i=0;i<n;i++){const d=seg.len/n;push();x+=Math.sin(th)*d;z+=Math.cos(th)*d;sp+=d;}}
  else if(seg.k==='A'){const a=seg.deg*D2R,len=Math.abs(a)*seg.R,n=Math.max(1,Math.round(len));for(let i=0;i<n;i++){const d=len/n;push();th+=a/n/2;x+=Math.sin(th)*d;z+=Math.cos(th)*d;th+=a/n/2;sp+=d;}}
  else if(seg.k==='L'){// loop vertical: volta completa no plano (frente, cima) com deslocamento lateral
   const f=[Math.sin(th),0,Math.cos(th)],l=[Math.cos(th),0,-Math.sin(th)],n=Math.round(TAU*seg.R);
   for(let i=0;i<n;i++){const ph=i/n*TAU,w=ease.smooth(i/n);fine.push({x:x+f[0]*seg.R*Math.sin(ph)-l[0]*seg.offset*w,y:seg.R*(1-Math.cos(ph)),z:z+f[2]*seg.R*Math.sin(ph)-l[2]*seg.offset*w,th,sp,si,loop:true});}
   x+=-l[0]*seg.offset;z+=-l[2]*seg.offset;}
  segs.push({...seg,sp0:start,sp1:sp});
 }
 const planLen=sp;
 // 3) perfil de altitude em função da distância de planta (Catmull-Rom entre pontos-chave)
 const segBy=tag=>segs.find(s=>s.tags&&s.tags.includes(tag));
 const ramp=segBy('ramp'),gap=segBy('gap'),landing=segBy('landing'),spiral=segs.find(s=>s.name==='Curva Descendente'),chic=segs.find(s=>s.name==='Chicane E');
 const keys=[[0,0],[segs[1].sp1,0],[segs[3].sp1,0],[chic.sp0,18],[chic.sp1+500,42],[segBy('openEdge').sp1,42],[segBy('recharge').sp0,42],[segBy('recharge').sp1,40],
  [ramp.sp0,58,0],[ramp.sp1,66,.07],[gap.sp0+gap.len*.5,50],[landing.sp0,44,-.04],[landing.sp1,40,0],[spiral.sp0+ (spiral.sp1-spiral.sp0)*.5,20],[spiral.sp1,4],[planLen-900,0],[planLen,0]];
 keys.sort((a,b)=>a[0]-b[0]);
 const elev=s=>{s=clamp(s,0,planLen);let i=0;while(i<keys.length-2&&keys[i+1][0]<s)i++;const p0=keys[Math.max(0,i-1)],p1=keys[i],p2=keys[i+1],p3=keys[Math.min(keys.length-1,i+2)];
  const h=Math.max(1e-6,p2[0]-p1[0]),t=(s-p1[0])/h,m1=(p1.length>2?p1[2]:(p2[1]-p0[1])/Math.max(1e-6,p2[0]-p0[0]))*h,m2=(p2.length>2?p2[2]:(p3[1]-p1[1])/Math.max(1e-6,p3[0]-p1[0]))*h;
  const t2=t*t,t3=t2*t;return (2*t3-3*t2+1)*p1[1]+(t3-2*t2+t)*m1+(-2*t3+3*t2)*p2[1]+(t3-t2)*m2;};
 for(const p of fine)p.y+=elev(p.sp);
 // 4) reamostragem a passo constante no comprimento 3D
 const cum=[0];for(let i=1;i<=fine.length;i++){const a=fine[i-1],b=fine[i%fine.length];cum.push(cum[i-1]+Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z));}
 const total=cum[fine.length],n=Math.round(total/TRACK_DS),ds=total/n,L=total;
 const pos=new Float64Array(n*3),T=new Float64Array(n*3),N=new Float64Array(n*3),R=new Float64Array(n*3);
 const bank=new Float64Array(n),hw=new Float64Array(n),curv=new Float64Array(n),flags=new Uint16Array(n),planS=new Float64Array(n),segIndex=new Int16Array(n);
 let j=0;
 for(let i=0;i<n;i++){const s=i*ds;while(cum[j+1]<s)j++;const a=fine[j],b=fine[(j+1)%fine.length],f=(s-cum[j])/Math.max(1e-9,cum[j+1]-cum[j]);
  pos[i*3]=lerp(a.x,b.x,f);pos[i*3+1]=lerp(a.y,b.y,f);pos[i*3+2]=lerp(a.z,b.z,f);planS[i]=a.sp;segIndex[i]=a.si;
  const sg=segs[segIndex[i]]||segs[0];if(a.loop)flags[i]|=TF.loop;curv[i]=sg.k==='A'?Math.sign(sg.deg)/sg.R:0;}
 // 5) tangentes (diferenças centrais) e transporte paralelo do normal
 const P=i=>{i=wrap(i,n);return [pos[i*3],pos[i*3+1],pos[i*3+2]];};
 for(let i=0;i<n;i++){const t=vec.norm(vec.sub(P(i+1),P(i-1)));T.set(t,i*3);}
 let up=vec.ortho([0,1,0],[T[0],T[1],T[2]]);const N0=up.slice();
 for(let i=0;i<n;i++){const t=[T[i*3],T[i*3+1],T[i*3+2]];if(i>0){const tp=[T[i*3-3],T[i*3-2],T[i*3-1]],ax=vec.cross(tp,t),sn=vec.len(ax);if(sn>1e-9)up=vec.rot(up,vec.scale(ax,1/sn),Math.atan2(sn,vec.dot(tp,t)));up=vec.ortho(up,t);}N.set(up,i*3);}
 // holonomia: diferença angular entre o normal transportado ao fim e o inicial
 {const tl=[T[n*3-3],T[n*3-2],T[n*3-1]],t0=[T[0],T[1],T[2]],ax=vec.cross(tl,t0),sn=vec.len(ax);let end=[N[n*3-3],N[n*3-2],N[n*3-1]];if(sn>1e-9)end=vec.rot(end,vec.scale(ax,1/sn),Math.atan2(sn,vec.dot(tl,t0)));end=vec.ortho(end,t0);
  const tw=Math.atan2(vec.dot(vec.cross(end,N0),t0),vec.dot(end,N0));
  for(let i=0;i<n;i++){const t=[T[i*3],T[i*3+1],T[i*3+2]],nv=vec.rot([N[i*3],N[i*3+1],N[i*3+2]],t,tw*i/n);N.set(vec.ortho(nv,t),i*3);}}
 // 6) perfis suavizados: inclinação e meia largura por média móvel circular
 const rawBank=new Float64Array(n),rawHw=new Float64Array(n);
 for(let i=0;i<n;i++){const sg=segs[segIndex[i]]||segs[0];rawBank[i]=sg.k==='A'?(sg.bank||0)*D2R*Math.sign(sg.deg):0;rawHw[i]=sg.narrow?15:ROAD_HW;}
 const smoothArr=(src,win)=>{const out=new Float64Array(n),w=Math.round(win/ds);let acc=0;for(let k=-w;k<=w;k++)acc+=src[wrap(k,n)];for(let i=0;i<n;i++){out[i]=acc/(2*w+1);acc+=src[wrap(i+w+1,n)]-src[wrap(i-w,n)];}return out;};
 bank.set(smoothArr(rawBank,180));hw.set(smoothArr(rawHw,120));curv.set(smoothArr(curv,60));
 for(let i=0;i<n;i++){const t=[T[i*3],T[i*3+1],T[i*3+2]];let nv=[N[i*3],N[i*3+1],N[i*3+2]];nv=vec.rot(nv,t,bank[i]);N.set(nv,i*3);R.set(vec.norm(vec.cross(t,nv)),i*3);}
 // 7) marcações funcionais (barreiras, vão do salto, placas, recarga, borda aberta)
 const sAt=sp0=>{for(let i=0;i<n;i++)if(planS[i]>=sp0)return i*ds;return 0;};
 const features={corners:[],loop:null,jump:null,dash:[],recharge:null,openEdge:null,sectors:[],gates:[]};
 for(const sg of segs){const s0=sAt(sg.sp0),s1=sg.sp1>=planLen?L:sAt(sg.sp1);
  if(sg.k==='A'){const sev=sg.R<450?5:sg.R<560?4:sg.R<700?3:sg.R<950?2:1;features.corners.push({name:sg.name,s0,s1,apex:(s0+s1)/2,dir:Math.sign(sg.deg),deg:Math.abs(sg.deg),R:sg.R,bank:sg.bank||0,severity:sev,narrow:!!sg.narrow});}
  if(sg.k==='L')features.loop={name:sg.name,s0:sAt(sg.sp0),s1:sAt(sg.sp0)+TAU*sg.R*0+0,R:sg.R};
  if(sg.tags&&sg.tags.includes('gap'))features.jump={name:'Salto',lip:s0,land:s1,gap:s1-s0};
  if(sg.tags&&sg.tags.includes('dash'))for(const f of [.35,.62])features.dash.push({s:s0+(s1-s0)*f,lane0:-10,lane1:10,len:28});
  if(sg.tags&&sg.tags.includes('recharge'))features.recharge={s0:s0+120,s1:s1-120,laneMin:-ROAD_HW+2,laneMax:-ROAD_HW+12};
  if(sg.tags&&sg.tags.includes('openEdge'))features.openEdge={s0:s0+60,s1:s1-60,side:1};
 }
 // fronteiras do loop pelo próprio sinalizador (comprimento 3D real)
 {let a=-1,b=-1;for(let i=0;i<n;i++)if(flags[i]&TF.loop){if(a<0)a=i;b=i;}features.loop.s0=a*ds;features.loop.s1=(b+1)*ds;}
 // a rampa termina na borda do vão
 features.jump.rampS0=features.jump.lip-150;
 for(let i=0;i<n;i++){const s=i*ds;let f=flags[i]|TF.barrierL|TF.barrierR;
  if(s>=features.jump.lip&&s<features.jump.land)f=(f|TF.gap)&~(TF.barrierL|TF.barrierR);
  if(s>=features.jump.rampS0&&s<features.jump.lip)f|=TF.ramp;
  if(s>=features.openEdge.s0&&s<features.openEdge.s1)f=(f|TF.openEdge)&~TF.barrierR;
  if(s>=features.recharge.s0&&s<features.recharge.s1)f|=TF.recharge;
  for(const d of features.dash)if(s>=d.s&&s<d.s+d.len)f|=TF.dash;
  if(hw[i]<ROAD_HW-1)f|=TF.narrow;
  flags[i]=f;}
 features.sectors=[0,L/3,2*L/3].map((s,i)=>({index:i+1,s}));
 // limite de velocidade de curva (aceleração lateral de teste 140 m/s²) suavizado e antecipado
 const vlim=new Float64Array(n),A_LAT=140,V_CAP=420;
 for(let i=0;i<n;i++){const k=Math.abs(curv[i]);vlim[i]=k>1e-6?Math.min(V_CAP,Math.sqrt(A_LAT/k)):V_CAP;}
 // antecipação de frenagem: v² ≤ vlim² + 2·a·Δs (a = 60 m/s²) percorrido para trás duas voltas
 for(let pass=0;pass<2;pass++)for(let i=n-1;i>=0;i--){const nx=vlim[(i+1)%n];vlim[i]=Math.min(vlim[i],Math.sqrt(nx*nx+2*60*ds));}
 return {L,n,ds,pos,T,N,R,bank,hw,curv,flags,vlim,features,segs,planLen};
}
const TRACK=buildTrack();
// amostragem contínua em s (qualquer real; volta = s mod L)
function trackIndex(s){const u=wrap(s,TRACK.L)/TRACK.ds,i=Math.floor(u);return [i%TRACK.n,(i+1)%TRACK.n,u-i];}
function trackFrame(s){const [i,j,f]=trackIndex(s);
 const p=[lerp(TRACK.pos[i*3],TRACK.pos[j*3],f),lerp(TRACK.pos[i*3+1],TRACK.pos[j*3+1],f),lerp(TRACK.pos[i*3+2],TRACK.pos[j*3+2],f)];
 const t=vec.norm([lerp(TRACK.T[i*3],TRACK.T[j*3],f),lerp(TRACK.T[i*3+1],TRACK.T[j*3+1],f),lerp(TRACK.T[i*3+2],TRACK.T[j*3+2],f)]);
 const nn=vec.ortho([lerp(TRACK.N[i*3],TRACK.N[j*3],f),lerp(TRACK.N[i*3+1],TRACK.N[j*3+1],f),lerp(TRACK.N[i*3+2],TRACK.N[j*3+2],f)],t);
 return {p,T:t,N:nn,R:vec.cross(t,nn),hw:lerp(TRACK.hw[i],TRACK.hw[j],f),bank:lerp(TRACK.bank[i],TRACK.bank[j],f),curv:lerp(TRACK.curv[i],TRACK.curv[j],f),flags:TRACK.flags[f<.5?i:j],vlim:lerp(TRACK.vlim[i],TRACK.vlim[j],f)};}
// amostradores sem alocação (laço da simulação)
let _ti=0,_tj=0,_tf=0;
function trackAt(s){let u=s%TRACK.L;if(u<0)u+=TRACK.L;u/=TRACK.ds;const i=Math.floor(u);_tf=u-i;_ti=i%TRACK.n;_tj=(_ti+1)%TRACK.n;}
function trackFlags(s){trackAt(s);return TRACK.flags[_ti];}
function trackVlim(s){trackAt(s);return TRACK.vlim[_ti]+(TRACK.vlim[_tj]-TRACK.vlim[_ti])*_tf;}
function trackHw(s){trackAt(s);return TRACK.hw[_ti]+(TRACK.hw[_tj]-TRACK.hw[_ti])*_tf;}
function trackCurv(s){trackAt(s);return TRACK.curv[_ti]+(TRACK.curv[_tj]-TRACK.curv[_ti])*_tf;}
