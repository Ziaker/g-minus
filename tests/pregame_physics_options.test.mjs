// Regressões do Protótipo 07 — opções de física no pré-jogo (EM AVALIAÇÃO).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { buildData, render, embedded, MAP, BASIC } from '../prototypes/pregame-options/build-data.mjs';
import { declared, connected, signature } from '../prototypes/pregame-options/classify-params.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = readFileSync(path.join(root, 'prototypes/07_pregame_physics_options.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const plain = o => JSON.parse(JSON.stringify(o));
class El {
  constructor(t) {
    this.tagName = t; this.children = []; this.listeners = {}; this.attrs = {}; this.style = {}; this.dataset = {}; this.value = ''; this.textContent = ''; this.checked = false;
    const c = new Set(); this.classList = { toggle: (k, on) => ((on ?? !c.has(k)) ? c.add(k) : c.delete(k)), add: k => c.add(k), contains: k => c.has(k) };
  }
  addEventListener(k, f) { (this.listeners[k] ??= []).push(f); } setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return this.attrs[k] ?? null; }
  append(...c) { this.children.push(...c); } prepend(...c) { this.children.unshift(...c); } replaceChildren(...c) { this.children = c; } select() {}
}
function boot(store = new Map()) {
  const els = new Map();
  const document = { getElementById: id => { if (!els.has(id)) els.set(id, new El('div')); return els.get(id); }, createElement: t => new El(t), createTextNode: t => ({ text: t }), querySelectorAll: () => [], execCommand: () => false };
  const localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  const window = {};
  const ctx = vm.createContext({ document, window, localStorage, console, navigator: {}, Option: class { constructor(t, v) { this.text = t; this.value = v; } }, Blob: class {}, URL: {}, setTimeout: () => 0 });
  vm.runInContext(script, ctx);
  return { api: window.__GMINUS_P07__, store };
}

test('dados embutidos são exatamente os gerados das fontes (export C, laboratório 01, PhysicsCalibration.ts)', () => {
  assert.equal(embedded(html), render(buildData()));
});

test('escopo: os 93 parâmetros declarados, todos mapeados, 18 ambíguos marcados; básicos só entre os funcionais', () => {
  const d = buildData();
  assert.equal(d.params.length, 93);
  for (const k of BASIC) assert.equal(d.params.find(p => p.key === k).status, 'functional', k);
  assert.equal(new Set(d.params.map(p => p.key)).size, 93);
  assert.equal(Object.values(MAP).reduce((n, g) => n + Object.keys(g).length, 0), 93);
  assert.equal(d.params.filter(p => p.ambiguous).length, 18);
  assert.equal(d.params.filter(p => p.basic).length, BASIC.length);
  for (const p of d.params) for (const pr of ['A', 'B', 'C']) assert.ok(p.profiles[pr] >= p.min && p.profiles[pr] <= p.max, p.key + pr);
});

test('classificação: 53 funcionais, 25 só na calibração, 15 de sistema futuro (voo); conexão confere com o código', () => {
  const d = buildData(), count = s => d.params.filter(p => p.status === s).map(p => p.group + '.' + p.field);
  assert.equal(count('functional').length, 53); assert.equal(count('declared-only').length, 25); assert.equal(count('future-system').length, 15);
  assert.ok(count('future-system').every(id => id.startsWith('flight.')));
  assert.ok(d.params.filter(p => p.group === 'ai').every(p => p.status === 'declared-only'));
  const status = JSON.parse(readFileSync(path.join(root, 'prototypes/pregame-options/param-status.json'), 'utf8')).params, conn = connected();
  assert.deepEqual(Object.keys(status).sort(), declared().sort());
  for (const [id, st] of Object.entries(status)) { assert.equal(st.connected, conn[id], id); if (st.functional) assert.ok(st.connected, id); }
  for (const p of d.params) assert.equal(p.status === 'functional', status[p.group + '.' + p.field].functional, p.key);
  // ambíguos: 8 configuráveis, 10 em planejamento — nenhum resolvido
  assert.equal(d.params.filter(p => p.ambiguous && p.status === 'functional').length, 8);
});

test('amostra da simulação real: esterço muda o resultado; agressividade da IA não muda', () => {
  const base = signature(null);
  assert.notEqual(signature({ id: 'steering.steerRate', value: 56 * 1.37 }), base);
  assert.equal(signature({ id: 'ai.aggressiveness', value: 99 }), base);
  assert.equal(signature({ id: 'flight.glideLift', value: 99 }), base);
});

test('perfil C usa os valores do export enviado (esterço 89, inclinação 34, 500/600), sem escolher valores ambíguos', () => {
  const exp = JSON.parse(readFileSync(path.join(root, 'docs/decisions/2026-10-10-prototype-01-profile-c-export.json'), 'utf8'));
  const d = buildData();
  for (const p of d.params) assert.equal(p.profiles.C, exp.params[p.key].value, p.key);
  const by = Object.fromEntries(d.params.map(p => [p.key, p]));
  assert.equal(by.steerRate.profiles.C, 89); assert.equal(by.maxRoll.profiles.C, 34);
  assert.equal(by.topSpeed.profiles.C, 500); assert.equal(by.boostTopSpeed.profiles.C, 600);
  for (const p of d.params.filter(x => x.ambiguous)) assert.ok(p.candidates.length > 1 && p.candidates.includes(p.profiles.C), p.key);
});

