// Regressões do Protótipo 06 — pintura e personalização das naves.
// O WebGL aqui é um MOCK que só conta buffers/draw calls: não valida aparência (a validação visual é feita em navegador real).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const LAB = 'prototypes/06_craft_paint_lab.html';
const html = readFileSync(path.join(root, LAB), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const plain = o => JSON.parse(JSON.stringify(o));

class El {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase(); this.id = id; this.children = []; this.listeners = {}; this.attrs = {};
    this.style = {}; this.dataset = {}; this.value = ''; this.textContent = ''; this.innerHTML = ''; this.hidden = false; this.open = true;
    this.clientWidth = 1200; this.clientHeight = 800; this.ctx = null; this.offsetTop = 0;
    const cls = new Set();
    this.classList = { add: c => cls.add(c), remove: c => cls.delete(c), contains: c => cls.has(c),
      toggle: (c, on) => { const v = on === undefined ? !cls.has(c) : !!on; v ? cls.add(c) : cls.delete(c); return v; } };
  }
  addEventListener(k, fn) { (this.listeners[k] ??= []).push(fn); }
  emit(k, e = {}) { for (const fn of this.listeners[k] ?? []) fn({ target: this, preventDefault() {}, ...e }); }
  setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return this.attrs[k] ?? null; }
  append(...c) { this.children.push(...c); } appendChild(c) { this.children.push(c); return c; } replaceChildren(...c) { this.children = c; }
  remove() {} focus() {} select() {} click() { this.emit('click'); } setPointerCapture() {}
  getContext() { return this.ctx; }
}
function mockGL() {
  const counts = { created: 0, deleted: 0, draws: 0 };
  return new Proxy({}, { get: (_, k) => {
    if (k === '__counts') return counts;
    if (typeof k === 'string' && /^[A-Z][A-Z0-9_]+$/.test(k)) return k;
    if (k === 'createBuffer') return () => { counts.created++; return {}; };
    if (k === 'deleteBuffer') return () => { counts.deleted++; };
    if (k === 'drawArrays') return () => { counts.draws++; };
    if (k === 'getShaderParameter' || k === 'getProgramParameter') return () => true;
    if (k === 'getAttribLocation') return () => 0;
    if (k === 'getParameter') return () => 'MockGL (sem rasterização)';
    return () => ({});
  } });
}
function boot({ webgl = true } = {}) {
  const els = new Map(), gl = webgl ? mockGL() : null;
  const document = {
    getElementById: id => { if (!els.has(id)) { const e = new El(id === 'view' ? 'canvas' : 'div', id); if (id === 'view') e.ctx = gl; els.set(id, e); } return els.get(id); },
    createElement: t => new El(t), body: new El('body'), execCommand: () => false
  };
  const window = { devicePixelRatio: 1, addEventListener() {} };
  const ctx = vm.createContext({ document, window, console, navigator: {}, performance: { now: () => 1000 }, setTimeout: () => 0, clearTimeout: () => {},
    requestAnimationFrame: () => 0, Blob: class {}, URL: { createObjectURL: () => '', revokeObjectURL: () => {} } });
  vm.runInContext(script, ctx, { filename: LAB });
  return { api: window.__GMINUS_PAINT_LAB__, gl, els };
}
const lab = boot();
const { api } = lab;
const SYSTEMS = plain(api.systems()), SHIPS = plain(api.ships()), PARTS = plain(api.parts());
const APPROVED = { falcon: { A: '902a3acf', B: '3b36297f', C: '8dea1899' }, fox: { A: '0f6edd34', B: '20f67adb', C: 'c84e2916' }, goose: { A: '2dbc008a', B: '05c4fe5d', C: '92d0c8f3' } };
const IDENTITY = { falcon: '#2468f6', fox: '#f8c32c', goose: '#218e54' };
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const mix = (a, b, t) => a.map((v, i) => v * (1 - t) + b[i] * t);
const near = (a, b, eps = 1e-9) => a.every((v, i) => Math.abs(v - b[i]) < eps);
const lum = c => { const f = v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const ROLE_IDX = { paint: 0, secondary: 1, accent: 2, structure: 3, glass: 4, energy: 5, marking: 6 };

test('usa as nove geometrias aprovadas do Protótipo 05 sem alteração e sem parâmetros geométricos expostos', () => {
  const geo = plain(api.geometryParams());
  for (const s of SHIPS) for (const v of ['A', 'B', 'C']) {
    assert.equal(api.meshReport(api.buildMesh(s, v, geo[s][v])).fingerprint, APPROVED[s][v], `${s}${v}`);
  }
  const cfg = api.exportConfig();
  assert.equal(cfg.geometryBaseline, 'prototype05-v1');
  assert.ok(!('params' in cfg), 'o JSON não deve carregar parâmetros geométricos');
  assert.throws(() => api.importJSON(JSON.stringify({ ...cfg, geometryBaseline: 'custom' })), /geometryBaseline/);
});

test('três sistemas; nos padrões, A e B reproduzem exatamente a paleta D da v6 em todos os grupos', () => {
  assert.deepEqual(SYSTEMS, ['A', 'B', 'C']);
  const D = { accent: [.44, .98, .96], structure: [.052, .031, .11], glass: [.13, .06, .17], energy: [1, .78, .35], marking: [1, .95, .78] };
  for (const sys of ['A', 'B']) for (const s of SHIPS) {
    const t = api.resolveLivery(sys, s, api.defaultLivery(sys, s)), id = hexRgb(IDENTITY[s]);
    for (const p of PARTS) {
      assert.ok(near(t[p][0], mix(id, [.96, .37, .68], .55)), `${sys}/${s}/${p} pintura`);
      assert.ok(near(t[p][1], mix(id, [.06, .032, .13], .68)), `${sys}/${s}/${p} secundária`);
      for (const k of Object.keys(D)) assert.ok(near(t[p][ROLE_IDX[k]], D[k]), `${sys}/${s}/${p} ${k}`);
    }
  }
});

test('A: a cor de um grupo altera somente pintura e secundária desse grupo', () => {
  api.resetAll(); api.selectSystem('A');
  const before = plain(api.resolveLivery('A', 'falcon'));
  api.setColor('group', 'wings', '#ff8800');
  const after = plain(api.resolveLivery('A', 'falcon'));
  for (const p of PARTS) for (let r = 0; r < 7; r++) {
    const changed = !near(before[p][r], after[p][r]);
    assert.equal(changed, p === 'wings' && r < 2, `${p}/${r}`);
  }
});

test('B: a cor de um papel altera esse papel em todos os grupos; a hierarquia escurece secundária/estrutura/vidro', () => {
  api.resetAll(); api.selectSystem('B');
  api.setColor('role', 'accent', '#00ff66');
  const t = plain(api.resolveLivery('B', 'falcon'));
  for (const p of PARTS) assert.ok(near(t[p][2], hexRgb('#00ff66')));
  api.setColor('role', 'structure', '#f0f0f0'); api.setColor('role', 'secondary', '#ffffff');
  api.setLiveryValue('hierarchy', 1);
  const h = plain(api.resolveLivery('B', 'falcon'));
  for (const p of PARTS) {
    assert.ok(lum(h[p][1]) <= lum(h[p][0]) * .65 + 1e-6, 'secundária acima do limite');
    assert.ok(lum(h[p][3]) <= lum(h[p][0]) * .4 + 1e-6, 'estrutura acima do limite');
  }
});

test('C: a mesma semente e os mesmos controles reproduzem o mesmo resultado; sementes diferentes variam', () => {
  for (const s of SHIPS) {
    const L = plain(api.defaultLivery('C', s));
    for (const seed of [1, 42, 999999]) {
      L.seed = seed;
      assert.deepEqual(plain(api.resolveLivery('C', s, L)), plain(api.resolveLivery('C', s, plain(L))), `${s} semente ${seed}`);
    }
    const a = plain(api.resolveLivery('C', s, { ...L, seed: 11 })), b = plain(api.resolveLivery('C', s, { ...L, seed: 12 }));
    assert.notDeepEqual(a, b);
  }
  // repetir pela interface também reproduz
  api.resetAll(); api.selectSystem('C'); api.setSeed(4242);
  const first = plain(api.resolveLivery('C', 'falcon'));
  api.reroll(() => .5); api.setSeed(4242); api.repeatSeed();
  assert.deepEqual(plain(api.resolveLivery('C', 'falcon')), first);
  assert.equal(api.uiSnapshot().seed, '4242');
});

test('C: cores fixadas manualmente sobrevivem a novos sorteios e não alteram o sorteio dos outros grupos', () => {
  api.resetAll(); api.selectSystem('C'); api.setSeed(77);
  const base = plain(api.resolveLivery('C', 'falcon'));
  api.setOverride('cockpit', '#123456');
  const locked = plain(api.resolveLivery('C', 'falcon'));
  assert.ok(near(locked.cockpit[0], mix(hexRgb('#123456'), [.96, .37, .68], .55)));
  for (const p of ['nose']) assert.deepEqual(locked[p], base[p], 'grupo automático mudou ao travar outro');
  api.setSeed(78);
  assert.ok(near(plain(api.resolveLivery('C', 'falcon')).cockpit[0], locked.cockpit[0]), 'trava não sobreviveu ao novo sorteio');
  api.clearOverride('cockpit');
  assert.equal(api.getState().liveries.C.falcon.overrides.cockpit, null);
});

test('C: a correção de contraste atinge o alvo com o fundo para sementes variadas (quando possível) e o relatório é coerente', () => {
  let hits = 0, total = 0;
  for (const s of SHIPS) for (let seed = 1; seed <= 40; seed++) {
    const L = { ...plain(api.defaultLivery('C', s)), seed };
    api.resetAll(); api.selectShip(s); api.selectSystem('C'); api.setSeed(seed);
    const rep = plain(api.legibility('C', s));
    for (const g of rep.bg) { total++; if (g.ratio >= L.contrastBg - 1e-9) hits++; }
  }
  assert.ok(hits / total >= .98, `contraste com o fundo atingido em ${hits}/${total}`);
  // controles de faixa: mínimo > máximo é corrigido pela interface e rejeitado no JSON
  api.resetAll(); api.selectSystem('C'); api.setLiveryValue('satMin', .9);
  const L = api.getState().liveries.C.falcon; assert.ok(L.satMax >= L.satMin);
});

test('pinturas independentes por sistema e por nave; preservadas ao trocar sistema/nave/modelo', () => {
  api.resetAll();
  api.selectSystem('A'); api.setColor('group', 'nose', '#aa0000');
  api.selectSystem('B'); api.setColor('role', 'marking', '#00aa00');
  api.selectShip('fox'); api.selectSystem('C'); api.setSeed(9); api.selectModel('C');
  api.selectShip('falcon'); api.selectSystem('A');
  const st = plain(api.getState());
  assert.equal(st.liveries.A.falcon.groups.nose, '#aa0000');
  assert.equal(st.liveries.B.falcon.roles.marking, '#00aa00');
  assert.equal(st.liveries.C.fox.seed, 9);
  assert.equal(st.liveries.A.fox.groups.nose, IDENTITY.fox, 'Fox A alterado indevidamente');
  assert.equal(st.liveries.B.goose.roles.marking, 'D', 'Goose B alterado indevidamente');
  assert.equal(st.liveries.C.falcon.seed, 1, 'Falcon C alterado indevidamente');
  assert.equal(st.models.fox, 'C');
  assert.equal(api.uiSnapshot().pickers['g-nose'], '#aa0000', 'seletor de cor não sincronizado');
  assert.throws(() => api.setLiveryValue('hierarchy', .5), /não existe/);
  assert.throws(() => api.setColor('group', 'nose', 'red'));
});

test('restaurações: nave do sistema, sistema inteiro e configuração completa (dois cliques)', () => {
  api.resetAll();
  api.selectSystem('A'); api.setColor('group', 'nose', '#aa0000'); api.selectShip('fox'); api.setColor('group', 'nose', '#bb0000');
  api.selectSystem('B'); api.setColor('role', 'accent', '#00aa00');
  api.selectSystem('A'); api.resetLivery();
  let st = plain(api.getState());
  assert.equal(st.liveries.A.fox.groups.nose, IDENTITY.fox); assert.equal(st.liveries.A.falcon.groups.nose, '#aa0000'); assert.equal(st.liveries.B.fox.roles.accent, '#00aa00');
  api.resetSystem(); st = plain(api.getState());
  assert.equal(st.liveries.A.falcon.groups.nose, IDENTITY.falcon); assert.equal(st.liveries.B.fox.roles.accent, '#00aa00');
  api.setMode('gallery');
  api.armResetAll(); assert.equal(plain(api.getState()).liveries.B.fox.roles.accent, '#00aa00', 'reset completo sem confirmação');
  api.armResetAll(); st = plain(api.getState());
  assert.equal(st.liveries.B.fox.roles.accent, 'D'); assert.equal(st.insp.mode, 'single'); assert.equal(st.system, 'B', 'reset completo deve voltar ao sistema aprovado'); assert.equal(st.ship, 'falcon');
});

test('JSON: exportação e importação reproduzem seleção, as nove pinturas e a inspeção, com interface sincronizada', () => {
  api.resetAll(); api.loadDemo();
  api.selectShip('goose'); api.selectModel('B'); api.selectSystem('C'); api.setSeed(321); api.setOverride('wings', '#335577'); api.setRoleOverride('energy', '#ffee00');
  api.setLiveryValue('contrastAdj', 1.6); api.setMode('compare'); api.setView('rear');
  const cfg = plain(api.exportConfig()), text = JSON.stringify(cfg);
  assert.equal(cfg.paintApproval, 'none'); assert.equal(cfg.artDirection, 'D-TOON-VECTOR-FLUX');
  const resolvedBefore = plain(api.resolveLivery('C', 'goose'));
  api.resetAll(); api.importJSON(text);
  assert.deepEqual(plain(api.exportConfig()), cfg);
  assert.deepEqual(plain(api.resolveLivery('C', 'goose')), resolvedBefore, 'paleta C não reproduzida após importação');
  const ui = plain(api.uiSnapshot());
  assert.equal(ui.system, 'C'); assert.equal(ui.ship, 'goose'); assert.equal(ui.model, 'B'); assert.equal(ui.panelKey, 'C:goose'); assert.equal(ui.seed, '321');
  assert.equal(ui.pickers['cg-wings'], '#335577'); assert.equal(ui.sliders.contrastAdj, 1.6);
  assert.deepEqual(JSON.parse(ui.json), cfg);
});

test('JSON: entradas inválidas são rejeitadas sem alterar o estado', () => {
  api.resetAll(); api.selectSystem('B'); api.setColor('role', 'glass', '#102030');
  const good = plain(api.exportConfig()), before = plain(api.getState());
  const mut = fn => { const c = plain(good); fn(c); return JSON.stringify(c); };
  const bad = {
    sintaxe: '{', nulo: 'null', esquema: mut(c => { c.schema = 'x'; }), versao: mut(c => { c.schemaVersion = 2; }),
    direcao: mut(c => { c.artDirection = 'C-RETRO-VECTOR'; }), geometria: mut(c => { c.geometryBaseline = 'prototype05-v2'; }),
    aprovacao: mut(c => { c.paintApproval = 'approved'; }), sistema: mut(c => { c.selection.system = 'D'; }), nave: mut(c => { c.selection.ship = 'stingray'; }),
    modelo: mut(c => { c.selection.models.fox = 'Z'; }), modeloInconsistente: mut(c => { c.selection.model = 'C'; }),
    hexInvalido: mut(c => { c.liveries.A.falcon.groups.nose = 'blue'; }), hexMaiusculo: mut(c => { c.liveries.A.falcon.groups.nose = '#AABBCC'; }),
    DnaPintura: mut(c => { c.liveries.B.fox.roles.paint = 'D'; }), papelExtra: mut(c => { c.liveries.B.fox.roles.chrome = '#ffffff'; }),
    grupoAusente: mut(c => { delete c.liveries.A.goose.groups.engines; }), sliderFora: mut(c => { c.liveries.A.falcon.pinkMix = 2; }),
    sliderAlheio: mut(c => { c.liveries.A.falcon.hierarchy = .5; }), sementeFracionada: mut(c => { c.liveries.C.fox.seed = 1.5; }),
    sementeZero: mut(c => { c.liveries.C.fox.seed = 0; }), harmonia: mut(c => { c.liveries.C.fox.harmony = 'neon'; }),
    faixaInvertida: mut(c => { c.liveries.C.fox.satMin = .9; c.liveries.C.fox.satMax = .2; }),
    overrideIncompleto: mut(c => { c.liveries.C.goose.overrides.nose = { paint: '#112233' }; }), sistemaAusente: mut(c => { delete c.liveries.C; }),
    params: mut(c => { c.params = {}; }), inspecao: mut(c => { c.inspection.mode = 'vr'; }), ultimaInvalida: mut(c => { c.liveries.A.falcon.pinkMix = .3; c.liveries.C.goose.glow = 9; })
  };
  for (const [name, text] of Object.entries(bad)) {
    assert.throws(() => api.importJSON(text), /\S/, name);
    assert.deepEqual(plain(api.getState()), before, `estado alterado após rejeição: ${name}`);
  }
});

test('renderizador (WebGL simulado): modos individual, comparação e galeria sem vazamento de buffers', () => {
  api.resetAll();
  for (const m of ['single', 'compare', 'gallery']) { api.setMode(m); assert.equal(api.renderNow(), true); assert.ok(api.renderer().draws > 0); }
  const warm = api.renderer().liveBuffers;
  for (let k = 0; k < 30; k++) {
    api.selectSystem(SYSTEMS[k % 3]); api.selectShip(SHIPS[k % 3]); api.selectModel(['A', 'B', 'C'][(k + 1) % 3]);
    api.setMode(['single', 'compare', 'gallery'][k % 3]); api.setView(['top', 'rear', 'bottom'][k % 3]);
    if (api.getState().system === 'C') api.setSeed(1 + k); else api.setLiveryValue('pinkMix', (k % 5) / 10);
    api.setInspection('focus', ['all', ...PARTS][k % 5]); api.renderNow();
  }
  const c = lab.gl.__counts, r = api.renderer();
  assert.equal(r.liveBuffers, c.created - c.deleted);
  assert.equal(r.liveBuffers, warm, 'buffers mudaram embora a geometria seja fixa');
  assert.ok(r.cachedModels <= 9);
});

test('sem WebGL: falha exibida e pintura/JSON continuam operando', () => {
  const nogl = boot({ webgl: false });
  assert.equal(nogl.api.renderer().ok, false); assert.equal(nogl.els.get('failure').hidden, false);
  nogl.api.selectSystem('B'); nogl.api.setColor('role', 'accent', '#ff0000');
  assert.equal(JSON.parse(nogl.api.exportJSON()).liveries.B.falcon.roles.accent, '#ff0000');
});

test('direção D preservada, somente o Sistema B declarado aprovado e laboratório fora do jogo', () => {
  for (const needle of ['INK_T=.032', 'D_WIRE=[1,.22,.61]', 'mod(gl_FragCoord.xy,vec2(5.0))', 'floor((.25+.78*nd)*3.2)/3.0', 'D_PINK=[.96,.37,.68]', "paintApproval:'none'"])
    assert.ok(script.includes(needle), `ausente: ${needle}`);
  assert.ok(html.includes("APPROVED_SYSTEM='B'"), 'Sistema B deve ser o único aprovado');
  assert.ok(!/APPROVED_SYSTEM='[AC]'/.test(html));
  assert.match(html, /sistemas? A e C não (foram )?escolhidos/i);
  for (const f of ['src/main.ts', 'src/game/Game.ts', 'src/game/Vehicle.ts', 'index.html'])
    assert.ok(!readFileSync(path.join(root, f), 'utf8').includes('06_craft_paint_lab'), `${f} referencia o laboratório`);
});

test('laboratório abre no sistema aprovado B com o selo de aprovação', () => {
  const fresh = boot();
  assert.equal(fresh.api.getState().system, 'B');
  assert.match(fresh.api.uiSnapshot().badge, /SISTEMA B APROVADO/);
});

test('aprovação de 10/10/2026: selo distingue B no padrão, B com pipeline alterado e A/C não escolhidos', () => {
  api.resetAll();
  api.selectSystem('B'); assert.match(api.uiSnapshot().badge, /SISTEMA B APROVADO/);
  api.setColor('role', 'accent', '#00ff66'); assert.match(api.uiSnapshot().badge, /SISTEMA B APROVADO/, 'cores são livres no sistema aprovado');
  api.setLiveryValue('pinkMix', .2); assert.match(api.uiSnapshot().badge, /AJUSTE DE PIPELINE NÃO APROVADO/);
  api.resetLivery(); assert.match(api.uiSnapshot().badge, /SISTEMA B APROVADO/);
  for (const s of ['A', 'C']) { api.selectSystem(s); assert.match(api.uiSnapshot().badge, new RegExp(`SISTEMA ${s} · NÃO APROVADO`)); }
  const decision = readFileSync(path.join(root, 'docs/decisions/2026-10-10-prototype-06-paint-system-approval.md'), 'utf8');
  assert.match(decision, /Sistema B/); assert.match(decision, /pinkMix[^|]*\|\s*\*\*0,55\*\*/);
  // a baseline aprovada do B (padrões) reproduz exatamente a paleta D da v6
  for (const ship of SHIPS) {
    const t = api.resolveLivery('B', ship, api.defaultLivery('B', ship)), id = hexRgb(IDENTITY[ship]);
    for (const p of PARTS) assert.ok(near(t[p][0], mix(id, [.96, .37, .68], .55)));
  }
});
