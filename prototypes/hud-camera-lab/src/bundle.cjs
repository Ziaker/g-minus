/* @gminus-approved-craft-geometry:begin v1 */
const D2R=Math.PI/180, TAU=Math.PI*2;
const PARTS=['nose','cockpit','wings','engines'];
const PART_LABEL={nose:'Proa',cockpit:'Cabine',wings:'Asas',engines:'Motores'};
const ROLES={paint:0,secondary:1,accent:2,structure:3,glass:4,energy:5,marking:6};

/* ---------- matemática ---------- */
const m4={
 I:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
 mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
 T:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
 S:(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
 RX(a){const c=Math.cos(a),s=Math.sin(a);return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];},
 RY(a){const c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];},
 RZ(a){const c=Math.cos(a),s=Math.sin(a);return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];}
};
// M(a,b,c): aplica a, depois b, depois c.
const M=(...ops)=>ops.reduce((acc,op)=>m4.mul(op,acc),m4.I());
const ap=(m,v)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function triNormal(a,b,c){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz);return l>0?[nx/l,ny/l,nz/l,l]:[0,1,0,0];}
function signedArea2(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1];}return a/2;}
function earclip(pts){
 const n=pts.length;if(n<3)return [];
 const sg=signedArea2(pts)>=0?1:-1,idx=[...Array(n).keys()],out=[];
 const cr=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const inside=(p,a,b,c)=>cr(a,b,p)*sg>1e-12&&cr(b,c,p)*sg>1e-12&&cr(c,a,p)*sg>1e-12;
 let guard=0;
 while(idx.length>3&&guard++<800){
  let clipped=false;
  for(let k=0;k<idx.length;k++){
   const a=idx[(k+idx.length-1)%idx.length],b=idx[k],c=idx[(k+1)%idx.length];
   if(cr(pts[a],pts[b],pts[c])*sg<=1e-12)continue;
   let bad=false;for(const m of idx){if(m===a||m===b||m===c)continue;if(inside(pts[m],pts[a],pts[b],pts[c])){bad=true;break;}}
   if(bad)continue;out.push([a,b,c]);idx.splice(k,1);clipped=true;break;
  }
  if(!clipped)break;
 }
 if(idx.length===3)out.push([idx[0],idx[1],idx[2]]);
 else for(let k=1;k<idx.length-1;k++)out.push([idx[0],idx[k],idx[k+1]]);
 return out;
}
function insetToward(p,c,d){const dx=p[0]-c[0],dy=p[1]-c[1],l=Math.hypot(dx,dy);if(l<1e-9)return [p[0],p[1]];const k=Math.max(.25,1-d/l);return [c[0]+dx*k,c[1]+dy*k];}
function centroid2(p){return [p.reduce((s,v)=>s+v[0],0)/p.length,p.reduce((s,v)=>s+v[1],0)/p.length];}

/* ---------- construtor de malhas (todas fechadas, faces planas, orientação corrigida por volume) ---------- */
class Builder{
 constructor(){this.shapes=[];this.stack=[m4.I()];}
 get xf(){return this.stack[this.stack.length-1];}
 with(m,fn){this.stack.push(m4.mul(this.xf,m));try{return fn();}finally{this.stack.pop();}}
 sym(fn){fn(1);this.with(m4.S(-1,1,1),()=>fn(-1));}
 add(part,role,tris,kind,closed=true){
  const m=this.xf,T=[];
  for(const t of tris){const a=ap(m,t[0]),b=ap(m,t[1]),c=ap(m,t[2]);if(triNormal(a,b,c)[3]<1e-9)continue;T.push([a,b,c]);}
  if(!T.length)return null;
  let vol=0;for(const [a,b,c] of T)vol+=a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);vol/=6;
  if(closed&&vol<0){for(const t of T){const s=t[1];t[1]=t[2];t[2]=s;}vol=-vol;}
  const nV=T.length*3,pos=new Float32Array(nV*3),nor=new Float32Array(nV*3),onr=new Float32Array(nV*3);
  let o=0;for(const [a,b,c] of T){const n=triNormal(a,b,c);for(const v of [a,b,c]){pos[o]=v[0];pos[o+1]=v[1];pos[o+2]=v[2];nor[o]=n[0];nor[o+1]=n[1];nor[o+2]=n[2];o+=3;}}
  const key=i=>Math.round(pos[i]*1e4)+','+Math.round(pos[i+1]*1e4)+','+Math.round(pos[i+2]*1e4),acc=new Map();
  for(let i=0;i<nV*3;i+=3){const k=key(i),s=acc.get(k)||[0,0,0];s[0]+=nor[i];s[1]+=nor[i+1];s[2]+=nor[i+2];acc.set(k,s);}
  for(let i=0;i<nV*3;i+=3){const s=acc.get(key(i)),l=Math.hypot(s[0],s[1],s[2])||1;onr[i]=s[0]/l;onr[i+1]=s[1]/l;onr[i+2]=s[2]/l;}
  const shape={part,role:ROLES[role],roleName:role,kind,closed,positions:pos,normals:nor,onormals:onr,volume:vol};
  this.shapes.push(shape);return shape;
 }
 // anel superelíptico: w/h semi-eixos, hb semi-eixo inferior, n expoente (2=elipse, <2 quinado, >2 quadrado), pinch estreita o topo.
 ring(r,seg,phase){
  const pts=[],e=2/(r.n||2);
  for(let i=0;i<seg;i++){
   const th=phase+TAU*i/seg,c=Math.cos(th),s=Math.sin(th);
   let x=Math.sign(c)*Math.pow(Math.abs(c),e)*r.w;
   const hh=s>=0?r.h:(r.hb??r.h);
   const y=Math.sign(s)*Math.pow(Math.abs(s),e)*hh;
   if(r.pinch&&y>0)x*=1-r.pinch*(y/r.h);
   if(r.flare&&y<0)x*=1+r.flare*(-y/hh);
   pts.push([(r.x||0)+x,(r.y||0)+y,r.z]);
  }
  return pts;
 }
 loft(part,role,rings,{seg=10,phase=0}={}){
  const rows=rings.map(r=>r.point?{pt:[r.x||0,r.y||0,r.z]}:{pts:this.ring(r,seg,phase),c:[r.x||0,r.y||0,r.z]}),tris=[];
  for(let k=0;k<rows.length-1;k++){
   const A=rows[k],B=rows[k+1];
   for(let i=0;i<seg;i++){const j=(i+1)%seg;
    if(A.pt&&B.pts)tris.push([A.pt,B.pts[j],B.pts[i]]);
    else if(A.pts&&B.pt)tris.push([A.pts[i],A.pts[j],B.pt]);
    else if(A.pts&&B.pts)tris.push([A.pts[i],A.pts[j],B.pts[j]],[A.pts[i],B.pts[j],B.pts[i]]);}
  }
  const f=rows[0],l=rows[rows.length-1];
  if(f.pts)for(let i=0;i<seg;i++){const j=(i+1)%seg;tris.push([f.c,f.pts[j],f.pts[i]]);}
  if(l.pts)for(let i=0;i<seg;i++){const j=(i+1)%seg;tris.push([l.c,l.pts[i],l.pts[j]]);}
  this.add(part,role,tris,'loft');
  return {rows,seg,phase};
 }
 // faixa gráfica sobre as facetas de um loft (sem contorno, sem arestas vetoriais)
 loftStripe(part,role,lo,theta,half,k0,k1,lift=.014){
  const at=(row,th)=>{
   let t=((th-lo.phase)/TAU)*lo.seg;t=((t%lo.seg)+lo.seg)%lo.seg;
   const i=Math.floor(t)%lo.seg,f=t-Math.floor(t),j=(i+1)%lo.seg,a=row.pts[i],b=row.pts[j];
   const p=[lerp(a[0],b[0],f),lerp(a[1],b[1],f),a[2]];
   let nx=b[1]-a[1],ny=-(b[0]-a[0]);const nl=Math.hypot(nx,ny)||1;nx/=nl;ny/=nl;
   if(nx*(p[0]-row.c[0])+ny*(p[1]-row.c[1])<0){nx=-nx;ny=-ny;}
   return [p[0]+nx*lift,p[1]+ny*lift,p[2]];
  };
  const ths=[theta-half,theta,theta+half],tris=[];
  for(let k=k0;k<k1;k++){
   const A=lo.rows[k],B=lo.rows[k+1];if(!A.pts||!B.pts)continue;
   const a=ths.map(t=>at(A,t)),b=ths.map(t=>at(B,t));
   for(let s=0;s<2;s++)tris.push([a[s],a[s+1],b[s+1]],[a[s],b[s+1],b[s]]);
  }
  this.add(part,role,tris,'stripe',false);
 }
 // varredura genérica de um perfil 2D ao longo de um eixo; estações {a,du,dv,s}
 sweep(part,role,prof,stations,axis='x',kind='prism'){
  const c=centroid2(prof);
  const mk=(u,v,a)=>axis==='x'?[a,v,u]:axis==='z'?[u,v,a]:[u,a,v];
  const rows=stations.map(st=>prof.map(p=>{const q=st.ins?insetToward(p,c,st.ins):p;return mk(q[0]+(st.du||0),q[1]+(st.dv||0),st.a);}));
  const tris=[],n=prof.length;
  for(let k=0;k<rows.length-1;k++)for(let i=0;i<n;i++){const j=(i+1)%n,A=rows[k],B=rows[k+1];tris.push([A[i],A[j],B[j]],[A[i],B[j],B[i]]);}
  const cap=earclip(prof),f=rows[0],l=rows[rows.length-1];
  for(const [a,b,cc] of cap){tris.push([f[cc],f[b],f[a]]);tris.push([l[a],l[b],l[cc]]);}
  this.add(part,role,tris,kind);
 }
 prism(part,role,prof,{axis='x',a0,a1,bevel=0,ins}={}){
  const span=Math.abs(a1-a0),b=Math.min(bevel,span*.3),sg=a1>=a0?1:-1,d=ins??b*1.6;
  const st=b>0?[{a:a0,ins:d},{a:a0+sg*b},{a:a1-sg*b},{a:a1,ins:d}]:[{a:a0},{a:a1}];
  this.sweep(part,role,prof,st,axis);
 }
 // placa horizontal com chanfro superior (técnica 'poly' da v6); vértices [x,z,espessura?]
 slab(part,role,poly,{y=0,t=.1,bevel=.06}={}){
  const P=poly.map(p=>[p[0],p[1]]),c=centroid2(P),th=poly.map(p=>p[2]??t);
  const top=P.map((p,i)=>{const q=insetToward(p,c,bevel);return [q[0],y+th[i]*.5,q[1]];});
  const rim=P.map((p,i)=>[p[0],y+th[i]*.29,p[1]]),bot=P.map((p,i)=>[p[0],y-th[i]*.5,p[1]]);
  const tris=[],n=P.length;
  for(const [a,b,cc] of earclip(P)){tris.push([top[a],top[b],top[cc]]);tris.push([bot[cc],bot[b],bot[a]]);}
  for(let i=0;i<n;i++){const j=(i+1)%n;tris.push([top[i],rim[i],rim[j]],[top[i],rim[j],top[j]],[rim[i],bot[i],bot[j]],[rim[i],bot[j],rim[j]]);}
  this.add(part,role,tris,'plate');
 }
 // revolução de um perfil fechado [r,z] (r>0) em torno do eixo z local → anel/toroide fechado
 lathe(part,role,prof,{seg=16,phase=0,cx=0,cy=0}={}){
  const rows=prof.map(([r,z])=>{const out=[];for(let i=0;i<seg;i++){const th=phase+TAU*i/seg;out.push([cx+r*Math.cos(th),cy+r*Math.sin(th),z]);}return out;}),tris=[],n=rows.length;
  for(let k=0;k<n;k++){const A=rows[k],B=rows[(k+1)%n];for(let i=0;i<seg;i++){const j=(i+1)%seg;tris.push([A[i],A[j],B[j]],[A[i],B[j],B[i]]);}}
  this.add(part,role,tris,'lathe');
 }
 // faixa plana (ribbon da v6) seguindo uma polilinha [x,y,z]
 ribbon(part,role,pts,width){
  const h=width/2,tris=[];
  for(let i=0;i<pts.length-1;i++){
   const [x,y,z]=pts[i],[xx,yy,zz]=pts[i+1],dx=xx-x,dz=zz-z,l=Math.hypot(dx,dz)||1,nx=-dz/l*h,nz=dx/l*h;
   tris.push([[x+nx,y,z+nz],[x-nx,y,z-nz],[xx-nx,yy,zz-nz]],[[x+nx,y,z+nz],[xx-nx,yy,zz-nz],[xx+nx,yy,zz+nz]]);
  }
  this.add(part,role,tris,'stripe',false);
 }
 // bocal: carenagem + garganta escura + núcleo de energia (rosto do bocal ligeiramente saliente)
 nozzle(part,{x=0,y=0,z,r,w,h,len=1,n=2,seg=12,phase=0,role='secondary',lip=true}){
  const W=w??r,H=h??r;
  this.loft(part,role,[{z:z+len,x,y,w:W*.8,h:H*.8,n},{z:z+len*.5,x,y,w:W,h:H,n},{z:z+.12,x,y,w:W*1.03,h:H*1.03,n},{z,x,y,w:W*1.1,h:H*1.1,n}],{seg,phase});
  this.loft(part,'structure',[{z:z+.03,x,y,w:W*.88,h:H*.88,n},{z:z-.035,x,y,w:W*.84,h:H*.84,n}],{seg,phase});
  this.loft(part,'energy',[{z:z-.02,x,y,w:W*.6,h:H*.6,n},{z:z-.075,x,y,w:W*.5,h:H*.5,n}],{seg,phase});
  if(lip&&n===2)this.lathe(part,'accent',[[W*1.1,z+.2],[W*1.19,z+.15],[W*1.19,z+.03],[W*1.12,z-.005]],{seg:Math.max(seg,14),cx:x,cy:y});
 }
 canopy(part,{z,y,len,w,h,seg=10,phase=Math.PI/10,n=2,front=.55,frame=true}){
  const lo=this.loft(part,'glass',[
   {z:z+len*front,y:y-.02,point:true},
   {z:z+len*front*.55,y:y+h*.08,w:w*.62,h:h*.62,hb:.07,n},
   {z,y,w,h,hb:.09,n},
   {z:z-len*(1-front)*.62,y:y-.01,w:w*.82,h:h*.72,hb:.09,n},
   {z:z-len*(1-front),y:y-.05,point:true}],{seg,phase});
  if(frame)this.loftStripe(part,'marking',lo,Math.PI/2,.07,1,3,.012);
  return lo;
 }
}
// interpolação de perfil de casco a partir dos anéis (para posicionar peças sobre a superfície)
function hullProfile(rings){
 const R=rings.filter(r=>!r.point).slice().sort((a,b)=>b.z-a.z);
 const f=(z,fn)=>{if(z>=R[0].z)return fn(R[0]);for(let i=0;i<R.length-1;i++){const a=R[i],b=R[i+1];if(z<=a.z&&z>=b.z){const t=(a.z-z)/((a.z-b.z)||1);return lerp(fn(a),fn(b),t);}}return fn(R[R.length-1]);};
 return {top:z=>f(z,r=>(r.y||0)+r.h),bot:z=>f(z,r=>(r.y||0)-(r.hb??r.h)),half:z=>f(z,r=>r.w),mid:z=>f(z,r=>r.y||0)};
}

