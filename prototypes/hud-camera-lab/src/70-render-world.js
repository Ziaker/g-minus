/* P12 V2 — RENDERIZADOR DO AMBIENTE DE TESTE (explicitamente NÃO definitivo; P03/P09 decidem pistas
   e cenários). Mesma gramática D: luz em degraus (fórmula do passe D), retícula de 5 px nas sombras,
   contornos de tinta por casca invertida nas estruturas, neon seletivo e névoa violeta. */
const WORLD_VS=`precision highp float;attribute vec3 a_pos;attribute vec3 a_nrm;attribute vec4 a_col;uniform mat4 u_vp;varying vec3 v_n;varying vec4 v_c;varying vec3 v_w;
void main(){v_n=a_nrm;v_c=a_col;v_w=a_pos;gl_Position=u_vp*vec4(a_pos,1.0);}`;
const WORLD_FS=`precision highp float;varying vec3 v_n;varying vec4 v_c;varying vec3 v_w;uniform vec3 u_light;uniform vec3 u_eye;uniform vec3 u_fog;uniform float u_fogNear;uniform float u_fogFar;
void main(){vec3 c=v_c.rgb;float d=distance(v_w,u_eye);
 if(v_c.a<0.5){vec3 N=normalize(v_n);if(!gl_FrontFacing)N=-N;float nd=max(dot(N,normalize(u_light)),0.0);float steps=floor((.25+.78*nd)*3.2)/3.0;c=c*(.44+1.18*steps);
  vec2 uv=mod(gl_FragCoord.xy,vec2(5.0));float dotv=step(length(uv-2.5),1.35);c*=1.0-.14*dotv*(1.0-steps);}
 float f=smoothstep(u_fogNear,u_fogFar,d);c=mix(c,u_fog,f*(v_c.a<0.5?1.0:.7));
 gl_FragColor=vec4(pow(clamp(c,0.0,1.0),vec3(.82)),1.0);}`;
const SKY_VS=`attribute vec2 a_xy;varying vec2 v_xy;void main(){v_xy=a_xy;gl_Position=vec4(a_xy,0.9999,1.0);}`;
const SKY_FS=`precision highp float;varying vec2 v_xy;uniform mat4 u_inv;uniform vec3 u_moon;
void main(){vec4 a=u_inv*vec4(v_xy,-1.0,1.0),b=u_inv*vec4(v_xy,1.0,1.0);vec3 d=normalize(b.xyz/b.w-a.xyz/a.w);float y=d.y;
 vec3 top=vec3(.024,.02,.075),mid=vec3(.09,.035,.16),hor=vec3(.36,.07,.30),low=vec3(.03,.025,.06);
 vec3 c=y>0.0?mix(mix(hor,mid,smoothstep(0.0,.12,y)),top,smoothstep(.12,.7,y)):mix(hor*.6,low,smoothstep(0.0,-.18,y));
 float band=exp(-abs(y)*38.0);c+=vec3(.9,.25,.55)*band*.18;
 float m=dot(d,normalize(u_moon));if(m>.9965){vec2 uv=mod(gl_FragCoord.xy,vec2(6.0));float dotv=step(length(uv-3.0),1.6+ (m-.9965)*500.0);c=mix(c,vec3(1.0,.93,.8),.55+.45*dotv);}
 else if(m>.996)c=mix(c,vec3(.03,.02,.06),1.0);
 gl_FragColor=vec4(pow(c,vec3(.82)),1.0);}`;
