# Aprovação do Protótipo 12 V2 — HUD, câmeras e interface

**Data:** 11/10/2026

**Decisão:** aprovados os **HUDs A, B e C**, as **câmeras A, B e C** e **todas as opções** do laboratório. Todos devem estar presentes no jogo, com sliders e escolha de cores nas configurações.

**Autoridade:** responsável pelo projeto, declaração direta na conversa:

> *"está tudo absolutamente perfeito, eu quero TODAS opções no jogo, inclusive as escolhas de cores e os sliders nas configurações, todas A, B e C estão perfeitamente aprovadas e quero elas PRESENTES"*

Junto com a declaração, o responsável enviou a configuração em JSON ([cópia literal](2026-10-11-prototype-12-v2-config-submitted.json)).

**Artefato:**
- [`prototypes/12_hud_camera_lab_v2.html`](../../prototypes/12_hud_camera_lab_v2.html), gerado a partir de [`prototypes/hud-camera-lab/`](../../prototypes/hud-camera-lab/). O arquivo enviado pelo responsável é idêntico byte a byte ao do repositório (SHA-256 `954f0b72…0b769`). As mudanças estão no JSON.
- [Especificação](../specs/12_hud_camera_v2_spec.md) e [evidências](../evidence/12_hud_camera_lab_v2/README.md).

**Bases mantidas sem alteração:**
- [D — Toon Vector Flux](../specs/02_toon_vector_flux_approval.md);
- [nove modelos do P05](2026-10-10-prototype-05-craft-geometry-approval.md);
- [pintura Sistema B do P06](2026-10-10-prototype-06-paint-system-approval.md);
- [VFX do P04 V2](2026-10-10-prototype-04-v2-vfx-approval.md), cuja calibração e Spin E (+0,35 u implementado; +30 % desejado) não mudam.

## 1. O que foi aprovado

| Item | Decisão |
| :--- | :--- |
| **HUD A — Flux Rush** (arcade maximalista · emoção) | aprovado, **presente no jogo** como opção selecionável |
| **HUD B — Vector Tactical** (interface tática · espaço) | aprovado, **presente no jogo** como opção selecionável |
| **HUD C — Apex Line** (precisão competitiva · tempo) | aprovado, **presente no jogo** como opção selecionável |
| **Câmera A — Cinética** | aprovada, **presente no jogo**, selecionável por botão [91–92] |
| **Câmera B — Tática** | aprovada, **presente no jogo**, selecionável por botão |
| **Câmera C — Pilotagem** | aprovada, **presente no jogo**, selecionável por botão |
| **Todas as opções de cada HUD** | presentes nas configurações do jogo, que são o catálogo da seção 3: sliders (inclusive tamanho geral e tamanho por módulo), visibilidade por módulo, texto (espaçamento e fonte), opções e seletores próprios |
| **Escolha de cores** | presente nas configurações: 8 cores por função em cada HUD, 7 paletas prontas, aviso de contraste e "aplicar aos 3 HUDs" |
| **Todos os parâmetros das câmeras** | 15 comuns + 1 especial por câmera, presentes nas configurações |
| **Regras de prioridade de alertas** (diretor P0–P3, canais, fusão, histerese) e **motion design** dos três HUDs | aprovados como implementados no laboratório ([especificação §4 e §8](../specs/12_hud_camera_v2_spec.md)) |

As **combinações são livres**: qualquer HUD com qualquer câmera, com seleções independentes, como no laboratório.

### 1.1 Configuração aprovada (padrão do jogo)

O padrão de cada opção é o **JSON enviado pelo responsável**, registrado sem alteração em [`2026-10-11-prototype-12-v2-config-submitted.json`](2026-10-11-prototype-12-v2-config-submitted.json).

