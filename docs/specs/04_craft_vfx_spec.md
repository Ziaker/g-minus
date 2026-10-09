# Especificação Técnica — Protótipo 04: Laboratório de Efeitos Visuais das Naves (VFX Lab)

**Status:** Laboratório de Prototipação Visual e Efeitos — **AGUARDANDO APROVAÇÃO** (não integrado ao jogo).  
**Data:** 2026-10-09  
**Arquivo do Protótipo:** `prototypes/04_craft_vfx.html` (laboratório independente, servido no dev server e isolado do bundle de produção)  
**Referência GDD:** Itens [21–24] (dinâmica de banking e movimento), [31–35] (efeitos de super boost e consumo de escudo), [41–45] (spin attack 360°, side-attack e combate físico), [81–90] (direção visual sci-fi e legibilidade), [95] (sensação visceral de velocidade extrema) e [101–102] (telemetria e exportação JSON).

---

## 1. Motivação

Atualmente, os efeitos visuais das naves no jogo utilizam implementações básicas ou estáticas (como um único cone/cilindro para propulsão e faíscas genéricas). Para atingir a intensidade arcade visceral inspirada em **F-Zero X** e **F-Zero GX**, este laboratório foi criado para permitir a exploração, calibração e **aprovação de 3 alternativas visuais completas** para cada efeito relacionado às naves antes de qualquer integração em `src/game/Vehicle.ts` ou `src/game/Combat.ts`.

---

## 2. As 3 Alternativas para Cada Efeito Visual

### 2.1 Propulsores & Plumas de Escape (Thrusters)

| Opção | Nome | Técnica | Identidade Visual |
| :---: | :--- | :--- | :--- |
| **A** | **Plasma Plume GX** | Cone duplo concêntrico (núcleo branco incandescente + casca de plasma na cor de acento) + anéis de compressão *Mach Diamond* + luz pontual volumétrica com jitter. | F-Zero GX arcade autêntico; jato de plasma quente e denso com pulsação supersônica. |
| **B** | **Cyber Particle Jet** | Emissor contínuo de partículas instanciadas de íons em alta velocidade, rastro com decaimento alfa e dispersão aerodinâmica. | Alta tecnologia e velocidade; faíscas e esteira de fótons brilhantes. |
| **C** | **Neon Vector Grid** | Feixe cilíndrico tubular com malha wireframe gradiente e anéis poligonais estilizados. | Synthwave / Retrô Neon; estética vetorial pura com alta separação e contraste contra o asfalto escuro. |

### 2.2 Super Boost (Turbo / Hipervelocidade)

| Opção | Nome | Técnica | Identidade Visual |
| :---: | :--- | :--- | :--- |
| **A** | **Aura & Shockwave GX** | Aura esférica de energia que envolve a nave com distorção aditiva + ondas de choque elípticas disparadas periodicamente para trás + FOV kick dinâmico na câmera. | Sensação maciça de poder e rompimento da barreira sônica com campo de força de proteção. |
| **B** | **Speed Lines & Warp** | Linhas de velocidade volumétricas radiais convergindo em direção à câmera + feixes esticados de hiperespaço. | Sensação de aceleração de ficção científica em túnel dimensional. |
| **C** | **Lightning Arc Overdrive** | Arcos elétricos e raios procedurais de alta voltagem correndo pela fuselagem até a ponta das asas + superiluminação magenta/ciano. | Sobrecarga de reator de fusão com instabilidade energética visível. |

### 2.3 Spin Attack 360° (Giro Axial Ofensivo)

| Opção | Nome | Técnica | Identidade Visual |
| :---: | :--- | :--- | :--- |
| **A** | **Ciclone Plasma & Disco** | Disco de corte horizontal luminoso de grande raio + esfera de vórtice translúcida giratória em alta frequência angular. | O clássico redemoinho F-Zero X que varre múltiplos rivais na pista com clareza de área de acerto. |
| **B** | **Vórtice Lâminas Elétricas** | Anel de lâminas de choque elétrico em arco helicoidal com partículas de descarga estática. | Estilo cortante agressivo com sensação de campo eletromagnético letal. |
| **C** | **Digital Wave 3D Rings** | Anéis concêntricos hexagonais que se expandem em pulso poligonal a partir do centro de massa da máquina. | Onda de choque digital limpa e geométrica. |

