# Especificação Técnica — Protótipo 04 V2: Craft VFX Lab

**Estado:** implementado para avaliação visual em 10/10/2026. **Nenhum VFX aprovado.**

## 1. Objetivo e autoridade

O laboratório `prototypes/04_craft_vfx_v2.html` reconstrói o Protótipo 04 como ferramenta isolada de exploração e comparação. Ele não integra efeitos ao jogo e não altera física, combate, IA, pista ou balanceamento.

A hierarquia aplicada é cumulativa:

1. [GDD](../GDD.md) e decisões expressas;
2. [Toon Vector Flux D](02_toon_vector_flux_approval.md), como linguagem visual;
3. [Protótipo 05](../decisions/2026-10-10-prototype-05-craft-geometry-approval.md), com as nove geometrias canônicas;
4. [Protótipo 06](../decisions/2026-10-10-prototype-06-paint-system-approval.md), com Sistema B e sua baseline;
5. alternativas VFX deste laboratório, todas **EM AVALIAÇÃO**.

O arquivo histórico `prototypes/04_craft_vfx.html` permanece intacto.

## 2. Baselines bloqueadas

- O bloco entre `@gminus-approved-craft-geometry:begin v1` e `:end v1` é copiado byte a byte do Protótipo 05 e coberto por teste de igualdade.
- São exibidas somente Blue Falcon, Golden Fox e Wild Goose, cada uma nas variantes A/B/C aprovadas. As outras sete naves não são inventadas.
- A direção é D — Toon Vector Flux: volumes facetados, leitura toon, contorno escuro e energia vetorial controlada.
- O Sistema B usa os papéis `paint`, `secondary`, `accent`, `structure`, `glass`, `energy` e `marking`, com baseline `pinkMix=0.55`, `shadeMix=0.68`, `hierarchy=0`, `saturation=0`, `glow=1`.

## 3. Matriz de alternativas

| Categoria | A | B | C | D | E |
|---|---|---|---|---|---|
| Propulsão | núcleo plasma | jatos segmentados | ondas pulsantes | fitas/fragmentos | células/feixes/anéis |
| Boost | shockwaves | corredores | arcos elétricos | afterimages | ruptura espacial |
| Spin | disco | lâminas | espiral 3D | anéis concêntricos | campo poligonal |
| Ataque lateral | corte | arco de pressão | faixa vetorial | onda de impulso | fantasma/descarga |
| Escudo/dano | flash toon | placas | trincas | ondas de superfície | arco/fragmentos |
| Drift/strafe/hover | tiras da pista | fricção magnética | linhas de fluxo | pulso de estabilização | rastros de slip |
| Colisão | faíscas | estilhaços | pulso de contato | riscos de tinta | onda angular |
| Dash/recarga | flash ascendente | anéis aceleradores | faixas superiores | pista → motores | onda direcional |
| Voo/pouso | desprendimento | rastros aero | pulso de saída | compressão | impacto direcional |
| Velocidade | action lines | perspectiva | silhuetas | fragmentos | deslocamento espacial |

Cada alternativa tem cópia independente dos controles de intensidade, escala, duração, densidade e velocidade. Alterar ou restaurar uma alternativa não toca as demais.

## 4. Modos de avaliação

- **Única ampliada:** uma alternativa e gatilho manual.
- **Comparar A–E:** cinco viewports sob nave, câmera, seed e tempo idênticos.
- **Galeria 3×3:** as nove geometrias aprovadas usando a alternativa ativa.
- Câmeras de perseguição, traseira, lateral e orbital; estúdio ou pista de teste.
- Pausa, avanço de um quadro, replay, seed inteira determinística e stress com 18 instâncias.
- Eventos simulados incluem throttle, boost, spin, ataque lateral espelhado, impacto, drift, colisão, dash, voo e velocidade. São estados exclusivamente visuais e rotulados.

## 5. JSON e reprodutibilidade

O schema é `g-minus.craft-vfx-v2`, versão `2`. A exportação contém dependências, seleção, seed, baseline de pintura e todos os 250 valores de parâmetros (10 × 5 × 5).

A importação é estrita e atômica: rejeita campos ausentes ou desconhecidos, números não finitos/fora da faixa, IDs inválidos, versão incompatível e qualquer tentativa de declarar aprovação ou trocar geometria, estilo ou sistema de pintura. Em erro, nada é aplicado.

## 6. WebGL e recursos

O renderizador mantém buffers estáticos por geometria e um pool de três buffers dinâmicos para triângulos, linhas e partículas. Recursos são descartados no encerramento; perda e restauração do contexto WebGL são tratadas explicitamente. A telemetria mostra FPS, draw calls, partículas, buffers, triângulos, vértices dinâmicos, instâncias de stress e restaurações de contexto.

## 7. Testes e critérios

Os testes automatizados verificam:

- igualdade byte a byte do bloco geométrico com o Protótipo 05;
- 10 categorias × 5 alternativas com geradores distintos;
- baseline D/B e selo obrigatório `EM AVALIAÇÃO`;
- importação estrita e atômica;
- independência de parâmetros e resets;
- geometria VFX finita, não vazia e determinística nas 50 combinações;
- reprodução das nove geometrias e presença do ciclo de recursos WebGL.

A validação final inclui `npm test`, `npm run build` e inspeção em navegador com WebGL real. Resultados e limitações ficam na [auditoria](../audits/2026-10-10-prototype-04-v2-audit.md).

## 8. Fora do escopo

Nenhuma alternativa é aprovada por existir no laboratório. Não há alteração em `PhysicsCalibration.ts`, `Vehicle.ts`, `Game.ts` ou `Combat.ts`; não há integração ao runtime principal; não há decisão sobre VFX finais, modelos das outras sete naves ou física definitiva de voo/pouso.
