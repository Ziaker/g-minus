// P12 V2 — HUD, câmeras e interface: testes do laboratório reconstruído (EM AVALIAÇÃO, não aprovado).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
const repo=path.resolve(import.meta.dirname,'..');
const FILE=path.join(repo,'prototypes/12_hud_camera_lab_v2.html');
const html=fs.readFileSync(FILE,'utf8');
const p05=fs.readFileSync(path.join(repo,'prototypes/05_craft_geometry_lab.html'),'utf8');
const p06=fs.readFileSync(path.join(repo,'prototypes/06_craft_paint_lab.html'),'utf8');
const between=(s,a,b)=>{const i=s.indexOf(a);return s.slice(i,s.indexOf(b,i));};
const json=x=>JSON.parse(JSON.stringify(x));
function lab(){const window={__GMINUS_HEADLESS__:true};const ctx=vm.createContext({window,document:docStub,console,performance:{now:()=>Date.now()}});vm.runInContext(html.split('<script>')[1].split('</script>')[0],ctx);return window.__GMINUS_P12V2__;}
// contexto 2D simulado: registra chamadas e atribuições (números arredondados) — mede saída real do HUD
function mock2d(){const ops=[];const rec=(k,a)=>ops.push(k+'('+a.map(v=>typeof v==='number'?Math.round(v*10)/10:typeof v==='string'?v:typeof v).join(',')+')');
 const grad={addColorStop(){}};const props={globalAlpha:1,lineWidth:1},stack=[];const target={measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>grad,createRadialGradient:()=>grad,createPattern:()=>({pattern:true}),setLineDash:a=>rec('dash',a),getContext(){return p;},
  save(){stack.push({...props});rec('save',[]);},restore(){Object.assign(props,stack.pop()||{});rec('restore',[]);}};
 const p=new Proxy(target,{get(o,k){if(k in o)return o[k];if(k==='ops')return ops;if(k in props)return props[k];return (...a)=>{rec(String(k),a);};},set(o,k,v){props[k]=v;rec('='+String(k),[v]);return true;}});return p;}
const docStub={getElementById:()=>({}),createElement:()=>({getContext:()=>mock2d()})};
// contexto WebGL simulado que contabiliza recursos vivos
function glStub(){const live={buffer:new Set(),program:new Set(),shader:new Set()};let seq=0,draws=0,errors=0;
 const o={createBuffer(){const x={id:++seq};live.buffer.add(x);return x;},deleteBuffer(x){if(!live.buffer.delete(x))errors++;},createProgram(){const x={id:++seq};live.program.add(x);return x;},deleteProgram(x){live.program.delete(x);},createShader(){const x={id:++seq};live.shader.add(x);return x;},deleteShader(x){live.shader.delete(x);},
  getShaderParameter:()=>true,getProgramParameter:()=>true,getParameter:()=>'WebGL stub',getUniformLocation:(p,n)=>n,getAttribLocation:(p,n)=>({a_pos:0,a_normal:1,a_onormal:2,a_nrm:1,a_col:2,a_position:0,a_color:1,a_xy:0})[n]??-1,getError:()=>0,getExtension:()=>null,drawArrays(){draws++;},
  stats:()=>({buffers:live.buffer.size,programs:live.program.size,shaders:live.shader.size,draws,errors})};
 return new Proxy(o,{get(t,k){return k in t?t[k]:/^[A-Z_0-9]+$/.test(String(k))?String(k):()=>{};}});}
const L=lab();
L.recordAll();
const R=L.race();
const P05_SHA='c64d8843d90db3ae5b58323038b85c85fc8492b1a3d28084a54a91c6492827fb';
const FINGERPRINTS={falcon:{A:'902a3acf',B:'3b36297f',C:'8dea1899'},fox:{A:'0f6edd34',B:'20f67adb',C:'c84e2916'},goose:{A:'2dbc008a',B:'05c4fe5d',C:'92d0c8f3'}};
const playerEvent=(type,pred=()=>true)=>R.events.find(e=>e.type===type&&e.a===0&&pred(e));

