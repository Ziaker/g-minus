# P09 — instrumentos da etapa 0

Ferramentas de medição do [P09](../../../docs/specs/09_reference_circuit_spec.md), em Node.js, sem dependências. **São instrumentos de teste:** não são pistas, laboratório, regras de corrida nem IA do jogo. Consomem a física do P08 revisão 4 só para leitura (`load-p08.cjs`); nenhum arquivo do P08 é alterado.

| Arquivo | Função | Especificação |
| :--- | :--- | :--- |
| `load-p08.cjs` | carrega `profile-c.generated.js` e `core.js` num contexto isolado | §3.3 |
| `surface.cjs` | camada 2: malha a partir de uma lista de seções, com os métodos do P08 (`tri`, `smoothNormals`, `surface`, `candidates`, `spawn`) | §5, §5.1 |
| `compat.cjs` | compara a pista técnica do P08 com sua reconstrução: malha e estados físicos passo a passo | §5.1 |
| `geometry.cjs` | validador: fechamento, cobertura por categoria (plana, tubo parcial, tubo fechado) com indicação de cobertura incompleta, erro de normal, saltos de curvatura | §8.1 |
| `frame.cjs` | referencial de pista: seção mais próxima, desvio lateral, altura e rumo | — |
| `detach.cjs` | classificador de desprendimentos por causa física; intencional só em trechos marcados (seções, tipo, motivo) | §8.2 |
| `timing.cjs` | cronômetro com linha exata e aviso de sentido contrário | §7, GDD [15, 19] |
| `pilot.cjs` | piloto de teste (← → e acelerador), com atraso de percepção | §8.5 |
| `envelope.cjs` | envelope de curva com velocidade estabilizada e histórico de contato em todo o ensaio, em plataforma plana | §8.3 |
| `perf.cjs` | custo da física por passo com 1, 8, 16 e 30 naves | §9 |
| `run-etapa0.cjs` | executa tudo e grava `docs/evidence/p09-etapa0/etapa0-results.json` | §11 |

```
node prototypes/p09-reference-circuit/instruments/run-etapa0.cjs   # evidências (~1 min)
node --test tests/p09_instruments.test.cjs                         # testes dos instrumentos (~20 s)
```

Relatório da etapa: [`docs/evidence/p09-etapa0/README.md`](../../../docs/evidence/p09-etapa0/README.md).
