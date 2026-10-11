# Especificação — Protótipo 12 V2: HUD, câmeras e interface

**Status: EM AVALIAÇÃO — P12 V2 NÃO APROVADO.** Nada aqui foi integrado ao jogo nem aprova física, IA, energia, combate, pistas ou eliminação.
**Data:** 11/10/2026
**Laboratório:** [`prototypes/12_hud_camera_lab_v2.html`](../../prototypes/12_hud_camera_lab_v2.html) — HTML autônomo, abre direto do disco.
**Fontes modulares:** [`prototypes/hud-camera-lab/`](../../prototypes/hud-camera-lab/) — regenerar com `node prototypes/hud-camera-lab/build.mjs` (`--check` só confere).
**Testes:** [`tests/hud_camera_lab_v2.test.mjs`](../../tests/hud_camera_lab_v2.test.mjs). **Evidências de navegador:** [`docs/evidence/12_hud_camera_lab_v2/`](../evidence/12_hud_camera_lab_v2/README.md).
**Auditoria do P12 original (rejeitado):** [`docs/audits/2026-10-11-prototype-12-audit.md`](../audits/2026-10-11-prototype-12-audit.md).
**Requisitos de origem:** GDD [91–100] (câmera, HUD, alertas, VFX), [96–98], [101–104]; roadmap P12 (decisão 9).

## 1. O que mudou em relação ao P12 rejeitado

1. **HUD e câmera são independentes.** Qualquer um dos três HUDs pode ser visto com qualquer uma das três câmeras; as vistas *HUD×3*, *CÂM×3*, *lado a lado* e *matriz 3×3* desenham o mesmo instante da mesma simulação.
2. **Uma corrida real de teste** com 30 naves desenhadas, voltas, setores, chegada e classificação coerentes, determinística e com busca verdadeira na linha do tempo.
3. **Sistemas aprovados de fato embutidos:** geometria P05 (bloco v1 intacto), renderizador D e pintura Sistema B do P06, VFX do 04 V2 com a calibração aprovada.
4. **Três conceitos de interface novos**, cada um com arquitetura de informação, composição, regras de prioridade e movimento próprios.
5. **Telemetria sem valores inventados:** tudo o que o HUD exibe é calculado do estado da simulação.