A baseline reproduzível, [`2026-10-11-prototype-12-v2-approved-baseline.json`](2026-10-11-prototype-12-v2-approved-baseline.json), tem os mesmos valores, com só duas diferenças, verificadas por teste:
- `status` passa a registrar a aprovação;
- `playback` volta ao início da corrida de teste. O `time: 103.4` enviado era apenas o instante de reprodução do laboratório, sem efeito em HUD ou câmera.

- **Seleção padrão:** **HUD C + câmera B**. Comparação lado a lado: A+A × C+C.
- **VFX:** Drift A, Colisão B, Voo C, Boost A/D/E ligados, action lines ligadas e luz no mundo, todos dentro das opções já aprovadas no P04 V2.
- **Câmeras:** os valores enviados são iguais aos padrões do laboratório.
- **HUDs:** os valores alterados pelo responsável aparecem **em negrito** no catálogo da seção 3.

**Os demais valores são escolhas livres do jogador.** Escolher tamanho, cores e módulos é o propósito das opções. O botão "restaurar" de cada seção volta à configuração aprovada.

## 2. Fora do escopo desta aprovação

- **Pista, corrida e simulação de teste** do laboratório: pista de 19,67 km, 30 competidores, semente `20261011`, roteiro de cenários. São instrumentos de avaliação e **não aprovam** física (P08), circuito (P09), impactos e eliminação (P10), Clash (P11), IA, energia ou regras de corrida.
- **Recursos de laboratório** que não são configurações do jogo:
  - vistas de comparação (lado a lado, HUD×3, CÂM×3, matriz 3×3);
  - quadros 16:9/21:9/9:16 com letterbox;
  - linha do tempo, cenários e diagnóstico;
  - painel "Corrida" e luz "câmera" (modo de diagnóstico do 06).
- **O P12 original** continua rejeitado ([arquivo](../../archive/2026-10-11-p12-v1-rejeitado/README.md)).
- **Sem efeito sobre outras decisões:** P04 V2 (inclusive o Spin E), P05, P06, P07 e a decisão de peças cosméticas.
- **Itens do GDD que continuam pendentes:** a câmera e o HUD na eliminação, previstos para o P10, e o HUD de equipe [51].

## 3. Catálogo obrigatório para o jogo

Toda opção abaixo deve existir no menu de configurações do jogo, com a mesma faixa, o mesmo passo e o mesmo efeito do laboratório. Os IDs são os do JSON. O teste 17 confere que este catálogo cita todas as opções do laboratório.

- Um HUD selecionado (A, B ou C) e uma câmera selecionada (A, B ou C), independentes.
- Seções por HUD:
  - Geral (inclui o tamanho do HUD);
  - Tamanho dos módulos;
  - Módulos visíveis;
  - Texto;
  - Cores e fundos;
  - seção própria da proposta;
  - Opções.

  Cada seção tem "restaurar".
- **Cores:** um seletor de cor por função, as 7 paletas, o contraste WCAG ao vivo (texto ≥ 4,5:1; primária, secundário e perigo ≥ 3:1, com aviso ⚠) e o botão "aplicar cores e fundos aos 3 HUDs".
- **Persistência:** as escolhas do jogador ficam salvas. Também há exportação e importação no formato do laboratório (`gminus.p12v2.hud-camera-lab`, versão 2), estrita e atômica.

"Referência anterior" é o valor-base do slider antes da aprovação. Ele é mantido só para os testes de legibilidade do motor de layout.

### HUD A — Flux Rush (37 opções)

