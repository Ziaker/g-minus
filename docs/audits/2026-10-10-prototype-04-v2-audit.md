# Auditoria — Reconstrução do Protótipo 04 V2

**Data:** 10/10/2026  
**Estado:** laboratório implementado; alternativas **EM AVALIAÇÃO**.

## Matriz de rastreabilidade

| Área do laboratório histórico | Problema observado | Correção V2 | Validação |
|---|---|---|---|
| Geometria | modelos antigos não correspondiam ao baseline aprovado | bloco canônico do Protótipo 05 incorporado literalmente; galeria 3×3 | teste compara os blocos byte a byte e gera nove fingerprints |
| Direção visual | efeito e nave podiam divergir da decisão D | shader toon, contorno vetorial e paleta de energia por nave | dependência D fixada e protegida no JSON |
| Pintura | pipeline anterior não respeitava a aprovação 06/B | sete papéis e defaults B preservados | teste de baseline e validação estrita |
| Catálogo | cobertura incompleta e presets pouco diferenciados | 10 categorias × 5 geradores de geometria distintos | teste percorre as 50 combinações e exige saída finita/não vazia |
| Sincronização espacial | emissões nem sempre partiam da nave/evento correto | efeitos gerados em espaço local e transformados pela mesma matriz da nave | comparação e galeria usam a mesma transformação por viewport |
| Sliders | controles podiam não produzir alteração ou vazar entre presets | cinco parâmetros efetivos por alternativa, armazenados separadamente | teste altera A/B e restaura apenas A |
| Gatilhos/animação | estados contínuos e eventos não eram claramente separados | `eventTime`, serial de evento, duração, pausa, frame e replay | API headless e inspeção visual |
| Câmera | avaliação limitada | perseguição, traseira, lateral e orbital; órbita/zoom por ponteiro | inspeção no navegador |
| Reset | escopo ambíguo | reset de alternativa, categoria e global com escopos explícitos | teste do reset independente |
| JSON | ausência de contrato completo e atômico | schema v2, chaves exatas, faixas e dependências bloqueadas | entradas inválidas rejeitadas sem mutação |
| Aleatoriedade | resultados não reproduzíveis | PRNG local com seed e serial determinísticos | duas instâncias produzem geometria idêntica |
| WebGL | risco de buffers temporários e contexto perdido | buffers estáticos em cache, pool dinâmico de três buffers, descarte e restauração | testes estruturais + telemetria em runtime |
| Stress | ausência de cenário comparável | alternância de 1 para 18 naves/efeitos | métricas de FPS, draw calls, buffers e partículas |
| Física | risco de confundir simulação visual com gameplay | estados físicos apenas simulados e rotulados | nenhum arquivo de `src/game` faz parte da alteração |

## Evidências e resultados

- `npm test`: **61/61 testes aprovados**, incluindo oito regressões próprias do V2.
- `npm run build`: aprovado; o Vite gerou `dist/prototypes/04_craft_vfx_v2.html` (86,92 kB; 29,05 kB gzip na execução).
- Navegador real: renderização WebGL confirmada visualmente nos modos comparação e alternativa ampliada.
- Stress: 18 naves/efeitos, amostra em **60 FPS**, 1.170 draw calls, 28.800 triângulos, 432 vértices VFX e 35 buffers totais (três buffers do pool dinâmico).
- Console de uma sessão limpa do navegador: nenhum erro ou aviso.
- Evidência visual: a aba local do laboratório foi mantida aberta como artefato inspecionável ao concluir a tarefa; a captura de validação mostra o modo Boost/D — Afterimages em stress, com telemetria visível.

O Protótipo 04 histórico permanece disponível para comparação.

## Limites conhecidos

- O laboratório usa estados sintéticos; não mede forças do runtime principal.
- Comparação visual não equivale a aprovação artística.
- Métricas de memória mostram recursos WebGL controlados pelo laboratório, não memória total do navegador/GPU.
- A escolha de uma alternativa e sua integração ao jogo exigem decisão expressa posterior.
