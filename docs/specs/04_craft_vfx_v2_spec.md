# Protótipo 04 V2 — VFX Atelier

**APROVAÇÃO REGISTRADA EM 10/10/2026** — [registro de decisão](../decisions/2026-10-10-prototype-04-v2-vfx-approval.md). Alternativas não escolhidas permanecem só para comparação. Reconstrução de 10/10/2026; substitui a implementação V2 anterior, não o Protótipo 04 histórico.

## Contrato acumulativo

Laboratório isolado do jogo. A aprovação do Perfil C (01) não aprova VFX, pistas ou arte, nem resolve as lacunas da física principal. PhysicsCalibration.ts, Vehicle.ts, Game.ts e Combat.ts não são alterados.

- **02 / D:** shaders, iluminação, cel shading, retícula, contorno e seleção de arestas extraídos literalmente do renderizador D utilizado pelo 06.
- **03:** decisões de pistas preservadas; chão do atelier é referência de inspeção, não pista aprovada.
- **05:** bloco canônico integral, nove geometrias e fingerprints preservados. Nenhum modelo inventado das outras sete naves.
- **06 / B:** resolver original; baseline pinkMix 0.55, shadeMix 0.68, hierarchy 0, saturation 0, glow 1. Cores experimentais editáveis por material e por nave, sem nova aprovação.
- **04 original:** preservado sem alteração. Nenhuma alternativa é aprovada automaticamente.

## Uso e fontes

Abra `prototypes/04_craft_vfx_v2.html` diretamente ou pelo servidor local. HTML autossuficiente, sem CDN ou dependência em runtime.

Fontes em `prototypes/vfx-atelier/`: template, estado/contrato, efeitos e runtime. Regeneração: `node prototypes/vfx-atelier/rebuild-vfx.mjs`. O gerador incorpora os blocos aprovados de 05/06 e valida marcadores e sintaxe antes de escrever. Testes detectam divergências dessas dependências.

## Cinquenta alternativas

| Categoria | A | B | C | D | E |
|---|---|---|---|---|---|
| Propulsão | Plasma facetado | Lâminas escalonadas | Ondas de pressão | Fitas helicoidais | Células hexagonais |
| Super Boost | Frente de choque | Corredor vetorial | Sobrecarga elétrica | Ecos da malha real | Portais quebrados |
| Spin Attack | Disco radial | Lâminas orbitais | Espiral 3D | Choques concêntricos | Campo poligonal |
| Side Attack | Corte de impacto | Arco de pressão | Faixa de deslocamento | Impulso radial | Eco e descarga |
| Escudo/dano | Flash de tinta | Placas hexagonais | Fratura energética | Onda superficial | Arco defensivo |
| Drift/hover | Faixas de contato | Atrito magnético | Linhas de fluxo | Estabilização | Trilha segmentada |
| Colisão | Faíscas balísticas | Estilhaços vetoriais | Pulso concentrado | Riscos de tinta | Onda angular |
| Dash/recarga | Ascensão energética | Anéis aceleradores | Varredura de faixas | Feixes aos motores | Onda direcional |
| Voo/pouso | Desacoplamento | Rastro aerodinâmico | Pulso de decolagem | Compressão de pouso | Impacto de aterrissagem |
| Velocidade | Action lines | Portais em profundidade | Silhueta residual | Fragmentos periféricos | Faixas de parallax |

Construções distintas, não cinco recolorações. Geometria sólida/translúcida com profundidade; ecos usam a malha canônica. Sem bloom fotográfico ou filtro global substituindo a pintura.

## Calibração e inspeção

Cada alternativa mantém seus valores: dez controles em propulsão e seis nas demais categorias. `paramDefsVFX` documenta limites e unidades; cada controle tem teste de resposta observável ao longo do evento.

Propulsão: comprimento, largura, pulsação, cadência, quantidade/facetas, dispersão, persistência, resposta à aceleração, opacidade e duração. Demais categorias: extensão/raio/comprimento, espessura, quantidade, cadência/propagação, opacidade e duração.

Simulação: velocidade 0–1600 km/h, aceleração 0–1, slip −1 a 1, impacto 0.1–1, **gravidade 4–30 u/s² e altura de salto 0.3–3 u**. Interface mostra controles pertinentes. Velocidade move a pista de teste; categorias sem acoplamento direto não mudam o efeito em estúdio. Esses controles não calibram a física do jogo.

