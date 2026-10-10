# Reconciliação do export do Perfil C (Protótipo 01) — 10/10/2026

**Situação:** auditoria. **Nenhum valor de jogo, laboratório ou documento de aprovação foi alterado.** As correções dependem de decisão do responsável (seção 6).

## 1. Fonte

O responsável forneceu, nesta data, o export textual do laboratório 01 com **207 parâmetros** do Perfil C (Inercial / Drift), pista ativa `OBSTACLE_SPRINT`.

| Arquivo | Conteúdo |
| :--- | :--- |
| [`docs/decisions/2026-10-10-prototype-01-profile-c-export-original.txt`](../decisions/2026-10-10-prototype-01-profile-c-export-original.txt) | Texto original, preservado como recebido |
| [`docs/decisions/2026-10-10-prototype-01-profile-c-export.json`](../decisions/2026-10-10-prototype-01-profile-c-export.json) | Conversão mecânica linha a linha. Para cada parâmetro: valor exibido, unidade, rótulo, seção, texto exportado, valores possíveis do slider e marcação de ambiguidade |

**Validação do parse:** 207 linhas reconhecidas, 207 chaves únicas, 12 seções, todos os valores finitos. Todos os valores estão dentro dos limites dos sliders do laboratório.

## 2. Limitação do próprio export (perda de precisão)

O botão de exportação em texto do laboratório usa `fmtParam`, que formata assim:

- passo 0,05: **1 casa decimal**;
- passo menor que 0,05: 2 casas;
- passo inteiro: 0 casas.

Consequência: em **51 parâmetros** o texto mostra menos casas do que o slider permite. Por exemplo, 0,35 aparece como "0.3" e 0,45 como "0.5". Em **41** deles, mais de um valor do slider gera exatamente o mesmo texto, de modo que o valor exato **não pode ser determinado só pelo texto**.

### 2.1 Parâmetros ambíguos (41)

| Parâmetro | Texto exportado | Valores possíveis no slider | Padrão C do laboratório |
| :--- | :--- | :--- | ---: |
| `speedInstability` | 0.6 × | 0.55 · 0.6 | 0.6 |
| `counterSteerBoost` | 1.8 × | 1.75 · 1.8 | 1.8 |
| `lowSpeedSteerMultiplier` | 1.3 × | 1.25 · 1.3 | 1.3 |
| `analogSteerGamma` | 1.1 × | 1.05 · 1.1 · 1.15 | 1.1 |
| `tiltSteerBoost` | 2.5 × | 2.45 · 2.5 · 2.55 | 2.5 |
| `bankPitchCoupling` | 0.3 × | 0.25 · 0.3 · 0.35 | 0.35 |
| `tiltSlideAssistance` | 0.5 × | 0.45 · 0.5 | 0.45 |
| `driftYawBoost` | 1.9 × | 1.85 · 1.9 · 1.95 | 1.9 |
| `slideTurnBoost` | 1.6 × | 1.55 · 1.6 · 1.65 | 1.6 |
| `driftCounterSteerAuthority` | 1.6 × | 1.55 · 1.6 · 1.65 | 1.6 |
| `driftSparksIntensity` | 1.6 × | 1.55 · 1.6 · 1.65 | 1.6 |
| `airbrakeDragMultiplier` | 1.4 × | 1.35 · 1.4 · 1.45 | 1.4 |
| `sideAttackCooldown` | 0.3 s | 0.25 · 0.3 · 0.35 | 0.35 |
| `spinAttackCooldown` | 0.6 s | 0.55 · 0.6 | 0.6 |
| `bodySlamImpactMultiplier` | 1.3 × | 1.25 · 1.3 | 1.25 |
| `magneticGripStrength` | 1.4 × | 1.35 · 1.4 · 1.45 | 1.35 |
| `airSteerAuthority` | 1.1 × | 1.05 · 1.1 · 1.15 | 1.1 |
| `airDrag` | 0.7 u | 0.65 · 0.7 | 0.65 |
| `landingBoostEfficiency` | 0.9 × | 0.9 · 0.95 | 0.9 |
| `landingImpactThreshold` | 0.5 rad | 0.45 · 0.5 | 0.5 |
| `jumpRampLaunchForce` | 1.3 × | 1.25 · 1.3 | 1.3 |
| `aiDashPlateAffinity` | 0.8 × | 0.75 · 0.8 · 0.85 | 0.85 |
| `aiSlipstreamUsage` | 1.3 × | 1.25 · 1.3 | 1.25 |
| `aiCorneringGrip` | 1.3 × | 1.25 · 1.3 | 1.3 |
| `aiBrakingTendency` | 0.3 × | 0.25 · 0.3 · 0.35 | 0.25 |
| `aiAirPitchControl` | 1.1 × | 1.05 · 1.1 · 1.15 | 1.1 |
| `aiDiveBoostSkill` | 0.6 × | 0.55 · 0.6 | 0.6 |
| `cameraOrbitSpeed` | 0.3 u | 0.25 · 0.3 · 0.35 | 0.35 |
| `cameraLandingDip` | 1.1 m | 1.05 · 1.1 · 1.15 | 1.1 |
| `cameraRollFollow` | 0.5 × | 0.45 · 0.5 | 0.45 |
| `cameraDriftSwing` | 0.6 × | 0.55 · 0.6 | 0.6 |
| `trackWidthScale` | 0.8 × | 0.75 · 0.8 · 0.85 | 0.8 |
| `barrierBounce` | 1.6 × | 1.55 · 1.6 · 1.65 | 1.6 |
| `barrierDamageScale` | 0.9 × | 0.9 · 0.95 | 0.9 |
| `trackBankCurvature` | 0.7 × | 0.65 · 0.7 | 0.65 |
| `particleLifespan` | 1.1 s | 1.05 · 1.1 · 1.15 | 1.1 |
| `buildingWindowGlow` | 0.8 × | 0.75 · 0.8 · 0.85 | 0.85 |
| `airborneTrailOpacity` | 0.6 × | 0.55 · 0.6 | 0.6 |
| `diveTrailColorShift` | 0.5 × | 0.45 · 0.5 | 0.5 |
| `chassisReflectivity` | 0.8 × | 0.75 · 0.8 · 0.85 | 0.75 |
| `hudGlitchIntensity` | 0.3 × | 0.25 · 0.3 · 0.35 | 0.35 |