test('estado inicial: perfil C nas três alternativas; alternativas independentes; perfil reaplicável', () => {
  const { api } = boot();
  const s = plain(api.getState());
  for (const a of ['A', 'B', 'C']) { assert.equal(s.configs[a].profile, 'C'); assert.equal(s.configs[a].values.steerRate, 89); }
  api.selectAlt('B'); api.setValue('steerRate', 120); api.setValue('grip', 90);
  let st = plain(api.getState());
  assert.equal(st.configs.B.values.steerRate, 120); assert.equal(st.configs.A.values.steerRate, 89); assert.equal(st.configs.C.values.steerRate, 89);
  assert.deepEqual(plain(api.changedKeys('B')).sort(), ['grip', 'steerRate']);
  api.applyProfile('A'); st = plain(api.getState());
  assert.equal(st.configs.B.profile, 'A'); assert.deepEqual(plain(api.changedKeys('B')), []);
  assert.throws(() => api.setValue('naoExiste', 1));
  for (const k of ['aiAggressiveness', 'airGlideLift', 'cameraRollFollow']) assert.throws(() => api.setValue(k, 1), /desconhecido/, k);
  assert.equal(api.configurableKeys().length, 53); assert.equal(api.planningKeys().length, 40);
  api.setValue('steerRate', 9999); assert.equal(plain(api.getState()).configs.B.values.steerRate, 270);
});

test('configuração para o jogo: só os 53 funcionais, no formato de PhysicsCalibration.ts, com grip e retenção de drift em fração', () => {
  const { api } = boot();
  const g = plain(api.gameConfig('A')), d = buildData().params.filter(p => p.status === 'functional');
  assert.deepEqual(Object.keys(g).sort(), [...new Set(d.map(p => p.group))].sort());
  assert.ok(!('flight' in g) && !('ai' in g));
  assert.equal(g.steering.grip, .68); assert.equal(g.drift.gripMultiplier, .18);
  assert.equal(g.steering.steerRate, 89); assert.equal(g.banking.maxRollDegrees, 34);
  assert.equal(Object.values(g).reduce((n, o) => n + Object.keys(o).length, 0), 53);
});

test('persistência entre sessões: valores restaurados em outra carga da página; dados salvos inválidos ignorados', () => {
  const first = boot();
  first.api.selectAlt('C'); first.api.setValue('cameraDistance', 12);
  const s = plain(boot(first.store).api.getState());
  assert.equal(s.alt, 'C'); assert.equal(s.configs.C.values.cameraDistance, 12);
  const corrupt = new Map([['gminus.p07.v1', '{"lixo":1}']]);
  assert.equal(plain(boot(corrupt).api.getState()).configs.A.values.steerRate, 89);
});

test('JSON estrito e atômico; não aceita alegação de aprovação', () => {
  const { api } = boot();
  api.setValue('inertia', 70);
  const good = plain(api.exportConfig()), before = JSON.stringify(api.getState());
  const mut = f => { const c = plain(good); f(c); return JSON.stringify(c); };
  for (const bad of ['{', mut(c => { c.approval = 'approved'; }), mut(c => { c.alt = 'D'; }), mut(c => { c.configs.A.profile = 'X'; }), mut(c => { c.configs.B.values.steerRate = 999; }),
    mut(c => { delete c.configs.C.values.grip; }), mut(c => { c.configs.C.values.extra = 1; }), mut(c => { c.configs.A.values.aiAggressiveness = 50; }), mut(c => { c.schemaVersion = 2; }), mut(c => { c.configs.A.values.grip = '68'; })]) {
    assert.throws(() => api.importJSON(bad), /\S/); assert.equal(JSON.stringify(api.getState()), before);
  }
  api.reset(); api.importJSON(JSON.stringify(good));
  assert.equal(plain(api.getState()).configs.A.values.inertia, 70);
});

test('planejamento: os 40 sem efeito aparecem identificados, sem controle e fora do menu', () => {
  const { api } = boot();
  const walk = (e, f) => { f(e); for (const c of e.children || []) walk(c, f); };
  // recria o DOM para inspecionar a seção de planejamento
  const store = new Map(); const els = new Map();
  const document = { getElementById: id => { if (!els.has(id)) els.set(id, new El('div')); return els.get(id); }, createElement: t => new El(t), createTextNode: t => ({ text: t }), querySelectorAll: () => [], execCommand: () => false };
  const ctx = vm.createContext({ document, window: {}, localStorage: { getItem: () => null, setItem: (k, v) => store.set(k, v) }, console, navigator: {}, Option: class {}, Blob: class {}, URL: {}, setTimeout: () => 0 });
  vm.runInContext(script, ctx);
  const plan = els.get('plan'), keys = [], inputs = [], text = [];
  walk(plan, e => { if (e.dataset?.planKey) keys.push(e.dataset.planKey); if (e.tagName === 'input') inputs.push(e); if (e.textContent) text.push(e.textContent); });
  assert.deepEqual(keys.sort(), plain(api.planningKeys()).sort());
  assert.equal(inputs.length, 0);
  assert.equal(text.filter(t => t.startsWith('sistema futuro')).length, 15);
  assert.equal(text.filter(t => t === 'sem efeito no jogo atual').length, 25);
  assert.ok(text.some(t => /não são configuráveis no jogo atual/.test(t)));
  for (const k of plain(api.planningKeys())) assert.ok(!plain(api.rowsShown()).includes(k), k);
});

test('protótipo não integrado ao jogo e não declara aprovação', () => {
  assert.match(html, /Em avaliação — nenhuma alternativa aprovada/);
  for (const f of ['src/main.ts', 'src/game/Game.ts', 'src/game/Vehicle.ts', 'index.html'])
    assert.ok(!readFileSync(path.join(root, f), 'utf8').includes('07_pregame_physics_options'), f);
});
