# Rechecagem — reconstrução do VFX Atelier

10/10/2026. **Nenhum VFX aprovado.** Substitui as afirmações da entrega V2 anterior, rejeitada pelo usuário.

## Correções verificadas

| Problema | Correção |
|---|---|
| D/B parcialmente reproduzidos | Shader, arestas e resolver originais do 06; igualdade literal e baseline testadas |
| Efeitos pouco distintos | 50 construções; dez comparativos A–E capturados |
| Sliders sem resposta real | Teste mínimo/máximo de cada controle em quatro instantes |
| Escapes/impactos desconectados | Bocais reais e âncoras laterais da malha |
| Gravidade sem resposta efetiva | Tempo independente da gravidade; trajetórias comparadas |
| Acúmulo de recursos | Arena/cache limitados, descarte; 300 trocas instrumentadas |
| Comparação apertada | Layout compacto até 1100 px; mobile e desktop verificados |
| Importação não reproduzível | Schema 3 estrito, atômico, reset e round-trip |

## Testes específicos

Quatorze testes em `tests/craft_vfx_v2.test.mjs`: gravidade/altura efetivas; pouso antes do replay nos extremos de gravidade/altura/duração; 300 trocas e descarte gráfico; nove fingerprints/bocais; igualdade D/B; 50 saídas distintas/finitas; resposta de todos os controles; independência e resets; JSON atômico; seed/replay e equivalência temporal 30/60/120; fim de eventos/espelhamento/hover; limites de arena/cache nas 450 combinações nave/efeito; âncoras nos dois lados das nove malhas; translação vertical de todas as alternativas de dano/colisão junto com o contato.

O teste de recursos usa WebGL instrumentado, não benchmark real. O teste temporal não mede FPS em dispositivos diferentes.

Resultado final: `npm test` — **67 testes passaram, 0 falhas**. `npm run build` — TypeScript e Vite concluídos, incluindo o HTML V2 no pacote de produção.

## Navegador real

Chromium embutido, `WebGL 1.0 (OpenGL ES 2.0 Chromium)`:

- Dez categorias inspecionadas e capturadas em comparação simultânea.
- Galeria com nove geometrias; cache atingiu 180 buffers e permaneceu nesse patamar nas inspeções seguintes.
- Perda/restauração forçada: uma restauração, erro GL 0, cena e configuração recuperadas.
- Stress de 12 naves: 421 draws; ~2.05 MiB estimados com cache completo; amostra de 60 FPS nesta sessão. Não é garantia para outros dispositivos.
- Comprimento levado a 4 na interface; exportação confirmou 4; reset voltou a 1.8.
- Gravidade levada a 4 e salto a 3; exportação confirmou os valores. Ciclo estendido até concluir o pouso, sem reinício aéreo. Reset geral recuperou gravidade 16, salto 1.5, seleções, câmera e calibrações.
- JSON com seed fracionária rejeitado sem alterar a exportação; JSON válido reimportado com interface sincronizada.
- Vista traseira confirmou escapes nos dois bocais da Falcon A.
- Layout em 390×844 sem overflow horizontal e em 1280×800 com painéis. Override removido após o teste.
- Consulta de console posterior à restauração sem avisos ou erros.
- Rechecagem final corrigiu altura zero residual em algumas variantes de impacto e nivelou rastros de chão durante a inclinação da nave; quatro comparativos afetados foram recapturados.

Ver [capturas](../evidence/vfx-atelier/README.md). Imagens são instantes de inspeção, não aprovação artística ou validação universal de desempenho.

## Escopo preservado

Protótipo 04 original e arquivos protegidos de física/gameplay intactos. Alterações alheias não entram no commit. Sem push ou merge. Continuam pendentes a avaliação artística do usuário, desempenho em outros dispositivos e integração futura. A física principal não é declarada concluída.