/* ==========================================================================
   NAVES E ALTERNATIVAS — construtores geométricos (aprovados em 10/10/2026 — baseline = padrões)
   Convenção: +Z = proa, +Y = topo, X = lateral. Unidades do laboratório v6.
   ========================================================================== */
const ALL=PARTS;
const P=(id,label,min,max,def,o={})=>({id,label,min,max,def,step:o.step??.01,unit:o.unit??'×',affects:o.affects??ALL});
const PI=Math.PI;

/* ---- BLUE FALCON ---- */
function falconA(p,S){
 const L=p.length,W=p.width,H=p.height,NL=p.noseLength,E=p.engineSize;
 const zN=2.0*L,tip=zN+1.55*NL;
 const rg=[
  {z:tip,y:-.03,point:true},
  {z:zN+.8*NL,y:-.02,w:.25*W,h:.12*H,hb:.09*H,n:1.25},
  {z:zN,y:0,w:.5*W,h:.24*H,hb:.18*H,n:1.5},
  {z:.85*L,y:.01,w:.68*W,h:.33*H,hb:.24*H,n:1.85},
  {z:-.75*L,y:.02,w:.76*W,h:.36*H,hb:.27*H,n:2.3},
  {z:-1.95*L,y:.02,w:.74*W,h:.33*H,hb:.28*H,n:2.8},
  {z:-2.8*L,y:.02,w:.6*W,h:.26*H,hb:.24*H,n:3.2}];
 const hp=hullProfile(rg),o={seg:8,phase:0};
 const nose=S.loft('nose','paint',rg.slice(0,4),o);
 S.loft('cockpit','paint',rg.slice(3,6),o);
 S.loft('engines','secondary',rg.slice(5),o);
 S.loftStripe('nose','accent',nose,0,.09,1,3);S.loftStripe('nose','accent',nose,PI,.09,1,3);
 S.loftStripe('nose','marking',nose,PI/2,.07,1,3);
 // tomadas de ar laterais sob a raiz da asa
 S.sym(()=>S.prism('nose','structure',[[.95*L,-.17*H],[.95*L,.09*H],[.1*L,.12*H],[-.2*L,-.2*H]],{axis:'x',a0:.48*W,a1:.86*W,bevel:.03}));
 // espinha dorsal
 S.loft('cockpit','secondary',[
  {z:.1*L,y:hp.top(.1*L)-.05,point:true},
  {z:-.5*L,y:hp.top(-.5*L)-.03,w:.12*W,h:.13*H,hb:.08,n:1.5},
  {z:-1.9*L,y:hp.top(-1.9*L)-.03,w:.14*W,h:.12*H,hb:.08,n:1.5},
  {z:-2.7*L,y:hp.top(-2.7*L)-.05,w:.08*W,h:.06*H,hb:.06,n:1.5}],{seg:6,phase:PI/2});
 const cs=p.cockpitSize,zc=.55*L+p.cockpitPos;
 S.canopy('cockpit',{z:zc,y:hp.top(zc)-.06,len:1.35*cs,w:.25*cs*Math.sqrt(W),h:.25*cs});
 // asa delta com quebra (strake + painel externo)
 const s=p.span,sw=p.sweep*D2R,cx=.75*s,tx=2.2*s,crz=-.15*L,tle=crz-(tx-cx)*Math.tan(sw);
 S.sym(()=>S.with(M(m4.RZ(p.dihedral*D2R),m4.T(.5*W,-.06*H,0)),()=>{
  S.slab('wings','paint',[[0,.9*L,.17*H],[cx,crz,.14*H],[tx,tle,.05],[tx+.06,tle-.55,.05],[0,-2.2*L,.17*H]],{bevel:.06});
  S.ribbon('wings','accent',[[cx*.95,.07*H+.02,crz-.32],[tx-.1,.045,tle-.2]],.07);
  S.slab('wings','secondary',[[tx-.06,tle+.1,.08],[tx+.16,tle-.12,.08],[tx+.18,tle-.64,.08],[tx-.03,tle-.62,.08]],{bevel:.025});
  const fx=cx+.45*(tx-cx),fz=lerp(crz,tle,.45);
  S.with(m4.T(fx,0,0),()=>S.prism('wings','secondary',[[fz+.05,0],[fz-.75,0],[fz-.85,.13],[fz-.12,.11]],{axis:'x',a0:-.018,a1:.018,bevel:.006}));
 }));
 S.sym(()=>S.prism('cockpit','structure',[[-.35*L,hp.top(-.35*L)-.06],[-.35*L,hp.top(-.35*L)+.035],[-1.05*L,hp.top(-1.05*L)+.01],[-1.15*L,hp.top(-1.15*L)-.06]],{axis:'x',a0:.24*W,a1:.36*W,bevel:.012}));
 // estabilizadores gêmeos inclinados
 const fh=p.finHeight,fc=p.finCant*D2R,zf=-2.2*L;
 S.sym(()=>S.with(M(m4.RZ(-fc),m4.T(.4*W,hp.top(zf)-.14*H,0)),()=>{
  S.prism('wings','paint',[[-1.4*L,0],[-2.3*L,.95*fh],[-2.85*L,.95*fh],[-2.8*L,0]],{axis:'x',a0:-.045,a1:.045,bevel:.015});
  S.prism('wings','accent',[[-2.17*L,.8*fh],[-2.3*L,.98*fh],[-2.87*L,.98*fh],[-2.84*L,.8*fh]],{axis:'x',a0:-.058,a1:.058,bevel:.012});
 }));
 // propulsão dupla + quilhas ventrais + placa inferior
 S.sym(()=>S.nozzle('engines',{x:Math.max(.36*W,.3*E),y:0,z:-2.95*L,r:.25*E,len:1.25,seg:12}));
 S.sym(()=>S.with(M(m4.RZ(.45),m4.T(.3*W,hp.bot(-2.3*L)+.06,0)),()=>S.prism('engines','structure',[[-1.8*L,0],[-2.75*L,0],[-2.95*L,-.34],[-2.45*L,-.3]],{axis:'x',a0:-.035,a1:.035,bevel:.01})));
 S.slab('cockpit','structure',[[-.42*W,.6*L],[.42*W,.6*L],[.5*W,-1.6*L],[-.5*W,-1.6*L]],{y:hp.bot(-.5*L)+.03,t:.09,bevel:.04});
}
function falconB(p,S){
 const L=p.length,W=p.width,H=p.height,NL=p.noseLength,G=p.boomGap,BL=p.boomLength,E=p.engineSize,th=p.tailHeight;
 const rg=[
  {z:1.9*L+1.3*NL,y:-.06,point:true},
  {z:1.9*L+.55*NL,y:-.04,w:.2*W,h:.14*H,hb:.12*H,n:2},
  {z:1.9*L,y:-.02,w:.36*W,h:.25*H,hb:.2*H,n:2.2},
  {z:.4*L,y:0,w:.5*W,h:.36*H,hb:.26*H,n:2.4},
  {z:-.9*L,y:0,w:.46*W,h:.33*H,hb:.25*H,n:2.4},
  {z:-1.7*L,y:0,w:.28*W,h:.22*H,hb:.18*H,n:2.2}];
 const hp=hullProfile(rg),o={seg:12,phase:0};
 const nose=S.loft('nose','paint',rg.slice(0,3),o);
 S.loft('cockpit','paint',rg.slice(2),o);
 S.loftStripe('nose','marking',nose,PI/2,.12,1,2);
 S.prism('nose','structure',[[1.75*L,hp.bot(1.75*L)+.05],[1.75*L,hp.bot(1.75*L)-.09],[.6*L,hp.bot(.6*L)-.08],[.4*L,hp.bot(.4*L)+.05]],{axis:'x',a0:-.17*W,a1:.17*W,bevel:.03});
 const cs=p.cockpitSize,zc=.75*L+p.cockpitPos;
 S.canopy('cockpit',{z:zc,y:hp.top(zc)-.07,len:1.5*cs,w:.3*cs,h:.3*cs,front:.6});
 S.nozzle('engines',{x:0,y:0,z:-1.78*L,r:.13*E,len:.6,seg:12});
 // vigas laterais (booms) com motores
 const boom=[
  {z:2.45*L*BL,x:G,y:-.05,point:true},
  {z:1.85*L*BL,x:G,y:-.04,w:.16,h:.14*H,hb:.12*H,n:1.8},
  {z:.85*L*BL,x:G,y:-.02,w:.29,h:.26*H,hb:.22*H,n:2.6},
  {z:-1.0*L,x:G,y:0,w:.32,h:.29*H,hb:.25*H,n:3},
  {z:-2.6*L*BL,x:G,y:0,w:.32,h:.28*H,hb:.25*H,n:3},
  {z:-2.95*L*BL,x:G,y:0,w:.28,h:.25*H,hb:.23*H,n:3}];
 const bp=hullProfile(boom),fz=bp.top(-2.4*L*BL)-.08,ft=12*D2R;
 S.sym(()=>{
  const bf=S.loft('wings','paint',boom.slice(0,4),{seg:10,phase:PI/10});
  S.loft('engines','secondary',boom.slice(3),{seg:10,phase:PI/10});
  S.loftStripe('wings','accent',bf,PI/2,.1,1,3);
  S.nozzle('engines',{x:G,y:0,z:-3.02*L*BL,r:.22*E,len:1.1,seg:12});
  S.with(M(m4.RZ(ft),m4.T(G,fz,0)),()=>S.prism('wings','paint',[[-1.85*L*BL,0],[-2.45*L*BL,.85*th],[-2.98*L*BL,.85*th],[-2.95*L*BL,0]],{axis:'x',a0:-.05,a1:.05,bevel:.015}));
  // asa externa + ponta caída
  const s=p.span,sw=p.sweep*D2R,ox=1.35*s,tle=-.05*L-ox*Math.tan(sw);
  S.with(m4.T(G+.18,-.05,0),()=>{
   S.slab('wings','paint',[[-.25,.15*L,.13*H],[ox,tle,.05],[ox+.02,tle-.5,.05],[-.25,-1.15*L,.13*H]],{bevel:.05});
   S.with(M(m4.RZ(-70*D2R),m4.T(ox,0,0)),()=>S.slab('wings','accent',[[0,tle+.05,.05],[.42,tle-.15,.04],[.42,tle-.5,.04],[0,tle-.52,.05]],{bevel:.03}));
  });
 });
 // ponte central e empenagem horizontal ligando as vigas
 S.slab('wings','paint',[[-G,.2*L],[0,.55*L],[G,.2*L],[G,-1.3*L],[0,-1.05*L],[-G,-1.3*L]],{y:-.04,t:.15*H,bevel:.05});
 const fx=G-Math.sin(ft)*.85*th,fy=fz+.85*th*Math.cos(ft);
 S.slab('wings','secondary',[[-fx-.22,-2.4*L*BL],[fx+.22,-2.4*L*BL],[fx+.28,-2.98*L*BL],[-fx-.28,-2.98*L*BL]],{y:fy-.03,t:.09,bevel:.04});
}
function falconC(p,S){
 const L=p.length,W=p.width,H=p.height,NL=p.noseLength,E=p.engineSize,BW=p.bankWidth;
 const rg=[
  {z:2.4*L+1.1*NL,y:-.03,point:true},
  {z:2.4*L+.45*NL,y:-.02,w:.2*W,h:.07*H,hb:.045*H,n:1.3},
  {z:2.4*L,y:-.01,w:.42*W,h:.12*H,hb:.07*H,n:1.35},
  {z:.9*L,y:0,w:.95*W,h:.27*H,hb:.13*H,n:1.45},
  {z:-.6*L,y:0,w:1.15*W,h:.31*H,hb:.15*H,n:1.55},
  {z:-2.0*L,y:0,w:1.05*W,h:.27*H,hb:.15*H,n:1.8},
  {z:-2.6*L,y:0,w:.95*W,h:.22*H,hb:.14*H,n:2.2}];
 const hp=hullProfile(rg),o={seg:12,phase:0};
 const nose=S.loft('nose','paint',rg.slice(0,4),o);
 S.loft('cockpit','paint',rg.slice(3,5),o);
 S.loft('engines','secondary',rg.slice(4),o);
 S.loftStripe('nose','marking',nose,PI/2,.1,1,3);
 S.loftStripe('nose','accent',nose,0,.06,2,3);S.loftStripe('nose','accent',nose,PI,.06,2,3);
 // braços em chevron (corpo sustentador)
 const s=p.span,sw=p.sweep*D2R,rx=.5*W,X=2.0*s,rle=1.5*L,tle=rle-X*Math.tan(sw),tn=Math.tan(sw);
 S.sym(()=>S.with(m4.T(rx,-.01,0),()=>{
  S.slab('wings','paint',[[0,rle,.2*H],[X,tle,.06],[X+.05,tle-.7,.06],[0,-1.3*L,.2*H]],{bevel:.06});
  const yt=x=>lerp(.2*H,.06,x/X)*.5+.012;
  S.ribbon('wings','accent',[[.2*X,yt(.2*X),rle-.2*X*tn-.2],[.85*X,yt(.85*X),rle-.85*X*tn-.2]],.08);
  S.with(M(m4.RZ(-p.tipDroop*D2R),m4.T(X+.02,0,0)),()=>S.slab('wings','accent',[[0,tle+.02,.06],[.5,tle-.25,.045],[.5,tle-.72,.045],[0,tle-.72,.06]],{bevel:.03}));
 }));
 const cs=p.cockpitSize,zc=.95*L+p.cockpitPos;
 S.canopy('cockpit',{z:zc,y:hp.top(zc)-.05,len:1.55*cs,w:.33*cs,h:.17*cs,seg:6,phase:PI/6,n:1.6,front:.6});
 const df=p.dorsalFin;
 S.with(m4.T(0,hp.top(-1.4*L)-.06,0),()=>S.prism('wings','secondary',[[-.7*L,0],[-1.7*L,.62*df],[-2.25*L,.62*df],[-2.3*L,0]],{axis:'x',a0:-.05,a1:.05,bevel:.015}));
 // banco de motores com três bocais retangulares
 const bw=.78*W*BW,bh=.17*H+.05;
 S.prism('engines','structure',[[-bw,-.13*H],[bw,-.13*H],[bw+.06,bh],[-bw-.06,bh]],{axis:'z',a0:-1.7*L,a1:-2.85*L,bevel:.05});
 for(const k of [-1,0,1])S.nozzle('engines',{x:k*.62*bw,y:.02,z:-2.95*L,w:.2*bw*E,h:.11*E,n:4.5,len:.9,seg:12,lip:false});
 S.slab('cockpit','structure',[[-.35*W,1.6*L],[.35*W,1.6*L],[.45*W,-1.9*L],[-.45*W,-1.9*L]],{y:hp.bot(0)+.02,t:.08,bevel:.03});
}

