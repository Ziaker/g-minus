# Consolidação P08 revisão 4 + P12 V2 — validação

**Data:** 11/10/2026. **Branch:** `claude/dreamy-volta-8pxplv`. **Natureza:** consolidação de protótipos aprovados; não integra nada em `src/game` e não autoriza merge na `main`, que depende de decisão do responsável.

## Origem

| Linha | Commit | Conteúdo |
| :--- | :--- | :--- |
| Base | `2d9d556` (`claude/clever-franklin-p189l8`) | P12 V2 aprovado, P08 revisão 3, escala 1 u = 1 m |
| Merge | `f3b61f1` (`prototype/08-3d-physics`) | P08 revisão 4 aprovada (`36b5f24`) e ajuste da especificação |
| Não incluída | `eb3d215` (`codex/p08-vite-entry`) | a mesma entrada `prototype08` do Vite já chega por `36b5f24` |

Conflitos resolvidos no merge: `vite.config.ts` (entradas `prototype08` e `prototype12V2`) e `README.md` (um único item do P08, com o texto da revisão 4, e parágrafo do roadmap com P08 revisão 4 e P12 V2). Ajustes documentais posteriores: P08 na lista de validação do README e, no P12 V2, complementos datados sobre a revisão 4 e a pendência da câmera no voo.

## Resultados

- `node prototypes/physics-08/build.mjs --check` e `node prototypes/hud-camera-lab/build.mjs --check`: HTMLs idênticos às fontes ([saída](build-check.txt)).
- `npm test`: **142/142** ([resumo](npm-test-summary.txt)). O total corresponde a 137 da base, menos 32 testes do P08 na revisão 3, mais 37 na revisão 4.
- `npm run build`: concluído ([saída](npm-build.txt)). A `dist` contém `prototypes/08_3d_physics_lab.html` e `prototypes/12_hud_camera_lab_v2.html`, ambos byte a byte iguais às fontes:
  - P08 SHA-256 `87c0e75d300cf558040842991bc5a17f2da2b7b9276ab8d154c88a4d6803f600`, o mesmo valor registrado na [validação da revisão 4](../physics-08/revision-4/approval-validation.md);
  - P12 V2 SHA-256 `a5d83af68489d9c793fbc63fa19f72e8572d61143f6fd557a1c36477f8338af8`.
- Integridade por `git diff`:
  - arquivos do P08 idênticos a `f3b61f1`;
  - arquivos, testes, baselines e evidências do P12 V2 idênticos a `2d9d556`;
  - protótipos 01–07 e `src/` sem alteração em relação à `main` (`80f7093`).

## Navegador (Chromium 141, WebGL SwiftShader, `dist` servida por HTTP)

[Dados](consolidacao-browser.json). Teclas reais, condição inicial controlada em voo (y = 300, vy = −85 u/s).

| Ensaio | Resultado |
| :--- | :--- |
| Configuração padrão do P08 | JSON v5, `boostControl` 1,30, igual ao [baseline v5](../../decisions/2026-10-11-prototype-08-revision4-approved-baseline.json) |
| ↓ + boost, 100 passos | vy −110,5 u/s; limite de descida 110,5; nariz para baixo ([captura](01-p08r4-mergulho-boost.png)) |
| S + boost, 100 passos | igual a ↓ + boost |
| ↑ + boost, 240 passos | vy +120 u/s; y 361,27 ([captura](03-p08r4-subida-boost.png)) |
| ↓ sem boost | limite de descida 85 u/s, sem ganho de 30% |
| Baseline da revisão 3 importado pela interface | aceito; `downToDive: false` e fator 1,00; ↓ + boost sobe a +120 u/s, preservando o mapeamento antigo ([dados](import-v3.json)) |
| Reta, loop, tubo | contato contínuo a 2,10 u, sem desprendimento; loop invertido |
| Rampa | um desprendimento e um pouso, com contato restabelecido |
| Parede 90° acelerando sem esterçar | desprendimento na entrada do loop, como previsto na [revisão 2](../../specs/08_3d_physics_lab_revision2.md) |
| P12 V2 na `dist` | carrega; configuração padrão igual ao [baseline aprovado](../../decisions/2026-10-11-prototype-12-v2-approved-baseline.json) ([captura](05-p12v2-dist.png)) |
| Jogo (`index.html`) | carrega |
| Erros de página ou WebGL | nenhum |