const WC={road:[.085,.078,.17],roadDark:[.06,.055,.13],lane:[.86,.80,.66],ink:[.025,.02,.06],kerbA:[1,.23,.6],barrier:[.15,.10,.27],cap:[.26,.94,.87],under:[.05,.04,.11],underGlow:[1,.28,.58],recharge:[.10,.24,.30],rechargeMark:[.26,.94,.87],dash:[1,.65,.21],hazard:[1,.65,.21],board:[.06,.045,.12],chevron:[1,.28,.58],pylon:[.12,.09,.22],ground:[.03,.025,.065],grid:[.13,.09,.27],gate:[.18,.12,.33],paper:[1,.95,.82]};
const FOG={col:[.13,.05,.20],near:700,far:3600};
const WORLD={prog:null,a:{},u:{},sky:null,skyBuf:null,chunks:[],city:[],ground:null,built:false,tris:0,live:0};
/* ---------------- geração de malha ---------------- */
class MeshBuf{constructor(){this.d=[];}
 v(p,n,c,e){this.d.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],e?1:0);}
 tri(a,b,c,col,e,n){n=n||vec.norm(vec.cross(vec.sub(b,a),vec.sub(c,a)));this.v(a,n,col,e);this.v(b,n,col,e);this.v(c,n,col,e);}
 quad(a,b,c,d,col,e,n){this.tri(a,b,c,col,e,n);this.tri(a,c,d,col,e,n);}
 box(c,ax,ay,az,h,col,e){// caixa orientada: centro, eixos unitários e meias medidas h=[hx,hy,hz]
  const P=(sx,sy,sz)=>vec.add(vec.add(vec.add(c,vec.scale(ax,sx*h[0])),vec.scale(ay,sy*h[1])),vec.scale(az,sz*h[2]));
  const F=[[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1],ax],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1],vec.scale(ax,-1)],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1],ay],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1],vec.scale(ay,-1)],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],az],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],vec.scale(az,-1)]];
  for(const f of F)this.quad(P(...f[0]),P(...f[1]),P(...f[2]),P(...f[3]),col,e,f[4]);}
 shell(c,ax,ay,az,h,t){// casca de tinta: caixa ampliada com faces invertidas (desenhada com culling de frente)
  const H=[h[0]+t,h[1]+t,h[2]+t],P=(sx,sy,sz)=>vec.add(vec.add(vec.add(c,vec.scale(ax,sx*H[0])),vec.scale(ay,sy*H[1])),vec.scale(az,sz*H[2]));
  const F=[[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]];
  for(const f of F){const a=P(...f[0]),b=P(...f[1]),cc=P(...f[2]),d=P(...f[3]);this.tri(a,cc,b,WC.ink,1);this.tri(a,d,cc,WC.ink,1);}}
}
const TS=i=>{i=wrap(i,TRACK.n);return {p:[TRACK.pos[i*3],TRACK.pos[i*3+1],TRACK.pos[i*3+2]],T:[TRACK.T[i*3],TRACK.T[i*3+1],TRACK.T[i*3+2]],N:[TRACK.N[i*3],TRACK.N[i*3+1],TRACK.N[i*3+2]],R:[TRACK.R[i*3],TRACK.R[i*3+1],TRACK.R[i*3+2]],hw:TRACK.hw[i],fl:TRACK.flags[i],s:i*TRACK.ds};};
const CHUNK=50;
function buildTrackChunk(c0){
 const mb=new MeshBuf(),ol=new MeshBuf(),n=TRACK.n,ds=TRACK.ds;
 const at=(S,lane,up=0)=>vec.madd(vec.madd(S.p,S.R,lane),S.N,up);
 for(let i=c0;i<Math.min(n,c0+CHUNK);i++){
  const A=TS(i),B=TS(i+1),s=A.s;if(A.fl&TF.gap)continue;
  const sl=(S,l,u)=>at(S,l,u);
  // superfície em faixas (painéis escuros a cada 40 m)
  const panel=Math.floor(s/40)%2===0?WC.road:WC.roadDark;
  const edges=[-A.hw,-A.hw*.5,0,A.hw*.5,A.hw],edgesB=[-B.hw,-B.hw*.5,0,B.hw*.5,B.hw];
  for(let k=0;k<4;k++)mb.quad(sl(A,edges[k],0),sl(B,edgesB[k],0),sl(B,edgesB[k+1],0),sl(A,edges[k+1],0),panel,0,A.N);
  // zona de recarga
  if(A.fl&TF.recharge){const r=TRACK.features.recharge;mb.quad(sl(A,r.laneMin,.02),sl(B,r.laneMin,.02),sl(B,r.laneMax,.02),sl(A,r.laneMax,.02),WC.recharge,0,A.N);
   if(Math.floor(s/16)%2===0){const m=(r.laneMin+r.laneMax)/2;mb.quad(sl(A,m-2.6,.04),sl(B,m,.04),sl(B,m+.6,.04),sl(A,m-2,.04),WC.rechargeMark,1,A.N);mb.quad(sl(A,m+2,.04),sl(B,m-.6,.04),sl(B,m,.04),sl(A,m+2.6,.04),WC.rechargeMark,1,A.N);}
   mb.quad(sl(A,r.laneMax,.03),sl(B,r.laneMax,.03),sl(B,r.laneMax+.35,.03),sl(A,r.laneMax+.35,.03),WC.rechargeMark,1,A.N);}
  // tracejado de faixas (14 m traço / 32 m ciclo) e linha central magenta fina
  if(s%32<14&&!(A.fl&TF.recharge&&false))for(const l of [-A.hw/3,A.hw/3]){const lb=l*B.hw/A.hw;mb.quad(sl(A,l-.18,.03),sl(B,lb-.18,.03),sl(B,lb+.18,.03),sl(A,l+.18,.03),WC.lane,0,A.N);}
  // placas de aceleração (chevrons dourados emissivos)
  if(A.fl&TF.dash){const ph=(s%7)/7;if(ph<.55)for(const l of [-6,0,6]){const a=sl(A,l-3,.05),b=sl(A,l+3,.05),tip=sl(B,l,.05),a2=sl(A,l-1.6,.05),b2=sl(A,l+1.6,.05);mb.tri(a,tip,a2,WC.dash,1,A.N);mb.tri(b2,tip,b,WC.dash,1,A.N);}}
  // borda de tinta + zebra (25 m) + barreira com topo neon
  for(const side of [-1,1]){const hasBar=side<0?A.fl&TF.barrierL:A.fl&TF.barrierR,l0=side*A.hw,l0b=side*B.hw;
   mb.quad(sl(A,l0-side*.7,.035),sl(B,l0b-side*.7,.035),sl(B,l0b,.035),sl(A,l0,.035),WC.ink,1,A.N);
   const kc=Math.floor(s/25)%2===0?WC.kerbA:WC.ink;mb.quad(sl(A,l0-side*2.2,.03),sl(B,l0b-side*2.2,.03),sl(B,l0b-side*.7,.03),sl(A,l0-side*.7,.03),kc,Math.floor(s/25)%2===0?1:0,A.N);
   if(hasBar){const h=1.7,inN=vec.scale(A.R,-side);mb.quad(sl(A,l0,0),sl(A,l0,h),sl(B,l0b,h),sl(B,l0b,0),WC.barrier,0,inN);
    mb.quad(sl(A,l0,h),sl(A,l0+side*.5,h+.05),sl(B,l0b+side*.5,h+.05),sl(B,l0b,h),WC.cap,1,A.N);
    mb.quad(sl(A,l0+side*.5,h+.05),sl(A,l0+side*.5,-1.2),sl(B,l0b+side*.5,-1.2),sl(B,l0b+side*.5,h+.05),WC.under,0,vec.scale(A.R,side));}
   else{// borda aberta: listras de perigo diagonais no limite
    const hz=Math.floor(s/6)%2===0;if(hz)mb.quad(sl(A,l0-side*3.4,.04),sl(B,l0b-side*2.4,.04),sl(B,l0b-side*.8,.04),sl(A,l0-side*1.8,.04),WC.hazard,1,A.N);}
  }
  // espessura e face inferior (visível em loops e por baixo), com filete rosa
  const th=2.2;mb.quad(sl(A,A.hw+.5,-th),sl(A,-A.hw-.5,-th),sl(B,-B.hw-.5,-th),sl(B,B.hw+.5,-th),WC.under,0,vec.scale(A.N,-1));
  for(const side of [-1,1]){mb.quad(sl(A,side*(A.hw+.5),-th+.05),sl(B,side*(B.hw+.5),-th+.05),sl(B,side*(B.hw+.5),-th+.45),sl(A,side*(A.hw+.5),-th+.45),WC.underGlow,1,vec.scale(A.R,side));}
 }
 // estruturas: pilares, placas de curva, contagem para curvas severas, pórticos
 const F=TRACK.features,chunkS0=c0*ds,chunkS1=Math.min(n,c0+CHUNK)*ds;
 const inChunk=s=>s>=chunkS0&&s<chunkS1;
 for(let s=Math.ceil(chunkS0/160)*160;s<chunkS1;s+=160){const S=trackFrameAt(s);if(S.fl&(TF.gap|TF.loop|TF.ramp))continue;if(!(trackFlags(s+30)&TF.gap)&&S.p[1]>-130){const top=vec.madd(S.p,S.N,-2.4),bot=[top[0],-140,top[2]],c=vec.lerp(top,bot,.5),hh=(top[1]+140)/2;if(hh>2){mb.box(c,[1,0,0],[0,1,0],[0,0,1],[2.2,hh,2.2],WC.pylon,0);ol.shell(c,[1,0,0],[0,1,0],[0,0,1],[2.2,hh,2.2],.5);}}}
 for(const cr of F.corners){const outer=cr.dir>0?1:-1;for(let s=cr.s0-260;s<cr.s1;s+=36){const ss=wrap(s,TRACK.L);if(!inChunk(ss))continue;const S=trackFrameAt(ss);if(!(outer>0?S.fl&TF.barrierR:S.fl&TF.barrierL))continue;
   const base=vec.madd(vec.madd(S.p,S.R,outer*(S.hw+.4)),S.N,1.75),c=vec.madd(base,S.N,1.5),inN=vec.scale(S.R,-outer);mb.box(c,S.T,S.N,S.R,[3.2,1.5,.25],WC.board,0);ol.shell(c,S.T,S.N,S.R,[3.2,1.5,.25],.18);
   const dir=-outer;for(const o of [-1.6,1.4]){const q=vec.madd(vec.madd(c,S.T,o),S.R,-outer*.3),tipT=dir>0?1:-1;// chevron apontando para dentro da curva
    const p1=vec.madd(vec.madd(q,S.N,1.05),S.T,-.7),p2=vec.madd(q,S.T,.7),p3=vec.madd(vec.madd(q,S.N,-1.05),S.T,-.7),p4=vec.madd(p3,S.T,.6),p5=vec.madd(p2,S.T,.6),p6=vec.madd(p1,S.T,.6);mb.quad(p1,p2,p5,p6,WC.chevron,1,inN);mb.quad(p2,p3,p4,p5,WC.chevron,1,inN);}}
  if(cr.severity>=4)for(const [k,d] of [[3,900],[2,600],[1,300]].entries()){const ss=wrap(cr.s0-d[1],TRACK.L);if(!inChunk(ss))continue;const S=trackFrameAt(ss);const side=-outer;const c=vec.madd(vec.madd(S.p,S.R,side*(S.hw+3)),S.N,4.5);
   mb.box(c,S.T,S.N,S.R,[.3,4.5,2.4],WC.board,0);ol.shell(c,S.T,S.N,S.R,[.3,4.5,2.4],.2);for(let b=0;b<d[0];b++)mb.box(vec.madd(vec.madd(c,S.N,2.6-b*1.6),S.R,-side*.05),S.T,S.N,S.R,[.36,.45,2],WC.paper,1);}}
 for(const g of [{s:0,kind:'finish'},{s:TRACK.L/3,kind:'sector',k:2},{s:2*TRACK.L/3,kind:'sector',k:3}]){if(!inChunk(g.s))continue;const S=trackFrameAt(g.s),H=14,w=S.hw+3;
  for(const side of [-1,1]){const c=vec.madd(vec.madd(S.p,S.R,side*w),S.N,H/2);mb.box(c,S.T,S.N,S.R,[1.4,H/2,1.4],WC.gate,0);ol.shell(c,S.T,S.N,S.R,[1.4,H/2,1.4],.3);}
  const beam=vec.madd(S.p,S.N,H+1.4);mb.box(beam,S.T,S.N,S.R,[1.2,1.4,w+1.4],WC.gate,0);ol.shell(beam,S.T,S.N,S.R,[1.2,1.4,w+1.4],.3);
  const cells=g.kind==='finish'?16:6;for(let q=0;q<cells;q++){const l=-w+(q+.5)*(2*w/cells),cc=vec.madd(vec.madd(beam,S.R,l),S.T,-1.25);if(g.kind==='finish'){mb.box(vec.madd(cc,S.N,.6),S.T,S.N,S.R,[.06,.6,w/cells],q%2?WC.paper:WC.ink,q%2?1:0);mb.box(vec.madd(cc,S.N,-.6),S.T,S.N,S.R,[.06,.6,w/cells],q%2?WC.ink:WC.paper,q%2?0:1);}else if(q<g.k)mb.box(cc,S.T,S.N,S.R,[.06,.9,w/cells*.6],WC.cap,1);}}
 return {mb,ol};
}
function trackFrameAt(s){const i=Math.round(wrap(s,TRACK.L)/TRACK.ds);return TS(i);}
// cidade de fundo: blocos no chão, longe do traçado (rejeição por distância horizontal × altura)
function buildCity(seed=7){
 const rng={s:seed},cells=new Map(),C=120,key=(x,z)=>Math.floor(x/C)+','+Math.floor(z/C);
 for(let i=0;i<TRACK.n;i+=2){const k=key(TRACK.pos[i*3],TRACK.pos[i*3+2]);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(i);}
 let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;for(let i=0;i<TRACK.n;i++){mnx=Math.min(mnx,TRACK.pos[i*3]);mxx=Math.max(mxx,TRACK.pos[i*3]);mnz=Math.min(mnz,TRACK.pos[i*3+2]);mxz=Math.max(mxz,TRACK.pos[i*3+2]);}
 const groups=new Map();
 for(let tries=0;tries<5200;tries++){const x=rngRange(rng,mnx-1600,mxx+1600),z=rngRange(rng,mnz-1600,mxz+1600),hx=rngRange(rng,14,46),hz=rngRange(rng,14,46);let h=rngRange(rng,20,140)*(rngNext(rng)<.12?2.6:1);
  let near=1e9,ok=true;const cx=Math.floor(x/C),cz=Math.floor(z/C);
  for(let a=-2;a<=2&&ok;a++)for(let b=-2;b<=2&&ok;b++){const L=cells.get((cx+a)+','+(cz+b));if(!L)continue;for(const i of L){const d=Math.hypot(TRACK.pos[i*3]-x,TRACK.pos[i*3+2]-z)-Math.hypot(hx,hz)-TRACK.hw[i];near=Math.min(near,d);if(d<70){const maxTop=TRACK.pos[i*3+1]-40;if(-140+h*2>maxTop){h=(maxTop+140)/2;if(h<12)ok=false;}}}}
  if(!ok||near<30)continue;
  const gk=Math.floor(x/1500)+','+Math.floor(z/1500);if(!groups.has(gk))groups.set(gk,{mb:new MeshBuf(),ol:new MeshBuf(),c:[0,0,0],n:0,r:0,pts:[]});const G=groups.get(gk);
  const c=[x,-140+h,z],col=[.07+rngNext(rng)*.05,.055+rngNext(rng)*.04,.15+rngNext(rng)*.09];G.mb.box(c,[1,0,0],[0,1,0],[0,0,1],[hx,h,hz],col,0);G.ol.shell(c,[1,0,0],[0,1,0],[0,0,1],[hx,h,hz],1.1);
  // faixas de janelas emissivas (magenta/ciano/ouro) — leitura de escala e paralaxe
  const wc=[WC.underGlow,WC.cap,WC.dash][Math.floor(rngNext(rng)*3)],bands=Math.floor(h/18);for(let b=1;b<bands;b++){if(rngNext(rng)<.45)continue;const y=-140+b*36;for(const [ax,az,hh,face] of [[1,0,hz,[0,0,1]],[0,1,hx,[1,0,0]]])for(const sgn of [-1,1]){const fc=[x+(face[0]?sgn*(hx+.3):0),y,z+(face[2]?sgn*(hz+.3):0)];G.mb.box(fc,[1,0,0],[0,1,0],[0,0,1],[face[0]?.3:hx*.8,1.4,face[2]?.3:hz*.8],wc,1);}}
  G.pts.push(c);G.n++;}
 for(const G of groups.values()){let c=[0,0,0];for(const p of G.pts)c=vec.add(c,p);c=vec.scale(c,1/G.pts.length);let r=0;for(const p of G.pts)r=Math.max(r,vec.len(vec.sub(p,c))+400);G.c=c;G.r=r;}
 return [...groups.values()];}
