# Especificação Técnica — Protótipo 07: Opções de Física no Pré-Jogo

**Status:** EM AVALIAÇÃO — nenhuma alternativa aprovada; não integrado ao jogo.
**Data:** 2026-10-10
**Arquivo:** [`prototypes/07_pregame_physics_options.html`](../../prototypes/07_pregame_physics_options.html), HTML autônomo, abre direto do disco.
**Dados:** gerados por [`prototypes/pregame-options/build-data.mjs`](../../prototypes/pregame-options/build-data.mjs) (`node prototypes/pregame-options/build-data.mjs`; `--check` confere sem reescrever).
**Classificação dos parâmetros:** [`prototypes/pregame-options/classify-params.mjs`](../../prototypes/pregame-options/classify-params.mjs) gera [`param-status.json`](../../prototypes/pregame-options/param-status.json) (`node prototypes/pregame-options/classify-params.mjs --write`).
**Testes:** [`tests/pregame_physics_options.test.mjs`](../../tests/pregame_physics_options.test.mjs).

## 1. Pedido e decisões do responsável (10/10/2026)

Pedido: *"todos os sliders presentes no primeiro protótipo sejam opções de pré-jogo"*. Antes do protótipo, o responsável decidiu:

| Questão | Decisão |
| :--- | :--- |
| Escopo agora | **Só os parâmetros que já funcionam no jogo.** Os outros entram no menu quando o sistema correspondente for integrado, sempre com efeito real. |
| Valores iniciais | **O export do Perfil C enviado pelo responsável** ([original](../decisions/2026-10-10-prototype-01-profile-c-export-original.txt), [JSON](../decisions/2026-10-10-prototype-01-profile-c-export.json)). Exemplos: esterço 89 °/s, inclinação máxima 34°, velocidade 500 / boost 600. |
| Organização | **Perfis A/B/C como ponto de partida** e **configuração salva entre sessões**. |
| Processo | **Protótipo do menu primeiro**, com três alternativas, antes da integração. |

Revisão do responsável sobre a primeira versão: os 93 campos de `PhysicsCalibration.ts` **não** funcionam todos. Antes do commit era preciso identificar quais estão conectados, quais existem só na calibração e quais dependem de sistemas futuros. Os não funcionais podem aparecer para planejamento, desde que identificados e sem serem apresentados como configuráveis no jogo atual. A seção 3 registra essa correção.

**Não decidido ainda:**
- os 18 valores ambíguos do export (seção 4);
- a atualização do código do jogo, que hoje usa esterço 56 e outras 11 divergências (ver a [reconciliação](../audits/2026-10-10-prototype-01-profile-c-reconciliation.md)).

## 2. Fontes dos dados (sem valores digitados à mão)

| Dado | Fonte |
| :--- | :--- |
| Quais parâmetros | os 93 campos de `APPROVED_PHYSICS` em `PhysicsCalibration.ts`, com mapeamento explícito de nomes (`MAP` no gerador) |
| Status de cada parâmetro | `param-status.json`, gerado pela classificação (seção 3) |
| Perfil C | export do responsável (valor exibido no texto) |
| Perfis A e B | `DEFAULTS.A` / `DEFAULTS.B` do laboratório 01. São **valores do laboratório, não aprovados**. Aparecem porque o responsável pediu os três perfis como ponto de partida |
| Limites, passo, rótulo, unidade | `LIMITS` do laboratório 01 |
| "jogo hoje" | o valor atual em `PhysicsCalibration.ts`, mostrado quando difere do export |

O teste garante que o bloco embutido no HTML é idêntico ao que o gerador produz a partir dessas fontes.

## 3. Classificação: o que funciona hoje

Cada parâmetro passa por dois critérios:
- **Conectado:** o código do jogo (`src/game/*.ts` e `src/main.ts`, fora de `PhysicsCalibration.ts`) lê `APPROVED_PHYSICS.<grupo>.<campo>`. É uma verificação estática.
- **Funcional:** alterar o valor em **+37 % ou −37 %** muda o resultado de simulações reais do jogo. As simulações carregam `Vehicle.ts`, `Game.ts` e `Track.ts` de `src/` e usam aleatoriedade com semente fixa. Cobrem:
  - pilotagem (acelerar, curvar, inclinar, drift, frear, boost);
  - combate entre duas naves (`Game.checkVehicleCollisions` real);
  - dois rivais com IA;
  - câmera (`Game.updateCamera` real);
  - sondas dirigidas: limite de inclinação, drift com inclinação, limiar de drift em baixa velocidade, duração e recarga do boost, alcance e recarga dos ataques (com o instante de cada golpe).

