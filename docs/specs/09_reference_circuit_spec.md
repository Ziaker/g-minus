# G-MINUS — Protótipo 09: circuito de referência

**ESPECIFICAÇÃO DE PLANEJAMENTO — IMPLEMENTAÇÃO NÃO AUTORIZADA**

**Data:** 11/10/2026. **Base:** `main` em `3e12331`, depois do merge do PR #2 (P08 revisão 4, P12 V2, escala 1 u = 1 m).

Este documento formaliza o planejamento do P09, que o responsável aceitou como direção. Ele não autoriza a etapa 0, o laboratório nem qualquer código. Cada etapa precisa de autorização própria. Nada aqui altera `src/game`, a física do P08, o HUD do P12 ou os baselines aprovados.

## 0. Rastreabilidade

| Rótulo | Significado |
| :--- | :--- |
| **[GDD]** | requisito do [GDD](../GDD.md), com o número do item |
| **[Aprovado]** | decisão do responsável já registrada antes deste planejamento |
| **[Decisão P09]** | decisão do responsável tomada neste planejamento, em 11/10/2026 |
| **[Proposta]** | recomendação técnica ainda não aprovada |
| **[Aberta]** | questão pendente; não decidir sem autorização |

Os valores numéricos marcados como **hipótese** são pontos de partida a confirmar por ensaio. Não são limites aprovados.

## 1. Objetivo

Transformar a física aprovada numa corrida completa, divertida, legível e pilotável, próxima de 3 minutos. O P09 valida isso num **circuito de referência**, antes do combate avançado (P10/P11) e das cinco pistas definitivas.

- **[GDD 5]** Duração média de cerca de 3 minutos; meta, não limite.
- **[GDD 14]** Três voltas como padrão, configurável.
- **[Aprovado — roadmap, decisão 2]** Gate de jogabilidade: uma corrida completa e divertida, perto de 3 minutos, antes de P10 e P11.
- **[Aprovado — roadmap, decisão 8]** O P09 é um protótipo de geometria, traçado, jogabilidade e interação com a física. Aproveita a linguagem D e as referências do Protótipo 03, sem tratá-las como pistas aprovadas, e não refaz trabalho aprovado.

## 2. Situação atual (registro)

- **Pista do jogo (`src/game/Track.ts`):** uma curva Catmull-Rom fechada de 21 pontos de controle. Tem variações de altitude (y de 5 a 45 m), mas usa o "para cima" global. Não tem inclinação lateral 3D real, paredes, loops, tubos nem superfícies arbitrárias como as do P08.
  - Polígono de controle de cerca de 5,7 km. A 400 u/s, isso dá voltas de cerca de 14 s e corridas de 40–50 s.
- **Pista técnica do P08:** dez áreas encadeadas sobre uma única linha central, sem fechamento.
  - Malha triangulada com normais suavizadas e consulta 3D de contato. É a base do contato A aprovado.
- **Pista de teste do P12:** circuito fechado de 19,67 km, gerado a partir de planta, perfil de altitude, loop e salto.
  - Usa transporte paralelo com correção de holonomia.
  - Serve só de instrumento do P12. Não está ligada à física do P08.

## 3. Escopo

### 3.1 Incluído

- **[Decisão P09 — escopo]** Laboratório isolado, no padrão dos protótipos anteriores. Contém:
  - as experiências A, B e C;
  - o circuito de referência;
  - uma corrida completa com várias naves.
- **[Decisão P09 — duração]** Opção C: o tempo de volta é a referência principal.
  - Objetivo inicial: 55–65 s por volta, cerca de 3 minutos em três voltas.
  - O comprimento resulta de medições de pilotagem real do Perfil C com a física do P08.
  - Não há comprimento fixado antecipadamente; 20–27 km não é obrigação.
