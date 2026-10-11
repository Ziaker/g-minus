/* P12 V2 — CÂMERAS. Três filosofias independentes do HUD, atualizadas a cada passo de simulação
   (120 Hz) para que todas estejam aquecidas e coerentes no mesmo quadro. Nenhuma depende do eixo
   vertical global: o "para cima" vem do referencial da pista (transporte paralelo + inclinação).
   Suavizações são feitas no referencial da nave (sem atraso de translação a 300 m/s). */
const CAM_META={
 A:{name:'Cinética',tag:'perseguição épica · sensação',intent:'Segue o nariz da nave com atraso angular, revela o deslizamento, recua no impulso, treme com impactos (ruído com semente) e inclina com a pista. Prioriza sensação de velocidade e força.'},
 B:{name:'Tática',tag:'elevada · leitura do pelotão',intent:'Alinhada à tangente da pista (não ao nariz), elevada e centralizada na pista para mostrar largura, vizinhos e ameaças. Enquadra automaticamente o adversário mais próximo. Horizonte quase estável.'},
 C:{name:'Pilotagem',tag:'preditiva · traçado à frente',intent:'Aponta para onde a nave estará em ~0,5 s, girando antes da curva e mostrando o ápice. Horizonte travado na normal da pista sem inclinação, pouca inércia e ajuste de pitch para manter o traçado visível em cristas, saltos e loops.'}
};
const CP=(id,label,min,max,step,unit,desc)=>({id,label,min,max,step,unit,desc});
const CAM_PARAMS=[
 CP('distance','Distância',4,50,.5,'m','Distância atrás da nave'),
 CP('height','Altura',.5,30,.1,'m','Altura sobre a nave, no "para cima" da câmera'),
 CP('pitch','Pitch',-5,40,.5,'°','Inclinação adicional para baixo'),
 CP('fovBase','FOV base',45,90,1,'°','Campo de visão vertical em repouso'),
 CP('fovSpeed','Resposta do FOV à velocidade',0,30,.5,'°','FOV adicional a 1500 km/h'),
 CP('lookAhead','Look-ahead',0,400,1,'m','Distância do ponto de mira à frente'),
 CP('smoothing','Suavização (posição)',0,1,.01,'','0 = rígida · 1 = muito atrasada'),
 CP('inertia','Inércia (rotação)',0,1,.01,'','Atraso de rotação da direção de mira'),
 CP('curveFollow','Acompanhamento de curvas',0,1,.01,'','Quanto a mira entra na curva à frente'),
 CP('roll','Inclinação lateral',0,1,.01,'','0 = horizonte sem inclinação · 1 = segue inclinação da pista/nave'),
 CP('driftResponse','Resposta ao drift',0,1,.01,'','Quanto revela o ângulo de deslizamento'),
 CP('impactResponse','Resposta a impactos',0,1.5,.01,'','Tranco e tremor em golpes e colisões'),
 CP('threatFraming','Antecipação de ameaças',0,1,.01,'','Recuo e enquadramento de adversários próximos'),
 CP('invertedFollow','Reação a superfícies verticais/invertidas',.1,1,.01,'','Rapidez com que o "para cima" acompanha a normal da pista'),
 CP('pathVisibility','Visibilidade da trajetória',0,1,.01,'','Pitch/altura extra para manter o traçado à frente visível')
];
const CAM_SPECIAL={A:CP('boostPull','Recuo no impulso',0,1,.01,'','Afastamento e FOV extra durante o impulso'),B:CP('laneCentering','Centralização na pista',0,1,.01,'','Desloca a câmera para o centro da pista'),C:CP('apexBias','Mira no ápice',0,1,.01,'','Desloca a mira para o interior da próxima curva')};
const CAM_DEFAULTS={
 A:{distance:11,height:2.8,pitch:6,fovBase:66,fovSpeed:16,lookAhead:40,smoothing:.55,inertia:.5,curveFollow:.5,roll:.7,driftResponse:.6,impactResponse:1,threatFraming:.4,invertedFollow:.8,pathVisibility:.4,boostPull:.5},
 B:{distance:26,height:11,pitch:12,fovBase:58,fovSpeed:5,lookAhead:170,smoothing:.7,inertia:.75,curveFollow:.3,roll:.15,driftResponse:.1,impactResponse:.3,threatFraming:.8,invertedFollow:.7,pathVisibility:.6,laneCentering:.6},
 C:{distance:9.5,height:2.2,pitch:4,fovBase:62,fovSpeed:8,lookAhead:150,smoothing:.25,inertia:.3,curveFollow:.85,roll:.1,driftResponse:.2,impactResponse:.25,threatFraming:.2,invertedFollow:.9,pathVisibility:.8,apexBias:.4}
};
const camParamDefs=id=>[...CAM_PARAMS,CAM_SPECIAL[id]];
function camInit(){return {ok:false,off:[0,0,0],dir:[0,0,1],up:[0,1,0],fov:60,shake:0,kick:[0,0,0],kickV:[0,0,0],threat:0,threatSide:0,boost:0,eye:[0,0,0],target:[0,0,1]};}
function camClone(c){return deepClone(c);}
// contexto comum por passo (calculado uma vez e compartilhado pelas três câmeras)
function camContext(race,st,hits){
 const P=st.ships[0],pose=shipPose(race,P),f=pose.frame,v=P.v;
 const unbanked=vec.rot(f.N,f.T,-f.bank);
 // ameaças: naves a até 90 m com peso pela proximidade; ataques telegrafados pesam mais
 let tw=0,tc=[0,0,0],side=0;
 for(const o of st.ships){if(o===P)continue;const ds=o.s-P.s;if(Math.abs(ds)>90)continue;const dl=o.lane-P.lane,d=Math.hypot(ds,dl);if(d>60)continue;
  let w=clamp(1-d/60,0,1);if(o.side>0&&o.sideTarget===0)w+=1.5;if(o.spinT>0&&d<14)w+=1;
  tw+=w;const op=shipPose(race,o).p;tc=vec.madd(tc,op,w);side+=Math.sign(dl)*w;}
 return {race,P:{id:P.id,s:P.s,lane:P.lane,v:P.v,alt:P.alt},pose,f,v,unbanked,boost:P.boostT>0?1:0,slip:P.slip,air:P.air,alt:P.alt,hits,t:raceTime(st),threatW:tw,threatC:tw>0?vec.scale(tc,1/tw):null,threatSide:tw>0?side/tw:0};
}
const pathPoint=(s,lane,up=.9)=>{const f=trackFrame(s);return vec.madd(vec.madd(f.p,f.R,lane),f.N,up);};
function camUpdate(c,id,p,ctx,dt){
 const {P,pose,f,v}=ctx,spd=clamp(v*KMH/1500,0,1.3);
 // impactos: tranco direcional (mola) + energia de tremor
 for(const h of ctx.hits){const mag=clamp(h.dmg/10,.2,1.6)*p.impactResponse;c.kickV=vec.madd(c.kickV,f.R,-h.side*mag*9);c.kickV=vec.madd(c.kickV,f.N,mag*3);c.shake=Math.min(2,c.shake+mag*(id==='A'?1:.45));}
 for(let k=0;k<3;k++){const [x,vv]=springStep(c.kick[k],c.kickV[k],0,14,dt);c.kick[k]=x;c.kickV[k]=vv;}
 c.shake*=Math.exp(-5.5*dt);
 c.boost=damp(c.boost,ctx.boost,ctx.boost?6:2.5,dt);
 c.threat=damp(c.threat,clamp(ctx.threatW/2,0,1),3,dt);c.threatSide=damp(c.threatSide,ctx.threatSide,3,dt);
 // "para cima" alvo: normal da pista sem/sem inclinação conforme 'roll'; A soma parte da rolagem da nave
 let upT=vec.ortho(vec.lerp(ctx.unbanked,f.N,p.roll),f.T);
 if(id==='A')upT=vec.ortho(vec.lerp(upT,pose.N,p.roll*.35),f.T);
 // direção-base de cada filosofia
 let base;
 if(id==='A')base=vec.norm(vec.lerp(pose.T,f.T,p.driftResponse));                // nariz ↔ vetor velocidade (revela o deslizamento)
 else if(id==='B')base=vec.norm(vec.lerp(f.T,pose.T,p.driftResponse*.5));          // tangente da pista
 else{const look=Math.max(20,v*clamp(p.lookAhead/300,0,1.4));const kA=trackCurv(P.s+look*.8),hwA=trackHw(P.s+look);
  const aimLane=clamp(P.lane-Math.sign(kA)*Math.min(1,Math.abs(kA)*700)*p.apexBias*hwA*.6,-hwA,hwA);
  const pred=vec.norm(vec.sub(pathPoint(P.s+look,aimLane,.9+ctx.alt*.5),pose.p)),b0=vec.norm(vec.lerp(pose.T,f.T,p.driftResponse));base=vec.norm(vec.lerp(b0,pred,p.curveFollow));}
 // posição desejada relativa à nave (sem atraso translacional)
 const upNow=vec.ortho(c.ok?c.up:upT,base);
 let dist=p.distance*(1+(id==='A'?p.boostPull*.35*c.boost:0)+p.threatFraming*.25*c.threat);
 let height=p.height*(1+(id==='B'?p.threatFraming*.3*c.threat:0));
 let off=vec.madd(vec.scale(base,-dist),upNow,height);
 if(id==='B')off=vec.madd(off,f.R,-P.lane*p.laneCentering);
 // trajetória à frente: se a pista cai além de uma crista (ou no salto), sobe e inclina
 const D=60+v*.6,q=pathPoint(P.s+D,P.lane),hq=vec.dot(vec.sub(q,pose.p),upNow),crest=clamp(-Math.atan2(hq,D),-.25,.45)*p.pathVisibility;
 off=vec.madd(off,upNow,Math.max(0,crest)*dist*.6);
 const posRate=lerp(40,2.2,p.smoothing);
 c.off=c.ok?dampVec(c.off,off,posRate,dt):off;
 let eye=vec.add(pose.p,c.off);
 // ponto de mira
 let aim;
 if(id==='A'){const la=p.lookAhead*(.4+.6*spd);aim=vec.madd(pose.p,base,la);const kA=trackCurv(P.s+v*.5);aim=vec.madd(aim,f.R,clamp(-kA*p.curveFollow*9000,-22,22));}
 else if(id==='B'){const la=p.lookAhead*(.5+.5*spd);aim=pathPoint(P.s+la,P.lane*(1-p.laneCentering*.5));const kB=trackCurv(P.s+la);aim=vec.madd(aim,f.R,clamp(-kB*p.curveFollow*12000,-30,30));}
 else{aim=vec.madd(pose.p,base,Math.max(25,p.lookAhead*.4));}
 if(ctx.threatC&&c.threat>.01){const w=p.threatFraming*c.threat*(id==='B'?.6:id==='A'?.3:.15);aim=vec.lerp(aim,ctx.threatC,clamp(w,0,.6));}
 // tremor determinístico (ruído suave com semente fixa) + tranco
 if(c.shake>1e-4){const a=c.shake*.55,tt=ctx.t*17;eye=vec.madd(eye,f.R,a*smoothNoise(911,tt));eye=vec.madd(eye,upNow,a*.7*smoothNoise(912,tt+40));aim=vec.madd(aim,f.R,a*.6*smoothNoise(913,tt+90));}
 eye=vec.add(eye,c.kick);
 // direção de mira com inércia rotacional; pitch e crista aplicados sobre o eixo direito da câmera
 let dir=vec.norm(vec.sub(aim,eye));
 // em curvatura vertical forte (loop) o ponto de mira pode ficar "atrás" da curva: limita o desvio a 55° da tangente
 {const cosMax=Math.cos(55*D2R),dd=vec.dot(dir,f.T);if(dd<cosMax){const perp=vec.ortho(vec.sub(dir,vec.scale(f.T,dd)),f.T),k=Math.sin(55*D2R);dir=vec.norm(vec.add(vec.scale(f.T,cosMax),vec.scale(perp,k)));}}const right=vec.norm(vec.cross(dir,upNow));
 dir=vec.rot(dir,right,-(p.pitch*D2R+Math.max(0,crest)*.6));
 const rotRate=lerp(40,3,p.inertia);
 c.dir=c.ok?vec.norm(dampVec(c.dir,dir,rotRate,dt)):dir;
 // garantia de enquadramento: a nave nunca passa de 75 % do meio campo de visão (após a inércia)
 {const toShip=vec.norm(vec.sub(pose.p,eye)),th=Math.acos(clamp(vec.dot(c.dir,toShip),-1,1)),lim=(c.ok?c.fov:p.fovBase)*D2R*.5*.75;
  if(th>lim){const ax=vec.cross(c.dir,toShip),sn=vec.len(ax);if(sn>1e-6)c.dir=vec.norm(vec.rot(c.dir,vec.scale(ax,1/sn),th-lim));}}
 const upRate=lerp(2,32,p.invertedFollow);
 let up=c.ok?vec.norm(dampVec(c.up,upT,upRate,dt)):upT;
 if(Math.abs(vec.dot(up,c.dir))>.97)up=vec.ortho(vec.add(up,vec.scale(upT,2)),c.dir);up=vec.ortho(up,c.dir);if(!Number.isFinite(up[0])||vec.len(up)<.5)up=vec.ortho(upT,c.dir);
 c.up=up;
 const fovT=p.fovBase+p.fovSpeed*clamp((v*KMH-500)/1000,0,1.2)+(id==='A'?p.boostPull*8*c.boost:0)+p.threatFraming*4*c.threat;
 c.fov=c.ok?damp(c.fov,fovT,6,dt):fovT;
 c.eye=eye;c.target=vec.add(eye,c.dir);c.ok=true;
}
function camView(c){return {eye:c.eye,target:c.target,up:c.up,fov:c.fov};}
// matriz de visão com "para cima" arbitrário (a lookAt herdada do 06 usa [0,1,0] fixo)
function lookAtUp(eye,target,up){const z=vec.norm(vec.sub(eye,target)),x=vec.norm(vec.cross(up,z)),y=vec.cross(z,x),o=new Float32Array(16);
 o[0]=x[0];o[1]=y[0];o[2]=z[0];o[4]=x[1];o[5]=y[1];o[6]=z[1];o[8]=x[2];o[9]=y[2];o[10]=z[2];o[12]=-vec.dot(x,eye);o[13]=-vec.dot(y,eye);o[14]=-vec.dot(z,eye);o[15]=1;return o;}
// política de FOV: em quadros estreitos (retrato) o FOV vertical cresce para preservar parte do campo horizontal (limite 100°)
function effectiveFov(fov,aspect){if(aspect>=1.2)return fov;const k=Math.min(1.2/aspect,2);return Math.min(100,2*Math.atan(Math.tan(fov*D2R/2)*k)/D2R);}
function camMatrices(view,aspect,near=.3,far=4200){const P=mat4Persp(effectiveFov(view.fov,aspect)*D2R,aspect,near,far),V=lookAtUp(view.eye,view.target,view.up);return {P,V,VP:m4.mul([...P],[...V]),eye:view.eye};}
// projeção de um ponto do mundo para pixels de um viewport (null se atrás da câmera)
function projectPoint(VP,p,w,h){const x=VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12],y=VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13],ww=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15];if(ww<=.05)return null;return {x:(x/ww*.5+.5)*w,y:(1-(y/ww*.5+.5))*h,depth:ww,inside:Math.abs(x/ww)<=1&&Math.abs(y/ww)<=1};}
