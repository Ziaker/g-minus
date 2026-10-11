/* P12 V2 — APLICAÇÃO: executor determinístico, busca real na linha do tempo, layout de viewports
   (HUD e câmera independentes), renderização, interface e API de teste. */
const HEADLESS=typeof window!=='undefined'&&!!window.__GMINUS_HEADLESS__;
const WARM_TICKS=3*SIM_HZ;   // aquecimento das câmeras ao buscar (suavizações convergem em < 2 s)
const LAB={cfg:defaultConfig(),race:null,rec:null,rigs:{A:camInit(),B:camInit(),C:camInit()},playing:true,accum:0,last:0,recDone:false,tele:null,
 frameMs:0,fps:0,fpsN:0,fpsT:0,restores:0,diag:false,flip:false,disposed:false,toggles:0,layout:[],stageKey:'',quality:{dpr:2,shipRange:900,vfxRange:420,budget:24000}};
const $=id=>HEADLESS?null:document.getElementById(id);
/* ---------------- corrida e câmeras ---------------- */
function newRace(){const c=LAB.cfg.race;LAB.race=createRace({seed:c.seed,laps:c.laps,ships:c.ships});LAB.rec=snapshotState(LAB.race.initial);LAB.recDone=false;PAL_CACHE=new Map();resetRigs();LAB.timelineDirty=true;}
function resetRigs(){for(const id of IDS)LAB.rigs[id]=camInit();}
const live=()=>LAB.race.state;
function playerHits(race){const out=[];for(const e of race.tickEvents){if((e.type==='sideHit'||e.type==='spinHit')&&e.b===0)out.push({side:e.type==='sideHit'?-e.data.dir:-e.data.dir,dmg:e.data.dmg});else if(e.type==='collision'&&(e.a===0||e.b===0))out.push({side:e.a===0?e.data.dir:-e.data.dir,dmg:e.data.dmg});else if(e.type==='barrier'&&e.a===0)out.push({side:e.data.side,dmg:e.data.dmg});}return out;}
function updateRigs(){const race=LAB.race,st=race.state,ctx=camContext(race,st,playerHits(race));for(const id of IDS)camUpdate(LAB.rigs[id],id,LAB.cfg.camera[id],ctx,SIM_DT);}
function stepLive(){raceStep(LAB.race,LAB.race.state);updateRigs();}
function recordUntil(tick,budgetMs=Infinity){const t0=perfNow();let k=0;while(!LAB.rec.done&&LAB.race.recordedTick<tick){raceStep(LAB.race,LAB.rec);if(budgetMs!==Infinity&&(++k&31)===0&&perfNow()-t0>budgetMs)break;}if(LAB.rec.done&&!LAB.recDone){LAB.recDone=true;LAB.timelineDirty=true;}}
const perfNow=()=>typeof performance!=='undefined'?performance.now():Date.now();
function seekTick(tick){const race=LAB.race;tick=Math.max(0,Math.round(tick));const horizon=LAB.rec.done?LAB.rec.doneTick+SIM_HZ*20:Infinity;tick=Math.min(tick,horizon);
 recordUntil(tick);let base=Math.max(0,Math.floor((tick-WARM_TICKS)/SIM_HZ)*SIM_HZ);while(base>0&&!race.snapshots.has(base))base-=SIM_HZ;
 restoreState(race,race.snapshots.get(base)||race.initial);resetRigs();while(race.state.tick<tick)stepLive();}
const seekTime=t=>seekTick(t*SIM_HZ);
function scenarioTime(id){const sc=SCENARIOS.find(s=>s.id===id);if(!sc)throw Error('cenário desconhecido: '+id);if(id==='start')return 0;let t=sc.find(LAB.race);if(t===null){recordUntil(Infinity);t=sc.find(LAB.race);}return t===null?0:t;}
function gotoScenario(id){LAB.cfg.playback.scenario=id;const t=scenarioTime(id);LAB.cfg.playback.time=+t.toFixed(4);seekTime(t);syncUI();}
/* ---------------- layout de viewports ---------------- */
function combosFor(cfg){const s=cfg.selection;switch(s.view){
 case 'split':return [{...s.left},{...s.right}];
 case 'hud3':return IDS.map(h=>({hud:h,camera:s.camera}));
 case 'cam3':return IDS.map(c=>({hud:s.hud,camera:c}));
 case 'matrix':return IDS.flatMap(h=>IDS.map(c=>({hud:h,camera:c})));
 default:return [LAB.flip?{...s.right}:{hud:s.hud,camera:s.camera}];}}
function frameRect(W,H,aspect){if(aspect==='fill')return {x:0,y:0,w:W,h:H};const [a,b]=aspect.split(':').map(Number),r=a/b;let w=W,h=W/r;if(h>H){h=H;w=H*r;}return {x:(W-w)/2,y:(H-h)/2,w,h};}
function layoutCells(W,H,cfg){const combos=combosFor(cfg),n=combos.length,asp=cfg.selection.aspect;
 if(n===1){const f=frameRect(W,H,asp);return [{...f,...combos[0]}];}
 const r=asp==='fill'?16/9:asp.split(':').map(Number).reduce((a,b)=>a/b);
 const opts=n===9?[[3,3]]:n===3?[[3,1],[1,3],[2,2]]:[[2,1],[1,2]];let best=null;
 for(const [c,rw] of opts){let cw=W/c,ch=cw/r;if(ch*rw>H){ch=H/rw;cw=ch*r;}if(!best||cw*ch>best.cw*best.ch)best={c,rw,cw,ch};}
 const ox=(W-best.cw*best.c)/2,oy=(H-best.ch*best.rw)/2;return combos.map((cb,i)=>({x:ox+(i%best.c)*best.cw,y:oy+Math.floor(i/best.c)*best.ch,w:best.cw,h:best.ch,...cb}));}