| Status no protótipo | Qtd. | No menu | Parâmetros |
| :--- | :-: | :--- | :--- |
| **Funcional** (conectado e com efeito demonstrado) | **53** | configurável | direção 10, inclinação 5, drift 5, propulsão 10, combate 13, suspensão 3 (altura, amplitude e frequência da ondulação), câmera 7 |
| **Só em `PhysicsCalibration.ts`** (o sistema existe, mas não lê o valor) | **25** | Planejamento, sem controle | inclinação: `bankTurnForce`, `bankDrag`, `rollReturnSpeed` · drift: `counterSteerAuthority`, `entrySlipKick`, `maxAngleDegrees`, `angularDamping` · combate: `bodySlamImpactMultiplier` · suspensão: `springStiffness`, `springDamping`, `magneticGripStrength` · IA: os 11 (`baseSpeed`, `aggressiveness`, `rubberbanding`, `laneChangeSpeed`, `topSpeedCap`, `boostFrequency`, `boostTopSpeed`, `boostAcceleration`, `corneringGrip`, `brakingTendency`, `catchupAcceleration`) · câmera: `fovFactor`, `rollFollow`, `driftSwing` |
| **Depende de sistema futuro** (voo e pouso) | **15** | Planejamento, sem controle | os 15 do grupo `flight`. Não existe física aérea nem de pouso em `src/game` |

Resultados da verificação:
- Todo parâmetro conectado mostrou efeito. Nenhum desconectado mostrou efeito.
- Na primeira passada, 12 conectados não mudavam o resultado. Os motivos eram limites, temporizações e alcances que os cenários gerais não atingiam. As sondas dirigidas confirmaram o efeito dos 12.
- **Limite do método:** "funcional" significa que o valor altera a simulação. Não mede se o efeito é perceptível ao pilotar.

## 4. Valores ambíguos

O export em texto mostra 1 casa decimal para controles com passo 0,05. Dos 93 parâmetros, **18** têm mais de um valor possível. **Nenhum valor foi escolhido em nome do responsável.**

- **8 configuráveis:** `speedInstability`, `lowSpeedSteerMultiplier`, `counterSteerBoost`, `tiltSteerBoost`, `driftYawBoost`, `slideTurnBoost`, `sideAttackCooldown`, `spinAttackCooldown`.
- **10 em planejamento:** `driftCounterSteerAuthority`, `bodySlamImpactMultiplier`, `magneticGripStrength`, `airSteerAuthority`, `landingBoostEfficiency`, `landingImpactThreshold`, `aiCorneringGrip`, `aiBrakingTendency`, `cameraRollFollow`, `cameraDriftSwing`.

No protótipo, eles usam o valor exibido no export e aparecem com o selo **⚠ ambíguo** e a lista de valores possíveis.

Das 12 divergências entre o export e o jogo:
- 5 são configuráveis: `steerRate`, `maxRoll`, `spinAttackDuration`, `hoverHeight`, `cameraDistance`;
- 7 são da IA e ficam em planejamento.

## 5. As três alternativas de organização

As alternativas de organização do menu (A/B/C) são **independentes dos perfis de física A/B/C**.

| | Nome | Organização | Teste de hipótese |
| :-: | :--- | :--- | :--- |
| **A** | Categorias completas | 7 grupos sanfonados com controles configuráveis (direção, inclinação, drift, propulsão, combate, suspensão, câmera), com contador de valores alterados por grupo | tudo visível e na estrutura do código |
| **B** | Básico + avançado | 11 controles essenciais (proposta, não aprovada: esterço, grip, inércia, inclinação máx., retenção no drift, velocidade, boost, aceleração, duração do boost, altura de flutuação, distância da câmera); os outros 42 em "Avançado", por abas. `aiAggressiveness` saiu da proposta inicial de 12 porque a IA atual não lê o valor | menos ruído para quem só quer o essencial |
| **C** | Lista pesquisável | busca por nome/chave, filtro por grupo, "só alterados", "só ambíguos" e coluna com o valor do perfil base | encontrar e comparar rapidamente |

