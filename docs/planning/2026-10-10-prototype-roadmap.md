# G-MINUS — Roadmap de protótipos (revisão de 10/10/2026)

**Natureza:** planejamento. Não aprova alternativas, valores nem integração. Cada protótipo segue o gate do [GDD §11.1](../GDD.md#111-gate-de-protótipo-antes-da-implementação-101-diretriz-final).

Este documento separa três tipos de conteúdo:
- **[Decisão]**: confirmada pelo responsável.
- **[Recomendação]**: proposta técnica para o protótipo, sem aprovação.
- **[Aberta]**: questão pendente; não decidir sem autorização.

## 1. Decisões do responsável (10/10/2026)

1. **[Decisão] Sequência:** P08 → P09 → P10 → P11 → P12.

   | Nº | Protótipo |
   | :-: | :--- |
   | 08 | Física 3D, contato, voo e pouso |
   | 09 | Circuito de referência |
   | 10 | Impactos, explosões, destruição e K.O. |
   | 11 | Clash |
   | 12 | HUD, câmera e interface |

2. **[Decisão] Gate de jogabilidade antes do combate avançado:** validar uma corrida completa e divertida, próxima da meta de cerca de 3 minutos [5]. Sem isso, não se avança para o combate avançado (P10 e P11).
3. **[Decisão] Quique:** o P08 revisa a oscilação de flutuação, preservando os valores anteriores (`hover.wakeAmplitude` 0,12 e `hover.wakeFrequency` 4,8 do Perfil C) para comparação. O objetivo é contato estável, sem oscilação artificial permanente. A aprovação do Protótipo 01 continua válida até uma nova escolha ser registrada.
4. **[Decisão] Naves e peças exclusivamente cosméticas**, sem diferenças de desempenho. A definição técnica das hitboxes fica pendente de prototipação. Registro: [decisão](../decisions/2026-10-10-craft-parts-cosmetic-only.md).
5. **[Decisão] Equilíbrio competitivo como intenção:** diferenças cosméticas não podem criar vantagens físicas. A padronização exata de massa e altitude e a aplicação global das configurações do Protótipo 07 ficam **pendentes até uma discussão específica**.
6. **[Decisão] Clash com protótipo próprio (P11):**
   - mantém o *mashing* como referência do GDD [45];
   - explora três implementações distintas;
   - as duas naves continuam em alta velocidade;
   - as alternativas cobrem ativação, defesa, disputa de comandos, trajetória, resultado e IA.
7. **[Decisão] Escopo do P10:**
   - hit effects de ataques recebidos e impactos;
   - explosão e destruição;
   - colisão contra paredes e barreiras;
   - impacto leve, forte e fatal;
   - representação da eliminação e da queda para fora da pista.

   Ficam preservados os VFX aprovados no Protótipo 04 V2. As regras de eliminação e recuperação continuam pendentes.
8. **[Decisão] Pistas (P09):**
   - protótipo específico para geometria, traçado, jogabilidade e interação com a física;
   - aproveita a linguagem D e as referências ambientais do Protótipo 03, sem tratá-las como pistas aprovadas;
   - não refaz trabalho aprovado.
9. **[Decisão] P12:**
   - pelo menos três alternativas visual e funcionalmente muito diferentes, não só em cores, posições ou tamanhos;
   - eixos obrigatórios:
     - hierarquia das informações;
     - minimapa ou radar;
     - velocidade, escudo, posição, volta, tempo e adversários;
     - feedback de combate e alertas;
     - câmera;
     - legibilidade em alta velocidade;
     - configurações;
   - cada alternativa com sliders independentes, comparação visual, JSON e documentação, em Toon Vector Flux D;
   - não substitui o Protótipo 07.
10. **[Decisão] Checkpoints, IA e equipes:** organizados como questões e protótipos futuros. **Nenhuma regra detalhada está aprovada.**

## 2. Recomendações técnicas por protótipo (sem aprovação)

### P08 — Física 3D, contato, voo e pouso
- **[Recomendação]** Comparar as alternativas pelo que o jogador sente, não pela arquitetura. Escolher pela sensação, não pela sofisticação técnica: se o híbrido for melhor que um corpo totalmente livre, ele vence.
- **[Recomendação]** Três alternativas:
  1. o comportamento original do Perfil C, sem modificação, como referência;
  2. contato magnético com suspensão dinâmica e oscilação mínima em velocidade constante;
  3. um híbrido com suspensão e amortecimento ajustáveis.
- **[Recomendação]** Testes:
  - estabilidade em pista plana;
  - aderência em loops e tubos;
  - desprendimento justificado;
  - voo livre e aterrissagem;
  - equivalência com o Perfil C em pista plana.
- **[Recomendação]** Os 15 parâmetros de voo e pouso podem ser calibrados no laboratório. A integração e os valores finais passam pelo gate.
- **[Recomendação]** Câmera e HUD básicos desde o P08, como instrumentos de teste e não como proposta de interface, para detectar desorientação em loops.
- **[Recomendação]** Versão inicial enxuta: o objetivo é encontrar rápido uma pilotagem arcade divertida e reproduzível.

### P09 — Circuito de referência
- **[Recomendação]** Três experiências de pilotagem, não três métodos de construção de malha:
  - **A — Velocidade e fluidez:** retas longas, curvas amplas, velocidade sustentada, ultrapassagens.
  - **B — Verticalidade e técnica:** loops, espirais, tubos, rampas, leitura espacial.
  - **C — Disputa e risco:** largura variável, bifurcações, barreiras, zonas de ultrapassagem, exposição a quedas.

  São laboratórios comparativos, não pistas finais. As características aprovadas se combinam depois nas cinco pistas.
- **[Recomendação]** A técnica de construção da pista é escolhida pela robustez para representar essas geometrias (definida com o P08).
- **[Recomendação]** O combate existente (Side, Spin, colisões) serve como instrumento de teste de largura, barreiras e espaços de disputa. Usar uma IA básica e naves com desempenho uniforme.

### P10 — Impactos, destruição e K.O.
- **[Recomendação]** Feito no circuito de referência. As escolhas aprovadas do 04 V2 entram fixas, sem serem reabertas:
  - Escudo D;
  - Colisão B/D;
  - Side E;
  - Spin E;
  - Voo C/D, incluindo o impacto de aterrissagem.
- **[Recomendação]** O protótipo complementa o que falta:
  - explosão e destruição;
  - efeito específico de parede e barreira;
  - níveis de impacto;
  - eliminação e queda;
  - reação da câmera e alertas.
- **[Recomendação]** Regras de eliminação podem aparecer como cenários de teste, sem aprovação implícita.

### P11 — Clash
- **[Recomendação]** As três implementações de mashing devem diferir em entrada, duração, progressão, defesa e consequências. O jogador deve manter a direção durante a disputa. Se nenhuma funcionar, aí há base para revisar o requisito [45].

### P12 — HUD, câmera e interface
- **[Registro 11/10/2026]** O responsável pediu a reconstrução do P12 antes da sequência. O P12 original foi rejeitado e o **P12 V2** foi construído ([especificação](../specs/12_hud_camera_v2_spec.md)). Ele usa uma pista e uma corrida de teste próprias, sem antecipar P08/P09/P10.
- **[Decisão 11/10/2026]** **P12 V2 aprovado:**
  - HUDs A, B e C, câmeras A, B e C e todas as opções, presentes no jogo;
  - configuração padrão = JSON do responsável;
  - [registro e catálogo obrigatório](../decisions/2026-10-11-prototype-12-v2-hud-camera-approval.md).

  A integração em `src/game` está pendente: depende de autorização para alterar o jogo principal e deve conviver com a física do P08.
- **[Recomendação]** Avaliar com situações reais de corrida e combate (circuito de referência e P10).

## 3. Questões abertas

| Tema | Pendência |
| :--- | :--- |
| Hitboxes | volume padronizado, compensado ou por forma (ver a decisão) |
| Massa, altitude e Protótipo 07 | detalhes de padronização e aplicação global aos competidores; relação com a dificuldade da IA |
| Peças | nomes, funções, compatibilidade, montagem; cores por peça × Sistema B; cores aleatórias |
| Spin E | o raio visual (varredura +30 %, provisório) depende da nave; o raio de jogo é igual para todas |
| Balanço do motor | manter ou não o ajuste pré-corrida de aceleração × velocidade |
| Nova suspensão (P08) | valores finais; substituição do quique só com aprovação expressa |
| Eliminação e recuperação [17, 34, 47] | energia zero, saída da pista, reaparecimento × eliminação, colocação dos eliminados, convivência com [20] |
| Impactos (P10) | limites entre leve, forte e fatal; câmera e HUD na eliminação; Colisão B/D vale para paredes? |
| Clash [45] | entrada, desempate, duração, direção do lançamento, interação com Side e Spin, IA, fogo amigo em equipes |
| Pistas [61–70] | temas por pista, prioridade de geometrias, bifurcações, atalhos, perigos |
| Checkpoints [18, 19, 67] | quantidade e posição, validação de volta e atalho, aviso de sentido contrário |
| IA [51–59] | arquétipos, rival dedicado, rubber banding, os 11 parâmetros de IA não conectados, desempenho com 30 veículos |
| Equipes [51] | composição humana ou IA, fogo amigo, pontuação, HUD de equipe |
| Energia [31–40] | escolha entre GX e X quando divergem |
| Física (Protótipos 01 e 07) | 18 valores ambíguos, 12 divergências (esterço 89 × 56), 11 essenciais, avaliação visual do layout combinado |
| VFX (04 V2) | padrão dos toggles e forma de seleção no jogo; implementação do Spin E +30 % |
| HUD e câmera (P12 V2) | integração em `src/game` (autorização pendente); reprodução das câmeras sobre a física do P08; HUD e câmera na eliminação (P10); HUD de equipe [51] |

## 4. Protótipos futuros, depois do P12 (ordem a definir)

- Montagem e peças cosméticas (compatibilidade, encaixe, cores por peça e aleatórias).
- Checkpoints e regras de volta.
- IA: personalidades e rival dedicado.
- Equipes.
- Energia, boost e escudo [31–40].
- Expansão para as cinco pistas.

## 5. Sistemas aprovados a preservar

| Sistema | Registro |
| :--- | :--- |
| Toon Vector Flux D | [aprovação](../specs/02_toon_vector_flux_approval.md) |
| Física Perfil C (baseline; reconciliação numérica pendente) | [decisão](../decisions/2026-10-10-prototype-01-physics-approval.md) |
| Nove geometrias do Protótipo 05 e bloco canônico (uso obrigatório) | [decisão](../decisions/2026-10-10-prototype-05-craft-geometry-approval.md) |
| Sistema B de pintura | [decisão](../decisions/2026-10-10-prototype-06-paint-system-approval.md) |
| VFX do Protótipo 04 V2 | [decisão](../decisions/2026-10-10-prototype-04-v2-vfx-approval.md) |
| Protótipo 07: organização A + B + C (layout em avaliação) e classificação 53 / 25 / 15 | [especificação](../specs/07_pregame_physics_options_spec.md) |
| Gate de protótipo [101] e documentação contínua [103–104] | [GDD §11](../GDD.md) |

## 6. Divergências do código com as decisões

Ver a [auditoria de diferenças de desempenho entre naves](../audits/2026-10-10-craft-stats-divergence.md). Nenhum código foi alterado.