- **[Decisão P09 — checkpoints]** Estudo comparativo de mecanismos de checkpoint, inclusive combinações.
- **[Decisão P09 — bifurcações]** Bifurcação mínima na experiência C, depois de um circuito simples, fechado e jogável ser validado.
- **[Decisão P09 — visual]** Toon Vector Flux D, com prioridade para:
  - pista legível e percepção de velocidade;
  - sinalização antecipada de curvas e obstáculos;
  - leitura de altura e identificação de bordas;
  - qualidade do enquadramento.
  - Cenário mínimo.

### 3.2 Fora do escopo

- Integração em `src/game`.
- As cinco pistas definitivas **[GDD 61]**, que continuam sendo requisito, para depois do gate.
- Combate avançado, impactos, destruição, K.O. e Clash (P10/P11).
- Regras de eliminação, recuperação e reaparecimento **[GDD 17, 34, 47]**.
- Regra definitiva de checkpoint e de atalhos.
- Largada antecipada **[GDD 13]**, salvo decisão posterior.
- Pistas dinâmicas **[GDD 70]**.
- Assistência automática de direção. **[Aprovado — decisão de 11/10/2026 na auditoria do P08]**

### 3.3 Sistemas preservados [Aprovado]

| Sistema | Registro |
| :--- | :--- |
| Perfil C (pilotagem terrestre) | [decisão P01](../decisions/2026-10-10-prototype-01-physics-approval.md) |
| Contato A e recuperação aérea da revisão 4 (P08) | [decisão revisão 4](../decisions/2026-10-11-prototype-08-air-control-approval.md) |
| Escala 1 u = 1 m | [decisão](../decisions/2026-10-11-world-scale-1u-1m.md) |
| HUD e câmeras do P12 V2 | [decisão](../decisions/2026-10-11-prototype-12-v2-hud-camera-approval.md) |
| Nove geometrias do P05, pintura B do P06, VFX do P04 V2 | registros em `docs/decisions/` |
| Toon Vector Flux D | [aprovação](02_toon_vector_flux_approval.md) |
| Naves cosméticas, desempenho uniforme | [decisão](../decisions/2026-10-10-craft-parts-cosmetic-only.md) |

Física e parâmetros aprovados não mudam no P09. Também ficaram recusadas as alterações A-2 (contato) e B-2 (tubo) avaliadas na auditoria do P08.

## 4. Pilares de qualidade [Proposta]

- **Ritmo:** alternar velocidade sustentada, trechos técnicos e momentos de disputa ao longo da volta.
- **Antecipação:** curvas, mudanças de orientação, bordas abertas e obstáculos visíveis e sinalizados antes de serem alcançados.
- **Consistência física:** a nave se comporta como esperado, inclusive em loops e paredes. Falhas só por erro de pilotagem ou por limites físicos aprovados.

## 5. Arquitetura recomendada [Proposta]

A pista se divide em quatro camadas independentes.

| Camada | Responsabilidade | Base candidata |
| :--- | :--- | :--- |
| 1. Traçado | lista declarativa de trechos → linha central, orientação, largura e metadados | técnica de traçado do P12 (transporte paralelo, fechamento) |
| 2. Superfície | malha triangulada, normais suavizadas, consulta de contato | regras do P08 (`tri`, `smoothNormals`, `surface`), sem alteração |
| 3. Regras de corrida | linha de chegada exata, voltas, setores e checkpoints em módulos combináveis | novo |
| 4. Instrumentação | telemetria, eventos de contato, piloto de teste, validadores | ferramentas da auditoria do P08 |

**Trechos previstos na camada 1:** reta, arco, inclinação lateral, rampa vertical, loop, tubo, torção (parede), lacuna e salto, mudança de largura, barreira, borda aberta e, depois, bifurcação.

### 5.1 Separação entre traçado e superfície

O gerador do P12 produz apenas o traçado. A malha e o contato seguem o P08. **Não se presume compatibilidade automática.** Ela é estabelecida assim:

1. **Regressão obrigatória:** os 37 testes oficiais do P08 continuam passando, sem alteração.
2. **Comparação de estados físicos só em cenários realmente equivalentes:** a mesma geometria, reconstruída pela nova sequência, com as mesmas sementes e entradas. Tolerâncias declaradas por métrica.
3. **Geometrias novas** (fechamento, largura variável, junções, bifurcação) recebem critérios próprios de superfície, contato e transição (seção 8). Não são comparadas com estados do P08 que não têm equivalente.

### 5.2 Capacidades novas

- Fechamento do circuito com continuidade de posição, direção e orientação.
- Largura variável e barreiras em qualquer trecho.
- Marcação de trechos de **desprendimento intencional** (rampas, lacunas, saltos).
- Bifurcação mínima: uma divisão e uma junção. Generalizar para uma estrutura com vários ramos só depois de medir o custo da bifurcação mínima.

## 6. As três experiências [Aprovado — roadmap; detalhamento: Proposta]

Cada experiência é uma volta completa e fechada sobre a mesma base: física, naves uniformes, IA básica e sinalização iguais. Nenhuma geometria específica fica aprovada antes da sua avaliação.

| | A — Velocidade e fluidez | B — Verticalidade e técnica | C — Disputa e risco |
| :--- | :--- | :--- | :--- |
| Foco | retas longas, curvas amplas, inclinação lateral suave, ultrapassagens | loops, espirais, tubos, paredes inclinadas, rampas | largura variável, barreiras, bordas abertas, zonas de disputa, risco de queda |
| Mede | velocidade sustentada, sensação de velocidade, espaço para ultrapassar | contato em transições, leitura espacial, recuperação aérea | interação entre naves, uso de barreiras, exposição a quedas; depois, a bifurcação mínima |
| Sliders (exemplos) | raios, comprimento das retas, inclinação, largura | raio do loop, taxa e ângulo de torção, raio e comprimento do tubo | larguras mínima e máxima, barreiras, número de bordas abertas |

O comprimento de cada volta é calibrado para 55–65 s com pilotagem representativa. A combinação no circuito de referência usa as características que você escolher.

**Entradas de projeto vindas da auditoria do P08 (fatos medidos, não regras aprovadas):**
- Em torções, o desvio lateral cresce cerca de 2,5× a cada 90° de torção, e a deriva é proporcional à altura de flutuação.
- No tubo de raio 26 u, o contato A se solta a partir de cerca de 230 u/s de velocidade em volta do tubo.
- Torções com bordas, barreiras ou ângulo limitado (A-3) são consideradas no projeto, sem aprovação antecipada.

## 7. Checkpoints e voltas

**[GDD 15]** Colocação pela passagem exata na linha de chegada.
**[GDD 18]** Validar voltas e detectar atalhos ilegais.
**[GDD 19]** Avisar sentido contrário.
**[GDD 67]** Atalhos que recompensam risco, sujeitos a checkpoint.

Falta definir o mecanismo técnico. **[Aprovado — roadmap, decisão 10]** Nenhuma regra detalhada está aprovada.

**[Decisão P09]** Estudo comparativo, sem escolha definitiva:

| Mecanismo | Funciona como | Ponto forte | Ponto fraco |
| :--- | :--- | :--- | :--- |
| A — Portais em ordem | planos atravessados em sequência | simples; setores e tempos parciais | rígido diante de rotas livres |
| B — Progresso contínuo | posição projetada no traçado, com salto máximo | detecta cortes em qualquer ponto | ambíguo com trechos sobrepostos ou verticais |
| C — Corredores de validade | volumes que definem o caminho legal | aceita atalhos legítimos | mais custo de autoria |

Combinações candidatas:
- A + B: setores, mais detecção de cortes;
- B + C: rotas alternativas.

**Cenários obrigatórios do estudo:**
- volta normal;
- corte pelo meio da pista;
- voo que pousa adiante;
- ré e sentido contrário (só aviso);
- loop e tubo com trechos sobrepostos;
- atalho legítimo simulado;
- passagem pela linha a 600 u/s, com interpolação exata.

## 8. Critérios de validação [Proposta]