**Comum às três alternativas:**
- cartões de perfil A/B/C no topo; escolher um perfil carrega os valores dele;
- os valores que diferem do perfil base ficam destacados;
- selos **⚠ ambíguo** e **jogo hoje**;
- salvamento automático no navegador (`localStorage`, chave `gminus.p07.v1`), restaurado ao reabrir a página. Dados salvos inválidos são ignorados. Se o armazenamento estiver bloqueado, a página avisa e o JSON continua disponível.
- **Planejamento:** abaixo do menu, em todas as alternativas. Mostra os 40 parâmetros sem efeito no jogo atual, separados em "Dependem de sistema futuro" (selo *sistema futuro: voo e pouso*) e "Só em PhysicsCalibration.ts" (selo *sem efeito no jogo atual*), com o valor do perfil escolhido e **sem slider**. Eles não entram no estado, no JSON nem na configuração enviada ao jogo.

**Independência:** cada alternativa guarda o próprio perfil base e os próprios 53 valores, para comparar as organizações sem interferência.

## 6. Ferramentas de avaliação (laterais; não fazem parte do menu proposto)

- **"O que o jogo receberia":** os 53 valores configuráveis no formato de `PhysicsCalibration.ts`. Grip e retenção de drift passam de % para fração, e os nomes viram os campos do código (ex.: `maxRoll` → `banking.maxRollDegrees`).
- **JSON** `gminus.pregame-physics-options` v1:

```json
{ "schema": "gminus.pregame-physics-options", "schemaVersion": 1, "approval": "none", "alt": "A",
  "configs": { "A": { "profile": "C", "values": { "steerRate": 89, "...": 0 } }, "B": { }, "C": { } } }
```

- **Validação do JSON:** estrita e atômica:
  - as três alternativas e os 53 valores configuráveis são obrigatórios;
  - parâmetro de planejamento ou desconhecido é rejeitado;
  - números finitos dentro dos limites;
  - perfil A/B/C;
  - `approval` só aceita `"none"`.
- **Ações:** copiar, aplicar e baixar.

## 7. Testes (2026-10-10)

`tests/pregame_physics_options.test.mjs` (11 testes):
1. dados embutidos idênticos aos gerados das fontes;
2. escopo de 93 parâmetros, 18 ambíguos e básicos só entre os funcionais;
3. classificação 53 / 25 / 15; `param-status.json` cobre os 93 declarados, e a conexão confere com o código atual;
4. amostra da simulação real: o esterço muda o resultado; a agressividade da IA e a sustentação de voo não mudam;
5. perfil C igual ao export (89, 34, 500/600), sem escolher valores ambíguos;
6. três alternativas independentes; aplicação de perfil e limites; parâmetros de planejamento não são ajustáveis;
7. conversão para o formato do jogo, só com os 53 funcionais;
8. persistência entre cargas da página e descarte de dados inválidos;
9. JSON estrito e atômico, que rejeita parâmetro de planejamento;
10. seção de planejamento com os 40 identificados, sem controles e fora do menu;
11. não integrado e sem declarar aprovação.

**Navegador real:** sem erros de console. As alternativas A, B e C mostram 53, 11 e 53 controles. O planejamento mostra 40 linhas e nenhum controle. A configuração para o jogo tem só os 7 grupos com efeito.

## 8. Limitações

- O protótipo avalia a **organização do menu**, não a sensação de pilotagem. Para sentir os valores, use o laboratório 01.
- "Funcional" é o efeito demonstrado nos cenários da seção 3, não uma medida de quanto o efeito é perceptível.
- A classificação vale para o código atual. Se o jogo passar a ler um parâmetro, rode `classify-params.mjs --write` e `build-data.mjs`. O teste 3 falha enquanto a conexão e o arquivo gerado divergirem.
- A sessão salva é por navegador. Não há contas nem sincronização.
- Os perfis A e B usam valores do laboratório que não foram aprovados.

## 9. Decisões pendentes de aprovação

- [ ] Alternativa de organização: **A**, **B** ou **C** (ou combinação).
- [ ] Os 18 valores ambíguos do perfil C: confirmar cada um ou enviar um export em JSON.
- [ ] Conjunto "básico" da alternativa B, se ela for escolhida.
- [ ] Se os perfis A e B entram no jogo com os valores do laboratório ou precisam de calibração própria.
- [ ] Os 25 parâmetros que existem só na calibração: conectar ao código (inclusive os 11 da IA) ou retirar.
- [ ] Integração: substituir os valores de `PhysicsCalibration.ts` pelos do export e tornar a física configurável em tempo de execução. Depois disso, um teste de equivalência entre menu, laboratório e jogo.
