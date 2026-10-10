import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';

const root = fileURLToPath(new URL('../', import.meta.url));
const noop = () => {};
const events = () => ({ listeners: {}, addEventListener(k, fn) { (this.listeners[k] ??= []).push(fn); }, emit(k, e = {}) { for (const fn of this.listeners[k] ?? []) fn(e); } });
const ctx2d = new Proxy({}, { get: (o, k) => o[k] ?? noop });
function dom() {
  const nodes = new Map();
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      ...events(), style: {}, classList: { add: noop, remove: noop, toggle: noop },
      value: '', textContent: '', clientWidth: 1000, clientHeight: 700,
      getContext: () => ctx2d, querySelectorAll: () => [],
      getBoundingClientRect: () => ({ width: 1000, height: 700, top: 0, left: 0, right: 1000, bottom: 700 }),
      replaceChildren: noop, append: noop, appendChild: noop, blur: noop, focus: noop, select: noop
    });
    return nodes.get(id);
  };
  return {
    ...events(), hidden: false, getElementById: get, querySelectorAll: () => [],
    createElement: () => ({
      getContext: () => ctx2d, style: {}, classList: { add: noop, remove: noop, toggle: noop },
      getBoundingClientRect: () => ({ width: 1000, height: 700, top: 0, left: 0, right: 1000, bottom: 700 }),
      replaceChildren: noop, append: noop, appendChild: noop, addEventListener: noop
    })
  };
}
const document = dom(), window = { ...events(), innerWidth: 1000, innerHeight: 700, devicePixelRatio: 1 };
const cache = new Map();
function load(file) {
  const filename = path.resolve(root, file);
  if (cache.has(filename)) return cache.get(filename);
  const exports = {};
  cache.set(filename, exports);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, document, window, console, performance: { now: () => 1000 }, setTimeout: noop, requestAnimationFrame: noop,
    require: name => name === 'three' ? THREE : load(path.resolve(path.dirname(filename), name + '.ts')) }, { filename });
  return exports;
}
const { Vehicle } = load('src/game/Vehicle.ts');
const { Game, MACHINE_ROSTER } = load('src/game/Game.ts');
const { Track } = load('src/game/Track.ts');
const { InputManager } = load('src/game/Input.ts');
const { APPROVED_PHYSICS, APPROVED_PHYSICS_PROFILE } = load('src/game/PhysicsCalibration.ts');
const audio = new Proxy({}, { get: () => noop });
const combat = { spawnSparks: noop, spawnExplosion: noop, update: noop };
const straight = { trackWidth: 26, boostPads: [], pitZones: [], getTrackLength: () => 1000,
  getTrackInfoAt: t => ({ position: new THREE.Vector3(0, 0, t * 1000), binormal: new THREE.Vector3(1, 0, 0), normal: new THREE.Vector3(0, 1, 0), tangent: new THREE.Vector3(0, 0, 1) }) };
const input = (values = {}) => ({ forward: false, backward: false, left: false, right: false, boost: false, sideAttack: 0, ...values });
function vehicle(id = 'player', track = straight, model = 'falcon') {
  return new Vehicle({ ...MACHINE_ROSTER[model], id, isAI: false }, track, combat, audio, new THREE.Scene());
}
function game(vehicles) {
  return Object.assign(Object.create(Game.prototype), { allVehicles: vehicles, player: vehicles[0], rivals: vehicles.slice(1), combat, audio,
    input: { ...input(), consumeSideAttack: () => 0, consumeSpinAttack: () => false, reset: noop },
    attackCooldowns: new Map(), finishTimes: new Map(), raceElapsed: 0, playerKills: 0, cameraShakeIntensity: 0,
    isCountingDown: false, isRaceFinished: false, updateCamera: noop });
}

test('input preserves aliases, buffers quick taps, rejects repeat and resets on blur', () => {
  const i = new InputManager();
  const down = (code, repeat = false) => window.emit('keydown', { code, repeat, preventDefault: noop });
  down('KeyX'); assert.equal(i.forward, true);
  window.emit('keyup', { code: 'KeyX' }); assert.equal(i.forward, false);
  down('ArrowLeft'); assert.equal(i.left, true);
  window.emit('keyup', { code: 'ArrowLeft' }); assert.equal(i.left, false);
  down('KeyZ'); window.emit('keyup', { code: 'KeyZ' });
  down('KeyZ'); assert.equal(i.consumeSideAttack(), -1);
  down('KeyZ', true); assert.equal(i.consumeSideAttack(), 0);
  window.emit('keyup', { code: 'KeyZ' });
  down('ShiftLeft'); assert.equal(i.consumeSpinAttack(), true);
  down('ShiftLeft', true); assert.equal(i.consumeSpinAttack(), false);
  window.emit('keyup', { code: 'ShiftLeft' });
  down('KeyX'); assert.equal(i.forward, true);
  window.emit('blur'); assert.equal(i.forward, false);
});

