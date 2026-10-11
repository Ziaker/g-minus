/* P12 V2 — NAVES, VFX APROVADOS E CAMADA DE MUNDO DOS HUDs.
   Naves: renderModel do 06 (passe D) com resolveLivery('B') por instância, geometria canônica do 05.
   VFX: effectFrame do 04 V2 com APPROVED_PARAMS, acionado por eventos reais da simulação. */
const FX_VS=`attribute vec3 a_position;attribute vec4 a_color;uniform mat4 u_matrix;varying vec4 v_color;void main(){v_color=a_color;gl_Position=u_matrix*vec4(a_position,1.);}`;
const FX_FS=`precision mediump float;varying vec4 v_color;void main(){gl_FragColor=v_color;}`;
const RACE_GL={fx:null,fxLoc:{},fxBuf:null,live:0};
const fxArena=new VFX.Arena(24000),hudArena=new VFX.Arena(24000);
function raceGLInit(gl){RACE_GL.fx=compileProgram(gl,FX_VS,FX_FS);const p=RACE_GL.fx;RACE_GL.fxLoc={position:gl.getAttribLocation(p,'a_position'),color:gl.getAttribLocation(p,'a_color'),matrix:gl.getUniformLocation(p,'u_matrix')};
 RACE_GL.fxBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,RACE_GL.fxBuf);gl.bufferData(gl.ARRAY_BUFFER,fxArena.data.byteLength,gl.DYNAMIC_DRAW);RACE_GL.live=1;}
function raceGLDispose(gl,lost){if(!lost){if(RACE_GL.fxBuf)gl.deleteBuffer(RACE_GL.fxBuf);if(RACE_GL.fx)gl.deleteProgram(RACE_GL.fx);}RACE_GL.fx=null;RACE_GL.fxBuf=null;RACE_GL.live=0;}
function drawArena(gl,arena,VP,model){if(!arena.count)return;gl.useProgram(RACE_GL.fx);for(let i=0;i<8;i++)gl.disableVertexAttribArray(i);gl.bindBuffer(gl.ARRAY_BUFFER,RACE_GL.fxBuf);gl.bufferSubData(gl.ARRAY_BUFFER,0,arena.data.subarray(0,arena.count*7));
 const L=RACE_GL.fxLoc;gl.enableVertexAttribArray(L.position);gl.vertexAttribPointer(L.position,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(L.color);gl.vertexAttribPointer(L.color,4,gl.FLOAT,false,28,12);
 gl.uniformMatrix4fv(L.matrix,false,new Float32Array(model?m4.mul([...VP],model):VP));gl.disable(gl.CULL_FACE);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,arena.count);gl.depthMask(true);RSTAT.draws++;RSTAT.tris+=arena.count/3;RSTAT.fx+=arena.count;}
// matriz de mundo a partir de uma base (X = esquerda da nave = -R, Y = normal, Z = frente)
function frameMatrix(p,T,N,R){const X=vec.scale(R,-1);return [X[0],X[1],X[2],0,N[0],N[1],N[2],0,T[0],T[1],T[2],0,p[0],p[1],p[2],1];}
function preparedEntry(ship,variant){const e=getEntry(ship,variant);if(!e.anchors)e.anchors=VFX.anchorData(e.mesh);return e;}
function shipModelMatrix(e,pose){const lift=m4.T(0,-e.report.bounds.min[1],0);return m4.mul(frameMatrix(pose.p,pose.T,pose.N,pose.R),m4.mul(lift,modelMatrix(e,0)));}
const rot3=m=>new Float32Array([m[0],m[1],m[2],m[4],m[5],m[6],m[8],m[9],m[10]]);
let PAL_CACHE=new Map();
function shipPalette(race,id){const k=race.seed+':'+id;let p=PAL_CACHE.get(k);if(!p){const s=race.statics[id];p=resolveLivery('B',s.ship,s.livery);PAL_CACHE.set(k,p);}return p;}
// luz das naves: 'world' = direção fixa no mundo (padrão); 'camera' = modo de diagnóstico do 06 (não aprovado)
function craftLighting(mats,shipP,mode){if(mode==='camera'){const z=vec.norm(vec.sub(mats.eye,shipP)),x=vec.norm(vec.cross([mats.V[1],mats.V[5],mats.V[9]],z)),y=vec.cross(z,x),f=r=>vec.norm([x[0]*r[0]+y[0]*r[1]+z[0]*r[2],x[1]*r[0]+y[1]*r[1]+z[1]*r[2],x[2]*r[0]+y[2]*r[1]+z[2]*r[2]]);return {L:f(LIGHT_REF),V:z};}
 return {L:vec.norm(LIGHT_V6),V:vec.norm(vec.sub(mats.eye,shipP))};}