### 2.4 Forma de Movimento & Física da Nave (Hover & Banking)

| Opção | Nome | Dinâmica | Sensação de Pilotagem |
| :---: | :--- | :--- | :--- |
| **A** | **Arcade GX Banking** | Inclinação agressiva de asa (*banking roll* até 65°), compensação de cauda, mergulho e elevação do nariz em aceleração/frenagem (*pitch dive/climb*), bobbing suave de sustentação magnética. | Resposta imediata, acrobática e dinâmica em curvas. |
| **B** | **Inercial Heavy Float** | Amortecimento magnético com oscilação elástica perceptível em mudanças bruscas de trajetória e micro-vibrações de motor. | Sensação de peso e massa de fuselagem blindada sobre repulsores industriais. |
| **C** | **Agile Hovercraft Jet** | Translação lateral de strafe rápida quase sem mergulho de pitch, com inclinação seca e estabilidade plana. | Deslizamento esportivo ultrapreciso sobre trilho de ar. |

### 2.5 Combate, Escudo & Elementos de Pista

| Efeito | Opção A (Arcade Clássico) | Opção B (Cyber Particle) | Opção C (Retro Vector) |
| :--- | :--- | :--- | :--- |
| **Side-Attack Bash** | Impulso lateral seco com rastro de faíscas de fuselagem no ponto de contato. | Onda de choque em arco de pressão de ar. | Rastro holográfico fantasma com estilhaços luminosos. |
| **Shield Damage Hit** | Flash de silhueta vermelha + faíscas incandescentes. | Bolha de escudo hexagonal pulsante ao redor do casco. | Efeito de interferência glitch na malha 3D. |
| **Dash Plate (+Pad)** | Explosão cônica de faíscas douradas e flash nos bocais. | Feixe ascendente de luz com túnel de anéis. | Pulso de solo neon amarelo com ondas de compressão. |

---

## 3. Tabela Completa de Sliders e Calibração

| Parâmetro | Tipo / Range | Default (A) | Descrição |
| :--- | :---: | :---: | :--- |
| `thrusterLength` | 0.40x a 2.40x | 1.00x | Comprimento longitudinal do jato de propulsão. |
| `thrusterWidth` | 0.50x a 2.00x | 1.00x | Diâmetro e espessura do bocal de escape. |
| `thrusterGlow` | 0.00x a 2.50x | 1.00x | Intensidade da luz pontual dinâmica e brilho emissivo. |
| `thrusterFlicker` | 0.20x a 3.00x | 1.00x | Taxa de tremor e pulsação do plasma em alta velocidade. |
| `thrusterParticles` | 0.00x a 2.00x | 1.00x | Densidade e dispersão do fluxo de partículas de escape. |
| `boostAuraIntensity` | 0.20x a 2.50x | 1.00x | Opacidade e brilho da aura envolvente de turbo. |
| `boostShockwaveScale`| 0.00x a 2.50x | 1.00x | Tamanho e expansão das ondas de choque sônicas. |
| `boostFovKick` | 0.00x a 2.00x | 1.00x | Abertura dinâmica de FOV na câmera ao ativar o turbo. |
| `boostGhostTrail` | 0.00x a 2.00x | 1.00x | Persistência do rastro após-imagem da fuselagem. |
| `spinRadius` | 3.0m a 12.0m | 6.80m | Raio físico e visual do disco de corte do Spin Attack. |
| `spinSpeed` | 3.0x a 18.0x | 8.00x | Velocidade angular de rotação do giro 360°. |
| `spinGlow` | 0.20x a 2.50x | 1.00x | Intensidade luminosa do campo de força durante o golpe. |
| `spinSparks` | 0.00x a 2.00x | 1.00x | Quantidade de faíscas radiais ejetadas pelo giro. |
| `motionRollMax` | 10° a 75° | 42° | Ângulo máximo de inclinação de asa nas curvas. |
| `motionPitch` | 0.00x a 2.50x | 1.00x | Mergulho e elevação do nariz em aceleração/frenagem. |
| `motionBobbing` | 0.00x a 2.50x | 1.00x | Amplitude e frequência da flutuação anti-gravidade. |
| `motionDriftYaw` | 0.20x a 2.50x | 1.00x | Ângulo de derrapagem e yaw lateral durante o drift. |
| `sideAttackImpulse` | 0.40x a 2.20x | 1.00x | Impulso e inclinação visual durante a investida lateral. |
| `shieldHitGlow` | 0.20x a 2.50x | 1.00x | Duração e intensidade do flash/bolha ao sofrer dano. |
| `sparksDensity` | 0.20x a 2.50x | 1.00x | Quantidade de partículas geradas no contato com guardrails. |