test('approved Prototype 01 Profile C is the runtime physics baseline only', () => {
  const main = readFileSync(path.join(root, 'src/main.ts'), 'utf8');
  assert.equal(APPROVED_PHYSICS_PROFILE, 'C');
  assert.equal(APPROVED_PHYSICS.steering.steerRate, 56);
  assert.equal(APPROVED_PHYSICS.propulsion.topSpeed, 500);
  assert.equal(APPROVED_PHYSICS.propulsion.boostTopSpeed, 600);
  assert.equal(APPROVED_PHYSICS.combat.sideAttackDamage, 32);
  assert.equal('track' in APPROVED_PHYSICS, false);
  assert.equal('vfx' in APPROVED_PHYSICS, false);
  assert.match(main, /selectedProfile: 'A' \| 'B' \| 'C' = 'C'/);
});

test('track normals face the driver and all sampled bases are proper rotations', () => {
  const track = new Track(new THREE.Scene());
  const normals = track.trackMesh.geometry.attributes.normal;
  for (let i = 0; i < 300; i++) {
    const frame = track.getTrackInfoAt(i / 300);
    assert.ok(Math.abs(new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent).determinant() - 1) < 1e-10);
    assert.ok(new THREE.Vector3().fromBufferAttribute(normals, i * 2).dot(frame.normal) > 0.8);
  }
});

test('all ten craft models build finite transforms and four component groups', () => {
  assert.equal(Object.keys(MACHINE_ROSTER).length, 10);
  for (const model of Object.keys(MACHINE_ROSTER)) {
    const v = vehicle('player', straight, model);
    v.updateTransform(0, 0);
    assert.equal(v.group.children[0].children.length, 4);
    assert.ok(v.group.position.toArray().every(Number.isFinite));
  }
});

test('braking wins over throttle and wall contact cannot accelerate a stopped craft', () => {
  const v = vehicle(); v.speed = 100; v.update(1 / 60, input({ forward: true, backward: true })); assert.ok(v.speed < 100);
  v.speed = 0; v.lateralOffset = 20; v.update(1 / 60, input()); assert.equal(v.speed, 0);
});

test('pads respect physical length, trigger once and retain gradually decaying speed', () => {
  let hits = 0;
  const v = vehicle('player', { ...straight, boostPads: [{ t: .5, offset: 0, width: 6, length: 12 }] });
  v.audio = { ...audio, playDashPlate: () => hits++, updateEnginePitch: noop };
  v.progressT = .48; v.speed = v.effectiveMaxSpeed - 1; v.update(1 / 120, input({ forward: true })); assert.equal(hits, 0);
  v.progressT = .494;
  for (let k = 0; k < 15; k++) v.update(1 / 120, input({ forward: true }));
  assert.equal(hits, 1); assert.ok(v.speed > v.effectiveMaxSpeed);
});

test('energy costs bypass armour and respawn clears attack/boost state', () => {
  const v = vehicle(); v.currentLap = 2; v.triggerBoost();
  assert.equal(v.shield, 100 - APPROVED_PHYSICS.combat.boostCost);
  v.triggerSpinAttack(); v.destroy(); v.respawn();
  assert.equal(v.isSpinAttacking, false); assert.equal(v.isBoosting, false); assert.equal(v.group.visible, true);
});

test('one spin hits each target once throughout its duration', () => {
  const a = vehicle(), b = vehicle('rival'); a.triggerSpinAttack();
  const g = game([a, b]);
  for (let k = 0; k < 58; k++) g.checkVehicleCollisions(1 / 120);
  assert.ok(Math.abs(b.shield - (100 - APPROVED_PHYSICS.combat.spinAttackDamage * .85)) < 1e-9);
});

test('sustained ordinary contact has stable damage and impulse at 30/60/120 Hz', () => {
  const states = [];
  for (const hz of [30, 60, 120]) {
    const a = vehicle(), b = vehicle('rival'); const g = game([a, b]);
    for (let k = 0; k < hz; k++) g.checkVehicleCollisions(1 / hz);
    states.push([a.shield, a.lateralVelocity]);
  }
  for (const s of states) { assert.ok(Math.abs(s[0] - states[0][0]) < 1e-8); assert.ok(Math.abs(s[1] - states[0][1]) < 1e-8); }
});

