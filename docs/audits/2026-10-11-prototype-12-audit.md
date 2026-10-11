# Auditoria do Protótipo 12 original (HUD, câmeras e interface) e matriz de correções da V2

**Data:** 11/10/2026
**Objeto auditado:** `12_hud_camera_lab.html` entregue pelo Antigravity e **rejeitado** pelo responsável. Nunca esteve versionado no repositório; para rastreabilidade da auditoria, uma cópia byte a byte foi arquivada em [`archive/2026-10-11-p12-v1-rejeitado/`](../../archive/2026-10-11-p12-v1-rejeitado/README.md) (fora do build e de `prototypes/`).
**SHA-256 do arquivo auditado:** `917643e155338a828405f4dcdc18a980a1e0ff9067e880f76eb238b64439dbe0` (134 557 bytes, 3 160 linhas).
**Substituto:** [Protótipo 12 V2](../specs/12_hud_camera_v2_spec.md) — **EM AVALIAÇÃO, NÃO APROVADO**.

## 1. Método

1. Leitura integral do HTML e busca dirigida a cada afirmação da auditoria independente recebida com o pedido.
2. Comparação do bloco geométrico canônico com `prototypes/05_craft_geometry_lab.html` (texto exato e SHA-256).
3. Busca de chamadas ao resolvedor de pintura B (`resolveLivery`, `pinkMix`) e ao gerador de VFX do 04 V2 (`effectFrame`).
4. Leitura da lógica de simulação (`RaceSimulation`) e de renderização (`renderSceneToViewport`).

Não houve teste visual do arquivo rejeitado no navegador: os julgamentos de direção de arte se baseiam no código e no retorno do responsável.

## 2. Achados confirmados

Números de linha referem-se ao arquivo auditado.

| # | Gravidade | Achado | Evidência |
| :-: | :--- | :--- | :--- |
| 1 | Crítica | 30 competidores simulados, no máximo 8 desenhados | `totalShips = 30` (l. 1826); laço de oponentes `for (let i = 2; i < 8; i++)` (l. 2467) + jogador + rival |
| 2 | Crítica | Pista declarada de 2 400 m incompatível com ~3 min a ~1 040 km/h (3 voltas ≈ 25 s) | `trackLength = 2400.0` (l. 1828); velocidade inicial 1 040 km/h (l. 1868) |
| 3 | Crítica | Relógio reinicia em 180 s, mas a distância das naves continua crescendo: tempo e volta deixam de corresponder | `if (simTime > 180) simTime = 0` (l. 1886) |
| 4 | Alta | Classificação do HUD B usa a ordem de criação, não a posição | `sim.ships.slice(0, 5)` (l. 2570) |
| 5 | Alta | Telemetria fixa apresentada como real | `DELTA: -0.42s` (l. 2562), `DRIFT SLIP: 24° · TRAÇÃO 82%` (l. 2661) |
| 6 | Alta | Dano de colisão aplicado a cada atualização (100 → 80 → 60 → 40 em três quadros) | `player.shield = Math.max(5, player.shield - 20)` dentro do `update` enquanto o evento dura 4 s (l. 1916–1918) |
| 7 | Alta | Pintura B não implementada: cor única por modelo | uniforme `u_color` (l. 2115, 2129); nenhuma ocorrência de `resolveLivery` ou `pinkMix` |
| 8 | Alta | VFX aprovados do 04 V2 ausentes | nenhuma ocorrência de `effectFrame`; boost/ataques viram texto e alteração de estado |
| 9 | Alta | HUD reconstruído no DOM a cada quadro | `singleLayer.innerHTML = getHUDHtml(...)` (l. 2743, 2753–2755) |
| 10 | Alta | Controles sem efeito | `pitch` nunca lido pela câmera; `lookAhead` só aparece em padrões/sliders; `scale` do HUD só é armazenado (l. 2890); `bank` altera a rolagem da nave, não a câmera (l. 2463) |
| 11 | Alta | Rival artificialmente puxado para perto do jogador a cada quadro | `rival.dist += (targetRivalDist - rival.dist) * (dt * 2.5)` (l. 1935–1937) |
| 12 | Média | Tremor de câmera com `Math.random()` e passo variável: sem reprodução | l. 2356 |
| 13 | Média | Linha do tempo muda `simTime` sem reposicionar naves nem reconstruir eventos | l. 3035 |
| 14 | Média | Importação aceita valores inválidos (distância −100, FOV 999, seções ausentes) | `importConfig` (l. 2924) não valida faixas nem chaves |
| 15 | Média | Radar mostra só parte do grid | `sim.ships.slice(2, 20)` (l. 2580) |
| 16 | Média | Nomes de naves não aprovadas e de pilotos de F-Zero aplicados às geometrias aprovadas (ex.: "FIRE STINGRAY" com a geometria Falcon B; "DEATH ANCHOR", "ASTRO ROBIN"), contrariando GDD [79] e a decisão do P05 | roster (l. 1837–1848) |
| 17 | Média | HUD acoplado à câmera: comparar A/B/C muda as duas coisas ao mesmo tempo | presets de câmera por alternativa de HUD (l. 1807–1815) |
| 18 | Baixa | Sem tratamento de perda de contexto WebGL nem descarte explícito de buffers/programas | nenhuma ocorrência de `webglcontextlost`/`deleteBuffer` |
| 19 | Baixa | Painel lateral fixo de 360 px | `grid-template-columns: 360px …` (l. 41) |