| Seção | Opção | id | Faixa | **Padrão aprovado** | Referência anterior |
| :--- | :--- | :--- | :--- | ---: | ---: |
| Geral | Tamanho do HUD | `scale` | 0,5–2 × | **0,5** | 1 |
| Geral | Opacidade | `opacity` | 0,4–1 | **0,78** | 1 |
| Geral | Margem de segurança | `safeArea` | 0–8 % | **5,6** | 3 |
| Tamanho dos módulos | Velocímetro e lâmina | `sizeSpeed` | 0,6–1,6 × | **1,08** | 1 |
| Tamanho dos módulos | Posição | `sizePosition` | 0,6–1,6 × | **1,06** | 1 |
| Tamanho dos módulos | Painel de energia e volta | `sizeEnergy` | 0,6–1,6 × | **1,13** | 1 |
| Tamanho dos módulos | Minimapa | `sizeMap` | 0,6–1,6 × | **1,6** | 1 |
| Tamanho dos módulos | Adesivos de alerta | `sizeAlerts` | 0,6–1,6 × | **1,09** | 1 |
| Tamanho dos módulos | Faixas de volta, largada e chegada | `sizeBanner` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Marcas de combate e rival | `sizeCombat` | 0,6–1,6 × | 1 | 1 |
| Módulos visíveis | Velocímetro e lâmina | `showSpeed` | liga/desliga | ligado | ligado |
| Módulos visíveis | Posição | `showPosition` | liga/desliga | ligado | ligado |
| Módulos visíveis | Energia e impulsos | `showEnergy` | liga/desliga | ligado | ligado |
| Módulos visíveis | Volta e tempos | `showLap` | liga/desliga | ligado | ligado |
| Módulos visíveis | Minimapa | `minimap` | liga/desliga | ligado | ligado |
| Módulos visíveis | Marcas de combate, rival e curvas | `showCombat` | liga/desliga | ligado | ligado |
| Módulos visíveis | Faixas de volta, largada e chegada | `showBanner` | liga/desliga | ligado | ligado |
| Módulos visíveis | Alertas e chamadas | `showAlerts` | liga/desliga | ligado | ligado |
| Módulos visíveis | Efeitos de borda (foco, impacto, ameaça, borda aberta) | `showEffects` | liga/desliga | ligado | ligado |
| Texto | Espaçamento entre letras | `letterSpacing` | 0,05–0,5 | **0,3** | 0,2 |
| Texto | Espaçamento entre linhas | `lineSpacing` | 0,8–1,6 × | **1,6** | 1 |
| Texto | Fonte do texto de sistema | `font` | Condensada (padrão) / Larga / Monoespaçada | **Monoespaçada** | Condensada (padrão) |
| Cores e fundos | Opacidade dos fundos | `panelAlpha` | 0–1,6 × | **0,54** | 1 |
| Cores e fundos | Cor — Primária | `colPrimary` | #rrggbb (seletor + 7 paletas) | **`#0091ff`** | `#43f0de` |
| Cores e fundos | Cor — Destaque | `colAccent` | #rrggbb (seletor + 7 paletas) | **`#df5858`** | `#ff4794` |
| Cores e fundos | Cor — Aviso | `colWarn` | #rrggbb (seletor + 7 paletas) | **`#ff0000`** | `#ffa636` |
| Cores e fundos | Cor — Perigo | `colDanger` | #rrggbb (seletor + 7 paletas) | **`#ff3d00`** | `#ff2a4f` |
| Cores e fundos | Cor — Texto principal | `colText` | #rrggbb (seletor + 7 paletas) | **`#ffffff`** | `#fff3d6` |
| Cores e fundos | Cor — Texto secundário | `colMuted` | #rrggbb (seletor + 7 paletas) | **`#ffffff`** | `#8d87b5` |
| Cores e fundos | Cor — Especial | `colSpecial` | #rrggbb (seletor + 7 paletas) | **`#ffcf66`** | `#c06bff` |
| Cores e fundos | Cor — Fundo e contorno | `colPanel` | #rrggbb (seletor + 7 paletas) | **`#0d0700`** | `#07060f` |
| Estilo e movimento | Intensidade cinética | `kinetic` | 0–1,5 × | 1 | 1 |
| Estilo e movimento | Peso da tinta | `inkWeight` | 0–2 × | 1 | 1 |
| Estilo e movimento | Desalinhamento de impressão | `misregistration` | 0–2 × | 1 | 1 |
| Estilo e movimento | Linhas de foco | `focusLines` | 0–1 | 0,6 | 0,6 |
| Estilo e movimento | Retícula | `halftone` | 0–1 | 0,55 | 0,55 |
| Estilo e movimento | Duração das faixas | `bannerHold` | 0,6–1,8 × | 1 | 1 |

