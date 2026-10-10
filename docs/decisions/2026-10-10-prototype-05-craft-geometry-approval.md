# Aprovação do Protótipo 05 — Geometria das três primeiras naves

**Data:** 10/10/2026

**Decisão:** aprovadas as **nove** geometrias do laboratório (Blue Falcon, Golden Fox e Wild Goose × A, B e C)

**Autoridade:** responsável pelo projeto, declaração direta na conversa: *"aprovo todos os 9 designs"*.

**Artefato:** [`prototypes/05_craft_geometry_lab.html`](../../prototypes/05_craft_geometry_lab.html) · [especificação](../specs/05_craft_geometry_lab_spec.md) · [capturas](../captures/05_craft_geometry_lab/)

**Direção estética (já aprovada antes, não alterada):** [D — Toon Vector Flux](../specs/02_toon_vector_flux_approval.md)

## 1. O que foi aprovado

As nove arquiteturas 3D, exatamente como apresentadas no laboratório com os **valores padrão** de cada alternativa:

| Nave | A | B | C |
| :--- | :--- | :--- | :--- |
| Blue Falcon (`falcon`) | Lança Delta | Bi-Viga | Ponta de Flecha |
| Golden Fox (`fox`) | Agulha | Ampulheta | Kitsune |
| Wild Goose (`goose`) | Aríete | Tanque Flutuante | Ombreira |

As três alternativas de cada nave ficam aprovadas **em conjunto**: não houve escolha de uma única por nave. Como elas se relacionam com as naves jogáveis (variantes, peças, skins ou outra forma) ainda não foi decidido.

### 1.1 Baseline reproduzível

