// P12 V2 — evidências em navegador real (Chromium + WebGL). Não faz parte do `npm test`
// porque exige o pacote playwright-core e um Chromium, que não são dependências do projeto.
// Uso: PLAYWRIGHT_CORE=/caminho/para/playwright-core CHROMIUM=/caminho/chrome node prototypes/hud-camera-lab/capture-evidence.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../..');
const OUT=path.join(repo,'docs/evidence/12_hud_camera_lab_v2');fs.mkdirSync(OUT,{recursive:true});
const pw=await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_CORE||'playwright-core','index.mjs')).href).catch(()=>import('playwright-core'));
const browser=await pw.chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const url=pathToFileURL(path.join(repo,'prototypes/12_hud_camera_lab_v2.html')).href;
const report={date:new Date().toISOString(),url:'prototypes/12_hud_camera_lab_v2.html',shots:[],checks:{}};
async function page(W,H){const p=await browser.newPage({viewport:{width:W,height:H}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.goto(url);await p.waitForFunction(()=>!!window.__GMINUS_P12V2__);await p.evaluate(()=>{const A=window.__GMINUS_P12V2__;A.pause();A.recordAll();});return {p,errors};}
const run=(p,fn,arg)=>p.evaluate(fn,arg);
async function shot(p,name,setup,arg){await run(p,setup,arg);await run(p,()=>window.__GMINUS_P12V2__.renderFrame());await p.waitForTimeout(120);const file=name+'.jpg';await p.screenshot({path:path.join(OUT,file),type:'jpeg',quality:70});report.shots.push(file);}
const setCombo=([hud,cam,view,aspect,scen,dt])=>{const A=window.__GMINUS_P12V2__;A.setView(view);A.setAspect(aspect);A.setHud(hud);A.setCamera(cam);A.seek(A.scenarioTime(scen)+dt);};
// 1) mesmo instante, três HUDs com a mesma câmera; 2) mesma HUD, três câmeras no loop; 3) matriz
{const {p,errors}=await page(1600,900);
 for(const h of ['A','B','C'])await shot(p,`01-mesmo-instante-hud-${h}-cam-A`,setCombo,[h,'A','single','fill','traffic',1.4]);
 for(const c of ['A','B','C'])await shot(p,`02-loop-hud-C-cam-${c}`,setCombo,['C',c,'single','fill','loop',2.6]);
 await shot(p,'03-matriz-3x3-defesa',setCombo,['A','A','matrix','16:9','defense',1.6]);
 await shot(p,'04-tres-huds-camera-B-impulso',setCombo,['A','B','hud3','16:9','highspeed',1.2]);
 const extremes=[['05-largada','start',2.4,'A'],['06-impulso','highspeed',1.3,'A'],['07-energia-critica','lowenergy',1.2,'B'],['08-impacto-barreira','impact',1.35,'C'],['09-salto','jump',1.8,'B'],['10-borda-aberta','edge',1.4,'A'],['11-ataque-iminente','defense',1.95,'B'],['12-disputa-rival','duel',2.2,'C'],['13-volta-final','finallap',2.7,'A'],['14-chegada','finish',6.6,'C']];
 for(const [name,scen,dt,cam] of extremes)for(const h of ['A','B','C'])await shot(p,`${name}-hud-${h}-cam-${cam}`,setCombo,[h,cam,'single','fill',scen,dt]);
 await run(p,()=>document.body.classList.remove('nopanel'));await shot(p,'15-laboratorio-painel',setCombo,['B','B','single','fill','traffic',2]);
 // medições no navegador
 report.checks.webgl=await run(p,()=>{const gl=document.getElementById('view').getContext('webgl');return {version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER)};});
 report.checks.determinism=await run(p,()=>{const A=window.__GMINUS_P12V2__;A.seek(0);A.step(3600);const a=A.digest();A.seek(120);A.seek(30);return {continuous:a,seek:A.digest(),equal:a===A.digest()};});
 report.checks.frameCost=await run(p,()=>{const A=window.__GMINUS_P12V2__;const out={};for(const v of ['single','matrix']){A.setView(v);A.seek(A.scenarioTime('traffic')+1);A.renderFrame();const t0=performance.now();for(let i=0;i<10;i++){A.step(2);A.renderFrame();}out[v]=+((performance.now()-t0)/10).toFixed(1);}A.setView('single');return {msPerFrameSwiftShader:out,note:'SwiftShader rasteriza na CPU; não representa GPU real'};});
 report.checks.hudCost=await run(p,()=>{const A=window.__GMINUS_P12V2__;const c=document.createElement('canvas');c.width=1920;c.height=1080;const g=c.getContext('2d');const out={};for(const h of ['A','B','C']){const t0=performance.now();for(let i=0;i<20;i++)A.drawHud(h,g,1920,1080,'A');out[h]=+((performance.now()-t0)/20).toFixed(2);}return {msPerHud1080p:out};});
 report.checks.resources=await run(p,()=>{const A=window.__GMINUS_P12V2__;A.renderFrame();const before=A.resources();const ids=['A','B','C'],views=['single','split','hud3','cam3','matrix'];for(let i=0;i<120;i++){A.setHud(ids[i%3]);A.setCamera(ids[(i*7)%3]);A.setView(views[i%5]);if(i%6===0)A.renderFrame();}A.setView('single');A.renderFrame();return {before,after:A.resources()};});
 report.checks.jsonInvalid=await run(p,()=>{const A=window.__GMINUS_P12V2__;const before=A.exportJSON();const o=JSON.parse(before);o.camera.A.distance=-100;o.camera.B.fovBase=999;delete o.hud.C;let err='';try{A.importJSON(JSON.stringify(o));}catch(e){err=e.message;}return {rejected:!!err,error:err,unchanged:A.exportJSON()===before};});
 report.checks.contextLoss=await new Promise(async res=>{await run(p,()=>window.__GMINUS_P12V2__.simulateContextLoss());await p.waitForTimeout(1200);res(await run(p,()=>{const A=window.__GMINUS_P12V2__;A.renderFrame();return A.resources();}));});
 // fumaça da interface real: abas, sliders, seletores, teclado e diálogo JSON
 report.checks.uiSmoke=await (async()=>{const steps=[];for(const tab of ['hud','cam','cmp','scene','race','about']){await p.click(`[data-tab=${tab}]`);steps.push('aba '+tab);const r=await p.$$('#tabbody input[type=range]');if(r.length){await r[0].evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});steps.push('slider '+tab);}}
  await p.click('[data-tab=hud]');for(const b of ['#hudSel button[data-v=C]','#camSel button[data-v=B]','#viewSel button[data-v=matrix]','#aspectSel button[data-v="21:9"]','#viewSel button[data-v=single]','#aspectSel button[data-v=fill]'])await p.click(b);
  for(const k of ['1','2','3','q','w','e','v','v','x','x','d','Space','ArrowRight','ArrowLeft','Shift+ArrowRight',']','[','Home','p','p'])await p.keyboard.press(k);
  await p.click('#jsonOpen');const txt=await p.inputValue('#jsonText');await p.click('#jsonImport');const ok=await p.textContent('#jsonNotice');const badCfg=JSON.parse(txt);badCfg.camera.A.distance=-100;badCfg.camera.B.fovBase=999;await p.fill('#jsonText',JSON.stringify(badCfg,null,2));await p.click('#jsonImport');const bad=await p.textContent('#jsonNotice');await p.click('#jsonClose');
  await p.selectOption('#scenario','loop');await p.waitForTimeout(300);return {steps:steps.length,validImport:ok,invalidImport:bad,configAfter:await run(p,()=>window.__GMINUS_P12V2__.config().camera.A.distance)};})();
 report.checks.pageErrors=errors.slice();await p.close();}
