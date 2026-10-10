# Aprovação do Protótipo 06 — Sistema de personalização de cor B

**Data:** 10/10/2026

**Decisão:** aprovado o **Sistema B — personalização por função de material**

**Autoridade:** responsável pelo projeto, declaração direta na conversa: *"Aprovo a opção B"*.

**Artefato:** [`prototypes/06_craft_paint_lab.html`](../../prototypes/06_craft_paint_lab.html) · [especificação](../specs/06_craft_paint_lab_spec.md) · [capturas](../captures/06_craft_paint_lab/)

**Bases mantidas:** [D — Toon Vector Flux](../specs/02_toon_vector_flux_approval.md) e os [nove modelos aprovados do Protótipo 05](2026-10-10-prototype-05-craft-geometry-approval.md), sem alteração.

## 1. O que foi aprovado

O **mecanismo** do Sistema B como modelo de personalização de cor das naves:

- **Sete papéis de material** recoloríveis: pintura principal, secundária, acento, estrutura, vidro, energia e marcação.
- Cada cor escolhida vale para o papel em **toda a nave** (os quatro grupos visuais recebem a mesma cor por papel).
- Exceto a pintura, cada papel pode usar o valor **"D"**, que reproduz a paleta D da v6.
- As cores passam pelo **pipeline D**: a pintura recebe a mistura gráfica rosa; depois vêm saturação e brilho das emissões, e o shader D (degraus, retícula, rim, contorno e arestas magenta) não muda.
- Controle de **proteção da hierarquia de massas**, que limita secundária, estrutura e vidro em relação à pintura.

As **cores escolhidas são livres**: escolher cores é o propósito do sistema, então nenhuma combinação específica de cores é "oficial" ou precisa de aprovação.

### 1.1 Baseline reproduzível dos controles do pipeline

O responsável aprovou a opção B sem enviar uma calibração própria. Seguindo o precedente do Protótipo 05, a baseline é a **configuração padrão do laboratório**:

| Controle | Valor | Observação |
| :--- | ---: | :--- |
| `pinkMix` (mistura gráfica D) | **0,55** | igual à v6 |
| `shadeMix` (secundária em modo "D") | **0,68** | igual à v6 |
| `hierarchy` | **0** | sem correção automática |
| `saturation` | **0** | |
| `glow` | **1** | |

Pintura padrão por nave = cor de identidade (Falcon `#2468f6`, Fox `#f8c32c`, Goose `#218e54`); demais papéis = `"D"`. Nesses valores o resultado é **idêntico à paleta D da v6** (verificado por teste).

**Registrado explicitamente:** o laboratório apontou que, com a mistura 0,55, as cores escolhidas ficam fortemente puxadas para rosa/lilás. A aprovação não trouxe outro valor, então **0,55 é a baseline**. Qualquer valor diferente desses controles exige nova aprovação registrada. A interface indica isso:
- **"SISTEMA B APROVADO · CORES LIVRES"** quando os controles estão no padrão;
- **"SISTEMA B · AJUSTE DE PIPELINE NÃO APROVADO"** quando algum controle sai do padrão.

## 2. O que não foi aprovado

- **Sistema A** (por grupo visual) e **Sistema C** (híbrido com sorteio por semente) **não foram escolhidos**. Continuam no laboratório apenas como comparação.
- **Cores aleatórias:** o sorteio reproduzível existe só no Sistema C, que não foi escolhido. A diretriz do responsável de permitir cores aleatórias (registrada na [aprovação do Protótipo 05](2026-10-10-prototype-05-craft-geometry-approval.md#3-cores-por-peça-e-cores-aleatórias-diretriz-registrada-para-protótipos-futuros)) **continua em aberto**: falta decidir como ofereceria sorteio dentro do Sistema B, com quais papéis, faixas e contraste.
- **Cores por peça:** o GDD [72, 78] prevê cores das quatro peças separadas. O Sistema B colore por papel de material, igual em toda a nave. Como conciliar isso com as peças definitivas (por exemplo, B dentro de cada peça) **depende da definição das peças**, que continua pendente.
- **Escopo da pintura** (por nave, por modelo A/B/C ou por peça), regras de interface/menu de personalização, persistência e telemetria [102].
- Integração no jogo (`src/game`). Física, VFX e modelos não foram alterados.
- O valor `paintApproval: "none"` do JSON do laboratório continua obrigatório. Ele impede que um arquivo de configuração declare aprovação; a aprovação vale por este registro.

## 3. Estado da implementação

- Laboratório 06 atualizado: nota de status, cartão de cada sistema e selo dinâmico de aprovação. Nenhum cálculo de cor mudou.
- Testes adicionados ou atualizados em `tests/craft_paint_lab.test.mjs`:
  - B é o único sistema marcado como aprovado;
  - selo distingue B com baseline, B com controles alterados e A/C;
  - baseline do B reproduz a v6;
  - este registro existe.
- `src/` não foi alterado.

## 4. Critério de aceite

- `npm test` e `npm run build` devem permanecer verdes.
- Uma integração futura deve reproduzir o pipeline do Sistema B com os valores da seção 1.1 e mostrar, nos padrões, resultado idêntico ao laboratório.
