# Auditoria — Diferenças de desempenho entre naves no código atual

**Data:** 2026-10-10
**Motivo:** a [decisão de naves e peças exclusivamente cosméticas](../decisions/2026-10-10-craft-parts-cosmetic-only.md) proíbe diferenças de desempenho entre naves. O código atual ainda as aplica.
**Método:** leitura estática de `src/game/Game.ts` e `src/game/Vehicle.ts` na `main` (`bccd2a6`). **Nenhum código foi alterado.**

## 1. Pontos de divergência

| Local | O que faz | Efeito em jogo |
| :--- | :--- | :--- |
| `Game.ts:29–160`, `MACHINE_ROSTER` | as 10 naves têm `maxSpeed`, `acceleration`, `handling`, `boostMultiplier` e `stats` (`body`, `boost`, `grip`) diferentes | origem das diferenças |
| `Vehicle.ts:186–196` | velocidade máxima, aceleração e velocidade com boost do Perfil C aprovado são multiplicadas por `maxSpeed / 172`, `acceleration / 84` e `boostMultiplier / 1.55` da nave | a física aprovada varia por nave |
| `Vehicle.ts:198–200`, `1084` | `bodyArmorFactor` (A 0,65 … E 1,5) multiplica o dano recebido | resistência diferente |
| `Game.ts:595–596` | `bodyArmorFactor` também multiplica o empurrão no contato entre naves | ataque e defesa físicos diferentes |
| `Vehicle.ts:202–204`, `889` | `gripFactor` (A 0,02 … E 0,16) multiplica a aderência | dirigibilidade diferente |
| `Vehicle.ts:879`, `883` | `config.handling` multiplica o esterço e a inclinação | dirigibilidade diferente |

## 2. Itens relacionados que não são diferença entre naves

- **Balanço do motor** (`Vehicle.ts:173–183`; `Game.ts:267`, `301`): ajuste pré-corrida do jogador entre aceleração e velocidade máxima, de −1 a +1. Os rivais recebem um valor aleatório entre −0,25 e +0,25. Não depende da nave, mas muda o desempenho. Manter ou não é uma **questão aberta**.
- **README, seção "Máquinas & Estatísticas":** descreve as diferenças do código atual e cita pilotos, que o GDD [79] não prevê por ora.

## 3. Consequências

- A física aprovada no Protótipo 01 (Perfil C) só se aplica sem alteração à Blue Falcon. Ela é a única com escalas iguais a 1, mas ainda tem `stats` B/C/B.
- Um circuito de referência (Protótipo 09) testado com essas diferenças mediria a nave, não a pista. **Recomendação técnica:** naves uniformes nos laboratórios.
- **A remoção exige uma tarefa autorizada**, com teste de equivalência entre o Perfil C do laboratório e o jogo. Os detalhes de massa, altitude e hitbox estão pendentes (ver a decisão).