### HUD B — Vector Tactical (40 opções)

| Seção | Opção | id | Faixa | **Padrão aprovado** | Referência anterior |
| :--- | :--- | :--- | :--- | ---: | ---: |
| Geral | Tamanho do HUD | `scale` | 0,5–2 × | **0,84** | 1 |
| Geral | Opacidade | `opacity` | 0,4–1 | **0,93** | 1 |
| Geral | Margem de segurança | `safeArea` | 0–8 % | 3 | 3 |
| Tamanho dos módulos | Cabeçalho (posição e volta) | `sizeHead` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Escada tática | `sizeLadder` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Medidor de potência | `sizeGauge` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Radar | `sizeRadar` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Rótulos dos colchetes | `sizeBrackets` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Chamadas táticas | `sizeAlerts` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Dano e ataque iminente | `sizeCombat` | 0,6–1,6 × | 1 | 1 |
| Módulos visíveis | Cabeçalho (posição e volta) | `showHead` | liga/desliga | ligado | ligado |
| Módulos visíveis | Escada tática | `showLadder` | liga/desliga | ligado | ligado |
| Módulos visíveis | Medidor de potência | `showGauge` | liga/desliga | ligado | ligado |
| Módulos visíveis | Radar | `radar` | liga/desliga | ligado | ligado |
| Módulos visíveis | Colchetes sobre adversários | `showBrackets` | liga/desliga | ligado | ligado |
| Módulos visíveis | Ameaças fora da tela e ataque iminente | `showThreats` | liga/desliga | ligado | ligado |
| Módulos visíveis | Indicador direcional de dano | `showDamage` | liga/desliga | ligado | ligado |
| Módulos visíveis | Alertas e chamadas | `showAlerts` | liga/desliga | ligado | ligado |
| Texto | Espaçamento entre letras | `letterSpacing` | 0,05–0,5 | 0,2 | 0,2 |
| Texto | Espaçamento entre linhas | `lineSpacing` | 0,8–1,6 × | 1 | 1 |
| Texto | Fonte do texto de sistema | `font` | Condensada (padrão) / Larga / Monoespaçada | Condensada (padrão) | Condensada (padrão) |
| Cores e fundos | Opacidade dos fundos | `panelAlpha` | 0–1,6 × | **0,54** | 1 |
| Cores e fundos | Contorno do texto | `outline` | 0–2 × | **0,88** | 1 |
| Cores e fundos | Cor — Primária | `colPrimary` | #rrggbb (seletor + 7 paletas) | **`#3587de`** | `#43f0de` |
| Cores e fundos | Cor — Destaque | `colAccent` | #rrggbb (seletor + 7 paletas) | **`#df5858`** | `#ff4794` |
| Cores e fundos | Cor — Aviso | `colWarn` | #rrggbb (seletor + 7 paletas) | **`#ff0000`** | `#ffa636` |
| Cores e fundos | Cor — Perigo | `colDanger` | #rrggbb (seletor + 7 paletas) | **`#ff3d00`** | `#ff2a4f` |
| Cores e fundos | Cor — Texto principal | `colText` | #rrggbb (seletor + 7 paletas) | **`#ffffff`** | `#fff3d6` |
| Cores e fundos | Cor — Texto secundário | `colMuted` | #rrggbb (seletor + 7 paletas) | **`#ffffff`** | `#8d87b5` |
| Cores e fundos | Cor — Especial | `colSpecial` | #rrggbb (seletor + 7 paletas) | **`#ffcf66`** | `#c06bff` |
| Cores e fundos | Cor — Fundo e contorno | `colPanel` | #rrggbb (seletor + 7 paletas) | **`#0d0700`** | `#07060f` |
| Leitura espacial | Alcance de ameaças | `threatRange` | 40–200 m | **40** | 110 |
| Leitura espacial | Raio do anel | `ringRadius` | 6–16 m | **9,5** | 10,5 |
| Leitura espacial | Opacidade da camada no mundo | `worldOpacity` | 0–1 | 0,85 | 0,85 |
| Leitura espacial | Alcance dos colchetes | `bracketRange` | 40–320 m | 180 | 180 |
| Leitura espacial | Alcance do radar | `radarRange` | 120–600 m | **330** | 280 |
| Leitura espacial | Linhas da escada | `ladderRows` | 1–4 ± | **4** | 2 |
| Leitura espacial | Persistência do indicador de dano | `damagePersist` | 0,4–2,5 s | **1** | 1,2 |
| Opções | Indicadores de janela de ataque | `attackAssist` | liga/desliga | ligado | ligado |
| Opções | Modo do radar | `radarMode` | Local (relativo) / Circuito inteiro | Local (relativo) | Local (relativo) |

