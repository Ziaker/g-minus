# Especificação Técnica — Protótipo 02: Laboratório de Visuais de Naves

**Status:** **DIREÇÃO VISUAL C — RETRO VECTOR APROVADA**, em 09/10/2026, por declaração do responsável. Configuração final de sliders, geometria, demais estilos e integração ao jogo **NÃO APROVADAS**.  
**Data:** 2026-10-09  
**Arquivo do Protótipo:** `prototypes/02_ship_visuals.html` (laboratório independente, não entra no bundle de produção)  
**Referência GDD:** Itens [71] (dez veículos com paletas distintas), [72, 78] (estrutura modular de peças), [81–90] (Direção Visual — especialmente [83] leitura contra o cenário, [87] famílias de silhueta e [89] identidade individual), [95] (sensação de velocidade) e [101–102] (telemetria e exportação JSON).

---


> **Atualização de 09/10/2026 — v6 WebGL:** O arquivo `prototypes/02_ship_visuals.html` foi atualizado nesta branch para o laboratório v6, com dez modelos, cinco estilos, renderização WebGL própria e geometria única por nave. **As seções antigas sobre Three.js r128, apenas três alternativas, ranges e JSON anteriores descrevem a versão histórica e não devem ser usadas como contrato da v6.** O aditivo ao final documenta a nova referência. 

## 1. Motivação

Os modelos atuais do jogo (`src/game/Vehicle.ts`) compartilham a mesma linguagem de construção (cone + caixa + cilindro) e diferem quase só por cor e proporção, o que enfraquece os requisitos [87] (silhuetas distintas por família) e [89] (identidade individual por silhueta + cor + iluminação + elementos mecânicos próprios). Este laboratório existe para **aprovar uma direção visual e uma família de silhuetas antes de qualquer integração** — por quê, e não como. A integração em `Vehicle.ts` só deve acontecer após aprovação registrada desta especificação.

## 2. As 3 Alternativas de Direção Visual

| Opção | Nome | Técnica | Caráter |
| :---: | :--- | :--- | :--- |
| **A** | Anime Cel Neon | `MeshToonMaterial` com gradiente de 4 degraus + contorno preto por casca invertida (`BackSide` escalada 1.05×) + luz de rim ciano | Anime/low-poly, família exigida pelo GDD [81–90] |
| **B** | Cyber Chrome | `MeshStandardMaterial` metálico (metalness 0.9), acabamentos emissivos proporcionais ao brilho, overlay de malha de fios técnica | Industrial cromado, máxima leitura mecânica |
| **C** | Retro Vector | Preenchimento plano vetorial (`MeshBasicMaterial`), arestas brancas (`EdgesGeometry`), sprites de glow aditivo, fundo violeta | Sintwave retrô, máxima separação do cenário [83] |

Cada alternativa carrega **defaults próprios de sliders** (A: neutro; B: brilho 1.45, cabine 0.90; C: saturação +0.18, envergadura 1.08), de modo que as três opções são visualmente diferentes mesmo sem ajuste manual.

## 3. Dez Silhuetas Distintas (GDD [87, 89])

Cada nave é construída por um arquétipo próprio (agulha, prora, asa, garra etc.), agrupado em 4 sub-grupos nomeados (`nose`, `cockpit`, `wings`, `engines`) para espelhar a estrutura modular de 4 peças do GDD [72, 78]:

| Nave | Arquétipo | Família [87] | Elementos próprios [89] |
| :--- | :--- | :--- | :--- |
| Blue Falcon | Dart | Aerodinâmica | agulha delta, estabilizadores, carenagens de entrada |
| Golden Fox | Needle | Aerodinâmica | agulha ultraleve, canards, quilha dorsal |
| Wild Goose | Ram | Robusta | proa de abate em losango, saias blindadas, anéis de bocal |
| Fire Stingray | Manta | Aerodinâmica | corpo-asa largo arredondado, cauda, flaps de ponta |
| White Cat | Twin-Fork | Aerodinâmica | nariz bifurcado, barbatanas "orelha", bolha de cristal |
| Red Gazelle | Rocket | Aerodinâmica | corpo cilíndrico, aletas traseiras, motor único grande |
| Iron Tiger | Block | Robusta | lajes angulares escalonadas, gaiola de cabine, tríplice turbina |
| Deep Claw | Pincer | Agressiva | garras curvas biônicas de 2 segmentos, nadadeletas, espinhos |
| Black Bull | Brute | Robusta | casco largo, chifres dianteiros, escudos laterais, aletas diabo |
| Blood Hawk | Gull | Aerodinâmica | asas de gaivota (diédrico + varrimento), dentes, bico longo |

## 4. Parâmetros e Intervalos (sliders independentes)

| Parâmetro | Tipo / Range | Default (A) | Efeito |
| :--- | :---: | :---: | :--- |
| `length` | 0.70 a 1.40 | 1.00 | Alongamento da nave (eixo Z, forward) |
| `width` | 0.70 a 1.40 | 1.00 | Largura da fuselagem (eixo X) |
| `wingSpan` | 0.60 a 1.60 | 1.00 | Envergadura do sub-grupo de asas |
| `canopy` | 0.50 a 1.60 | 1.00 | Tamanho do sub-grupo de cabine |
| `glow` | 0.00 a 2.00 | 1.00 | Emissão de acabamentos (B), opacidade/escala dos sprites de glow e intensidade da luz da nave |
| `saturation` | -0.50 a +0.50 | 0.00 | Deslocamento HSL de saturação das cores base (fuselagem, escuro, acento) |

## 5. Vistas e Controles

