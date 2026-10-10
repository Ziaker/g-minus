# Aprovação do Protótipo 01 — Física e dinâmica

**Data:** 10/10/2026

**Decisão:** aprovado para implementação

**Baseline:** Perfil C — Inercial / Drift

**Artefato:** `prototypes/01_steering_profiles.html`

## O que foi aprovado

Foi aprovado o comportamento que o Protótipo 01 se propõe a validar: direção e resposta angular, banking/strafe, drift, propulsão e boost, combate físico, suspensão magnética, controle aéreo e pouso, dinâmica dos rivais e câmera ligada à pilotagem.

O export de calibração entregue junto da aprovação é a fonte numérica do Perfil C. Entre os valores de referência estão esterço `56 °/s`, inércia `65`, grip `68%`, velocidade máxima `500`, velocidade de boost `600`, aceleração `80`, duração de boost `2,4 s`, side-attack `32 HP` e spin-attack `52 HP`.

## O que não foi aprovado

Esta decisão não aprova aparência, direção visual, VFX, áudio ou desenho/qualidade das pistas exibidas no laboratório. Esses elementos continuam sujeitos aos respectivos protótipos e decisões.

Também não transforma automaticamente todos os 207 controles do laboratório em requisitos já integrados. A implementação pode ser fatiada, mas cada fatia deve usar o export aprovado como baseline, preservar o passo fixo de física de 120 Hz e registrar o que está efetivamente conectado ao jogo.

## Estado da implementação

Primeira fatia integrada em 10/10/2026:

- Perfil C selecionado por padrão para jogador e rivais.
- Parâmetros centralizados em `src/game/PhysicsCalibration.ts`, sem configurações de pista ou VFX.
- Direção inercial, instabilidade em alta velocidade, contraesterço, strafe/banking e grip de drift ligados à simulação.
- Velocidade, aceleração, boost, frenagem, desaceleração livre, regeneração e custos de energia ligados à calibração.
- Duração, alcance, dano e impulso de side-attack/spin-attack ligados à calibração.
- Altura/oscilação de suspensão e câmera de perseguição ligadas à calibração.

Próximas fatias de física ainda necessárias:

- voo livre, mergulho, sustentação e aterrissagem com transferência de impulso;
- suspensão spring-damper com contato real e colisão inferior da pista;
- drafting e comportamento avançado/rubberbanding dos rivais;
- telemetria comparativa para ajustar a tradução entre unidades do laboratório e da corrida.

## Critério de aceite

- `npm test` deve permanecer verde.
- `npm run build` deve concluir sem erro de TypeScript.
- O laboratório deve abrir em `/prototypes/01_steering_profiles.html`.
- Mudanças posteriores em pistas, visual ou VFX não podem ser justificadas por esta aprovação.
