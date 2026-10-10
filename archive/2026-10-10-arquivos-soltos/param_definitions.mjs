import fs from 'fs';

export const PARAM_CATEGORIES = [
  {
    id: 'handling',
    title: '01 / Direção & Resposta Angular',
    icon: '🏎️',
    desc: 'Taxa angular, progressividade de curva, inércia de massa lateral, contraesterço e tração.',
    params: [
      'steerRate', 'progressivity', 'inertia', 'grip', 'recenter', 'speedInstability',
      'yawAccel', 'counterSteerBoost', 'steerInputFilter', 'speedInstabilityThreshold',
      'massScale', 'steerDeadzone', 'highSpeedSteerDropoff', 'lowSpeedSteerMultiplier', 'analogSteerGamma'
    ]
  },
  {
    id: 'leaning',
    title: '02 / Inclinação & Banking (Z/C)',
    icon: '✈️',
    desc: 'Dinâmica de roll/inclinação com Z/C, ganho centrípeto, pitch e strafe lateral.',
    params: [
      'rollResponse', 'maxRoll', 'tiltSteerBoost', 'bankTurnForce', 'bankDrag',
      'strafeThrust', 'pitchResponse', 'pitchSensitivity', 'strafeDecel', 'rollDamping',
      'quickStrafeImpulse', 'strafeCooldown', 'bankPitchCoupling', 'rollReturnSpeed', 'tiltSlideAssistance'
    ]
  },
  {
    id: 'drift',
    title: '03 / Derrapagem & Drift (Espaço / Q+E)',
    icon: '⚡',
    desc: 'Controle de slip, contraesterço, retenção de tração e ganho de velocidade no drift.',
    params: [
      'driftYawBoost', 'driftGripMultiplier', 'driftTiltBonus', 'driftBrakeDecel', 'slideTurnBoost',
      'slideDampingRatio', 'driftThreshold', 'driftDecelCurve', 'driftCounterSteerAuthority', 'driftParticleRate',
      'driftEntrySlipKick', 'driftMaxAngle', 'driftAngularDamping', 'driftSparksIntensity', 'airbrakeDragMultiplier'
    ]
  },
  {
    id: 'propulsion',
    title: '04 / Propulsão, Boost & Freios',
    icon: '🚀',
    desc: 'Aceleração longitudinal, velocidades máximas, super boost e potência de frenagem.',
    params: [
      'topSpeed', 'boostTopSpeed', 'acceleration', 'boostAccel', 'boostDuration',
      'coastDecel', 'brakeForce', 'reverseMaxSpeed', 'boostEnergyDrainRate', 'passiveRegenRate',
      'throttleResponse', 'superBoostThreshold', 'boostCooldown', 'draftingSpeedBonus', 'draftingDistance', 'engineBrakingFactor'
    ]
  },
  {
    id: 'combat',
    title: '05 / Combate & Ataques Físicos',
    icon: '💥',
    desc: 'Side attack amplo, spin attack 360°, custos de energia, forças e raios de impacto.',
    params: [
      'sideAttackForce', 'sideAttackDuration', 'sideAttackDamage', 'spinAttackDuration', 'spinAttackDamage',
      'spinAttackForce', 'boostCost', 'sideAttackCost', 'spinAttackCost', 'wallDamageScale',
      'sideAttackReach', 'spinAttackRadius', 'sideAttackCooldown', 'spinAttackCooldown', 'sideAttackLift',
      'rivalHitKnockbackScale', 'impactParticleCount', 'sideAttackInvulnerability', 'spinAttackDeflectBonus', 'bodySlamImpactMultiplier'
    ]
  },
  {
    id: 'suspension',
    title: '06 / Suspensão Magnética, Altura & Colisão de Pista (Hitbox)',
    icon: '🛡️',
    desc: 'Hover spring, altura do solo, amortecimento vertical, espessura física da pista e colisão inferior.',
    params: [
      'hoverHeight', 'springStiffness', 'springDamping', 'wakeAmplitude', 'wakeFrequency',
      'fallGravity', 'airborneGravity', 'hoverDampingRatio', 'slopePitchMultiplier', 'maxVerticalVelocity',
      'trackThickness', 'trackUndersideBounce', 'trackUndersideFriction', 'trackSurfaceFriction',
      'groundCompressionLimit', 'hoverRepulsionForce', 'magneticGripStrength', 'suspensionRelaxRate'
    ]
  },
  {
    id: 'aerial',
    title: '07 / Controle Aéreo, Voo & Mecânica de Pouso (Estilo F-Zero X/GX)',
    icon: '🦅',
    desc: 'Controle 3D de voo (arfagem/mergulho), sustentação de asas, Dive Landing Boost e choque de solo.',
    params: [
      'airPitchControlRate', 'airRollControlRate', 'airSteerAuthority', 'airGlideLift', 'airGlideDrag',
      'airDiveAccel', 'airDiveMaxSpeed', 'airDrag', 'airborneThreshold', 'landingBoostEfficiency',
      'landingBoostMax', 'landingImpactThreshold', 'landingPenaltyDamage', 'landingPenaltyDecel', 'landingSparksCount',
      'jumpRampLaunchForce', 'airStrafeThrust', 'airPitchStability'
    ]
  },
  {
    id: 'ai',
    title: '08 / Inteligência Artificial & Rivais Avançados',
    icon: '🤖',
    desc: 'Velocidade de cruzeiro, super turbo de IA, uso de placas Dash, vácuo e agressividade em combate.',
    params: [
      'aiBaseSpeed', 'aiAggressiveness', 'aiRubberbanding', 'aiLaneChangeSpeed', 'aiRespawnDelay',
      'aiAttackRange', 'aiAvoidanceForce', 'aiSpeedVariance', 'aiTopSpeedCap', 'aiBoostFrequency',
      'aiBoostTopSpeed', 'aiBoostAccel', 'aiDashPlateAffinity', 'aiSlipstreamUsage', 'aiCorneringGrip',
      'aiBrakingTendency', 'aiAirPitchControl', 'aiDiveBoostSkill', 'aiSideAttackSkill', 'aiCatchupAcceleration'
    ]
  },
  {
    id: 'camera',
    title: '09 / Câmera & Sensação de Velocidade',
    icon: '🎥',
    desc: 'Distância do ponto de vista, altura da câmera, FOV dinâmico, inércia vertical e tremor de impacto.',
    params: [
      'cameraDistance', 'cameraHeight', 'cameraFOV', 'cameraSpeedFOV', 'cameraLag',
      'cameraShakeScale', 'cameraLookahead', 'cameraCockpitOffset', 'cameraOrbitSpeed', 'cameraVerticalFollow',
      'cameraShakeDecay', 'cameraAirbornePitchLag', 'cameraLandingDip', 'cameraRollFollow', 'cameraBoostFOVPulse',
      'cameraDriftSwing', 'cameraCockpitShakeMultiplier', 'cameraSpeedVignette'
    ]
  },
  {
    id: 'track',
    title: '10 / Pistas, Barreiras, Zonas & Relevo',
    icon: '🛣️',
    desc: 'Escala de largura da pista, placas Dash, recarga no Pit Lane, relevos e física de barreiras.',
    params: [
      'trackWidthScale', 'dashPlateBoost', 'dashPlateRadius', 'pitRechargeRate', 'barrierBounce',
      'barrierFriction', 'straightTrackLength', 'dashPlateCooldown', 'buildingDensity', 'shadowOpacity',
      'barrierDamageScale', 'pitLaneLength', 'elevatedTrackElevation', 'trackBankCurvature', 'dashPlateEnergyBonus',
      'wallRepulsionAngle', 'trackCrestJumpBoost', 'sceneryDistance'
    ]
  },
  {
    id: 'vfx',
    title: '11 / Efeitos Visuais, Partículas & Pós-Processamento',
    icon: '✨',
    desc: 'Densidade de faíscas, ondas de choque no solo, anel sônico, rastro dos propulsores e brilhos.',
    params: [
      'particleDensity', 'particleLifespan', 'speedLinesDensity', 'engineTrailLength', 'hitFlashIntensity',
      'engineGlowSize', 'speedLinesThreshold', 'starfieldDensity', 'buildingWindowGlow', 'landingShockwaveRadius',
      'airborneTrailOpacity', 'sonicBoomRingSize', 'diveTrailColorShift', 'chassisReflectivity', 'shadowSoftness',
      'hudGlitchIntensity', 'plasmaGlowHue', 'speedLineSpeedScale'
    ]
  },
  {
    id: 'audio',
    title: '12 / Áudio & Sintetizador de Som',
    icon: '🔊',
    desc: 'Frequência base do motor, curva tonal, som de vento aéreo, impacto de mergulho e turbo.',
    params: [
      'engineBasePitch', 'enginePitchRange', 'masterVolume', 'boostSoundPitch', 'engineFilterFreq',
      'impactSoundPitch', 'sideAttackSoundPitch', 'airWhooshVolume', 'diveSoundPitch', 'landingImpactSoundPitch',
      'dashPlateSoundPitch', 'sonicBoomSoundPitch', 'pitStopHumPitch', 'airbrakeSoundVolume', 'shieldWarningPitch', 'collisionCrunchBass'
    ]
  }
];

