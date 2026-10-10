// Gera o bloco de dados do Protótipo 07 a partir das fontes do repositório (sem valores digitados à mão):
//  - perfil C: export do responsável (docs/decisions/2026-10-10-prototype-01-profile-c-export.json)
//  - perfis A e B, limites, passos e unidades: laboratório 01 (LIMITS / DEFAULTS)
//  - quais parâmetros entram: os 93 declarados em src/game/PhysicsCalibration.ts
//  - status de cada um: param-status.json (gerado por classify-params.mjs). Só os funcionais são configuráveis no menu.
// Uso: node prototypes/pregame-options/build-data.mjs [--check]
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, '../..');
const rd = p => fs.readFileSync(path.join(repo, p), 'utf8');

// Mapeamento explícito código (grupo.chave) → parâmetro do laboratório/export. '%' = export em porcentagem, jogo em fração.
export const MAP = {
 steering: { steerRate: 'steerRate', progressivity: 'progressivity', inertia: 'inertia', grip: 'grip%', recenter: 'recenter', speedInstability: 'speedInstability', speedInstabilityThreshold: 'speedInstabilityThreshold', highSpeedSteerDropoff: 'highSpeedSteerDropoff', lowSpeedSteerMultiplier: 'lowSpeedSteerMultiplier', counterSteerBoost: 'counterSteerBoost' },
 banking: { rollResponse: 'rollResponse', maxRollDegrees: 'maxRoll', tiltSteerBoost: 'tiltSteerBoost', bankTurnForce: 'bankTurnForce', bankDrag: 'bankDrag', strafeThrust: 'strafeThrust', quickStrafeImpulse: 'quickStrafeImpulse', rollReturnSpeed: 'rollReturnSpeed' },
 drift: { yawBoost: 'driftYawBoost', gripMultiplier: 'driftGripMultiplier%', brakeDeceleration: 'driftBrakeDecel', slideTurnBoost: 'slideTurnBoost', threshold: 'driftThreshold', counterSteerAuthority: 'driftCounterSteerAuthority', entrySlipKick: 'driftEntrySlipKick', maxAngleDegrees: 'driftMaxAngle', angularDamping: 'driftAngularDamping' },
 propulsion: { topSpeed: 'topSpeed', boostTopSpeed: 'boostTopSpeed', acceleration: 'acceleration', boostAcceleration: 'boostAccel', boostDuration: 'boostDuration', coastDeceleration: 'coastDecel', brakeForce: 'brakeForce', boostEnergyDrainRate: 'boostEnergyDrainRate', passiveRegenRate: 'passiveRegenRate', boostCooldown: 'boostCooldown' },
 combat: Object.fromEntries(['sideAttackForce', 'sideAttackDuration', 'sideAttackDamage', 'spinAttackDuration', 'spinAttackDamage', 'spinAttackForce', 'boostCost', 'sideAttackCost', 'spinAttackCost', 'sideAttackReach', 'spinAttackRadius', 'sideAttackCooldown', 'spinAttackCooldown', 'bodySlamImpactMultiplier'].map(k => [k, k])),
 hover: { height: 'hoverHeight', springStiffness: 'springStiffness', springDamping: 'springDamping', wakeAmplitude: 'wakeAmplitude', wakeFrequency: 'wakeFrequency', magneticGripStrength: 'magneticGripStrength' },
 flight: { pitchControlRate: 'airPitchControlRate', rollControlRate: 'airRollControlRate', steerAuthority: 'airSteerAuthority', glideLift: 'airGlideLift', glideDrag: 'airGlideDrag', diveAcceleration: 'airDiveAccel', diveMaxSpeed: 'airDiveMaxSpeed', airborneGravity: 'airborneGravity', airborneThreshold: 'airborneThreshold', landingBoostEfficiency: 'landingBoostEfficiency', landingBoostMax: 'landingBoostMax', landingImpactThreshold: 'landingImpactThreshold', landingPenaltyDamage: 'landingPenaltyDamage', landingPenaltyDeceleration: 'landingPenaltyDecel', airStrafeThrust: 'airStrafeThrust' },
 ai: { baseSpeed: 'aiBaseSpeed', aggressiveness: 'aiAggressiveness', rubberbanding: 'aiRubberbanding', laneChangeSpeed: 'aiLaneChangeSpeed', topSpeedCap: 'aiTopSpeedCap', boostFrequency: 'aiBoostFrequency', boostTopSpeed: 'aiBoostTopSpeed', boostAcceleration: 'aiBoostAccel', corneringGrip: 'aiCorneringGrip', brakingTendency: 'aiBrakingTendency', catchupAcceleration: 'aiCatchupAcceleration' },
 camera: { distance: 'cameraDistance', height: 'cameraHeight', fovFactor: 'cameraFOV', speedFov: 'cameraSpeedFOV', lag: 'cameraLag', lookahead: 'cameraLookahead', shakeDecay: 'cameraShakeDecay', rollFollow: 'cameraRollFollow', boostFovPulse: 'cameraBoostFOVPulse', driftSwing: 'cameraDriftSwing' }
};
export const GROUP_LABEL = { steering: 'Direção', banking: 'Inclinação & strafe', drift: 'Drift & slide', propulsion: 'Propulsão, boost & freios', combat: 'Combate', hover: 'Suspensão magnética', flight: 'Voo & pouso', ai: 'Rivais (IA)', camera: 'Câmera' };
// Proposta (não aprovada) do conjunto "básico" usado pela alternativa B. aiAggressiveness saiu: a IA atual não lê o valor.
export const BASIC = ['steerRate', 'grip', 'inertia', 'maxRoll', 'driftGripMultiplier', 'topSpeed', 'boostTopSpeed', 'acceleration', 'boostDuration', 'hoverHeight', 'cameraDistance'];
// Grupos cujo sistema ainda não existe no jogo (verificado: nenhuma física aérea/pouso em src/game fora da calibração).
export const FUTURE_SYSTEM = { flight: 'voo e pouso' };
export const STATUS = {
  functional: 'funcional — efeito demonstrado no jogo atual',
  'declared-only': 'sem efeito no jogo atual — existe só em PhysicsCalibration.ts (o sistema existe, mas não lê este valor)',
  'future-system': 'sem efeito no jogo atual — depende de sistema futuro'
};
export function statusOf(group, st) {
  if (!st) throw Error('sem classificação');
  if (st.functional) return 'functional';
  return FUTURE_SYSTEM[group] ? 'future-system' : 'declared-only';
}