/* ---- GOLDEN FOX ---- */
function foxA(p,S){
 const L=p.length,W=p.width,H=p.height,NL=p.noseLength,E=p.engineSize;
 const zN=1.8*L,tip=zN+2.3*NL;
 const rg=[
  {z:tip,y:0,point:true},
  {z:zN+1.45*NL,y:0,w:.075*W,h:.07*H,hb:.065*H,n:2},
  {z:zN+.55*NL,y:0,w:.16*W,h:.15*H,hb:.12*H,n:2},
  {z:zN,y:0,w:.23*W,h:.2*H,hb:.16*H,n:2},
  {z:0,y:.01,w:.33*W,h:.26*H,hb:.2*H,n:2.1},
  {z:-1.25*L,y:.02,w:.39*W,h:.29*H,hb:.22*H,n:2.2},
  {z:-2.6*L,y:.02,w:.41*W,h:.29*H,hb:.24*H,n:2.3},
  {z:-3.05*L,y:.02,w:.36*W,h:.26*H,hb:.22*H,n:2.3}];
 const hp=hullProfile(rg),o={seg:12,phase:0};
 const nose=S.loft('nose','paint',rg.slice(0,4),o);
 const mid=S.loft('cockpit','paint',rg.slice(3,6),o);
 S.loft('engines','secondary',rg.slice(5),o);
 S.loftStripe('nose','marking',nose,PI/2,.11,1,3);
 S.loftStripe('cockpit','marking',mid,PI/2,.09,0,1);
 for(const t of [0,PI])S.loftStripe('cockpit','accent',mid,t,.07,0,2);
 // canards
 const cn=p.canard,zcn=zN+.45*NL;
 S.sym(()=>S.with(M(m4.RZ(8*D2R),m4.T(.07*W,-.02,zcn)),()=>S.slab('nose','accent',[[0,.3*cn+.05,.05],[.62*cn,-.02,.03],[.66*cn,-.2,.03],[0,-.28,.05]],{bevel:.03})));
 // delta traseira pequena + winglets
 const s=p.span,sw=p.sweep*D2R,tx=1.25*s,rle=-.9*L,tle=rle-tx*Math.tan(sw),rte=-2.75*L,wl=p.winglet;
 S.sym(()=>S.with(M(m4.RZ(-4*D2R),m4.T(.22*W,-.06*H,0)),()=>{
  S.slab('wings','paint',[[0,rle,.12*H],[tx,tle,.04],[tx,tle-.36,.04],[0,rte,.12*H]],{bevel:.05});
  S.with(M(m4.RZ(-10*D2R),m4.T(tx-.02,0,0)),()=>S.prism('wings','accent',[[tle+.02,0],[tle-.2,.5*wl],[tle-.4,.54*wl],[tle-.38,0]],{axis:'x',a0:-.03,a1:.03,bevel:.01}));
 }));
 // motor axial dominante + boosters
 S.nozzle('engines',{x:0,y:.02,z:-3.15*L,r:.3*E,len:1.2,seg:14});
 const B=p.booster;
 S.sym(()=>S.nozzle('engines',{x:.47*W,y:.04,z:-2.9*L,r:.13*B,len:1.15,seg:10,lip:false}));
 // cabine recuada estilo dragster + tomada dorsal
 const cs=p.cockpitSize,zc=-.55*L+p.cockpitPos,a=zc-.45*cs;
 S.canopy('cockpit',{z:zc,y:hp.top(zc)-.05,len:1.05*cs,w:.2*cs,h:.21*cs,front:.6});
 S.with(m4.T(0,hp.top(a-.5)-.05,0),()=>S.prism('cockpit','structure',[[a,0],[a-.12,.15],[a-.95,.12],[a-1.15,0]],{axis:'x',a0:-.1,a1:.1,bevel:.02}));
 S.with(m4.T(0,hp.bot(-2.5*L)+.05,0),()=>S.prism('engines','structure',[[-2.0*L,0],[-2.95*L,0],[-3.15*L,-.36],[-2.6*L,-.34]],{axis:'x',a0:-.03,a1:.03,bevel:.01}));
}
function foxB(p,S){
 const L=p.length,W=p.width,H=p.height,NL=p.noseLength,E=p.podSize,sp=p.sidepod,pg=p.podGap;
 const rg=[
  {z:2.6*L+.95*NL,y:-.1,point:true},
  {z:2.6*L+.35*NL,y:-.08,w:.13*W,h:.09*H,hb:.08*H,n:2.6},
  {z:2.2*L,y:-.05,w:.19*W,h:.14*H,hb:.12*H,n:2.8},
  {z:.55*L,y:0,w:.29*W,h:.22*H,hb:.17*H,n:3},
  {z:-1.25*L,y:0,w:.31*W,h:.24*H,hb:.18*H,n:3},
  {z:-2.55*L,y:.01,w:.23*W,h:.19*H,hb:.16*H,n:2.6},
  {z:-3.0*L,y:.01,w:.15*W,h:.13*H,hb:.12*H,n:2.4}];
 const hp=hullProfile(rg),o={seg:8,phase:PI/8};
 const nose=S.loft('nose','paint',rg.slice(0,3),o);
 const tub=S.loft('cockpit','paint',rg.slice(2,5),o);
 S.loft('engines','secondary',rg.slice(4),o);
 S.loftStripe('nose','marking',nose,PI/2,.18,1,2);
 S.loftStripe('cockpit','marking',tub,PI/2,.16,0,1);
 // aerofólio dianteiro em chevron com placas e pilones
 const fs=p.foilSpan,zf=2.45*L+.3*NL,yf=-.3;
 S.slab('nose','secondary',[[-1.7*fs,zf-.05],[0,zf+.3],[1.7*fs,zf-.05],[1.75*fs,zf-.42],[0,zf-.2],[-1.75*fs,zf-.42]],{y:yf,t:.08,bevel:.04});
 S.ribbon('nose','accent',[[-1.5*fs,yf+.055,zf-.2],[0,yf+.055,zf+.08],[1.5*fs,yf+.055,zf-.2]],.06);
 S.sym(()=>{
  S.with(m4.T(1.73*fs,yf,0),()=>S.prism('nose','paint',[[zf+.06,.17],[zf-.5,.15],[zf-.56,-.13],[zf-.02,-.11]],{axis:'x',a0:-.03,a1:.03,bevel:.01}));
  S.prism('nose','structure',[[zf+.06,yf],[zf-.24,yf],[zf-.3,hp.bot(zf)+.05],[zf-.02,hp.bot(zf)+.05]],{axis:'x',a0:.04,a1:.1,bevel:.01});
 });
 // sidepods com bocas de entrada
 S.sym(()=>{
  const x=.27*W+.2*sp;
  const pod=S.loft('wings','paint',[
   {z:.55*L,x,y:-.04,w:.14*sp,h:.1*sp,hb:.1*sp,n:3},
   {z:.35*L,x,y:-.03,w:.22*sp,h:.16*sp,hb:.14*sp,n:3.2},
   {z:-.9*L,x,y:-.03,w:.23*sp,h:.17*sp,hb:.15*sp,n:3.2},
   {z:-1.9*L,x:x*.8,y:-.02,w:.12*sp,h:.09*sp,hb:.1*sp,n:3}],{seg:8,phase:PI/8});
  S.loft('wings','structure',[{z:.6*L,x,y:-.04,w:.105*sp,h:.07*sp,n:3},{z:.5*L,x,y:-.04,w:.105*sp,h:.07*sp,n:3}],{seg:8,phase:PI/8});
  S.loftStripe('wings','accent',pod,PI/2,.14,1,2);
 });
 // pods de propulsão externos ligados por vigas
 S.sym(()=>{
  const pod=S.loft('engines','paint',[
   {z:-1.1*L,x:pg,y:0,point:true},
   {z:-1.45*L,x:pg,y:0,w:.17*E,h:.17*E,n:2},
   {z:-2.2*L,x:pg,y:0,w:.26*E,h:.26*E,n:2},
   {z:-2.95*L,x:pg,y:0,w:.25*E,h:.25*E,n:2}],{seg:12,phase:0});
  S.loftStripe('engines','accent',pod,PI/2,.12,1,3);
  S.nozzle('engines',{x:pg,y:0,z:-3.05*L,r:.21*E,len:.8,seg:12});
  S.slab('wings','secondary',[[.18*W,-1.55*L],[pg,-1.95*L],[pg,-2.5*L],[.18*W,-2.3*L]],{y:0,t:.09,bevel:.03});
 });
 // asa traseira elevada (dois elementos) sobre pilone pescoço-de-cisne
 const rh=p.rearWingHeight,rs=p.rearWingSpan,yw=hp.top(-2.6*L)+.2+.55*rh,half=(pg+.18)*rs;
 S.slab('wings','paint',[[-half,-2.55*L],[half,-2.55*L],[half,-3.02*L],[-half,-3.02*L]],{y:yw,t:.09,bevel:.04});
 S.slab('wings','accent',[[-half,-2.95*L],[half,-2.95*L],[half,-3.28*L],[-half,-3.28*L]],{y:yw+.065,t:.05,bevel:.03});
 S.sym(()=>S.with(m4.T(half,0,0),()=>S.prism('wings','secondary',[[-2.45*L,yw+.24],[-3.35*L,yw+.27],[-3.35*L,yw-.22],[-2.5*L,yw-.18]],{axis:'x',a0:-.03,a1:.03,bevel:.01})));
 S.prism('wings','structure',[[-2.2*L,hp.top(-2.2*L)-.05],[-2.62*L,yw+.02],[-2.9*L,yw+.02],[-2.6*L,hp.top(-2.6*L)-.05]],{axis:'x',a0:-.035,a1:.035,bevel:.01});
 // cockpit aberto com santantônio
 const cs=p.cockpitSize,zc=.3*L+p.cockpitPos,zh=zc-.55*cs,yh=hp.top(zh)-.03;
 S.canopy('cockpit',{z:zc,y:hp.top(zc)-.04,len:.95*cs,w:.19*cs,h:.17*cs,front:.6});
 const U=[[-.2,0],[-.2,.26],[-.1,.36],[.1,.36],[.2,.26],[.2,0],[.12,0],[.12,.22],[.07,.28],[-.07,.28],[-.12,.22],[-.12,0]];
 S.prism('cockpit','structure',U.map(([x,y])=>[x*cs,yh+y*cs]),{axis:'z',a0:zh,a1:zh-.12,bevel:.02});
 const fy=Math.min(hp.bot(-.5*L),-.03-.15*sp)+.03;
 S.slab('cockpit','structure',[[-.27*W-.38*sp,.35*L],[.27*W+.38*sp,.35*L],[.22*W+.3*sp,-1.8*L],[-.22*W-.3*sp,-1.8*L]],{y:fy,t:.06,bevel:.03});
}
function foxC(p,S){
 const L=p.length,W=p.width,H=p.height,NL=p.noseLength,Rg=p.ringSize,RL=p.ringLength;
 const rg=[
  {z:2.0*L+.95*NL,y:-.05,point:true},
  {z:2.0*L+.4*NL,y:-.03,w:.2*W,h:.15*H,hb:.11*H,n:1.8},
  {z:2.0*L,y:-.01,w:.36*W,h:.27*H,hb:.2*H,n:2},
  {z:.7*L,y:.02,w:.6*W,h:.42*H,hb:.3*H,n:2.3},
  {z:-.6*L,y:.02,w:.62*W,h:.42*H,hb:.31*H,n:2.4},
  {z:-1.8*L,y:.02,w:.48*W,h:.34*H,hb:.27*H,n:2.4},
  {z:-2.45*L,y:.02,w:.34*W,h:.25*H,hb:.21*H,n:2.2}];
 const hp=hullProfile(rg),o={seg:10,phase:PI/10};
 const nose=S.loft('nose','paint',rg.slice(0,3),o);
 const mid=S.loft('cockpit','paint',rg.slice(2,5),o);
 S.loft('engines','secondary',rg.slice(4),o);
 S.loftStripe('nose','marking',nose,PI/2,.12,1,2);
 for(const t of [PI*.1,PI*.9])S.loftStripe('cockpit','accent',mid,t,.06,0,2);
 S.prism('nose','structure',[[1.85*L,hp.bot(1.85*L)+.05],[1.85*L,hp.bot(1.85*L)-.08],[.8*L,hp.bot(.8*L)-.07],[.6*L,hp.bot(.6*L)+.05]],{axis:'x',a0:-.17*W,a1:.17*W,bevel:.03});
 // asas de enflechamento negativo com aletas de ponta
 const s=p.span,fsw=p.forwardSweep*D2R,tx=2.05*s,rLE=-.45*L,rTE=-1.95*L,tLE=rLE+tx*Math.tan(fsw),tTE=tLE-.5;
 S.sym(()=>S.with(M(m4.RZ(5*D2R),m4.T(.4*W,-.1*H,0)),()=>{
  S.slab('wings','paint',[[0,rLE,.15*H],[tx,tLE,.05],[tx,tTE,.05],[0,rTE,.15*H]],{bevel:.06});
  S.ribbon('wings','accent',[[.15*tx,.07*H+.02,lerp(rLE,tLE,.15)-.12],[.9*tx,.045,lerp(rLE,tLE,.9)-.12]],.07);
  S.with(m4.T(tx-.03,0,0),()=>S.prism('wings','accent',[[tLE+.05,0],[tLE-.15,.42],[tTE+.02,.45],[tTE-.02,0]],{axis:'x',a0:-.03,a1:.03,bevel:.01}));
 }));
 // "orelhas": barbatanas dorsais inclinadas atrás da cabine
 const eh=p.earHeight,ec=p.earCant*D2R,ze=-.15*L;
 S.sym(()=>S.with(M(m4.RZ(-ec),m4.T(.2*W,hp.top(ze)-.08,0)),()=>{
  S.prism('cockpit','paint',[[ze+.15,0],[ze-.35,.9*eh],[ze-.55,.86*eh],[ze-1.15*L,0]],{axis:'x',a0:-.05,a1:.05,bevel:.02});
  S.prism('cockpit','accent',[[ze,.08],[ze-.33,.68*eh],[ze-.45,.65*eh],[ze-.9*L,.08]],{axis:'x',a0:-.065,a1:.065,bevel:.015});
 }));
 const cs=p.cockpitSize,zc=.95*L+p.cockpitPos;
 S.canopy('cockpit',{z:zc,y:hp.top(zc)-.07,len:1.2*cs,w:.3*cs,h:.28*cs,front:.58});
 // motor único em duto anelar (ducted ring) com três suportes
 const ze2=-2.25*L,ri=Math.max(.5*Rg,.42*W+.06),ro=ri+.12*Rg+.05,z1=ze2-.95*RL;
 S.nozzle('engines',{x:0,y:.02,z:ze2-.5,r:.27*Rg,len:1.1,seg:12});
 S.lathe('engines','paint',[[ri,ze2],[ro,ze2-.12],[ro+.02,z1+.16],[ri+.03,z1]],{seg:16,cy:.02});
 S.lathe('engines','accent',[[ro-.01,ze2-.2],[ro+.035,ze2-.25],[ro+.035,ze2-.42],[ro-.01,ze2-.46]],{seg:16,cy:.02});
 for(const a of [PI/2,PI/2+TAU/3,PI/2+2*TAU/3])S.with(M(m4.RZ(a),m4.T(0,.02,0)),()=>S.slab('engines','structure',[[.22*Rg,ze2-.02],[ri+.04,ze2-.06],[ri+.04,ze2-.42],[.22*Rg,ze2-.5]],{t:.06,bevel:.015}));
 S.with(m4.T(0,hp.bot(-1.4*L)+.05,0),()=>S.prism('engines','structure',[[-.8*L,0],[-1.7*L,0],[-1.95*L,-.3],[-1.3*L,-.28]],{axis:'x',a0:-.03,a1:.03,bevel:.01}));
}