/* ---------------- quadro: telemetria + modelo do HUD ---------------- */
function hudModel(hud,cell,mats,F){const st=LAB.race.state,t=raceTime(st);return {tele:LAB.tele,msgs:hudMessages(st.director,hud,t),t,race:LAB.race,st,ships:F.ships,player:F.ships[0].pose,mats,
 proj:p=>projectPoint(mats.VP,p,cell.w,cell.h)};}
function renderOpts(){const v=LAB.cfg.vfx;return {drift:v.drift,collision:v.collision,flight:v.flight,boost:v.boost,speedLines:v.speedLines,light:v.light,shipRange:LAB.quality.shipRange,vfxRange:LAB.quality.vfxRange};}
/* ---------------- WebGL ---------------- */
function glAll(){const ok=glInit();if(!ok)return false;try{worldInit(GLR.gl);raceGLInit(GLR.gl);}catch(e){showFailure(String(e.message||e));GLR.ok=false;return false;}return true;}
function onLost(e){e.preventDefault();GLR.lost=true;GLR.ok=false;dropGpuCache(false);GLR.live=0;worldDispose(GLR.gl,true);raceGLDispose(GLR.gl,true);showFailure('Contexto WebGL perdido. Estado preservado; aguardando restauração.');}
function onRestored(){GLR.lost=false;if(glSetup()){worldInit(GLR.gl);raceGLInit(GLR.gl);LAB.restores++;hideFailure();notify('WebGL restaurado: corrida, câmeras e HUD preservados.');}}
function renderFrame(){
 const st=LAB.race.state,F=buildFrame(LAB.race,st,renderOpts());RSTAT.draws=RSTAT.tris=RSTAT.chunks=RSTAT.ships=RSTAT.fx=0;
 LAB.tele=telemetry(LAB.race,st,{deltaRef:LAB.cfg.hud.C.deltaRef,forecastRange:Math.max(4000,LAB.cfg.hud.C.forecastRange||0)});
 const stage=$('stage'),cw=Math.max(1,stage.clientWidth),ch=Math.max(1,stage.clientHeight),dpr=Math.min(window.devicePixelRatio||1,LAB.quality.dpr);
 const fr=$('frame');fr.style.width=cw+'px';fr.style.height=ch+'px';
 const cells=layoutCells(cw,ch,LAB.cfg);const key=cw+'x'+ch+':'+JSON.stringify(cells.map(c=>[c.hud,c.camera,c.x|0,c.y|0,c.w|0]));if(key!==LAB.stageKey){LAB.stageKey=key;updateLabels(cells);}LAB.layout=cells;
 const canvasEl=$('view'),hudEl=$('hud'),W=Math.round(cw*dpr),H=Math.round(ch*dpr);
 if(canvasEl.width!==W||canvasEl.height!==H){canvasEl.width=W;canvasEl.height=H;}if(hudEl.width!==W||hudEl.height!==H){hudEl.width=W;hudEl.height=H;}
 const mats=renderGL(cells,W,H,dpr,st,F);
 const g=hudEl.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);
 cells.forEach((c,i)=>{g.save();g.setTransform(dpr,0,0,dpr,c.x*dpr,c.y*dpr);g.beginPath();g.rect(0,0,c.w,c.h);g.clip();HUDS[c.hud].draw(g,c.w,c.h,hudModel(c.hud,c,mats[i],F),LAB.cfg.hud[c.hud],null);g.restore();});
}
// passes WebGL de todos os viewports (sem DOM: usado também pelos testes com contexto simulado)
function renderGL(cells,W,H,dpr,st,F){const mats=cells.map(c=>camMatrices(camView(LAB.rigs[c.camera]),c.w/c.h));
 if(GLR.ok&&!GLR.lost){const gl=GLR.gl;gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,W,H);gl.clearColor(.016,.012,.03,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.SCISSOR_TEST);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  cells.forEach((c,i)=>{const x=Math.round(c.x*dpr),y=Math.round(H-(c.y+c.h)*dpr),w=Math.round(c.w*dpr),h=Math.round(c.h*dpr);gl.viewport(x,y,w,h);gl.scissor(x,y,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const M=mats[i];drawSky(gl,M);drawWorld(gl,M);renderShips(gl,LAB.race,st,F,M,renderOpts(),LAB.quality.budget);
   hudArena.reset();const H_=HUDS[c.hud];if(H_.world)H_.world(hudArena,hudModel(c.hud,c,M,F),LAB.cfg.hud[c.hud]);if(hudArena.count){gl.enable(gl.DEPTH_TEST);drawArena(gl,hudArena,M.VP,null);}});
  gl.disable(gl.SCISSOR_TEST);}
 return mats;}