function buildGround(){const mb=new MeshBuf(),y=-140,S=26000,G=200,cx=TRACK.pos[0],cz=TRACK.pos[2];
 let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;for(let i=0;i<TRACK.n;i++){mnx=Math.min(mnx,TRACK.pos[i*3]);mxx=Math.max(mxx,TRACK.pos[i*3]);mnz=Math.min(mnz,TRACK.pos[i*3+2]);mxz=Math.max(mxz,TRACK.pos[i*3+2]);}
 const x0=mnx-6000,x1=mxx+6000,z0=mnz-6000,z1=mxz+6000;mb.quad([x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0],WC.ground,0,[0,1,0]);
 for(let x=Math.ceil(x0/G)*G;x<x1;x+=G)mb.quad([x-.8,y+.2,z0],[x-.8,y+.2,z1],[x+.8,y+.2,z1],[x+.8,y+.2,z0],WC.grid,1,[0,1,0]);
 for(let z=Math.ceil(z0/G)*G;z<z1;z+=G)mb.quad([x0,y+.2,z-.8],[x1,y+.2,z-.8],[x1,y+.2,z+.8],[x0,y+.2,z+.8],WC.grid,1,[0,1,0]);
 return mb;}
/* ---------------- GPU ---------------- */
function compileProgram(gl,vs,fs){const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader: '+gl.getShaderInfoLog(s));return s;};const a=sh(gl.VERTEX_SHADER,vs),b=sh(gl.FRAGMENT_SHADER,fs),p=gl.createProgram();gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);gl.deleteShader(a);gl.deleteShader(b);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Programa: '+gl.getProgramInfoLog(p));return p;}
function upload(gl,mb){if(!mb.d.length)return null;const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mb.d),gl.STATIC_DRAW);WORLD.live++;return {buf,count:mb.d.length/10};}
let WORLD_GEOM=null;   // geometria em CPU, gerada uma vez e reaproveitada após perda de contexto
function worldGeometry(){if(WORLD_GEOM)return WORLD_GEOM;const chunks=[];for(let c0=0;c0<TRACK.n;c0+=CHUNK){const {mb,ol}=buildTrackChunk(c0);let c=[0,0,0],k=0,r=0;for(let i=c0;i<Math.min(TRACK.n,c0+CHUNK);i++){c=vec.add(c,TS(i).p);k++;}c=vec.scale(c,1/k);for(let i=c0;i<Math.min(TRACK.n,c0+CHUNK);i++)r=Math.max(r,vec.len(vec.sub(TS(i).p,c)));chunks.push({mb,ol,c,r:r+60});}
 WORLD_GEOM={chunks,city:buildCity(),ground:buildGround()};return WORLD_GEOM;}
