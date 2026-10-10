// Classificação dos 93 parâmetros de src/game/PhysicsCalibration.ts (Protótipo 07).
//  declarado  : existe em APPROVED_PHYSICS
//  conectado  : o código do jogo lê o valor (referência estática "APPROVED_PHYSICS.<grupo>.<campo>" fora da calibração)
//  funcional  : alterar o valor muda o estado de uma simulação real do jogo (Vehicle/Game/Track carregados de src/)
// Uso: node prototypes/pregame-options/classify-params.mjs [--write]
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as THREE from 'three';

const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, '../..');
const rd = p => fs.readFileSync(path.join(repo, p), 'utf8');

export function declared() {
  const mod = {}; vm.runInNewContext(ts.transpileModule(rd('src/game/PhysicsCalibration.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: mod });
  return Object.entries(mod.APPROVED_PHYSICS).flatMap(([g, o]) => Object.keys(o).map(f => g + '.' + f));
}
export function connected() {
  const files = fs.readdirSync(path.join(repo, 'src/game')).filter(f => f.endsWith('.ts') && f !== 'PhysicsCalibration.ts').map(f => 'src/game/' + f).concat('src/main.ts');
  const src = files.map(rd).join('\n');
  return Object.fromEntries(declared().map(id => { const [g, f] = id.split('.'); return [id, new RegExp('APPROVED_PHYSICS\\.' + g + '\\.' + f + '\\b').test(src)]; }));
}

/* ---- simulação: módulos do jogo recarregados a cada execução, com um parâmetro perturbado ---- */
const noop = () => {};
function makeLoader(override) {
  const cache = new Map();
  const document = { getElementById: () => ({ style: {}, classList: { add: noop, remove: noop, toggle: noop }, addEventListener: noop, appendChild: noop }), createElement: () => ({ getContext: () => new Proxy({}, { get: () => noop }), style: {} }), addEventListener: noop };
  const window = { addEventListener: noop, innerWidth: 1000, innerHeight: 700, devicePixelRatio: 1 };
  let seed = 12345; const rand = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
  const MathSeeded = Object.create(Math); MathSeeded.random = rand;
  function load(file) {
    const filename = path.resolve(repo, file); if (cache.has(filename)) return cache.get(filename);
    const exports = {}; cache.set(filename, exports);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, document, window, console, Math: MathSeeded, performance: { now: () => 1000 }, setTimeout: noop, requestAnimationFrame: noop,
      require: name => name === 'three' ? THREE : load(path.resolve(path.dirname(filename), name + '.ts')) }, { filename });
    if (filename.endsWith('PhysicsCalibration.ts') && override) { const [g, f] = override.id.split('.'); exports.APPROVED_PHYSICS[g][f] = override.value; }
    return exports;
  }
  return load;
}
const r = x => Math.round(x * 1e4) / 1e4;
function snapshot(v) { return [v.speed, v.lateralOffset, v.lateralVelocity, v.shield, v.progressT, v.currentRoll, v.isBoosting ? 1 : 0, v.boostDurationRemaining, v.boostCooldownRemaining, v.group.position.x, v.group.position.y, v.group.position.z, v.group.rotation.x, v.group.rotation.y, v.group.rotation.z].map(x => r(Number(x) || 0)); }
export function signature(override) {
  const load = makeLoader(override);
  load('src/game/PhysicsCalibration.ts');
  const { Vehicle } = load('src/game/Vehicle.ts'), { Game, MACHINE_ROSTER } = load('src/game/Game.ts'), { Track } = load('src/game/Track.ts');
  const audio = new Proxy({}, { get: () => noop }), combat = { spawnSparks: noop, spawnExplosion: noop, update: noop };
  const track = new Track(new THREE.Scene()), out = [];
  const mk = (id, isAI = false, model = 'falcon') => new Vehicle({ ...MACHINE_ROSTER[model], id, isAI, steeringProfile: 'C' }, track, combat, audio, new THREE.Scene());
  const input = v => ({ forward: false, backward: false, left: false, right: false, boost: false, sideAttack: 0, drift: false, tiltLeft: false, tiltRight: false, airbrakeLeft: false, airbrakeRight: false, ...v });
  // 1. pilotagem: acelerar, curvar, inclinar, drift, frear, boost, soltar
  const p = mk('player'); p.updateTransform?.(0, 0);
  const phases = [[240, { forward: true }], [120, { forward: true, right: true }], [120, { forward: true, tiltLeft: true, left: true }], [120, { forward: true, drift: true, right: true }], [60, { backward: true }], [10, { forward: true, boost: true }], [180, { forward: true }], [120, {}]];
  for (const [n, inp] of phases) { for (let i = 0; i < n; i++) p.update(1 / 120, input(inp)); out.push(snapshot(p)); }
  if (typeof p.triggerBoost === 'function') { p.triggerBoost(); for (let i = 0; i < 240; i++) p.update(1 / 120, input({ forward: true })); out.push(snapshot(p)); }
  // 2. combate: side-attack, spin-attack, contato contínuo
  const a = mk('player'), b = mk('rival');
  const g = Object.assign(Object.create(Game.prototype), { allVehicles: [a, b], player: a, rivals: [b], combat, audio, input: { ...input({}), consumeSideAttack: () => 0, consumeSpinAttack: () => false, reset: noop }, attackCooldowns: new Map(), finishTimes: new Map(), raceElapsed: 0, playerKills: 0, cameraShakeIntensity: 0, isCountingDown: false, isRaceFinished: false, updateCamera: noop });
  for (const v of [a, b]) { v.progressT = .1; v.speed = 300; v.updateTransform?.(0, 0); }
  b.lateralOffset = 2; b.updateTransform?.(0, 0);
  a.triggerSideAttack?.(1); for (let i = 0; i < 90; i++) { a.update(1 / 120, input({ forward: true })); b.update(1 / 120, input({ forward: true })); g.checkVehicleCollisions(1 / 120); }
  a.triggerSpinAttack?.(); for (let i = 0; i < 150; i++) { a.update(1 / 120, input({ forward: true })); b.update(1 / 120, input({ forward: true })); g.checkVehicleCollisions(1 / 120); }
  out.push(snapshot(a), snapshot(b));
  // 3. rivais com IA na pista real
  const ais = [mk('ai1', true, 'fox'), mk('ai2', true, 'goose')]; ais[0].progressT = .05; ais[1].progressT = .02;
  for (let i = 0; i < 720; i++) for (const v of ais) v.update(1 / 120, input({}));
  out.push(...ais.map(snapshot));
  // 4. câmera de perseguição (Game.updateCamera real)
  const cam = new THREE.PerspectiveCamera(65, 1, .1, 5000), c = mk('player'); c.progressT = .2; c.speed = 400; c.isBoosting = true; c.updateTransform?.(0, 0);
  const gc = Object.assign(Object.create(Game.prototype), { camera: cam, player: c, allVehicles: [c], rivals: [], cameraShakeIntensity: 1, track, isRaceFinished: false });
  try { for (let i = 0; i < 60; i++) { c.update(1 / 120, input({ forward: true, right: i > 30, drift: i > 40 })); c.isBoosting = true; gc.updateCamera(1 / 60); } out.push([cam.position.x, cam.position.y, cam.position.z, cam.fov, cam.up.x, cam.up.y, cam.quaternion.x, cam.quaternion.y, cam.quaternion.z, cam.quaternion.w, gc.cameraShakeIntensity].map(r)); }
  catch (e) { out.push(['camera-error', String(e.message).slice(0, 60)]); }
  // 5. sondas dirigidas: limites e temporizações que os cenários gerais não alcançam
  const lean = mk('player'); lean.speed = 300; lean.progressT = .1; lean.lateralVelocity = 60;            // inclinação extrema (limite de roll)
  for (let i = 0; i < 120; i++) lean.update(1 / 120, input({ forward: true, right: true, tiltRight: true })); out.push(snapshot(lean));
  const dt = mk('player'); dt.speed = 300; dt.progressT = .1;                                               // drift + inclinação (bônus de slide)
  for (let i = 0; i < 120; i++) dt.update(1 / 120, input({ forward: true, drift: true, right: true, tiltRight: true })); out.push(snapshot(dt));
  const slow = mk('player'); slow.speed = 17; slow.progressT = .1;                                          // drift em baixa velocidade (limiar)
  for (let i = 0; i < 30; i++) { slow.update(1 / 120, input({ drift: true, right: true })); out.push([r(slow.lateralVelocity), r(slow.speed)]); }
  const bo = mk('player'); bo.currentLap = 2; bo.progressT = .1; bo.speed = 300; bo.triggerBoost();          // duração do boost e recarga
  for (let i = 0; i < 480; i++) { bo.update(1 / 120, input({ forward: true, boost: i % 12 === 0 })); if (i % 24 === 0) out.push([bo.isBoosting ? 1 : 0, r(bo.boostDurationRemaining), r(bo.boostCooldownRemaining)]); }
  for (const [kind, offset] of [['side', 9.6], ['spin', 9.2]]) {                                            // alcance e recarga dos ataques
    const x = mk('player'), y = mk('rival'); x.progressT = y.progressT = .1; x.speed = y.speed = 200; y.lateralOffset = offset; x.updateTransform?.(0, 0); y.updateTransform?.(0, 0);
    const gg = Object.assign(Object.create(Game.prototype), { allVehicles: [x, y], player: x, rivals: [y], combat, audio, input: { ...input({}), consumeSideAttack: () => 0, consumeSpinAttack: () => false, reset: noop }, attackCooldowns: new Map(), finishTimes: new Map(), raceElapsed: 0, playerKills: 0, cameraShakeIntensity: 0, isCountingDown: false, isRaceFinished: false, updateCamera: noop });
    for (let i = 0; i < 160; i++) { if (i % 42 === 0) { y.lateralOffset = offset; y.lateralVelocity = 0; kind === 'side' ? x.triggerSideAttack?.(1) : x.triggerSpinAttack?.(); }
      x.update(1 / 120, input({ forward: true })); y.update(1 / 120, input({ forward: true })); gg.checkVehicleCollisions(1 / 120); }
    out.push([kind, r(y.shield), r(y.lateralVelocity), r(y.lateralOffset)]);
    const near = mk('player'), far = mk('rival'); near.progressT = far.progressT = .1; near.speed = far.speed = 200; far.lateralOffset = 1.5; near.updateTransform?.(0, 0); far.updateTransform?.(0, 0);
    const hits = [], g2 = Object.assign(Object.create(Game.prototype), { allVehicles: [near, far], player: near, rivals: [far], combat, audio, input: { ...input({}), consumeSideAttack: () => 0, consumeSpinAttack: () => false, reset: noop }, attackCooldowns: new Map(), finishTimes: new Map(), raceElapsed: 0, playerKills: 0, cameraShakeIntensity: 0, isCountingDown: false, isRaceFinished: false, updateCamera: noop });
    for (let i = 0; i < 160; i++) { far.lateralOffset = 1.5; far.lateralVelocity = 0; near.lateralOffset = 0; near.lateralVelocity = 0; if (i % 46 === 0) kind === 'side' ? near.triggerSideAttack?.(1) : near.triggerSpinAttack?.(); near.update(1 / 120, input({ forward: true })); far.update(1 / 120, input({ forward: true })); const before = far.shield; g2.checkVehicleCollisions(1 / 120); if (far.shield < before - 1) hits.push(i); }
    out.push([kind + '-cooldown', r(far.shield), ...hits]);   // instantes dos golpes, não só o escudo final
  }
  return JSON.stringify(out);
}
export function perturbed(id, value, limits) {
  // valor de teste: +37 % (ou +1 quando zero), mantido dentro dos limites do laboratório; se bater no teto, usa −37 %
  let v = value === 0 ? 1 : value * 1.37;
  if (limits && v > limits.max) v = value * 0.63;
  if (limits && v < limits.min) v = limits.min;
  return v;
}
export function classify() {
  const decl = declared(), conn = connected(), base = signature(null), mod = {};
  vm.runInNewContext(ts.transpileModule(rd('src/game/PhysicsCalibration.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: mod });
  const result = {};
  for (const id of decl) {
    const [g, f] = id.split('.'), value = mod.APPROVED_PHYSICS[g][f], up = value === 0 ? 1 : value * 1.37, down = value * 0.63;
    const changedUp = signature({ id, value: up }) !== base, changedDown = signature({ id, value: down }) !== base;
    result[id] = { connected: conn[id], functional: changedUp || changedDown, baseValue: value, testedValues: [r(up), r(down)], changedUp, changedDown };
  }
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const res = classify(), ids = Object.keys(res);
  const s = { total: ids.length, connected: ids.filter(i => res[i].connected).length, functional: ids.filter(i => res[i].functional).length,
    connectedNotFunctional: ids.filter(i => res[i].connected && !res[i].functional), notConnected: ids.filter(i => !res[i].connected), functionalNotConnected: ids.filter(i => !res[i].connected && res[i].functional) };
  console.log(JSON.stringify(s, null, 1));
  if (process.argv.includes('--write')) fs.writeFileSync(path.join(here, 'param-status.json'), JSON.stringify({ generatedBy: 'prototypes/pregame-options/classify-params.mjs', method: 'conectado = referência estática fora da calibração; funcional = a assinatura da simulação (pilotagem, combate, IA, câmera e sondas de limite/temporização) muda ao alterar o valor em +37 % ou −37 %. Não funcional = efeito não demonstrado por estes cenários.', params: res }, null, 1) + '\n');
}
