# P09 — etapa 0: instrumentação e validação física

**Data:** 11/10/2026. **Autorização:** "comece o P09" = etapa 0 da [especificação](../../specs/09_reference_circuit_spec.md) (§11). As etapas seguintes (circuito, experiências, laboratório) **não estão autorizadas** e exigem autorização própria.

**Escopo cumprido:** só instrumentos de medição, em `prototypes/p09-reference-circuit/instruments/` ([guia](../../../prototypes/p09-reference-circuit/instruments/README.md)), e testes em `tests/p09_instruments.test.cjs`.

**Não alterado:**
- física do P08 e seus parâmetros;
- HUD do P12;
- `src/game`;
- baselines e decisões.

Nenhuma pista do P09 foi criada.

**Dados completos:** [`etapa0-results.json`](etapa0-results.json), gerado por `run-etapa0.cjs`. É determinístico, exceto os tempos de CPU.

## Critérios de aceite da etapa 0 (especificação §11)

| Critério | Resultado |
| :--- | :--- |
| 37 testes do P08 verdes | sim: 154/154 na suíte completa (seção 8) |
| Equivalência nos cenários equivalentes | sim: malha e física idênticas bit a bit, verificadas pela suíte automatizada nos 13 cenários (seção 1) |
| Ferramentas reproduzíveis | sim: sementes e passo fixos; determinismo de agendamento verificado (seção 10); 12 testes automatizados |
| Autorização para a etapa 1 | **pendente: decisão do responsável** |

## 1. Compatibilidade com o P08 (§5.1)

A pista técnica do P08 foi reconstruída pela camada 2 (`surface.cjs`) a partir das próprias seções do P08.

- **Malha:** 39 300 triângulos idênticos bit a bit (posições, normais de face e normais suavizadas).
- **Física:** 13 cenários, com 500 a 900 passos cada, deram estados idênticos em todos os passos:
  - as dez áreas com acelerador;
  - as manobras P01;
  - a parede com direção alternada;
  - a rampa com boost e ↑ no ar (controles da revisão 4).

Desde a revisão técnica, os 13 cenários fazem parte de `npm test` (teste "os 13 cenários equivalentes…"): uma regressão em qualquer passo de qualquer cenário reprova a suíte, sem depender do executor manual.

A camada 2 reutiliza os métodos do P08 (`tri`, `smoothNormals`, `surface`, `candidates`, `spawn`). Só o laço de montagem é reescrito, com largura, raio de tubo e barreiras como parâmetros. Isso a torna apta a montar geometrias novas sem mudar o contato.

## 2. Validador geométrico (§8.1), aplicado à pista técnica do P08

- **Cobertura completa, por categoria de seção:** 14 889 consultas de superfície, 0 falhas.

  | Categoria | Seções amostradas | Consultas | Falhas | Erro máximo de normal |
  | :--- | :-: | :-: | :-: | :-: |
  | Plana (inclui parede e loop) | 1271 | 8897 | 0 | 0,25° (linha central) |
  | Transição parcial de tubo (0 < tube < 1) | 64 | 448 | 0 | 1,11° (contra a normal 3D analítica) |
  | Tubo fechado | 77 | 5544 | 0 | 0,46° (teto) |

  **Correção da revisão técnica:** a versão anterior pulava as 130 seções de transição parcial de tubo e declarava cobertura total. Agora:
  - elas são amostradas com a mesma fórmula de seção transversal da malha;
  - o relatório traz o campo `completa`;
  - uma seção que não possa ser amostrada é contada em `naoAmostradas` e a cobertura é declarada **incompleta**, nunca 100 %. Há teste para esse caso.

  Nas transições, a superfície também se inclina ao longo da pista, porque as paredes sobem ou descem enquanto o tubo abre. Decomposição em relação ao eixo da pista:
  - erro no plano da seção: até 0,76°;
  - inclinação longitudinal: 24,6° na malha contra 25,5° no cálculo analítico.

  É geometria real, não defeito de malha. Comparar com a normal 2D do arco daria um falso erro de cerca de 25°.