/* ---- WILD GOOSE ---- */
function gooseA(p,S){
 const L=p.length,W=p.width,H=p.height,A=p.armor,E=p.engineSize,Rr=p.rearScale,pin=.15;
 const rg=[
  {z:1.95*L,y:-.02,w:.92*W,h:.34*H,hb:.32*H,n:3,pinch:pin},
  {z:1.25*L,y:0,w:1.05*W,h:.47*H,hb:.36*H,n:3.4,pinch:pin},
  {z:-.6*L,y:0,w:1.12*W,h:.5*H,hb:.38*H,n:3.6,pinch:pin},
  {z:-1.75*L,y:0,w:1.12*W,h:.48*H,hb:.38*H,n:3.6,pinch:pin},
  {z:-2.45*L,y:0,w:1.05*W*Rr,h:.46*H,hb:.38*H,n:3.8,pinch:.12},
  {z:-2.75*L,y:0,w:.95*W*Rr,h:.4*H,hb:.34*H,n:3.8,pinch:.1}];
 const hp=hullProfile(rg),o={seg:8,phase:PI/8};
 S.loft('nose','paint',rg.slice(0,2),o);
 const mid=S.loft('cockpit','paint',rg.slice(1,4),o);
 S.loft('engines','secondary',rg.slice(3),o);
 S.loftStripe('cockpit','marking',mid,PI/2,.2,0,2);
 // aríete em V: perfil lateral inclinado varrido ao longo de X com cisalhamento
 const RW=p.ramWidth,rs=p.ramSweep*D2R,rr=p.ramRake*D2R;
 const zt=1.95*L+.1,yT=hp.top(1.95*L)+.08,yB=hp.bot(1.95*L)-.12,lip=zt+(yT-yB)*Math.tan(rr),tr=.16*A+.08,half=1.38*W*RW;
 const sh=x=>-Math.abs(x)*Math.tan(rs);
 S.sweep('nose','structure',[[zt,yT],[lip,yB],[lip-.16-tr,yB],[zt-tr,yT-.05]],[{a:-half,du:sh(half),ins:.05},{a:-half+.05,du:sh(half-.05)},{a:0},{a:half-.05,du:sh(half-.05)},{a:half,du:sh(half),ins:.05}],'x');
 for(const u of [.3,.62]){
  const dz=lip-zt,dy=yB-yT,dl=Math.hypot(dz,dy),nz=-dy/dl,ny=dz/dl,tz=dz/dl*.06,ty=dy/dl*.06,e=.05;
  const c=[lerp(zt,lip,u)+nz*.03,lerp(yT,yB,u)+ny*.03],hb=half-.12;
  const bar=[[c[0]-tz-nz*e,c[1]-ty-ny*e],[c[0]+tz-nz*e,c[1]+ty-ny*e],[c[0]+tz+nz*e,c[1]+ty+ny*e],[c[0]-tz+nz*e,c[1]-ty+ny*e]];
  S.sweep('nose','accent',bar,[{a:-hb,du:sh(hb)},{a:0},{a:hb,du:sh(hb)}],'x');
 }
 S.sym(()=>S.prism('nose','marking',[[-.32*W,.12*H],[-.66*W,.12*H],[-.7*W,.2*H],[-.36*W,.21*H]],{axis:'z',a0:1.6*L,a1:1.95*L+.035,bevel:.012}));
 // saias blindadas + placa superior + friso
 const SD=p.skirtDepth,hx=1.08*W,yb=-.42*H-.22*SD;
 S.sym(()=>{
  S.prism('wings','secondary',[[1.45*L,.16*H],[1.62*L,-.18*H],[1.3*L,yb],[-2.25*L,yb],[-2.6*L,-.2*H],[-2.42*L,.16*H]],{axis:'x',a0:hx-.08,a1:hx+.14*A,bevel:.03});
  S.prism('wings','paint',[[1.2*L,.36*H],[1.32*L,.04],[-2.0*L,.04],[-2.12*L,.36*H]],{axis:'x',a0:hx-.04,a1:hx+.22*A,bevel:.03});
  S.prism('wings','accent',[[1.25*L,yb+.14],[1.32*L,yb+.06],[-2.1*L,yb+.06],[-2.16*L,yb+.14]],{axis:'x',a0:hx+.1*A,a1:hx+.16*A,bevel:.01});
 });
 // cabine em fenda sob capô blindado
 const cs=p.cockpitSize,zc=.7*L+p.cockpitPos,yc=hp.top(zc)-.05;
 S.canopy('cockpit',{z:zc,y:yc,len:1.05*cs,w:.44*cs,h:.15*cs,seg:8,phase:PI/8,n:3,front:.55,frame:false});
 S.prism('cockpit','secondary',[[zc+.08*cs,yc+.19*cs],[zc-.62*cs,yc+.25*cs],[zc-.8*cs-.3,yc-.02],[zc-.05,yc-.02]],{axis:'x',a0:-.5*cs,a1:.5*cs,bevel:.04});
 // bloco de propulsão 2×2 com gaiola traseira
 const ex=Math.max(.45*W,.27*E+.02),ey=Math.max(.17*H,.26*E),ez=-2.88*L,ro=.21*E*1.19;
 for(const sx of [-1,1])for(const sy of [-1,1])S.nozzle('engines',{x:sx*ex,y:sy*ey,z:ez,r:.21*E,len:1.0,seg:12});
 const fxo=ex+ro+.12,fyo=ey+ro+.1,z0=-2.55*L,z1=-2.86*L;
 S.prism('engines','structure',[[-fxo,ey+ro],[fxo,ey+ro],[fxo,fyo],[-fxo,fyo]],{axis:'z',a0:z0,a1:z1,bevel:.02});
 S.prism('engines','structure',[[-fxo,-fyo],[fxo,-fyo],[fxo,-ey-ro],[-fxo,-ey-ro]],{axis:'z',a0:z0,a1:z1,bevel:.02});
 S.sym(()=>S.prism('engines','structure',[[ex+ro,-fyo+.01],[fxo,-fyo+.01],[fxo,fyo-.01],[ex+ro,fyo-.01]],{axis:'z',a0:z0,a1:z1,bevel:.02}));
}
function gooseB(p,S){
 const L=p.length,W=p.width,H=p.height,SP=p.sponsonSize,SG=p.sponsonGap,SL=p.sponsonLength,A=p.armor,T=p.turretSize,E=p.engineSize;
 const rg=[
  {z:2.3*L,y:-.12,w:.6*W,h:.12*H,hb:.16*H,n:2.6},
  {z:1.55*L,y:0,w:.75*W,h:.34*H,hb:.26*H,n:3},
  {z:-1.0*L,y:0,w:.8*W,h:.38*H,hb:.28*H,n:3.2},
  {z:-2.4*L,y:0,w:.78*W,h:.36*H,hb:.28*H,n:3.2},
  {z:-2.8*L,y:0,w:.68*W,h:.3*H,hb:.25*H,n:3}];
 const hp=hullProfile(rg),o={seg:8,phase:PI/8};
 S.loft('nose','paint',rg.slice(0,2),o);
 S.loft('cockpit','paint',rg.slice(1,3),o);
 S.loft('engines','secondary',rg.slice(2),o);
 // sponsons (flutuadores laterais de comprimento total)
 const xs=.8*W+SG+.44*SP,sy=-.08,bu=p.bumper;
 const spon=[
  {z:2.55*L*SL,x:xs,y:sy-.04,w:.32*SP,h:.2*SP,hb:.3*SP,n:3.6},
  {z:2.25*L*SL,x:xs,y:sy,w:.44*SP,h:.34*SP,hb:.38*SP,n:4},
  {z:-1.0*L,x:xs,y:sy,w:.44*SP,h:.34*SP,hb:.38*SP,n:4},
  {z:-2.55*L*SL,x:xs,y:sy,w:.44*SP,h:.34*SP,hb:.38*SP,n:4},
  {z:-2.85*L*SL,x:xs,y:sy,w:.38*SP,h:.29*SP,hb:.33*SP,n:3.8}];
 S.sym(()=>{
  const f=S.loft('wings','paint',spon.slice(0,3),o);
  S.loft('engines','secondary',spon.slice(2),o);
  S.loftStripe('wings','accent',f,PI/2,.2,1,2);
  S.prism('nose','structure',[[xs-.47*SP,sy-.42*SP],[xs+.47*SP,sy-.42*SP],[xs+.5*SP,sy+.22*SP],[xs-.5*SP,sy+.22*SP]],{axis:'z',a0:2.3*L*SL,a1:2.62*L*SL+.32*bu,bevel:.06});
  S.prism('nose','accent',[[xs-.4*SP,sy-.05],[xs+.4*SP,sy-.05],[xs+.4*SP,sy+.04],[xs-.4*SP,sy+.04]],{axis:'z',a0:2.4*L*SL,a1:2.62*L*SL+.32*bu+.025,bevel:.01});
  S.slab('wings','secondary',[[.6*W,.9*L],[xs,.7*L],[xs,-1.7*L],[.6*W,-1.9*L]],{y:.02,t:.24*A,bevel:.05});
  S.nozzle('engines',{x:xs,y:sy,z:-2.95*L*SL,r:.25*E,len:1.0,seg:12});
 });
 S.slab('nose','secondary',[[-xs,2.35*L*SL],[xs,2.35*L*SL],[xs,1.5*L],[-xs,1.5*L]],{y:sy-.3*SP,t:.1,bevel:.04});
 S.slab('engines','secondary',[[-.56*W,-1.1*L],[.56*W,-1.1*L],[.5*W,-2.35*L],[-.5*W,-2.35*L]],{y:hp.top(-1.7*L)-.02,t:.1*A+.04,bevel:.05});
 // torre/cúpula blindada com visor em fenda e escotilha
 const zt=.35*L+p.turretPos,yb=hp.top(zt)-.07;
 S.loft('cockpit','paint',[
  {z:zt+.78*T,y:yb,point:true},
  {z:zt+.58*T,y:yb+.05,w:.42*T,h:.22*T,hb:.06,n:2.2},
  {z:zt+.1*T,y:yb+.04,w:.64*T,h:.38*T,hb:.08,n:2.2},
  {z:zt-.5*T,y:yb+.02,w:.6*T,h:.33*T,hb:.08,n:2.2},
  {z:zt-.82*T,y:yb,w:.38*T,h:.16*T,hb:.06,n:2.2}],{seg:8,phase:PI/8});
 S.loft('cockpit','glass',[
  {z:zt+.8*T,y:yb+.15*T,point:true},
  {z:zt+.7*T,y:yb+.16*T,w:.4*T,h:.06*T,n:3},
  {z:zt+.48*T,y:yb+.17*T,w:.58*T,h:.07*T,n:3},
  {z:zt+.22*T,y:yb+.17*T,point:true}],{seg:8,phase:PI/8});
 S.with(M(m4.RX(-PI/2),m4.T(0,yb+.04+.33*T,zt-.15*T)),()=>S.lathe('cockpit','structure',[[.1*T,0],[.17*T,0],[.17*T,.06],[.1*T,.07]],{seg:12}));
 S.with(m4.T(-.36*T,yb+.04,zt-.55*T),()=>S.prism('cockpit','structure',[[.04,0],[-.06,0],[-.2,.62*T+.25],[-.16,.62*T+.25]],{axis:'x',a0:-.018,a1:.018,bevel:.006}));
 S.nozzle('engines',{x:0,y:0,z:-2.95*L,r:.36*p.mainEngine,len:1.1,seg:14});
}
function gooseC(p,S){
 const L=p.length,W=p.width,H=p.height,NL=p.noseLength,E=p.engineSize,Rr=p.rearScale;
 const rg=[
  {z:2.2*L+.9*NL,y:-.12,w:.24*W,h:.1*H,hb:.13*H,n:2.4,pinch:.1},
  {z:2.2*L+.5*NL,y:-.08,w:.4*W,h:.22*H,hb:.22*H,n:2.4,pinch:.18},
  {z:1.4*L,y:-.02,w:.62*W,h:.4*H,hb:.3*H,n:2.5,pinch:.24},
  {z:.3*L,y:.02,w:.82*W,h:.56*H,hb:.34*H,n:2.6,pinch:.28},
  {z:-.7*L,y:.04,w:.92*W,h:.63*H,hb:.36*H,n:2.8,pinch:.3},
  {z:-2.0*L,y:.02,w:.8*W*Rr,h:.48*H,hb:.34*H,n:2.8,pinch:.25},
  {z:-2.7*L,y:0,w:.6*W*Rr,h:.36*H,hb:.3*H,n:2.6,pinch:.2}];
 const hp=hullProfile(rg),o={seg:8,phase:0};
 S.loft('nose','paint',rg.slice(0,3),o);
 const mid=S.loft('cockpit','paint',rg.slice(2,5),o);
 S.loft('engines','secondary',rg.slice(4),o);
 for(const t of [PI*.25,PI*.75])S.loftStripe('cockpit','accent',mid,t,.07,0,2);
 // ombreiras de impacto (ponto mais largo da nave)
 const sh=p.shoulderSize,sc=p.shoulderCant*D2R,zs=-.45*L+p.shoulderPos,xh=hp.half(zs)*.72;
 S.sym(()=>S.with(M(m4.RZ(-sc),m4.T(xh,.04,zs)),()=>{
  S.prism('wings','secondary',[[0,-.3],[.6*sh,-.27],[.8*sh,.06],[.62*sh,.38*sh+.06],[0,.36]],{axis:'z',a0:1.05*sh,a1:-1.3*sh,bevel:.1});
  S.prism('wings','paint',[[.42*sh,-.3],[.86*sh,-.22],[.98*sh,.1],[.74*sh,.46*sh+.06],[.4*sh,.42*sh+.05]],{axis:'z',a0:1.2*sh,a1:-1.42*sh,bevel:.13});
  S.prism('wings','accent',[[.84*sh,-.17],[.96*sh,-.15],[1.0*sh,.08],[.9*sh,.07]],{axis:'z',a0:1.0*sh,a1:-1.2*sh,bevel:.02});
  for(const zz of [.55*sh,-.15*sh,-.85*sh])S.loft('wings','structure',[{z:zz+.11,x:.62*sh,y:.4*sh+.02,w:.07,h:.04,n:1.4},{z:zz,x:.62*sh,y:.4*sh+.1,point:true}],{seg:4,phase:PI/4});
 }));
 // presas inferiores de abalroamento
 const tl=p.tuskLength,zf=2.2*L+.9*NL;
 S.sym(()=>S.slab('nose','structure',[[.12*W,1.3*L,.2],[.34*W,1.45*L,.2],[.3*W,zf+.55*tl,.06],[.2*W,zf+.35*tl,.08]],{y:hp.bot(1.8*L)+.08,bevel:.04}));
 // capô frontal (cowl) e cabine corcunda atrás dele
 const CH=p.cowlHeight;
 S.prism('cockpit','secondary',[[1.65*L,hp.top(1.65*L)-.12],[1.0*L,hp.top(1.0*L)+.16*CH],[.45*L,hp.top(.45*L)+.13*CH],[.35*L,hp.top(.35*L)-.12]],{axis:'x',a0:-.36*W,a1:.36*W,bevel:.05});
 const cs=p.cockpitSize,zc=-.05*L;
 S.canopy('cockpit',{z:zc,y:hp.top(zc)-.08,len:.95*cs,w:.3*cs,h:.2*cs,seg:8,phase:PI/8,n:2.4,front:.6});
 S.prism('engines','secondary',[[-.75*L,hp.top(-.75*L)-.06],[-1.0*L,hp.top(-1.0*L)+.13],[-2.25*L,hp.top(-2.25*L)+.09],[-2.55*L,hp.top(-2.55*L)-.06]],{axis:'x',a0:-.045,a1:.045,bevel:.015});
 // trio de bocais em triângulo
 const rho=Math.max(.36*W,.38*E),ez=-2.85*L;
 for(const a of [PI/2,PI/2+TAU/3,PI/2+2*TAU/3])S.nozzle('engines',{x:Math.cos(a)*rho,y:.02+Math.sin(a)*rho*.85,z:ez,r:.24*E,len:1.0,seg:12});
 S.slab('cockpit','structure',[[-.5*W,1.0*L],[.5*W,1.0*L],[.6*W,-1.8*L],[-.6*W,-1.8*L]],{y:hp.bot(-.4*L)+.04,t:.1,bevel:.04});
}