/* ---------------- laço ---------------- */
function loop(now){if(LAB.disposed)return;const dt=LAB.last?Math.min(.1,(now-LAB.last)/1000):0;LAB.last=now;const t0=perfNow();
 if(!LAB.recDone)recordUntil(Infinity,7);
 if(LAB.playing){LAB.accum+=dt*LAB.cfg.playback.rate*SIM_HZ;let k=0;while(LAB.accum>=1&&k<24){stepLive();LAB.accum-=1;k++;}if(k>=24)LAB.accum=0;if(LAB.race.state.done&&LAB.race.state.tick>LAB.race.state.doneTick+SIM_HZ*8)LAB.playing=false;}
 renderFrame();LAB.frameMs=lerp(LAB.frameMs,perfNow()-t0,.1);LAB.fpsN++;if(now-LAB.fpsT>600){LAB.fps=Math.round(LAB.fpsN*1000/(now-LAB.fpsT));LAB.fpsN=0;LAB.fpsT=now;updateDiag();}
 updateTransport();requestAnimationFrame(loop);}
/* ---------------- interface ---------------- */
function el(tag,attrs={},...kids){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='on')for(const [ev,fn] of Object.entries(v))e.addEventListener(ev,fn);else if(k in e&&k!=='style')e[k]=v;else e.setAttribute(k,v);}for(const k of kids)e.append(k);return e;}
let TAB='hud',EDIT_HUD='A',EDIT_CAM='A';
function notify(text){const n=$('loading');if(n){n.textContent=text;n.dataset.until=String(perfNow()+2500);}}
function segButtons(boxId,items,get,set){const box=$(boxId);[...box.querySelectorAll('button')].forEach(b=>b.remove());for(const [v,label,title] of items){const b=el('button',{textContent:label,title:title||label,on:{click:()=>{set(v);syncUI();}}});b.dataset.v=v;box.append(b);}}
function buildChrome(){
 segButtons('hudSel',IDS.map(id=>[id,id,'HUD '+id+' · '+HUDS[id].name+' (tecla '+(IDS.indexOf(id)+1)+')']),()=>LAB.cfg.selection.hud,v=>{LAB.cfg.selection.hud=v;LAB.flip=false;EDIT_HUD=v;});
 segButtons('camSel',IDS.map(id=>[id,id,'Câmera '+id+' · '+CAM_META[id].name+' (tecla '+'QWE'[IDS.indexOf(id)]+')']),()=>LAB.cfg.selection.camera,v=>{LAB.cfg.selection.camera=v;LAB.flip=false;EDIT_CAM=v;});
 segButtons('viewSel',[['single','1','Viewport único'],['split','⇆','Comparação lado a lado'],['hud3','HUD×3','Três HUDs, mesma câmera'],['cam3','CÂM×3','Três câmeras, mesmo HUD'],['matrix','3×3','Nove combinações']],null,v=>{LAB.cfg.selection.view=v;});
 segButtons('aspectSel',ASPECTS.map(a=>[a,a==='fill'?'Livre':a]),null,v=>{LAB.cfg.selection.aspect=v;});
 const sc=$('scenario');for(const s of SCENARIOS)sc.add(new Option(s.name,s.id));sc.onchange=()=>gotoScenario(sc.value);
 $('panelBtn').onclick=()=>{document.body.classList.toggle('nopanel');};
 $('fsBtn').onclick=toggleFullscreen;$('play').onclick=()=>{LAB.playing=!LAB.playing;if(LAB.playing&&LAB.race.state.done)gotoScenario('start');syncUI();};
 $('fwd').onclick=()=>{LAB.playing=false;for(let i=0;i<2;i++)stepLive();syncUI();};$('back').onclick=()=>{LAB.playing=false;seekTick(LAB.race.state.tick-2);syncUI();};
 $('restart').onclick=()=>gotoScenario(LAB.cfg.playback.scenario);$('rate').onchange=e=>{LAB.cfg.playback.rate=Number(e.target.value);};
 const tl=$('timeline');let drag=false;const tlSeek=e=>{const r=tl.getBoundingClientRect(),f=clamp((e.clientX-r.left)/r.width,0,1);seekTime(f*timelineSpan());};
 tl.addEventListener('pointerdown',e=>{drag=true;tl.setPointerCapture(e.pointerId);LAB.playing=false;tlSeek(e);syncUI();});tl.addEventListener('pointermove',e=>{if(drag)tlSeek(e);});tl.addEventListener('pointerup',()=>drag=false);tl.addEventListener('pointercancel',()=>drag=false);
 $('jsonOpen').onclick=()=>{$('jsonText').value=exportJSON();$('jsonNotice').textContent='';$('jsonDialog').showModal();};$('jsonClose').onclick=()=>$('jsonDialog').close();$('jsonExport').onclick=()=>{$('jsonText').value=exportJSON();};
 $('jsonCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('jsonText').value);$('jsonNotice').textContent='Copiado.';}catch{$('jsonText').select();$('jsonNotice').textContent='Selecionado para cópia manual.';}};
 $('jsonImport').onclick=()=>{try{importJSON($('jsonText').value);$('jsonNotice').style.color='#43f0de';$('jsonNotice').textContent='Importado integralmente; laboratório sincronizado.';}catch(e){$('jsonNotice').style.color='#ff8fa8';$('jsonNotice').textContent='Rejeitado sem alterações: '+e.message;}};
 const tabs=[['hud','HUD'],['cam','Câmera'],['cmp','Comparar'],['scene','Cena & VFX'],['race','Corrida'],['about','Notas']];
 for(const [id,label] of tabs){const b=el('button',{textContent:label,on:{click:()=>{TAB=id;renderTab();}}});b.dataset.tab=id;$('tabs').append(b);}
 addEventListener('keydown',onKey);addEventListener('resize',()=>LAB.stageKey='');
 const cv=$('view');cv.addEventListener('webglcontextlost',onLost);cv.addEventListener('webglcontextrestored',onRestored);
 addEventListener('beforeunload',dispose);document.addEventListener('visibilitychange',()=>{LAB.last=0;});
}
function toggleFullscreen(){const s=$('stage');if(document.fullscreenElement)document.exitFullscreen();else if(s.requestFullscreen)s.requestFullscreen().catch(()=>notify('Tela cheia indisponível neste contexto.'));}
function onKey(e){if(e.target.matches('input,textarea,select')||$('jsonDialog').open)return;const k=e.key,c=e.code;let used=true;
 if(c==='Space'){LAB.playing=!LAB.playing;}else if(k==='ArrowRight'){LAB.playing=false;if(e.shiftKey)seekTick(LAB.race.state.tick+SIM_HZ);else for(let i=0;i<2;i++)stepLive();}else if(k==='ArrowLeft'){LAB.playing=false;seekTick(LAB.race.state.tick-(e.shiftKey?SIM_HZ:2));}
 else if(k==='Home')gotoScenario(LAB.cfg.playback.scenario);else if(/^[123]$/.test(k)){LAB.cfg.selection.hud=IDS[Number(k)-1];EDIT_HUD=LAB.cfg.selection.hud;LAB.flip=false;}else if(['q','w','e'].includes(k.toLowerCase())){LAB.cfg.selection.camera=IDS['qwe'.indexOf(k.toLowerCase())];EDIT_CAM=LAB.cfg.selection.camera;LAB.flip=false;}
 else if(k.toLowerCase()==='v'){const i=VIEW_MODES.indexOf(LAB.cfg.selection.view);LAB.cfg.selection.view=VIEW_MODES[(i+1)%VIEW_MODES.length];}else if(k.toLowerCase()==='x'){if(LAB.cfg.selection.view!=='single')LAB.cfg.selection.view='single';LAB.flip=!LAB.flip;}
 else if(k.toLowerCase()==='f')toggleFullscreen();else if(k.toLowerCase()==='p')document.body.classList.toggle('nopanel');else if(k.toLowerCase()==='d'){LAB.diag=!LAB.diag;}
 else if(k===']'||k==='['){const i=SCENARIOS.findIndex(s=>s.id===LAB.cfg.playback.scenario);gotoScenario(SCENARIOS[(i+(k===']'?1:SCENARIOS.length-1))%SCENARIOS.length].id);return e.preventDefault();}else used=false;
 if(used){e.preventDefault();syncUI();}}
let CTL_SEQ=0;
function ctl(def,value,onValue){const box=el('div',{className:'ctl'}),id='c'+(++CTL_SEQ),out=el('output',{id:id+'o'}),fmt=v=>(def.step>=1?Math.round(v):Number(v).toFixed(def.step<.1?2:1))+(def.unit?' '+def.unit:'');out.textContent=fmt(value);
 const lab=el('label',{htmlFor:id},def.label);lab.append(out);const inp=el('input',{type:'range',id,min:def.min,max:def.max,step:def.step,value});inp.oninput=()=>{const v=Number(inp.value);onValue(v);out.textContent=fmt(v);};box.append(lab,inp);if(def.desc)box.append(el('small',{},def.desc));return box;}
function chk(label,value,on){const i=el('input',{type:'checkbox',checked:value});i.onchange=()=>on(i.checked);return el('label',{className:'chk'},i,label);}
function sel(label,list,value,on,names){const s=el('select',{});for(const v of list)s.add(new Option(names?names[v]||v:v,v));s.value=value;s.onchange=()=>on(s.value);return el('div',{className:'row'},el('span',{textContent:label,style:'flex:0 0 46%;font-size:11.5px;color:#d4d0e6'}),s);}
function renderTab(){const b=$('tabbody');b.replaceChildren();document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab===TAB));const cfg=LAB.cfg;
 const pick=(cur,set)=>{const s=el('div',{className:'seg'});for(const id of IDS){const x=el('button',{textContent:id,on:{click:()=>{set(id);renderTab();}}});x.classList.toggle('on',id===cur);s.append(x);}return s;};
 if(TAB==='hud'){const H=HUDS[EDIT_HUD];b.append(el('p',{className:'eyebrow',textContent:'Editar HUD (independente do selecionado)'}),pick(EDIT_HUD,v=>EDIT_HUD=v),el('div',{className:'card'},el('div',{className:'tag',textContent:'HUD '+H.id+' · '+H.tag}),el('h3',{textContent:H.name}),el('p',{textContent:H.intent})));
  b.append(el('p',{className:'eyebrow',textContent:'Sliders próprios'}));for(const p of H.params)b.append(ctl(p,cfg.hud[EDIT_HUD][p.id],v=>{cfg.hud[EDIT_HUD][p.id]=v;}));
  for(const k of Object.keys(H.toggles||{}))b.append(chk(TOGGLE_LABEL[k]||k,cfg.hud[EDIT_HUD][k],v=>{cfg.hud[EDIT_HUD][k]=v;}));
  for(const [k,list] of Object.entries(H.selects||{}))b.append(sel(SELECT_LABEL[k]||k,list,cfg.hud[EDIT_HUD][k],v=>{cfg.hud[EDIT_HUD][k]=v;},SELECT_NAMES[k]));
  b.append(el('div',{className:'row'},el('button',{textContent:'Restaurar HUD '+EDIT_HUD,on:{click:()=>{cfg.hud[EDIT_HUD]=hudDefaults(EDIT_HUD);renderTab();}}})));}
 else if(TAB==='cam'){const C=CAM_META[EDIT_CAM];b.append(el('p',{className:'eyebrow',textContent:'Editar câmera (independente do HUD)'}),pick(EDIT_CAM,v=>EDIT_CAM=v),el('div',{className:'card'},el('div',{className:'tag',textContent:'Câmera '+EDIT_CAM+' · '+C.tag}),el('h3',{textContent:C.name}),el('p',{textContent:C.intent})));
  b.append(el('p',{className:'eyebrow',textContent:'Sliders próprios (valores experimentais; física P08 pendente)'}));for(const d of camParamDefs(EDIT_CAM))b.append(ctl(d,cfg.camera[EDIT_CAM][d.id],v=>{cfg.camera[EDIT_CAM][d.id]=v;}));
  b.append(el('div',{className:'row'},el('button',{textContent:'Restaurar câmera '+EDIT_CAM,on:{click:()=>{cfg.camera[EDIT_CAM]={...CAM_DEFAULTS[EDIT_CAM]};renderTab();}}})));}
 else if(TAB==='cmp'){b.append(el('p',{className:'eyebrow',textContent:'Combinações recomendadas'}));for(const r of RECOMMENDED)b.append(el('button',{className:'scen',on:{click:()=>{cfg.selection.hud=r.hud;cfg.selection.camera=r.camera;cfg.selection.view='single';LAB.flip=false;syncUI();}}},el('b',{textContent:'HUD '+r.hud+' + Câmera '+r.camera+' · '+r.name}),el('small',{textContent:r.why})));
  b.append(el('p',{className:'eyebrow',textContent:'Comparação lado a lado / sequencial (tecla X)'}));for(const side of ['left','right']){const s=cfg.selection[side];b.append(el('div',{className:'row'},el('span',{textContent:side==='left'?'Esquerda / 1ª':'Direita / 2ª',style:'flex:0 0 30%'}),pick(s.hud,v=>s.hud=v),pick(s.camera,v=>s.camera=v)));}
  b.append(el('p',{className:'note',textContent:'Em vista única, X alterna entre a 1ª e a 2ª combinação no mesmo quadro (pause para comparar o instante exato). HUD×3, CÂM×3 e 3×3 desenham o mesmo instante da simulação em todos os viewports.'}));
  b.append(el('div',{className:'row'},el('button',{textContent:'Ver lado a lado',on:{click:()=>{cfg.selection.view='split';syncUI();}}}),el('button',{textContent:'Alternar em tela cheia (X)',on:{click:()=>{cfg.selection.view='single';LAB.flip=!LAB.flip;syncUI();}}})));}
 else if(TAB==='scene'){const v=cfg.vfx;b.append(el('p',{className:'eyebrow',textContent:'VFX aprovados (04 V2) — calibração aprovada'}),el('p',{className:'note',textContent:'Propulsão A, Spin E, Side E, Escudo D, Dash E e Velocidade A são fixos. Boost B é obrigatório; A, D e E são camadas opcionais. Spin E: o laboratório 04 V2 usa varredura + 0,35 u; a dimensão desejada (130 % da varredura) segue pendente e não foi alterada aqui.'}));
  b.append(sel('Drift (selecionável)',VFX_OPTIONS.drift,v.drift,x=>v.drift=x),sel('Colisão (selecionável)',VFX_OPTIONS.collision,v.collision,x=>v.collision=x),sel('Voo (selecionável)',VFX_OPTIONS.flight,v.flight,x=>v.flight=x));
  b.append(chk('Boost B (obrigatório)',true,()=>{}),...['A','D','E'].map(k=>chk('Camada de boost '+k,v.boost[k],x=>v.boost[k]=x)),chk('Action lines (Velocidade A) na nave do jogador',v.speedLines,x=>v.speedLines=x));
  b.querySelectorAll('input[type=checkbox]')[0].disabled=true;
  b.append(sel('Luz das naves',VFX_OPTIONS.light,v.light,x=>v.light=x,{world:'Mundo (padrão)',camera:'Câmera (diagnóstico 06, não aprovado)'}));
  b.append(el('p',{className:'eyebrow',textContent:'Desempenho'}),ctl({label:'Alcance das naves',min:200,max:2000,step:50,unit:'m'},LAB.quality.shipRange,x=>LAB.quality.shipRange=x),ctl({label:'Alcance dos VFX',min:0,max:1200,step:20,unit:'m'},LAB.quality.vfxRange,x=>LAB.quality.vfxRange=x),ctl({label:'Resolução máx. (DPR)',min:.5,max:2,step:.25,unit:'×'},LAB.quality.dpr,x=>{LAB.quality.dpr=x;}));
  b.append(el('div',{className:'row'},el('button',{textContent:'Diagnóstico (D)',on:{click:()=>{LAB.diag=!LAB.diag;syncUI();}}}),el('button',{textContent:'Simular perda de contexto',on:{click:simulateContextLoss}})));}
 else if(TAB==='race'){b.append(el('p',{className:'eyebrow',textContent:'Cenários reproduzíveis (marcadores da corrida)'}));for(const s of SCENARIOS){const t=s.id==='start'?0:s.find(LAB.race);b.append(el('button',{className:'scen',disabled:t===null&&!LAB.recDone,on:{click:()=>gotoScenario(s.id)}},el('b',{textContent:s.name+(t!==null?'  ·  '+fmtTime(Math.max(0,t-SIM.GO),1):'')}),el('small',{textContent:s.desc})));}
  const r=cfg.race,draft={...r};b.append(el('p',{className:'eyebrow',textContent:'Corrida (recalcula do zero)'}),ctl({label:'Semente',min:1,max:999999,step:1},draft.seed,x=>draft.seed=x),ctl({label:'Voltas',min:1,max:5,step:1},draft.laps,x=>draft.laps=x),ctl({label:'Competidores',min:12,max:30,step:1},draft.ships,x=>draft.ships=x));
  b.append(el('div',{className:'row'},el('button',{textContent:'Aplicar e recalcular',on:{click:()=>{cfg.race={...draft};newRace();gotoScenario('start');renderTab();}}})));
  b.append(el('p',{className:'note',textContent:'Pista de teste: '+(TRACK.L/1000).toFixed(2)+' km por volta (1 u = 1 m), loop de 115 m de raio, salto de 340 m. Duração, distância, velocidade e cronômetro vêm da mesma integração a 120 Hz. Simulação visual: não aprova física (P08), IA, energia ou eliminação.'}));}
 else{b.append(el('div',{className:'card'},el('h3',{textContent:'Estado'}),el('p',{textContent:'EM AVALIAÇÃO — P12 V2 NÃO APROVADO. Substitui como proposta o P12 rejeitado (preservado em archive/). Nada aqui foi integrado ao jogo.'})),
  el('div',{className:'card'},el('h3',{textContent:'Bases aprovadas usadas sem alteração'}),el('p',{textContent:'Geometria P05 (bloco canônico v1 e nove impressões), pintura Sistema B do P06 (resolveLivery com baseline do pipeline), renderizador D do P06, VFX do 04 V2 com calibração aprovada. Competidores extras reutilizam as nove geometrias como instâncias de demonstração.'})),
  el('div',{className:'card'},el('h3',{textContent:'Teclado'}),el('p',{textContent:'Espaço reproduz/pausa · ←/→ quadro (Shift: 1 s) · Home reinicia · 1/2/3 HUD · Q/W/E câmera · V vista · X alterna comparação · F tela cheia · P painel · D diagnóstico · [ ] cenário'})));}
}
const TOGGLE_LABEL={minimap:'Minimapa',radar:'Radar',attackAssist:'Indicadores de janela de ataque',autoHide:'Recolher módulos em cruzeiro',trackMarkers:'Marcadores de frenagem/ápice na pista'};
const SELECT_LABEL={radarMode:'Modo do radar',deltaRef:'Referência do delta',forecastMode:'Escala da previsão'};
const SELECT_NAMES={radarMode:{local:'Local (relativo)',circuit:'Circuito inteiro'},deltaRef:{best:'Melhor volta',last:'Última volta'},forecastMode:{time:'Tempo até chegar',distance:'Distância'}};
function syncUI(){if(HEADLESS)return;const s=LAB.cfg.selection;const mark=(id,v)=>$(id).querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));mark('hudSel',s.view==='single'?(LAB.flip?s.right.hud:s.hud):'');mark('camSel',s.view==='single'?(LAB.flip?s.right.camera:s.camera):'');mark('viewSel',s.view);mark('aspectSel',s.aspect);
 $('scenario').value=LAB.cfg.playback.scenario;$('rate').value=String(LAB.cfg.playback.rate);$('play').textContent=LAB.playing?'Ⅱ':'▶';$('diag').hidden=!LAB.diag;LAB.stageKey='';renderTab();}