export const LIMITS = {
  // 01 / Direção
  steerRate: [20, 270, 1, 'Taxa base de esterço', '°/s', 'Velocidade angular máxima de esterço das turbinas ao manobrar para os lados.'],
  progressivity: [1.0, 6.0, 0.1, 'Progressividade de esterço', '×', 'Curva de resposta não-linear. Valores maiores suavizam toques curtos e exigem segurar para virar forte.'],
  inertia: [5, 180, 1, 'Inércia de massa lateral', 'u', 'Massa e momento rotacional. Valores altos causam arrasto e transições de curva mais pesadas.'],
  grip: [10, 100, 1, 'Aderência / Grip lateral', '%', 'Aderência dos repulsores laterais. Previne que a nave escorregue para fora em curvas de alta velocidade.'],
  recenter: [0.5, 45.0, 0.5, 'Estabilização de guinada', 'u', 'Força de auto-centralização que zera a rotação angular de curva ao soltar os direcionais.'],
  speedInstability: [0.00, 2.00, 0.05, 'Instabilidade em alta velocidade', '×', 'Perda progressiva de aderência lateral conforme a velocidade ultrapassa os limites nominais.'],
  yawAccel: [10, 250, 1, 'Aceleração angular (Yaw)', 'u', 'Rapidez com que o nariz da nave atinge a taxa máxima de esterço após o comando.'],
  counterSteerBoost: [1.00, 4.50, 0.05, 'Recuperação em contraesterço', '×', 'Multiplicador de aderência ao esterçar na direção oposta ao escorregamento.'],
  steerInputFilter: [0.10, 3.00, 0.05, 'Filtro de entrada de direção', '×', 'Taxa de suavização entre entrada analógica/digital direta e volante filtrado.'],
  speedInstabilityThreshold: [0.10, 2.00, 0.01, 'Limite de velocidade p/ instabilidade', '×', 'Ponto da curva de velocidade onde a instabilidade aerodinâmica começa a agir.'],
  massScale: [0.50, 3.00, 0.05, 'Escala de massa da nave', '×', 'Multiplicador global de massa física que afeta inércia e repulsão de impacto.'],
  steerDeadzone: [0.00, 0.30, 0.01, 'Zona morta de esterço', 'u', 'Limiar mínimo de entrada no analógico/teclado para iniciar o comando de direção.'],
  highSpeedSteerDropoff: [0.00, 0.80, 0.01, 'Atenuação de curva em alta vel.', '×', 'Redução proporcional da sensibilidade de direção ao cruzar 300u para evitar capotamentos.'],
  lowSpeedSteerMultiplier: [0.50, 2.50, 0.05, 'Multiplicador de esterço em baixa vel.', '×', 'Aumento de autoridade de manobra em velocidades reduzidas para desentalar.'],
  analogSteerGamma: [0.50, 3.00, 0.05, 'Exponencial de esterço analógico', '×', 'Expoente de sensibilidade da curva gama de esterço para controladores e eixos analógicos.'],

  // 02 / Inclinação & Banking
  rollResponse: [3, 45, 1, 'Velocidade de resposta Roll', 'u', 'Velocidade com que a fuselagem inclina lateralmente em curvas ou no strafe com Z/C.'],
  maxRoll: [20, 90, 1, 'Ângulo máximo de inclinação', '°', 'Limite angular de inclinação lateral (banking) permitido pela física da nave.'],
  tiltSteerBoost: [0.50, 4.50, 0.05, 'Ganho de curva ao inclinar (Z/C)', '×', 'Multiplicador de curva ao inclinar na mesma direção da manobra (Z+Esquerda ou C+Direita).'],
  bankTurnForce: [5, 120, 1, 'Força centrípeta de banking', 'u', 'Força de empuxo gerada pelo ângulo de inclinação, puxando a nave para o interior da curva.'],
  bankDrag: [0.0, 45.0, 0.5, 'Arrasto por inclinação', 'u', 'Arrasto aerodinâmico extra sofrido pela nave durante inclinações laterais acentuadas.'],
  strafeThrust: [50, 600, 5, 'Força de strafe contínuo (Z/C)', 'u', 'Força de propulsão lateral pura dos propulsores de manobra (Z = esquerda, C = direita).'],
  pitchResponse: [2.0, 40.0, 0.5, 'Velocidade alinhamento pitch', 'u', 'Rapidez com que o nariz se alinha às variações de subida e descida do relevo da pista.'],
  pitchSensitivity: [0.00, 3.00, 0.05, 'Sensibilidade pitch ao acelerar/frear', '×', 'Inclinação do nariz da nave para cima ao acelerar e para baixo ao frear.'],
  strafeDecel: [0.0, 30.0, 0.5, 'Arrasto longitudinal no strafe', 'u', 'Perda de velocidade para a frente ao segurar Z ou C continuamente.'],
  rollDamping: [1.0, 40.0, 0.5, 'Amortecimento de roll', 'u', 'Taxa de estabilização do ângulo de roll ao sair de curvas ou manobras.'],
  quickStrafeImpulse: [10, 200, 5, 'Impulso inicial do toque de strafe', 'u', 'Disparo de empuxo lateral instantâneo no momento em que Z ou C é pressionado.'],
  strafeCooldown: [0.00, 0.50, 0.01, 'Recarga entre pulsos de strafe', 's', 'Intervalo mínimo de rearme dos micro-propulsores de strafe rápido.'],
  bankPitchCoupling: [0.00, 1.50, 0.05, 'Acoplamento de pitch com inclinação', '×', 'Inclinação automática do bico para baixo em bankings radicais para gerar efeito solo.'],
  rollReturnSpeed: [2.0, 35.0, 0.5, 'Velocidade de retorno ao neutro', 'u', 'Velocidade de desinclinação das asas ao soltar os controles de inclinação.'],
  tiltSlideAssistance: [0.00, 2.00, 0.05, 'Assistência de inclinação no slide', '×', 'Multiplicador de inclinação induzida quando airbrakes (Q/E) são combinados com Z/C.'],

  // 03 / Drift
  driftYawBoost: [1.00, 4.50, 0.05, 'Multiplicador guinada drift', '×', 'Aumento da taxa de rotação angular concedido durante derrapagens com Freio + Curva.'],
  driftGripMultiplier: [5, 80, 1, 'Retenção de grip em drift', '%', 'Percentual de tração residual mantido em drift. Valores baixos aumentam o escorregamento.'],
  driftTiltBonus: [0.0, 45.0, 0.5, 'Bônus veloc. inclinando drift', 'u', 'Bônus de aceleração e fechamento de linha ao inclinar com Z/C dentro de um drift.'],
  driftBrakeDecel: [0.0, 45.0, 0.5, 'Desaceleração freio no drift', 'u', 'Intensidade da perda de velocidade longitudinal enquanto o freio de drift estiver acionado.'],
  slideTurnBoost: [1.00, 3.50, 0.05, 'Multiplicador guinada slide (Q/E)', '×', 'Multiplicador de rotação proporcionado pelo acionamento dos airbrakes manuais (Q / E).'],
  slideDampingRatio: [15, 95, 1, 'Retenção tração em slide', '%', 'Retenção de tração lateral durante o uso dos airbrakes manuais (slide lateral).'],
  driftThreshold: [5, 120, 1, 'Velocidade mín. para iniciar drift', 'u', 'Velocidade mínima requerida para permitir a quebra de aderência e entrada no modo drift.'],
  driftDecelCurve: [0.5, 5.0, 0.1, 'Curva de decaimento do drift', '×', 'Velocidade com que o multiplicador de drift retorna a zero após soltar o freio.'],
  driftCounterSteerAuthority: [1.00, 4.50, 0.05, 'Autoridade de contraesterço no drift', '×', 'Capacidade de corrigir o angle do bico da nave durante derrapagens profundas.'],
  driftParticleRate: [1, 15, 1, 'Taxa de faíscas no drift', 'u', 'Frequência de emissão de partículas de atrito sob a fuselagem durante o drift.'],
  driftEntrySlipKick: [0, 80, 1, 'Impulso lateral na quebra de drift', 'u', 'Quebra repentina de aderência que arremessa a traseira ao engatar o drift.'],
  driftMaxAngle: [15, 90, 1, 'Ângulo limite de derrapagem', '°', 'Ângulo de escorregamento (slip angle) máximo permitido antes de rodopiar completamente.'],
  driftAngularDamping: [0.5, 15.0, 0.5, 'Amortecimento angular no drift', 'u', 'Resistência ao giro descontrolado da cauda enquanto derrapa em alta velocidade.'],
  driftSparksIntensity: [0.10, 3.00, 0.05, 'Intensidade de faíscas no drift', '×', 'Volume de fagulhas emitidas pela quebra do campo magnético contra o asfalto.'],
  airbrakeDragMultiplier: [0.50, 3.50, 0.05, 'Arrasto induzido pelos airbrakes (Q/E)', '×', 'Resistência ao avanço gerada ao acionar os flaps de freio aéreo Q e E.'],

  // 04 / Propulsão & Freios
  topSpeed: [100, 500, 1, 'Velocidade máxima base', 'u', 'Velocidade de cruzeiro máxima que o motor principal atinge em aceleração plena sem turbo.'],
  boostTopSpeed: [180, 600, 1, 'Velocidade máxima com boost', 'u', 'Velocidade limite absoluta que a nave pode atingir durante a ativação do Super Boost.'],
  acceleration: [30, 300, 1, 'Aceleração longitudinal', 'u', 'Força de empuxo dos motores principais ao pressionar o acelerador (W, X ou Seta Cima).'],
  boostAccel: [40, 350, 1, 'Aceleração de super boost', 'u', 'Força de aceleração instantânea injetada pelos injetores de turbo durante o Super Boost.'],
  boostDuration: [1.0, 8.0, 0.1, 'Duração ativa do super boost', 's', 'Tempo em segundos que o impulso do Super Boost permanece ativo por ativação.'],
  coastDecel: [1.0, 45.0, 0.5, 'Desaceleração livre / arrasto', 'u', 'Taxa de desaceleração e atrito natural quando o acelerador é solto.'],
  brakeForce: [30, 350, 1, 'Força de frenagem normal', 'u', 'Potência de frenagem frontal aplicada pelos reversores de fluxo ao segurar Freio ou Ré.'],
  reverseMaxSpeed: [0, 90, 1, 'Velocidade máxima em marcha ré', 'u', 'Velocidade máxima permitida ao engatar ré ou frear com a nave parada.'],
  boostEnergyDrainRate: [0.0, 25.0, 0.5, 'Dreno contínuo de escudo no boost', 'HP/s', 'Taxa de consumo contínuo de escudo enquanto o Super Boost estiver ativo.'],
  passiveRegenRate: [0, 40, 1, 'Taxa de regeneração passiva', 'HP/s', 'Velocidade de auto-reparo do escudo por segundo quando o modo de regeneração estiver ativo.'],
  throttleResponse: [10, 300, 5, 'Resposta de empuxo do acelerador', 'u', 'Rapidez com que as turbinas atingem a aceleração plena após apertar o acelerador.'],
  superBoostThreshold: [50, 350, 5, 'Velocidade mín. para ativar turbo', 'u', 'Velocidade mínima requerida para permitir a injeção do Super Boost.'],
  boostCooldown: [0.0, 3.0, 0.1, 'Intervalo de re-ativação do boost', 's', 'Tempo de espera para resfriamento dos injetores após encerrar o boost anterior.'],
  draftingSpeedBonus: [0, 60, 1, 'Bônus de velocidade no vácuo', 'u', 'Ganho de velocidade ao seguir no cone de vácuo aerodinâmico (slipstream) de rivais.'],
  draftingDistance: [10, 80, 1, 'Distância do cone de vácuo', 'm', 'Distância máxima atrás de uma nave adversária para receber o benefício de vácuo.'],
  engineBrakingFactor: [0.00, 2.00, 0.05, 'Freio motor ao soltar acelerador', '×', 'Resistência eletromagnética regenerativa aplicada ao soltar o acelerador.'],

  // 05 / Combate
  sideAttackForce: [50, 800, 5, 'Impulso do side-attack', 'u', 'Impulso lateral explosivo gerado ao realizar o Side Attack (toque duplo em Z ou C).'],
  sideAttackDuration: [0.10, 1.20, 0.01, 'Duração do side-attack', 's', 'Janela de tempo ativa em que a hitbox expandida do Side Attack pode atingir rivais.'],
  sideAttackDamage: [10, 150, 1, 'Dano causado por side-attack', 'HP', 'Quantidade de dano físico infligido à barra de energia do rival atingido.'],
  spinAttackDuration: [0.20, 1.80, 0.02, 'Duração do spin-attack 360°', 's', 'Duração total da rotação de 360 graus do Spin Attack (Z+C ou Shift).'],
  spinAttackDamage: [10, 150, 1, 'Dano causado por spin-attack', 'HP', 'Dano em área causado a todos os oponentes atingidos durante o giro de 360 graus.'],
  spinAttackForce: [30, 350, 1, 'Impulso repulsão spin-attack', 'u', 'Força de repulsão radial que arremessa rivais para longe no impacto do Spin Attack.'],
  boostCost: [0, 50, 1, 'Custo de escudo por boost', 'HP', 'Quantidade de escudo/energia consumida instantaneamente ao ativar o Super Boost (tecla A).'],
  sideAttackCost: [0, 30, 1, 'Custo de escudo por side-attack', 'HP', 'Custo em energia de escudo consumido por cada golpe lateral executado.'],
  spinAttackCost: [0, 40, 1, 'Custo de escudo por spin-attack', 'HP', 'Custo em energia de escudo consumido por cada giro de ataque 360° executado.'],
  wallDamageScale: [0.00, 4.00, 0.05, 'Escala de dano com parede', '×', 'Multiplicador de dano sofrido pela própria nave ao colidir ou raspar contra os guard-rails.'],
  sideAttackReach: [1.0, 9.0, 0.1, 'Alcance extra do side-attack', 'm', 'Distância horizontal extra que a área de impacto do golpe lateral projeta para fora do chassi.'],
  spinAttackRadius: [1.0, 12.0, 0.1, 'Raio expandido do spin-attack', 'm', 'Raio de expansão da esfera de colisão durante a execução do giro de 360 graus.'],
  sideAttackCooldown: [0.10, 2.00, 0.05, 'Tempo de recarga do side-attack', 's', 'Tempo mínimo de espera antes de poder desferir outro golpe lateral.'],
  spinAttackCooldown: [0.20, 3.00, 0.05, 'Tempo de recarga do spin-attack', 's', 'Tempo mínimo de espera antes de poder executar outro giro de 360 graus.'],
  sideAttackLift: [0.0, 8.0, 0.1, 'Elevação vertical no side-attack', 'm', 'Impulso vertical leve que levanta a nave durante o impacto do golpe lateral.'],
  rivalHitKnockbackScale: [0.1, 4.5, 0.1, 'Escala de repulsão recebida de rivais', '×', 'Multiplicador da força de impacto recebida quando a nave do jogador é atingida por rivais.'],
  impactParticleCount: [2, 45, 1, 'Faíscas por impacto de lataria', 'u', 'Quantidade de partículas de colisão emitidas em toques normais entre veículos.'],
  sideAttackInvulnerability: [0.00, 0.50, 0.01, 'Invulnerabilidade no side-attack', 's', 'Janela de imunidade temporária contra dano de lataria durante o golpe.'],
  spinAttackDeflectBonus: [0.50, 3.00, 0.05, 'Deflexão de projéteis e naves no spin', '×', 'Multiplicador de repulsão que deflete veículos que tentam abalroar a nave girando.'],
  bodySlamImpactMultiplier: [0.50, 3.50, 0.05, 'Multiplicador de dano por abalroamento', '×', 'Dano bônus proporcional à velocidade diferencial em colisões corporais diretas.'],

  // 06 / Suspensão & Hitbox
  hoverHeight: [0.8, 8.0, 0.1, 'Altura base de flutuação', 'm', 'Distância de levitação mantida pelos repulsores antigravitacionais acima da pista.'],
  springStiffness: [20, 400, 1, 'Rigidez da mola de suspensão', 'u', 'Constante elástica da suspensão magnética. Valores altos tornam a flutuação mais firme.'],
  springDamping: [5.0, 80.0, 0.5, 'Amortecimento da suspensão', 'u', 'Amortecimento vertical que dissipa o balanço e quiques após ondulações ou relevos da pista.'],
  wakeAmplitude: [0.00, 0.80, 0.01, 'Amplitude de oscilação', 'm', 'Amplitude da oscilação natural gerada pelo colchão de repulsão magnética sob a nave.'],
  wakeFrequency: [1.0, 15.0, 0.1, 'Frequência de oscilação', 'Hz', 'Frequência de oscilação do rastro antigravitacional sob a fuselagem.'],
  fallGravity: [10, 120, 1, 'Gravidade de queda fora de pista', 'u', 'Aceleração gravitacional que puxa a nave para baixo caso ela caia fora dos limites da pista.'],
  airborneGravity: [10, 120, 1, 'Gravidade em salto no ar', 'u', 'Força que puxa a nave para baixo ao saltar sobre rampas ou aclives acentuados.'],
  hoverDampingRatio: [0.10, 3.00, 0.05, 'Razão de amortecimento hover', '×', 'Ajuste fino da dissipação harmônica da suspensão magnética.'],
  slopePitchMultiplier: [0.50, 4.50, 0.05, 'Multiplicador de pitch em aclives', '×', 'Multiplicador da inclinação vertical do chassi ao acompanhar curvas verticais da pista.'],
  maxVerticalVelocity: [10, 90, 1, 'Velocidade vertical máxima (Mola)', 'u', 'Limite máximo de velocidade de compressão ou extensão da suspensão magnética.'],
  trackThickness: [0.5, 8.0, 0.1, 'Espessura física sólida da pista', 'm', 'Espessura da laje da pista para bloqueio físico por baixo, impedindo atravessar a estrutura.'],
  trackUndersideBounce: [0.00, 1.00, 0.01, 'Ricochete sob a pista (Underside)', '×', 'Elasticidade do impacto e reflexão vertical caso a nave bata por baixo da pista.'],
  trackUndersideFriction: [0.00, 0.90, 0.01, 'Atrito ao raspar sob a pista', '×', 'Perda de velocidade longitudinal ao colidir ou raspar contra o teto inferior da pista.'],
  trackSurfaceFriction: [0.00, 0.80, 0.02, 'Atrito da superfície do asfalto', '×', 'Resistência ao deslizamento longitudinal gerada pelo piso magnético.'],
  groundCompressionLimit: [0.1, 2.5, 0.1, 'Limite de compressão no solo', 'm', 'Distância mínima entre a fuselagem e o solo antes de raspar a lataria no asfalto.'],
  hoverRepulsionForce: [50, 600, 10, 'Força anti-colisão vertical', 'u', 'Empuxo magnético de emergência que empurra a nave para cima ao sofrer compressão violenta.'],
  magneticGripStrength: [0.20, 3.00, 0.05, 'Retenção magnética de superfície', '×', 'Força que mantém a nave magnetizada à pista em loopings, descidas e curvas inclinadas.'],
  suspensionRelaxRate: [1.0, 30.0, 0.5, 'Relaxamento da suspensão no ar', 'u', 'Rapidez com que os amortecedores se estendem ao sair do contato com o solo.'],

  // 07 / Voo & Pouso (F-Zero X/GX)
  airPitchControlRate: [5, 65, 1, 'Taxa controle pitch aéreo (Cima/Baixo)', '°/s', 'Velocidade de inclinação do bico da nave no ar (Seta Cima/W mergulha, Seta Baixo/S empina).'],
  airRollControlRate: [5, 75, 1, 'Taxa controle roll aéreo (Z/C/Setas)', '°/s', 'Velocidade de rotação no próprio eixo longitudinal da nave durante o voo.'],
  airSteerAuthority: [0.20, 2.50, 0.05, 'Autoridade de curva em voo', '×', 'Capacidade de manobrar e mudar a trajetória horizontal enquanto estiver no ar.'],
  airGlideLift: [5, 90, 1, 'Sustentação de voo (Gliding Lift)', 'u', 'Força aerodinâmica de sustentação gerada ao manter o nariz empinado para cima no ar.'],
  airGlideDrag: [0.0, 30.0, 0.5, 'Arrasto induzido no voo planado', 'u', 'Arrasto e perda de velocidade horizontal quando o nariz está excessivamente empinado.'],
  airDiveAccel: [10, 150, 1, 'Aceleração de mergulho (Nose Dive)', 'u', 'Aceleração de descida em mergulho ao apontar o bico da nave para baixo no ar.'],
  airDiveMaxSpeed: [30, 150, 1, 'Velocidade limite no mergulho', 'u', 'Velocidade vertical máxima atingível durante uma queda/mergulho controlado no ar.'],
  airDrag: [0.10, 4.00, 0.05, 'Arrasto aerodinâmico global no ar', 'u', 'Resistência do ar ao deslocamento longitudinal durante saltos e voo livre.'],
  airborneThreshold: [0.2, 3.0, 0.1, 'Altura p/ ativar modo voo livre', 'm', 'Elevação acima da altura de hover necessária para desativar a suspensão e engatar voo 3D.'],
  landingBoostEfficiency: [0.10, 1.50, 0.05, 'Conversão de impulso de pouso (Dive Boost)', '×', 'Percentual da velocidade de mergulho convertida em turbo frontal ao tocar a pista alinhado.'],
  landingBoostMax: [20, 250, 5, 'Bônus máximo de Dive Landing Boost', 'u', 'Velocidade máxima instantânea concedida por uma aterrissagem perfeita de mergulho.'],
  landingImpactThreshold: [0.10, 1.20, 0.05, 'Tolerância angular de pouso suave', 'rad', 'Desalinhamento máximo tolerado entre a nave e o asfalto antes de sofrer impacto de lataria.'],
  landingPenaltyDamage: [0, 50, 1, 'Dano por pouso desajeitado/de cauda', 'HP', 'Dano ao escudo ao aterrissar em ângulo incorreto ou de ré/lado.'],
  landingPenaltyDecel: [0, 90, 1, 'Perda de velocidade em pouso ruim', 'u', 'Desaceleração sofrida na aterrissagem ao bater o fundo ou as pontas da nave no chão.'],
  landingSparksCount: [5, 60, 1, 'Faíscas na aterrissagem', 'u', 'Quantidade de partículas incandescentes geradas no choque contra o asfalto ao aterrissar.'],
  jumpRampLaunchForce: [0.50, 3.50, 0.05, 'Multiplicador de salto em cristas', '×', 'Impulso vertical de decolagem ao cruzar topos de colinas ou rampas em alta velocidade.'],
  airStrafeThrust: [20, 400, 5, 'Empuxo de strafe lateral aéreo', 'u', 'Força de reposicionamento lateral dos propulsores de manobra no ar (Z e C).'],
  airPitchStability: [0.00, 10.00, 0.20, 'Estabilização giroscópica no ar', 'u', 'Tendência natural da fuselagem de retornar ao nível horizontal se os comandos forem soltos.'],

  // 08 / IA Avançada
  aiBaseSpeed: [60, 350, 1, 'Velocidade cruzeiro base da IA', 'u', 'Velocidade padrão de cruzeiro adotada pelas naves controladas pela inteligência artificial.'],
  aiAggressiveness: [0.20, 4.00, 0.10, 'Agressividade / Ataque da IA', '×', 'Probabilidade e frequência com que os rivais de IA tentam abalroar e atacar a nave do jogador.'],
  aiRubberbanding: [0.00, 2.00, 0.05, 'Recuperação de distância (Catch-up)', '×', 'Intensidade da compensação de velocidade para manter os rivais próximos ao jogador.'],
  aiLaneChangeSpeed: [0.10, 3.00, 0.10, 'Frequência de troca de faixa', 'u', 'Rapidez e frequência com que os pilotos de IA trocam de faixa e procuram linhas ideais.'],
  aiRespawnDelay: [1.0, 15.0, 0.5, 'Tempo de ressurgimento da IA', 's', 'Tempo em segundos que um rival destruído (K.O.) leva para reaparecer na pista.'],
  aiAttackRange: [3, 35, 1, 'Alcance de ataque da IA', 'm', 'Distância máxima para a IA tentar disparar golpes laterais no jogador.'],
  aiAvoidanceForce: [5, 75, 1, 'Força de separação lateral da IA', 'u', 'Força com que os pilotos de IA evitam bater lateralmente uns nos outros.'],
  aiSpeedVariance: [0, 80, 1, 'Variação randômica de velocidade da IA', 'u', 'Flutuação de velocidade aplicada individualmente aos diferentes pilotos da IA.'],
  aiTopSpeedCap: [150, 550, 5, 'Teto absoluto de velocidade da IA', 'u', 'Limite máximo absoluto que a IA pode atingir mesmo sob efeito de turbo ou rubberband.'],
  aiBoostFrequency: [0.00, 1.00, 0.05, 'Frequência de uso do Turbo pela IA', '×', 'Probabilidade da IA acionar o Super Boost em retas ou quando ultrapassada.'],
  aiBoostTopSpeed: [200, 600, 5, 'Velocidade da IA com Turbo', 'u', 'Velocidade limite que os rivais atingem durante suas arrancadas com turbo.'],
  aiBoostAccel: [30, 350, 5, 'Aceleração do turbo da IA', 'u', 'Potência da injeção de velocidade quando um rival aciona o turbo.'],
  aiDashPlateAffinity: [0.00, 1.00, 0.05, 'Busca por placas Dash pela IA', '×', 'Tendência da inteligência artificial de manobrar para cruzar sobre placas Dash.'],
  aiSlipstreamUsage: [0.00, 2.00, 0.05, 'Aproveitamento de vácuo pela IA', '×', 'Multiplicador de aceleração de vácuo quando a IA persegue a nave do jogador de perto.'],
  aiCorneringGrip: [0.30, 2.00, 0.05, 'Aderência e tração da IA em curvas', '×', 'Habilidade da IA de contornar curvas fechadas sem perder a trajetória ou derrapar.'],
  aiBrakingTendency: [0.00, 1.50, 0.05, 'Frenagem preventiva da IA em curvas', '×', 'Intensidade com que a IA reduz velocidade para não colidir nas paredes externas.'],
  aiAirPitchControl: [0.10, 2.00, 0.05, 'Habilidade da IA de pitch no ar', '×', 'Capacidade da IA de ajustar o bico em saltos para planar e aterrissar em velocidade.'],
  aiDiveBoostSkill: [0.00, 1.00, 0.05, 'Uso de Dive Landing Boost pela IA', '×', 'Frequência com que os rivais executam aterrissagens de mergulho para ganhar impulso.'],
  aiSideAttackSkill: [0.20, 3.00, 0.10, 'Força de impacto dos ataques da IA', '×', 'Multiplicador de dano e empurrão dos golpes laterais desferidos pela IA.'],
  aiCatchupAcceleration: [10, 150, 1, 'Aceleração de recuperação da IA', 'u', 'Rapidez com que a IA acelera para alcançar o jogador após ficar para trás.'],

  // 09 / Câmera
  cameraDistance: [5.0, 50.0, 0.5, 'Distância da câmera traseira', 'm', 'Distância horizontal em metros mantida pela câmera de perseguição atrás da nave.'],
  cameraHeight: [1.0, 25.0, 0.2, 'Altura da câmera traseira', 'm', 'Elevação vertical da câmera de perseguição acima do plano da pista.'],
  cameraFOV: [0.30, 1.80, 0.02, 'Fator de FOV / perspectiva', '×', 'Campo de visão focal (FOV) base e distorção angular de perspectiva da lente.'],
  cameraSpeedFOV: [0.00, 0.45, 0.01, 'Expansão de FOV em velocidade', '×', 'Abertura dinâmica adicional de FOV conforme a nave atinge velocidades supersônicas.'],
  cameraLag: [1, 45, 1, 'Resposta de acompanhamento', 'u', 'Suavização inercial de acompanhamento da câmera ao acelerar, desacelerar ou manobrar.'],
  cameraShakeScale: [0.0, 4.5, 0.1, 'Multiplicador de tremor', '×', 'Multiplicador de intensidade do tremor de câmera disparado em colisões, boosts e impactos.'],
  cameraLookahead: [10, 120, 1, 'Distância de mira à frente', 'm', 'Distância focal em metros à frente da nave para onde a câmera aponta e antecipa curvas.'],
  cameraCockpitOffset: [0.1, 4.5, 0.1, 'Avanço de câmera POV (Cockpit)', 'm', 'Distância à frente do centro de massa para posicionamento dos olhos do piloto.'],
  cameraOrbitSpeed: [0.05, 1.50, 0.05, 'Velocidade de rotação da órbita', 'u', 'Velocidade angular de giro da câmera no modo Órbita.'],
  cameraVerticalFollow: [1, 45, 1, 'Acompanhamento vertical da câmera', 'u', 'Velocidade com que a câmera segue subidas e descidas verticais do relevo.'],
  cameraShakeDecay: [0.5, 7.5, 0.1, 'Decaimento do tremor de tela', '×', 'Rapidez com que o tremor de câmera é dissipado após um impacto.'],
  cameraAirbornePitchLag: [0.5, 20.0, 0.5, 'Inércia de pitch de câmera no ar', 'u', 'Atraso inercial da câmera ao seguir o nariz da nave durante mergulhos e subidas no ar.'],
  cameraLandingDip: [0.00, 3.00, 0.05, 'Afundamento de câmera no pouso', 'm', 'Efeito dinâmico de compressão da câmera para baixo no momento do toque do solo.'],
  cameraRollFollow: [0.00, 1.50, 0.05, 'Inclinação da câmera com a nave', '×', 'Grau de rotação angular da lente da câmera acompanhando o roll da nave.'],
  cameraBoostFOVPulse: [0.00, 0.40, 0.01, 'Pulso de FOV ao disparar Turbo', '×', 'Abertura elástica instantânea do campo de visão na detonação do Super Boost.'],
  cameraDriftSwing: [0.00, 2.00, 0.05, 'Abertura de câmera no drift', '×', 'Deslocamento da câmera para o lado externo da curva durante derrapagens.'],
  cameraCockpitShakeMultiplier: [0.2, 3.0, 0.1, 'Tremor na visão em 1ª pessoa', '×', 'Intensidade relativa da vibração da cabine no modo de câmera Cockpit.'],
  cameraSpeedVignette: [0.00, 1.00, 0.01, 'Vinheta escura de velocidade', '×', 'Escurecimento focal das bordas da tela proporcional à velocidade atingida.'],

  // 10 / Pistas & Relevo
  trackWidthScale: [0.40, 3.50, 0.05, 'Multiplicador largura da pista', '×', 'Multiplicador global de largura de pista, expandindo ou estreitando o asfalto em tempo real.'],
  dashPlateBoost: [20, 250, 1, 'Impulso da placa Dash', 'u', 'Impulso de velocidade instantâneo injetado ao cruzar sobre as placas Dash douradas na pista.'],
  dashPlateRadius: [4, 30, 1, 'Raio de ativação da placa Dash', 'm', 'Raio de tolerância e detecção para acionamento das placas Dash.'],
  pitRechargeRate: [5, 150, 1, 'Taxa de recarga no Pit', 'HP/s', 'Taxa de recuperação por segundo da energia de escudo dentro das faixas verdes de Pit Stop.'],
  barrierBounce: [0.50, 2.50, 0.05, 'Elasticidade de ricochete na parede', '×', 'Elasticidade de ricochete nas muretas laterais. Valores maiores aumentam a velocidade refletida.'],
  barrierFriction: [0.00, 1.00, 0.02, 'Atrito de desaceleração na parede', '×', 'Atrito e perda de velocidade longitudinal ao raspar continuamente contra os guard-rails.'],
  straightTrackLength: [1000, 6000, 100, 'Comprimento da reta de ensaio', 'm', 'Extensão total da pista reta de testes de velocidade em metros.'],
  dashPlateCooldown: [0.2, 4.5, 0.1, 'Recarga da mesma placa Dash', 's', 'Intervalo mínimo antes que a mesma placa Dash possa fornecer boost novamente.'],
  buildingDensity: [10, 200, 5, 'Densidade de prédios da paisagem', 'u', 'Quantidade de edifícios futuristas gerados ao redor da pista.'],
  shadowOpacity: [0.00, 1.00, 0.01, 'Opacidade da sombra da nave', '×', 'Intensidade e escuridão da projeção de sombra no solo sob o chassi.'],
  barrierDamageScale: [0.00, 3.00, 0.05, 'Dano por fricção em barreiras', '×', 'Multiplicador de dano gerado pelo atrito contínuo contra as muretas laterais.'],
  pitLaneLength: [20, 200, 5, 'Extensão longitudinal do Pit Stop', 'm', 'Comprimento da faixa verde de recarga instalada na reta principal.'],
  elevatedTrackElevation: [20, 150, 5, 'Altitude máxima de relevo', 'm', 'Altura dos picos e viadutos mais altos da pista elevada.'],
  trackBankCurvature: [0.00, 2.00, 0.05, 'Banking automático da pista', '×', 'Inclinação transversal aplicada automaticamente ao leito da pista em curvas.'],
  dashPlateEnergyBonus: [0, 30, 1, 'Recarga de energia na placa Dash', 'HP', 'Quantidade de energia de escudo regenerada instantaneamente na placa Dash.'],
  wallRepulsionAngle: [0.2, 2.0, 0.1, 'Ângulo de deflexão de parede', '×', 'Ângulo com que a nave é empurrada para fora ao tocar nas barreiras.'],
  trackCrestJumpBoost: [0.0, 3.0, 0.1, 'Multiplicador de salto em aclive', '×', 'Impulso adicional ao decolar no topo de aclives íngremes.'],
  sceneryDistance: [300, 2000, 50, 'Distância de renderização do cenário', 'm', 'Raio de visão e desenho dos prédios e elementos de fundo.'],

  // 11 / Efeitos Visuais & Partículas
  particleDensity: [5, 80, 1, 'Densidade de faíscas/partículas', 'u', 'Quantidade de partículas e faíscas geradas em colisões, manobras de drift e boosts.'],
  particleLifespan: [0.10, 2.20, 0.05, 'Duração de partículas', 's', 'Tempo de vida útil e dissipação das partículas de faísca e fumaça no ar.'],
  speedLinesDensity: [0, 80, 1, 'Linhas de velocidade (Speedlines)', 'u', 'Quantidade de feixes visuais de velocidade (speedlines) projetados na tela em alta velocidade.'],
  engineTrailLength: [0.5, 4.5, 0.1, 'Tamanho do rastro do propulsor', '×', 'Multiplicador de comprimento da labareda de plasma emitida pelos propulsores traseiros.'],
  hitFlashIntensity: [0.00, 1.00, 0.01, 'Intensidade de flash vermelho', '×', 'Opacidade do clarão avermelhado projetado na tela ao receber dano de colisão.'],
  engineGlowSize: [0.5, 5.0, 0.1, 'Escala de brilho do propulsor', '×', 'Multiplicador de escala da labareda incandescente dos motores.'],
  speedLinesThreshold: [60, 300, 5, 'Velocidade p/ ativar speedlines', 'u', 'Velocidade a partir da qual as linhas de velocidade do para-brisa começam a ser desenhadas.'],
  starfieldDensity: [0, 60, 1, 'Densidade de estrelas no céu', 'u', 'Quantidade de pontos estelares e luzes cósmicas no domo celeste.'],
  buildingWindowGlow: [0.00, 1.00, 0.05, 'Densidade de janelas iluminadas', '×', 'Proporção de janelas acesas e letreiros nos prédios da cidade ao fundo.'],
  landingShockwaveRadius: [1.0, 25.0, 0.5, 'Raio da onda de choque no pouso', 'm', 'Raio do anel de poeira/energia expandido no solo durante aterrissagens.'],
  airborneTrailOpacity: [0.00, 1.00, 0.05, 'Opacidade dos vórtices de asa', '×', 'Intensidade das trilhas de condensação geradas nas pontas das asas em voo.'],
  sonicBoomRingSize: [0.5, 4.0, 0.1, 'Tamanho do anel de quebra sônica', '×', 'Dimensão do cone de condensação visível ao ultrapassar velocidades transônicas.'],
  diveTrailColorShift: [0.00, 1.00, 0.05, 'Variação cromática em mergulho', '×', 'Mudança na cor do rastro de empuxo durante quedas verticais aceleradas.'],
  chassisReflectivity: [0.00, 1.00, 0.05, 'Refletividade da fuselagem', '×', 'Brilho especular dos reflexos de luz de néon sobre o casco da nave.'],
  shadowSoftness: [0.5, 5.0, 0.1, 'Suavidade da sombra da nave', '×', 'Difusão da penumbra da projeção de sombra conforme a altitude aumenta.'],
  hudGlitchIntensity: [0.00, 1.00, 0.05, 'Efeito de interferência no HUD', '×', 'Intensidade de aberração cromática no visor holográfico ao sofrer dano crítico.'],
  plasmaGlowHue: [0, 360, 5, 'Matiz cromático do plasma', '°', 'Ajuste de tonalidade de cor da labareda dos motores (de azul elétrico a rubi).'],
  speedLineSpeedScale: [0.5, 3.0, 0.1, 'Velocidade dos feixes visuais', '×', 'Rapidez com que as linhas de velocidade se movimentam pelo visor.'],

  // 12 / Áudio
  engineBasePitch: [30, 220, 1, 'Tom base do motor', 'Hz', 'Frequência sonora fundamental do zumbido do motor sintetizado em marcha lenta/repouso.'],
  enginePitchRange: [30, 350, 1, 'Sensibilidade de tom à velocidade', 'Hz', 'Amplitude de variação do tom sonoro conforme a nave acelera até a velocidade máxima.'],
  masterVolume: [0.01, 0.50, 0.01, 'Volume mestre de efeitos', 'u', 'Volume mestre de todos os efeitos e sintetizadores sonoros de corrida e combate.'],
  boostSoundPitch: [200, 1200, 10, 'Frequência sonora do boost', 'Hz', 'Frequência sonora base do efeito acústico de ignição do Super Boost.'],
  engineFilterFreq: [200, 2000, 25, 'Filtro passa-baixa do motor', 'Hz', 'Frequência de corte do filtro acústico do oscilador de dente de serra.'],
  impactSoundPitch: [50, 450, 5, 'Tom sonoro de batida na parede', 'Hz', 'Frequência sonora fundamental do impacto de lataria contra as barreiras.'],
  sideAttackSoundPitch: [80, 600, 5, 'Tom sonoro do side-attack', 'Hz', 'Frequência sonora do disparo de ar comprimido do golpe lateral.'],
  airWhooshVolume: [0.00, 0.40, 0.01, 'Volume do vento em voo aéreo', 'u', 'Volume do efeito de ruído branco simulando o ar cortando a cabine no salto.'],
  diveSoundPitch: [100, 800, 10, 'Tom sonoro de mergulho (Dive)', 'Hz', 'Frequência sonora ascendente gerada pelo atrito do ar em mergulhos aéreos.'],
  landingImpactSoundPitch: [40, 350, 5, 'Tom sonoro do choque de pouso', 'Hz', 'Frequência acústica do impacto do trem de pouso contra a pista.'],
  dashPlateSoundPitch: [300, 1500, 10, 'Frequência sonora da placa Dash', 'Hz', 'Tom acústico futurista emitido ao cruzar uma placa de aceleração.'],
  sonicBoomSoundPitch: [40, 250, 5, 'Tom do estrondo de quebra sônica', 'Hz', 'Frequência grave do estrondo sônico ao ultrapassar a barreira de 300u.'],
  pitStopHumPitch: [100, 600, 10, 'Zumbido de recarga do Pit Stop', 'Hz', 'Frequência do campo eletromagnético de cura dentro da zona de Pit.'],
  airbrakeSoundVolume: [0.00, 0.30, 0.01, 'Volume de escape dos airbrakes (Q/E)', 'u', 'Volume do sibilo de ar pressurizado dos freios aerodinâmicos.'],
  shieldWarningPitch: [400, 1800, 20, 'Frequência de aviso de escudo crítico', 'Hz', 'Frequência sonora do alerta de perigo quando o escudo cai abaixo de 20 HP.'],
  collisionCrunchBass: [20, 150, 5, 'Subgrave em colisões violentas', 'Hz', 'Componente subsônica disparada em abalroamentos e batidas de alto impacto.']
};