/* ---- registro: naves, alternativas, intenções e parâmetros ---- */
const SHIPS=[
 {id:'falcon',name:'BLUE FALCON',paint:'#2468f6',accent:'#58e9ff',roster:'B · C · B',identity:'Corrida aerodinâmica, equilibrada e versátil.'},
 {id:'fox',name:'GOLDEN FOX',paint:'#f8c32c',accent:'#edfaff',roster:'D · A · D',identity:'Leve e ágil, voltada à aceleração.'},
 {id:'goose',name:'WILD GOOSE',paint:'#218e54',accent:'#b476ff',roster:'A · B · C',identity:'Robusta e pesada, voltada ao combate físico.'}];
const SHIP_MAP=Object.fromEntries(SHIPS.map(s=>[s.id,s]));
const VARIANT_CODES=['A','B','C'];
const VARIANTS={
 falcon:{
  A:{name:'Lança Delta',tag:'Interceptor de dardo com asa delta quebrada',build:falconA,
   intent:'Fuselagem única dominante com proa quinada (seção em losango), cabine em gota sobre espinha dorsal, asa delta com strake, estabilizadores gêmeos inclinados e dupla propulsão integrada. Leitura: flecha contínua.',
   params:[P('length','Comprimento da fuselagem',.82,1.22,1),P('width','Largura do casco central',.8,1.3,1),P('height','Altura / espessura do casco',.75,1.35,1),
    P('noseLength','Comprimento da proa',.7,1.45,1,{affects:['nose']}),P('span','Envergadura',.75,1.35,1,{affects:['wings']}),P('sweep','Enflechamento externo',28,58,45,{step:1,unit:'°',affects:['wings']}),
    P('dihedral','Diedro das asas',-8,12,3,{step:.5,unit:'°',affects:['wings']}),P('cockpitSize','Volume da cabine',.75,1.35,1,{affects:['cockpit']}),P('cockpitPos','Posição da cabine',-.5,.6,0,{unit:'u',affects:['cockpit']}),
    P('finHeight','Altura dos estabilizadores',.6,1.5,1,{affects:['wings']}),P('finCant','Inclinação dos estabilizadores',0,38,18,{step:1,unit:'°',affects:['wings']}),P('engineSize','Tamanho dos motores',.75,1.35,1,{affects:['engines']})]},
  B:{name:'Bi-Viga',tag:'Cápsula central + duas vigas-motor (twin-boom)',build:falconB,
   intent:'Arquitetura em três corpos: cápsula de cabine curta e alta, duas vigas longas com motores e deriva própria, ponte alar e empenagem horizontal que fecha um vão vazado. Leitura superior em tridente com espaço negativo.',
   params:[P('length','Comprimento da cápsula',.82,1.2,1),P('width','Largura da cápsula',.8,1.3,1),P('height','Altura dos cascos',.75,1.35,1),
    P('noseLength','Comprimento da proa',.7,1.4,1,{affects:['nose']}),P('boomGap','Afastamento das vigas',1.05,1.8,1.32,{unit:'u',affects:['wings','engines']}),P('boomLength','Comprimento das vigas',.8,1.15,1,{affects:['wings','engines']}),
    P('span','Envergadura externa',.7,1.4,1,{affects:['wings']}),P('sweep','Enflechamento externo',-15,45,22,{step:1,unit:'°',affects:['wings']}),P('cockpitSize','Volume da cabine',.8,1.35,1,{affects:['cockpit']}),
    P('cockpitPos','Posição da cabine',-.5,.5,0,{unit:'u',affects:['cockpit']}),P('tailHeight','Altura da empenagem',.6,1.5,1,{affects:['wings']}),P('engineSize','Tamanho dos motores',.75,1.35,1,{affects:['engines']})]},
  C:{name:'Ponta de Flecha',tag:'Corpo sustentador em chevron, perfil baixíssimo',build:falconC,
   intent:'Corpo achatado de bordas cortantes que se funde a braços em chevron com pontas caídas; cabine facetada embutida, deriva dorsal única e banco de três bocais retangulares. Leitura frontal: lâmina fina; superior: ponta de flecha recortada.',
   params:[P('length','Comprimento do corpo',.82,1.2,1),P('width','Largura do corpo central',.8,1.25,1),P('height','Espessura do corpo',.75,1.4,1),
    P('noseLength','Comprimento da proa',.7,1.4,1,{affects:['nose']}),P('span','Envergadura dos braços',.8,1.25,1,{affects:['wings']}),P('sweep','Enflechamento do chevron',48,64,57,{step:1,unit:'°',affects:['wings']}),
    P('tipDroop','Queda das pontas',0,80,40,{step:1,unit:'°',affects:['wings']}),P('cockpitSize','Volume da cabine',.75,1.35,1,{affects:['cockpit']}),P('cockpitPos','Posição da cabine',-.5,.5,0,{unit:'u',affects:['cockpit']}),
    P('dorsalFin','Deriva dorsal',.3,1.4,1,{affects:['wings']}),P('bankWidth','Largura do banco de motores',.75,1.25,1,{affects:['engines']}),P('engineSize','Tamanho dos bocais',.75,1.35,1,{affects:['engines']})]}
 },
 fox:{
  A:{name:'Agulha',tag:'Dragster-agulha com canards e cabine recuada',build:foxA,
   intent:'Fuselagem extremamente longa e fina, proa-agulha, canards dianteiros, pequena delta traseira com winglets, cabine bem recuada e um motor axial dominante com dois boosters. Leitura: linha reta tensionada, massa concentrada atrás.',
   params:[P('length','Comprimento da fuselagem',.85,1.2,1),P('width','Largura da fuselagem',.8,1.3,1),P('height','Altura da fuselagem',.8,1.35,1),
    P('noseLength','Comprimento da agulha',.7,1.5,1,{affects:['nose']}),P('span','Envergadura',.75,1.35,1,{affects:['wings']}),P('sweep','Enflechamento',38,58,50,{step:1,unit:'°',affects:['wings']}),
    P('canard','Tamanho dos canards',.4,1.5,1,{affects:['nose']}),P('cockpitSize','Volume da cabine',.75,1.35,1,{affects:['cockpit']}),P('cockpitPos','Posição da cabine',-.6,.6,0,{unit:'u',affects:['cockpit']}),
    P('engineSize','Motor principal',.75,1.35,1,{affects:['engines']}),P('booster','Boosters laterais',.5,1.5,1,{affects:['engines']}),P('winglet','Altura dos winglets',.3,1.5,1,{affects:['wings']})]},
  B:{name:'Ampulheta',tag:'Monoposto de aerofólios com pods externos',build:foxB,
   intent:'Cintura estreita entre um aerofólio dianteiro largo e um conjunto traseiro largo (dois pods de propulsão em vigas + asa elevada em pilone). Cockpit aberto com santantônio. Leitura superior em ampulheta; perfil com asa alta.',
   params:[P('length','Comprimento do monocoque',.85,1.2,1),P('width','Largura do monocoque',.8,1.3,1),P('height','Altura do monocoque',.8,1.35,1),
    P('noseLength','Comprimento da proa',.6,1.5,1,{affects:['nose']}),P('foilSpan','Envergadura do aerofólio dianteiro',.7,1.35,1,{affects:['nose']}),P('sidepod','Volume dos sidepods',.6,1.4,1,{affects:['wings','cockpit']}),
    P('podGap','Afastamento dos pods',1.2,1.9,1.45,{unit:'u',affects:['engines','wings']}),P('podSize','Tamanho dos pods/motores',.7,1.35,1,{affects:['engines']}),P('rearWingHeight','Altura da asa traseira',.3,1.4,.9,{affects:['wings']}),
    P('rearWingSpan','Envergadura da asa traseira',.75,1.3,1,{affects:['wings']}),P('cockpitSize','Volume da cabine',.75,1.35,1,{affects:['cockpit']}),P('cockpitPos','Posição da cabine',-.5,.5,0,{unit:'u',affects:['cockpit']})]},
  C:{name:'Kitsune',tag:'Gota compacta, asa invertida e duto anelar',build:foxC,
   intent:'Corpo curto em gota com cabine avançada, asas de enflechamento negativo com aletas, duas "orelhas" dorsais inclinadas e um único motor dentro de um duto anelar sustentado por três suportes. Leitura superior em X; traseira circular.',
   params:[P('length','Comprimento do corpo',.85,1.2,1),P('width','Largura do corpo',.8,1.25,1),P('height','Altura do corpo',.8,1.3,1),
    P('noseLength','Comprimento da proa',.6,1.5,1,{affects:['nose']}),P('span','Envergadura',.75,1.35,1,{affects:['wings']}),P('forwardSweep','Enflechamento negativo',0,35,20,{step:1,unit:'°',affects:['wings']}),
    P('earHeight','Altura das orelhas',.4,1.5,1,{affects:['cockpit']}),P('earCant','Abertura das orelhas',0,40,22,{step:1,unit:'°',affects:['cockpit']}),P('cockpitSize','Volume da cabine',.75,1.3,1,{affects:['cockpit']}),
    P('cockpitPos','Posição da cabine',-.5,.4,0,{unit:'u',affects:['cockpit']}),P('ringSize','Diâmetro do duto/motor',.75,1.35,1,{affects:['engines']}),P('ringLength','Comprimento do duto',.6,1.5,1,{affects:['engines']})]}
 },
 goose:{
  A:{name:'Aríete',tag:'Casco-caixa com arado em V e saias blindadas',build:gooseA,
   intent:'Casco retangular de laterais planas, arado frontal em V inclinado mais largo que o casco, saias blindadas profundas, cabine em fenda sob capô e bloco de quatro motores em gaiola. Leitura: mais largo na frente, massa baixa.',
   params:[P('length','Comprimento do casco',.85,1.2,1),P('width','Largura do casco',.85,1.3,1),P('height','Altura do casco',.8,1.3,1),
    P('ramWidth','Largura do aríete',.8,1.35,1,{affects:['nose']}),P('ramSweep','Abertura em V do aríete',0,35,24,{step:1,unit:'°',affects:['nose']}),P('ramRake','Inclinação da face do aríete',12,55,32,{step:1,unit:'°',affects:['nose']}),
    P('armor','Espessura da blindagem',.6,1.6,1,{affects:['nose','wings']}),P('skirtDepth','Profundidade das saias',.5,1.5,1,{affects:['wings']}),P('cockpitSize','Volume da cabine',.75,1.3,1,{affects:['cockpit']}),
    P('cockpitPos','Posição da cabine',-.6,.5,0,{unit:'u',affects:['cockpit']}),P('engineSize','Tamanho dos motores',.75,1.3,1,{affects:['engines']}),P('rearScale','Proporção traseira',.8,1.25,1,{affects:['engines']})]},
  B:{name:'Tanque Flutuante',tag:'Casco central entre dois sponsons de comprimento total',build:gooseB,
   intent:'Dois flutuadores laterais retangulares, longos e independentes, com para-choques maciços, ligados ao casco por pontes; torre/cúpula blindada com visor em fenda e três motores (dois nos sponsons + um central). Leitura: retângulo largo e uniforme.',
   params:[P('length','Comprimento do casco',.85,1.2,1),P('width','Largura do casco central',.8,1.25,1),P('height','Altura do casco',.8,1.3,1),
    P('sponsonSize','Seção dos sponsons',.75,1.3,1,{affects:['wings','engines','nose']}),P('sponsonGap','Afastamento dos sponsons',0,.45,.15,{unit:'u',affects:['wings','engines','nose']}),P('sponsonLength','Comprimento dos sponsons',.85,1.12,1,{affects:['wings','engines','nose']}),
    P('bumper','Massa dos para-choques',.4,1.5,1,{affects:['nose']}),P('armor','Espessura da blindagem',.6,1.6,1,{affects:['wings','engines']}),P('turretSize','Volume da torre/cabine',.75,1.3,1,{affects:['cockpit']}),
    P('turretPos','Posição da torre',-.6,.6,0,{unit:'u',affects:['cockpit']}),P('engineSize','Motores dos sponsons',.75,1.3,1,{affects:['engines']}),P('mainEngine','Motor central',.7,1.35,1,{affects:['engines']})]},
  C:{name:'Ombreira',tag:'Brigão corcunda com ombreiras de impacto',build:gooseC,
   intent:'Casco em losango com espinha elevada (corcunda), ombreiras de impacto inclinadas que formam o ponto mais largo no meio da nave, presas inferiores, capô frontal que esconde a cabine e trio de bocais em triângulo. Leitura superior em losango.',
   params:[P('length','Comprimento do casco',.85,1.2,1),P('width','Largura do casco',.85,1.3,1),P('height','Altura da corcunda',.8,1.35,1),
    P('noseLength','Comprimento da proa',.5,1.5,1,{affects:['nose','cockpit']}),P('shoulderSize','Tamanho das ombreiras',.7,1.4,1,{affects:['wings']}),P('shoulderCant','Inclinação das ombreiras',0,35,16,{step:1,unit:'°',affects:['wings']}),
    P('shoulderPos','Posição das ombreiras',-.6,.6,0,{unit:'u',affects:['wings']}),P('tuskLength','Comprimento das presas',.3,1.5,1,{affects:['nose']}),P('cockpitSize','Volume da cabine',.75,1.3,1,{affects:['cockpit']}),
    P('cowlHeight','Altura do capô',.4,1.5,1,{affects:['cockpit']}),P('engineSize','Tamanho dos bocais',.75,1.3,1,{affects:['engines']}),P('rearScale','Proporção traseira',.8,1.25,1,{affects:['engines']})]}
 }
};
function paramDefs(ship,v){return VARIANTS[ship][v].params;}
function defaultsFor(ship,v){return Object.fromEntries(paramDefs(ship,v).map(d=>[d.id,d.def]));}
function defaultParams(){const o={};for(const s of SHIPS){o[s.id]={};for(const v of VARIANT_CODES)o[s.id][v]=defaultsFor(s.id,v);}return o;}
function fnv(arr,h=2166136261){for(let i=0;i<arr.length;i++){h=Math.imul(h^Math.round(arr[i]*1000),16777619)>>>0;}return h;}
function buildMesh(ship,v,params){
 const defs=paramDefs(ship,v),p={};
 for(const d of defs){const x=Number(params?.[d.id]);p[d.id]=Number.isFinite(x)?clamp(x,d.min,d.max):d.def;}
 const S=new Builder();VARIANTS[ship][v].build(p,S);
 return {ship,variant:v,params:p,shapes:S.shapes};
}
function meshReport(mesh){
 let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],tris=0,h=2166136261;const parts={};
 for(const k of PARTS)parts[k]={triangles:0,shapes:0,hash:2166136261};
 for(const s of mesh.shapes){
  const n=s.positions.length/9;tris+=n;h=fnv(s.positions,h);
  const pr=parts[s.part];pr.triangles+=n;pr.shapes++;pr.hash=fnv(s.positions,pr.hash);
  for(let i=0;i<s.positions.length;i+=3)for(let k=0;k<3;k++){const x=s.positions[i+k];if(x<min[k])min[k]=x;if(x>max[k])max[k]=x;}
 }
 for(const k of PARTS)parts[k].fingerprint=parts[k].hash.toString(16).padStart(8,'0');
 return {triangles:tris,shapes:mesh.shapes.length,bounds:{min,max},fingerprint:h.toString(16).padStart(8,'0'),parts};
}
/* @gminus-approved-craft-geometry:end v1 */
/* P12 V2 — CORE: vetores, RNG com semente, easing, molas e hash de estado.
   Depende somente de clamp/lerp/TAU do bloco geométrico aprovado do P05 (embutido antes). */