O responsável aprovou os designs vistos no laboratório sem enviar uma calibração própria. Por isso a **baseline aprovada é a configuração padrão** do laboratório (os 12 parâmetros de cada alternativa, registrados na [especificação, seção 7](../specs/05_craft_geometry_lab_spec.md#7-parâmetros-por-alternativa)). Ela está salva em [`2026-10-10-prototype-05-approved-baseline.json`](2026-10-10-prototype-05-approved-baseline.json), que pode ser aplicado diretamente no laboratório.

Impressões digitais das malhas aprovadas (FNV-1a sobre posições × 1000; verificadas por teste):

| Nave | A | B | C |
| :--- | :--- | :--- | :--- |
| Blue Falcon | `902a3acf` | `3b36297f` | `8dea1899` |
| Golden Fox | `0f6edd34` | `20f67adb` | `c84e2916` |
| Wild Goose | `2dbc008a` | `05c4fe5d` | `92d0c8f3` |

Os intervalos dos sliders continuam sendo **ferramentas de exploração**. Um valor diferente da baseline só passa a valer depois de nova aprovação registrada. A interface do laboratório indica isso com o selo **"GEOMETRIA APROVADA · BASELINE"** e, quando algum parâmetro sai do padrão, **"VARIAÇÃO EXPLORATÓRIA · FORA DA BASELINE APROVADA"**.

## 2. Regra obrigatória: usar os modelos aprovados nos próximos protótipos de naves

A partir desta decisão, **todo protótipo que exibir, simular ou depender visualmente das naves Blue Falcon, Golden Fox ou Wild Goose deve usar estes nove modelos aprovados**. Isso inclui, por exemplo, VFX, peças/customização, cores, câmera, pistas com naves, combate e HUD com naves. Placeholders genéricos (cone, caixa, cilindro) e geometrias antigas dos protótipos 02/04 não podem substituí-los.

Requisitos:

1. **Fonte canônica:** o bloco de código entre `/* @gminus-approved-craft-geometry:begin v1 */` e `/* @gminus-approved-craft-geometry:end v1 */` em `prototypes/05_craft_geometry_lab.html`. Ele contém o kernel geométrico, os nove construtores, os parâmetros padrão, `buildMesh` e `meshReport`, e é autossuficiente: não depende de DOM, WebGL ou bibliotecas.
2. **Cópia literal:** os novos protótipos (arquivos `prototypes/NN_*.html` com `NN ≥ 06`) devem embutir o bloco **sem modificações**. Isso mantém o protótipo autônomo e abrível direto do disco. O teste `tests/craft_geometry_lab.test.mjs` falha quando:
   - um protótipo `NN ≥ 06` envolve naves e não traz o bloco; ou
   - qualquer protótipo traz o bloco alterado.
3. **Configuração:** os protótipos partem da baseline aprovada. Se oferecerem ajustes geométricos, devem mostrar quando o valor sai da baseline e não podem tratar esse ajuste como aprovado.
4. **Estética:** os modelos devem continuar em D — Toon Vector Flux, conforme o registro de aprovação estética.
5. **Seleção A/B/C:** quando o protótipo envolver uma nave, deve permitir escolher entre as três alternativas aprovadas, ou declarar e justificar qual usa.
6. **Evolução:** se a geometria aprovada precisar mudar, a mudança deve passar pelo laboratório 05 (ou um sucessor), ganhar nova aprovação registrada e uma nova versão do bloco (`v2`), com as impressões digitais atualizadas. Cópias divergentes não são aceitas.
7. **Outras sete naves:** não estão cobertas por esta decisão e continuam sem geometria aprovada.

## 3. Cores por peça e cores aleatórias (diretriz registrada para protótipos futuros)

O responsável pediu para **considerar a possibilidade de dar cores diferentes a cada peça** e também **deixar as cores aleatórias, se o jogador quiser**.

- A cor por peça já é requisito do GDD [72, 78] ("jogador pode alterar as quatro peças e suas cores separadamente"). Esta decisão a confirma para os modelos aprovados.
- **Novo:** deve existir uma opção de **cores aleatórias**. A regra de sorteio (peça a peça ou conjunto, paletas permitidas, contraste mínimo, semente/telemetria [102]) não foi definida e deve ser prototipada.
- **Prontidão técnica:** cada modelo já é organizado em quatro grupos visuais (Proa, Cabine, Asas, Motores) e por papel de material (pintura, secundária, acento, estrutura, vidro, energia, marcação). Isso permite aplicar cor por grupo sem refazer a geometria.
- **Pendente (exige protótipo próprio com três alternativas, sliders, JSON e aprovação, conforme GDD [101]):**
  - se a cor por peça usará os quatro grupos visuais atuais ou as quatro peças definitivas (ainda não definidas);
  - quais papéis de material o jogador pode recolorir;
  - como as cores escolhidas passam pela paleta D (a v6 mistura 55 % de rosa na pintura);
  - limites de legibilidade [83];
  - comportamento do botão aleatório.
- Nada disso foi implementado nesta decisão. O laboratório 05 não tem editor de cores.

## 4. O que não foi aprovado

- As **quatro peças intercambiáveis** definitivas (nomes, funções, encaixes, atributos): os quatro grupos visuais continuam provisórios.
- Atributos, massa, colisão, física ou balanceamento ligados às formas.
- A paleta final por nave e por peça (a fórmula de pigmento da v6 continua sendo a da direção D).
- Os modos de diagnóstico de renderização do laboratório (luz que acompanha a câmera, contorno contínuo/estrutural, "cor pura").
- A **integração no jogo** (`src/game/Vehicle.ts`): os modelos atuais do jogo continuam inalterados. A integração é uma etapa futura, que deve reproduzir a baseline e verificar as impressões digitais.

## 5. Estado da implementação

- Laboratório atualizado para refletir a aprovação (selo de baseline, textos, marcadores do bloco canônico). Nenhuma geometria mudou: as impressões acima são as mesmas da avaliação.
- Testes adicionados:
  - trava das nove impressões aprovadas;
  - selo de baseline × exploração;
  - importação do JSON da baseline;
  - obrigatoriedade e integridade do bloco canônico nos protótipos futuros.
- `src/` não foi alterado.

## 6. Critério de aceite

- `npm test` e `npm run build` devem permanecer verdes.
- Qualquer protótipo novo de naves só é aceito se embutir o bloco canônico `v1` intacto e partir da baseline aprovada.
