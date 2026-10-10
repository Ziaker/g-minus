// Regressões do Protótipo 05 — laboratório de geometria das três primeiras naves.
// Executa o script real do HTML em um DOM simulado. O WebGL aqui é um MOCK que só conta
// buffers/draw calls: estes testes NÃO validam aparência; a validação visual é feita em navegador real.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const LAB = 'prototypes/05_craft_geometry_lab.html';
const html = readFileSync(path.join(root, LAB), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];

class El {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase(); this.id = id; this.children = []; this.listeners = {}; this.attrs = {};
    this.style = {}; this.dataset = {}; this.value = ''; this.textContent = ''; this.innerHTML = ''; this.hidden = false; this.open = true;
    this.clientWidth = 1200; this.clientHeight = 800; this.ctx = null;
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
  const gl = new Proxy({}, { get: (_, k) => {
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
  return gl;
}
function boot({ webgl = true } = {}) {
  const els = new Map(), gl = webgl ? mockGL() : null;
  const document = {
    getElementById: id => { if (!els.has(id)) { const e = new El(id === 'view' ? 'canvas' : 'div', id); if (id === 'view') e.ctx = gl; els.set(id, e); } return els.get(id); },
    createElement: t => new El(t), body: new El('body'), execCommand: () => false
  };
  const listeners = {};
  const window = { devicePixelRatio: 1, addEventListener: (k, fn) => (listeners[k] ??= []).push(fn), emit: (k, e) => (listeners[k] ?? []).forEach(f => f(e)) };
  const ctx = vm.createContext({ document, window, console, navigator: {}, performance: { now: () => 1000 }, setTimeout: () => 0, clearTimeout: () => {},
    requestAnimationFrame: () => 0, Blob: class {}, URL: { createObjectURL: () => '', revokeObjectURL: () => {} } });
  vm.runInContext(script, ctx, { filename: LAB });
  return { api: window.__GMINUS_GEOMETRY_LAB__, document, window, gl, els };
}
const plain = o => JSON.parse(JSON.stringify(o));
const lab = boot();
const { api } = lab;
const SHIPS = plain(api.ships()), PARTS = plain(api.parts());
const combos = SHIPS.flatMap(s => plain(api.variants(s)).map(v => [s, v]));

function manifoldErrors(shape) {
  const p = shape.positions, edges = new Map(), key = i => `${Math.round(p[i] * 1e4)},${Math.round(p[i + 1] * 1e4)},${Math.round(p[i + 2] * 1e4)}`;
  for (let t = 0; t < p.length; t += 9) { const k = [key(t), key(t + 3), key(t + 6)]; for (let j = 0; j < 3; j++) { const id = k[j] + '>' + k[(j + 1) % 3]; edges.set(id, (edges.get(id) || 0) + 1); } }
  let bad = 0; for (const [id, n] of edges) { const [a, b] = id.split('>'); if (n !== 1 || edges.get(b + '>' + a) !== 1) bad++; }
  return bad;
}
function assertValidMesh(mesh, label) {
  assert.ok(mesh.shapes.length > 10, `${label}: poucas formas`);
  for (const s of mesh.shapes) {
    assert.ok([...s.positions].every(Number.isFinite) && [...s.normals].every(Number.isFinite) && [...s.onormals].every(Number.isFinite), `${label}: valores não finitos (${s.part}/${s.roleName})`);
    if (s.closed) {
      assert.equal(manifoldErrors(s), 0, `${label}: malha aberta/inconsistente (${s.part}/${s.roleName}/${s.kind})`);
      assert.ok(s.volume > 1e-6, `${label}: volume não positivo / faces invertidas (${s.part}/${s.roleName})`);
    }
  }
}
// silhueta rasterizada por projeção ortográfica em grade fixa (mesma escala para todas as naves)
function silhouette(mesh, axes, N = 72, ext = 4.6) {
  const g = new Uint8Array(N * N), [a, b] = axes;
  for (const s of mesh.shapes) {
    const p = s.positions;
    for (let t = 0; t < p.length; t += 9) {
      const P = [0, 3, 6].map(o => [(p[t + o + a] + ext) / (2 * ext) * N, (p[t + o + b] + ext) / (2 * ext) * N]);
      const minX = Math.max(0, Math.floor(Math.min(...P.map(q => q[0])))), maxX = Math.min(N - 1, Math.ceil(Math.max(...P.map(q => q[0]))));
      const minY = Math.max(0, Math.floor(Math.min(...P.map(q => q[1])))), maxY = Math.min(N - 1, Math.ceil(Math.max(...P.map(q => q[1]))));
      const cr = (u, v, w) => (v[0] - u[0]) * (w[1] - u[1]) - (v[1] - u[1]) * (w[0] - u[0]);
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const c = [x + .5, y + .5], d1 = cr(P[0], P[1], c), d2 = cr(P[1], P[2], c), d3 = cr(P[2], P[0], c);
        if ((d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)) g[y * N + x] = 1;
      }
    }
  }
  return g;
}
const iou = (A, B) => { let i = 0, u = 0; for (let k = 0; k < A.length; k++) { i += A[k] & B[k]; u += A[k] | B[k]; } return i / u; };

test('estrutura: exatamente três naves com exatamente três alternativas (nove combinações)', () => {
  assert.deepEqual(SHIPS, ['falcon', 'fox', 'goose']);
  for (const s of SHIPS) assert.deepEqual(plain(api.variants(s)), ['A', 'B', 'C']);
  assert.equal(combos.length, 9);
  assert.deepEqual(PARTS, ['nose', 'cockpit', 'wings', 'engines']);
});

test('as nove malhas padrão são válidas, fechadas, finitas e organizadas nos quatro grupos visuais', () => {
  for (const [s, v] of combos) {
    const mesh = api.buildMesh(s, v, api.defaults(s, v)), r = api.meshReport(mesh);
    assertValidMesh(mesh, `${s}${v}`);
    for (const part of PARTS) assert.ok(r.parts[part].shapes > 0, `${s}${v} sem formas no grupo ${part}`);
    assert.ok(r.triangles > 500 && r.triangles < 20000, `${s}${v}: ${r.triangles} triângulos`);
    assert.ok([...r.bounds.min, ...r.bounds.max].every(Number.isFinite));
    assert.ok(Math.abs(r.bounds.min[0] + r.bounds.max[0]) < 1e-3, `${s}${v} não é simétrica em X`);
  }
});

test('as nove geometrias são distintas, e A/B/C de cada nave diferem em silhueta estrutural', () => {
  const prints = new Set(combos.map(([s, v]) => api.meshReport(api.buildMesh(s, v, api.defaults(s, v))).fingerprint));
  assert.equal(prints.size, 9);
  const views = { superior: [0, 2], frontal: [0, 1], lateral: [2, 1] };
  for (const s of SHIPS) {
    const sil = Object.fromEntries(['A', 'B', 'C'].map(v => [v, Object.fromEntries(Object.entries(views).map(([n, ax]) => [n, silhouette(api.buildMesh(s, v, api.defaults(s, v)), ax)]))]));
    for (const [x, y] of [['A', 'B'], ['A', 'C'], ['B', 'C']]) {
      const scores = Object.keys(views).map(n => iou(sil[x][n], sil[y][n]));
      assert.ok(scores.filter(q => q < .8).length >= 2, `${s} ${x}×${y} pouco distintas (IoU ${scores.map(q => q.toFixed(2)).join('/')})`);
      assert.ok(Math.min(...scores) < .7, `${s} ${x}×${y}: nenhuma vista claramente distinta`);
    }
  }
});

test('cada alternativa tem ≥ 6 controles geométricos com limites e padrão válidos', () => {
  for (const [s, v] of combos) {
    const defs = api.paramDefs(s, v);
    assert.ok(defs.length >= 6, `${s}${v}: só ${defs.length} controles`);
    assert.equal(new Set(defs.map(d => d.id)).size, defs.length);
    for (const d of defs) {
      assert.ok(d.min < d.max && d.def >= d.min && d.def <= d.max && d.step > 0, `${s}${v}.${d.id}`);
      assert.ok(d.affects.length > 0 && d.affects.every(p => PARTS.includes(p)));
    }
  }
});

test('cada slider altera os grupos geométricos declarados e nenhum outro; extremos são seguros', () => {
  for (const [s, v] of combos) {
    const defs = api.paramDefs(s, v), base = api.meshReport(api.buildMesh(s, v, api.defaults(s, v)));
    for (const d of defs) for (const e of ['min', 'max']) {
      const mesh = api.buildMesh(s, v, { ...api.defaults(s, v), [d.id]: d[e] });
      assertValidMesh(mesh, `${s}${v}.${d.id}=${e}`);
      const r = api.meshReport(mesh), changed = PARTS.filter(p => r.parts[p].fingerprint !== base.parts[p].fingerprint);
      assert.ok(changed.some(p => d.affects.includes(p)), `${s}${v}.${d.id}=${e} não alterou ${d.affects}`);
      assert.deepEqual(changed.filter(p => !d.affects.includes(p)), [], `${s}${v}.${d.id}=${e} alterou grupos não declarados`);
    }
    for (const e of ['min', 'max']) assertValidMesh(api.buildMesh(s, v, Object.fromEntries(defs.map(d => [d.id, d[e]]))), `${s}${v} todos=${e}`);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 12; k++) assertValidMesh(api.buildMesh(s, v, Object.fromEntries(defs.map(d => [d.id, d.min + rnd() * (d.max - d.min)]))), `${s}${v} aleatório ${k}`);
  }
});

test('parâmetros são independentes por alternativa e preservados ao trocar nave/alternativa', () => {
  api.resetAll();
  const before = api.getState().params;
  api.selectShip('falcon'); api.selectVariant('A'); api.setParam('span', 1.3);
  api.selectVariant('B'); api.setParam('length', .9);
  api.selectShip('goose'); api.selectVariant('C'); api.setParam('shoulderSize', 1.35);
  api.selectShip('falcon'); api.selectVariant('A');
  const st = api.getState();
  assert.equal(st.params.falcon.A.span, 1.3);
  assert.equal(st.params.falcon.B.length, .9);
  assert.equal(st.params.goose.C.shoulderSize, 1.35);
  for (const s of SHIPS) for (const v of ['A', 'B', 'C']) for (const [k, val] of Object.entries(st.params[s][v])) {
    const touched = (s === 'falcon' && v === 'A' && k === 'span') || (s === 'falcon' && v === 'B' && k === 'length') || (s === 'goose' && v === 'C' && k === 'shoulderSize');
    if (!touched) assert.equal(val, before[s][v][k], `${s}${v}.${k} foi alterado indevidamente`);
  }
  assert.equal(api.uiSnapshot().sliders.span, 1.3, 'slider não sincronizado com a alternativa ativa');
  assert.equal(st.variants.goose, 'C', 'alternativa da Goose não foi lembrada');
  assert.throws(() => api.setParam('ramWidth', 1), /não existe/);
  assert.throws(() => api.setParam('span', NaN));
  api.setParam('span', 99); assert.equal(api.getState().params.falcon.A.span, api.paramDefs('falcon', 'A').find(d => d.id === 'span').max);
});

test('reset por alternativa, por nave e completo atingem somente o nível pretendido', () => {
  api.resetAll();
  const D = api.getState().params;
  api.selectShip('fox'); api.selectVariant('A'); api.setParam('canard', 1.4); api.selectVariant('B'); api.setParam('foilSpan', 1.3);
  api.selectShip('goose'); api.selectVariant('A'); api.setParam('armor', 1.5);
  api.selectShip('fox'); api.selectVariant('B'); api.resetVariant();
  let st = api.getState();
  assert.equal(st.params.fox.B.foilSpan, D.fox.B.foilSpan); assert.equal(st.params.fox.A.canard, 1.4); assert.equal(st.params.goose.A.armor, 1.5);
  api.resetShip(); st = api.getState();
  assert.deepEqual(plain(st.params.fox), plain(D.fox)); assert.equal(st.params.goose.A.armor, 1.5);
  api.setMode('gallery'); api.setView('top');
  api.armResetAll(); st = api.getState(); assert.equal(st.params.goose.A.armor, 1.5, 'reset completo sem confirmação');
  api.armResetAll(); st = api.getState();
  assert.deepEqual(plain(st.params), plain(D)); assert.equal(st.ship, 'falcon'); assert.equal(st.insp.mode, 'single'); assert.equal(st.insp.view, 'threeQuarter');
});

test('JSON: exportação completa e reimportação reproduzem nave, alternativa, nove conjuntos e inspeção', () => {
  api.resetAll();
  api.selectShip('goose'); api.selectVariant('B'); api.setParam('sponsonGap', .3);
  api.selectShip('fox'); api.selectVariant('C'); api.setParam('earHeight', 1.4); api.setMode('compare'); api.setView('rear');
  const cfg = api.exportConfig();
  assert.equal(cfg.schema, 'gminus.craft-geometry-lab'); assert.equal(cfg.schemaVersion, 1);
  assert.equal(cfg.artDirection, 'D-TOON-VECTOR-FLUX'); assert.equal(cfg.geometryApproval, 'none');
  assert.deepEqual(plain(cfg.selection), { ship: 'fox', variant: 'C', variants: { falcon: 'A', fox: 'C', goose: 'B' } });
  for (const [s, v] of combos) assert.deepEqual(plain(Object.keys(cfg.params[s][v]).sort()), plain(api.paramDefs(s, v).map(d => d.id).sort()));
  const text = JSON.stringify(cfg);
  api.resetAll();
  api.importJSON(text);
  const st = api.getState();
  assert.equal(st.ship, 'fox'); assert.equal(st.variants.fox, 'C'); assert.equal(st.variants.goose, 'B');
  assert.equal(st.params.goose.B.sponsonGap, .3); assert.equal(st.params.fox.C.earHeight, 1.4);
  assert.equal(st.insp.mode, 'compare'); assert.equal(st.insp.view, 'rear');
  assert.deepEqual(plain(api.exportConfig()), plain(cfg));
  const ui = api.uiSnapshot();
  assert.equal(ui.ship, 'fox'); assert.equal(ui.variant, 'C'); assert.equal(ui.mode, 'compare'); assert.equal(ui.sliderKey, 'fox:C');
  assert.equal(ui.sliders.earHeight, 1.4);
  assert.deepEqual(plain(JSON.parse(ui.json)), plain(cfg), 'campo JSON não sincronizado após importação');
});

test('JSON: entradas inválidas são rejeitadas sem alterar nenhum estado (aplicação atômica)', () => {
  api.resetAll(); api.selectShip('goose'); api.selectVariant('C'); api.setParam('tuskLength', 1.2);
  const good = api.exportConfig(), before = plain(api.getState());
  const mut = fn => { const c = plain(good); fn(c); return JSON.stringify(c); };
  const bad = {
    'sintaxe': '{"schema":',
    'array': '[]',
    'nulo': 'null',
    'esquema': mut(c => { c.schema = 'outro'; }),
    'versão': mut(c => { c.schemaVersion = 2; }),
    'direção artística': mut(c => { c.artDirection = 'A-ANIME-CEL'; }),
    'aprovação presumida': mut(c => { c.geometryApproval = 'approved'; }),
    'nave desconhecida': mut(c => { c.selection.ship = 'stingray'; }),
    'alternativa D': mut(c => { c.selection.variants.falcon = 'D'; }),
    'variant inconsistente': mut(c => { c.selection.variant = 'A'; }),
    'fora do intervalo': mut(c => { c.params.falcon.A.span = 9; }),
    'NaN como string': mut(c => { c.params.fox.B.podGap = 'NaN'; }),
    'nulo em parâmetro': mut(c => { c.params.goose.A.armor = null; }),
    'parâmetro ausente': mut(c => { delete c.params.fox.A.canard; }),
    'parâmetro de outra alternativa': mut(c => { c.params.fox.A.ramWidth = 1; }),
    'alternativa ausente': mut(c => { delete c.params.goose.B; }),
    'nave extra': mut(c => { c.params.stingray = {}; }),
    'chave desconhecida': mut(c => { c.extra = 1; }),
    'modo inválido': mut(c => { c.inspection.mode = 'vr'; }),
    'zoom inválido': mut(c => { c.inspection.zoom = 0; }),
    'autoRotate não booleano': mut(c => { c.inspection.autoRotate = 'sim'; }),
    'acabamento fora': mut(c => { c.finish.glow = 5; }),
    'parcial (última inválida)': mut(c => { c.params.falcon.A.span = 1.2; c.params.goose.C.rearScale = -1; })
  };
  for (const [name, text] of Object.entries(bad)) {
    assert.throws(() => api.importJSON(text), /\S/, name);
    assert.deepEqual(plain(api.getState()), before, `estado alterado após rejeição: ${name}`);
  }
  // inspeção e acabamento são opcionais; o restante é obrigatório
  const partial = plain(good); delete partial.inspection; delete partial.finish;
  api.importJSON(JSON.stringify(partial));
  assert.equal(api.getState().params.goose.C.tuskLength, 1.2);
});

test('renderizador (WebGL simulado): todos os modos desenham e não vazam buffers ao alternar repetidamente', () => {
  const r0 = api.renderer();
  assert.equal(r0.ok, true);
  api.resetAll();
  for (const m of ['single', 'compare', 'gallery']) { api.setMode(m); assert.equal(api.renderNow(), true); assert.ok(api.renderer().draws > 0); }
  const warm = api.renderer().liveBuffers;
  for (let k = 0; k < 40; k++) {
    const [s, v] = combos[k % 9];
    api.setMode(['single', 'compare', 'gallery'][k % 3]); api.selectShip(s); api.selectVariant(v);
    api.setParam(api.paramDefs(s, v)[k % 6].id, api.paramDefs(s, v)[k % 6][k % 2 ? 'min' : 'max']);
    for (const vw of ['top', 'bottom', 'rear']) { api.setView(vw); api.renderNow(); }
    api.setInspection('render', ['flux', 'neutral', 'silhouette'][k % 3]); api.setInspection('focus', ['all', ...PARTS][k % 5]); api.renderNow();
  }
  api.setMode('gallery'); api.renderNow();
  const c = lab.gl.__counts, r = api.renderer();
  assert.equal(r.liveBuffers, c.created - c.deleted, 'contagem de buffers inconsistente');
  assert.ok(r.liveBuffers <= warm + 1e-9 + 30, `buffers crescendo: ${warm} → ${r.liveBuffers}`);
  assert.equal(r.cachedModels, 9);
});

test('sem WebGL: falha é exibida e controles/JSON continuam operando', () => {
  const nogl = boot({ webgl: false });
  assert.equal(nogl.api.renderer().ok, false);
  assert.equal(nogl.els.get('failure').hidden, false);
  nogl.api.selectShip('fox'); nogl.api.setParam('span', 1.2);
  assert.equal(JSON.parse(nogl.api.exportJSON()).params.fox.A.span, 1.2);
  assert.equal(nogl.api.renderNow(), false);
});

test('direção D — Toon Vector Flux é fixa e o passe de render preserva as constantes da v6', () => {
  for (const needle of ['INK_T=.032', 'D_WIRE=[1,.22,.61]', 'mod(gl_FragCoord.xy,vec2(5.0))', 'floor((.25+.78*nd)*3.2)/3.0', 'mix3(paint,[.96,.37,.68],.55)', 'D_INK=[.025,.036,.087]', 'vitrine:[.035,.034,.083]'])
    assert.ok(script.includes(needle), `constante da opção D ausente: ${needle}`);
  assert.ok(!/style\s*:\s*['"][ABCE]['"]/.test(script), 'o laboratório não deve oferecer outras direções artísticas');
  assert.throws(() => api.importJSON(JSON.stringify({ ...api.exportConfig(), artDirection: 'C-RETRO-VECTOR' })), /fixa/);
});

test('referência aprovada v6 intacta e laboratório não integrado ao jogo', () => {
  const v6 = readFileSync(path.join(root, 'prototypes/02_ship_visuals_v6_webgl.html'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(createHash('sha256').update(v6).digest('hex'), '560f751db1a22bccac23f52f0b8e595c1a7293da82eea94a91c075a091e8df02');
  for (const f of ['src/main.ts', 'src/game/Game.ts', 'src/game/Vehicle.ts', 'index.html'])
    assert.ok(!readFileSync(path.join(root, f), 'utf8').includes('05_craft_geometry_lab'), `${f} referencia o laboratório`);
});

// ---- Aprovação de 10/10/2026: baseline travada e uso obrigatório nos próximos protótipos de naves ----
const APPROVED_FINGERPRINTS = {
  falcon: { A: '902a3acf', B: '3b36297f', C: '8dea1899' },
  fox: { A: '0f6edd34', B: '20f67adb', C: 'c84e2916' },
  goose: { A: '2dbc008a', B: '05c4fe5d', C: '92d0c8f3' }
};
const BEGIN = '/* @gminus-approved-craft-geometry:begin v1 */', END = '/* @gminus-approved-craft-geometry:end v1 */';
const approvedBlock = text => { const t = text.replace(/\r\n/g, '\n'), a = t.indexOf(BEGIN), b = t.indexOf(END); return a < 0 || b < a ? null : t.slice(a, b + END.length); };

test('baseline aprovada: as nove geometrias padrão reproduzem exatamente as impressões registradas', () => {
  for (const [s, v] of combos)
    assert.equal(api.meshReport(api.buildMesh(s, v, api.defaults(s, v))).fingerprint, APPROVED_FINGERPRINTS[s][v], `${s}${v} divergiu da baseline aprovada`);
  const decision = readFileSync(path.join(root, 'docs/decisions/2026-10-10-prototype-05-craft-geometry-approval.md'), 'utf8');
  for (const [s, v] of combos) assert.ok(decision.includes(APPROVED_FINGERPRINTS[s][v]), `registro de decisão sem a impressão de ${s}${v}`);
});

test('selo da interface distingue baseline aprovada de variação exploratória', () => {
  api.resetAll();
  assert.match(api.uiSnapshot().badge, /APROVADA/);
  api.setParam('span', 1.2);
  assert.match(api.uiSnapshot().badge, /EXPLORATÓRIA/);
  api.resetVariant();
  assert.match(api.uiSnapshot().badge, /APROVADA/);
});

test('próximos protótipos que envolvem naves devem embutir o bloco geométrico aprovado sem alterações', () => {
  const canonical = approvedBlock(html);
  assert.ok(canonical && canonical.length > 20000, 'bloco canônico ausente no Protótipo 05');
  const files = readdirSync(path.join(root, 'prototypes')).filter(f => /^\d{2}_.*\.html$/.test(f));
  for (const f of files) {
    const n = Number(f.slice(0, 2)), text = readFileSync(path.join(root, 'prototypes', f), 'utf8'), block = approvedBlock(text);
    const involvesShips = /\b(falcon|golden fox|wild goose|blue falcon)\b/i.test(text) || /craft|ship|nave|vehicle/i.test(f);
    if (n > 5 && involvesShips) assert.ok(block, `${f} envolve naves e não embute o bloco @gminus-approved-craft-geometry`);
    if (block) assert.equal(block, canonical, `${f} alterou o bloco geométrico aprovado`);
  }
});

test('JSON da baseline aprovada importa sem erro e corresponde exatamente aos padrões', () => {
  const text = readFileSync(path.join(root, 'docs/decisions/2026-10-10-prototype-05-approved-baseline.json'), 'utf8');
  api.resetAll(); api.selectShip('goose'); api.setParam('length', .9);
  api.importJSON(text);
  for (const [s, v] of combos) assert.deepEqual(plain(api.getState().params[s][v]), plain(api.defaults(s, v)), `${s}${v}`);
});
