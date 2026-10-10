/* VFX GEOMETRY — one bounded, reusable interleaved triangle arena per frame. */
const FXCOL={cyan:[.26,.94,.87],pink:[1,.28,.58],white:[1,.95,.77],blue:[.23,.4,.95],ink:[.045,.035,.12],gold:[1,.65,.21]};
class Arena{
 constructor(capacity=24000){this.capacity=capacity;this.data=new Float32Array(capacity*7);this.count=0;this.dropped=0;this.limit=capacity;}
 reset(limit=this.capacity){this.count=0;this.dropped=0;this.limit=limit;}
 tri(a,b,c,col,alpha=1){if(this.count+3>this.limit){this.dropped++;return;}for(const v of [a,b,c]){let i=this.count++*7;this.data[i++]=v[0];this.data[i++]=v[1];this.data[i++]=v[2];this.data[i++]=col[0];this.data[i++]=col[1];this.data[i++]=col[2];this.data[i]=alpha;}}
 quad(a,b,c,d,col,alpha=1){this.tri(a,b,c,col,alpha);this.tri(a,c,d,col,alpha);}
 stroke(a,b,w,col,alpha=1){const d=v3.norm(v3.sub(b,a));let n=v3.cross(d,[0,1,0]);if(Math.hypot(...n)<.01)n=v3.cross(d,[0,0,1]);n=v3.norm(n).map(x=>x*w*.5);const q=(p,k)=>p.map((x,i)=>x+n[i]*k);this.quad(q(a,1),q(b,1),q(b,-1),q(a,-1),col,alpha);const o=v3.norm(v3.cross(d,n)).map(x=>x*w*.25),r=(p,k)=>p.map((x,i)=>x+o[i]*k);this.quad(r(a,1),r(b,1),r(b,-1),r(a,-1),col,alpha);}
 ribbon(points,w,col,alpha=1){for(let i=0;i<points.length-1;i++)this.stroke(points[i],points[i+1],w*(1-.8*i/points.length),col,alpha*(1-.65*i/points.length));}
 ring(center,r,w,col,alpha=1,plane='xz',segments=48,start=0,arc=TAU){const pt=(a,rad)=>{const c=Math.cos(a)*rad,s=Math.sin(a)*rad;return plane==='xy'?[center[0]+c,center[1]+s,center[2]]:plane==='yz'?[center[0],center[1]+c,center[2]+s]:[center[0]+c,center[1],center[2]+s];};for(let i=0;i<segments;i++){const a=start+arc*i/segments,b=start+arc*(i+1)/segments;this.quad(pt(a,r),pt(b,r),pt(b,Math.max(0,r-w)),pt(a,Math.max(0,r-w)),col,alpha);}}
 shard(p,size,col,alpha=1,angle=0){const c=Math.cos(angle),s=Math.sin(angle),a=[p[0]+c*size,p[1],p[2]+s*size],b=[p[0]-s*size*.3,p[1]+size*.28,p[2]+c*size*.3],d=[p[0]+s*size*.3,p[1]-size*.2,p[2]-c*size*.3],e=[p[0]-c*size*.7,p[1],p[2]-s*size*.7];this.tri(a,b,d,col,alpha);this.tri(e,d,b,col.map(v=>v*.55),alpha);}
 plasma(anchor,length,width,t,facets,alpha){const rows=[0,.16,.42,.68,1],radius=[.85,1.18,.72,.55,.015];for(let j=0;j<rows.length-1;j++)for(let i=0;i<facets;i++){const a=i/facets*TAU,b=(i+1)/facets*TAU,pt=(k,ang)=>[anchor.x+Math.cos(ang)*anchor.r*width*radius[k],anchor.y+Math.sin(ang)*anchor.r*width*radius[k],anchor.z-length*rows[k]];this.quad(pt(j,a),pt(j,b),pt(j+1,b),pt(j+1,a),i%3===0?FXCOL.pink:FXCOL.cyan,alpha*.7);}for(let i=0;i<4;i++){const a=i/4*TAU,b=(i+1)/4*TAU,r=anchor.r*width*.46,A=[anchor.x+Math.cos(a)*r,anchor.y+Math.sin(a)*r,anchor.z],B=[anchor.x+Math.cos(b)*r,anchor.y+Math.sin(b)*r,anchor.z];this.tri(A,B,[anchor.x,anchor.y,anchor.z-length*.72],FXCOL.white,alpha);}}
}
const arena=new Arena(),ghosts=[];
function noise(seed,i){let x=Math.imul((seed+i*374761393)>>>0,668265263);x=Math.imul(x^(x>>>13),1274126177);return((x^(x>>>16))>>>0)/4294967296;}
function effectFrame(c,a,p,time,entry,sim=state.sim,side=state.side,seed=state.seed,out=arena){
 p=eventParams(c,p,sim);
 const E=eventAt(time,p),continuous=['propulsion','drift','speed'].includes(c),gain=continuous?1:E.gain;
 if(gain<=0)return;
 const t=time*p.rate*2/p.duration,u=Math.pow(E.u,1/p.rate),w=p.width||1,n=Math.round(p.count||7),extent=(p.extent||p.radius||p.length||1)*(c==='boost'?(.65+sim.speed/1000):1);
 const alpha=p.opacity*gain,cy=FXCOL.cyan,pk=FXCOL.pink,wh=FXCOL.white,gd=FXCOL.gold;
 const b=entry.report.bounds,hx=Math.max(Math.abs(b.min[0]),Math.abs(b.max[0])),rear=b.min[2],front=b.max[2],floor=b.min[1]-.28;
 const contact=cachedContact(entry.mesh,side),speed=sim.speed/900,rand=i=>noise(seed,i),frac=x=>x-Math.floor(x),rad=(a,r,y=0)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const ring=(center,r,width,color=cy,al=alpha,plane='xz',segs=48,start=0,arc=TAU)=>out.ring(center,r,width,color,al,plane,segs,start,arc);
 const stroke=(A,B,width,color=cy,al=alpha)=>out.stroke(A,B,width,color,al);
 const shard=(pos,size,color=gd,al=alpha,ang=0)=>out.shard(pos,size,color,al,ang);
 const spray=(origin,count,length,spread,color=gd)=>{for(let i=0;i<count;i++){const age=frac(t*.8+rand(i)*.9),angle=rand(i+20)*TAU,r=age*length;const q=[origin[0]+Math.cos(angle)*r*spread,origin[1]+Math.sin(angle)*r*.55-age*age*.7,origin[2]-r*(.4+rand(i+44))];const tail=[q[0]-.09*Math.cos(angle)*w,q[1]-.09*Math.sin(angle)*w,q[2]+.15*w];stroke(q,tail,.035*w,color,alpha*(1-age));}};
 if(c==='propulsion'){
  for(const anchor of entry.anchors){const pulse=1+p.pulse*Math.sin(t*9+anchor.x*2)*.18,length=p.length*(.65+sim.throttle*p.response+speed*.12)*pulse,r=anchor.r*p.width;
   if(a==='A'){out.plasma(anchor,length,p.width,t,n,alpha);for(let i=0;i<Math.max(2,n/2);i++){const q=frac(t*.8/p.persistence+rand(i)),z=anchor.z-length*q;shard([anchor.x+(rand(i+2)-.5)*p.spread*q,anchor.y+(rand(i+7)-.5)*p.spread*q,z],.05*w*(1-q),wh,alpha*(1-q),Math.PI/2);}}
   if(a==='B')for(let i=0;i<n;i++){const q=(i+frac(t*2))/n,z=anchor.z-length*q,radius=r*(1-q*.75)*(1+p.spread*q);for(let j=0;j<4;j++){const angle=j*TAU/4,dx=Math.cos(angle),dy=Math.sin(angle);out.quad([anchor.x+dx*radius,anchor.y+dy*radius,z],[anchor.x+dx*radius*.55,anchor.y+dy*radius*.55,z-.13*p.persistence],[anchor.x-dy*r*.3,anchor.y+dx*r*.3,z-.2],[anchor.x+dy*r*.3,anchor.y-dx*r*.3,z-.08],i%2?cy:wh,alpha*(1-q*.65));}}
   if(a==='C')for(let i=0;i<n;i++){const q=frac(i/n+t*.6/p.persistence);ring([anchor.x,anchor.y,anchor.z-length*q],r*(.65+q*(.4+p.spread)),.075*w*(1-q*.7),i%2?cy:pk,alpha*(1-q),'xy',20);}
   if(a==='D')for(let j=0;j<n;j++){const points=[];for(let i=0;i<=24;i++){const q=i/24,angle=j/n*TAU+t*3-q*5*p.persistence,rr=r*(.5+q*p.spread);points.push([anchor.x+Math.cos(angle)*rr,anchor.y+Math.sin(angle)*rr,anchor.z-length*q]);}out.ribbon(points,.11*w,j%2?pk:cy,alpha);shard(points[18],.09*w,wh,alpha*.8,t);}
   if(a==='E'){stroke([anchor.x,anchor.y,anchor.z],[anchor.x,anchor.y,anchor.z-length],.1*w,wh,alpha*.8);for(let i=0;i<n;i++){const q=frac(i/n+t*.35/p.persistence),z=anchor.z-length*q;ring([anchor.x,anchor.y,z],r*(1+.2*Math.sin(q*TAU)+q*p.spread),.04*w,i%2?pk:cy,alpha*(1-q),'xy',6);}}
  }return;
 }
 if(c==='boost'){
  if(a==='A'){for(let i=0;i<n;i++){const q=frac(t*.8+i/n),r=(.8+q*2.2)*extent;ring([0,0,rear-q*3],r,.16*w*(1-q),i%2?cy:pk,alpha*(1-q),'xy');}spray([0,0,rear],n*3,4*extent,.45);}
  if(a==='B')for(let i=0;i<n*2;i++){const angle=i/(n*2)*TAU,q=frac(t*1.2+rand(i)),r=(2.6+rand(i+4))*extent,z=6-q*15;stroke([Math.cos(angle)*r,Math.sin(angle)*r*.6,z],[Math.cos(angle)*r,Math.sin(angle)*r*.6,z-2.3],.075*w,i%3?cy:pk,alpha*.6);}
  if(a==='C')for(let i=0;i<n;i++){const points=[];for(let j=0;j<12;j++){const q=j/11;points.push([(i%2?1:-1)*(hx*.65+(noise(seed+Math.floor(t*12),i*12+j)-.5)*.65*extent),.35+Math.sin(q*Math.PI)*.7,(front-1)-(front-rear)*q]);}out.ribbon(points,.065*w,i%2?cy:wh,alpha);}
  if(a==='D')for(let i=1;i<=n;i++)ghosts.push({matrix:m4.T(Math.sin(t)*i*.025,0,-i*.8*extent*(.8+u)),alpha:alpha*.27*(1-i/(n+1)),color:i%2?pk:cy,edges:false,width:w});
  if(a==='E')for(let i=0;i<n;i++){const q=frac(i/n+t*.55);for(let j=0;j<4;j++)ring([0,0,rear-2*q],(1.5+q*2.5)*extent,.18*w, j%2?pk:cy,alpha*(1-q),'xy',8,j*TAU/4+t*.2,TAU/5);}
 }
 if(c==='spin'){
  const radius=(hx+.6)*p.radius,angle=t*4;
  if(a==='A'){ring([0,-.12,0],radius,.28*w,cy,alpha*.75);ring([0,-.1,0],radius*1.1,.045*w,wh,alpha);for(let i=0;i<n;i++)shard(rad(angle+i/n*TAU,radius),.24*w,pk,alpha,angle+i/n*TAU);}
  if(a==='B')for(let i=0;i<n;i++){const q=angle+i/n*TAU;out.tri(rad(q,radius*.45),rad(q+.32,radius*1.15),rad(q-.1,radius*.92),i%2?pk:cy,alpha);ring([0,.03,0],radius*.97,.05*w,wh,alpha,'xz',9,q-.4,.65);}
  if(a==='C')for(let k=0;k<n;k++){const points=[];for(let j=0;j<12;j++){const q=(k+j/12)/n,an=angle+q*TAU*2;points.push(rad(an,radius,-.9+q*1.8));}out.ribbon(points,.13*w,k%2?cy:pk,alpha);}
  if(a==='D')for(let i=0;i<n;i++){const q=frac(t*.5+i/n);ring([0,-.2+q*.12,0],radius*(.35+q),.13*w*(1-q*.7),i%2?pk:cy,alpha*(1-q));}
  if(a==='E'){ring([0,0,0],radius,.18*w,cy,alpha,'xz',n,angle);ring([0,.1,0],radius*1.1,.045*w,pk,alpha,'xz',n,-angle*.6);for(let i=0;i<n;i++){const q=angle+i/n*TAU;stroke(rad(q,radius),rad(q+.4,radius*.7),.055*w,wh,alpha);}}
 }
 if(c==='side'){
  const x=side*(hx+.3),z=-.1,reach=extent*(.7+u),phase=t*2;
  if(a==='A')for(let i=0;i<n;i++){const off=i*.13,points=[];for(let j=0;j<=16;j++){const q=j/16;points.push([x+side*Math.sin(q*Math.PI)*reach,.15+off,(q-.5)*5]);}out.ribbon(points,.22*w*(1-i/(n+1)),i%2?pk:wh,alpha);}
  if(a==='B')for(let i=0;i<n;i++)ring([x,0,z],reach*(.5+i*.12),.1*w,i%2?cy:pk,alpha*(1-i/(n+1)),'yz',28,-Math.PI/2+phase*.1,Math.PI);
  if(a==='C')for(let i=0;i<n;i++){const y=.1+i*.15;out.quad([x-side*reach,y,-1.6],[x+side*reach,y,-1],[x+side*reach,y,.2],[x-side*reach,y,.9],i%2?cy:pk,alpha*(1-i/(n+1)));stroke([x-side*reach,y,-1.6],[x+side*reach,y,-1],.05*w,wh);}
  if(a==='D'){for(let i=0;i<n;i++){const q=frac(t*.6+i/n);ring([x+side*q*reach,0,0],.4+q,.08*w,cy,alpha*(1-q),'yz',20);}spray(contact,n*2,extent,1,pk);}
  if(a==='E'){for(let i=1;i<=n;i++)ghosts.push({matrix:m4.T(-side*i*.28*extent*(.6+u),0,0),alpha:alpha*.3*(1-i/(n+1)),color:pk,edges:true,width:w});for(let i=0;i<n;i++)stroke(contact,[x+side*rand(i)*reach,(rand(i+8)-.5)*1.5,(rand(i+9)-.5)*2],.045*w,cy);}
 }
 if(c==='shield'){
  const r=p.radius*(.5+sim.impact)*(.65+.35*u),cx=contact[0];
  if(a==='A')for(let i=0;i<n;i++){const a0=i/n*TAU,point=[cx,contact[1]+Math.cos(a0)*r,contact[2]+Math.sin(a0)*r],A=[cx,contact[1]+Math.cos(a0-.18)*r*.22,contact[2]+Math.sin(a0-.18)*r*.22],B=[cx,contact[1]+Math.cos(a0+.18)*r*.22,contact[2]+Math.sin(a0+.18)*r*.22];out.tri(point,A,B,i%2?pk:wh,alpha);stroke(A,point,.025*w,cy);}
  if(a==='B')for(let i=0;i<n;i++){const an=i/n*TAU+t*.2,center=[cx,contact[1]+Math.sin(an)*r*.55,contact[2]+Math.cos(an)*r*.8];ring(center,.32*r,.045*w,cy,alpha,'yz',6,an);ring(center,.28*r,.22*r,pk,alpha*.18,'yz',6,an);}
  if(a==='C')for(let i=0;i<n;i++){const points=[contact];for(let j=1;j<=5;j++){const a0=i/n*TAU+(rand(i*10+j)-.5)*.6,rr=j/5*r;points.push([cx,contact[1]+Math.cos(a0)*rr,contact[2]+Math.sin(a0)*rr]);}out.ribbon(points,.052*w,cy,alpha);}
  if(a==='D')for(let i=0;i<n;i++){const q=frac(t*.6+i/n);ring([cx-side*q*.3,contact[1],contact[2]],(.15+q)*r,.09*w,i%2?cy:pk,alpha*(1-q),'yz',40);}
  if(a==='E'){ring([cx,contact[1],contact[2]],r,.14*w,cy,alpha,'yz',24,-1.3+t*.15,2.6);for(let i=0;i<n;i++){const an=(rand(i)-.5)*2.8;shard([cx+side*rand(i+20)*.5,contact[1]+Math.sin(an)*r,contact[2]+Math.cos(an)*r],.18*w,pk,alpha,an);}}
 }
 if(c==='drift'){
  const slip=sim.slip,flow=t*(.3+speed),len=p.length*(1+speed),y=floor+.03;
  if(a==='A')for(let i=0;i<n;i++){const q=frac(flow*.5+i/n),x=(i%2?1:-1)*hx*.7;stroke([x+slip*q*len,y,rear-q*len*2],[x+slip*(q+.2)*len,y,rear-(q+.2)*len*2],.17*w,i%2?cy:pk,alpha*(1-q));}
  if(a==='B')spray([side*hx*.8,y,rear*.4],n*3,len,Math.abs(slip)+.15,gd);
  if(a==='C')for(let i=0;i<n;i++){const points=[];for(let j=0;j<20;j++){const q=j/19;points.push([(i/(n-1)-.5)*hx*1.6+slip*q*q*len,y,front*.6-q*len*4]);}out.ribbon(points,.04*w,i%3?cy:pk,alpha*(.55+.25*Math.sin(flow+i)));}
  if(a==='D')for(let i=0;i<n;i++){const q=frac(flow*.25+i/n);ring([slip*.3,y,0],(.4+q*hx)*len*.65,.075*w,cy,alpha*(1-q));}
  if(a==='E')for(let i=0;i<n;i++){const q=frac(flow*.5+i/n);for(const k of [-1,1])out.quad([k*hx*.7+slip*q*len,y,rear-q*len*2],[k*hx*.7+slip*q*len+.14*w,y,rear-q*len*2],[k*hx*.7+slip*(q+.12)*len+.14*w,y,rear-(q+.12)*len*2],[k*hx*.7+slip*(q+.12)*len,y,rear-(q+.12)*len*2],k===1?cy:pk,alpha*(1-q));}
 }
 if(c==='collision'){
  const age=Math.min(1,u*p.rate),r=extent*(.4+sim.impact*1.4)*age;
  if(a==='A')for(let i=0;i<n;i++){const an=rand(i)*TAU,q=[contact[0]-side*r*rand(i+2),contact[1]+Math.sin(an)*r*.7-r*r*.15,contact[2]+Math.cos(an)*r];stroke(q,[q[0]+side*.25*w,q[1]-.06*w,q[2]-.15*w],.035*w,i%3?gd:wh);}
  if(a==='B')for(let i=0;i<n;i++)shard([contact[0]-side*rand(i)*r,contact[1]+(rand(i+20)-.3)*r,contact[2]+(rand(i+3)-.5)*r*2],(.12+rand(i)*.18)*w,i%2?pk:cy,alpha,t+i);
  if(a==='C')for(let i=0;i<n;i++)ring(contact,r*(.25+i/n),.1*w*(1-i/(n+1)),i%3?cy:wh,alpha*(1-i/(n+1)),'yz',32);
  if(a==='D')for(let i=0;i<n;i++){const y=contact[1]+(rand(i)-.5)*r;stroke([contact[0],y,contact[2]-.3],[contact[0]-.1*side,y+(rand(i+4)-.5)*.4,contact[2]-r*(1+rand(i+2))],.09*w,i%2?pk:wh);}
  if(a==='E')for(let i=0;i<n;i++)ring([contact[0]-side*i*.035,contact[1],contact[2]],r*(.3+i/n),.085*w,i%2?pk:cy,alpha*(1-i/(n+1)),'yz',6,t*.1);
 }
 if(c==='dash'){
  if(a==='A')for(let i=0;i<n;i++){const q=frac(t*.8+i/n),x=(i/(n-1)-.5)*hx*1.7;out.tri([x,floor,-1],[x+.15*w,floor,-1],[x+.07*w,floor+q*3*extent,-.6],i%2?pk:cy,alpha*(1-q));}
  if(a==='B')for(let i=0;i<n;i++){const q=frac(t*.5+i/n);ring([0,0,5-q*10*extent],1.5,.12*w,i%2?cy:gd,alpha*(1-q*.6),'xy',32);}
  if(a==='C')for(let i=0;i<n;i++){const q=frac(t*.6+i/n),z=rear+(front-rear)*q,y=.65+Math.sin(q*Math.PI)*.25*extent;stroke([-hx*.8,y,z],[hx*.8,y,z],.16*w,i%2?cy:wh,alpha*.7);}
  if(a==='D')for(const anchor of entry.anchors)for(let i=0;i<n;i++){const q=frac(t*.9+i/n),A=[anchor.x+Math.sin(i)*.4,floor,front*.5],B=[anchor.x,anchor.y,anchor.z],P=A.map((v,k)=>lerp(v,B[k],q));shard(P,.14*w,i%2?cy:gd,alpha,Math.PI/2);stroke(A,B,.018*w*extent,cy,alpha*.18);}
  if(a==='E')for(let i=0;i<n;i++){const q=frac(t*.55+i/n),z=4-q*8*extent;stroke([-hx,floor+.04,z-1],[0,floor+.04,z],.16*w,cy,alpha*(1-q));stroke([0,floor+.04,z],[hx,floor+.04,z-1],.16*w,cy,alpha*(1-q));shard([hx*(rand(i)-.5),.25,z],.12*w,pk,alpha*.6,t);}
 }
 if(c==='flight'){
  const pose=simulatedPose(c,time,p,sim,side),ground=floor-pose.y,air=clamp(pose.y/.4,0,1),flightTime=E.u*Math.max(p.duration*.72,.2),touchdown=2*Math.sqrt(2*sim.height/sim.gravity),landing=clamp((flightTime-touchdown)*p.rate/.35,0,1);
  if(a==='A')for(let i=0;i<n;i++){const an=i/n*TAU,x=Math.cos(an)*hx*.65,z=Math.sin(an)*1.7;stroke([x,floor,z],[x*(1+u*extent*.4),ground,z*(1+u*.3)],.04*w,cy,alpha*(1-u));}
  if(a==='B')for(let i=0;i<n;i++){const points=[];for(let j=0;j<16;j++){const q=j/15;points.push([(i%2?1:-1)*hx*.9+Math.sin(q*4+t+i)*.08, -.1+q*.3, rear-q*3*extent-i*.04]);}out.ribbon(points,.035*w,i%2?cy:wh,alpha*air);}
  if(a==='C')for(let i=0;i<n;i++){const q=clamp(u*2+i/n*.3,0,1);ring([0,ground,0],(.4+q*hx)*extent,.08*w,cy,alpha*(1-q*.8));}
  if(a==='D')for(let i=0;i<n;i++){const q=i/n;ring([0,ground+.05+q*.1,0],(.5+landing*(1+q)*hx)*extent,.13*w,i%2?pk:cy,alpha*(.1+.9*landing)*(1-q*.5));}
  if(a==='E')for(let i=0;i<n;i++){const an=i/n*TAU,r=landing*hx*extent;stroke([Math.cos(an)*r*.3,ground+.03,Math.sin(an)*r*.3],[Math.cos(an)*r,ground+.03,Math.sin(an)*r],.12*w,i%2?cy:gd,alpha*landing);shard([Math.cos(an)*r,ground+.1+Math.sin(landing*Math.PI)*.25,Math.sin(an)*r],.12*w,pk,alpha*landing,an);}
 }
 if(c==='speed'){
  const flow=t*(.2+speed),len=p.length*(.3+speed);
  if(a==='A')for(let i=0;i<n;i++){const an=i/n*TAU,r=3+rand(i)*1.5,z=6-frac(flow*.5+rand(i))*14;stroke([Math.cos(an)*r,Math.sin(an)*r*.55,z],[Math.cos(an)*r,Math.sin(an)*r*.55,z-len*2],.035*w,i%4?cy:pk,alpha*.55);}
  if(a==='B')for(let i=0;i<n;i++){const q=frac(flow*.2+i/n);ring([0,0,8-q*16],(2+q*2)*len,.045*w,i%2?pk:cy,alpha*.22,'xy',4,Math.PI/4);}
  if(a==='C')for(let i=1;i<=n;i++)ghosts.push({matrix:m4.T(0,0,-i*.4*len*(.9+Math.sin(flow)*.1)),alpha:alpha*.4*(1-i/(n+1)),color:i%2?pk:cy,edges:true,width:w});
  if(a==='D')for(let i=0;i<n;i++){const an=rand(i)*TAU,r=2.8+rand(i+2)*2;shard([Math.cos(an)*r,Math.sin(an)*r*.7,7-frac(flow*.4+rand(i+5))*14],.17*w*len,i%2?cy:pk,alpha*.6,Math.PI/2);}
  if(a==='E')for(let i=0;i<n;i++){const an=i/n*TAU,points=[];for(let j=0;j<14;j++){const q=j/13,rr=3+Math.sin(q*2+flow)*.25;points.push([Math.cos(an)*rr,Math.sin(an)*rr*.6,5-q*9*len]);}out.ribbon(points,.028*w,i%3?cy:pk,alpha*.5);}
 }
}
