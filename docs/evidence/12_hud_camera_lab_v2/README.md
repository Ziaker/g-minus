# Evidências de navegador — Protótipo 12 V2 (EM AVALIAÇÃO — NÃO APROVADO)

Geradas em 11/10/2026 por [`prototypes/hud-camera-lab/capture-evidence.mjs`](../../../prototypes/hud-camera-lab/capture-evidence.mjs), com Chromium 1194 headless, **WebGL 1.0 real** (ANGLE/SwiftShader, rasterização em CPU) e o arquivo `prototypes/12_hud_camera_lab_v2.html` aberto direto do disco. Viewport de 1600 × 900, exceto as capturas `16-*`. As medições estão em [`evidence.json`](evidence.json).

São evidências de funcionamento e de comparação no mesmo instante, **não** aprovação artística nem benchmark de GPU.

## Comparações no mesmo instante

| Arquivo | O que mostra |
| :--- | :--- |
| `01-mesmo-instante-hud-{A,B,C}-cam-A.jpg` | Mesmo tick e mesma câmera (Cinética) no tráfego da volta 1: as três propostas de HUD |
| `02-loop-hud-C-cam-{A,B,C}.jpg` | Mesmo instante dentro do loop vertical, mesmo HUD: as três câmeras com o "para cima" da pista |
| `03-matriz-3x3-defesa.jpg` | As nove combinações HUD × câmera no mesmo quadro (emboscada do rival) |
| `04-tres-huds-camera-B-impulso.jpg` | HUD×3 com a câmera Tática durante o impulso (Boost B + camadas A/D/E) |

## Situações extremas (cada uma com os três HUDs, mesma câmera e mesmo instante)

| Prefixo | Situação |
| :--- | :--- |
| `05-largada` | contagem 3-2-1 com o grid aleatório |
| `06-impulso` | impulso duplo na reta, alta velocidade |
| `07-energia-critica` | escudo abaixo de 15 % após queima deliberada |
| `08-impacto-barreira` | raspagem na barreira (Escudo D, Colisão B) |
| `09-salto` | voo no vão de 340 m |
| `10-borda-aberta` | trecho sem barreira, aviso P0 |
| `11-ataque-iminente` | telegrafia do Side Attack do rival contra o jogador |
| `12-disputa-rival` | caça ao rival no Esse final |
| `13-volta-final` | transição para a última volta |
| `14-chegada` | linha de chegada e resultado (cenário de teste) |

## Laboratório e proporções

- `15-laboratorio-painel.jpg`: painel de calibração aberto sobre o palco.
- `16-21x9-hud-{A,B,C}.jpg`: 2560 × 1080. `16-9x16-hud-{A,B,C}.jpg`: 1080 × 1920 (layout retrato). Cada HUD com a câmera de mesma letra.

## Medições (`evidence.json`)

- **Determinismo no navegador:** digest após 3 600 passos contínuos = digest após buscar o mesmo tick vindo de 120 s.
- **Recursos WebGL:** contagem de buffers igual antes e depois de 120 alternâncias de HUD, câmera e vista; perda de contexto simulada (`WEBGL_lose_context`) seguida de restauração com o mesmo número de recursos.
- **JSON:** importação com distância −100, FOV 999 e HUD C ausente rejeitada sem alterar a configuração.
- **Interface real:** cliques em todas as abas e seletores, sliders, atalhos de teclado e diálogo JSON (válido e inválido), sem erros de página.
- **Custo:** HUD a 1080p em 1,3–2,6 ms por quadro. Quadro completo em SwiftShader: só indicativo, sem valor para GPU real.