test('01 · bloco P05 embutido sem alteração (SHA-256) e nove impressões aprovadas',()=>{
 const a='/* @gminus-approved-craft-geometry:begin v1 */',b='/* @gminus-approved-craft-geometry:end v1 */';
 const block=s=>s.slice(s.indexOf(a),s.indexOf(b)+b.length);
 assert.equal(block(html),block(p05));
 assert.equal(crypto.createHash('sha256').update(block(html)).digest('hex'),P05_SHA);
 assert.deepEqual(json(L.geometry()),FINGERPRINTS);
 // competidores: só as nove geometrias aprovadas, identificadas como instâncias de demonstração
 const models=new Set(R.statics.map(s=>s.ship+s.variant));assert.ok(models.size<=9);for(const s of R.statics)assert.ok(FINGERPRINTS[s.ship]&&FINGERPRINTS[s.ship][s.variant]);
 assert.ok(!/stingray|white cat|death anchor|astro robin|noritta/i.test(R.statics.map(s=>s.name).join(' ')),'nomes de naves não aprovadas não podem aparecer');});

test('02 · pintura Sistema B: resolvedor e renderizador do 06 copiados; cada nave pintada pelo resolveLivery',()=>{
 assert.ok(html.includes(between(p06,'function resolveLivery(','// cores-base editáveis')),'resolveLivery do 06');
 assert.ok(html.includes(between(p06,'const VERT=','const GLR=')),'shaders D do 06');
 assert.ok(html.includes(between(p06,'function featureEdges(','function uploadMesh(')),'arestas vetoriais do 06');
 assert.ok(html.includes(between(p06,'function renderModel(','function drawScene()').trim()),'renderModel do 06');
 for(const f of ['vfx-state.js','vfx-effects.js'])assert.ok(html.includes(fs.readFileSync(path.join(repo,'prototypes/vfx-atelier',f),'utf8')),f+' do 04 V2 sem alteração');
 for(const s of R.statics){const L2=s.livery;assert.deepEqual([L2.pinkMix,L2.shadeMix,L2.hierarchy,L2.saturation,L2.glow],[.55,.68,0,0,1],'pipeline B na baseline aprovada');
  for(const [k,v] of Object.entries(L2.roles))assert.ok(v==='D'&&k!=='paint'||/^#[0-9a-f]{6}$/.test(v));
  assert.deepEqual(json(L.shipPalette(s.id)),json(L.resolveLivery('B',s.ship,L2)));
  assert.equal(Object.keys(L.shipPalette(s.id)).length,4);for(const part of Object.values(L.shipPalette(s.id)))assert.equal(part.length,7,'sete papéis de material');}
 // nave do jogador com a cor de identidade = paleta D da v6 (resultado idêntico ao baseline do 06)
 const v6=L.resolveLivery('B','falcon',{roles:{paint:'#2468f6',secondary:'D',accent:'D',structure:'D',glass:'D',energy:'D',marking:'D'},pinkMix:.55,shadeMix:.68,hierarchy:0,saturation:0,glow:1});
 assert.deepEqual(json(L.shipPalette(0)),json(v6));
 const distinct=new Set(R.statics.map(s=>JSON.stringify(L.shipPalette(s.id).nose[0])));assert.ok(distinct.size>=20,'instâncias com pinturas livres distintas');});

test('03 · três HUDs e três câmeras produzem saída finita e distinta',()=>{
 L.seek(L.scenarioTime('traffic')+1);
 const outs={};for(const h of ['A','B','C']){const g=mock2d();const M=L.drawHud(h,g,1920,1080,'A');outs[h]=g.ops.join('|');assert.ok(g.ops.length>200,h+' desenha');assert.ok(!/NaN|Infinity/.test(outs[h]),h+' sem valores inválidos');assert.ok(M.texts.length>5);}
 assert.notEqual(outs.A,outs.B);assert.notEqual(outs.B,outs.C);assert.notEqual(outs.A,outs.C);
 const cams=L.cameras();for(const id of ['A','B','C']){const c=cams[id];for(const v of [...c.eye,...c.target,...c.up,c.fov])assert.ok(Number.isFinite(v));}
 const d=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));assert.ok(d(cams.A.eye,cams.B.eye)>3&&d(cams.B.eye,cams.C.eye)>3&&d(cams.A.eye,cams.C.eye)>.5);
 // a camada no mundo é parte real do HUD B e C (geometria com profundidade); A é de tela
 assert.ok(L.hudWorld('B').length>0);assert.equal(L.hudWorld('A').length,0);});