### HUD C — Apex Line (39 opções)

| Seção | Opção | id | Faixa | **Padrão aprovado** | Referência anterior |
| :--- | :--- | :--- | :--- | ---: | ---: |
| Geral | Tamanho do HUD | `scale` | 0,5–2 × | **0,77** | 1 |
| Geral | Opacidade | `opacity` | 0,4–1 | 1 | 1 |
| Geral | Margem de segurança | `safeArea` | 0–8 % | 3 | 3 |
| Tamanho dos módulos | Faixa de previsão | `sizeStrip` | 0,6–1,6 × | 1 | 1 |
| Tamanho dos módulos | Posição e intervalos | `sizePos` | 0,6–1,6 × | **1,43** | 1 |
| Tamanho dos módulos | Tempo, delta e setores | `sizeTiming` | 0,6–1,6 × | **1,39** | 1 |
| Tamanho dos módulos | Velocidade, escudo e impulsos | `sizeCluster` | 0,6–1,6 × | **1,09** | 1 |
| Tamanho dos módulos | Radar | `sizeRadar` | 0,6–1,6 × | **1,31** | 1 |
| Tamanho dos módulos | Módulo rival | `sizeRival` | 0,6–1,6 × | **1,13** | 1 |
| Tamanho dos módulos | Alertas, largada e chegada | `sizeAlerts` | 0,6–1,6 × | **1,11** | 1 |
| Módulos visíveis | Faixa de previsão | `showStrip` | liga/desliga | ligado | ligado |
| Módulos visíveis | Posição e intervalos | `showPos` | liga/desliga | ligado | ligado |
| Módulos visíveis | Tempo, delta e setores | `showTiming` | liga/desliga | ligado | ligado |
| Módulos visíveis | Velocidade, escudo e impulsos | `showCluster` | liga/desliga | ligado | ligado |
| Módulos visíveis | Radar | `radar` | liga/desliga | ligado | ligado |
| Módulos visíveis | Módulo rival | `showRival` | liga/desliga | ligado | ligado |
| Módulos visíveis | Alertas e chamadas | `showAlerts` | liga/desliga | ligado | ligado |
| Texto | Espaçamento entre letras | `letterSpacing` | 0,05–0,5 | **0,32** | 0,2 |
| Texto | Espaçamento entre linhas | `lineSpacing` | 0,8–1,6 × | **1,13** | 1 |
| Texto | Fonte do texto de sistema | `font` | Condensada (padrão) / Larga / Monoespaçada | Condensada (padrão) | Condensada (padrão) |
| Cores e fundos | Opacidade dos fundos | `panelAlpha` | 0–1,6 × | **0,54** | 1 |
| Cores e fundos | Contorno do texto | `outline` | 0–2 × | **0,88** | 1 |
| Cores e fundos | Cor — Primária | `colPrimary` | #rrggbb (seletor + 7 paletas) | **`#0091ff`** | `#43f0de` |
| Cores e fundos | Cor — Destaque | `colAccent` | #rrggbb (seletor + 7 paletas) | **`#df5858`** | `#ff4794` |
| Cores e fundos | Cor — Aviso | `colWarn` | #rrggbb (seletor + 7 paletas) | **`#ff0000`** | `#ffa636` |
| Cores e fundos | Cor — Perigo | `colDanger` | #rrggbb (seletor + 7 paletas) | **`#ff3d00`** | `#ff2a4f` |
| Cores e fundos | Cor — Texto principal | `colText` | #rrggbb (seletor + 7 paletas) | **`#ffffff`** | `#fff3d6` |
| Cores e fundos | Cor — Texto secundário | `colMuted` | #rrggbb (seletor + 7 paletas) | **`#ffffff`** | `#8d87b5` |
| Cores e fundos | Cor — Especial | `colSpecial` | #rrggbb (seletor + 7 paletas) | **`#ffcf66`** | `#c06bff` |
| Cores e fundos | Cor — Fundo e contorno | `colPanel` | #rrggbb (seletor + 7 paletas) | **`#0d0700`** | `#07060f` |
| Previsão e contexto | Janela da previsão (tempo) | `forecastSeconds` | 2–12 s | **7,3** | 7 |
| Previsão e contexto | Alcance máximo da previsão | `forecastRange` | 800–4000 m | **2500** | 2400 |
| Previsão e contexto | Largura da faixa de previsão | `stripWidth` | 0,35–0,9 × tela | **0,61** | 0,5 |
| Previsão e contexto | Janela do módulo rival | `rivalWindow` | 0,3–3 s | **1,2** | 1 |
| Previsão e contexto | Opacidade em cruzeiro | `dimLevel` | 0,15–0,9 | **0,44** | 0,4 |
| Opções | Recolher módulos em cruzeiro | `autoHide` | liga/desliga | ligado | ligado |
| Opções | Marcadores de frenagem/ápice na pista | `trackMarkers` | liga/desliga | ligado | ligado |
| Opções | Referência do delta | `deltaRef` | Melhor volta / Última volta | Melhor volta | Melhor volta |
| Opções | Escala da previsão | `forecastMode` | Tempo até chegar / Distância | Tempo até chegar | Tempo até chegar |

