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
| 37 testes do P08 verdes | sim: 149/149 na suíte completa (seção 8) |
| Equivalência nos cenários equivalentes | sim: malha e física idênticas bit a bit (seção 1) |
| Ferramentas reproduzíveis | sim: sementes e passo fixos; 7 testes automatizados |
| Autorização para a etapa 1 | **pendente: decisão do responsável** |

## 1. Compatibilidade com o P08 (§5.1)

A pista técnica do P08 foi reconstruída pela camada 2 (`surface.cjs`) a partir das próprias seções do P08.

- **Malha:** 39 300 triângulos idênticos bit a bit (posições, normais de face e normais suavizadas).
- **Física:** 13 cenários, com 500 a 900 passos cada, deram estados idênticos em todos os passos:
  - as dez áreas com acelerador;
  - as manobras P01;
  - a parede com direção alternada;
  - a rampa com boost e ↑ no ar (controles da revisão 4).

A camada 2 reutiliza os métodos do P08 (`tri`, `smoothNormals`, `surface`, `candidates`, `spawn`). Só o laço de montagem é reescrito, com largura, raio de tubo e barreiras como parâmetros. Isso a torna apta a montar geometrias novas sem mudar o contato.

## 2. Validador geométrico (§8.1), aplicado à pista técnica do P08

- **Cobertura:** 14 441 consultas de superfície, 0 falhas. O erro máximo de normal é 0,46°, no teto do tubo, dentro do registrado na auditoria do P08.
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

## 4. Classificador de desprendimentos (§8.2)

A causa física é recalculada pelo instrumento. Ele não depende do texto `s.reason` do P08, que sobrescreve o motivo de reação (pendência B-1, não executada).

| Cenário | Causa classificada | Candidatos a injustificado |
| :--- | :--- | :-: |
| Curva aberta sem direção | saída pela borda | 0 |
| Parede 90° → loop sem direção | saída pela borda | 0 |
| Tubo: volta de 360° com → mantida | limite de reação (15 eventos, todos > 2500 u/s²) | 0 |
| Rampa e lacuna | intencional (trecho marcado) | 0 |
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

| Naves | ms por passo | Fração do orçamento de 120 Hz (8,33 ms) |
| :-: | :-: | :-: |
| 1 | 0,70 | 8 % |
| 8 | 4,5 | 54 % |
| 16 | 6,9 | 83 % |
| 30 | 12,6 | **151 %** |

**Neste ambiente, 30 naves com a física do P08 a 120 Hz não cabem no orçamento**, mesmo sem renderização e sem colisão entre naves. Os números variam entre execuções (cerca de 11,7 a 12,6 ms com 30 naves).

O hardware de referência é questão aberta da especificação. Mesmo assim, o resultado precisa de decisão antes da corrida completa com 30 naves (etapa 3). Opções, nenhuma decidida:
- otimizar a consulta de superfície, o que mexe no código do P08 e exige autorização;
- física de precisão reduzida para naves distantes;
- outra frequência para a IA.

## 8. Validação

- `npm test`: **149/149** (142 anteriores, incluindo os 37 do P08, mais 7 novos testes dos instrumentos), numa cópia isolada da árvore desta entrega.
- `build.mjs --check` do P08 e do P12: HTMLs idênticos às fontes.
- `npm run build`: concluído; os instrumentos não entram na distribuição.

## 9. Próximo passo (requer autorização)

**Etapa 1:** circuito simples e fechado, sem elementos verticais, montado pela camada 2. Medições previstas:
- fechamento e cobertura com o validador;
- tempo de volta com o piloto e o cronômetro;
- calibração da regra de comprimento para 55–65 s.

Antes da etapa 1, recomendo decidir:
1. como tratar o risco de desempenho (seção 7);
2. se a B-1 (motivo de desprendimento no P08) deve ser aplicada. O classificador já contorna essa pendência.