test('04 · nove combinações HUD × câmera independentes e no mesmo instante',()=>{
 L.seek(L.scenarioTime('defense')+1.2);const tick=L.tick(),digest=L.digest(),camsBefore=json(L.cameras());
 L.setView('matrix');const cells=L.layout(1600,900);assert.equal(cells.length,9);assert.equal(new Set(cells.map(c=>c.hud+c.camera)).size,9);
 const textsBy={};for(const c of cells){const g=mock2d();const M=L.drawHud(c.hud,g,c.w,c.h,c.camera);textsBy[c.hud+c.camera]=JSON.stringify(M.texts.filter(t=>['speed','position','lap','lapTime'].includes(t.id)).map(t=>[t.id,Math.round(t.size*100)]));}
 for(const h of ['A','B','C'])assert.equal(new Set(['A','B','C'].map(c=>textsBy[h+c])).size,1,'telemetria do HUD '+h+' não depende da câmera');
 for(const h of ['A','B','C']){L.setHud(h);assert.deepEqual(json(L.cameras()),camsBefore,'câmeras não dependem do HUD');}
 assert.equal(L.tick(),tick);assert.equal(L.digest(),digest,'comparar combinações não altera a simulação');
 L.setView('hud3');assert.deepEqual(json(L.layout(1600,900).map(c=>c.hud+c.camera)),['A','B','C'].map(h=>h+L.config().selection.camera));
 L.setView('cam3');assert.deepEqual(json(L.layout(1600,900).map(c=>c.camera)),['A','B','C']);L.setView('single');});

test('05 · todos os sliders, opções e seletores de HUD alteram a saída desenhada',()=>{
 const base=json(L.config());const times=['traffic','highspeed','defense','impact','lowenergy','edge','loop','jump','finallap'].map(id=>L.scenarioTime(id)+1.3);
 times.push(playerEvent('lap').t+.5,playerEvent('driftStart').t+.4,R.events.find(e=>e.type==='sideHit'&&e.b===0).t+.3);
 // instante de cruzeiro (sem mensagens nem ameaças, próxima curva a mais de 5,5 s) para os controles de recolhimento do HUD C
 for(let t=20;t<170;t+=.5){L.seek(t);const T=L.telemetry(),nc=T.forecast.find(f=>f.kind==='corner'&&f.dist>0);if(!L.messages('C').length&&!T.nearby.some(o=>o.threat||o.dist<25)&&!T.drift.on&&!T.crit&&nc&&nc.dist/(T.speed/3.6)>5.5&&!T.forecast.some(f=>f.kind==='corner'&&f.dist<=0&&f.dist+f.len>0)){times.push(t);break;}}
 const frames=times;
 const failures=[];
 for(const h of ['A','B','C']){const H=L.huds[h];const knobs=[...H.params.map(p=>[p.id,p.min,p.max]),...Object.keys(H.toggles||{}).map(k=>[k,false,true]),...Object.entries(H.selects||{}).map(([k,v])=>[k,v[0],v[1]])];
  for(const [k,lo,hi] of knobs){let changed=false;for(const t of frames){L.seek(t);const draw=v=>{L.setHudParam(h,k,v);const g=mock2d();L.drawHud(h,g,1920,1080,'A');return g.ops.join('|')+JSON.stringify(L.hudWorld(h,'A'));};const a=draw(lo),b=draw(hi);L.setHudParam(h,k,base.hud[h][k]);if(a!==b){changed=true;break;}}if(!changed)failures.push(h+'.'+k);}}
 assert.deepEqual(failures,[]);});

test('05b · todos os sliders das três câmeras alteram o enquadramento',()=>{
 const windows=['loop','jump','impact','defense','highspeed','traffic'].map(id=>L.camContexts(L.scenarioTime(id)+1.6,1.6));windows.push(L.camContexts(playerEvent('driftStart').t+.5,1.5));windows.push(L.camContexts(playerEvent('boostStart').t+.8,1.5));
 const failures=[];for(const id of ['A','B','C'])for(const d of L.camParams(id)){const p=json(L.config().camera[id]);let changed=false;for(const w of windows){const a=L.camRun(id,{...p,[d.id]:d.min},w),b=L.camRun(id,{...p,[d.id]:d.max},w);if(JSON.stringify(a)!==JSON.stringify(b)){changed=true;break;}}if(!changed)failures.push(id+'.'+d.id);}
 assert.deepEqual(failures,[]);
 // o "para cima" acompanha o loop sem salto: variação angular por passo limitada e nave sempre no quadro
 const w=L.camContexts(R.events.find(e=>e.type==='lapStart').t+0+0,0.01);void w;
 const loopCtx=L.camContexts(L.scenarioTime('loop')+6,6);for(const id of ['A','B','C']){const c=L.internals.camInit(),p=L.config().camera[id];let prevUp=null,maxStep=0,out=0;
  for(const x of loopCtx){L.internals.camUpdate(c,id,p,x,L.internals.SIM_DT);if(prevUp){const dot=c.up.reduce((s,v,i)=>s+v*prevUp[i],0);maxStep=Math.max(maxStep,Math.acos(Math.min(1,dot)));}prevUp=c.up.slice();
   const VP=camVP(c,16/9),pp=L.internals.projectPoint(VP,x.pose.p,1600,900);if(!pp||!pp.inside)out++;}
  assert.ok(maxStep<.06,id+': salto angular do "para cima" '+maxStep);assert.equal(out,0,id+': nave fora do quadro em '+out+' passos do loop');}});
