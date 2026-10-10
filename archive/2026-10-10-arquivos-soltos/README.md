# Arquivos soltos arquivados em 10/10/2026

Arquivos que estavam fora do git na cópia local. Foram movidos para cá sem
alteração de conteúdo, para preservar o histórico. **Nenhum deles é fonte
canônica** e nenhum entra no build (o Vite só publica as entradas de
`vite.config.ts`).

| Arquivo | Origem | O que é |
| --- | --- | --- |
| `01_steering_profiles_raiz_anterior.html` | `01_steering_profiles.html` (raiz) | Versão anterior do laboratório do Protótipo 01: pistas mais curtas (`straightTrackLength` 2400 contra 12000), gravidade aérea 30 contra 90 e outras descrições de pista. Perfil C com 89 / 300 / 400. |
| `01_steering_profiles_v5_1.html` | `public/prototypes/01_steering_profiles (2).html` | Laboratório "V5.1", bem mais antigo, sem parâmetros por perfil. |
| `param_definitions.mjs` | raiz | Catálogo de categorias de parâmetros do laboratório 01, com preset C usando `steerRate` 89. **Não** é o export aprovado dos 207 parâmetros. |
| `duplicatas/GMINUS_02_REBUILD_v6_WEBGL.html` | `prototypes/` | Igual a `prototypes/02_ship_visuals_v6_webgl.html` (diferem só os finais de linha). |
| `duplicatas/GMINUS_02_REBUILD_v6_WEBGL_public.html` | `public/prototypes/` | Igual ao anterior. |
| `duplicatas/03_neo_metropolis_visual.html` | `public/prototypes/` | Igual a `prototypes/03_neo_metropolis_visual.html`. |
| `duplicatas/04_craft_vfx.html` | `public/prototypes/` | Igual a `prototypes/04_craft_vfx.html`. |

A calibração aprovada do Perfil C usada no jogo está em
`src/game/PhysicsCalibration.ts` (56 / 500 / 600). O export integral aprovado
ainda precisa ser recuperado e versionado.

## Alteração local da spec do Protótipo 02 (`02_ship_visuals_spec_quatro_pecas.patch`)

- **Origem:** alteração nunca registrada em commit de `docs/specs/02_ship_visuals_spec.md`, gravada na cópia local em 10/10/2026 às 00:33. A base é a versão do commit `2d57eb8`.
- **Arquivada em:** 10/10/2026, com autorização do responsável pelo projeto.
- **Conteúdo (33 inserções, 10 remoções):**
  1. Nova seção "Estrutura de 4 peças por nave" (nariz, cabine, asas, motores), cada uma com material próprio e anéis de acento nas juntas.
  2. Renomeia a seção das silhuetas para 3.1 e acrescenta a cada nave linhas de painel, entradas de ar e anéis de bocal duplos.
  3. Nova seção 3.2, "Camada de polimento" (linhas de painel, entradas de ar, anéis de acento, antenas, turbinas com glow, materiais por peça).
  4. Novo controle "Destacar peça (1-4)" e a seleção de nave renumerada da seção 2 para a 3.
- **Motivo do arquivamento:** a alteração descreve recursos que não existem em `prototypes/02_ship_visuals.html` (seletor de peças, antenas, entradas de ar e linhas de painel), num laboratório histórico já substituído pela direção D. Por isso a spec voltou à versão registrada no Git.
- **Status da ideia das quatro peças:** **proposta histórica, não aprovada.** Este arquivamento não define funções, geometria, materiais nem regras para peças. As geometrias aprovadas do Protótipo 05 e o Sistema B do Protótipo 06 continuam valendo como estão.
- **Verificação:** aplicar o patch sobre a versão `2d57eb8` reproduz byte a byte o arquivo alterado (SHA-256 `1c7d78f1b570abd0f69f4e33f9b128add7ff9f30ae346ced027ac9104ad372c0`).
- **Para reproduzir:** `git show 2d57eb8:docs/specs/02_ship_visuals_spec.md > docs/specs/02_ship_visuals_spec.md && git apply archive/2026-10-10-arquivos-soltos/02_ship_visuals_spec_quatro_pecas.patch`