| Ação | Controle |
| :--- | :--- |
| Orbitar / Zoom | Arrastar / roda do mouse |
| Direção visual | Botões A/B/C ou teclas <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> |
| Vitrine ↔ Galeria (10 naves lado a lado) | Botões ou <kbd>V</kbd> |
| Rotação automática (turntable) | Botão ou <kbd>R</kbd> |
| Variação aleatória de silhueta | Botão "Embaralhar Silhueta" |
| Selecionar nave | Botões da seção 2 (na galeria, a câmera enquadra a nave escolhida) |

A nave flutua suavemente (bob vertical) e gira em turntable; a galeria mostra as 10 silhuetas em 2 fileiras × 5 para comparação direta de variedade.

## 6. Contrato JSON

Objeto plano, compatível com o padrão do Protótipo 01:

```json
{ "machine": "falcon", "style": "A", "length": 1.00, "width": 1.00, "wingSpan": 1.00, "canopy": 1.00, "glow": 1.00, "saturation": 0.00 }
```

- `machine`: id de uma das 10 naves; `style`: `"A"`, `"B"` ou `"C"`; os 6 numéricos respeitam os ranges dos sliders.
- **Validação atômica:** chaves desconhecidas são ignoradas, mas qualquer valor fora do tipo/range **rejeita toda a operação** sem alterar nada.
- Copiar/Aplicar em 1 clique; fallback manual se a área de transferência estiver indisponível.

## 7. Validação realizada

- `npm run build` (tsc + Vite) e `npm test` **não são afetados**: o laboratório é um HTML autônomo servido em `/prototypes/`, fora do bundle de produção.
- Three.js r128 via CDN (mesma convenção do Protótipo 01); sem novas dependências no `package.json`.

## 8. Limites e pendências

- Protótipo de **inspeção visual estática**: não mede desempenho de GPU, não anima em movimento (sem sensação de velocidade [95] em corrida) e não testa iluminação dinâmica da pista.
- As silhuetas aqui são propostas; a integração em `Vehicle.ts` exigiria portar os arquétipos aprovados mantendo as 4 peças nomeadas e o pivot/centro de massa atuais.
- Cores base herdadas do roster do jogo; nenhuma paleta nova foi inventada.
- Não substitui a aprovação humana: registrar a opção aprovada (A/B/C) e a configuração final de sliders antes de implementar no jogo.

## 9. Critério de aprovação

1. Escolher a direção visual **A**, **B** ou **C** (ou rejeitar as três e pedir nova alternativa).
2. Ajustar os 6 sliders até a silhueta desejada e usar **📋 Copiar JSON** para registrar a configuração reproduzível.
3. Colar a configuração aprovada nesta especificação (seção 10) antes de qualquer integração em `src/game/Vehicle.ts`.

## 10. Configuração aprovada

*(preencher após aprovação — exemplo: `{"machine":"falcon","style":"A","length":1.00,...}`)*


---

## 11. Aditivo de aprovação e referência v6 — 09/10/2026

**Decisão explícita do responsável:** “seguiremos com o C estando aprovado, envie isso ao repositorio”.

### 11.1 Escopo preciso da aprovação

- **Aprovado:** estilo **C — RETRO VECTOR** do laboratório v6, identificado no código-fonte por `{id:'C', name:'RETRO VECTOR'}`.
- **Não confundir:** **D — TOON VECTOR FLUX** é uma direção distinta no mesmo arquivo; o comentário positivo anterior sobre D não substitui a aprovação literal de C.
- **Não aprovados por esta decisão:** estilos A, B, D, E, design final de todos os componentes, física, critérios de desempenho e integração de assets no jogo.
- **Em aberto:** o JSON final com parâmetros numéricos escolhidos, alterações de cores de cada peça e avaliação de compatibilidade de C com os contornos pretos previstos no GDD [81, 88]. Não inventar aprovação para esses itens.

### 11.2 Arquivo de implementação da referência aprovada

- **HTML:** `prototypes/02_ship_visuals.html` (v6 WebGL independente).
- **Direção inicial da interface:** C — RETRO VECTOR (`style:2` no estado inicial da v6).
- **Quantidade de opções ainda apresentadas:** A Anime Cel, B Aero Armor, C Retro Vector, D Toon Vector Flux, E Solar Prototype.
- **Dez geometrias-base:** uma por máquina; alternar o estilo deve conservar a geometria e as proporções. Os seis sliders permanecem associados à nave, não ao estilo.
- **UI:** modos vitrine, comparação A–E e galeria de dez naves; destaque das quatro peças visuais provisórias; vistas; importação/exportação.
- **JSON v6:** `schemaVersion: 6`, `prototype: 'gminus-craft-visual-lab'`, `machine`, `style`, `mode`, `focusPiece`, `view`, `params` com `length`, `width`, `wingSpan`, `canopy`, `glow` e `saturation`.
- **Limites de sliders v6:** `length`, `width`, `wingSpan` e `canopy`: 0,78–1,22; `glow`: 0–2; `saturation`: −0,38–0,38. Os valores iniciais exibidos **não são considerados configuração aprovada**.

### 11.3 Pendências e política de integração

1. Registrar posteriormente o snapshot JSON de parâmetros **explicitamente aprovado**.
2. Validar visualmente o estilo C no contexto de pista conforme GDD [83] e testar a aderência aos contornos pretos de [81,88], sem alteração automática do GDD.
3. Manter `prototypes/02_craft_visuals.html` e sua especificação sem exclusão ou fusão.
4. **Não portar** modelos ou materiais para `src/game/Vehicle.ts` até aprovação de integração conforme GDD [101].
5. Não tratar aprovação da **direção C** como aprovação final de outras alternativas, da geometria ou do jogo.

**Status de implementação:** enviado à branch de revisão do repositório; integração ao jogo principal não realizada.
