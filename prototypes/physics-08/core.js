/* Independent 120 Hz physics; no DOM, renderer, spline coordinates or frame clock. */
const P08 = (() => {
'use strict';
const DT=1/120, STATUS='P08 APROVADO — INTEGRAÇÃO PENDENTE';
const V={add:(a,b)=>a.map((x,i)=>x+b[i]),sub:(a,b)=>a.map((x,i)=>x-b[i]),mul:(a,k)=>a.map(x=>x*k),dot:(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len:a=>Math.hypot(...a),norm:a=>{const l=Math.hypot(...a);return l>1e-12?a.map(x=>x/l):[0,1,0];}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), mix=(a,b,k)=>V.add(V.mul(a,1-k),V.mul(b,k)), project=(v,n)=>V.sub(v,V.mul(n,V.dot(v,n)));
function rotate(v,n,a){return V.add(V.add(V.mul(v,Math.cos(a)),V.mul(V.cross(n,v),Math.sin(a))),V.mul(n,V.dot(n,v)*(1-Math.cos(a))));}
function transport(v,a,b){const ax=V.cross(a,b),l=V.len(ax);return l<1e-8?v.slice():rotate(v,V.mul(ax,1/l),Math.atan2(l,clamp(V.dot(a,b),-1,1)));}
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const PARAMS={magnet:['Limite de reação A',150,5000,2500,50,'u/s²'],reach:['Alcance de consulta 3D',3,12,6,.5,'u'],constraint:['Correção normal máxima/passo',.05,1,.35,.05,'u']};
const ACTIVE={A:Object.keys(PARAMS)};
function defaults(){return {A:Object.fromEntries(ACTIVE.A.map(k=>[k,PARAMS[k][3]]))};}
function closest(p,a,b,c){
 const ab=V.sub(b,a),ac=V.sub(c,a),ap=V.sub(p,a),d1=V.dot(ab,ap),d2=V.dot(ac,ap);if(d1<=0&&d2<=0)return a;
 const bp=V.sub(p,b),d3=V.dot(ab,bp),d4=V.dot(ac,bp);if(d3>=0&&d4<=d3)return b;
 const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0)return V.add(a,V.mul(ab,d1/(d1-d3)));
 const cp=V.sub(p,c),d5=V.dot(ab,cp),d6=V.dot(ac,cp);if(d6>=0&&d5<=d6)return c;
 const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0)return V.add(a,V.mul(ac,d2/(d2-d6)));
 const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0)return V.add(b,V.mul(V.sub(c,b),(d4-d3)/(d4-d3+d5-d6)));
 const den=1/(va+vb+vc);return V.add(a,V.add(V.mul(ab,vb*den),V.mul(ac,vc*den)));
}
class Course{
 constructor(){this.triangles=[];this.stations=[];this.zones=[];this.grid=new Map();this.cell=48;this.build();this.smoothNormals();}
 tri(a,b,c,nHint,zone,kind='road'){
 let n=V.norm(V.cross(V.sub(b,a),V.sub(c,a)));if(V.dot(n,nHint)<0){[b,c]=[c,b];n=V.mul(n,-1);}
 if(V.len(V.cross(V.sub(b,a),V.sub(c,a)))<1e-7)return;
 const t={a,b,c,n,zone,kind,id:this.triangles.length};this.triangles.push(t);
 const lo=a.map((x,i)=>Math.floor(Math.min(x,b[i],c[i])/this.cell)),hi=a.map((x,i)=>Math.floor(Math.max(x,b[i],c[i])/this.cell));
 for(let x=lo[0];x<=hi[0];x++)for(let y=lo[1];y<=hi[1];y++)for(let z=lo[2];z<=hi[2];z++){const k=x+','+y+','+z;if(!this.grid.has(k))this.grid.set(k,[]);this.grid.get(k).push(t);}
 }
 candidates(p,r){const lo=p.map(x=>Math.floor((x-r)/this.cell)),hi=p.map(x=>Math.floor((x+r)/this.cell)),out=new Set();for(let x=lo[0];x<=hi[0];x++)for(let y=lo[1];y<=hi[1];y++)for(let z=lo[2];z<=hi[2];z++)for(const t of this.grid.get(x+','+y+','+z)||[])out.add(t);return out;}
 smoothNormals(){const sum=new Map(),key=p=>p.map(x=>Math.round(x*10000)).join(',');for(const t of this.triangles)if(t.kind==='road')for(const p of [t.a,t.b,t.c]){const k=key(p);sum.set(k,V.add(sum.get(k)||[0,0,0],t.n));}for(const t of this.triangles)if(t.kind==='road')t.vn=[t.a,t.b,t.c].map(p=>V.norm(sum.get(key(p))));}
 surface(p,up,reach=8){let best=null;for(const t of this.candidates(p,reach)){if(t.kind!=='road'||V.dot(t.n,up)<.1)continue;const q=closest(p,t.a,t.b,t.c),d=V.sub(p,q),dist=V.len(d);if(dist>reach)continue;
 const ab=V.sub(t.b,t.a),ac=V.sub(t.c,t.a),aq=V.sub(q,t.a),aa=V.dot(ab,ab),bb=V.dot(ac,ac),cc=V.dot(ab,ac),den=aa*bb-cc*cc,v=(bb*V.dot(aq,ab)-cc*V.dot(aq,ac))/den,w=(aa*V.dot(aq,ac)-cc*V.dot(aq,ab))/den;
 const n=t.vn?V.norm(V.add(V.mul(t.vn[0],1-v-w),V.add(V.mul(t.vn[1],v),V.mul(t.vn[2],w)))):t.n,signed=V.dot(d,n);
 if(signed<-.2)continue;const lateral=V.len(project(d,n));if(lateral>.65)continue;if(!best||dist<best.distance)best={triangle:t,point:q,normal:n,distance:dist,signed,zone:t.zone};}return best;}