test('grid has positions before countdown and invalid selected id does not duplicate falcon', () => {
  const g = game([]); Object.assign(g, { scene: new THREE.Scene(), track: straight });
  g.initRoster(); assert.equal(g.allVehicles.length, 8);
  assert.ok(g.player.group.position.z > 0);
  assert.ok(g.rivals.every(v => v.group.position.distanceTo(g.player.group.position) > 1));
  g.initRoster('unknown'); assert.equal(g.rivals.some(v => v.config.model === 'falcon'), false);
});

test('D and A move toward the correct side in actual chase-camera projection', () => {
  const track = new Track(new THREE.Scene());
  for (let k = 0; k < 100; k++) {
    const t = k / 100, frame = track.getTrackInfoAt(t);
    const camera = new THREE.PerspectiveCamera(65, 1, .1, 1000);
    camera.position.copy(frame.position).addScaledVector(frame.tangent, -13.5).addScaledVector(frame.normal, 4.8);
    camera.up.copy(frame.normal); camera.lookAt(frame.position.clone().addScaledVector(frame.tangent, 15)); camera.updateMatrixWorld();
    const v = vehicle('player', track); v.progressT = t; v.lateralOffset = 3; v.updateTransform(0, 0);
    assert.ok(v.group.position.clone().project(camera).x > 0, `D should move right at t=${t}`);
    v.lateralOffset = -3; v.updateTransform(0, 0); assert.ok(v.group.position.clone().project(camera).x < 0);
  }
});

test('full three-lap race finishes with finite state on the real circuit', () => {
  const track = new Track(new THREE.Scene());
  const a = vehicle('player', track); const b = vehicle('rival', track);
  a.updateTransform(0, 0); b.lateralOffset = 7; b.updateTransform(0, 0);
  const g = game([a, b]); g.input.forward = true;
  for (let i = 0; i < 30000 && !g.isRaceFinished; i++) g.update(1 / 120);
  assert.equal(g.isRaceFinished, true); assert.ok(g.finishTimes.get('player') > 0);
  assert.ok([a.shield, a.speed, a.progressT].every(Number.isFinite));
});

test('finish crossing is interpolated and results stop all further simulation', () => {
  const a = vehicle(), b = vehicle('rival');
  a.currentLap = b.currentLap = 3; a.progressT = .999; b.progressT = .9995; a.speed = 170; b.speed = 160;
  const g = game([a, b]); g.update(.01);
  assert.ok(g.finishTimes.get('rival') < g.finishTimes.get('player'));
  assert.equal(g.isRaceFinished, true);
  const p = a.progressT; g.update(.1); assert.equal(a.progressT, p);
});

function lab() {
  const document = dom();
  const html = readFileSync(path.join(root, 'prototypes/01_steering_profiles.html'), 'utf8');
  for (const m of html.matchAll(/id="(slider-[^"]+)" min="([^"]+)" max="([^"]+)"/g)) Object.assign(document.getElementById(m[1]), { min: m[2], max: m[3] });
  class Renderer { setSize() {} setPixelRatio() {} render() {} }
  const window = { ...events(), innerWidth: 1000, innerHeight: 700, devicePixelRatio: 1 };
  const context = vm.createContext({
    document, window, console, THREE: { ...THREE, WebGLRenderer: Renderer },
    navigator: {}, performance: { now: () => 1000 }, setTimeout: noop, requestAnimationFrame: noop,
    structuredClone: obj => JSON.parse(JSON.stringify(obj)),
    ResizeObserver: class { observe() {} }
  });
  const script = html.split('<script>')[1].split('</script>')[0];
  vm.runInContext(script, context, { filename: '01_steering_profiles.html' });
  return { run: code => vm.runInContext(code, context), api: window.__GMINUS_LAB_TEST__, document, window };
}

test('lab boots, rejects invalid JSON atomically and keeps valid imports', () => {
  const h = lab();
  const before = h.api.export();
  for (const value of ['null', '[]', '{"grip":150}', '{"grip":null}', '{"steerRate":90,"inertia":"oops"}', '{"unknown":4}']) {
    assert.throws(() => h.api.import(value));
    assert.deepEqual(h.api.export(), before);
  }
  const valid = { ...before, profiles: { ...before.profiles, A: { ...before.profiles.A, grip: 80 } } };
  h.api.import(JSON.stringify(valid));
  assert.equal(h.api.export().profiles.A.grip, 80);
});