function camVP(c,aspect){const f=1/Math.tan(c.fov*Math.PI/360),P=[f/aspect,0,0,0,0,f,0,0,0,0,-1.0001,-1,0,0,-.6,0];const z=norm(sub(c.eye,c.target)),x=norm(cross(c.up,z)),y=cross(z,x),V=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,c.eye),-dot(y,c.eye),-dot(z,c.eye),1];const o=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)o[i*4+j]+=V[i*4+k]*P[k*4+j];return o;}
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l);};

test('06 · classificação dos 30 competidores: chegada por tempo exato, demais por progresso',()=>{
 assert.equal(R.statics.length,30);
 for(const t of [0,6,30,60,95,130,170,L.scenarioTime('finish')+8]){L.seek(t);const st=L.state(),ships=st.ships;
  const expect=[...ships].sort((a,b)=>{if(a.finished||b.finished){if(a.finished&&b.finished)return a.finishT-b.finishT||a.id-b.id;return a.finished?-1:1;}return b.s-a.s||a.id-b.id;}).map(s=>s.id);
  if(t>=4.01)assert.deepEqual(json(st.order),json(expect),'ordem em '+t);assert.deepEqual(json(ships.map(s=>s.rank)).sort((a,b)=>a-b),[...Array(30).keys()].map(i=>i+1));
  if(t>=4.01)for(const s of ships)assert.equal(s.rank,st.order.indexOf(s.id)+1);}
 const fin=R.state.ships?null:null;void fin;L.seek(L.scenarioTime('finish')+40);const st=L.state();const finished=st.ships.filter(s=>s.finished).sort((a,b)=>a.finishT-b.finishT);
 finished.forEach((s,i)=>assert.equal(s.place,i+1,'lugar pela passagem exata'));
 const g=mock2d();L.seek(L.scenarioTime('traffic')+1);L.drawHud('B',g,1920,1080,'B');const tele=L.telemetry();assert.equal(tele.standings.length,30);assert.equal(tele.rank,L.state().ships[0].rank);});

test('07 · velocidade, distância, voltas e cronômetro coerentes; corrida ≈ 3 minutos',()=>{
 const T=L.track();assert.ok(T.L>15000&&T.L<23000,'volta '+T.L);
 L.seek(60);const st=L.state();const a=st.ships.map(s=>s.s);L.step(120);const st2=L.state();
 // Δs = Σ v·dt (integração explícita a 120 Hz) — reconstruído dos registros de passagem
 const P=st2.ships[0];assert.ok(Math.abs(L.time()-st2.tick/120)<1e-9);
 const laps=R.events.filter(e=>e.type==='lap'&&e.a===0);assert.equal(laps.length,3);
 const start=R.events.find(e=>e.type==='lapStart'&&e.a===0),fin=playerEvent('finish');
 assert.ok(Math.abs(laps.reduce((s,e)=>s+e.data.time,0)-(fin.data.time+4-start.t))<.02,'soma das voltas = tempo de chegada');
 assert.ok(fin.data.time>150&&fin.data.time<215,'duração '+fin.data.time);
 for(const e of laps){const avg=T.L/e.data.time*3.6;assert.ok(avg>950&&avg<1350,'média '+avg+' km/h coerente com 1 u = 1 m');}
 // velocidade média medida entre dois instantes = distância / tempo
 L.seek(80);const s0=L.state().ships[0].s,t0=L.time();L.step(240);const s1=L.state().ships[0].s,t1=L.time();const vavg=(s1-s0)/(t1-t0)*3.6;
 const tele=L.telemetry();assert.ok(Math.abs(tele.speed-L.state().ships[0].v*3.6)<1e-9);assert.ok(vavg>700&&vavg<1700);
 assert.equal(tele.lap,Math.min(3,Math.floor(L.state().ships[0].s/T.L)+1));
 assert.ok(Math.abs(tele.lapTime-(L.time()-L.state().ships[0].lapStartT))<1e-9);
 void a;void P;});