## 3. Comparação com o laboratório 01 (`DEFAULTS.C`)

- **204 de 207** valores do export são consistentes com os padrões do Perfil C do laboratório, considerando o arredondamento da seção 2.
- **3 valores diferem dos padrões** e correspondem a alterações feitas pelo responsável:

| Parâmetro | Export | Padrão C do laboratório |
| :--- | ---: | ---: |
| `maxRoll` | 34 ° | 75 |
| `topSpeed` | 500 u | 300 |
| `boostTopSpeed` | 600 u | 400 |

Interpretação: em todos os 41 parâmetros ambíguos, o padrão C do laboratório está entre os valores possíveis. Isso é **compatível** com o responsável não ter alterado esses parâmetros, mas **não prova**: ele pode ter movido um slider para um valor vizinho que gera o mesmo texto.

## 4. Comparação com `src/game/PhysicsCalibration.ts` (primeira integração, 93 parâmetros)

O mapeamento de nomes entre o código e o export é explícito e está listado abaixo (93 pares). Exemplos: `drift.yawBoost` ↔ `driftYawBoost`; `ai.baseSpeed` ↔ `aiBaseSpeed`; `grip` 0,68 ↔ 68 %. Todos os 93 parâmetros foram mapeados: **81 coincidem e 12 divergem**.

| `PhysicsCalibration.ts` | Parâmetro do export | Valor no código | Valor no export |
| :--- | :--- | ---: | ---: |
| `steering.steerRate` | `steerRate` | 56 | 89 |
| `banking.maxRollDegrees` | `maxRoll` | 75 | 34 |
| `combat.spinAttackDuration` | `spinAttackDuration` | 0.5 | 0.84 |
| `hover.height` | `hoverHeight` | 2.8 | 2.1 |
| `ai.baseSpeed` | `aiBaseSpeed` | 350 | 220 |
| `ai.aggressiveness` | `aiAggressiveness` | 1.8 | 1.4 |
| `ai.rubberbanding` | `aiRubberbanding` | 1.8 | 1 |
| `ai.laneChangeSpeed` | `aiLaneChangeSpeed` | 1.7 | 1.2 |
| `ai.topSpeedCap` | `aiTopSpeedCap` | 550 | 450 |
| `ai.boostFrequency` | `aiBoostFrequency` | 0.6 | 0.4 |
| `ai.boostTopSpeed` | `aiBoostTopSpeed` | 550 | 480 |
| `camera.distance` | `cameraDistance` | 15 | 9.5 |