const LAB_SCHEMA='gminus.p12v2.hud-camera-lab',LAB_VERSION=1;
const SIM_HZ=120,SIM_DT=1/SIM_HZ;
const KMH=3.6;                       // 1 u = 1 m nesta bancada (convenção provisória, ver especificação §5)
const vec={
 add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
 sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
 scale:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
 madd:(a,b,k)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],
 dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 len:a=>Math.hypot(a[0],a[1],a[2]),
 norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
 lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
 // rotação de Rodrigues em torno de um eixo unitário
 rot:(v,k,ang)=>{const c=Math.cos(ang),s=Math.sin(ang),d=k[0]*v[0]+k[1]*v[1]+k[2]*v[2],x=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];return [v[0]*c+x[0]*s+k[0]*d*(1-c),v[1]*c+x[1]*s+k[1]*d*(1-c),v[2]*c+x[2]*s+k[2]*d*(1-c)];},
 // remove de v a componente ao longo de n (n unitário) e normaliza
 ortho:(v,n)=>{const d=v[0]*n[0]+v[1]*n[1]+v[2]*n[2];return vec.norm([v[0]-n[0]*d,v[1]-n[1]*d,v[2]-n[2]*d]);},
 angle:(a,b)=>Math.acos(clamp(vec.dot(vec.norm(a),vec.norm(b)),-1,1))
};
// gerador mulberry32 com estado explícito (serializável nos snapshots)
function rngNext(r){let a=(r.s=(r.s+0x6D2B79F5)|0);let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const rngRange=(r,a,b)=>a+(b-a)*rngNext(r);
// ruído determinístico por índice (sem estado), para tremor de câmera e detalhes de cenário
function hashNoise(seed,i){let x=Math.imul((seed^Math.imul(i|0,374761393))>>>0,668265263);x=Math.imul(x^(x>>>13),1274126177);return((x^(x>>>16))>>>0)/4294967296;}
function smoothNoise(seed,t){const i=Math.floor(t),f=t-i,u=f*f*(3-2*f);return lerp(hashNoise(seed,i),hashNoise(seed,i+1),u)*2-1;}
const ease={
 linear:t=>t,
 outCubic:t=>1-Math.pow(1-clamp(t,0,1),3),
 inCubic:t=>Math.pow(clamp(t,0,1),3),
 inOutCubic:t=>{t=clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;},
 outExpo:t=>{t=clamp(t,0,1);return t>=1?1:1-Math.pow(2,-10*t);},
 outBack:(t,k=1.70158)=>{t=clamp(t,0,1)-1;return 1+(k+1)*t*t*t+k*t*t;},
 smooth:t=>{t=clamp(t,0,1);return t*t*(3-2*t);}
};
// mola criticamente amortecida (solução exata, estável para qualquer dt)
function springStep(x,v,target,omega,dt){const e=Math.exp(-omega*dt),d=x-target,j=v+omega*d;return [target+(d+j*dt)*e,(v-omega*j*dt)*e];}
// aproximação exponencial independente da taxa de quadros
const damp=(a,b,rate,dt)=>b+(a-b)*Math.exp(-rate*dt);
const dampVec=(a,b,rate,dt)=>{const k=Math.exp(-rate*dt);return [b[0]+(a[0]-b[0])*k,b[1]+(a[1]-b[1])*k,b[2]+(a[2]-b[2])*k];};
const wrap=(x,m)=>((x%m)+m)%m;
// envelope ataque/sustentação/liberação para animações de interface (tempo de simulação)
function envelope(age,attack,hold,release){if(age<0)return 0;if(age<attack)return attack>0?age/attack:1;if(age<attack+hold)return 1;const r=(age-attack-hold)/Math.max(1e-6,release);return r>=1?0:1-r;}
// hash FNV-1a de valores numéricos quantizados (verificação de determinismo)
function stateHash(values){let h=2166136261>>>0;for(const v of values){const q=Math.round(v*1e6);h=Math.imul(h^(q&0xffff),16777619)>>>0;h=Math.imul(h^((q/65536)|0)&0xffff,16777619)>>>0;}return h.toString(16).padStart(8,'0');}
const fmtTime=(t,digits=3)=>{if(!Number.isFinite(t))return '--:--.---';const neg=t<0;t=Math.abs(t);const m=Math.floor(t/60),s=t-m*60;return (neg?'-':'')+String(m).padStart(1,'0')+':'+s.toFixed(digits).padStart(digits+3,'0');};
const deepClone=o=>JSON.parse(JSON.stringify(o));

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

/* P12 V2 — SIMULAÇÃO VISUAL DE CORRIDA (determinística, passo fixo 120 Hz).
   É um cenário de teste para HUD e câmera: NÃO aprova física (P08), IA, energia [31–40],
   combate (P10/P11) nem regras de eliminação [17, 34, 47]. Todos os números abaixo são valores
   de teste deste laboratório. As 30 naves usam desempenho idêntico entre modelos (decisão de
   naves cosméticas): só ritmo/estilo de pilotagem de demonstração variam por competidor. */
const SIM={
 GO:4,TOP_KMH:1290,BOOST_ADD:92,BOOST_DUR:2.3,BOOST_COST:14,BOOST_COOL:1.2,
 DASH_ADD:70,DASH_DUR:.8,ACC:52,DEC:75,LAT_OMEGA:2.4,LAT_VMAX:28,
 HALF_LEN:3.6,HALF_WID:2.3,                         // volume competitivo único para todas as naves
 SIDE_RANGE_S:8,SIDE_MIN_LAT:3.2,SIDE_MAX_LAT:9.5,SIDE_WIND:.3,SIDE_LUNGE:.38,SIDE_DMG:10,SIDE_COST:3,SIDE_COOL:3,
 SPIN_DUR:1.4,SPIN_RADIUS:8,SPIN_DMG:8,SPIN_COST:6,SPIN_COOL:8,
 COL_COOL:.6,BARRIER_DMG:4,BARRIER_COOL:.7,RECHARGE_RATE:24,
 CROSS_STEP:25,CROSS_ORIGIN:-240,GRID_FRONT:-14,GRID_ROW:18,SHIELD_MIN:1,
 CRIT_ENTER:15,CRIT_EXIT:20
};
const PERSONAS=['agressivo','defensivo','técnico','oportunista'];
const DEMO_PAINT=['#2468f6','#f8c32c','#218e54','#e8452c','#7a4fd0','#12b5c9','#ff7ab6','#9bd23c','#f2f2ec','#ff9f1c','#3a3f8f','#c0305a','#2fd6a0','#6e7d99','#d9b44a','#8a2be2','#1f9fff','#ff5a36','#4caf50','#b0b7c9','#e040a0','#00b8a9','#ffd166','#5865f2','#a3e635','#f97316','#14b8a6','#ec4899','#64748b','#facc15'];
const DIST_MAX_KEYS=k=>SIM.CROSS_ORIGIN+k*SIM.CROSS_STEP;
function createRace(opt={}){
 const seed=opt.seed??20261011,laps=opt.laps??3,count=opt.ships??30;
 const rng={s:seed>>>0};
 const models=[];for(const s of SHIPS)for(const v of VARIANT_CODES)models.push([s.id,v]);
 // grid aleatório [12]; o jogador ocupa uma posição de meio de pelotão sorteada pela semente
 const order=[...Array(count).keys()];for(let i=count-1;i>0;i--){const j=Math.floor(rngNext(rng)*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 const playerSlot=Math.min(count-1,Math.floor(count*.45+rngNext(rng)*count*.25));
 const pi=order.indexOf(0);[order[pi],order[playerSlot]]=[order[playerSlot],order[pi]];
 const rivalSlot=Math.min(count-1,playerSlot+1+Math.floor(rngNext(rng)*2));const rivalId=order[rivalSlot];
 const statics=[],ships=[];
 for(let id=0;id<count;id++){
  const isPlayer=id===0,isRival=id===rivalId,[ship,variant]=isPlayer?['falcon','A']:models[(id*4+1)%9];
  const paint=isPlayer?'#2468f6':DEMO_PAINT[id%DEMO_PAINT.length];
  const livery={roles:{paint,secondary:'D',accent:'D',structure:'D',glass:'D',energy:'D',marking:'D'},pinkMix:.55,shadeMix:.68,hierarchy:0,saturation:0,glow:1};
  const persona=isRival?'agressivo':PERSONAS[Math.floor(rngNext(rng)*4)];
  const code=SHIP_MAP[ship].name.split(' ').map(w=>w[0]).join('')+'-'+variant+' '+String(id).padStart(2,'0');
  statics.push({id,ship,variant,livery,code,name:isPlayer?'VOCÊ':isRival?'RIVAL '+code:code,persona,isPlayer,isRival,
   pace:isPlayer?.994:isRival?.99:rngRange(rng,.952,.992),skill:isPlayer?1.02:rngRange(rng,.95,1.03),aggr:isRival?1:persona==='agressivo'?.8:persona==='oportunista'?.55:persona==='técnico'?.25:.15,
   laneBias:rngRange(rng,-.5,.5)});
  const slot=order.indexOf(id),row=Math.floor(slot/3),col=slot%3;
  ships.push({id,s:SIM.GRID_FRONT-row*SIM.GRID_ROW,lane:(col-1)*12,laneT:(col-1)*12,v:0,vLat:0,yaw:0,roll:0,shield:100,dmgFrom:100,dmgT:-99,dmgSide:0,
   boostT:0,boostCool:0,boosts:0,dashT:0,drifting:false,slip:0,driftT:0,
   side:0,sideT:0,sideDir:0,sideTarget:-1,sideCool:2+rngNext(rng)*4,sideHit:false,spinT:0,spinCool:6+rngNext(rng)*6,spinHits:0,stunT:0,spinOutT:0,
   air:false,airS0:0,airGap:0,airH:0,alt:0,lap:0,lapStartT:SIM.GO,lastLap:null,bestLap:null,bestLapIdx:-1,laps:[],sector:0,sectorStartT:SIM.GO,sectors:[null,null,null],lastSectors:[null,null,null],bestSectors:[null,null,null],
   finished:false,finishT:null,place:0,rank:slot+1,inRecharge:false,crit:false,crossK:0,barrierCool:0,offEdge:0});
 }
 const M=Math.ceil((laps*TRACK.L-SIM.CROSS_ORIGIN+800)/SIM.CROSS_STEP);
 const race={seed,laps,count,rivalId,playerSlot,statics,
  state:{tick:0,rng:{s:rng.s},ships,order:ships.map(s=>s.id).sort((a,b)=>ships[a].rank-ships[b].rank),contact:new Float64Array(count*count),director:directorInit(),done:false,doneTick:-1,script:{}},
  events:[],recordedTick:-1,snapshots:new Map(),cross:statics.map(()=>new Float64Array(M).fill(NaN)),tickEvents:[]};
 return race;
}
const raceTime=st=>st.tick*SIM_DT;
function shipProgress(sh){return sh.s;}
// referencial do mundo para uma nave (posição + base ortonormal com deriva, rolagem e voo)
function shipPose(race,sh){
 const f=trackFrame(sh.s),st=race.statics[sh.id];
 let p=vec.madd(vec.madd(f.p,f.R,sh.lane),f.N,.9+sh.alt);
 let T=f.T,N=f.N,R=f.R;
 const yaw=sh.yaw;if(yaw){T=vec.rot(T,N,-yaw);R=vec.cross(T,N);}   // yaw + = nariz para a esquerda
 if(sh.roll){N=vec.rot(N,T,sh.roll);R=vec.cross(T,N);}
 return {p,T,N,R,frame:f};
}
function emit(race,type,a,b,data){race.tickEvents.push({t:raceTime(race.state),tick:race.state.tick,type,a,b,data:data||null});}
// ------------------------------------------------------------------ roteiro do jogador
// Momentos de teste ligados à pista (não a tempos fixos), para que cada semente produza situações equivalentes.
const PLAYER_SCRIPT=[
 {id:'boost-l2a',lap:1,at:120,act:'boost'},{id:'boost-l2b',lap:1,at:620,act:'boost'},
 {id:'edge-l2',lap:1,from:()=>TRACK.features.openEdge.s0+60,to:()=>TRACK.features.openEdge.s0+420,act:'edge'},
 {id:'skip-recharge-l2',lap:1,from:()=>TRACK.features.recharge.s0-200,to:()=>TRACK.features.recharge.s1,act:'avoidRecharge'},
 {id:'scrape-l2',lap:1,from:()=>{const c=TRACK.features.corners.find(c=>c.name==='Curva Inclinada');return c.s1-260;},to:()=>{const c=TRACK.features.corners.find(c=>c.name==='Curva Inclinada');return c.s1+40;},act:'scrape'},
 {id:'boost-l2c',lap:1,at:()=>TRACK.features.dash[2].s-500,act:'boost'},
 {id:'boost-l3a',lap:2,at:150,act:'boost'},{id:'boost-l3b',lap:2,at:700,act:'boost'},{id:'boost-l3c',lap:2,at:()=>TRACK.features.corners[2].s0-500,act:'boost'},
 {id:'recharge-l3',lap:2,from:()=>TRACK.features.recharge.s0-300,to:()=>TRACK.features.recharge.s1,act:'recharge'},
 {id:'attack-l3',lap:2,from:()=>TRACK.features.corners.find(c=>c.name==='Esse Final D').s0-900,to:()=>TRACK.features.corners.find(c=>c.name==='Esse Final E').s1,act:'hunt'},
 {id:'boost-l3d',lap:2,at:()=>TRACK.L-1500,act:'boost'}
];
const scriptVal=v=>typeof v==='function'?v():v;
function raceStep(race){
 const st=race.state,t=raceTime(st),dt=SIM_DT,ships=st.ships,S=race.statics,L=TRACK.L,n=ships.length;
 race.tickEvents=[];
 for(const k of [3,2,1])if(st.tick===Math.round((SIM.GO-k)*SIM_HZ))emit(race,'countdown',-1,-1,{n:k});
 if(st.tick===Math.round(SIM.GO*SIM_HZ))emit(race,'go',-1,-1,null);
 const racing=t>=SIM.GO,player=ships[0],rival=ships[race.rivalId];
 // ordem atual (do mais avançado para trás) para vizinhança
 const order=st.order,rankIdx=new Int32Array(n);for(let q=0;q<n;q++)rankIdx[order[q]]=q;
 for(const sh of ships){const sd=S[sh.id];
  if(sh.boostCool>0)sh.boostCool-=dt;if(sh.sideCool>0)sh.sideCool-=dt;if(sh.spinCool>0)sh.spinCool-=dt;if(sh.barrierCool>0)sh.barrierCool-=dt;
  if(!racing){sh.v=0;continue;}
  const lapIdx=Math.floor(sh.s/L),lapS=wrap(sh.s,L),hw=trackHw(sh.s),fl=trackFlags(sh.s);
  // -------- alvo de velocidade
  let vTop=SIM.TOP_KMH/KMH*sd.pace;
  if(sh.finished)vTop*=.62;
  // elástico de teste do rival em torno do jogador (GDD [53] ainda não especificado)
  if(sd.isRival&&!sh.finished&&!player.finished){const gap=player.s-8-sh.s;vTop*=1+clamp(gap/500,-.05,.07);}
  if(!sd.isPlayer&&!sd.isRival&&!sh.finished){const gap=player.s-sh.s;vTop*=1+clamp(gap/9000,-.012,.012);} // pelotão mais compacto
  let vt=Math.min(vTop,trackVlim(sh.s+sh.v*.25)*sd.skill);
  if(sh.boostT>0){vt=vTop+SIM.BOOST_ADD;sh.boostT-=dt;if(sh.boostT<=0){sh.boostT=0;emit(race,'boostEnd',sh.id,-1,null);}}
  if(sh.dashT>0){vt=Math.max(vt,vTop)+SIM.DASH_ADD;sh.dashT-=dt;}
  if(sh.stunT>0){vt*=.8;sh.stunT-=dt;}
  if(sh.air)vt=sh.v;
  const acc=sh.v<vt?Math.min(SIM.ACC*(sh.v<120?1.35:1),(vt-sh.v)*1.8+4)+(sh.boostT>0?40:0):-Math.min(SIM.DEC,(sh.v-vt)*2.4+2);
  sh.v=Math.max(0,sh.v+acc*dt);
  // -------- deriva: excesso de velocidade em curva fechada ou impulso em curva
  const k=trackCurv(sh.s),lim=trackVlim(sh.s)*sd.skill;
  const wantDrift=!sh.air&&Math.abs(k)>1/800&&sh.v>lim*.985;
  if(wantDrift&&!sh.drifting){sh.drifting=true;sh.driftT=0;emit(race,'driftStart',sh.id,-1,{dir:Math.sign(k)});}
  if(sh.drifting){sh.driftT+=dt;const target=clamp((sh.v-lim*.9)/(lim*.18),.2,1)*Math.sign(k);sh.slip=damp(sh.slip,target,6,dt);
   if(!wantDrift&&sh.driftT>.25){sh.drifting=false;emit(race,'driftEnd',sh.id,-1,{t:sh.driftT});}}
  else sh.slip=damp(sh.slip,0,5,dt);
  // -------- linha de corrida, ultrapassagem, recarga e roteiro
  const ahead=k?-Math.sign(k)*hw*.45:0;           // interior da curva (esquerda = faixa negativa)
  let laneT=clamp(ahead+sd.laneBias*hw*.5,-hw+4,hw-4);
  if(fl&TF.dash||trackFlags(sh.s+250)&TF.dash)laneT=sd.laneBias*6;
  const rz=TRACK.features.recharge;
  const inRZ=lapS>=rz.s0-250&&lapS<rz.s1;
  let wantRecharge=!sd.isPlayer&&sh.shield<58;
  // roteiro do jogador
  let script=null;
  if(sd.isPlayer&&!sh.finished){for(const b of PLAYER_SCRIPT){if(b.lap!==lapIdx)continue;
    if(b.at!==undefined){const at=scriptVal(b.at);if(lapS>=at&&lapS<at+400&&!st.script[b.id]){if(sh.boostCool<=0&&sh.boostT<=0&&sh.shield>SIM.BOOST_COST+2){st.script[b.id]=1;startBoost(race,sh);}}}
    else if(lapS>=scriptVal(b.from)&&lapS<scriptVal(b.to)){script=b.act;if(!st.script[b.id]){st.script[b.id]=1;emit(race,'script',sh.id,-1,{id:b.id,act:b.act});}}}
   if(script==='recharge')wantRecharge=sh.shield<70;
   if(script==='avoidRecharge')wantRecharge=false;
   if(script==='edge')laneT=hw-3.4;
   if(script==='scrape')laneT=hw+2;
  }
  if(inRZ&&wantRecharge)laneT=(rz.laneMin+rz.laneMax)/2;
  // evitação: nave à frente na mesma faixa e mais lenta
  {const idx=rankIdx[sh.id];for(let q=idx-1;q>=0&&q>=idx-6;q--){const o=ships[order[q]];const ds_=o.s-sh.s;if(ds_>70)break;if(ds_<=0||o.air!==sh.air)continue;
    if(Math.abs(o.lane-sh.lane)<5.2&&sh.v>o.v-3){
     if(!script||script==='recharge'||script==='hunt'){const room=o.lane>sh.lane?-1:1,alt=clamp(o.lane+room*6.8,-hw+3,hw-3);laneT=Math.abs(alt-o.lane)>5?alt:clamp(o.lane-room*6.8,-hw+3,hw-3);}
     if(ds_<26&&Math.abs(o.lane-sh.lane)<4.7)vt=Math.min(vt,o.v+(ds_-10)*.6);}}
   const acc2=sh.v<vt?0:-Math.min(SIM.DEC,(sh.v-vt)*2.4+2);if(acc2<0&&sh.v>vt)sh.v=Math.max(vt,sh.v+acc2*dt);}
  // ataque lateral (fases: telegrafia → investida → recuperação)
  if(sh.side===1){sh.sideT+=dt;if(sh.sideT>=SIM.SIDE_WIND){sh.side=2;sh.sideT=0;sh.vLat=sh.sideDir*24;emit(race,'sideLunge',sh.id,sh.sideTarget,{dir:sh.sideDir});}}
  else if(sh.side===2){sh.sideT+=dt;laneT=sh.lane+sh.sideDir*6;const tg=ships[sh.sideTarget];
   if(!sh.sideHit&&tg&&Math.abs(tg.s-sh.s)<SIM.HALF_LEN*2&&Math.abs(tg.lane-sh.lane)<SIM.HALF_WID*2+.6&&!tg.air){sh.sideHit=true;hitShip(race,tg,SIM.SIDE_DMG,-sh.sideDir,'side',sh.id);tg.vLat+=sh.sideDir*16;tg.spinOutT=tg.shield<40?.7:0;tg.stunT=.45;emit(race,'sideHit',sh.id,tg.id,{dir:sh.sideDir,dmg:SIM.SIDE_DMG});}
   if(sh.sideT>=SIM.SIDE_LUNGE){if(!sh.sideHit)emit(race,'sideMiss',sh.id,sh.sideTarget,{dir:sh.sideDir});sh.side=0;sh.sideT=0;sh.sideTarget=-1;sh.sideCool=SIM.SIDE_COOL;}}
  else if(sh.sideCool<=0&&!sh.air&&!sh.finished&&sh.spinT<=0&&sh.shield>SIM.SIDE_COST+8){
   // escolha de alvo
   let best=-1,bd=1e9;const idx=rankIdx[sh.id];
   for(let q=Math.max(0,idx-3);q<=Math.min(n-1,idx+3);q++){const o=ships[order[q]];if(o===sh||o.finished||o.air)continue;const dsx=Math.abs(o.s-sh.s),dl=o.lane-sh.lane;
    if(dsx<SIM.SIDE_RANGE_S&&Math.abs(dl)>SIM.SIDE_MIN_LAT&&Math.abs(dl)<SIM.SIDE_MAX_LAT&&dsx+Math.abs(dl)<bd){bd=dsx+Math.abs(dl);best=o.id;}}
   let p=sd.aggr*.9*dt;if(sd.isRival&&best===0)p=2.2*dt;if(sd.isPlayer)p=script==='hunt'&&best>=0?(best===race.rivalId?6:2.5)*dt:0;
   if(!sd.isPlayer&&best===0&&lapIdx<1)p*=.15;                  // primeira volta: disputa sem assédio constante ao jogador
   if(best>=0&&rngNext(st.rng)<p){sh.side=1;sh.sideT=0;sh.sideTarget=best;sh.sideDir=Math.sign(ships[best].lane-sh.lane)||1;sh.sideHit=false;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-SIM.SIDE_COST);emit(race,'sideWindup',sh.id,best,{dir:sh.sideDir});}
  }
  // ataque giratório
  if(sh.spinT>0){sh.spinT-=dt;for(const o of ships){if(o===sh||o.air||(sh.spinHits&(1<<o.id)))continue;const d=Math.hypot(o.s-sh.s,o.lane-sh.lane);if(d<SIM.SPIN_RADIUS){sh.spinHits|=(1<<o.id);const dir=Math.sign(o.lane-sh.lane)||1;hitShip(race,o,SIM.SPIN_DMG,-dir,'spin',sh.id);o.vLat+=dir*12;o.stunT=.35;emit(race,'spinHit',sh.id,o.id,{dir,dmg:SIM.SPIN_DMG});}}
   if(sh.spinT<=0){sh.spinT=0;emit(race,'spinEnd',sh.id,-1,null);}}
  else if(sh.spinCool<=0&&!sh.air&&!sh.finished&&sh.side===0&&sh.shield>SIM.SPIN_COST+10){
   let near=0;const idx=rankIdx[sh.id];for(let q=Math.max(0,idx-4);q<=Math.min(n-1,idx+4);q++){const o=ships[order[q]];if(o!==sh&&!o.air&&Math.abs(o.s-sh.s)<SIM.SPIN_RADIUS&&Math.hypot(o.s-sh.s,o.lane-sh.lane)<SIM.SPIN_RADIUS*.9)near++;}
   const p=sd.isPlayer?(script==='hunt'&&near>=1?3*dt:0):near>=2?sd.aggr*.7*dt:0;
   if(near&&rngNext(st.rng)<p){sh.spinT=SIM.SPIN_DUR;sh.spinHits=0;sh.spinCool=SIM.SPIN_COOL;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-SIM.SPIN_COST);emit(race,'spinStart',sh.id,-1,{near});}}
  // impulso (IA): a partir da volta 2, em reta, com escudo suficiente
  if(!sd.isPlayer&&lapIdx>=1&&!sh.finished&&sh.boostT<=0&&sh.boostCool<=0&&Math.abs(k)<1/1500&&sh.shield>48&&!sh.air){if(rngNext(st.rng)<(.05+sd.aggr*.12)*dt)startBoost(race,sh);}
  // -------- dinâmica lateral (mola crítica limitada)
  sh.laneT=laneT;
  if(!sh.air){const [nl,nv]=springStep(sh.lane,sh.vLat,laneT,SIM.LAT_OMEGA*(sh.stunT>0?.5:1),dt);sh.vLat=clamp(nv,-SIM.LAT_VMAX,SIM.LAT_VMAX);sh.lane=sh.lane+sh.vLat*dt;}
  const flags=trackFlags(sh.s),lim2=hw-SIM.HALF_WID;
  if(sh.lane>lim2||sh.lane<-lim2){const side=Math.sign(sh.lane);const open=(side>0&&!(flags&TF.barrierR))||(side<0&&!(flags&TF.barrierL));
   if(!open||sh.air){sh.lane=side*lim2;if(sh.vLat*side>0)sh.vLat=-sh.vLat*.3;if(!sh.air&&sh.barrierCool<=0){sh.barrierCool=SIM.BARRIER_COOL;sh.v*=.94;hitShip(race,sh,SIM.BARRIER_DMG,side,'barrier',-1);emit(race,'barrier',sh.id,-1,{side,dmg:SIM.BARRIER_DMG});}}
   else{// borda aberta: o laboratório não decide queda/eliminação; a nave é contida na linha da borda
    sh.lane=side*lim2;sh.vLat=Math.min(0,sh.vLat*side)*side;sh.offEdge+=dt;}}
  // -------- avanço longitudinal, salto e voltas
  const s0=sh.s;sh.s+=sh.v*dt;
  const J=TRACK.features.jump,ls0=wrap(s0,L),ls1=wrap(sh.s,L);
  if(!sh.air&&ls0<J.lip&&ls1>=J.lip&&racing){sh.air=true;sh.airS0=sh.s-(ls1-J.lip);sh.airGap=J.gap;sh.airH=6+sh.v*.02;emit(race,'takeoff',sh.id,-1,{v:sh.v,h:sh.airH});}
  if(sh.air){const u=(sh.s-sh.airS0)/sh.airGap;if(u>=1){sh.air=false;sh.alt=0;sh.v*=.985;emit(race,'landing',sh.id,-1,{v:sh.v});}else sh.alt=sh.airH*4*u*(1-u);}
  // placas de aceleração
  if(!sh.air&&(flags&TF.dash)&&sh.dashT<=0){for(const d of TRACK.features.dash){if(ls1>=d.s&&ls1<d.s+d.len&&sh.lane>=d.lane0&&sh.lane<=d.lane1){sh.dashT=SIM.DASH_DUR;emit(race,'dash',sh.id,-1,null);break;}}}
  // recarga
  const rech=!sh.air&&(flags&TF.recharge)&&sh.lane>=rz.laneMin-1&&sh.lane<=rz.laneMax+1;
  if(rech&&!sh.inRecharge)emit(race,'rechargeIn',sh.id,-1,null);if(!rech&&sh.inRecharge)emit(race,'rechargeOut',sh.id,-1,{shield:sh.shield});
  sh.inRecharge=!!rech;if(rech)sh.shield=Math.min(100,sh.shield+SIM.RECHARGE_RATE*dt);
  // limiar crítico com histerese
  if(!sh.crit&&sh.shield<SIM.CRIT_ENTER){sh.crit=true;emit(race,'shieldCritical',sh.id,-1,{on:true,shield:sh.shield});}
  if(sh.crit&&sh.shield>SIM.CRIT_EXIT){sh.crit=false;emit(race,'shieldCritical',sh.id,-1,{on:false,shield:sh.shield});}
  // registro de passagem (intervalos reais entre naves)
  const log=race.cross[sh.id];while(sh.crossK<log.length&&DIST_MAX_KEYS(sh.crossK)<=sh.s){const d=DIST_MAX_KEYS(sh.crossK);log[sh.crossK]=t+dt*((d-s0)/Math.max(1e-9,sh.s-s0));sh.crossK++;}
  // setores e voltas
  if(!sh.finished&&sh.s>=0){const third=L/3,sec=Math.floor(sh.s/third),old=Math.floor(Math.max(0,s0)/third);
   if(s0<0&&sh.s>=0){sh.lapStartT=t+dt*((0-s0)/(sh.s-s0));sh.sectorStartT=sh.lapStartT;emit(race,'lapStart',sh.id,-1,{lap:1});}
   else if(sec>old){const tc=t+dt*((sec*third-s0)/(sh.s-s0)),si=old%3,stime=tc-sh.sectorStartT;sh.sectors[si]=stime;if(sh.bestSectors[si]===null||stime<sh.bestSectors[si])sh.bestSectors[si]=stime;sh.sectorStartT=tc;emit(race,'sector',sh.id,-1,{sector:si+1,time:stime,best:sh.bestSectors[si]===stime});
    if(si===2){const lt=tc-sh.lapStartT;sh.lap++;sh.laps.push(lt);sh.lastLap=lt;const best=sh.bestLap===null||lt<sh.bestLap;if(best){sh.bestLap=lt;sh.bestLapIdx=sh.lap-1;}sh.lastSectors=sh.sectors.slice();sh.sectors=[null,null,null];sh.lapStartT=tc;
     emit(race,'lap',sh.id,-1,{lap:sh.lap,time:lt,best,delta:sh.laps.length>1?lt-Math.min(...sh.laps.slice(0,-1)):null});
     if(sh.lap>=race.laps){sh.finished=true;sh.finishT=tc;emit(race,'finish',sh.id,-1,{time:tc-SIM.GO});}
     else if(sh.lap===race.laps-1)emit(race,'finalLap',sh.id,-1,null);}}}
  // -------- pose visual: deriva, giro, rolagem
  sh.yaw=-sh.slip*.38;
  if(sh.spinOutT>0){sh.spinOutT-=dt;sh.yaw+=TAU*(1-Math.max(0,sh.spinOutT)/.7);}
  sh.roll=clamp(-sh.vLat*.012,-.35,.35)*(sh.air?.4:1);
 }
 // -------- colisões entre vizinhos ordenados (resposta pontual com intervalo por par)
 const cc=st.contact;   // instante até o qual o par está em intervalo de contato
 const ord=[...order].sort((a,b)=>ships[b].s-ships[a].s||a-b);
 for(let a=0;a<ord.length;a++){const A=ships[ord[a]];for(let b=a+1;b<ord.length;b++){const B=ships[ord[b]];const dsx=A.s-B.s;if(dsx>SIM.HALF_LEN*2)break;if(A.air!==B.air||!racing)continue;const dl=B.lane-A.lane;
   if(Math.abs(dl)<SIM.HALF_WID*2){const key=Math.min(A.id,B.id)*n+Math.max(A.id,B.id),push=(SIM.HALF_WID*2-Math.abs(dl))*.5,dir=Math.sign(dl)||1;
    A.lane-=dir*push;B.lane+=dir*push;
    const rv=Math.abs(A.v-B.v)+Math.abs(A.vLat-B.vLat)*2.2;
    if(cc[key]<=t&&rv>4){cc[key]=t+SIM.COL_COOL;const dmg=Math.min(12,1+rv*.1);
     const tv=(A.v+B.v)/2;A.v=lerp(A.v,tv,.25);B.v=lerp(B.v,tv,.25);A.vLat-=dir*6;B.vLat+=dir*6;
     hitShip(race,A,dmg,dir,'collision',B.id);hitShip(race,B,dmg,-dir,'collision',A.id);emit(race,'collision',A.id,B.id,{dir,dmg,rv});}}}}
 // -------- classificação: chegada por tempo exato; demais por progresso
 const rank=[...order].sort((a,b)=>{const A=ships[a],B=ships[b];if(A.finished||B.finished){if(A.finished&&B.finished)return A.finishT-B.finishT||a-b;return A.finished?-1:1;}return B.s-A.s||a-b;});
 for(let i=0;i<rank.length;i++){const sh=ships[rank[i]];if(sh.rank!==i+1&&racing){if(rank[i]===0)emit(race,'position',0,-1,{from:sh.rank,to:i+1});}sh.rank=i+1;if(sh.finished&&!sh.place)sh.place=i+1;}
 // ultrapassagens que envolvem o jogador (quem passou quem)
 if(racing){const prev=st.order;const pPrev=prev.indexOf(0),pNow=rank.indexOf(0);if(pNow<pPrev){for(let q=pNow+1;q<=pPrev;q++)emit(race,'overtake',0,rank[q],null);}else if(pNow>pPrev){for(let q=pPrev;q<pNow;q++)emit(race,'overtaken',rank[q],0,null);}}
 st.order=rank;
 directorTick(race,st.director);
 // registro imutável de eventos
 if(st.tick>race.recordedTick){for(const e of race.tickEvents)race.events.push(e);race.recordedTick=st.tick;if(st.tick%SIM_HZ===0)race.snapshots.set(st.tick,snapshotState(st));}
 st.tick++;
 if(!st.done&&player.finished&&ships.every(s=>s.finished||raceTime(st)>player.finishT+40)){st.done=true;st.doneTick=st.tick;}
}
function startBoost(race,sh){sh.boostT=SIM.BOOST_DUR;sh.boostCool=SIM.BOOST_DUR+SIM.BOOST_COOL;sh.boosts++;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-SIM.BOOST_COST);emit(race,'boostStart',sh.id,-1,{cost:SIM.BOOST_COST,shield:sh.shield});}
function hitShip(race,sh,dmg,side,kind,by){if(sh.finished)dmg=0;const t=raceTime(race.state);
 // trilha de dano: valor antes do impacto (para a barra "fantasma" do HUD)
 if(t-sh.dmgT>.6)sh.dmgFrom=sh.shield;sh.dmgT=t;sh.dmgSide=side;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-dmg);sh.lastHitKind=kind;sh.lastHitBy=by;}