**Preservado corretamente:** o bloco geométrico do P05 é idêntico ao original (50 101 caracteres; SHA-256 `c64d8843d90db3ae5b58323038b85c85fc8492b1a3d28084a54a91c6492827fb`).

## 3. Matriz de correções na V2

| Achado | Como a V2 resolve | Verificação |
| :--- | :--- | :--- |
| 1, 15 | As 30 naves são simuladas e desenhadas (corte só por distância/frustum); minimapas e radares iteram todas | teste 06; capturas `03`, `11` |
| 2, 3 | Pista de teste de 19,67 km (1 u = 1 m); corrida ≈ 2 min 54 s–2 min 57 s; tempo = `tick/120`; volta, setores e chegada vêm da integração da distância | teste 07 |
| 4 | Classificação: chegada pelo instante exato de passagem; demais por progresso; escada e tabelas leem `state.order` | teste 06 |
| 5 | Delta ao vivo, setores e intervalos calculados dos registros de passagem a cada 25 m; deslize e tração só existem se calculados (deslize vem do estado da nave) | testes 07 e 08; ausência dos valores fixos verificada no teste 08 |
| 6 | Dano pontual por evento, com intervalo por par de naves | teste 08 |
| 7 | Cada nave renderizada com `renderModel` do 06 e `resolveLivery('B', …)` na baseline do pipeline | teste 02 |
| 8 | `effectFrame` do 04 V2 com `APPROVED_PARAMS`, acionado por eventos da simulação | teste 08; capturas `06`, `08`, `11` |
| 9 | HUD em Canvas 2D: nenhum nó DOM recriado por quadro | revisão de código; teste 13 mede o custo |
| 10 | Todos os sliders de HUD e câmera têm efeito medido | testes 05 e 05b |
| 11 | Rival com elástico de teste declarado e limitado; aproximação deliberada só nos trechos de roteiro (emboscada e disputa) | `PLAYER_SCRIPT` e especificação §6 |
| 12 | Ruído determinístico com semente fixa; passo fixo de 120 Hz | teste 09 |
| 13 | Busca reconstrói o estado a partir de snapshots de 1 s e aquece as câmeras por 3 s | teste 09 |
| 14 | Importação estrita e atômica (mesma função na interface e na API) | teste 10 |
| 16 | Competidores identificados como instâncias de demonstração das nove geometrias (ex.: `BF-A 07`); nenhum nome de nave não aprovada | teste 01 |
| 17 | HUD e câmera independentes; vistas HUD×3, CÂM×3 e matriz 3×3 no mesmo instante | teste 04; capturas `01`–`04` |
| 18 | Perda/restauração de contexto tratadas; descarte de todos os buffers, programas e shaders | testes 14 e 14b; `evidence.json` |
| 19 | Painel recolhível sobre o palco; palco ocupa toda a largura | capturas `15`, `16` |

## 4. Fora do escopo desta auditoria

Nenhum arquivo do P08, do jogo (`src/`), dos protótipos aprovados ou das decisões confirmadas foi alterado.