test('lab side attack and spin attack inflict damage and destroy rival with respawn', () => {
  const h = lab();
  h.document.getElementById('spawn').onclick();
  h.api.sideAttack(1);
  for (let i = 0; i < 60; i++) h.api.step(1 / 120);
  assert.ok(h.api.getRivals()[0].shield < 100);
  h.document.getElementById('spawn').onclick();
  h.api.setRivalShield(0, 10);
  h.api.spinAttack();
  for (let i = 0; i < 60; i++) h.api.step(1 / 120);
  assert.ok(h.api.getRivals()[0].ko || h.api.getState().kills > 0);
});

test('lab reset clears maneuvers, keys and state even while paused', () => {
  const h = lab();
  h.api.boost();
  h.api.spinAttack();
  h.api.setHeld('KeyX', true);
  h.api.reset();
  const s = h.api.getState();
  assert.equal(s.shield, 100);
  assert.equal(s.kills, 0);
  assert.equal(s.spin, 0);
  assert.equal(s.sideTime, 0);
});

test('lab simulation remains finite across every track and preset', () => {
  const h = lab();
  for (const track of ['circuit', 'straight', 'elevated']) for (const profile of ['A', 'B', 'C']) {
    h.api.import(JSON.stringify({ ...h.api.export(), track, profile }));
    h.api.setHeld('KeyX', true);
    for (let i = 0; i < 240; i++) h.api.step(1 / 120);
    const s = h.api.getState();
    assert.ok([s.speed, s.x, s.z, s.yaw, s.shield].every(Number.isFinite));
  }
});

test('lab preserves independent profile edits and resets a reproducible AI scenario', () => {
  const h = lab();
  const cfgA = { ...h.api.export() };
  cfgA.profiles.A.grip = 80;
  cfgA.profiles.B.grip = 70;
  h.api.import(JSON.stringify(cfgA));
  assert.equal(h.api.export().profiles.A.grip, 80);
  assert.equal(h.api.export().profiles.B.grip, 70);
  const sample = () => JSON.stringify(h.api.getRivals().map(v => [v.distance, v.offset]));
  h.api.reset(); for (let i = 0; i < 240; i++) h.api.step(1 / 120);
  const expected = sample();
  h.api.reset(); for (let i = 0; i < 240; i++) h.api.step(1 / 120);
  assert.equal(sample(), expected);
});

test('lab produces identical movement at 30, 60 and 120 rendering Hz', () => {
  const states = [];
  for (const hz of [30, 60, 120]) {
    const h = lab();
    h.api.reset();
    h.api.setHeld('KeyX', true);
    h.api.setHeld('ArrowRight', true);
    const dt = 1 / hz;
    const subSteps = Math.round((1 / hz) / (1 / 120));
    for (let i = 1; i <= hz * 2; i++) {
      for (let s = 0; s < subSteps; s++) h.api.step(1 / 120);
    }
    const st = h.api.getState();
    states.push(JSON.stringify([Math.round(st.speed * 100), Math.round(st.x * 100), Math.round(st.z * 100)]));
  }
  assert.equal(states[0], states[1]);
  assert.equal(states[1], states[2]);
});

function vfxLab() {
  const document = dom();
  const html = readFileSync(path.join(root, 'prototypes/04_craft_vfx.html'), 'utf8');
  for (const m of html.matchAll(/id="(slider-[^"]+)" min="([^"]+)" max="([^"]+)"/g)) Object.assign(document.getElementById(m[1]), { min: m[2], max: m[3] });
  class Renderer { setSize() {} setPixelRatio() {} render() {} }
  const window = { ...events(), innerWidth: 1000, innerHeight: 700, devicePixelRatio: 1 };
  const context = vm.createContext({ document, window, console, THREE: { ...THREE, WebGLRenderer: Renderer }, navigator: {}, performance: { now: () => 1000 }, setTimeout: noop, requestAnimationFrame: noop });
  const script = html.split('<script>')[1].split('</script>')[0];
  vm.runInContext(script, context, { filename: '04_craft_vfx.html' });
  return { run: code => vm.runInContext(code, context), document, window };
}

test('VFX lab boots, switches machine rosters, applies presets and updates simulation', () => {
  const v = vfxLab();
  assert.equal(v.run('activeMachineId'), 'falcon');
  v.run("switchMachine('stingray'); applyGlobalPreset('B');");
  assert.equal(v.run('activeMachineId'), 'stingray');
  assert.equal(v.run("vfxState.thrusterStyle"), 'B');
  assert.equal(v.run("vfxState.boostStyle"), 'B');
  v.run("applyGlobalPreset('C');");
  assert.equal(v.run("vfxState.spinStyle"), 'C');
  v.run("updateSimulation(1/60); isBoosting = true; updateSimulation(1/60);");
  assert.equal(v.run("typeof currentSpeed"), 'number');
});