### Câmeras A, B e C (16 parâmetros cada)

| Parâmetro | id | Faixa | **A Cinética** | **B Tática** | **C Pilotagem** |
| :--- | :--- | :--- | ---: | ---: | ---: |
| Distância | `distance` | 4–50 m | 11 | 26 | 9,5 |
| Altura | `height` | 0,5–30 m | 2,8 | 11 | 2,2 |
| Pitch | `pitch` | -5–40 ° | 6 | 12 | 4 |
| FOV base | `fovBase` | 45–90 ° | 66 | 58 | 62 |
| Resposta do FOV à velocidade | `fovSpeed` | 0–30 ° | 16 | 5 | 8 |
| Look-ahead | `lookAhead` | 0–400 m | 40 | 170 | 150 |
| Suavização (posição) | `smoothing` | 0–1  | 0,55 | 0,7 | 0,25 |
| Inércia (rotação) | `inertia` | 0–1  | 0,5 | 0,75 | 0,3 |
| Acompanhamento de curvas | `curveFollow` | 0–1  | 0,5 | 0,3 | 0,85 |
| Inclinação lateral | `roll` | 0–1  | 0,7 | 0,15 | 0,1 |
| Resposta ao drift | `driftResponse` | 0–1  | 0,6 | 0,1 | 0,2 |
| Resposta a impactos | `impactResponse` | 0–1,5  | 1 | 0,3 | 0,25 |
| Antecipação de ameaças | `threatFraming` | 0–1  | 0,4 | 0,8 | 0,2 |
| Reação a superfícies verticais/invertidas | `invertedFollow` | 0,1–1  | 0,8 | 0,7 | 0,9 |
| Visibilidade da trajetória | `pathVisibility` | 0–1  | 0,4 | 0,6 | 0,8 |
| Recuo no impulso (só A) | `boostPull` | 0–1 | 0,5 | — | — |
| Centralização na pista (só B) | `laneCentering` | 0–1 | — | 0,6 | — |
| Mira no ápice (só C) | `apexBias` | 0–1 | — | — | 0,4 |