function worldInit(gl){WORLD.prog=compileProgram(gl,WORLD_VS,WORLD_FS);const p=WORLD.prog;WORLD.a={pos:gl.getAttribLocation(p,'a_pos'),nrm:gl.getAttribLocation(p,'a_nrm'),col:gl.getAttribLocation(p,'a_col')};WORLD.u={};for(const k of ['vp','light','eye','fog','fogNear','fogFar'])WORLD.u[k]=gl.getUniformLocation(p,'u_'+k);
 WORLD.sky=compileProgram(gl,SKY_VS,SKY_FS);WORLD.skyA=gl.getAttribLocation(WORLD.sky,'a_xy');WORLD.skyU={inv:gl.getUniformLocation(WORLD.sky,'u_inv'),moon:gl.getUniformLocation(WORLD.sky,'u_moon')};
 WORLD.skyBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,WORLD.skyBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);WORLD.live++;
 const G=worldGeometry();WORLD.chunks=G.chunks.map(c=>({c:c.c,r:c.r,geo:upload(gl,c.mb),ink:upload(gl,c.ol)}));WORLD.city=G.city.map(c=>({c:c.c,r:c.r,geo:upload(gl,c.mb),ink:upload(gl,c.ol)}));WORLD.ground=upload(gl,G.ground);WORLD.built=true;}