 build(){
 let p=[0,0,0],f=[0,0,1],up=[0,1,0],s=0;
 const defs=[['straight','01 · Reta / estabilidade',950,()=>({})],['wide','02 · Curva aberta',650,t=>({yaw:Math.sin(Math.PI*t)*.0016})],['tight','03 · Curva fechada',420,t=>({yaw:-Math.sin(Math.PI*t)*.0034})],['bank','04 · Banking',650,t=>({yaw:Math.sin(Math.PI*t)*.0012,roll:.85*Math.sin(Math.PI*t)**2})],['wall','05 · Parede 90°',800,t=>({roll:Math.PI/2*(t<.3?smooth(t/.3):t>.7?smooth((1-t)/.3):1)})],['loop','06 · Loop vertical',Math.PI*2*190,t=>({pitch:1/190})],['tube','07 · Tubo / interior',850,t=>({tube:Math.min(smooth(t/.23),smooth((1-t)/.23))})],['ramp','08 · Rampa / lançamento',220,t=>({pitch:t<.5? .32/110:0})],['gap','09 · Voo / queda',150,()=>({gap:true})],['landing','10 · Aterrissagem',2400,()=>({})]];
 for(const [id,name,length,fn]of defs){
  if(id==='landing'){p=V.add(p,[0,-150,0]);f=V.norm([f[0],0,f[2]]);up=[0,1,0];}
  const zone={id,name,index:this.zones.length,start:s,length,station:this.stations.length};this.zones.push(zone);
  if(id==='loop'){
   // A full vertical loop with smooth lateral displacement avoids intersecting entrance and exit.
   // Position and Frenet frame come from the same analytic surface; no vehicle follows this parameter.
   const origin=p.slice(),F=f.slice(),U=up.slice(),R=V.norm(V.cross(U,F)),radius=190,offset=200,N=500,startS=s;let last=p.slice();
   for(let j=0;j<=N;j++){const t=j/N,a=t*Math.PI*2,co=Math.cos(a),si=Math.sin(a);
    const pos=V.add(origin,V.add(V.mul(F,radius*si),V.add(V.mul(U,radius*(1-co)),V.mul(R,offset*(t-si/(Math.PI*2))))));
    const tangent=V.norm(V.add(V.mul(F,radius*co),V.add(V.mul(U,radius*si),V.mul(R,offset/(Math.PI*2)*(1-co)))));
    const second=V.add(V.mul(F,-radius*si),V.add(V.mul(U,radius*co),V.mul(R,offset/(Math.PI*2)*si)));
    const normal=V.norm(project(second,tangent)),right=V.norm(V.cross(normal,tangent));if(j)s+=V.len(V.sub(pos,last));
    this.stations.push({p:pos,f:tangent,n:normal,r:right,s,zone:zone.index,gap:false,tube:0});last=pos;
   }p=last;f=F;up=U;zone.length=s-startS;continue;
  }
  const steps=Math.ceil(length/3),ds=length/steps;
  for(let j=0;j<=steps;j++){
   const t=j/steps,c=fn(t),right=V.norm(V.cross(up,f)),n=rotate(up,f,c.roll||0),r=V.norm(V.cross(n,f));
   this.stations.push({p:p.slice(),f:f.slice(),n,r,s,zone:zone.index,gap:!!c.gap,tube:c.tube||0});
   if(j<steps){if(c.yaw){f=rotate(f,up,c.yaw*ds);}if(c.pitch){const ax=V.norm(V.cross(up,f));f=rotate(f,ax,-c.pitch*ds);up=rotate(up,ax,-c.pitch*ds);}p=V.add(p,V.mul(f,ds));s+=ds;}
  }
 }
 this.length=s;
 for(let i=0;i<this.stations.length-1;i++){
  const a=this.stations[i],b=this.stations[i+1];if(a.gap||b.gap||V.len(V.sub(a.p,b.p))>8||V.len(V.sub(a.p,b.p))<.01)continue;
  const tube=a.tube>0||b.tube>0,cols=tube?32:4;
  const point=(st,u)=>{const blend=st.tube,R=26,arc=48+(Math.PI*R-48)*blend,ang=u*arc/R*blend,x=blend>.001?R*Math.sin(ang)/blend:u*48,y=blend>.001?R*(1-Math.cos(ang))/blend:0;return V.add(st.p,V.add(V.mul(st.r,tube?x:u*48),V.mul(st.n,tube?y:0)));};
  for(let k=0;k<cols;k++){const u=k/cols*2-1,v=(k+1)/cols*2-1,A=point(a,u),B=point(a,v),C=point(b,v),D=point(b,u);const mid=V.mul(V.add(A,B),.5),center=V.add(a.p,V.mul(a.n,26)),hint=tube?V.norm(V.sub(center,mid)):a.n;this.tri(A,B,C,hint,a.zone);this.tri(A,C,D,hint,a.zone);}
  // The first straight has rails; the other areas deliberately expose real falls.
  if(a.zone===0&&a.s<650)for(const side of [-1,1]){const A=point(a,side),B=point(b,side),C=V.add(B,V.mul(b.n,7)),D=V.add(A,V.mul(a.n,7)),hint=V.mul(a.r,-side);this.tri(A,B,C,hint,a.zone,'barrier');this.tri(A,C,D,hint,a.zone,'barrier');}
 }
 }
 spawn(zone=0){const z=this.zones[zone];return this.stations[Math.min(z.station+12,this.stations.length-1)];}
}
function fresh(course,mode='A',cfg=defaults().A,zone=0,speed=42,seed=8,profile=P01Profile.BASELINE){if(mode!=='A')throw Error('P08 v2: apenas contato A');const st=course.spawn(zone),driver=P01Profile.fresh(speed);driver.isAirborne=st.gap;driver.onTrack=!st.gap;
return{mode:'A',p:V.add(st.p,V.mul(st.n,profile.hoverHeight)),v:V.mul(st.f,speed),up:st.n.slice(),f:st.f.slice(),normal:st.n.slice(),driver,time:0,tick:0,seed:seed>>>0,contact:!st.gap,event:st.gap?'VOO':'CONTATO',reason:'reset explícito',zone,landings:0,detachments:0,impact:0,lastImpact:0,airTime:0,magnetic:0,suspension:0,assist:0,correction:0,slip:0,distance:profile.hoverHeight,orientationError:0,collisions:0,stopped:false,trace:[],boost:0,energy:100,landingBonus:0};}
function collide(course,old,s,radius=1){
 // Continuous sphere-plane sweep plus closest triangle point, two-sided road and barriers.
 const move=V.sub(s.p,old),len=V.len(move),mid=V.mul(V.add(old,s.p),.5);let earliest=1,hit=null;
 for(const t of course.candidates(mid,len/2+radius+1)){
  const d0=V.dot(V.sub(old,t.a),t.n),d1=V.dot(V.sub(s.p,t.a),t.n),side=d0>=0?1:-1;
  if(Math.abs(d0)<radius-1e-5||side*d1>=radius||side*V.dot(move,t.n)>=0)continue;
  const u=(side*d0-radius)/(side*(d0-d1));if(u<0||u>earliest)continue;
  const center=V.add(old,V.mul(move,u)),on=V.sub(center,V.mul(t.n,side*radius)),q=closest(on,t.a,t.b,t.c);
  if(V.len(V.sub(on,q))>.06)continue;earliest=u;hit={t,n:V.mul(t.n,side)};
 }
 if(hit){s.p=V.add(V.add(old,V.mul(move,earliest)),V.mul(hit.n,.002));const vn=V.dot(s.v,hit.n);if(vn<0)s.v=V.sub(s.v,V.mul(hit.n,vn*(hit.t.kind==='barrier'?1.18:1)));s.collisions++;s.impact=Math.max(s.impact,-vn);s.lastImpact=Math.max(s.lastImpact,-vn);s.reason=hit.t.kind==='barrier'?'colisão com barreira':'colisão sólida com pista';}
 // Resolve initial overlap locally; never search a remote station or move along a spline.
 for(const t of course.candidates(s.p,radius+1)){const q=closest(s.p,t.a,t.b,t.c),d=V.sub(s.p,q),l=V.len(d);if(l<radius&&l>1e-7){const n=V.mul(d,1/l);s.p=V.add(s.p,V.mul(n,radius-l+.001));const vn=V.dot(s.v,n);if(vn<0)s.v=V.sub(s.v,V.mul(n,vn));}}
}
const AIR_PARAMS={levelRate:['Autoestabilização',30,240,120,5,'°/s'],pitchRate:['Controle de pitch aéreo',30,120,80,5,'°/s'],boostThrust:['Empuxo aéreo do boost',120,400,260,10,'u/s²'],boostTurn:['Direção durante boost aéreo',1,2.5,1.6,.1,'×'],maxClimb:['Limite de subida',50,180,120,5,'u/s']};
function airDefaults(){return{enabled:true,...Object.fromEntries(Object.entries(AIR_PARAMS).map(([k,r])=>[k,r[3]]))};}
function levelAirFrame(s,dt,rate){
 const worldUp=[0,1,0],horizontal=project(s.f,worldUp);if(V.len(horizontal)>.05)s.airHeading=V.norm(horizontal);
 const targetF=s.airHeading||[0,0,1],axis=V.cross(s.f,targetF),angle=Math.acos(clamp(V.dot(s.f,targetF),-1,1)),limit=rate*Math.PI/180*dt;
 if(angle>1e-8)s.f=V.norm(rotate(s.f,V.len(axis)>1e-8?V.norm(axis):[1,0,0],Math.min(angle,limit)));
 let up=project(s.up,s.f);if(V.len(up)<1e-8)up=project(worldUp,s.f);up=V.norm(up);
 const targetUp=V.norm(project(worldUp,s.f)),roll=Math.atan2(V.dot(V.cross(up,targetUp),s.f),clamp(V.dot(up,targetUp),-1,1));
 s.up=V.norm(rotate(up,s.f,clamp(roll,-limit,limit)));
 s.levelError=Math.acos(clamp(V.dot(s.up,worldUp),-1,1))*180/Math.PI;
}
function noseDirection(s){return V.norm(rotate(s.f,V.norm(V.cross(s.f,s.up)),s.driver.pitch));}
function assistedFlight(s,d,profile,keys,air,dt){
 const pull=keys.has('KeyS')||keys.has('ArrowDown'),dive=keys.has('KeyW')||keys.has('ArrowUp');
 // Pull-up takes precedence over W, allowing W + Down + boost to recover altitude.
 const pitchInput=pull?1:dive?-1:0;
 if(pitchInput)d.pitch=clamp(d.pitch+pitchInput*air.pitchRate*Math.PI/180*dt,-Math.PI/3,Math.PI*5/12);
 else d.pitch*=Math.exp(-3*dt);
 if(!['ArrowLeft','ArrowRight','KeyZ','KeyC','KeyQ','KeyE'].some(k=>keys.has(k)))d.roll*=Math.exp(-5*dt);
 const gravity=d.onTrack?(profile.airborneGravity??90):(profile.fallGravity??90),speedNorm=d.speed/180;
 const lift=d.pitch>.05?Math.min(Math.sin(d.pitch)*(profile.airGlideLift||40)*speedNorm,gravity*.5):0,diveForce=d.pitch<-.05?-Math.sin(d.pitch)*(profile.airDiveAccel||55)*speedNorm:0;
 s.v[1]+=(-gravity+lift-diveForce)*dt;
 s.airAim=noseDirection(s);
 s.airThrust=d.boost>0?air.boostThrust:0;
 if(s.airThrust)s.v=V.add(s.v,V.mul(s.airAim,s.airThrust*dt));
 s.v[1]=clamp(s.v[1],-(profile.airDiveMaxSpeed||85),air.maxClimb);
 const horizontal=Math.hypot(s.v[0],s.v[2]),cap=d.boost>0?profile.boostTopSpeed:profile.topSpeed;if(horizontal>cap){s.v[0]*=cap/horizontal;s.v[2]*=cap/horizontal;}
 d.verticalVelocity=s.v[1];
}
function step(course,s,cfg,input={},profile=P01Profile.BASELINE,options={}){
 if(s.stopped)return;const air=options.air||{enabled:false};const dt=DT,old=s.p.slice(),was=s.contact,d=s.driver,height=profile.hoverHeight;
 s.tick++;s.time=s.tick*dt;s.impact=0;s.magnetic=0;s.suspension=0;s.correction=0;s.landingBonus=0;s.airThrust=0;s.levelError=0;
 let h=course.surface(s.p,s.up,cfg.reach),n=h?h.normal:s.normal,normalSpeed=h?V.dot(s.v,n):0;
 const landingRoadPitch=-Math.atan2(V.dot(s.f,n),Math.max(1e-9,V.len(project(s.f,n))));
 const outwardLimit=Math.sqrt(2*cfg.magnet*Math.max(.2,cfg.reach-(h?.signed||0)));
 s.contact=!!h&&normalSpeed<outwardLimit&&(was||h.signed<=height+Math.max(0,-normalSpeed*dt));
 if(input.release){s.v=V.add(s.v,V.mul(s.up,80));s.releaseUntil=s.time+.3;s.contact=false;}
 if(s.time<(s.releaseUntil||0))s.contact=false;
 if(s.contact&&was){const moved=transport(s.v,s.normal,n);const need=V.len(V.sub(moved,s.v))/dt;s.magnetic=need;if(need>cfg.magnet){s.contact=false;s.reason='reação normal excede limite A';}else{s.v=moved;s.f=V.norm(project(transport(s.f,s.normal,n),n));}}
 if(s.contact){s.zone=h.zone;s.up=n.slice();s.f=V.norm(project(s.f,n));s.normal=n.slice();s.event=was?'CONTATO':'POUSO';s.reason=was?'restrição local A':'interseção com altura de contato';s.airTime=0;}
 else{s.event=was?'DESPRENDIMENTO':'VOO';if(was){s.detachments++;s.reason=h?'perda de captura/reação':'sem superfície no alcance';}s.airTime+=dt;}
 if(!s.contact&&air.enabled)levelAirFrame(s,dt,air.levelRate);
 const landingNow=s.contact&&!was,baseF=s.f.slice(),baseN=s.up.slice(),baseR=V.norm(V.cross(baseF,baseN));
 // Adapt the original 2D driving plane to the local surface. Positive lateral = camera right.
 const vn=V.dot(s.v,baseN);d.x=0;d.z=0;d.yaw=0;d.vx=V.dot(s.v,baseR);d.vz=V.dot(s.v,baseF);d.speed=Math.hypot(d.vx,d.vz);d.isAirborne=!s.contact||landingNow;d.onTrack=!!h;
 const keys=new Set(input.keys||[]);
 // Programmed tests use the same key semantics as the P01 (positive steer/strafe = right).
 if(input.throttle)keys.add('KeyX');if(input.steer>0)keys.add('ArrowRight');if(input.steer<0)keys.add('ArrowLeft');if(input.strafe>0)keys.add('KeyC');if(input.strafe<0)keys.add('KeyZ');if(input.brake)keys.add('KeyS');if(input.drift)keys.add('Space');if(input.pitch>0)keys.add('ArrowDown');if(input.pitch<0)keys.add('ArrowUp');
 if(input.boost)P01Profile.activateBoost(d,profile);
 const activeAir=air.enabled&&!s.contact,driveKeys=new Set(keys);
 if(activeAir){driveKeys.delete('KeyS');driveKeys.delete('ArrowDown');}
 const driveProfile=activeAir&&d.boost>0?{...profile,airSteerAuthority:(profile.airSteerAuthority||1.1)*air.boostTurn}:profile;
 P01Profile.drive(d,driveProfile,driveKeys,dt,{...options,edges:input.edges||[]});
 s.f=V.norm(V.add(V.mul(baseF,Math.cos(d.yaw)),V.mul(baseR,Math.sin(d.yaw))));
 s.v=V.add(V.add(V.mul(baseR,d.vx),V.mul(baseF,d.vz)),V.mul(baseN,s.contact&&!landingNow?0:vn));
 if(activeAir)assistedFlight(s,d,profile,keys,air,dt);
 else if(!s.contact||landingNow){d.verticalVelocity=s.v[1];d.y=s.p[1];P01Profile.fly(d,profile,keys,dt,0);s.v[1]=d.verticalVelocity;}
 else{const pitchTarget=clamp(-(keys.has('KeyX')||keys.has('KeyW')||keys.has('ArrowUp')?.07:-.03)*(profile.pitchSensitivity||1)+(keys.has('KeyS')||keys.has('ArrowDown')||(keys.has('Space')&&!keys.has('ArrowLeft')&&!keys.has('ArrowRight'))?.16*(profile.pitchSensitivity||1):0),-.60,.60);d.pitch+=(pitchTarget-d.pitch)*(1-Math.exp(-(profile.pitchResponse||15.5)*dt));s.suspension=-vn/dt;}
 let motionVelocity=s.v.slice();
 if(landingNow){s.landings++;const landingVelocity=V.dot(s.v,n);s.impact=Math.max(0,-landingVelocity);s.lastImpact=s.impact;const before=d.speed;d.isAirborne=false;d.onTrack=true;P01Profile.land(d,profile,landingVelocity,landingRoadPitch);s.landingBonus=d.speed-before;s.v=project(V.add(V.mul(baseR,d.vx),V.mul(baseF,d.vz)),n);motionVelocity=project(motionVelocity,n);}
 s.p=V.add(s.p,V.mul(motionVelocity,dt));
 if(s.contact){const next=course.surface(s.p,n,cfg.reach);if(next){const correction=clamp(height-next.signed,-cfg.constraint,cfg.constraint);s.p=V.add(s.p,V.mul(next.normal,correction));s.correction=Math.abs(correction);}}
 collide(course,old,s,1);
 P01Profile.tickEnergy(d,profile,dt,options.regeneration||false);s.boost=d.boost;s.energy=d.shield;s.slip=d.slip;
 const actual=course.surface(s.p,s.up,cfg.reach);s.distance=actual?actual.signed:null;s.orientationError=actual?Math.acos(clamp(V.dot(s.up,actual.normal),-1,1))*180/Math.PI:0;
 if(![...s.p,...s.v,...s.f,...s.up].every(Number.isFinite)||V.len(s.v)>2000){s.stopped=true;s.event='ERRO NUMÉRICO';}
 if(s.p[1]<-500){s.stopped=true;s.event='QUEDA — R PARA RESET';}
 if(s.tick%12===0){s.trace.push({tick:s.tick,p:s.p.slice(),speed:V.len(s.v),height:s.distance,contact:s.contact,force:s.suspension,assist:0});if(s.trace.length>600)s.trace.shift();}
}
function newConfig(){return{schema:'gminus.physics08',version:3,status:STATUS,approval:'none',mode:'A',ship:'falcon',model:'A',zone:0,seed:8,startSpeed:42,camera:'chase',params:defaults(),profile:structuredClone(P01Profile.BASELINE),naturalStability:true,regeneration:false,air:airDefaults()};}
function parseConfig(raw){const c=typeof raw==='string'?JSON.parse(raw):structuredClone(raw),base=newConfig();if(c.status==='EM AVALIAÇÃO — FÍSICA 3D NÃO APROVADA')c.status=STATUS;function keys(o,k){if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).sort().join('|')!==k.slice().sort().join('|'))throw Error('Chaves inválidas');}
 if(c.version===2){keys(c,Object.keys(base).filter(k=>k!=='air'));c.version=3;c.air={...airDefaults(),enabled:false};}
 if(c.version!==3)throw Error('JSON v3 exigido (v2 aceito sem assistência nova)');keys(c,Object.keys(base));if(c.schema!==base.schema||c.status!==STATUS||c.approval!=='none'||c.mode!=='A')throw Error('Identificador/status inválido');if(!['falcon','fox','goose'].includes(c.ship)||!['A','B','C'].includes(c.model)||!['chase','side','rear','inspect'].includes(c.camera)||typeof c.naturalStability!=='boolean'||typeof c.regeneration!=='boolean')throw Error('Seleção inválida');
 if(!Number.isInteger(c.zone)||c.zone<0||c.zone>9||!Number.isInteger(c.seed)||c.seed<0||c.seed>4294967295||!Number.isFinite(c.startSpeed)||c.startSpeed<0||c.startSpeed>600)throw Error('Cenário inválido');keys(c.params,['A']);keys(c.params.A,ACTIVE.A);for(const k of ACTIVE.A){const v=c.params.A[k],r=PARAMS[k];if(!Number.isFinite(v)||v<r[1]||v>r[2])throw Error('Contato inválido: '+k);}
 keys(c.air,['enabled',...Object.keys(AIR_PARAMS)]);if(typeof c.air.enabled!=='boolean')throw Error('Assistência aérea inválida');for(const [k,r]of Object.entries(AIR_PARAMS)){const v=c.air[k];if(typeof v!=='number'||!Number.isFinite(v)||v<r[1]||v>r[2])throw Error('Controle aéreo inválido: '+k);}
 keys(c.profile,Object.keys(P01Profile.LIMITS));for(const [k,[min,max,step]]of Object.entries(P01Profile.LIMITS)){const v=c.profile[k];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||Math.abs(Math.round((v-min)/step)-(v-min)/step)>1e-3)throw Error('Perfil inválido: '+k);}return c;}
function scripted(t,seed){const phase=(seed%17)*.01;return{throttle:true,steer:t>2+phase&&t<2.4+phase?1:t>2.4+phase&&t<2.8+phase?-1:0,drift:t>2.2&&t<2.6};}
return{DT,STATUS,V,PARAMS,ACTIVE,defaults,Course,fresh,step,parseConfig,newConfig,scripted,closest,rotate,transport,profile:P01Profile,noseDirection,AIR_PARAMS,airDefaults,levelAirFrame};
})();
if(typeof module!=='undefined')module.exports=P08;