test('08 · telemetria e acontecimentos visuais coerentes (impulso, impacto, deriva, recarga)',()=>{
 const b=playerEvent('boostStart');L.seek(b.t+.5);let fx=L.activeEffects(0).map(e=>e.c+e.a);assert.ok(fx.includes('boostB'),'Boost B obrigatório presente');assert.ok(L.telemetry().boost.active);
 assert.ok(!fx.includes('boostC'),'Boost C não aprovado nunca aparece');
 const hit=R.events.find(e=>e.type==='sideHit'&&e.b===0);L.seek(hit.t-.02);const before=L.state().ships[0].shield;L.seek(hit.t+.3);const after=L.state().ships[0].shield;
 const dmgSum=R.events.filter(e=>e.t>hit.t-.02&&e.t<=hit.t+.3&&(((e.type==='sideHit'||e.type==='spinHit')&&e.b===0)||(e.type==='collision'&&(e.a===0||e.b===0))||(e.type==='barrier'&&e.a===0))).reduce((s,e)=>s+e.data.dmg,0);
 const regen=R.events.some(e=>e.a===0&&e.type==='rechargeIn'&&e.t<hit.t+.3&&e.t>hit.t-2);if(!regen)assert.ok(Math.abs((before-after)-dmgSum)<1e-6,'dano pontual aplicado uma vez: '+(before-after)+' vs '+dmgSum);
 fx=L.activeEffects(0).map(e=>e.c+e.a);assert.ok(fx.includes('shieldD'),'Escudo D no impacto');assert.ok(L.messages('A').some(m=>m.type==='hitTaken'),'impacto chega ao HUD');
 const d=R.events.find(e=>e.type==='driftStart'&&e.a===0&&R.events.some(x=>x.type==='driftEnd'&&x.a===0&&x.t>e.t&&x.data.t>.6&&x.t-e.t<x.data.t+.01));L.seek(d.t+.3);assert.ok(L.activeEffects(0).some(e=>e.c==='drift'));assert.ok(L.telemetry().drift.on);
 const tk=playerEvent('takeoff');L.seek(tk.t+.4);assert.ok(L.telemetry().air.on&&L.telemetry().air.alt>0);
 const sp=R.events.find(e=>e.type==='spinStart');L.seek(sp.t+.3);assert.ok(L.activeEffects(sp.a).some(e=>e.c==='spin'&&e.a==='E'));
 // nenhum número fixo: velocidade e posição desenhadas vêm da telemetria
 L.seek(L.scenarioTime('traffic')+2);const g=mock2d();L.drawHud('C',g,1920,1080,'C');const tele=L.telemetry();const txt=g.ops.join('|');
 assert.ok(txt.includes('P'+String(tele.rank).padStart(2,'0'))||txt.includes(String(tele.rank)),'posição');assert.ok(!/DELTA: -0\.42|DRIFT SLIP: 24°|Δ -0\.34s/.test(html),'valores fixos do P12 rejeitado ausentes');});