export const DEFAULTS = {
  A: {
    // 01 Direção
    steerRate: 75, progressivity: 1.0, inertia: 22, grip: 92, recenter: 14.0, speedInstability: 0.15, yawAccel: 95, counterSteerBoost: 1.40, steerInputFilter: 1.00, speedInstabilityThreshold: 0.65, massScale: 1.00, steerDeadzone: 0.02, highSpeedSteerDropoff: 0.10, lowSpeedSteerMultiplier: 1.20, analogSteerGamma: 1.00,
    // 02 Inclinação
    rollResponse: 14, maxRoll: 50, tiltSteerBoost: 1.45, bankTurnForce: 35, bankDrag: 8.0, strafeThrust: 180, pitchResponse: 11.0, pitchSensitivity: 1.00, strafeDecel: 3.0, rollDamping: 18.0, quickStrafeImpulse: 40, strafeCooldown: 0.05, bankPitchCoupling: 0.20, rollReturnSpeed: 16.0, tiltSlideAssistance: 0.30,
    // 03 Drift
    driftYawBoost: 1.60, driftGripMultiplier: 25, driftTiltBonus: 12.0, driftBrakeDecel: 4.5, slideTurnBoost: 1.40, slideDampingRatio: 57, driftThreshold: 20, driftDecelCurve: 2.5, driftCounterSteerAuthority: 1.40, driftParticleRate: 2, driftEntrySlipKick: 15, driftMaxAngle: 45, driftAngularDamping: 4.0, driftSparksIntensity: 1.00, airbrakeDragMultiplier: 1.50,
    // 04 Propulsão
    topSpeed: 240, boostTopSpeed: 330, acceleration: 84, boostAccel: 115, boostDuration: 2.4, coastDecel: 4.5, brakeForce: 135, reverseMaxSpeed: 20, boostEnergyDrainRate: 4.5, passiveRegenRate: 6, throttleResponse: 120, superBoostThreshold: 100, boostCooldown: 0.5, draftingSpeedBonus: 18, draftingDistance: 40, engineBrakingFactor: 0.30,
    // 05 Combate
    sideAttackForce: 250, sideAttackDuration: 0.46, sideAttackDamage: 59, spinAttackDuration: 0.66, spinAttackDamage: 47, spinAttackForce: 110, boostCost: 14, sideAttackCost: 3, spinAttackCost: 6, wallDamageScale: 1.00, sideAttackReach: 3.8, spinAttackRadius: 3.5, sideAttackCooldown: 0.35, spinAttackCooldown: 0.60, sideAttackLift: 0.0, rivalHitKnockbackScale: 1.0, impactParticleCount: 8, sideAttackInvulnerability: 0.15, spinAttackDeflectBonus: 1.20, bodySlamImpactMultiplier: 1.00,
    // 06 Suspensão & Hitbox
    hoverHeight: 2.1, springStiffness: 120, springDamping: 19.0, wakeAmplitude: 0.09, wakeFrequency: 5.3, fallGravity: 30, airborneGravity: 30, hoverDampingRatio: 1.00, slopePitchMultiplier: 1.50, maxVerticalVelocity: 26, trackThickness: 2.0, trackUndersideBounce: 0.30, trackUndersideFriction: 0.20, trackSurfaceFriction: 0.10, groundCompressionLimit: 0.4, hoverRepulsionForce: 300, magneticGripStrength: 1.20, suspensionRelaxRate: 8.0,
    // 07 Voo & Pouso
    airPitchControlRate: 25, airRollControlRate: 30, airSteerAuthority: 0.80, airGlideLift: 28, airGlideDrag: 6.0, airDiveAccel: 35, airDiveMaxSpeed: 65, airDrag: 0.80, airborneThreshold: 0.6, landingBoostEfficiency: 0.60, landingBoostMax: 80, landingImpactThreshold: 0.40, landingPenaltyDamage: 8, landingPenaltyDecel: 20, landingSparksCount: 16, jumpRampLaunchForce: 1.00, airStrafeThrust: 80, airPitchStability: 3.00,
    // 08 IA Avançada
    aiBaseSpeed: 110, aiAggressiveness: 1.00, aiRubberbanding: 0.25, aiLaneChangeSpeed: 0.50, aiRespawnDelay: 4.0, aiAttackRange: 10, aiAvoidanceForce: 16, aiSpeedVariance: 35, aiTopSpeedCap: 300, aiBoostFrequency: 0.15, aiBoostTopSpeed: 320, aiBoostAccel: 100, aiDashPlateAffinity: 0.60, aiSlipstreamUsage: 0.80, aiCorneringGrip: 1.00, aiBrakingTendency: 0.40, aiAirPitchControl: 0.80, aiDiveBoostSkill: 0.30, aiSideAttackSkill: 1.00, aiCatchupAcceleration: 40,
    // 09 Câmera
    cameraDistance: 19.0, cameraHeight: 7.4, cameraFOV: 0.78, cameraSpeedFOV: 0.09, cameraLag: 20, cameraShakeScale: 1.0, cameraLookahead: 38, cameraCockpitOffset: 0.7, cameraOrbitSpeed: 0.35, cameraVerticalFollow: 20, cameraShakeDecay: 1.7, cameraAirbornePitchLag: 4.0, cameraLandingDip: 0.80, cameraRollFollow: 0.30, cameraBoostFOVPulse: 0.08, cameraDriftSwing: 0.40, cameraCockpitShakeMultiplier: 1.0, cameraSpeedVignette: 0.20,
    // 10 Pista & Relevo
    trackWidthScale: 1.00, dashPlateBoost: 65, dashPlateRadius: 10, pitRechargeRate: 34, barrierBounce: 1.10, barrierFriction: 0.12, straightTrackLength: 2400, dashPlateCooldown: 1.0, buildingDensity: 90, shadowOpacity: 0.68, barrierDamageScale: 0.80, pitLaneLength: 60, elevatedTrackElevation: 60, trackBankCurvature: 0.50, dashPlateEnergyBonus: 5, wallRepulsionAngle: 0.8, trackCrestJumpBoost: 0.8, sceneryDistance: 700,
    // 11 VFX
    particleDensity: 20, particleLifespan: 0.45, speedLinesDensity: 22, engineTrailLength: 1.2, hitFlashIntensity: 0.22, engineGlowSize: 1.0, speedLinesThreshold: 120, starfieldDensity: 13, buildingWindowGlow: 0.85, landingShockwaveRadius: 6.0, airborneTrailOpacity: 0.40, sonicBoomRingSize: 1.5, diveTrailColorShift: 0.30, chassisReflectivity: 0.60, shadowSoftness: 1.5, hudGlitchIntensity: 0.30, plasmaGlowHue: 200, speedLineSpeedScale: 1.0,
    // 12 Áudio
    engineBasePitch: 65, enginePitchRange: 90, masterVolume: 0.07, boostSoundPitch: 380, engineFilterFreq: 550, impactSoundPitch: 105, sideAttackSoundPitch: 165, airWhooshVolume: 0.08, diveSoundPitch: 320, landingImpactSoundPitch: 120, dashPlateSoundPitch: 650, sonicBoomSoundPitch: 90, pitStopHumPitch: 240, airbrakeSoundVolume: 0.06, shieldWarningPitch: 880, collisionCrunchBass: 60
  },
  B: {
    // 01 Direção
    steerRate: 65, progressivity: 2.2, inertia: 35, grip: 85, recenter: 9.0, speedInstability: 0.30, yawAccel: 45, counterSteerBoost: 1.50, steerInputFilter: 1.00, speedInstabilityThreshold: 0.60, massScale: 1.00, steerDeadzone: 0.03, highSpeedSteerDropoff: 0.14, lowSpeedSteerMultiplier: 1.15, analogSteerGamma: 1.20,
    // 02 Inclinação
    rollResponse: 10, maxRoll: 55, tiltSteerBoost: 1.60, bankTurnForce: 38, bankDrag: 7.0, strafeThrust: 165, pitchResponse: 9.0, pitchSensitivity: 1.00, strafeDecel: 2.5, rollDamping: 16.0, quickStrafeImpulse: 35, strafeCooldown: 0.06, bankPitchCoupling: 0.25, rollReturnSpeed: 14.0, tiltSlideAssistance: 0.35,
    // 03 Drift
    driftYawBoost: 1.70, driftGripMultiplier: 22, driftTiltBonus: 14.0, driftBrakeDecel: 4.0, slideTurnBoost: 1.45, slideDampingRatio: 52, driftThreshold: 20, driftDecelCurve: 2.5, driftCounterSteerAuthority: 1.50, driftParticleRate: 2, driftEntrySlipKick: 18, driftMaxAngle: 50, driftAngularDamping: 3.5, driftSparksIntensity: 1.20, airbrakeDragMultiplier: 1.60,
    // 04 Propulsão
    topSpeed: 250, boostTopSpeed: 340, acceleration: 82, boostAccel: 120, boostDuration: 2.4, coastDecel: 4.0, brakeForce: 140, reverseMaxSpeed: 20, boostEnergyDrainRate: 4.5, passiveRegenRate: 6, throttleResponse: 120, superBoostThreshold: 90, boostCooldown: 0.4, draftingSpeedBonus: 20, draftingDistance: 44, engineBrakingFactor: 0.25,
    // 05 Combate
    sideAttackForce: 220, sideAttackDuration: 0.46, sideAttackDamage: 55, spinAttackDuration: 0.66, spinAttackDamage: 45, spinAttackForce: 100, boostCost: 14, sideAttackCost: 3, spinAttackCost: 6, wallDamageScale: 1.00, sideAttackReach: 3.8, spinAttackRadius: 3.5, sideAttackCooldown: 0.35, spinAttackCooldown: 0.60, sideAttackLift: 0.0, rivalHitKnockbackScale: 1.0, impactParticleCount: 8, sideAttackInvulnerability: 0.15, spinAttackDeflectBonus: 1.15, bodySlamImpactMultiplier: 1.00,
    // 06 Suspensão & Hitbox
    hoverHeight: 2.1, springStiffness: 95, springDamping: 16.0, wakeAmplitude: 0.10, wakeFrequency: 5.0, fallGravity: 30, airborneGravity: 30, hoverDampingRatio: 1.00, slopePitchMultiplier: 1.50, maxVerticalVelocity: 26, trackThickness: 2.0, trackUndersideBounce: 0.34, trackUndersideFriction: 0.18, trackSurfaceFriction: 0.10, groundCompressionLimit: 0.4, hoverRepulsionForce: 280, magneticGripStrength: 1.15, suspensionRelaxRate: 7.5,
    // 07 Voo & Pouso
    airPitchControlRate: 28, airRollControlRate: 32, airSteerAuthority: 0.85, airGlideLift: 32, airGlideDrag: 5.5, airDiveAccel: 40, airDiveMaxSpeed: 70, airDrag: 0.75, airborneThreshold: 0.6, landingBoostEfficiency: 0.65, landingBoostMax: 90, landingImpactThreshold: 0.45, landingPenaltyDamage: 7, landingPenaltyDecel: 18, landingSparksCount: 18, jumpRampLaunchForce: 1.10, airStrafeThrust: 85, airPitchStability: 2.80,
    // 08 IA Avançada
    aiBaseSpeed: 110, aiAggressiveness: 1.00, aiRubberbanding: 0.25, aiLaneChangeSpeed: 0.50, aiRespawnDelay: 4.0, aiAttackRange: 10, aiAvoidanceForce: 16, aiSpeedVariance: 35, aiTopSpeedCap: 310, aiBoostFrequency: 0.20, aiBoostTopSpeed: 330, aiBoostAccel: 105, aiDashPlateAffinity: 0.65, aiSlipstreamUsage: 0.85, aiCorneringGrip: 1.05, aiBrakingTendency: 0.35, aiAirPitchControl: 0.85, aiDiveBoostSkill: 0.35, aiSideAttackSkill: 1.00, aiCatchupAcceleration: 45,
    // 09 Câmera
    cameraDistance: 19.5, cameraHeight: 7.6, cameraFOV: 0.78, cameraSpeedFOV: 0.09, cameraLag: 16, cameraShakeScale: 1.0, cameraLookahead: 38, cameraCockpitOffset: 0.7, cameraOrbitSpeed: 0.35, cameraVerticalFollow: 18, cameraShakeDecay: 1.7, cameraAirbornePitchLag: 4.5, cameraLandingDip: 0.85, cameraRollFollow: 0.35, cameraBoostFOVPulse: 0.09, cameraDriftSwing: 0.45, cameraCockpitShakeMultiplier: 1.0, cameraSpeedVignette: 0.22,
    // 10 Pista & Relevo
    trackWidthScale: 1.00, dashPlateBoost: 65, dashPlateRadius: 10, pitRechargeRate: 34, barrierBounce: 1.10, barrierFriction: 0.12, straightTrackLength: 2400, dashPlateCooldown: 1.0, buildingDensity: 55, shadowOpacity: 0.68, barrierDamageScale: 0.80, pitLaneLength: 60, elevatedTrackElevation: 60, trackBankCurvature: 0.50, dashPlateEnergyBonus: 5, wallRepulsionAngle: 0.8, trackCrestJumpBoost: 0.8, sceneryDistance: 700,
    // 11 VFX
    particleDensity: 20, particleLifespan: 0.45, speedLinesDensity: 22, engineTrailLength: 1.2, hitFlashIntensity: 0.22, engineGlowSize: 1.0, speedLinesThreshold: 120, starfieldDensity: 13, buildingWindowGlow: 0.85, landingShockwaveRadius: 6.5, airborneTrailOpacity: 0.45, sonicBoomRingSize: 1.6, diveTrailColorShift: 0.35, chassisReflectivity: 0.65, shadowSoftness: 1.6, hudGlitchIntensity: 0.30, plasmaGlowHue: 200, speedLineSpeedScale: 1.0,
    // 12 Áudio
    engineBasePitch: 65, enginePitchRange: 90, masterVolume: 0.07, boostSoundPitch: 380, engineFilterFreq: 550, impactSoundPitch: 105, sideAttackSoundPitch: 165, airWhooshVolume: 0.09, diveSoundPitch: 340, landingImpactSoundPitch: 125, dashPlateSoundPitch: 650, sonicBoomSoundPitch: 90, pitStopHumPitch: 240, airbrakeSoundVolume: 0.06, shieldWarningPitch: 880, collisionCrunchBass: 60
  },
  C: {
    // 01 Direção (User-calibrated baseline preserved 100%)
    steerRate: 89, progressivity: 1.4, inertia: 65, grip: 68, recenter: 4.5, speedInstability: 0.60, yawAccel: 28, counterSteerBoost: 1.80, steerInputFilter: 1.00, speedInstabilityThreshold: 0.58, massScale: 1.00, steerDeadzone: 0.01, highSpeedSteerDropoff: 0.12, lowSpeedSteerMultiplier: 1.30, analogSteerGamma: 1.10,
    // 02 Inclinação (User-calibrated baseline preserved 100%)
    rollResponse: 23, maxRoll: 75, tiltSteerBoost: 2.50, bankTurnForce: 62, bankDrag: 5.5, strafeThrust: 195, pitchResponse: 15.5, pitchSensitivity: 1.00, strafeDecel: 2.0, rollDamping: 14.0, quickStrafeImpulse: 55, strafeCooldown: 0.04, bankPitchCoupling: 0.35, rollReturnSpeed: 18.0, tiltSlideAssistance: 0.45,
    // 03 Drift (User-calibrated baseline preserved 100%)
    driftYawBoost: 1.90, driftGripMultiplier: 18, driftTiltBonus: 18.0, driftBrakeDecel: 3.5, slideTurnBoost: 1.60, slideDampingRatio: 45, driftThreshold: 15, driftDecelCurve: 2.5, driftCounterSteerAuthority: 1.60, driftParticleRate: 2, driftEntrySlipKick: 28, driftMaxAngle: 65, driftAngularDamping: 2.5, driftSparksIntensity: 1.60, airbrakeDragMultiplier: 1.40,
    // 04 Propulsão (User-calibrated baseline preserved 100%)
    topSpeed: 300, boostTopSpeed: 400, acceleration: 80, boostAccel: 125, boostDuration: 2.4, coastDecel: 4.0, brakeForce: 145, reverseMaxSpeed: 20, boostEnergyDrainRate: 4.5, passiveRegenRate: 6, throttleResponse: 120, superBoostThreshold: 80, boostCooldown: 0.3, draftingSpeedBonus: 28, draftingDistance: 54, engineBrakingFactor: 0.20,
    // 05 Combate (User-calibrated baseline preserved 100%)
    sideAttackForce: 500, sideAttackDuration: 0.31, sideAttackDamage: 32, spinAttackDuration: 0.84, spinAttackDamage: 52, spinAttackForce: 200, boostCost: 14, sideAttackCost: 3, spinAttackCost: 6, wallDamageScale: 1.00, sideAttackReach: 4.2, spinAttackRadius: 4.0, sideAttackCooldown: 0.35, spinAttackCooldown: 0.60, sideAttackLift: 0.0, rivalHitKnockbackScale: 1.0, impactParticleCount: 8, sideAttackInvulnerability: 0.18, spinAttackDeflectBonus: 1.50, bodySlamImpactMultiplier: 1.25,
    // 06 Suspensão & Hitbox (User-calibrated baseline preserved 100%)
    hoverHeight: 2.1, springStiffness: 250, springDamping: 50.0, wakeAmplitude: 0.12, wakeFrequency: 4.8, fallGravity: 30, airborneGravity: 30, hoverDampingRatio: 1.00, slopePitchMultiplier: 1.50, maxVerticalVelocity: 26, trackThickness: 2.5, trackUndersideBounce: 0.40, trackUndersideFriction: 0.14, trackSurfaceFriction: 0.08, groundCompressionLimit: 0.3, hoverRepulsionForce: 350, magneticGripStrength: 1.35, suspensionRelaxRate: 10.0,
    // 07 Voo & Pouso (F-Zero X/GX style aerodynamics & Dive Boost)
    airPitchControlRate: 35, airRollControlRate: 42, airSteerAuthority: 1.10, airGlideLift: 40, airGlideDrag: 5.0, airDiveAccel: 55, airDiveMaxSpeed: 85, airDrag: 0.65, airborneThreshold: 0.5, landingBoostEfficiency: 0.90, landingBoostMax: 140, landingImpactThreshold: 0.50, landingPenaltyDamage: 5, landingPenaltyDecel: 15, landingSparksCount: 24, jumpRampLaunchForce: 1.30, airStrafeThrust: 110, airPitchStability: 2.00,
    // 08 IA Avançada (High-speed competitive racing AI)
    aiBaseSpeed: 220, aiAggressiveness: 1.40, aiRubberbanding: 1.00, aiLaneChangeSpeed: 1.20, aiRespawnDelay: 4.0, aiAttackRange: 10, aiAvoidanceForce: 16, aiSpeedVariance: 35, aiTopSpeedCap: 450, aiBoostFrequency: 0.40, aiBoostTopSpeed: 480, aiBoostAccel: 140, aiDashPlateAffinity: 0.85, aiSlipstreamUsage: 1.25, aiCorneringGrip: 1.30, aiBrakingTendency: 0.25, aiAirPitchControl: 1.10, aiDiveBoostSkill: 0.60, aiSideAttackSkill: 1.40, aiCatchupAcceleration: 65,
    // 09 Câmera (User-calibrated baseline preserved 100%)
    cameraDistance: 9.5, cameraHeight: 7.8, cameraFOV: 0.78, cameraSpeedFOV: 0.10, cameraLag: 14, cameraShakeScale: 1.0, cameraLookahead: 38, cameraCockpitOffset: 0.7, cameraOrbitSpeed: 0.35, cameraVerticalFollow: 18, cameraShakeDecay: 1.7, cameraAirbornePitchLag: 5.5, cameraLandingDip: 1.10, cameraRollFollow: 0.45, cameraBoostFOVPulse: 0.12, cameraDriftSwing: 0.60, cameraCockpitShakeMultiplier: 1.2, cameraSpeedVignette: 0.28,
    // 10 Pista & Relevo (User-calibrated baseline preserved 100%)
    trackWidthScale: 0.80, dashPlateBoost: 95, dashPlateRadius: 12, pitRechargeRate: 57, barrierBounce: 1.60, barrierFriction: 0.12, straightTrackLength: 2400, dashPlateCooldown: 1.0, buildingDensity: 65, shadowOpacity: 0.68, barrierDamageScale: 0.90, pitLaneLength: 70, elevatedTrackElevation: 75, trackBankCurvature: 0.65, dashPlateEnergyBonus: 8, wallRepulsionAngle: 0.9, trackCrestJumpBoost: 1.0, sceneryDistance: 750,
    // 11 VFX (User-calibrated baseline preserved 100%)
    particleDensity: 43, particleLifespan: 1.10, speedLinesDensity: 47, engineTrailLength: 1.3, hitFlashIntensity: 0.22, engineGlowSize: 1.0, speedLinesThreshold: 120, starfieldDensity: 13, buildingWindowGlow: 0.85, landingShockwaveRadius: 8.5, airborneTrailOpacity: 0.60, sonicBoomRingSize: 2.0, diveTrailColorShift: 0.50, chassisReflectivity: 0.75, shadowSoftness: 1.8, hudGlitchIntensity: 0.35, plasmaGlowHue: 200, speedLineSpeedScale: 1.2,
    // 12 Áudio (User-calibrated baseline preserved 100%)
    engineBasePitch: 65, enginePitchRange: 90, masterVolume: 0.07, boostSoundPitch: 380, engineFilterFreq: 550, impactSoundPitch: 105, sideAttackSoundPitch: 165, airWhooshVolume: 0.12, diveSoundPitch: 420, landingImpactSoundPitch: 140, dashPlateSoundPitch: 720, sonicBoomSoundPitch: 85, pitStopHumPitch: 260, airbrakeSoundVolume: 0.08, shieldWarningPitch: 920, collisionCrunchBass: 75
  }
};