A matriz achado → correção → teste está na [auditoria](../audits/2026-10-11-prototype-12-audit.md#3-matriz-de-correções-na-v2).

## 2. Referências e o que foi aproveitado

A análise abaixo vem de conhecimento documentado sobre esses jogos. **Não** houve pesquisa de imagens nesta sessão. Nenhuma interface foi copiada.

| Referência | O que ensina | Como entra na V2 |
| :--- | :--- | :--- |
| F-Zero GX / X | Energia como barra longa e dominante; números grandes inclinados; poucos módulos; a energia é recurso de impulso | HUD A: tanque de energia em células com custo de impulso marcado; numerais gigantes inclinados |
| Wipeout (2097, HD, 2048) | Identidade tipográfica própria, geometria gráfica rigorosa, cor com significado | Fonte vetorial própria (traço angular com chanfro) usada nos três HUDs com pesos e inclinações diferentes |
| Mangá / anime de ação (linhas de foco, carimbos, retícula, impressão desalinhada) | Movimento gráfico sem animação 3D cara; ênfase por enquadramento | HUD A: linhas de foco na periferia, painel com sombra de impressão, desalinhamento ciano/rosa proporcional à aceleração |
| Aviação de combate (RWR, colchetes de alvo, indicadores de ameaça) | Leitura espacial de ameaças ao redor do piloto | HUD B: anel de ameaças no chão em volta da nave, colchetes, setas fora da tela, cunha direcional de dano |
| Telemetria de automobilismo (delta, setores, intervalos) | Tempo como informação principal; cores semânticas de setor | HUD C: delta ao vivo no mesmo ponto da volta, setores coloridos, intervalos medidos, traço de curvatura |
| Burnout | Celebrar o impacto e o "takedown" | HUD A/B: carimbo de acerto ancorado ao alvo, estilhaços das células perdidas |

**Escolha conceitual:** cada HUD responde a uma pergunta diferente — **A: como a corrida se sente** (emoção), **B: onde estão as ameaças e oportunidades** (espaço), **C: estou ganhando tempo e o que vem a seguir** (tempo).

## 3. Os três HUDs

Todos são desenhados em Canvas 2D sobre o viewport (nenhum nó DOM recriado por quadro). B e C também desenham elementos no mundo 3D com teste de profundidade (camada no mundo). Unidade de layout: `u = altura/1080 × escala` em paisagem e `largura/1080 × escala` em retrato (aspecto < 1,2), com layout próprio para retrato. Texto mínimo: 14 u (≈ 9,3 px em 720p).

### 3.1 HUD A — Flux Rush (arcade maximalista · emoção)

**Composição:** quatro âncoras nos cantos, centro livre. Painel de quadrinho no alto à esquerda (tinta, retícula e sombra de impressão rosa/vermelha) com energia e volta; posição gigante no canto inferior esquerdo; lâmina de velocidade em arco com numerais no canto inferior direito; minimapa-adesivo no alto à direita; canal de adesivos no alto ao centro.

**Instrumentos:**
- **Velocidade:** numerais vetoriais de 116 u com contorno de tinta; desalinhamento ciano/rosa = `misregistration × (1,5 + 5·|aceleração|/45 + 6·impulso)`. Lâmina de 30 segmentos até 1700 km/h: creme até 1100, ouro até 1350, rosa acima; no impulso, uma onda percorre os segmentos.
- **Energia:** 20 células de 5 %. Trilha de dano creme por 0,4 s, que desaparece em 0,45 s; células perdidas estilhaçam (0,42 s, gravidade); tremor de 0,16 s. Colchete ciano sobre os últimos 14 % (custo de um impulso) e contador de impulsos disponíveis. Crítico (< 15 %): vermelho com pulso de 2,2 Hz.
- **Posição:** numeral de 170 u. Na troca, soco `outBack` de 0,24 s (escala até 1 + 0,42·cinética), 12 raios por 0,32 s e adesivo ▲+n/▼−n por 1,5 s.
- **Volta:** volta atual, tempo, última e melhor.
- **Faixas de volta:** faixa diagonal com retícula: entrada 0,16 s, permanência 0,75 s × `bannerHold`, saída 0,24 s; mostra o número da nova volta, o tempo da anterior, o Δ e "MELHOR VOLTA".
- **Largada/chegada:** numerais de 240 u com soco; "GO!" com 16 raios; "CHEGADA" + carimbo de posição + tempo total + três primeiros (cenário de teste, sem coreografia final).

**Feedback de combate:** explosão em estrela na borda do lado atingido com "−dano" e vinheta vermelha de 1,1 s; ameaça telegrafada mostra emanata em zigue-zague na borda do lado do atacante (intensidade conforme a fase do ataque) e "!!" junto à nave projetada; acerto causado: carimbo "HIT! +dano" ancorado ao alvo. Curva severa: chevrons sequenciais (6 Hz) no lado da curva com o nome. Borda aberta: listras de perigo na borda da tela.

**Intensidade crescente:** `intensidade = 0,45·velocidade + 0,3·impulso + 0,35·ameaça + 0,3·crítico + 0,15·volta final` controla a densidade das linhas de foco (sempre fora do terço central).

### 3.2 HUD B — Vector Tactical (interface tática · espaço)

**Composição:** cabeçalho chanfrado no alto à esquerda (posição, volta, tempo, melhor); escada tática no alto à direita; radar no canto inferior esquerdo; medidor de potência embaixo, ao centro; chamadas táticas no alto, ao centro. O combate aparece no mundo, em volta da nave.

**Camada no mundo (WebGL, com profundidade):**
- **Anel de ameaças** de raio `ringRadius` no chão: 12 setores cuja espessura cresce com a proximidade (até `threatRange`); ciano = proximidade, ouro = rival, magenta pulsante = ataque telegrafado.
- **Alcance real do Spin** (8 m, o mesmo da simulação) tracejado; preenchido quando há alvo dentro.
- **Janelas reais de Side Attack** (3,2–9,5 m laterais, ±8 m longitudinais): chevrons no chão apontando para o lado com alvo válido (`attackAssist`).
- **Marcas sob adversários** e **linha de investida** tracejada do atacante até a nave durante a telegrafia.

**Tela:**
- **Colchetes** nos até seis adversários mais próximos dentro de `bracketRange` (rival sempre). Os quatro mais próximos, o rival e os atacantes têm código, distância e ▲/▼ (aproximação/afastamento); os demais só distância. Mini-barra de escudo do adversário até 150 m; "ATK" no atacante; "VULNERÁVEL" quando o escudo está abaixo de 30 % a menos de 60 m.
- **Setas na borda** para ameaças fora da tela, com distância.
- **Cunha direcional de dano** em volta do centro, persistência `damagePersist`, com quantidade e tipo (lateral, giro, colisão, barreira).
- **Ataque iminente:** "ATAQUE ◀ 0,18 S" — tempo até o contato calculado da fase real do atacante.
- **Medidor de potência:** arco externo de velocidade, marca ouro no limite da curva atual, arco interno de **blocos de impulso** (cada bloco = 14 % = um impulso), com trilha de dano.
- **Escada tática:** líder + posições ±`ladderSize`, com **intervalo medido** (tempo entre as duas naves no mesmo ponto da pista).
- **Radar local:** pista real em volta (bordas amostradas a cada 8 m, no plano da nave), naves como triângulos, alcance `radarRange`, deslocado para mostrar mais a frente; modo circuito mostra o traçado inteiro.

### 3.3 HUD C — Apex Line (precisão competitiva · tempo)

**Composição:** faixa de previsão no alto, ao centro; posição e intervalos no alto à esquerda; bloco de tempo no alto à direita; cluster de instrumentos embaixo, ao centro; radar mínimo no canto inferior esquerdo; módulo rival contextual à direita.

- **Faixa de previsão:** linha do tempo dos próximos `forecastSeconds` (limitada a `forecastRange`) ou da distância `forecastRange` (`forecastMode`). Traço de **curvatura** (esquerda para cima) com preenchimento por severidade, **perfil de altitude** em ciano, caixas de severidade sobre o ápice, faixas de loop e salto, placas, zona de recarga, borda aberta, setores e chegada. Abaixo: próxima curva (ou "NA CURVA · SAÍDA EM … M"), distância, tempo até lá e velocidade de ápice da pista de teste.
- **Tempo:** volta atual, **Δ ao vivo** contra a melhor (ou última, `deltaRef`) volta no mesmo ponto; três setores: violeta = melhor pessoal, ciano = melhor que a volta anterior, ouro = pior. Na volta 1 o Δ mostra "sem referência".
- **Intervalos:** à frente e atrás, medidos nos registros de passagem.
- **Cluster:** velocidade tabular de 64 u, régua até 1700 km/h com marca ouro do limite da curva atual, seta de tendência de aceleração, escudo com marcas a cada impulso e contagem de impulsos.
- **Módulo rival:** só aparece quando o intervalo para o rival é menor que `rivalWindow` (entrada proporcional ao intervalo).
- **Recolhimento em cruzeiro (`autoHide`):** sem mensagens, ameaças, deriva nem energia crítica, os módulos secundários vão a `dimLevel` conforme o tempo até a próxima curva (3–5 s). Função contínua, sem estado oculto.
- **Marcadores na pista (`trackMarkers`):** faixa ouro no ponto de frenagem (primeiro ponto à frente em que o limite de curva fica abaixo da velocidade atual) e chevrons ciano no ápice interno da próxima curva.

## 4. Regras de prioridade (diretor de alertas)

| Classe | Mensagens | Regra |
| :-: | :--- | :--- |
| P0 · segurança imediata | ataque iminente, energia crítica, borda aberta | sempre visível, acima da capacidade; estados com histerese (crítico entra < 15 % e sai > 20 %; borda entra < 5 m e sai > 7 m ou fora do trecho) |
| P1 · combate | impacto recebido, acerto causado | impactos em 0,5 s se fundem (soma do dano) |
| P2 · corrida | largada, GO, posição, volta, volta final, rival a menos de 1 s, chegada | trocas de posição em 1,2 s se fundem (+n); uma nova troca encerra a anterior |
| P3 · informação | impulso liberado, recarga, placa, curva severa (2,5 s antes), no ar | intervalos mínimos por tipo (placa 1 s; rival 10 s) |

Seleção por HUD: ordena por `prioridade + viés do conceito`, empate pela mais recente; mostra todos os P0 e até 2 mensagens não-P0. Viés: A favorece posição/volta; B favorece combate/rival; C favorece volta/curva. **Mensagem oculta por preempção expira no próprio prazo** (informação velha não reaparece). Saída animada em 0,22 s.

## 5. Câmeras

As três câmeras são atualizadas a cada passo de 120 Hz, sempre aquecidas. O "para cima" vem do referencial da pista (transporte paralelo + inclinação), **nunca do eixo vertical global**. Em loops ele é suavizado por `invertedFollow`. As suavizações são feitas no referencial da nave: há atraso angular, mas não atraso de translação a 300 m/s. **Garantia de enquadramento:** a nave nunca passa de 75 % do meio campo de visão. Quadros estreitos (retrato) aumentam o FOV vertical, até 100°, para preservar parte do campo horizontal.

| Câmera | Filosofia | Diferença estrutural |
| :--- | :--- | :--- |
| **A — Cinética** | sensação | segue o nariz/velocidade (revela o deslizamento), recua e abre FOV no impulso, tremor por ruído com semente e tranco direcional nos impactos, inclina com pista e nave |
| **B — Tática** | leitura do pelotão | alinhada à tangente da pista, elevada, centralizada na pista, mira longe no traçado, enquadra o centro de massa das ameaças e recua |
| **C — Pilotagem** | ajuda a pilotar | aponta para onde a nave estará (look-ahead escalado pela velocidade), mira no ápice interno, horizonte travado sem inclinação, pouca inércia, pitch extra em cristas e saltos |

Valores experimentais (a física definitiva é do P08):

| Parâmetro | id | Faixa | A Cinética | B Tática | C Pilotagem |
| :--- | :--- | :--- | ---: | ---: | ---: |
| Distância | `distance` | 4–50 m | 11 | 26 | 9,5 |
| Altura | `height` | 0,5–30 m | 2,8 | 11 | 2,2 |
| Pitch | `pitch` | −5–40° | 6 | 12 | 4 |
| FOV base | `fovBase` | 45–90° | 66 | 58 | 62 |
| Resposta do FOV à velocidade | `fovSpeed` | 0–30° | 16 | 5 | 8 |
| Look-ahead | `lookAhead` | 0–400 m | 40 | 170 | 150 |
| Suavização (posição) | `smoothing` | 0–1 | 0,55 | 0,7 | 0,25 |
| Inércia (rotação) | `inertia` | 0–1 | 0,5 | 0,75 | 0,3 |
| Acompanhamento de curvas | `curveFollow` | 0–1 | 0,5 | 0,3 | 0,85 |
| Inclinação lateral | `roll` | 0–1 | 0,7 | 0,15 | 0,1 |
| Resposta ao drift | `driftResponse` | 0–1 | 0,6 | 0,1 | 0,2 |
| Resposta a impactos | `impactResponse` | 0–1,5 | 1 | 0,3 | 0,25 |
| Antecipação de ameaças | `threatFraming` | 0–1 | 0,4 | 0,8 | 0,2 |
| Reação a superfícies verticais/invertidas | `invertedFollow` | 0,1–1 | 0,8 | 0,7 | 0,9 |
| Visibilidade da trajetória | `pathVisibility` | 0–1 | 0,4 | 0,6 | 0,8 |
| Recuo no impulso (só A) | `boostPull` | 0–1 | 0,5 | — | — |
| Centralização na pista (só B) | `laneCentering` | 0–1 | — | 0,6 | — |
| Mira no ápice (só C) | `apexBias` | 0–1 | — | — | 0,4 |

Mapeamentos: suavização → taxa de posição `lerp(40, 2,2)` /s; inércia → taxa de rotação `lerp(40, 3)` /s; `invertedFollow` → taxa do "para cima" `lerp(2, 32)` /s; FOV = base + `fovSpeed` × clamp((v − 500)/1000, 0, 1,2) (+ recuo do impulso em A e antecipação de ameaças). Em curvatura vertical forte, a mira fica limitada a 55° da tangente. A câmera do Perfil C do Protótipo 01 (distância 15, altura 7,8, lag 14, lookahead 38) está em outra escala de jogo e não foi convertida.

## 6. Demonstração WebGL e simulação

- **Pista de teste (não definitiva):** circuito fechado de **19,67 km** (1 u = 1 m, convenção provisória; o P09 define as pistas). Referenciais por transporte paralelo com correção de holonomia. Contém 9 curvas classificadas (severidade 1–5 pelo raio), chicane estreita (meia largura de 15 m), loop vertical de 115 m de raio com deslocamento lateral de 30 m, rampa e salto de 340 m, trecho de 780 m sem barreira à direita, zona de recarga, quatro placas de aceleração, subidas e descidas de até 66 m, pórticos de chegada e de setores, placas de chevron nas curvas e contagem 3–2–1 antes de curvas severas.
- **Ambiente:** cidade de blocos com faixas de janela emissivas (paralaxe), pilares, chão com grade, céu em gradiente com lua em retícula, névoa violeta. Mesmo shader em degraus e retícula do passe D. Ambiente de teste, não proposta de cenário.
- **Naves:** 30 competidores; o jogador usa Blue Falcon A com a cor de identidade (resultado idêntico à paleta D da v6); os demais reutilizam as nove geometrias como **instâncias de demonstração** (códigos `BF-A 07`, `GF-C 13`, `WG-B 21`) com cores livres do Sistema B e o pipeline na baseline (mistura D 0,55). Luz das naves: direção fixa no mundo e vetor de visão real (o modo "luz da câmera" do 06 está disponível só como diagnóstico, por não estar aprovado).
- **VFX (04 V2, calibração aprovada):** Propulsão A em todas; Boost B obrigatório + camadas A/D/E (ligadas por padrão, como no 04 V2); Spin E (giro visual da nave pelo `simulatedPose` do atelier); Side E; Escudo D no impacto; Drift A/B/C/E selecionável; Colisão B/D selecionável; Dash E; Voo C (ancorado na borda da rampa) ou D (no pouso); Velocidade A na nave do jogador. **Spin E:** a decisão documental pede raio externo de **130 %** da varredura do giro; a implementação do 04 V2, reutilizada sem alteração, ainda usa varredura **+ 0,35 u**. O 04 V2 não foi modificado.
- **Simulação (valores de teste, não aprovam física P08):** passo fixo de 120 Hz e semente. Velocidade de cruzeiro de 1290 km/h × ritmo de 0,95–0,99, impulso de +331 km/h por 2,3 s com custo de 14 % de escudo (igual ao Perfil C), placa de +252 km/h por 0,8 s, limite de curva por aceleração lateral de teste (140 m/s²), deriva quando a velocidade passa do limite. Side Attack (telegrafia de 0,3 s, investida de 0,38 s, 10 de dano) e Spin (1,4 s, raio de 8 m, 8 de dano). Colisões com dano pontual e intervalo de 0,6 s por par; barreira com 4 de dano. Volume competitivo único para todas as naves (meia-largura 2,3 m, meio-comprimento 3,6 m), coerente com a decisão de naves cosméticas. O escudo não chega a zero (mínimo de 1 %): **eliminação não é simulada** porque as regras [17, 34, 47] estão pendentes. Na borda aberta a nave é contida na linha da borda: a queda não é decidida aqui. Impulso a partir da volta 2 é **regra de teste** (README), não decisão [31–33]. Elástico do rival e pelotão compacto são comportamentos de teste declarados (GDD [53] pendente).
- **Roteiro reproduzível do jogador:** momentos ligados à pista, não a tempos fixos — impulsos na volta 2, emboscada do rival na chicane, aproximação da borda aberta, ausência deliberada da recarga, raspagem na curva inclinada, queima de energia até o crítico na volta 3, recarga e caça ao rival no Esse final.
- **Corrida padrão (semente 20261011):** ≈ 2 min 55 s; voltas de 54–61 s; médias coerentes com a distância (teste 07).
- **Cenários:** largada, tráfego intenso, alta velocidade, loop, salto, defesa, impacto, borda aberta, baixa energia, disputa, volta final e conclusão. Cada um é um marcador na corrida canônica, encontrado pelo evento correspondente.

## 7. Laboratório

- Vistas: única, lado a lado, HUD×3 (mesma câmera), CÂM×3 (mesmo HUD), matriz 3×3. Quadro livre, 16:9, 21:9 ou 9:16 (letterbox).
- Comparação sequencial: em vista única, **X** alterna entre a 1ª e a 2ª combinação no mesmo quadro (com pausa, o mesmo instante exato). Combinações recomendadas: A+A Arcade épico, B+B Combate tático, C+C Competição precisa.
- Transporte: reproduzir/pausar, ±1 quadro, Shift ±1 s, reinício do cenário, 0,25×/0,5×/1×; linha do tempo com marcadores de eventos do jogador e dos cenários, **busca verdadeira** (restaura o snapshot de 1 s anterior, recalcula até o instante e aquece as câmeras por 3 s).
- Painel recolhível (sobrepõe o palco em telas estreitas): HUD, Câmera, Comparar, Cena & VFX, Corrida, Notas. Cada alternativa tem sliders próprios, editáveis sem selecioná-la.
- Diagnóstico separado do HUD (tecla D): fps, tempo de quadro, draws, triângulos, naves, vértices de VFX, buffers, tick, digest do estado, horizonte gravado, restaurações de contexto.
- Teclado: Espaço, ←/→, Home, 1/2/3 (HUD), Q/W/E (câmera), V (vista), X, F (tela cheia), P (painel), D, [ ].

## 8. Movimento

| Token | Duração | Curva | Uso e justificativa |
| :--- | :--- | :--- | :--- |
| snap | 0,09 s | saída | reação mínima perceptível a um evento |
| punch | 0,24 s | outBack (2,4) | posição e carimbos; ultrapassar curto o bastante para não atrasar a leitura |
| slide | 0,18 s | saída cúbica | entrada de módulos e mensagens |
| exit | 0,14–0,22 s | entrada cúbica | saída mais rápida que a entrada: a informação velha some primeiro |
| banner | 0,16 + 0,75 + 0,24 s | saída / entrada | faixas de volta; legível sem cobrir a pista por mais de ~1,2 s |
| alarme | 2,2 Hz | senoide | pulsos ≤ 3 Hz (critério WCAG 2.3.1 para flashes) |
| estilhaço | 0,42 s | balística | perda de energia visível e com peso |
| trilha de dano | 0,4 s + 0,3–0,45 s | linear | o jogador vê quanto perdeu antes da barra se acomodar |

Toda animação usa o **tempo da simulação**: com pausa ela congela, e duas combinações no mesmo instante mostram o mesmo quadro. HUD A usa ultrapassagem e cinética; B, movimentos lineares e informação estável; C, saídas curtas sem ultrapassagem.

## 9. Configuração JSON (schema `gminus.p12v2.hud-camera-lab`, versão 1)

Campos: `schema`, `version`, `status` (fixo, "não concede aprovação"), `geometry` = `prototype-05/v1`, `artDirection` = `D-TOON-VECTOR-FLUX`, `paintSystem` = `B`, `vfxBaseline` = `prototype-04-v2/approved-calibration`, `selection` (hud, camera, view, aspect, left, right), `hud.A|B|C`, `camera.A|B|C`, `vfx` (drift A/B/C/E, collision B/D, flight C/D, boost.A/D/E, speedLines, light), `race` (seed 1–2³¹−1, laps 1–5, ships 12–30), `playback` (scenario, time, rate). A importação exige chaves exatas, tipos, faixas e opções aprovadas (por exemplo, Boost C e Drift D são rejeitados). É **atômica**: qualquer erro rejeita tudo e não altera configuração nem simulação. A interface e a API usam a mesma função.

### 9.1 Sliders dos HUDs

**HUD A — Flux Rush**

| Controle | id | Faixa | Padrão |
| :--- | :--- | :--- | ---: |
| Escala | `scale` | 0,7–1,4 × | 1 |
| Opacidade | `opacity` | 0,4–1 | 1 |
| Intensidade cinética | `kinetic` | 0–1,5 × | 1 |
| Peso da tinta | `inkWeight` | 0–2 × | 1 |
| Desalinhamento de impressão | `misregistration` | 0–2 × | 1 |
| Linhas de foco | `focusLines` | 0–1 | 0,6 |
| Retícula | `halftone` | 0–1 | 0,55 |
| Duração das faixas | `bannerHold` | 0,6–1,8 × | 1 |
| Margem de segurança | `safeArea` | 0–8 % | 3 |
| Minimapa | `minimap` | liga/desliga | ligado |

**HUD B — Vector Tactical**

| Controle | id | Faixa | Padrão |
| :--- | :--- | :--- | ---: |
| Escala | `scale` | 0,7–1,4 × | 1 |
| Opacidade | `opacity` | 0,4–1 | 1 |
| Alcance de ameaças | `threatRange` | 40–200 m | 110 |
| Raio do anel | `ringRadius` | 6–16 m | 10,5 |
| Alcance dos colchetes | `bracketRange` | 40–320 m | 180 |
| Alcance do radar | `radarRange` | 120–600 m | 280 |
| Escada tática | `ladderSize` | ±1–4 | 2 |
| Persistência do indicador de dano | `damagePersist` | 0,4–2,5 s | 1,2 |
| Opacidade da camada no mundo | `worldOpacity` | 0–1 | 0,85 |
| Margem de segurança | `safeArea` | 0–8 % | 3 |
| Radar | `radar` | liga/desliga | ligado |
| Indicadores de janela de ataque | `attackAssist` | liga/desliga | ligado |
| Modo do radar | `radarMode` | local / circuito | local |

**HUD C — Apex Line**

| Controle | id | Faixa | Padrão |
| :--- | :--- | :--- | ---: |
| Escala | `scale` | 0,7–1,4 × | 1 |
| Opacidade | `opacity` | 0,4–1 | 1 |
| Janela da previsão (tempo) | `forecastSeconds` | 2–12 s | 7 |
| Alcance máximo da previsão | `forecastRange` | 800–4000 m | 2400 |
| Largura da faixa de previsão | `stripWidth` | 0,35–0,9 × tela | 0,5 |
| Janela do módulo rival | `rivalWindow` | 0,3–3 s | 1 |
| Opacidade em cruzeiro | `dimLevel` | 0,15–0,9 | 0,4 |
| Margem de segurança | `safeArea` | 0–8 % | 3 |
| Recolher em cruzeiro | `autoHide` | liga/desliga | ligado |
| Radar | `radar` | liga/desliga | ligado |
| Marcadores de frenagem/ápice | `trackMarkers` | liga/desliga | ligado |
| Referência do delta | `deltaRef` | melhor / última | melhor |
| Escala da previsão | `forecastMode` | tempo / distância | tempo |

## 10. Arquitetura

| Módulo | Responsabilidade |
| :--- | :--- |
| `00-core.js` | vetores, RNG com estado, easing, molas, hash de estado |
| `10-track.js` | geração da pista, referenciais e metadados; amostradores sem alocação |
| `20-sim.js` | simulação determinística, eventos, classificação, snapshots, cenários |
| `25-telemetry.js` | valores derivados (intervalos, delta, previsão, ameaças) |
| `30-director.js` | prioridades e canais de texto por HUD |
| `40-camera.js` | três câmeras, projeção, matriz de visão com "para cima" arbitrário |
| `50-hud-common.js`, `51/52/53-hud-*.js` | fonte vetorial, paleta, tokens de movimento, três HUDs |
| `60-config.js` | contrato JSON e validação |
| `70-render-world.js`, `71-render-race.js` | ambiente, naves (renderModel do 06), VFX (04 V2), camada no mundo |
| `80-app.js` | executor, busca, layout de viewports, interface e API (`window.__GMINUS_P12V2__`) |

O build embute, sem alteração e em escopo próprio, o bloco do P05, o resolvedor de pintura e o renderizador D do 06 (com o mesmo ajuste de liberação de shaders do 04 V2) e `vfx-state.js`/`vfx-effects.js` do atelier. A simulação gasta ≈ 2,2 s de CPU para pré-calcular a corrida inteira: na página, isso é feito em fatias de 7 ms por quadro, sem bloquear a reprodução.

## 11. Testes e evidências

`npm test` executa 18 testes do P12 V2: bloco P05 (SHA-256 e impressões), cópias exatas do 06 e do 04 V2, pintura de cada nave pelo `resolveLivery`, saída dos três HUDs e das três câmeras, independência das nove combinações, efeito de todos os sliders, opções e seletores (HUD e câmera), "para cima" contínuo e nave sempre enquadrada no loop, classificação dos 30, coerência de velocidade/distância/voltas/cronômetro, coerência telemetria ↔ VFX ↔ HUD, determinismo e busca, JSON válido/inválido/atômico, prioridades com eventos simultâneos, legibilidade e sobreposição em seis resoluções (16:9, 21:9, 9:16), orçamento de desempenho, ciclo de vida WebGL (contexto simulado: buffers estáveis, perda/restauração, liberação total), alternância rápida e HTML em dia com as fontes. As evidências de navegador real estão em [`docs/evidence/12_hud_camera_lab_v2/`](../evidence/12_hud_camera_lab_v2/README.md).

## 12. Limitações verdadeiras

- **Desempenho em GPU real não medido.** As medições de navegador usaram Chromium headless com SwiftShader, que rasteriza na CPU: 82 ms/quadro em vista única e 488 ms na matriz 3×3, sem valor de referência para GPU. HUDs: 1,3–2,2 ms por quadro a 1080p.
- A **sensação de movimento** das câmeras foi verificada por testes numéricos e capturas paradas, não por avaliação humana em tempo real.
- Fontes do sistema (Bahnschrift e equivalentes) variam por plataforma. Os numerais e títulos usam a fonte vetorial própria e não dependem disso.
- Com as camadas de Boost A/D/E ligadas (padrão do 04 V2), os ecos do Boost D ocupam a parte inferior da tela nas câmeras próximas. Os toggles estão no painel.
- Contramão [19] não é demonstrada: a simulação não gera giro para trás sustentado. A prioridade foi prevista, mas não foi testada visualmente.
- Em vistas múltiplas pequenas, o HUD é escalado pela altura da célula, como ficaria numa tela daquele tamanho. A legibilidade foi testada só em resoluções reais.
- IA, elástico e roteiro do jogador são instrumentos de teste, não comportamento proposto.

## 13. Decisões pendentes do responsável

1. Escolher o(s) HUD(s) e a(s) câmera(s), ou combinações, para avançar, e registrar a configuração JSON final.
2. Política de luz das naves em movimento: mundo (padrão atual) × câmera (diagnóstico do 06).
3. Convenção de escala de mundo (1 u = 1 m) e velocidade exibida, junto com P08/P09.
4. Estado padrão dos toggles de Boost A/D/E no jogo (pendência do 04 V2).
5. Se o HUD deve mostrar escudo de adversários (B mostra até 150 m) e janelas de ataque (assistência).
6. Aplicação do raio de 130 % do Spin E (pendente desde o 04 V2).