Observações:
- `maxRollDegrees` 75 é o **padrão do laboratório**, não o valor alterado pelo responsável (34).
- Os outros 11 (`steerRate` 56, `spinAttackDuration` 0,5, `hover.height` 2,8, sete valores da IA e `camera.distance` 15) **não coincidem nem com o export nem com o padrão do laboratório**. Nenhum documento do repositório explica essas diferenças (conversão de unidade, ajuste ao jogo ou erro).

<details><summary>Mapeamento completo código ↔ export (93)</summary>

| Código | Export | Conversão |
| :--- | :--- | :--- |
| `steering.steerRate` | `steerRate` | — |
| `steering.progressivity` | `progressivity` | — |
| `steering.inertia` | `inertia` | — |
| `steering.grip` | `grip` | export em % ÷ 100 |
| `steering.recenter` | `recenter` | — |
| `steering.speedInstability` | `speedInstability` | — |
| `steering.speedInstabilityThreshold` | `speedInstabilityThreshold` | — |
| `steering.highSpeedSteerDropoff` | `highSpeedSteerDropoff` | — |
| `steering.lowSpeedSteerMultiplier` | `lowSpeedSteerMultiplier` | — |
| `steering.counterSteerBoost` | `counterSteerBoost` | — |
| `banking.rollResponse` | `rollResponse` | — |
| `banking.maxRollDegrees` | `maxRoll` | — |
| `banking.tiltSteerBoost` | `tiltSteerBoost` | — |
| `banking.bankTurnForce` | `bankTurnForce` | — |
| `banking.bankDrag` | `bankDrag` | — |
| `banking.strafeThrust` | `strafeThrust` | — |
| `banking.quickStrafeImpulse` | `quickStrafeImpulse` | — |
| `banking.rollReturnSpeed` | `rollReturnSpeed` | — |
| `drift.yawBoost` | `driftYawBoost` | — |
| `drift.gripMultiplier` | `driftGripMultiplier` | export em % ÷ 100 |
| `drift.brakeDeceleration` | `driftBrakeDecel` | — |
| `drift.slideTurnBoost` | `slideTurnBoost` | — |
| `drift.threshold` | `driftThreshold` | — |
| `drift.counterSteerAuthority` | `driftCounterSteerAuthority` | — |
| `drift.entrySlipKick` | `driftEntrySlipKick` | — |
| `drift.maxAngleDegrees` | `driftMaxAngle` | — |
| `drift.angularDamping` | `driftAngularDamping` | — |
| `propulsion.topSpeed` | `topSpeed` | — |
| `propulsion.boostTopSpeed` | `boostTopSpeed` | — |
| `propulsion.acceleration` | `acceleration` | — |
| `propulsion.boostAcceleration` | `boostAccel` | — |
| `propulsion.boostDuration` | `boostDuration` | — |
| `propulsion.coastDeceleration` | `coastDecel` | — |
| `propulsion.brakeForce` | `brakeForce` | — |
| `propulsion.boostEnergyDrainRate` | `boostEnergyDrainRate` | — |
| `propulsion.passiveRegenRate` | `passiveRegenRate` | — |
| `propulsion.boostCooldown` | `boostCooldown` | — |
| `combat.sideAttackForce` | `sideAttackForce` | — |
| `combat.sideAttackDuration` | `sideAttackDuration` | — |
| `combat.sideAttackDamage` | `sideAttackDamage` | — |
| `combat.spinAttackDuration` | `spinAttackDuration` | — |
| `combat.spinAttackDamage` | `spinAttackDamage` | — |
| `combat.spinAttackForce` | `spinAttackForce` | — |
| `combat.boostCost` | `boostCost` | — |
| `combat.sideAttackCost` | `sideAttackCost` | — |
| `combat.spinAttackCost` | `spinAttackCost` | — |
| `combat.sideAttackReach` | `sideAttackReach` | — |
| `combat.spinAttackRadius` | `spinAttackRadius` | — |
| `combat.sideAttackCooldown` | `sideAttackCooldown` | — |
| `combat.spinAttackCooldown` | `spinAttackCooldown` | — |
| `combat.bodySlamImpactMultiplier` | `bodySlamImpactMultiplier` | — |
| `hover.height` | `hoverHeight` | — |
| `hover.springStiffness` | `springStiffness` | — |
| `hover.springDamping` | `springDamping` | — |
| `hover.wakeAmplitude` | `wakeAmplitude` | — |
| `hover.wakeFrequency` | `wakeFrequency` | — |
| `hover.magneticGripStrength` | `magneticGripStrength` | — |
| `flight.pitchControlRate` | `airPitchControlRate` | — |
| `flight.rollControlRate` | `airRollControlRate` | — |
| `flight.steerAuthority` | `airSteerAuthority` | — |
| `flight.glideLift` | `airGlideLift` | — |
| `flight.glideDrag` | `airGlideDrag` | — |
| `flight.diveAcceleration` | `airDiveAccel` | — |
| `flight.diveMaxSpeed` | `airDiveMaxSpeed` | — |
| `flight.airborneGravity` | `airborneGravity` | — |
| `flight.airborneThreshold` | `airborneThreshold` | — |
| `flight.landingBoostEfficiency` | `landingBoostEfficiency` | — |
| `flight.landingBoostMax` | `landingBoostMax` | — |
| `flight.landingImpactThreshold` | `landingImpactThreshold` | — |
| `flight.landingPenaltyDamage` | `landingPenaltyDamage` | — |
| `flight.landingPenaltyDeceleration` | `landingPenaltyDecel` | — |
| `flight.airStrafeThrust` | `airStrafeThrust` | — |
| `ai.baseSpeed` | `aiBaseSpeed` | — |
| `ai.aggressiveness` | `aiAggressiveness` | — |
| `ai.rubberbanding` | `aiRubberbanding` | — |
| `ai.laneChangeSpeed` | `aiLaneChangeSpeed` | — |
| `ai.topSpeedCap` | `aiTopSpeedCap` | — |
| `ai.boostFrequency` | `aiBoostFrequency` | — |
| `ai.boostTopSpeed` | `aiBoostTopSpeed` | — |
| `ai.boostAcceleration` | `aiBoostAccel` | — |
| `ai.corneringGrip` | `aiCorneringGrip` | — |
| `ai.brakingTendency` | `aiBrakingTendency` | — |
| `ai.catchupAcceleration` | `aiCatchupAcceleration` | — |
| `camera.distance` | `cameraDistance` | — |
| `camera.height` | `cameraHeight` | — |
| `camera.fovFactor` | `cameraFOV` | — |
| `camera.speedFov` | `cameraSpeedFOV` | — |
| `camera.lag` | `cameraLag` | — |
| `camera.lookahead` | `cameraLookahead` | — |
| `camera.shakeDecay` | `cameraShakeDecay` | — |
| `camera.rollFollow` | `cameraRollFollow` | — |
| `camera.boostFovPulse` | `cameraBoostFOVPulse` | — |
| `camera.driftSwing` | `cameraDriftSwing` | — |