O campo `importV3` de `consolidacao-browser.json` registra uma tentativa com JSON v3 montado incorretamente pelo próprio script de ensaio, que não removeu a chave `downToDive`, e por isso foi rejeitado. O ensaio válido usa o baseline real da revisão 3 e está em `import-v3.json`.

As cadências e os tempos medidos sem GPU não são benchmark. Os ensaios não substituem a avaliação de pilotagem do responsável.

## Rastreabilidade dos commits locais do P08

Os registros de aprovação do P08 citam três commits locais que não estão publicados neste repositório: `399e8e5` (revisão 3 aprovada), `cbd9be9` (revisão 4 apresentada para aprovação) e `c4e2e38`. Os SHAs históricos foram mantidos nesses registros, sem substituição.

### Comparações feitas pelo Codex

O Codex localizou esses commits no repositório local dele e comparou as árvores Git com os commits publicados. As comparações **não foram reproduzidas nesta consolidação**, porque os commits locais e o relatório do Codex não estão publicados.

| Commit local | Comparado com | Resultado relatado pelo Codex | Natureza |
| :--- | :--- | :--- | :--- |
| `399e8e5` | `64e3279` | física e pilotagem da revisão 3 preservadas; diferem status e compatibilidade de JSON | equivalência funcional, **não** identidade byte a byte |
| `cbd9be9` | `c4e2e38` | comportamento aprovado da revisão 4 preservado; diferem status, interface e compatibilidade de JSON | equivalência funcional, **não** identidade byte a byte |
| `c4e2e38` | `f3b61f1` | nenhuma diferença funcional; só correção documental posterior | equivalência funcional, **não** identidade byte a byte |
| `871cee3` | `f3b61f1` | árvores equivalentes | identidade de árvore, segundo o Codex |

### O que o repositório publicado mostra

- A mensagem do `36b5f24` declara reproduzir a árvore exata de `c4e2e38`, e a do `f3b61f1` declara o mesmo em relação a `871cee3`. São declarações dos commits, não verificações desta consolidação.
- Verificado nesta consolidação:
  - os arquivos do P08 na branch são idênticos aos de `f3b61f1`;
  - o HTML do P08 tem o SHA-256 registrado na validação da revisão 4;
  - o comportamento da revisão 4 foi confirmado no navegador (seção anterior).

### Conclusão

Pelo relatório do Codex, o código publicado em `f3b61f1`, e consolidado nesta branch, preserva **funcionalmente** a revisão 4 aprovada em `cbd9be9`. O `64e3279` preserva funcionalmente a revisão 3 aprovada em `399e8e5`. As diferenças relatadas são de status, interface e compatibilidade de JSON, não de física nem de pilotagem. Não há identidade byte a byte entre os commits aprovados e os publicados; a única identidade relatada é a de árvore entre `871cee3` e `f3b61f1`. A rastreabilidade funcional fica esclarecida para a decisão de integração na `main`, com base na evidência do Codex.

## Pendências para a decisão de integração na `main`

1. **Rastreabilidade dos commits locais do P08:** esclarecida funcionalmente pelo Codex (ver seção acima), sem identidade byte a byte. As comparações não foram reproduzidas aqui; publicar os commits locais ou o relatório do Codex permitiria verificá-las de forma independente.
2. **Câmera do P12 no voo com os controles aéreos da revisão 4:** é requisito pendente de integração e **não foi validado**. Está registrado na [aprovação do P12 V2](../../decisions/2026-10-11-prototype-12-v2-hud-camera-approval.md), item 7 da seção 6.
3. **Parede 90° → loop:** o desprendimento sem esterço é previsto pela especificação, mas falta confirmação pilotada.
4. **Pendências mantidas:**
   - publicação no GitHub Pages não verificada;
   - integração do P08 e do P12 em `src/game` pendente e sujeita a pedido explícito;
   - P09 não iniciado.