function worldDispose(gl,lost){const del=b=>{if(b&&b.buf&&!lost)gl.deleteBuffer(b.buf);if(b)WORLD.live=Math.max(0,WORLD.live-1);};for(const c of [...WORLD.chunks,...WORLD.city]){del(c.geo);del(c.ink);}del(WORLD.ground);if(WORLD.skyBuf){if(!lost)gl.deleteBuffer(WORLD.skyBuf);WORLD.live=Math.max(0,WORLD.live-1);}if(!lost){if(WORLD.prog)gl.deleteProgram(WORLD.prog);if(WORLD.sky)gl.deleteProgram(WORLD.sky);}
 Object.assign(WORLD,{prog:null,sky:null,skyBuf:null,chunks:[],city:[],ground:null,built:false});}
function invert4(m){const a=m,o=new Float32Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!d)return o;d=1/d;
 o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*d;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*d;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*d;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*d;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*d;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*d;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*d;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*d;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*d;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*d;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*d;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*d;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*d;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*d;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*d;o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*d;return o;}
const WORLD_LIGHT=vec.norm([.35,.9,.25]);
function drawSky(gl,mats){gl.useProgram(WORLD.sky);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.bindBuffer(gl.ARRAY_BUFFER,WORLD.skyBuf);for(let i=0;i<8;i++)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(WORLD.skyA);gl.vertexAttribPointer(WORLD.skyA,2,gl.FLOAT,false,8,0);
 gl.uniformMatrix4fv(WORLD.skyU.inv,false,invert4(mats.VP));gl.uniform3fv(WORLD.skyU.moon,vec.norm([-.4,.32,-.85]));gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);RSTAT.draws++;}