### 8.1 Geometria

- **Fechamento** (hipóteses): posição < 1 mm; direção < 0,1°; orientação < 0,5°; sem torção acumulada.
- **Cobertura:** a consulta de superfície encontra pista em 100% de uma amostragem densa (todas as seções × posições laterais). Erro de normal dentro da tolerância medida no P08.
- **Transições:** continuidade de normal e de curvatura medida em cada junção de trechos.

### 8.2 Contato e desprendimentos

Cada trecho recebe um **envelope seguro** levantado por ensaio: faixas de velocidade, desvio lateral e orientação em que a pilotagem correta não perde contato.

O critério é a **ausência de falhas injustificadas dentro do envelope seguro**. Não se exige zero desprendimento em todas as velocidades. Os desprendimentos são classificados assim:

| Classe | Definição | Tratamento |
| :--- | :--- | :--- |
| Intencional | em trecho marcado (rampa, lacuna, salto) | esperado |
| Por erro de pilotagem | fora do envelope por trajetória ou velocidade inadequadas | preservado; é parte do jogo |
| Por limite físico aprovado | reação acima do limite do contato A, saída pela borda | preservado; o projeto do trecho deve deixar o limite legível e antecipável |
| Injustificado | dentro do envelope, sem erro de pilotagem | **defeito**; bloqueia a etapa |

### 8.3 Envelopes dinâmicos

Levantados por ensaio, não fixados por fórmula:

| Ensaio | Varia |
| :--- | :--- |
| Curvas | raio, velocidade, inclinação |
| Lombadas e vales | raio vertical |
| Torções | ângulo, comprimento, largura |
| Loops | raio, entrada, saída |
| Tubos | raio, velocidade em volta do tubo |
| Pousos | altura, velocidade, ângulo |

Ponto de partida (**hipótese**): v²/R ≤ 2500 u/s² com margem. Exemplo: 180 m a 600 m/s exige cerca de 2000 m/s². Isso não garante estabilidade em transições, torções ou combinações; só o ensaio valida.

O envelope de curva deve ser medido com **velocidade estabilizada**. Uma medição preliminar com direção plena mostrou perda forte de velocidade (de 500 para cerca de 270 u/s em 0,75 s), que mascara o raio.

### 8.4 Duração

- Volta de 55–65 s em pilotagem representativa.
- Três voltas entre 2,5 e 3,5 min.

### 8.5 Instrumentos automatizados

- O **piloto de teste** (com atraso de reação de 250–400 ms) e a **IA básica** são **instrumentos de teste**.
- Demonstram que uma passagem é possível e geram métricas.
- **Não comprovam diversão nem facilidade de pilotagem** e não definem comportamento de IA do jogo **[GDD 51–59]**.

### 8.6 Validação humana (obrigatória)

- Sessões suas com roteiro para cada experiência e para o circuito de referência.
- Questionário: ritmo, antecipação, consistência, sensação de velocidade, legibilidade, frustração e diversão.
- Notas livres e telemetria gravada da sessão.
- Nenhuma etapa com geometria jogável é aprovada sem essa validação.

### 8.7 Quedas no laboratório

Reiniciar a sessão de laboratório após uma queda é um **procedimento de teste**. **Não define** regras de eliminação, recuperação ou reaparecimento da corrida final **[GDD 17, 34, 47]**, que continuam pendentes (P10).

## 9. Métricas de desempenho [Proposta]

Testes progressivos com **1, 8, 16 e 30 naves**. O objetivo da corrida completa é **30 participantes** **[GDD 11]**.

| Métrica | Medida |
| :--- | :--- |
| Física | custo por passo a 120 Hz, incluindo o pior caso de consulta em tubos e trechos sobrepostos |
| Malha | triângulos, memória e tempo de geração por quilômetro |
| Renderização | tempo de quadro com GPU real; sem GPU (SwiftShader) só como regressão |
| Regras de corrida | custo dos checkpoints por nave e por passo |

O hardware de referência é questão aberta (seção 13).