### Paletas prontas (aplicam as 8 cores de uma vez; depois cada cor é livre)

| Paleta | Primária | Destaque | Aviso | Perigo | Texto | Secundário | Especial | Fundo |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Flux · padrão D-TOON | `#43f0de` | `#ff4794` | `#ffa636` | `#ff2a4f` | `#fff3d6` | `#8d87b5` | `#c06bff` | `#07060f` |
| Alto contraste | `#00f0ff` | `#ff4fd8` | `#ffd400` | `#ff3b30` | `#ffffff` | `#d0d0e0` | `#c4a0ff` | `#000000` |
| Daltonismo · Okabe-Ito | `#56b4e9` | `#cc79a7` | `#f0e442` | `#ff8c1a` | `#ffffff` | `#a9b6c4` | `#9ab8ff` | `#05070d` |
| Âmbar monocromático | `#ffb000` | `#ffd27a` | `#ff8a00` | `#ff3d00` | `#ffe7b8` | `#a8875a` | `#ffcf66` | `#0d0700` |
| Gelo | `#7fd8ff` | `#b28cff` | `#ffd36b` | `#ff4d6d` | `#eaf6ff` | `#8aa1b8` | `#a9c7ff` | `#050a12` |
| Vapor | `#01cdfe` | `#ff71ce` | `#fffb96` | `#ff3864` | `#fdf0ff` | `#b29ccf` | `#b967ff` | `#0b0418` |
| Fósforo verde | `#39ff88` | `#c2ff4d` | `#ffd84d` | `#ff4d4d` | `#e8ffe8` | `#7fae8a` | `#7dffd4` | `#020a05` |

## 4. Medições da configuração aprovada (registro, sem alteração)

Os valores são do responsável e foram mantidos. Medições do laboratório nos instantes de energia crítica, defesa e volta final:

| Resolução | HUD A | HUD B | HUD C |
| :--- | :--- | :--- | :--- |
| 1280×720 | menor texto 5,0 px; velocidade 41,8 px | menor texto 7,8 px; velocidade 30,2 px | menor texto 7,2 px; velocidade 35,8 px |
| 1920×1080 | menor texto 7,6 px; velocidade 62,6 px | menor texto 11,8 px; velocidade 45,4 px | menor texto 10,8 px; velocidade 53,7 px |
| 2560×1440 | menor texto 10,1 px; velocidade 83,5 px | menor texto 15,7 px; velocidade 60,5 px | menor texto 14,4 px; velocidade 71,6 px |

- **Sem sobreposição** entre módulos-chave nessas resoluções nem em 9:16. O retrato do C foi corrigido no motor de layout nesta etapa: a faixa de previsão agora fica abaixo dos blocos de posição e tempo. Nenhum valor mudou.
- **Contraste contra o fundo `#0d0700`:** texto 20:1; primária 5,4–6,2:1; aviso 5,0:1; perigo 5,7:1; destaque 5,4:1. Todos passam no critério do laboratório.
- **Escolhas que o laboratório sinaliza** (decisão do responsável, registrada sem alterar):
  - texto secundário = texto principal (`#ffffff`), então legendas e unidades não se distinguem mais por cor;
  - aviso (`#ff0000`) e perigo (`#ff3d00`) ficaram quase com a mesma cor;
  - o HUD A no tamanho 0,5 × deixa os textos menores do painel abaixo de 9 px em 1080p e 720p.
  - no HUD A, o painel de energia e volta é tingido pela cor de destaque (`#df5858`), e os rótulos "ENERGIA", "IMPULSO" e "VOLTA" usam a cor de aviso (`#ff0000`). Por isso, ficam com pouco contraste contra o painel (captura `00-configuracao-aprovada-hud-A-cam-B.jpg`). O aviso de contraste do laboratório compara as cores só com o fundo `colPanel`, e não com os painéis tingidos do A.

  O jogador pode mudar tudo isso nas configurações.