function bindWorld(gl,b){const a=WORLD.a;gl.bindBuffer(gl.ARRAY_BUFFER,b.buf);gl.enableVertexAttribArray(a.pos);gl.vertexAttribPointer(a.pos,3,gl.FLOAT,false,40,0);gl.enableVertexAttribArray(a.nrm);gl.vertexAttribPointer(a.nrm,3,gl.FLOAT,false,40,12);gl.enableVertexAttribArray(a.col);gl.vertexAttribPointer(a.col,4,gl.FLOAT,false,40,24);}
function sphereVisible(VP,c,r,eye,far){if(vec.len(vec.sub(c,eye))-r>far)return false;// teste contra os seis planos do frustum
 const m=VP,pl=[[m[3]+m[0],m[7]+m[4],m[11]+m[8],m[15]+m[12]],[m[3]-m[0],m[7]-m[4],m[11]-m[8],m[15]-m[12]],[m[3]+m[1],m[7]+m[5],m[11]+m[9],m[15]+m[13]],[m[3]-m[1],m[7]-m[5],m[11]-m[9],m[15]-m[13]],[m[3]+m[2],m[7]+m[6],m[11]+m[10],m[15]+m[14]]];
 for(const p of pl){const l=Math.hypot(p[0],p[1],p[2]);if((p[0]*c[0]+p[1]*c[1]+p[2]*c[2]+p[3])/l<-r)return false;}return true;}
