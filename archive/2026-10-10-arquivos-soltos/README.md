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