- **Fechamento:** não se aplica, porque a pista do P08 é aberta. A função está pronta para circuitos fechados.
- **Transições abruptas detectadas** (saltos de curvatura entre seções):

  | Local | Salto |
  | :--- | :--- |
  | Entrada do loop | curvatura de 0 para 1/190 u⁻¹ (raio 190) num único passo |
  | Saída do loop, para o tubo | curvatura de 1/190 para 0 |
  | Início e fim da rampa | raio 344 de uma vez |
  | Parede 90° | saltos de torção muito menores (cerca de 0,0005 u⁻¹) |

  Na pista técnica isso é aceitável. Para o P09, indica onde serão necessárias transições suavizadas.

## 3. Envelope de curva com velocidade estabilizada (§8.3)

Medido em plataforma plana (mesma malha e contato do P08):
- acelerador modulado para manter a velocidade;
- direção por toques de ← (fração de um ciclo de 100 ms);
- 1 s de acomodação e 1 s de medição.

| Velocidade-alvo | 25 % de direção | 50 % | 75 % | 100 % |
| :-- | :-- | :-- | :-- | :-- |
| 200 u/s (720 km/h) | R 322 | R 203 | R 156 | R 128 |
| 300 u/s (1080 km/h) | R 470 | R 295 | R 218* | R 164* |
| 400 u/s (1440 km/h) | R 715 | R 450 | R 326* | R 244* |
| 500 u/s (1800 km/h) | R 1036 | R 651 | R 477* | R 360* |

\* A velocidade não se sustenta com essa fração de direção. A 500 u/s, com 100 % de direção, ela cai para cerca de 460 u/s. O raio é medido na velocidade alcançada.

- A aceleração lateral máxima medida foi de cerca de 590 u/s², bem abaixo do limite de reação do contato A (2500).
- Ou seja: **em superfície plana, quem limita a curva é a pilotagem do Perfil C, não o contato.**
- Correção: a medição preliminar do planejamento (queda de 500 para 270 u/s) foi feita sem acelerador e não vale como envelope.
- **Contato durante todo o ensaio (revisão técnica):** o envelope registra o contato em todos os passos, da acomodação até a medição, e conta desprendimentos e pousos.
  - Um ponto só é válido (`validoParaEnvelope`) com contato contínuo **e** velocidade estabilizada. Pontos inválidos continuam registrados como diagnóstico, com `motivosInvalidade` (`perda_de_contato` e/ou `velocidade_nao_estabilizada`).
  - Os 16 pontos da tabela tiveram contato contínuo; **10 são válidos**. Os 6 marcados com \* são diagnóstico, todos por velocidade não estabilizada.
  - Regressão: um impulso de diagnóstico no passo 5 faz a nave se soltar e pousar 212 passos depois. Ela termina apoiada, mas o ponto agora é **inválido**; antes era aceito.

## 4. Classificador de desprendimentos (§8.2)

A causa física é recalculada pelo instrumento. Ele não depende do texto `s.reason` do P08, que sobrescreve o motivo de reação (pendência B-1, não executada).

**Trechos intencionais (revisão técnica):** o classificador não trata mais as zonas 7 e 8 inteiras como intencionais. Só conta um trecho marcado explicitamente, com intervalo de seções, tipo (`rampa_lancamento`, `lacuna` ou `salto`) e motivo. Na pista do P08 há um único trecho:
- `p08-borda-e-lacuna`, seções 2015–2074;
- começa 8 seções antes da borda da rampa (seção 2023) e vai até o fim da lacuna.

Medido: com qualquer velocidade inicial entre 150 e 500 u/s, a nave se solta nas seções 2025–2027.

**Mecanismo declarado (fechamento da revisão):** estar dentro de um trecho marcado não basta. O evento só é intencional quando a causa física corresponde ao mecanismo de lançamento do tipo do trecho:

| Tipo | Mecanismos aceitos |
| :--- | :--- |
| `lacuna` | fim de superfície (`sem_superficie`) |
| `rampa_lancamento`, `salto` | fim de superfície ou separação balística (`velocidade_afastamento`) |

Qualquer outra causa dentro do trecho mantém a própria classificação. Todo evento registra separadamente:
- `causaFisica`;
- o contexto do trecho (`trecho`, com tipo, motivo, seções e mecanismos aceitos);
- `mecanismoEsperado`;
- a posição.

**Teste negativo:** num trecho do tubo marcado como `salto` só para o teste, as 15 perdas por limite de reação continuam sendo `limite_reacao` (`mecanismoEsperado: false`), com o contexto do trecho registrado. Saída lateral dentro de trecho marcado continua sendo saída pela borda. Trechos sem tipo válido ou sem motivo são rejeitados.

| Cenário | Causa classificada | Candidatos a injustificado |
| :--- | :--- | :-: |
| Curva aberta sem direção | saída pela borda | 0 |
| Parede 90° → loop sem direção | saída pela borda | 0 |
| Tubo: volta de 360° com → mantida | limite de reação (15 eventos, todos > 2500 u/s²) | 0 |
| Rampa e lacuna | intencional (`p08-borda-e-lacuna`, seção 2023) | 0 |
| Rampa: saída lateral antes da borda | saída pela borda (seção 2013, fora do trecho) | 0 |
| Rampa sem trecho marcado (teste) | sem superfície: candidato a injustificado | 1 (esperado) |
| Impulso de diagnóstico J | liberação de teste | 0 |

Saber se um desprendimento fica dentro ou fora do envelope seguro de cada trecho, e portanto se é erro de pilotagem ou falha, é trabalho da etapa 2.

## 5. Cronômetro com linha exata (GDD [15])

- **Teste analítico:** movimento uniforme a 600 u/s; o instante medido coincide com o exato (erro 0 em ponto flutuante).
- Na simulação, a passagem pela linha é interpolada dentro do passo de 1/120 s.
- Passagem à ré não conta volta e gera aviso [19].
- Passagem fora da largura da pista não conta.
- É instrumento de medição: não define regra de checkpoint.

## 6. Piloto de teste (§8.5)

Trecho parede 90° → fim do loop, só com ← → e acelerador, ajuste padrão:

| Velocidade inicial | Sem atraso | Atraso de 250 ms | Atraso de 350 ms |
| :-- | :-- | :-- | :-- |
| 180 u/s | completa (desvio máx. 4,5) | completa (7,6) | **não completa** (sai pela borda) |
| 300 u/s | completa (5,4) | completa (21,1) | **não completa** (sai pela borda) |
| 400 u/s | completa (6,2) | completa (15,9) | completa (23,8) |
| 500 u/s | completa (12,4) | completa (8,1) | completa (16,7) |

O resultado confirma a auditoria do P08: o trecho é pilotável. Com reação lenta, o ajuste fixo do piloto falha em velocidades menores. Isso é dado de projeto, não prova de dificuldade: **o piloto não comprova diversão nem facilidade**, e a validação humana continua obrigatória.

## 7. Custo da física por nave (§9): risco relevante

Física do P08 na pista técnica, tempo de CPU deste ambiente de nuvem. Não inclui colisão entre naves, que o núcleo do P08 não tem.

### 7.1 Validade do benchmark (fechamento da revisão)

O benchmark agora conta, a cada passo, as naves **ativas, em contato, no ar e paradas**, e atribui o tempo de cada chamada a `P.step` ao estado da nave antes do passo.
- **Retorno antecipado de `P.step()`:** com `s.stopped` verdadeiro, o passo custa cerca de 35–80 ns e não altera o estado. Não há nave parada em nenhuma medição.
- **O benchmark anterior não representava uma corrida.** Ele só acelerava, com direção senoidal; com 30 naves, só cerca de 7,7 ficavam em contato e cerca de 22,3 voavam fora da pista.
- **Custo por estado:**
  - passo em contato: cerca de 1,1–1,2 ms por nave;
  - passo no ar: cerca de 0,06–0,09 ms.
