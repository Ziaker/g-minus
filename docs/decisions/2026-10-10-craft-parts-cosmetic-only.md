# Decisão — Naves e peças exclusivamente cosméticas

**Data:** 2026-10-10
**Tipo:** decisão de design do responsável. Altera os requisitos [28] e [72–74] do [GDD](../GDD.md).
**Estado de implementação:** **não aplicada ao código.** O código atual ainda diferencia o desempenho das naves (ver a [auditoria de divergências](../audits/2026-10-10-craft-stats-divergence.md)).

## 1. Decisões do responsável

1. **As quatro peças das naves são exclusivamente cosméticas.**
2. **Não há diferença de atributos ou de status entre naves.** A escolha de nave e de peças não concede vantagem de velocidade, aceleração, boost, resistência, ataque ou dirigibilidade.
3. Isso **substitui** a concepção anterior de peças com atributos próprios e de naves com especializações de desempenho (GDD [72], [73]).
4. **Ficam preservadas** as nove geometrias aprovadas no [Protótipo 05](2026-10-10-prototype-05-craft-geometry-approval.md) e o [Sistema B de pintura](2026-10-10-prototype-06-paint-system-approval.md).
5. **Intenção de equilíbrio competitivo:** diferenças cosméticas não devem criar vantagens físicas ocultas. Os **detalhes de implementação** ficam pendentes até uma discussão específica (seção 3): padronização exata de massa e altitude, e aplicação das configurações do Protótipo 07 a todos os competidores.
6. **A definição técnica das hitboxes fica pendente de prototipação.**

## 2. O que é superado

| Fonte | Texto anterior | Situação |
| :--- | :--- | :--- |
| GDD [28] | altitude determinada pelos atributos das quatro peças | superado: as peças não têm atributos. A regra de altitude está pendente |
| GDD [72] | peças determinam velocidade, aceleração, controle, resistência, ataque e eficiência de boost | superado pelos itens 1 e 2 |
| GDD [73] | equilíbrio geral com especializações relevantes | superado pelo item 2 |
| GDD [74] | tamanho e massa influenciam colisões e manobras | superado quanto à vantagem de desempenho; o tratamento da colisão está pendente |
| GDD [77] | atributos fixos | perde o sentido: não há atributos por nave |
| README, "Máquinas & Estatísticas" | tabela Body/Boost/Grip por nave | descreve o código atual, não o design |
| Decisão do Protótipo 05, "Não aprovado" | atributos, massa e balanceamento ligados às formas | superado pelo item 2 |

## 3. Questões abertas (não decididas)

- **Hitboxes:** volume competitivo padronizado, volume por forma com compensação, ou outra regra. As formas aprovadas são muito diferentes (ex.: Agulha longa, Aríete largo).
- **Massa e altitude:** como garantir na prática que sejam equivalentes entre as naves.
- **Protótipo 07:** se as configurações de física do pré-jogo valem para todos os competidores da corrida e como isso se relaciona com a dificuldade da IA.
- **Peças:** nomes e funções das quatro peças, compatibilidade entre naves, regras de montagem e encaixe.
- **Cores:** relação entre as cores por peça [72, 78] e os 7 papéis de material do Sistema B; cores aleatórias.
- **Spin E:** o raio do VFX aprovado (provisório: varredura da nave +30 %) muda conforme o tamanho da nave, enquanto o raio de jogo é igual para todas. Falta decidir se o efeito deve representar o raio de jogo.
- **Balanço do motor** (aceleração × velocidade máxima, ajuste pré-corrida do jogador): manter ou não.

## 4. Fora do escopo desta decisão

Nenhuma alteração de código, de parâmetros aprovados ou de protótipos. A remoção das diferenças de desempenho no código exige uma tarefa autorizada própria, com teste de equivalência.