function beginCraftPass(gl,mats,light){gl.useProgram(GLR.prog);for(let i=0;i<8;i++)gl.disableVertexAttribArray(i);gl.uniformMatrix4fv(GLR.u.vp,false,mats.VP);gl.uniform3fv(GLR.u.light,light.L);gl.uniform3fv(GLR.u.view,light.V);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
// cópias "fantasma" (afterimage) — mesma técnica do atelier 04 V2: casca vetorial magenta ou silhueta chapada
function drawGhostCopy(gl,e,g,model,mats,light){beginCraftPass(gl,mats,light);const sc=1+.005*g.width,scaled=m4.mul(model,m4.mul(g.matrix,m4.S(sc,sc,sc)));gl.uniformMatrix4fv(GLR.u.model,false,new Float32Array(scaled));gl.uniformMatrix3fv(GLR.u.rot,false,rot3(scaled));gl.depthMask(false);gl.disable(gl.CULL_FACE);
 if(g.edges){gl.uniform3fv(GLR.u.wireColor,g.color);for(const l of e.gpu.lines){bindBuf(l);setU({wire:1,opacity:g.alpha});draw(l,gl.LINES,false);}}else for(const b of e.gpu.batches){bindBuf(b);setU({flat:true,color:g.color,opacity:g.alpha});draw(b,gl.TRIANGLES,true);}gl.depthMask(true);}
// parâmetros de VFX usados no laboratório: calibração aprovada (APPROVED_PARAMS) do 04 V2
const vfxP=(c,a)=>VFX.APPROVED_PARAMS[c][a];
function vfxSim(sh){return {speed:sh.v*KMH,throttle:clamp(.55+sh.acc/60,0,1),slip:sh.slip,impact:clamp((sh.collDmg||6)/10,.1,1),gravity:30,height:.001};}
// lista de efeitos ativos de uma nave neste instante (categoria, alternativa, tempo do evento, lado, ancoragem)
function activeEffects(race,st,sh,opts,isPlayer){const t=raceTime(st),out=[],dur=(c,a)=>VFX.eventParams(c,vfxP(c,a),vfxSim(sh)).duration;
 out.push({c:'propulsion',a:'A',time:t});
 if(isPlayer&&opts.speedLines)out.push({c:'speed',a:'A',time:t});
 if(sh.drifting||Math.abs(sh.slip)>.12)out.push({c:'drift',a:opts.drift,time:t});
 for(const layer of ['B',...['A','D','E'].filter(k=>opts.boost[k])]){const age=t-sh.boostT0;if(age>=0&&age<dur('boost',layer))out.push({c:'boost',a:layer,time:age});}
 if(t-sh.spinT0<dur('spin','E'))out.push({c:'spin',a:'E',time:t-sh.spinT0});
 if(t-sh.sideT0<dur('side','E'))out.push({c:'side',a:'E',time:t-sh.sideT0,side:-sh.sideDir});
 if(t-sh.dmgT<dur('shield','D')&&sh.dmgT>0)out.push({c:'shield',a:'D',time:t-sh.dmgT,side:-(sh.dmgSide||1)});
 if(t-sh.collT0<dur('collision',opts.collision))out.push({c:'collision',a:opts.collision,time:t-sh.collT0,side:-(sh.collSide||1)});
 if(t-sh.dashT0<dur('dash','E'))out.push({c:'dash',a:'E',time:t-sh.dashT0});
 if(opts.flight==='C'&&t-sh.takeoffT0<dur('flight','C'))out.push({c:'flight',a:'C',time:t-sh.takeoffT0,anchor:'takeoff'});
 if(opts.flight==='D'&&t-sh.landT0<dur('flight','D'))out.push({c:'flight',a:'D',time:t-sh.landT0,grounded:true});
 return out;}
function groundedPose(race,sh){const f=trackFrame(sh.s);let T=f.T;if(sh.yaw)T=vec.rot(T,f.N,sh.yaw);return {p:vec.madd(vec.madd(f.p,f.R,sh.lane),f.N,.9),T,N:f.N,R:vec.cross(T,f.N)};}
/* ---------------- quadro compartilhado (uma vez por quadro, todos os viewports) ---------------- */
function buildFrame(race,st,opts){const ships=st.ships.map(sh=>{const pose=shipPose(race,sh),e=preparedEntry(race.statics[sh.id].ship,race.statics[sh.id].variant);return {sh,pose,e,model:shipModelMatrix(e,pose)};});
 return {t:raceTime(st),ships,opts};}
function renderShips(gl,race,st,F,mats,opts,budget){
 const light0=opts.light;let drawn=0;
 for(const S of F.ships){const d=vec.len(vec.sub(S.pose.p,mats.eye));if(d>opts.shipRange)continue;if(!sphereVisible(mats.VP,S.pose.p,8,mats.eye,opts.shipRange))continue;
  const light=craftLighting(mats,S.pose.p,light0);beginCraftPass(gl,mats,light);
  // giro do Spin E: rotação visual da nave conforme o atelier (u · 2π · rate)
  let model=S.model;const spinAge=F.t-S.sh.spinT0,pS=vfxP('spin','E');if(spinAge>=0&&spinAge<pS.duration){const yaw=VFX.simulatedPose('spin',spinAge,pS).yaw;const b=S.e.report.bounds,cx=(b.min[0]+b.max[0])/2,cz=(b.min[2]+b.max[2])/2;model=m4.mul(frameMatrix(S.pose.p,S.pose.T,S.pose.N,S.pose.R),m4.mul(m4.T(0,-b.min[1],0),m4.mul(m4.RY(yaw),m4.T(-cx,0,-cz))));}
  renderModel(S.e,model,rot3(model),shipPalette(race,S.sh.id));drawn++;RSTAT.ships++;
  if(d>opts.vfxRange)continue;
  const isP=S.sh.id===0,fx=activeEffects(race,st,S.sh,opts,isP);
  for(const ef of fx){fxArena.reset(budget);VFX.ghosts.length=0;const sim=vfxSim(S.sh);VFX.effectFrame(ef.c,ef.a,vfxP(ef.c,ef.a),ef.time,S.e,sim,ef.side??1,race.seed%999983+S.sh.id,fxArena);
   let fxModel=model;
   if(ef.c==='drift'||ef.grounded){const gp=groundedPose(race,S.sh);fxModel=shipModelMatrix(S.e,gp);}
   if(ef.anchor==='takeoff'){const f=trackFrame(S.sh.takeoffS);fxModel=shipModelMatrix(S.e,{p:vec.madd(vec.madd(f.p,f.R,S.sh.lane),f.N,.9),T:f.T,N:f.N,R:f.R});}
   for(const g of VFX.ghosts)drawGhostCopy(gl,S.e,g,fxModel,mats,light);
   drawArena(gl,fxArena,mats.VP,fxModel);}
 }
 return drawn;}