- Por isso foi criado o **modo pilotado**: o piloto de teste mantém cada nave na pista a 400 u/s. Nave parada ou fora de contato por mais de 2 s é recolocada; a recolocação é contada, e seu custo e o do piloto ficam fora do tempo medido.

| Naves | Modo | Ativas | Em contato | No ar | Paradas | Recolocações | ms por passo | Orçamento de 120 Hz |
| :-: | :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | pilotado | 1 | 1,0 | 0 | 0 | 0 | 0,82 | 10 % |
| 8 | pilotado | 8 | 6,8 | 1,2 | 0 | 3 | 8,1 | 97 % |
| 16 | pilotado | 16 | 13,6 | 2,4 | 0 | 6 | 15,9 | **191 %** |
| 30 | pilotado | 30 | 25,6 | 4,4 | 0 | 11 | 30,8 | **370 %** |
| 30 | livre (anterior) | 30 | 7,7 | 22,3 | 0 | 0 | 9,7 | 117 % |

**Conclusão revisada:** com as naves de fato na pista, a física do P08 cabe no orçamento de 120 Hz com cerca de 8 naves neste ambiente. Com 30 naves, usa cerca de 3,7 vezes o orçamento, mesmo sem renderização, sem IA e sem colisão entre naves. Os números anteriores (136–151 %) subestimavam o risco. Nenhuma otimização física foi feita nem autorizada.

### 7.2 Perfilamento por subsistema (fechamento da revisão)

`profile.cjs` usa uma instância isolada do P08 e embrulha em tempo de execução só o que é observável de fora, sem modificar arquivos. Estados com e sem instrumentação: **idênticos**. Custo do embrulho: cerca de 150 ns por chamada, desprezível. Modo pilotado:

| Subsistema | 1 nave | 8 naves | 30 naves | Chamadas por passo de nave |
| :--- | :-: | :-: | :-: | :-: |
| Consulta de superfície (`surface`, exclusiva) | 65,3 % | 65,1 % | **65,8 %** | ~2,8 |
| Restante, interno ao P08 (transporte, restrição de altura, matemática da colisão, voo assistido, integração) | 27,0 % | 26,9 % | 26,6 % | — |
| Grade espacial chamada pela consulta | 3,5 % | 4,0 % | 3,9 % | ~2,8 |
| Grade espacial chamada pela colisão | 2,1 % | 1,8 % | 1,8 % | 2 |
| Pilotagem do Perfil C (`drive`) | 2,0 % | 2,1 % | 1,8 % | 1 |
| Energia (`tickEnergy`) | 0,1 % | 0,1 % | 0,1 % | 1 |

- A **consulta de superfície** domina: cerca de dois terços do custo, com cerca de 200 µs por chamada.
- O "restante" não pode ser separado sem alterar o código aprovado do P08.
- **Não existe nesta etapa**, e portanto não é medido:
  - colisão entre naves;
  - IA;
  - regras de corrida e checkpoints com várias naves;
  - renderização WebGL, HUD, VFX, câmera e áudio.

As opções de mitigação continuam sem decisão:
- otimizar a consulta de superfície, o que exige autorização para mexer no P08;
- física de precisão reduzida para naves distantes;
- outra frequência para a IA;
- hardware de referência.

## 8. Validação

- `npm test`: **154/154** (142 anteriores, incluindo os 37 do P08, mais 12 testes dos instrumentos), numa cópia isolada da árvore desta entrega.
- `build.mjs --check` do P08 e do P12: HTMLs idênticos às fontes.
- `npm run build`: concluído; os instrumentos não entram na distribuição.