</details>

## 5. Comparação com a documentação

- **Registro de aprovação** ([`2026-10-10-prototype-01-physics-approval.md`](../decisions/2026-10-10-prototype-01-physics-approval.md)): de 9 valores citados, 8 coincidem com o export. **"Esterço 56 °/s" diverge:** o export e o laboratório indicam **89 °/s**.
- **Spec 01** (`docs/specs/01_steering_profiles_spec.md`): a tabela comparativa é de uma versão anterior do laboratório, com outros nomes e valores (por exemplo, `steerRate` C = 50). Dos 5 parâmetros comparáveis, nenhum coincide. Ela não deve ser usada como fonte do Perfil C aprovado.
- **Arquivo** (`archive/.../param_definitions.mjs`): contém definições e presets, não a calibração aprovada.

## 6. Decisões pendentes do responsável

1. **Valores ambíguos (41):** confirmar que valem os padrões C do laboratório, ou informar os valores exatos. Um novo export em JSON, que preserva a precisão completa, resolve isso.
2. **`steerRate`:** confirmar se o aprovado é **89 °/s** (export e laboratório) ou 56 °/s (registro de aprovação e código).
3. **`PhysicsCalibration.ts`:** autorizar a correção das 12 divergências para os valores do export, ou registrar cada uma como adaptação intencional ao jogo, com justificativa.
4. **Registro de aprovação:** autorizar a correção do valor de esterço citado e a referência ao export arquivado.
5. **Laboratório 01:**
   - autorizar que os padrões C passem a refletir a calibração aprovada (34 / 500 / 600 e os valores confirmados no item 1);
   - autorizar a correção da exportação em texto para não perder precisão.
6. **Teste de regressão:** depois das decisões acima, adicionar um teste que trave a correspondência entre os 207 valores aprovados, o laboratório e o código (incluindo o mapeamento dos 93 nomes).

## 7. O que esta auditoria não fez

Não alterou `src/`, o laboratório 01, o registro de aprovação, a spec, o GDD nem os testes. Não reconstruiu nenhum valor por suposição: o JSON canônico registra o texto exportado e todos os valores possíveis, sem escolher entre eles.
