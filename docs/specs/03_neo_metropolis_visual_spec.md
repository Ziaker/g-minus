# G-MINUS — Especificação de protótipo visual: Neo Metropolis

**Status:** protótipo experimental para comparação; **nenhuma alternativa aprovada**.  
**Repositório de referência consultado:** `Ziaker/g-minus`, HEAD `f4200416c720d8dbb9b8b7424b400ea27612f168` em 09/10/2026 (observado durante a preparação).  
**Base documental:** `docs/GDD.md`, principalmente requisitos [61–70], [81–90], [94–99] e [101–104].  
**Artefato:** `prototypes/03_neo_metropolis_visual.html`.

## 1. Objetivo e escopo

Comparar **três alternativas distintas de identidade ambiental e composição visual** para a pista provisoriamente chamada **Neo Metropolis**, primeiro tema urbano de G-MINUS. A escolha dos três visuais e dos números de teste abaixo é **proposta do protótipo**, não decisão já registrada no GDD.

O HTML funciona como uma **prévia visual interativa de ambiente**: projeta uma cena com perspectiva, edifícios/estruturas, pista, rails luminosos, rival(is) ilustrativos, sinalização, nave estilizada e câmera móvel. Permite trocar três alternativas e calibrar atributos visuais. A implementação usa **Canvas 2D** com projeção matemática, não geometria Three.js/WebGL nativa. Assim, o arquivo pode ser aberto isoladamente, sem instalar bibliotecas ou depender de CDN.

**Fora do escopo e não validados:** circuito 3D final, física de direção, IA competitiva, testes de colisão, checkpoints, tempo de volta, desempenho com 30 veículos, pistas jogáveis, modelos modulares reais, efeitos de shader cel-shading reais, arte final ou integração no jogo. A nave e os rivais são representações gráficas simples, não ativos do repositório.

## 2. Três alternativas

| Opção | Identidade | Geometria/elementos demonstrados | Intenção visual |
|---|---|---|---|
| **A — Neon Canyon** | Metrópole densa / anime / neon magenta–ciano | Arranha-céus em corredor próximo, painéis holográficos, vias sobrepostas, arco luminoso e neblina | Velocidade, confinamento e escala vertical |
| **B — Skyline Circuit** | Cidade em altitude / atmosfera azul–turquesa | Via elevada, horizonte expandido, skyline distante, anéis monumentais | Espetáculo, claridade do traçado e amplitude |
| **C — Industrial Midnight** | Distrito industrial noturno / âmbar–vermelho | Chaminés, fábrica, passarelas e sinalização de risco, nevoeiro | Massa arquitetônica e contraste com a pista |

Os nomes de alternativas são **rótulos experimentais** e não nomes oficiais de pistas adicionais. O GDD requer cinco pistas, mas não vincula oficialmente cada tema a uma pista específica.

## 3. Parâmetros configuráveis e defaults

Todos os sliders de alternativa variam entre **0 e 100**, com **passo 1**. Cada opção conserva seu conjunto próprio quando o usuário alterna entre A, B e C. Os números são iniciais de exploração e **não estão aprovados**.

| A — Neon Canyon | Default | B — Skyline Circuit | Default | C — Industrial Midnight | Default |
|---|---:|---|---:|---|---:|
| `density` (edifícios) | 80 | `altitude` (diferença vertical percebida) | 84 | `industry` (densidade industrial) | 83 |
| `signs` (letreiros) | 76 | `skyline` (profundidade visual) | 67 | `smog` (vapor) | 58 |
| `neon` (realce das linhas) | 85 | `rings` (anéis) | 80 | `embers` (partículas) | 70 |
| `fog` (névoa) | 43 | `skyglow` (horizonte) | 72 | `hazard` (avisos de perigo) | 85 |
| `traffic` (rivais ilustrativos) | 66 | `traffic` | 51 | `traffic` | 47 |

**Parâmetros globais:** `camera` = `chase` por padrão, modos disponíveis `chase`, `wide`, `drone`; `speed` = 1020 km/h de visualização, intervalo **250 a 1800** e passo **10**; `seed` = **2409**; `selected` = `A`. A velocidade é uma grandeza de movimento da câmera, **não** o estado de velocidade de uma nave do jogo.

## 4. Interface e estados