---

## 4. Controles e Funcionalidades do Protótipo

| Comando / Ação | Tecla / Botão | Descrição |
| :--- | :--- | :--- |
| **Disparar Super Boost** | <kbd>A</kbd> ou Botão "Disparar Turbo" | Ativa o turbo por 2.4s com aceleração a 1420 km/h e efeitos completos. |
| **Disparar Spin Attack** | <kbd>SHIFT</kbd> / <kbd>Z+C</kbd> ou Botão | Executa o giro de varredura radial em 360°. |
| **Side Attack Esquerda / Direita** | <kbd>Z</kbd> / <kbd>C</kbd> ou Botões | Investida lateral com inclinação de fuselagem e emissão de faíscas. |
| **Curva / Esterço** | <kbd>←</kbd> / <kbd>→</kbd> ou Botões | Inclina a nave no eixo de roll para inspecionar resposta de banking. |
| **Simular Dano no Escudo** | Botão "Simular Dano" | Dispara a animação da bolha/flash de escudo e ejeção de faíscas. |
| **Simular Dash Plate** | Botão "Dash Plate" | Simula passagem por placa turbo de chão (+95 km/h). |
| **Modo Pista ↔ Studio 360°** | Botões de Topo | Alterna entre voo contínuo na pista sci-fi ou arena de estúdio isolada. |
| **Câmera Perseguição ↔ Órbita** | Botões de Topo | Alterna entre visão dinâmica de gameplay ou câmera orbital 360°. |
| **Seletor de Nave (10 modelos)** | Barra Superior | Alterna instantaneamente entre Falcon, Fox, Goose, Stingray, etc. |

---

## 5. Contrato JSON

O laboratório permite exportar e importar configurações completas com validação atômica:

```json
{
  "machine": "falcon",
  "thrusterStyle": "A",
  "boostStyle": "A",
  "spinStyle": "A",
  "motionStyle": "A",
  "combatStyle": "A",
  "thrusterLength": 1.0,
  "thrusterWidth": 1.0,
  "thrusterGlow": 1.0,
  "thrusterFlicker": 1.0,
  "thrusterParticles": 1.0,
  "boostAuraIntensity": 1.0,
  "boostShockwaveScale": 1.0,
  "boostFovKick": 1.0,
  "boostGhostTrail": 1.0,
  "spinRadius": 6.8,
  "spinSpeed": 8.0,
  "spinGlow": 1.0,
  "spinSparks": 1.0,
  "motionRollMax": 42,
  "motionPitch": 1.0,
  "motionBobbing": 1.0,
  "motionDriftYaw": 1.0,
  "sideAttackImpulse": 1.0,
  "shieldHitGlow": 1.0,
  "sparksDensity": 1.0
}
```

- **Validação:** chaves numéricas respeitam seus intervalos mínimos e máximos; strings de estilo aceitam exclusivamente `"A"`, `"B"` ou `"C"`.
- Um clique em **📋 Copiar JSON** copia a configuração diretamente para a área de transferência.

---

## 6. Como Executar e Testar

1. No terminal, execute:
   ```bash
   npm run dev
   ```
2. Abra no navegador:
   ```
   http://localhost:5173/prototypes/04_craft_vfx.html
   ```
3. Teste as opções **A**, **B** e **C** em cada aba, ative o turbo com <kbd>A</kbd>, o giro 360° com <kbd>Shift</kbd>, e copie a combinação aprovada via JSON.
