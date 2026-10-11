# P08 revisão 4 — validação da aprovação

**Data:** 11/10/2026 (America/Sao_Paulo). **Decisão humana:** [revisão 4 aprovada](../../../decisions/2026-10-11-prototype-08-air-control-approval.md). **Integração em `src/game`:** pendente.

- `node prototypes/physics-08/build.mjs --check`: HTML gerado idêntico às fontes.
- `npm test -- --test-concurrency=1`: seis arquivos de teste concluídos, sem falha. O arquivo específico P08 contém 37 testes; inclui direção para cima/baixo, boost com ↓ e S, energia insuficiente, controles históricos de JSON v2–v4, contato em solo e determinismo.
- `npm run build`: TypeScript e Vite concluídos. `dist/prototypes/08_3d_physics_lab.html` gerado; SHA-256 do HTML de distribuição e do HTML de origem idêntico: `87c0e75d300cf558040842991bc5a17f2da2b7b9276ab8d154c88a4d6803f600`.
- Chromium 153 com WebGL SwiftShader, comandos de teclado reais: ↓ + A em voo atingiu −110,5 u/s (limite descendente 110,5 u/s); ↑ + A atingiu +120 u/s. Sem erros de página nem erro WebGL observado. [Dados JSON](air-down-browser.json), [captura de descida](01-boost-down.png), [captura de subida](02-boost-up.png).

Os ensaios confirmam comportamento nas condições verificadas, sem substituir a aprovação de dirigibilidade do responsável. A inclusão em `dist` não comprova deployment no GitHub Pages. O jogo principal não foi modificado.