## 9. Revisão técnica — correções aplicadas

| # | Problema apontado | Correção | Teste de regressão |
| :-: | :--- | :--- | :--- |
| 1 | Envelope considerava contato válido só pelo estado final | histórico de contato em todos os passos; desprendimento seguido de pouso invalida o ponto | "envelope: desprendimento seguido de pouso invalida o ponto…" |
| 2 | Zonas 7 e 8 inteiras tratadas como intencionais | só trechos marcados (seções, tipo, motivo); evento com trecho, posição e causa física; saída lateral continua borda | "classificador: intencional só em trecho marcado…" |
| 3 | Transições parciais de tubo fora da cobertura | 0 < tube < 1 amostrado; normal 3D analítica; cobertura incompleta declarada quando não amostrável | "validador geométrico: cobertura com tubo parcial…" |
| 4 | 13 cenários só no executor manual | verificação integral na suíte automatizada | "os 13 cenários equivalentes…" |

Fechamento da revisão, aplicado num único commit posterior:

| # | Ajuste | Teste |
| :-: | :--- | :--- |
| 5 | Envelope: `validoParaEnvelope` exige contato contínuo e velocidade estabilizada; pontos não estabilizados ficam como diagnóstico | "envelope de curva: velocidade estabilizada…" |
| 6 | Classificador: intencional só quando a causa física corresponde ao mecanismo do tipo do trecho; causa física e contexto do trecho registrados separadamente | "classificador: intencional só em trecho marcado…" (inclui teste negativo) |
| 7 | Determinismo com passo fixo de 120 Hz e agendamento de 30, 60, 120 Hz e irregular | "determinismo: passo fixo de 120 Hz…" |
| 8 | Perfilamento por subsistema e contagem de naves ativas, em contato e paradas | "perfilamento por subsistema…" e "validade do benchmark…" |

Nenhuma correção alterou o comportamento físico: P08, P12, `src/game`, baselines e decisões estão inalterados.

## 10. Determinismo de agendamento

`determinism.cjs`: **simulação de agendamento, sem navegador.** Cada quadro de renderização avança um acumulador e executa quantos passos fixos de 1/120 s couberem, como o laço do laboratório do P08. As entradas são função do passo físico.

| Cenário | 30 Hz | 60 Hz | 120 Hz | Irregular (4–54 ms, semente) |
| :--- | :-: | :-: | :-: | :-: |
| Reta · manobras P01 (720 passos) | idêntico | idêntico | idêntico | idêntico |
| Parede → loop · direção alternada (600) | idêntico | idêntico | idêntico | idêntico |
| Tubo · volta com → (600) | idêntico | idêntico | idêntico | idêntico |
| Rampa · boost e ↑ no ar, revisão 4 (720) | idêntico | idêntico | idêntico | idêntico |

"Idêntico" quer dizer o estado físico completo igual em todos os passos.

**Diagnóstico:** se o teclado for amostrado por quadro, e não por passo, os estados divergem a 30 e 60 Hz. O primeiro passo divergente varia de 2 a 266, conforme o cenário. É efeito de latência de entrada, não de não determinismo da física.

**Fica para a validação em navegador**, numa etapa com laboratório:
- `requestAnimationFrame` real e variação de quadro;
- amostragem de teclado;
- abas em segundo plano.

## 11. Próximo passo (requer autorização)

**Etapa 1:** circuito simples e fechado, sem elementos verticais, montado pela camada 2. Medições previstas:
- fechamento e cobertura com o validador;
- tempo de volta com o piloto e o cronômetro;
- calibração da regra de comprimento para 55–65 s.

Antes da etapa 1, recomendo decidir:
1. como tratar o risco de desempenho (seção 7): com naves na pista, 30 naves usam cerca de 370 % do orçamento;
2. se a B-1 (motivo de desprendimento no P08) deve ser aplicada. O classificador já contorna essa pendência.