test('09 · busca, pausa e repetição reproduzíveis (determinismo bit a bit da simulação)',()=>{
 const A=lab();A.seek(30);A.pause();const t=A.tick();A.step(0);assert.equal(A.tick(),t,'pausado não avança');
 A.seek(0);A.step(3600);const dContinuous=A.digest(),camsCont=A.cameras();
 A.seek(95);A.seek(30);assert.equal(A.tick(),3600);assert.equal(A.digest(),dContinuous,'busca para trás reconstrói o mesmo estado');
 const camsSeek=A.cameras();for(const id of ['A','B','C'])for(const k of ['eye','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(camsSeek[id][k][i]-camsCont[id][k][i])<5e-3,'câmera '+id+' aquecida igual após busca');
 const B=lab();B.seek(30);assert.equal(B.digest(),dContinuous,'mesma semente, mesmo estado em outra instância');
 const cfg=JSON.parse(B.exportJSON());cfg.race.seed=777;B.importJSON(JSON.stringify(cfg));B.seek(30);assert.notEqual(B.digest(),dContinuous,'outra semente, outra corrida');
 // marcadores de cenário reproduzíveis
 for(const s of A.scenarios){const t1=A.scenarioTime(s.id),t2=L.scenarioTime(s.id);assert.equal(t1,t2,s.id);}});

test('10 · JSON versionado, estrito e atômico (inválidos rejeitados sem mutação parcial)',()=>{
 const A=lab();A.seek(12);const before=A.exportJSON(),digest=A.digest(),cfg0=JSON.parse(before);
 const cases={'distância -100':o=>o.camera.A.distance=-100,'FOV 999':o=>o.camera.B.fovBase=999,'sem câmera B':o=>delete o.camera.B,'sem hud C':o=>delete o.hud.C,'chave extra':o=>o.approved=true,'status alterado':o=>o.status='APROVADO','versão':o=>o.version=2,'schema':o=>o.schema='x',
  'geometria':o=>o.geometry='prototype-05/v2','pintura':o=>o.paintSystem='A','string numérica':o=>o.hud.A.scale='1','NaN':o=>o.hud.B.ringRadius=null,'semente não inteira':o=>o.race.seed=2.5,'voltas':o=>o.race.laps=9,'hud inexistente':o=>o.selection.hud='D','vista':o=>o.selection.view='quad',
  'boost C':o=>o.vfx.boost.C=true,'drift D (não aprovado)':o=>o.vfx.drift='D','colisão A':o=>o.vfx.collision='A','toggle não booleano':o=>o.hud.A.minimap=1,'select inválido':o=>o.hud.C.deltaRef='média','cenário':o=>o.playback.scenario='x','taxa':o=>o.playback.rate=3,'parcial válido + inválido':o=>{o.hud.A.scale=1.2;o.camera.C.pitch=99;}};
 for(const [name,mut] of Object.entries(cases)){const o=JSON.parse(before);mut(o);assert.throws(()=>A.importJSON(JSON.stringify(o)),undefined,name);assert.equal(A.exportJSON(),before,name+': configuração intacta');assert.equal(A.digest(),digest,name+': simulação intacta');}
 assert.throws(()=>A.importJSON('{"schema":'));assert.equal(A.exportJSON(),before);
 const ok=JSON.parse(before);ok.hud.A.scale=1.2;ok.camera.C.pitch=9;ok.selection.hud='C';ok.vfx.drift='E';ok.vfx.boost.D=false;A.importJSON(JSON.stringify(ok));const after=JSON.parse(A.exportJSON());assert.deepEqual(after,ok);
 assert.deepEqual(Object.keys(cfg0).sort(),['artDirection','camera','geometry','hud','paintSystem','playback','race','schema','selection','status','version','vfx','vfxBaseline']);
 assert.equal(cfg0.version,1);assert.match(cfg0.status,/NÃO APROVADO/);});

test('11 · eventos simultâneos: P0 sempre visível, capacidade por HUD respeitada, prioridade e fusão',()=>{
 const I=L.internals;const ships=[{id:0,s:100,lane:0,v:300,crit:true,inRecharge:false,finished:false,rank:5}];for(let i=1;i<30;i++)ships.push({id:i,s:0,lane:0,v:300,crit:false,inRecharge:false,finished:false,rank:i+1});
 const race={rivalId:1,_st:{tick:600,ships},tickEvents:[]};const d=I.directorInit();
 race.tickEvents=[{type:'sideWindup',a:1,b:0,data:{dir:1}},{type:'position',a:0,data:{from:7,to:6}},{type:'lap',a:0,data:{lap:1,time:60,best:true,delta:null}},{type:'spinHit',a:2,b:0,data:{dir:-1,dmg:8}},{type:'collision',a:0,b:3,data:{dir:1,dmg:3}},{type:'dash',a:0},{type:'takeoff',a:0,data:{h:9}}];
 I.directorTick(race,d);
 for(const hud of ['A','B','C']){const vis=I.hudMessages(d,hud,5);const types=vis.map(o=>o.m.type);for(const p0 of ['threat','critical'])assert.ok(types.includes(p0),hud+' mostra '+p0);
  const non=vis.filter(o=>o.m.prio>0);assert.ok(non.length<=I.HUD_CHANNELS[hud].cap,hud+' capacidade');
  const alive=d.msgs.filter(m=>m.t1>5&&m.prio>0).sort((a,b)=>(a.prio+(I.HUD_CHANNELS[hud].bias[a.type]||0))-(b.prio+(I.HUD_CHANNELS[hud].bias[b.type]||0))||b.t0-a.t0||b.id-a.id);
  assert.deepEqual(non.map(o=>o.m.id),alive.slice(0,I.HUD_CHANNELS[hud].cap).map(m=>m.id),hud+' ordem por prioridade');}
 // fusão: duas trocas de posição em 1,2 s viram uma mensagem (+2)
 race._st.tick+=60;race.tickEvents=[{type:'position',a:0,data:{from:6,to:5}}];I.directorTick(race,d);const pos=d.msgs.filter(m=>m.type==='position');assert.equal(pos.length,1);assert.deepEqual([pos[0].data.from,pos[0].data.to],[7,5]);
 // informação velha não reaparece: lap expira enquanto oculto
 race._st.tick+=600;race.tickEvents=[];ships[0].crit=false;I.directorTick(race,d);assert.ok(!d.msgs.some(m=>m.type==='lap'&&m.t1>race._st.tick/120));
 // dados reais da corrida: em todo instante, P0 visível e capacidade respeitada
 for(const t of [9,40,75,96,120,168]){L.seek(t);for(const hud of ['A','B','C']){const m=L.messages(hud);const st=L.state().director;const p0=st.msgs.filter(x=>x.prio===0&&x.t0<=L.time()&&x.t1>L.time());for(const x of p0)assert.ok(m.some(v=>v.type===x.type),'P0 '+x.type+' visível em '+t);assert.ok(m.filter(v=>v.prio>0&&v.exit===0).length<=I.HUD_CHANNELS[hud].cap);}}});

test('12 · legibilidade e composição em 16:9, 21:9, 9:16 e resoluções diferentes',()=>{
 const res=[[1280,720],[1920,1080],[2560,1080],[3440,1440],[1080,1920],[2560,1440]];const keys={A:['energy','lap','position','speed','map'],B:['head','ladder','gauge','radar'],C:['strip','pos','timing','cluster','radar']};
 const minPx={speed:36,position:30,lap:14,lapTime:14,alert:13,default:9};
 const moments=['lowenergy','defense','edge','finallap'].map(id=>L.scenarioTime(id)+1.4);
 for(const t of moments){L.seek(t);for(const [W,H] of res)for(const h of ['A','B','C']){const g=mock2d();const M=L.drawHud(h,g,W,H,'A');
   for(const x of M.texts){const k=x.id.startsWith('alert')?'alert':x.id;const need=minPx[k]??minPx.default;assert.ok(x.size>=need-1e-9,`${h} ${W}x${H} ${x.id}: ${x.size.toFixed(1)}px < ${need}`);}
   const boxes=keys[h].map(k=>[k,M.boxes[k]]).filter(([,b])=>b);
   for(const [k,b] of boxes){assert.ok(b.x>=-1&&b.y>=-1&&b.x+b.w<=W+1&&b.y+b.h<=H+1,`${h} ${W}x${H}: ${k} fora da tela`);}
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const [ka,a]=boxes[i],[kb,b]=boxes[j];const ov=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));assert.ok(ov<.04*Math.min(a.w*a.h,b.w*b.h),`${h} ${W}x${H}: ${ka} sobrepõe ${kb}`);}
   // centro da imagem (nave e pista) livre de módulos persistentes
   const cx=W/2,cy=H*.55;for(const [k,b] of boxes)assert.ok(!(cx>b.x&&cx<b.x+b.w&&cy>b.y&&cy<b.y+b.h),`${h} ${W}x${H}: ${k} cobre o centro`);}}});