Replay, pausa, passo de 1/60 s, repetição e inspeção de instante representativo. “Inspecionar pico” é um marcador, não busca matemática do máximo; voo usa instante posterior para pouso. Hover de repouso sem oscilação vertical artificial.

No voo, o ciclo se estende automaticamente quando a gravidade/altura exigem mais tempo para aterrissar; a duração escolhida funciona como mínimo. O efeito não reinicia no ar. Rastros de chão permanecem nivelados mesmo com roll/pitch da nave.

Reset por alternativa, categoria e configuração inteira. Câmeras orbital, perseguição, traseira, lateral e superior; arrasto, zoom e restauração. Comparação A–E e galeria das nove geometrias. Até 1100 px os painéis viram seções expansíveis sem cobrir o canvas.

## Sincronização e recursos

Bocais obtidos das peças energy dos motores; impactos usam vértices da extremidade real com altura/profundidade, não apenas largura. Nave e efeitos locais recebem a mesma transformação.

Arena reutilizável de 24 mil vértices por passagem de efeito; níveis médio/baixo de 12/6 mil. Cache limitado às nove malhas; nenhum buffer WebGL novo por quadro. Descarte e restauração explícitos; shaders liberados após linkagem.

Telemetria: FPS amostrado, draws, vértices da passagem dinâmica (inclui chão), buffers, memória estimada, descartes por orçamento e erro GL. Memória não é medição da VRAM do driver. Stress: 12 naves num viewport, não custo do jogo completo.

## JSON e validação

Schema `gminus.craft-vfx-atelier`, versão **4** (desde a aprovação): seleções por nave/categoria, 50 calibrações (49 controles no Spin E, cujo raio é regra fixa), composição do boost (`boostComposition`: compose + toggles A/D/E), pinturas B, seed, simulação e câmera. O campo `status` só aceita o texto fixo e não concede aprovação. A versão 3 é rejeitada; o JSON v3 enviado na aprovação está arquivado em `docs/decisions/`. Importação estrita e atômica rejeita campos extras, números inválidos, contagens fracionárias, alteração da baseline e alegações de aprovação. Sem conversão silenciosa da versão anterior. Tempo, pausa e stress são execução, não preset; use replay para comparação determinística.

Ver [auditoria](../audits/2026-10-10-prototype-04-v2-audit.md) e [capturas](../evidence/vfx-atelier/README.md). Eventos são isolados e simulados: não implementam suspensão definitiva, colisão dinâmica, combate, som, IA ou integração com corrida. Aprovação artística, combinação e integração futura dependem de decisão expressa.

## Aprovação de 10/10/2026 — o que mudou no laboratório

Detalhes e justificativas: [registro de decisão](../decisions/2026-10-10-prototype-04-v2-vfx-approval.md).

**Selos e calibração**
- Cada alternativa mostra seu status: APROVADO, OBRIGATÓRIO NO JOGO, TOGGLE APROVADO, SELECIONÁVEL APROVADO, NÃO APROVADO ou NÃO ESCOLHIDO.
- O padrão das alternativas aprovadas é a calibração enviada pelo responsável. O título da calibração indica se os valores atuais estão dentro ou fora dela.

**Efeitos**
- **Super Boost:** composição in-game com B sempre ativo e toggles A/D/E sobrepostos (modo Inspecionar). O modo Comparar continua mostrando A–E isolados.
- **Spin E — implementação atual:** raio externo = raio de varredura do giro + 0,35 u, centrado no eixo de rotação. O controle de raio foi removido; o raio de cada nave aparece no painel.
- **Spin E — dimensão desejada (provisória, não implementada):** o responsável definiu **130 % do raio de varredura (+30 %)**. A regra deve substituir os +0,35 u numa revisão futura do laboratório ou na integração, com teste correspondente. Até lá, o laboratório, o JSON de baseline e os testes continuam em +0,35 u. Ver [registro de decisão, seção 2.1](../decisions/2026-10-10-prototype-04-v2-vfx-approval.md#21-spin-e--dimensão-do-campo).
- **Side E:** sem descarga ciano na asa; afterimage mantido; speedlines brancas/rosa para o lado oposto ao ataque.
- **Drift:** afterimage breve e constante (três cópias em contorno) acima de 1300 km/h, com rampa de 50 km/h.

**Testes e evidências**
- Testes de aprovação em `tests/craft_vfx_v2.test.mjs`.
- Capturas 17–21 em `docs/evidence/vfx-atelier/`.