// ------------------------------------------------------------------ snapshots e busca
function snapshotState(st){return {tick:st.tick,rng:{s:st.rng.s},ships:st.ships.map(s=>({...s,laps:s.laps.slice(),sectors:s.sectors.slice(),lastSectors:s.lastSectors.slice(),bestSectors:s.bestSectors.slice()})),order:st.order.slice(),contact:Float64Array.from(st.contact),director:directorClone(st.director),done:st.done,doneTick:st.doneTick,script:{...st.script}};}
function restoreState(race,snap){const c=snapshotState(snap);race.state=c;}
// avança até o fim (ou até maxTicks); usado para pré-calcular a corrida e os marcadores da linha do tempo
function raceRun(race,maxTicks=Infinity){let k=0;while(!race.state.done&&k<maxTicks){raceStep(race);k++;}return race.state.done;}
function raceSeek(race,tick,onTick){tick=Math.max(0,Math.round(tick));let key=Math.floor(tick/SIM_HZ)*SIM_HZ;while(key>0&&!race.snapshots.has(key))key-=SIM_HZ;
 const base=race.snapshots.get(key);if(base)restoreState(race,base);else{const fresh=createRace({seed:race.seed,laps:race.laps,ships:race.count});race.state=fresh.state;}
 while(race.state.tick<tick){raceStep(race);if(onTick)onTick(race);}}