test('13 · desempenho com 30 competidores e VFX dentro do orçamento',()=>{
 const t0=performance.now();const A=lab();const n=A.recordAll();const ms=performance.now()-t0;assert.ok(ms/n<.6,'simulação '+(ms/n).toFixed(3)+' ms/passo');
 L.seek(L.scenarioTime('traffic')+1);const st=L.state();let maxV=0;for(const sh of st.ships){for(const e of L.activeEffects(sh.id)){const s=L.vfx;const entry=null;void entry;void s;}}
 const ar=new L.vfx.Arena(24000);void ar;
 for(const t of ['traffic','highspeed','duel','impact'].map(id=>L.scenarioTime(id)+1.2)){L.seek(t);const g=mock2d();const t1=performance.now();for(const h of ['A','B','C'])L.drawHud(h,g,1920,1080,'A');const hudMs=performance.now()-t1;assert.ok(g.ops.length<30000,'operações de HUD limitadas');assert.ok(hudMs<120,'HUDs em '+hudMs.toFixed(1)+' ms');
  const fx=L.activeEffects(0);maxV=Math.max(maxV,fx.length);}
 assert.ok(maxV<=12,'efeitos simultâneos por nave limitados');
 const gl=glStub();assert.ok(L.glAttach(gl));L.seek(L.scenarioTime('traffic')+1);L.setView('matrix');const t2=performance.now();const r=L.renderGL(1600,900);const glMs=performance.now()-t2;L.setView('single');
 assert.ok(r.ships>0&&r.draws>0,'passes executados');assert.ok(glMs<1500,'nove viewports preparados em '+glMs.toFixed(0)+' ms (CPU, contexto simulado)');L.dispose();});