// 3b) sliders de tamanho por módulo e espaçamento de texto no máximo de teste (1,4 × e linhas 1,3 ×), sem sobreposição dentro dos módulos
{const {p,errors}=await page(1600,900);
 const big={A:['sizeSpeed','sizePosition','sizeEnergy','sizeMap','sizeAlerts','sizeBanner','sizeCombat'],B:['sizeHead','sizeLadder','sizeGauge','sizeRadar','sizeBrackets','sizeAlerts','sizeCombat'],C:['sizeStrip','sizePos','sizeTiming','sizeCluster','sizeRadar','sizeRival','sizeAlerts']};
 for(const h of ['A','B','C'])await shot(p,`17-tamanhos-e-espacamento-hud-${h}`,([h,keys])=>{const A=window.__GMINUS_P12V2__;for(const k of keys)A.setHudParam(h,k,1.4);A.setHudParam(h,'letterSpacing',.3);A.setHudParam(h,'lineSpacing',1.3);A.setView('single');A.setAspect('fill');A.setHud(h);A.setCamera(h);A.seek(A.scenarioTime('duel')+2.2);},[h,big[h]]);
 // cores por HUD: três paletas prontas diferentes no mesmo instante (C também com fonte monoespaçada e o módulo rival oculto)
 const pal=await run(p,()=>window.__GMINUS_P12V2__.palettes);const roles=await run(p,()=>window.__GMINUS_P12V2__.colorRoles.map(r=>r[0]));
 for(const [h,id,extra] of [['A','okabe',{}],['B','amber',{panelAlpha:1.3}],['C','phosphor',{font:'mono',showRival:false}]])
  await shot(p,`18-cores-hud-${h}-${id}`,([h,c,extra,roles])=>{const A=window.__GMINUS_P12V2__;for(const k of Object.keys(A.config().hud[h]))if(k.startsWith('size'))A.setHudParam(h,k,1);A.setHudParam(h,'letterSpacing',.2);A.setHudParam(h,'lineSpacing',1);roles.forEach((k,i)=>A.setHudParam(h,k,c[i]));for(const [k,v] of Object.entries(extra))A.setHudParam(h,k,v);A.setHud(h);A.setCamera(h);A.seek(A.scenarioTime('duel')+2.2);},[h,pal[id].c,extra,roles]);
 await run(p,()=>document.body.classList.remove('nopanel'));await p.click('[data-tab=hud]');await p.click('#tabbody .seg button:nth-child(2)');
 for(const n of ['Geral','Tamanho dos módulos','Módulos visíveis','Texto'])await p.click(`details.sgrp > summary:has-text("${n}")`);
 await shot(p,'19-painel-cores-hud-B',()=>{const A=window.__GMINUS_P12V2__;A.setHud('B');A.setCamera('B');const d=[...document.querySelectorAll('details.sgrp')].find(x=>x.textContent.includes('Cores e fundos'));if(d)d.scrollIntoView({block:'start'});},null);
 report.checks.pageErrors_sizes=errors;await p.close();}
// 4) proporções: 21:9 e 9:16 (layout retrato) com os três HUDs
for(const [W,H,tag] of [[2560,1080,'21x9'],[1080,1920,'9x16']]){const {p,errors}=await page(W,H);for(const h of ['A','B','C'])await shot(p,`16-${tag}-hud-${h}`,setCombo,[h,h,'single','fill','defense',1.7]);report.checks['pageErrors_'+tag]=errors;await p.close();}
fs.writeFileSync(path.join(OUT,'evidence.json'),JSON.stringify(report,null,2));
console.log('capturas:',report.shots.length,'· erros de página:',report.checks.pageErrors.length);
await browser.close();