const RSTAT={draws:0,tris:0,chunks:0,ships:0,fx:0};
function drawWorld(gl,mats){
 gl.useProgram(WORLD.prog);for(let i=0;i<8;i++)gl.disableVertexAttribArray(i);
 gl.uniformMatrix4fv(WORLD.u.vp,false,mats.VP);gl.uniform3fv(WORLD.u.light,WORLD_LIGHT);gl.uniform3fv(WORLD.u.eye,mats.eye);gl.uniform3fv(WORLD.u.fog,FOG.col);gl.uniform1f(WORLD.u.fogNear,FOG.near);gl.uniform1f(WORLD.u.fogFar,FOG.far);
 gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
 const draw=(b,cull)=>{if(!b)return;if(cull){gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);}else gl.disable(gl.CULL_FACE);bindWorld(gl,b);gl.drawArrays(gl.TRIANGLES,0,b.count);RSTAT.draws++;RSTAT.tris+=b.count/3;};
 if(WORLD.ground)draw(WORLD.ground,false);
 for(const c of WORLD.city)if(sphereVisible(mats.VP,c.c,c.r,mats.eye,FOG.far+600)){draw(c.geo,false);draw(c.ink,true);}
 for(const c of WORLD.chunks)if(sphereVisible(mats.VP,c.c,c.r,mats.eye,FOG.far)){RSTAT.chunks++;draw(c.geo,false);draw(c.ink,true);}
 gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
