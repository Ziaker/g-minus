// P12 V2 — gera prototypes/12_hud_camera_lab_v2.html (HTML autônomo, abre direto do disco).
// Embute SEM ALTERAÇÃO: bloco geométrico do 05, resolvedor de pintura B e renderizador D do 06,
// estado/efeitos VFX do 04 V2 (vfx-atelier). Uso: node prototypes/hud-camera-lab/build.mjs [--check]
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const OUT=path.join(repo,'prototypes/12_hud_camera_lab_v2.html');
const read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const between=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);if(i<0||j<i)throw Error('Marcador canônico ausente: '+a);return s.slice(i,j);};
export function buildLab(){
 const p05=read('prototypes/05_craft_geometry_lab.html'),p06=read('prototypes/06_craft_paint_lab.html');
 const geometry=between(p05,'/* @gminus-approved-craft-geometry:begin v1 */','/* @gminus-approved-craft-geometry:end v1 */')+'/* @gminus-approved-craft-geometry:end v1 */';
 const paint=between(p06,"const SYSTEMS=['A','B','C']",'// cores-base editáveis');
 // mesmo ajuste de ciclo de vida aplicado no 04 V2: shaders liberados após o link (sem efeito visual)
 const renderer=between(p06,"const canvas=document.getElementById('view');",'const D_BG_VITRINE=D_BG.vitrine;')
  .replace('gl.attachShader(pr,sh(gl.VERTEX_SHADER,VERT));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(pr);','const vs=sh(gl.VERTEX_SHADER,VERT),fs=sh(gl.FRAGMENT_SHADER,FRAG);gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.deleteShader(vs);gl.deleteShader(fs);');
 const model=between(p06,'function renderModel(','function drawScene()');
 const vfxState=read('prototypes/vfx-atelier/vfx-state.js'),vfxEffects=read('prototypes/vfx-atelier/vfx-effects.js');
 const vfx=`/* ===== VFX APROVADOS DO 04 V2 — vfx-state.js e vfx-effects.js do atelier, sem alteração, em escopo próprio ===== */
const VFX=(function(){
${vfxState}
${vfxEffects}
return {CATEGORIES,APPROVAL,APPROVED_PARAMS,SPIN_E_MARGIN,DRIFT_AFTERIMAGE_KMH,vfxDefaults,paramDefsVFX,isApprovedCalibration,eventAt,eventParams,simulatedPose,anchorData,sweepData,effectFrame,Arena,ghosts,FXCOL};
})();`;
 const shim=`/* Compatibilidade com o renderizador do 06: passe D padrão (sem foco/isolamento), luz fixa, geometria baseline. */
const state={insp:{focus:'all',focusMode:'highlight',light:'fixed'},params:defaultParams(),liveries:{B:{}}};
Object.freeze(state.params);for(const s of Object.values(state.params)){Object.freeze(s);for(const v of Object.values(s))Object.freeze(v);}`;
 const srcDir=path.join(here,'src'),files=fs.readdirSync(srcDir).filter(f=>/^\d\d-.*\.js$/.test(f)).sort();
 const own=files.map(f=>`/* ===== ${f} ===== */\n`+fs.readFileSync(path.join(srcDir,f),'utf8'));
 // atalhos locais para globais muito usados (mesmo objeto; acelera a execução em contextos vm dos testes)
 const locals='const Math=globalThis.Math,JSON=globalThis.JSON,Float32Array=globalThis.Float32Array,Float64Array=globalThis.Float64Array,Uint16Array=globalThis.Uint16Array,Int16Array=globalThis.Int16Array,Int32Array=globalThis.Int32Array,Object=globalThis.Object,Array=globalThis.Array,Number=globalThis.Number,String=globalThis.String,Map=globalThis.Map,Set=globalThis.Set,Error=globalThis.Error;';
 // configuração aprovada pelo responsável (11/10/2026): fonte de verdade em docs/decisions, embutida sem alteração
 const approved=JSON.parse(read('docs/decisions/2026-10-11-prototype-12-v2-approved-baseline.json'));
 const baseline=`/* ===== CONFIGURAÇÃO APROVADA DO P12 V2 — docs/decisions/2026-10-11-prototype-12-v2-approved-baseline.json ===== */\nconst P12_APPROVED=${JSON.stringify(approved)};`;
 const script=["'use strict';","(function(){",locals,geometry,paint,shim,renderer,model,vfx,baseline,...own,"})();"].join('\n');
 new vm.Script(script);
 const template=fs.readFileSync(path.join(here,'lab.html'),'utf8');
 return template.replace('/* EMBED */',()=>script);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const html=buildLab();
 if(process.argv.includes('--check')){const cur=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8'):'';if(cur!==html){console.error('12_hud_camera_lab_v2.html desatualizado: rode node prototypes/hud-camera-lab/build.mjs');process.exit(1);}console.log('OK: HTML corresponde às fontes ('+Buffer.byteLength(html)+' bytes)');}
 else{fs.writeFileSync(OUT,html);console.log('Gerado '+path.relative(repo,OUT)+': '+Buffer.byteLength(html)+' bytes');}
}