function updateLabels(cells){const box=$('labels');box.replaceChildren();if(cells.length<2&&!LAB.flip)return;for(const c of cells){const d=el('div',{className:'cell'});Object.assign(d.style,{left:c.x+'px',top:c.y+'px',width:c.w+'px',height:c.h+'px'});d.append(el('span',{textContent:'HUD '+c.hud+' · '+HUDS[c.hud].name+'  /  CÂM '+c.camera+' · '+CAM_META[c.camera].name}));box.append(d);}}
function timelineSpan(){const st=LAB.rec;return LAB.recDone?(LAB.rec.doneTick/SIM_HZ+4):Math.max(200,raceTime(st)+10);}
function drawTimeline(){const c=$('tlc'),r=c.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);c.width=Math.max(1,r.width*dpr);c.height=Math.max(1,r.height*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);const W=r.width,H=r.height,span=timelineSpan();
 g.fillStyle='#16142380';g.fillRect(0,H*.35,W,H*.3);g.fillStyle='#43f0de30';g.fillRect(0,H*.35,W*clamp(raceTime(LAB.rec)/span,0,1),H*.3);
 const col={lap:'#fff3d6',boostStart:'#43f0de',sideHit:'#ff4794',spinHit:'#ff4794',collision:'#ff4794',barrier:'#ff4794',finish:'#ffa636',shieldCritical:'#ff2a4f',takeoff:'#c06bff'};
 for(const e of LAB.race.events){if(!col[e.type])continue;const mine=e.a===0||((e.type==='sideHit'||e.type==='spinHit'||e.type==='collision')&&e.b===0);if(!mine)continue;if(e.type==='shieldCritical'&&!e.data.on)continue;const x=e.t/span*W;g.fillStyle=col[e.type];const big=e.type==='lap'||e.type==='finish';g.fillRect(x-(big?1:.75),big?H*.1:H*.28,big?2:1.5,big?H*.8:H*.44);}
 for(const s of SCENARIOS){if(s.id==='start')continue;const t=s.find(LAB.race);if(t===null)continue;const x=t/span*W;g.fillStyle='#ffa636';g.beginPath();g.moveTo(x,H*.02);g.lineTo(x+4,H*.02);g.lineTo(x,H*.22);g.lineTo(x-4,H*.02);g.fill();}
 LAB.timelineDirty=false;LAB.tlSpan=span;}