export function buildData() {
  const html = rd('prototypes/01_steering_profiles.html');
  const grab = n => { const a = html.indexOf('const ' + n + ' = {'), b = html.indexOf('\n};', a); return vm.runInNewContext('(' + html.slice(html.indexOf('{', a), b + 2) + ')'); };
  const LIMITS = grab('LIMITS'), DEFAULTS = grab('DEFAULTS');
  const exportC = JSON.parse(rd('docs/decisions/2026-10-10-prototype-01-profile-c-export.json'));
  const mod = {}; vm.runInNewContext(ts.transpileModule(rd('src/game/PhysicsCalibration.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: mod });
  const game = mod.APPROVED_PHYSICS, params = [], status = JSON.parse(rd('prototypes/pregame-options/param-status.json')).params;
  for (const [group, obj] of Object.entries(game)) for (const [field, gameValue] of Object.entries(obj)) {
    const m = MAP[group]?.[field]; if (!m) throw Error('sem mapeamento: ' + group + '.' + field);
    const percent = m.endsWith('%'), key = percent ? m.slice(0, -1) : m, lim = LIMITS[key], ex = exportC.params[key];
    if (!lim || !ex) throw Error('fonte ausente para ' + key);
    params.push({ group, field, key, label: lim[3], unit: lim[4], min: lim[0], max: lim[1], step: lim[2], toGame: percent ? 0.01 : 1,
      profiles: { A: DEFAULTS.A[key], B: DEFAULTS.B[key], C: ex.value },
      ambiguous: ex.precisionAmbiguous, candidates: ex.gridCandidates, exportedText: ex.exportedText, gameToday: gameValue, basic: BASIC.includes(key),
      status: statusOf(group, status[group + '.' + field]), connected: status[group + '.' + field].connected });
  }
  for (const k of Object.keys(MAP)) for (const f of Object.keys(MAP[k])) if (!(f in game[k])) throw Error('mapeamento sem campo no jogo: ' + k + '.' + f);
  for (const k of BASIC) if (params.find(p => p.key === k)?.status !== 'functional') throw Error('básico sem efeito no jogo: ' + k);
  return { source: { exportC: 'docs/decisions/2026-10-10-prototype-01-profile-c-export.json', lab: 'prototypes/01_steering_profiles.html', game: 'src/game/PhysicsCalibration.ts', status: 'prototypes/pregame-options/param-status.json' },
    groups: GROUP_LABEL, futureSystem: FUTURE_SYSTEM, statusLabel: STATUS, params };
}

const BEGIN = '/* @p07-data:begin */', END = '/* @p07-data:end */';
export function embedded(text) { const a = text.indexOf(BEGIN), b = text.indexOf(END); return a < 0 || b < a ? null : text.slice(a + BEGIN.length, b); }
export function render(data) { return '\nconst P07_DATA=' + JSON.stringify(data) + ';\n'; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = path.join(repo, 'prototypes/07_pregame_physics_options.html'), html = fs.readFileSync(file, 'utf8'), block = render(buildData());
  if (process.argv.includes('--check')) { if (embedded(html) !== block) { console.error('Dados embutidos divergem das fontes.'); process.exit(1); } console.log('Dados embutidos conferem com as fontes.'); }
  else { const a = html.indexOf(BEGIN), b = html.indexOf(END); fs.writeFileSync(file, html.slice(0, a + BEGIN.length) + block + html.slice(b)); console.log('Dados atualizados: ' + buildData().params.length + ' parâmetros.'); }
}