- **Seleção A / B / C:** troca imediatamente paleta, tipo de arquitetura, ornamentações e os cinco sliders pertinentes. As alterações de uma opção são preservadas enquanto as demais são testadas.
- **CHASE / ABERTA / DRONE:** três enquadramentos pré-definidos para examinar composição e leitura da pista. São opções do laboratório, não confirmação das câmeras finais do GDD.
- **Teclado:** setas esquerda/direita reposicionam o enquadramento; `W` aumenta temporariamente a velocidade da prévia; `S` a diminui; `V` troca de câmera; `Espaço` pausa/despausa. Os controles não são equivalentes aos comandos finais de gameplay.
- **Pausar/continuar:** suspende/reinicia atualização de animação. **Reiniciar** volta ao começo do percurso visual e ao tempo zero, mantendo ajustes.
- **HUD ilustrativo:** indica velocidade nominal da prévia, tempo, FPS aproximado e seed. Não há cronômetro de corrida real.
- **Exportar:** botão `GERAR JSON` escreve estado atual completo na caixa de texto; `COPIAR` gera o estado atual e tenta colocá-lo na área de transferência. Caso haja restrição de permissão, o texto é selecionado para cópia manual.
- **Importar:** `APLICAR JSON COLADO` valida todos os campos conhecidos antes de atualizar o estado; rejeita formatos, chaves ou valores inválidos e conserva os parâmetros anteriores quando ocorrer erro.
- **Feedback:** status textual informa mudança de seleção, importação, erro, pausa e reinício.

## 5. Formato de configuração JSON

Estrutura principal: `{ "version": 1, "prototype": "G-MINUS-NEO-METROPOLIS-VISUAL-03", "selected": "A", "presets": {"A": {...}, "B": {...}, "C": {...}}, "camera": "chase", "speed": 1020, "seed": 2409 }`.

O importador aceita também configurações exportadas da versão original com identificador `G-MINUS-NEO-METROPOLIS-VISUAL-02`, migrando o identificador para `G-MINUS-NEO-METROPOLIS-VISUAL-03` ao importar e exportar novamente.

O campo `presets` contém **os cinco parâmetros de cada alternativa**, mesmo quando a opção está inativa. `selected` mantém a opção escolhida. `version` impede leitura acidental de formatos incompatíveis. Valores numéricos dos sliders devem ser inteiros entre 0 e 100; `speed` inteiro entre 250 e 1800; `seed` inteiro não negativo até 2.147.483.647.

A seed gera distribuição pseudoaleatória **das estruturas da prévia**. Não demonstra determinismo do jogo nem de comportamento de IA.

## 6. Relação com o GDD e pendências de aprovação

- **[81–90]:** três interpretações de neon, metrópole, volume monumental e legibilidade. São alternativas não aprovadas; não afirmam a presença de cel shading real ou contorno preto por shader.
- **[61–70]:** o protótipo representa visualmente uma pista alta/curva com rails e marcações. Não valida bifurcações, saltos, loops, atalhos nem colisões.
- **[94–99]:** sensação de velocidade é sugerida por perspectiva, nave, plumas, partículas e luzes, sem afirmar efeitos físicos nem um efeito final de FOV.
- **[101]:** o arquivo é um HTML utilizável com três opções, sliders separados por opção, exportação/importação por copiar/colar. **Falta escolha e aprovação expressa** de alternativa/configuração final e inclusão dos protótipos de física/combate pertinentes numa próxima etapa de integração.
- **[102]:** FPS e seed são instrumentação básica da prévia, não telemetria de gameplay.
- **[103–104]:** a publicação deste estudo adiciona um protótipo, sua especificação e uma referência mínima no README. Nenhum arquivo do jogo é alterado e a integração futura depende de aprovação.

## 7. Critérios propostos para aprovação posterior

1. Selecionar A, B ou C e fornecer JSON exportado da configuração final.
2. Confirmar a clareza visual das bordas da pista, dos indicadores de boost/recarga e dos rivais, inclusive em vista CHASE.
3. Confirmar densidade arquitetônica, contraste e saturação sem ocultar a pista ou o veículo.
4. Testar desempenho em navegadores-alvo e em hardware representativo antes de tratar esse visual como implementável no jogo.
5. Somente após aprovação, escrever uma especificação de **implementação 3D** que relacione este estudo ao track existente, às naves modulares e aos protótipos pertinentes; sem assumir que a prévia Canvas é o modelo 3D do jogo.

## 8. Validação realizada e limites

A versão HTML foi carregada em Chromium headless com Playwright, via `page.set_content` (a navegação `file://` estava bloqueada nesse ambiente de teste). Foram exercitados: renderização do canvas, alternância A/B/C, presença de cinco sliders por opção, exportação JSON, alteração e restauração de parâmetro via importação, mudança de câmera, pausa e captura de screenshots das três alternativas. Não houve erros JavaScript reportados no teste. Não foi realizado teste manual completo de percepção visual ou jogabilidade e **os testes citados foram realizados antes da publicação no repositório GitHub**.