let _tlLast=0;
function updateTransport(){const st=LAB.race.state,t=raceTime(st);if(LAB.timelineDirty||(!LAB.recDone&&perfNow()-_tlLast>500)){_tlLast=perfNow();drawTimeline();}
 const W=$('timeline').clientWidth;$('playhead').style.transform='translateX('+(clamp(t/LAB.tlSpan,0,1)*W).toFixed(1)+'px)';
 const txt=(t<SIM.GO?'LARGADA −'+(SIM.GO-t).toFixed(2):fmtTime(t-SIM.GO,3))+' · '+st.tick;if($('time').textContent!==txt)$('time').textContent=txt;
 const ld=$('loading');const until=Number(ld.dataset.until||0);const msg=perfNow()<until?ld.textContent:LAB.recDone?'':'pré-calculando corrida… '+Math.round(raceTime(LAB.rec))+' s';if(ld.textContent!==msg)ld.textContent=msg;ld.style.display=msg?'block':'none';}
function updateDiag(){if(!LAB.diag||HEADLESS)return;const st=LAB.race.state,R=LAB.rigs;$('diag').textContent=[`${LAB.fps} fps · quadro ${LAB.frameMs.toFixed(1)} ms · ${LAB.layout.length} viewport(s)`,`${RSTAT.draws} draws · ${(RSTAT.tris/1000).toFixed(1)} mil tri · ${RSTAT.ships} naves · ${RSTAT.chunks} blocos de pista`,`VFX ${RSTAT.fx} vértices · buffers nave ${GLR.live} · mundo ${WORLD.live} · fx ${RACE_GL.live}`,`tick ${st.tick} · digest ${stateDigest(st)} · eventos ${eventsUpTo(LAB.race,raceTime(st))}/${LAB.race.events.length}`,`gravado até ${(LAB.race.recordedTick/SIM_HZ).toFixed(1)} s · snapshots ${LAB.race.snapshots.size} · restaurações ${LAB.restores}`,`câm A fov ${R.A.fov.toFixed(1)} · B ${R.B.fov.toFixed(1)} · C ${R.C.fov.toFixed(1)}`].join('\n');}
function simulateContextLoss(){const ext=GLR.gl&&GLR.gl.getExtension('WEBGL_lose_context');if(!ext)return notify('WEBGL_lose_context indisponível.');ext.loseContext();setTimeout(()=>ext.restoreContext(),500);}
function dispose(){if(LAB.disposed)return;LAB.disposed=true;const gl=GLR.gl;if(!gl)return;dropGpuCache(true);for(const b of GLR.podium||[])delBuf(b.buf);worldDispose(gl,false);raceGLDispose(gl,false);if(GLR.prog)gl.deleteProgram(GLR.prog);GLR.prog=null;GLR.ok=false;}
/* ---------------- configuração ---------------- */
function exportJSON(){const c=deepClone(LAB.cfg);c.playback.time=+raceTime(LAB.race.state).toFixed(4);return JSON.stringify(c,null,2);}
function importJSON(text){const next=parseConfigText(text);const raceChanged=JSON.stringify(next.race)!==JSON.stringify(LAB.cfg.race);LAB.cfg=next;LAB.flip=false;if(raceChanged)newRace();seekTime(next.playback.time);syncUI();return true;}
/* ---------------- API (testes e automação) ---------------- */
const API={version:LAB_VERSION,
 config:()=>deepClone(LAB.cfg),exportJSON,importJSON,parse:parseConfigText,defaults:defaultConfig,
 setHud:id=>{oneOf(id,IDS,'hud');LAB.cfg.selection.hud=id;LAB.toggles++;syncUI();},setCamera:id=>{oneOf(id,IDS,'camera');LAB.cfg.selection.camera=id;LAB.toggles++;syncUI();},
 setView:v=>{oneOf(v,VIEW_MODES,'view');LAB.cfg.selection.view=v;syncUI();},setAspect:a=>{oneOf(a,ASPECTS,'aspect');LAB.cfg.selection.aspect=a;syncUI();},
 setHudParam:(id,k,v)=>{const p=HUDS[id].params.find(p=>p.id===k);if(p)LAB.cfg.hud[id][k]=num(v,p.min,p.max,k);else if(k in (HUDS[id].toggles||{}))LAB.cfg.hud[id][k]=bool(v,k);else if(k in (HUDS[id].selects||{}))LAB.cfg.hud[id][k]=oneOf(v,HUDS[id].selects[k],k);else throw Error('parâmetro desconhecido '+k);},
 setCamParam:(id,k,v)=>{const d=camParamDefs(id).find(d=>d.id===k);if(!d)throw Error('parâmetro desconhecido '+k);LAB.cfg.camera[id][k]=num(v,d.min,d.max,k);},
 play:()=>{LAB.playing=true;},pause:()=>{LAB.playing=false;},step:(n=1)=>{for(let i=0;i<n;i++)stepLive();},seek:t=>seekTime(t),seekTick,scenario:id=>gotoScenario(id),scenarioTime,
 tick:()=>LAB.race.state.tick,time:()=>raceTime(LAB.race.state),digest:()=>stateDigest(LAB.race.state),recordAll:()=>{recordUntil(Infinity);return LAB.race.recordedTick;},
 telemetry:()=>telemetry(LAB.race,LAB.race.state,{deltaRef:LAB.cfg.hud.C.deltaRef}),messages:hud=>hudMessages(LAB.race.state.director,hud,raceTime(LAB.race.state)).map(o=>({type:o.m.type,prio:o.m.prio,age:o.age,exit:o.exit,data:o.m.data})),
 cameras:()=>Object.fromEntries(IDS.map(id=>[id,deepClone(camView(LAB.rigs[id]))])),layout:(W,H)=>layoutCells(W,H,LAB.cfg).map(c=>({...c})),
 race:()=>LAB.race,state:()=>LAB.race.state,track:()=>TRACK,sim:SIM,scenarios:SCENARIOS,huds:HUDS,camMeta:CAM_META,camParams:camParamDefs,
 // desenha um HUD num contexto 2D fornecido (Canvas real ou simulado) e devolve métricas de legibilidade
 drawHud:(id,g,W,H,camId)=>{const F=buildFrame(LAB.race,LAB.race.state,renderOpts());const tele=telemetry(LAB.race,LAB.race.state,{deltaRef:LAB.cfg.hud.C.deltaRef});LAB.tele=tele;const cell={x:0,y:0,w:W,h:H},mats=camMatrices(camView(LAB.rigs[camId||LAB.cfg.selection.camera]),W/H),MET=metricsSink();HUDS[id].draw(g,W,H,hudModel(id,cell,mats,F),LAB.cfg.hud[id],MET);return MET;},
 hudWorld:(id,camId)=>{const F=buildFrame(LAB.race,LAB.race.state,renderOpts());LAB.tele=telemetry(LAB.race,LAB.race.state,{deltaRef:LAB.cfg.hud.C.deltaRef});const mats=camMatrices(camView(LAB.rigs[camId||'A']),16/9),a=new VFX.Arena(24000);if(HUDS[id].world)HUDS[id].world(a,hudModel(id,{x:0,y:0,w:1600,h:900},mats,F),LAB.cfg.hud[id]);return Array.from(a.data.subarray(0,a.count*7));},
 shipPalette:id=>shipPalette(LAB.race,id),activeEffects:id=>activeEffects(LAB.race,LAB.race.state,LAB.race.state.ships[id],renderOpts(),id===0),
 geometry:()=>Object.fromEntries(SHIPS.map(s=>[s.id,Object.fromEntries(VARIANT_CODES.map(v=>[v,meshReport(buildMesh(s.id,v,defaultParams()[s.id][v])).fingerprint]))])),
 vfx:VFX,resolveLivery,renderFrame:()=>renderFrame(),
 resources:()=>({ship:GLR.live,world:WORLD.live,fx:RACE_GL.live,restores:LAB.restores,ok:GLR.ok,lost:GLR.lost}),
 // ganchos de teste: contexto WebGL simulado sem DOM, ciclo perda/restauração e passes completos
 glAttach:gl=>{GLR.gl=gl;const ok=glSetup();if(ok){worldInit(gl);raceGLInit(gl);}return ok;},glLose:()=>onLost({preventDefault(){}}),glRestore:()=>onRestored(),
 renderGL:(W,H)=>{const st=LAB.race.state,F=buildFrame(LAB.race,st,renderOpts());LAB.tele=telemetry(LAB.race,st,{deltaRef:LAB.cfg.hud.C.deltaRef});RSTAT.draws=RSTAT.tris=RSTAT.chunks=RSTAT.ships=RSTAT.fx=0;renderGL(layoutCells(W,H,LAB.cfg),W,H,1,st,F);return {...RSTAT};},
 camContexts:(t,seconds)=>{seekTime(Math.max(0,t-seconds));const out=[];const n=Math.round(seconds*SIM_HZ);for(let i=0;i<n;i++){raceStep(LAB.race,LAB.race.state);out.push(camContext(LAB.race,LAB.race.state,playerHits(LAB.race)));}return out;},
 camRun:(id,params,ctxs)=>{const c=camInit();for(const x of ctxs)camUpdate(c,id,params,x,SIM_DT);return deepClone(camView(c));},
 internals:{directorInit,directorTick,hudMessages,HUD_CHANNELS,MSG,SIM_DT,telemetry,layoutCells,camInit,camUpdate,projectPoint,snapshotState,stateDigest},diagnostics:()=>({fps:LAB.fps,frameMs:LAB.frameMs,...RSTAT}),simulateContextLoss,dispose};
if(typeof window!=='undefined')window.__GMINUS_P12V2__=API;
newRace();
if(!HEADLESS){buildChrome();if(glAll()){}syncUI();requestAnimationFrame(loop);}
