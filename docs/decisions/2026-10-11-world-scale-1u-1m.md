# Decisão — Escala física do mundo: 1 u = 1 m

**Data:** 11/10/2026

**Autoridade:** responsável pelo projeto. Confirmação direta na conversa ("pode ser sim"), em resposta à proposta de oficializar 1 u = 1 m.

**Tipo:** convenção de unidades. Não muda nenhum valor de física, pista ou nave.

## Decisão

- **1 unidade do mundo (u) = 1 metro.** Velocidade em u/s × 3,6 = km/h.
- Exemplos: `topSpeed` atual do jogo, 500 u/s = **1800 km/h**; cruzeiro da corrida de teste do P12, ≈ 358 u/s ≈ 1290 km/h.
- A mesma escala vale para todas as distâncias mostradas em metros:
  - alcance do radar e dos colchetes;
  - previsão de pista;
  - intervalos em distância;
  - avisos de borda aberta.

## O que isso resolve

- Valida o fator 3,6 que os laboratórios P08 e P12 já usavam como convenção provisória. A condição de "escala física antes do km/h" da integração do P12 fica cumprida.
- Os valores físicos aprovados no P01, no P07 e no P08 não mudam. A decisão só fixa como interpretá-los e exibi-los.

## O que não decide

- Tamanho visual das naves e da pista em relação a essa escala (modelos do P05, pistas do P09).
- Hitboxes competitivas, ainda pendentes.
- Qualquer integração em `src/game`. A integração do P08 e do P12 continua pendente e exige pedido explícito.
