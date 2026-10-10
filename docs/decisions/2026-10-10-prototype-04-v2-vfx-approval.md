# Aprovação do Protótipo 04 V2 — VFX das naves (VFX Atelier)

**Data:** 10/10/2026

**Autoridade:** responsável pelo projeto, decisão direta na conversa, com captura de tela de referência e calibração em JSON.

**Artefato:** [`prototypes/04_craft_vfx_v2.html`](../../prototypes/04_craft_vfx_v2.html) (gerado a partir de [`prototypes/vfx-atelier/`](../../prototypes/vfx-atelier/)) · [especificação](../specs/04_craft_vfx_v2_spec.md) · [evidências](../evidence/vfx-atelier/README.md)

**Bases mantidas:** [D — Toon Vector Flux](../specs/02_toon_vector_flux_approval.md), [nove modelos do Protótipo 05](2026-10-10-prototype-05-craft-geometry-approval.md) e [pintura Sistema B do Protótipo 06](2026-10-10-prototype-06-paint-system-approval.md), sem alteração.

## 1. Decisão por categoria

| # | Categoria | Decisão | Tipo |
| :-: | :--- | :--- | :--- |
| 01 | Propulsão | **A — Plasma esculpido** | escolha única |
| 02 | Super Boost | **B — Corredor vetorial: obrigatório no jogo, sempre presente, independentemente das outras escolhas.** **A — Frente de choque**, **D — Eco de velocidade** e **E — Ruptura de campo** aprovados como **toggles in-game, que podem ser ativados todos ao mesmo tempo** sobre o B. **C — Sobrecarga elétrica: não aprovado.** | composição |
| 03 | Spin Attack | **E — Campo poligonal**, com a regra de tamanho da seção 2.1 | escolha única + regra |
| 04 | Side Attack | **E — Eco e descarga, modificado** (seção 2.2) | escolha única + modificação |
| 05 | Escudo & dano | **D — Onda superficial** | escolha única |
| 06 | Drift & hover | **A, B, C e E selecionáveis**; **D — Estabilização: não aprovado**. Afterimage adicional (seção 2.3) | opções selecionáveis + adição |
| 07 | Colisão | **B — Estilhaços vetoriais** e **D — Riscos de tinta** como opções | opções selecionáveis |
| 08 | Dash & recarga | **E — Onda direcional** | escolha única |
| 09 | Voo & pouso | **C — Pulso de decolagem** e **D — Compressão de pouso** como opções | opções selecionáveis |
| 10 | Velocidade | **A — Action lines** | escolha única |

As demais alternativas **não foram escolhidas** e ficam no laboratório apenas para comparação.

## 2. Regras e modificações aprovadas

### 2.1 Spin E — tamanho igual ao da nave + 0,35

O efeito tem que **bater com o tamanho da nave mais 0,35**:

> **raio externo do campo = raio de varredura do giro da nave + 0,35 u**

- **Raio de varredura do giro:** a maior distância horizontal de qualquer vértice da nave ao eixo de rotação, ou seja, o círculo que a nave descreve ao girar. O eixo é o centro da caixa envolvente, o mesmo usado para posicionar a nave.
- **u:** unidades dos modelos aprovados do Protótipo 05. Na integração, o 0,35 deve ser convertido pela mesma escala aplicada à nave.
- O campo fica centrado no eixo de rotação. Nenhum elemento do efeito ultrapassa o raio externo.
- O raio deixou de ser ajustável no Spin E. Os demais controles (espessura, elementos, rotação, opacidade, duração) seguem calibrados.
- Raios resultantes nos nove modelos (varredura → externo, em u):

| Nave | A | B | C |
| :--- | :--- | :--- | :--- |
| Falcon | 3,814 → 4,164 | 3,457 → 3,807 | 3,862 → 4,212 |
| Fox | 3,666 → 4,016 | 3,824 → 4,174 | 3,120 → 3,470 |
| Goose | 2,826 → 3,176 | 3,481 → 3,831 | 3,318 → 3,668 |

**Interpretação registrada:** "+.35" foi entendido como **+0,35 unidade**, não +35 %. Se a intenção era +35 %, a mudança é de uma linha (`SPIN_E_MARGIN`) e precisa de confirmação do responsável.

### 2.2 Side E — afterimage mantido, descarga azul removida, speedlines laterais

- **Mantido:** o afterimage, com cópias reais da nave em contorno magenta ficando para trás do movimento.
- **Removido:** os efeitos azuis (ciano) que saíam da asa no ponto de contato.
- **Adicionado:** speedlines para a esquerda/direita, ou seja, traços horizontais paralelos ao eixo lateral, no lado oposto ao sentido do ataque, em branco e rosa, distribuídos na altura e no comprimento da nave.

### 2.3 Drift — afterimage breve e constante acima de 1300 km/h

- Enquanto o drift está ativo e a velocidade passa de **1300 km/h**, aparece um afterimage breve e constante: três cópias próximas, em contorno magenta, atrás da nave e deslocadas pelo slip.
- Vale para todas as opções selecionáveis (A, B, C, E).
- Para não piscar no limiar, a intensidade sobe linearmente de 1300 a 1350 km/h.