## 10. Plano de testes [Proposta]

- **Automatizados:** sementes fixas; resultados idênticos a 30, 60 e 120 Hz de renderização; JSON estrito e atômico; HTML gerado conferido contra as fontes.
- **Regressão:** os 37 testes do P08 e a suíte completa do repositório (`npm test`) continuam verdes.
- **Catálogo de ensaios:** um cenário por item das seções 8.1–8.3 e 7, executável em linha de comando, com evidência em JSON.
- **Várias naves:** 1, 8, 16 e 30 naves, com IA básica e desempenho uniforme, colisões existentes e saída do grid.
  - Mede densidade do pelotão, contatos entre naves, quedas e espaço de ultrapassagem por setor.
  - Sem combate avançado.
- **Navegador:** capturas padronizadas por experiência; sem erros de página nem de WebGL.
- **Humano:** seção 8.6.

## 11. Etapas e critérios de aceite

Cada etapa termina em relatório. A seguinte só começa com autorização do responsável.

| Etapa | Entrega | Critério de aceite |
| :-: | :--- | :--- |
| 0 | Instrumentação: envelope de curva com velocidade estabilizada, piloto de teste, validador geométrico, classificador de desprendimentos, cronômetro com linha exata e verificação de compatibilidade (5.1) | 37 testes do P08 verdes; equivalência nos cenários equivalentes; ferramentas reproduzíveis; autorização para a etapa 1 |
| 1 | Circuito simples e fechado, sem elementos verticais | 8.1 e 8.2 atendidos; tempo de volta medido; regra de comprimento calibrada |
| 2 | Experiências A, B e C, com volta completa cada | seção 8 atendida; relatório comparativo; **sessão do responsável** |
| 2C+ | Bifurcação mínima na experiência C e estudo de checkpoints | cenários da seção 7; decisão do responsável sobre mecanismo e combinação |
| 3 | Circuito de referência combinado e corrida completa com 30 naves | duração, contato e desempenho (1→30 naves); **gate de jogabilidade aprovado pelo responsável** |

## 12. Dependências e riscos

**Dependências**
- P08 revisão 4, inalterado.
- P12 V2, como fonte do traçado e referência de HUD e câmera. A legibilidade em 720p fica registrada e não bloqueia.
- Correções pendentes (A-1, B-1, compatibilidade com Windows/CRLF): não bloqueiam. B-1 é desejável antes da etapa 0, porque o classificador de desprendimentos usa o motivo registrado.

**Riscos**

| Risco | Mitigação proposta |
| :--- | :--- |
| Volta de 55–65 s monótona | pilar de ritmo; mapa de ritmo por setor |
| Traçado do P12 incompatível com o contato do P08 | verificação 5.1 antes de qualquer pista |
| Torções e tubos limitarem a geometria | envelopes medidos; barreiras e bordas (A-3) |
| Instrumentos aprovarem trechos frustrantes | validação humana obrigatória |
| Custo com 30 naves em pistas longas | métricas progressivas desde a etapa 0 |
| Bifurcações exigirem uma estrutura com ramos | bifurcação mínima primeiro, com custo medido |
| Checkpoints ambíguos em trechos sobrepostos | cenários dedicados (seção 7) |

## 13. Questões abertas [Aberta]

1. Escopo da IA básica como instrumento: seguir o traçado com variação simples basta?
2. Hardware de referência para as metas de desempenho.
3. Posição da linha de largada e chegada em cada experiência.
4. Largada antecipada **[GDD 13]**: permanece fora do escopo?
5. Mecanismo e combinação de checkpoints: decisão depois do estudo (etapa 2C+).
6. Destino após queda na corrida final: depende do P10.

## 14. Estado

- Especificação de planejamento, aceita como direção pelo responsável em 11/10/2026.
- **Implementação não autorizada.** A etapa 0 exige autorização posterior.
- Este documento não altera `src/game`, a física do P08, o HUD do P12, os baselines nem decisões anteriores.