## 5. Estado da implementação

- **Laboratório:**
  - abre na configuração aprovada, embutida no build a partir de [`2026-10-11-prototype-12-v2-approved-baseline.json`](2026-10-11-prototype-12-v2-approved-baseline.json), a fonte de verdade;
  - mostra o selo "P12 V2 APROVADO · 11/10/2026";
  - "restaurar" volta à baseline;
  - JSON exportado antes da aprovação, inclusive o enviado, continua importável.
- **Testes** em `tests/hud_camera_lab_v2.test.mjs`:
  - o teste 17 confere a baseline contra o JSON enviado, o padrão do laboratório, a importação do arquivo enviado, a presença de todas as opções neste catálogo e o registro no GDD;
  - o teste 12 mede o motor de layout na referência neutra.
- **Integração em `src/game`: pendente.** O jogo principal ainda tem o HUD em DOM e a câmera única do código antigo, e não foi alterado. O P08 (física 3D, contato A e recuperação aérea) foi aprovado em 11/10/2026 ([registro](2026-10-11-prototype-08-physics-approval.md)) e também tem a integração pendente. A integração do P12 exige pedido explícito, deve vir **depois da física do P08** e segue as condições da seção 6.

## 6. Critério de aceite da integração

1. Os três HUDs e as três câmeras existem no jogo, com seleção independente. A câmera pode ser trocada por botão durante a corrida [91–92].
2. Todas as opções do catálogo da seção 3 estão no menu de configurações, com as mesmas faixas, passos, efeitos e padrões.
3. As escolhas do jogador persistem entre sessões. O mesmo JSON exportado pelo laboratório importa no jogo, e vice-versa.
4. **Paridade visual:** com a configuração aprovada e o mesmo estado de corrida, o jogo desenha cada HUD como o laboratório. Isso inclui fonte vetorial, motion design, prioridades de alertas, paleta por HUD e camada no mundo de B e C.
5. **Paridade de câmera:** "para cima" vindo da pista, limite de mira de 55°, garantia de enquadramento e os 16 parâmetros. Se a física definitiva do P08 tornar impossível reproduzir exatamente algum comportamento, a divergência deve ser exposta ao responsável antes de mudar escopo ([GDD §11.1](../GDD.md#111-gate-de-protótipo-antes-da-implementação-101-diretriz-final)).
6. **Escala física antes do km/h:** os laboratórios P08 e P12 mostram velocidade com o fator 3,6, que só converte m/s em km/h. Isso **não comprova** que o jogo principal use 1 u = 1 m. Antes de exibir km/h no jogo, a escala física do jogo (1 u = ? m) deve ser definida e registrada, e velocímetro, alcances em metros (radar, colchetes, previsão) e distâncias devem usá-la.
7. **Câmera no voo:** as câmeras do P12 tiram o "para cima" da normal da pista. Em voo livre, o P08 estabiliza a orientação da nave em direção ao horizonte (120°/s), e a câmera dele segue esse referencial estabilizado, não o pitch voluntário. A integração deve passar a câmera para o referencial estabilizado do P08 ao sair da pista e voltar à normal da pista no pouso, sem saltos. Essa transição deve ser validada em teste (desprendimento, voo, recuperação com pitch e boost, pouso) antes de concluir.
8. `npm test` e `npm run build` permanecem verdes. Os dados do jogo (velocidade, escudo, posição, intervalos, previsão da pista, eventos) substituem a telemetria simulada do laboratório sem mudar o contrato do HUD.