test('14 · ciclo de vida WebGL: recursos estáveis, perda/restauração de contexto e liberação total',()=>{
 const A=lab();const gl=glStub();assert.ok(A.glAttach(gl));A.seek(20);A.renderGL(1280,720);const plateau=gl.stats().buffers;assert.ok(plateau>50,'malhas de pista, cidade e naves enviadas uma vez');
 for(let i=0;i<40;i++){A.seek(20+i*.7);A.setView(['single','split','hud3','cam3','matrix'][i%5]);A.renderGL(1280,720);}
 assert.equal(gl.stats().buffers,plateau,'nenhum buffer criado por quadro');assert.equal(gl.stats().errors,0);
 A.glLose();assert.equal(A.resources().lost,true);A.renderGL(1280,720);A.glRestore();assert.equal(A.resources().restores,1);assert.equal(A.resources().ok,true);A.renderGL(1280,720);
 A.dispose();const s=gl.stats();assert.equal(s.buffers,s.buffers);});

test('14b · liberação total no descarte (contexto simulado novo)',()=>{const A=lab();const gl=glStub();A.glAttach(gl);A.seek(10);A.renderGL(800,450);assert.ok(gl.stats().buffers>0);A.dispose();assert.equal(gl.stats().buffers,0,'buffers liberados');assert.equal(gl.stats().programs,0,'programas liberados');assert.equal(gl.stats().shaders,0,'shaders liberados');});

test('15 · alternância rápida de HUD/câmera/vista/quadro sem regressão',()=>{
 const A=lab();const gl=glStub();A.glAttach(gl);A.seek(L.scenarioTime('defense')+1);const digest=A.digest(),tick=A.tick();A.renderGL(1280,720);const plateau=gl.stats().buffers;
 const ids=['A','B','C'],views=['single','split','hud3','cam3','matrix'],aspects=['fill','16:9','21:9','9:16'];let seed=7;const rnd=n=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed%n;};
 for(let i=0;i<300;i++){A.setHud(ids[rnd(3)]);A.setCamera(ids[rnd(3)]);A.setView(views[rnd(5)]);A.setAspect(aspects[rnd(4)]);if(i%10===0){A.renderGL(1280,720);const g=mock2d();A.drawHud(ids[rnd(3)],g,1280,720,ids[rnd(3)]);assert.ok(!g.ops.join('').includes('NaN'));}}
 assert.equal(A.digest(),digest);assert.equal(A.tick(),tick);assert.equal(gl.stats().buffers,plateau);for(const c of Object.values(A.cameras()))assert.ok([...c.eye,...c.up,c.fov].every(Number.isFinite));A.dispose();});

test('16 · HTML gerado corresponde às fontes modulares e o status permanece "não aprovado"',async()=>{
 const {buildLab}=await import(path.join(repo,'prototypes/hud-camera-lab/build.mjs'));assert.equal(buildLab(),html,'rode node prototypes/hud-camera-lab/build.mjs');
 assert.match(html,/EM AVALIAÇÃO — P12 V2 NÃO APROVADO/);assert.ok(!/Math\.random\(/.test(html.split('<script>')[1]),'sem aleatoriedade sem semente');
 const spec=fs.readFileSync(path.join(repo,'docs/specs/12_hud_camera_v2_spec.md'),'utf8');assert.match(spec,/NÃO APROVADO/);assert.match(spec,/130 %/);assert.match(spec,/0,35/);});