function stateDigest(st){const v=[st.tick,st.rng.s];for(const s of st.ships)v.push(s.s,s.lane,s.v,s.vLat,s.shield,s.lap,s.rank,s.boostT,s.slip,s.alt,s.side,s.spinT);return stateHash(v);}
const eventsUpTo=(race,t)=>{let lo=0,hi=race.events.length;while(lo<hi){const m=(lo+hi)>>1;if(race.events[m].t<=t+1e-9)lo=m+1;else hi=m;}return lo;};
// ------------------------------------------------------------------ cenários reproduzíveis (marcadores na corrida canônica)
const SCENARIOS=[
 {id:'start',name:'Largada',desc:'Contagem, grid aleatório e primeira aceleração.',find:()=>0},
 {id:'traffic',name:'Tráfego intenso',desc:'Pelotão compacto na chicane estreita da volta 1.',find:r=>firstEv(r,e=>e.type==='overtake'&&e.t>SIM.GO+8,-1.5)},
 {id:'highspeed',name:'Alta velocidade',desc:'Impulso duplo na reta principal (volta 2).',find:r=>firstEv(r,e=>e.type==='boostStart'&&e.a===0,-1)},
 {id:'loop',name:'Loop vertical',desc:'Entrada no loop: referencial invertido, câmera e HUD.',find:r=>crossT(r,0,TRACK.L+TRACK.features.loop.s0)-1.2},
 {id:'jump',name:'Salto',desc:'Decolagem, voo e pouso no vão de 340 m.',find:r=>firstEv(r,e=>e.type==='takeoff'&&e.a===0,-1.6)},
 {id:'defense',name:'Defesa',desc:'O rival telegrafa um ataque lateral contra você.',find:r=>firstEv(r,e=>e.type==='sideWindup'&&e.b===0,-1.8)},
 {id:'impact',name:'Impacto',desc:'Raspagem na barreira na saída da curva inclinada.',find:r=>firstEv(r,e=>e.type==='barrier'&&e.a===0,-1.2)},
 {id:'edge',name:'Borda aberta',desc:'Trecho sem barreira: aviso de saída de pista.',find:r=>firstEv(r,e=>e.type==='script'&&e.a===0&&e.data.act==='edge',-.6)},
 {id:'lowenergy',name:'Baixa energia',desc:'Escudo crítico após impulsos; recarga na volta 3.',find:r=>firstEv(r,e=>e.type==='shieldCritical'&&e.a===0&&e.data.on,-1.4)},
 {id:'duel',name:'Disputa',desc:'Você caça o rival no Esse final (ataque lateral/giratório).',find:r=>firstEv(r,e=>(e.type==='sideWindup'||e.type==='spinStart')&&e.a===0,-2)},
 {id:'finallap',name:'Volta final',desc:'Transição para a última volta.',find:r=>firstEv(r,e=>e.type==='finalLap'&&e.a===0,-2.5)},
 {id:'finish',name:'Conclusão',desc:'Linha de chegada e resultado (cenário de teste).',find:r=>firstEv(r,e=>e.type==='finish'&&e.a===0,-5)}
];
function firstEv(r,pred,lead){const e=r.events.find(pred);return e?Math.max(0,e.t+lead):null;}
function crossT(r,id,d){const k=(d-SIM.CROSS_ORIGIN)/SIM.CROSS_STEP,i=Math.floor(k),f=k-i,log=r.cross[id];if(i<0||i+1>=log.length||Number.isNaN(log[i+1]))return null;return lerp(log[i],log[i+1],f);}

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
 const t=raceTime(race.state),ships=race.state.ships,P=ships[0];
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
   case 'position':if(e.a===0){const m=add('position',1.5,{from:e.data.from,to:e.data.to},'pos');if(m&&m.data.from===m.data.to)m.t1=t;}break;
   case 'lap':if(e.a===0){add('lap',2.6,{...e.data});if(e.data.lap===1)add('boostReady',2.2,{});}break;
   case 'finalLap':if(e.a===0)add('finalLap',2.8,{});break;
   case 'finish':if(e.a===0)add('finish',1e9,{time:e.data.time,place:P.rank});break;
   case 'dash':if(e.a===0)add('dash',.9,{});break;
   case 'takeoff':if(e.a===0){add('airborne',2,{h:e.data.h});d.flags.air=true;}break;
   case 'landing':if(e.a===0){end(m=>m.type==='airborne');d.flags.air=false;}break;
  }
 }
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

const t0=Date.now();const r=createRace({});raceRun(r,40000);console.log('ms',Date.now()-t0);