### 2.4 Calibração aprovada

O JSON enviado pelo responsável está arquivado literalmente em [`2026-10-10-prototype-04-v2-vfx-calibration-submitted.json`](2026-10-10-prototype-04-v2-vfx-calibration-submitted.json). Os valores das alternativas aprovadas passam a ser o **padrão** do laboratório (`APPROVED_PARAMS`).

| Alternativa | Valores aprovados |
| :--- | :--- |
| Propulsão A | length 1,3 · width 1,5 · pulse 0,65 · rate 1,65 · count 9 · spread 0,6 · persistence 1 · response 0,4 · opacity 0,85 · duration 2 |
| Boost B | extent 1,15 · width 1,6 · count 7 · rate 1,65 · opacity 0,85 · duration 2,3 |
| Boost A | extent 0,8 · width 2 · count 7 · rate 1,85 · opacity 0,7 · duration 2,8 |
| Boost D | extent 1 · width 1 · count 4 · rate 1 · opacity 0,85 · duration 2 |
| Boost E | extent 0,8 · width 1 · count 7 · rate 1,35 · opacity 0,45 · duration 1,5 |
| Spin E | width 1,3 · count 8 · rate 2 · opacity 0,85 · duration 1,4 · raio pela regra 2.1 (o `radius` 1,3 do JSON fica substituído pela regra) |
| Side E | extent 1,4 · width 1,6 · count 6 · rate 1,25 · opacity 0,85 · duration 1 |
| Escudo D | radius 1,75 · width 1 · count 5 · rate 1,65 · opacity 0,85 · duration 2 |
| Drift A | length 1,4 · width 1 · count 7 · rate 1 · opacity 0,85 · duration 2 |
| Drift B | length 2 · width 1,35 · count 9 · rate 1,4 · opacity 0,85 · duration 2 |
| Drift C / E | length 1,4 · width 1 · count 7 · rate 1 · opacity 0,85 · duration 2 |
| Colisão B | extent 1,4 · width 0,95 · count 16 · rate 1,2 · opacity 0,85 · duration 2,6 |
| Colisão D | extent 1,6 · width 0,6 · count 12 · rate 0,85 · opacity 0,5 · duration 1,3 |
| Dash E | extent 1 · width 1 · count 5 · rate 1 · opacity 0,85 · duration 2 |
| Voo C | extent 1,5 · width 1 · count 7 · rate 1 · opacity 0,85 · duration 2 |
| Voo D | extent 0,85 · width 1,55 · count 4 · rate 1,4 · opacity 0,85 · duration 0,6 |
| Velocidade A | length 2,4 · width 0,35 · count 16 · rate 1,45 · opacity 0,85 · duration 2 |

**Configuração completa reproduzível** (schema v4 do laboratório): [`2026-10-10-prototype-04-v2-vfx-approved-baseline.json`](2026-10-10-prototype-04-v2-vfx-approved-baseline.json). Mantém pintura B na baseline, os nove modelos do 05 e todos os toggles do boost ligados. A interface indica "calibração aprovada" ou "FORA da calibração aprovada" para cada alternativa aprovada.

**Fora da aprovação de calibração:**
- os valores de simulação do JSON enviado (velocidade 1590 km/h, slip etc.), que são condições de inspeção e não atributos de jogo;
- os ajustes feitos em alternativas não escolhidas.

## 3. O que continua pendente

- **Integração no jogo:** o responsável pediu que o Boost B "esteja no JOGO". Isso fica registrado como requisito da integração, mas a integração em `src/game` **ainda não foi feita**.
- **Estado padrão dos toggles do Boost** (A, D, E) no jogo, onde o jogador os liga e desliga (menu, garagem, opções) e se o estado é por nave ou global. No laboratório todos começam ligados só para pré-visualização.
- **Como o jogador escolhe** entre as opções selecionáveis (Drift A/B/C/E, Colisão B/D, Voo C/D), qual é o padrão de cada uma e se a escolha é por nave.
- **Confirmação da interpretação "+0,35 u"** do Spin E (seção 2.1).
- Desempenho em hardware-alvo; os eventos do laboratório são simulados (sem física, colisão real, som ou IA).

## 4. Implementação neste registro

- **Fontes do atelier:** `vfx-state.js` (aprovações, calibração aprovada, regras, composição do boost e JSON v4), `vfx-effects.js` (Spin E, Side E, afterimage do drift), `vfx-runtime.js` (composição in-game do boost, selos por alternativa, aviso de calibração) e `vfx-new.html`. HTML regenerado com `rebuild-vfx.mjs`.
- **Testes novos em `tests/craft_vfx_v2.test.mjs`:**
  - mapa de aprovação e calibração padrão;
  - composição do boost (B sempre presente, C impossível);
  - raio do Spin E igual à varredura + 0,35 u nos nove modelos;
  - Side E sem ciano, com afterimage e speedlines;
  - afterimage do drift só acima de 1300 km/h.
- **Física, `src/` e modelos não foram alterados.**
