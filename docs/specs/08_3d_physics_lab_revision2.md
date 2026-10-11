# P08 — Revisão 2: Perfil C + contato A

**P08 APROVADO — INTEGRAÇÃO PENDENTE**

Aprovação expressa em 11/10/2026: [registro e escopo](../decisions/2026-10-11-prototype-08-physics-approval.md). Revisões e evidências anteriores preservam o estado histórico de avaliação.

## Escopo confirmado pelo responsável

Em 11/10/2026, o responsável escolheu a opção A e confirmou: **A para contato 3D + pilotagem do Perfil C preservada, sem integração ao jogo principal**. Isso autoriza a revisão do laboratório, mas não registra aprovação final da física adaptada nem de suas calibrações 3D.

Esta revisão substitui a implementação experimental de direção, drift, boost e voo do primeiro P08. A/B/C deixam de ser sistemas concorrentes de pilotagem. O arquivo de entrada permanece `prototypes/08_3d_physics_lab.html`; o cabeçalho identifica **P01 / Perfil C · extensão 3D por contato A · revisão 2**. Os commits anteriores preservam a versão inicial. P01, jogo principal e aprovações existentes não foram editados.

## O que é efetivamente reutilizado

`extract-profile.mjs` lê o HTML original do P01 e extrai blocos literais da rotina de pilotagem para `profile-c.generated.js`. O gerador registra SHA-256 do P01 e valida marcadores de extração. `build.mjs` executa essa extração antes de gerar o HTML; `--check` exige identidade entre fontes e arquivos gerados.

São reutilizados:

- filtragem da direção, progressividade, inércia, dependência da velocidade, instabilidade e recenter;
- contraesterço, banking/roll, strafe, freios laterais, drift e seus bônus/arrasto;
- aceleração, desaceleração, frenagem, limite e velocidade de boost;
- ativação do boost por evento, impulso inicial, custo, duração e consumo;
- controle de pitch aéreo, estabilidade, sustentação, mergulho, arrasto e limite de queda;
- condições de pouso alinhado/desalinhado, bônus, perda de energia e desaceleração;
- valores de duração dos pulsos de teclado curtos de direção, aceleração e strafe.

Os blocos físicos permanecem textualmente iguais aos do P01; wrappers fornecem estado e entradas e silenciam chamadas de áudio/partículas do P01. O transporte para 3D usa a frente e a normal reais da superfície. O resultado da simulação local é convertido para velocidade e orientação 3D. Essa adaptação é código novo e continua em avaliação.

## Calibração e ambiguidades

A calibração de trabalho usa os valores **inequívocos do export original**. Para cada um dos 41 campos de precisão ambígua no export completo, mantém o valor já existente no P01; o gerador verifica que esse número pertence aos candidatos compatíveis com o texto exportado. Não escolhe um novo arredondamento, não elimina candidatos e não registra aprovação exata. A auditoria anterior contabiliza 18 ambiguidades no subconjunto de 93 parâmetros mapeados, não no total de 207.

A UI lista cada campo pendente, seu texto exportado e o valor conservado. Referências inequívocas incluem esterço 89, limite 500, boost 600, altura 2,1 e roll 34. A divergência histórica de esterço 56 no documento/jogo permanece documentada, sem reescrever a aprovação. Esses valores não são obtidos copiando a calibração parcial do jogo principal.

O JSON preserva os 207 campos do perfil, inclusive os que esta extensão não consome. Isso não afirma integração de IA, combate, som, câmeras do P01 ou todos os controles. `wakeAmplitude=0,12` e `wakeFrequency=4,8` permanecem no perfil, mas não criam oscilação: o contato do próprio P01 usa altura constante.

## Contato A e extensão 3D

A geometria, a consulta espacial por triângulos e o renderer do primeiro P08 são reaproveitados. Nenhuma posição é obtida por coordenada de spline. Os pontos da pista só constroem a malha e determinam resets explícitos.

O contato A transporta velocidade e frente entre normais da superfície, remove velocidade normal de contato e limita a correção de altura por passo. Seus três controles experimentais são alcance de consulta, limite de reação e correção normal máxima. O limite inicial de reação é 2500 u/s²; não é valor aprovado do Perfil C. Não há sliders novos substituindo a direção ou o grip do P01.

A altura vem de `profile.hoverHeight`. Desprendimento ocorre ao perder superfície ou exceder o limite de reação/captura. No ar, a aceleração vertical vem da rotina original de voo. Em superfícies arbitrárias, o plano de pilotagem mantém a base local ao sair do contato; a gravidade permanece global. Essa convenção 3D não existia no P01 e precisa de avaliação do jogador.

Pouso exige aproximação da altura real da face. A rotina original verifica alinhamento relativo à superfície, aplica bônus ou penalidade após o movimento do passo, e preserva a ordem de consumo de energia. A correção de posição continua limitada pelo contato A, portanto a geometria arbitrária não é declarada equivalente ao antigo `player.y=hoverTarget`.

A pista continua sendo instrumento de calibração: reta, curvas, banking, parede, loop, tubo, rampa, voo e recepção. Curvas e mudanças de orientação exigem correção de trajetória. O teste automático não é piloto de circuito: uma passagem pela parede em alta velocidade pode sair da pista na entrada do loop sem direção do jogador. Não há garantia de uma volta sem inputs, nem de estabilidade em todas as combinações extremas de sliders.

## Interface e controles

Somente **Perfil C + contato A** fica selecionável. Nove geometrias, pintura B, quatro câmeras, pausa/passo 1/120 s, área de ensaio, velocidade inicial, seed, telemetria e JSON permanecem.

- X/W/↑: aceleração; W/↑ também comanda pitch de mergulho no ar, como no P01.
- S/↓: freio e pitch para sustentação no ar.
- ←/→: direção; Z/C: strafe/banking.
- Q/E: freios laterais; Q+E ou espaço com direção: drift nas condições originais.
- A/B: boost por pressionamento, sem repetir por manter a tecla.
- P: pausa; R: reset; V: câmera; J: impulso de diagnóstico, sem proposta de salto manual no jogo.

Combate, ataques duplos Z/C, spin, rivais, pads e assistência automática de trajetória estão fora desta extensão. Regeneração é desligada por padrão como no P01 e pode ser habilitada no JSON. A comparação com o P01 usa assistência de trajetória desligada.

JSON `gminus.physics08` versão **2** valida campos, intervalos, grade numérica do P01, modo A e status. JSON v1 é rejeitado com explicação: não se traduz silenciosamente os antigos parâmetros de pilotagem. O perfil completo pode ser calibrado pelo JSON, sem criar outro editor de 207 sliders. O arquivo do P01 continua sendo a referência para sua interface completa de calibração.

## Validação e limite da equivalência

Os testes executam **o script original inteiro do P01 em VM**, com um fixture de pista plana. A chamada “straight” do P01 tem ondulação e pequeno desvio lateral; somente essas coordenadas são substituídas no harness em memória para comparar ambos sob a mesma geometria. Nenhuma fórmula física do P01 é alterada no harness e seu arquivo permanece intacto.

Oito ensaios comparam posição, velocidade, yaw rate, roll, slip, energia e boost, passo a passo, com tolerância de 1e-7: aceleração, coast, freio, direção, drift, strafe, freios laterais e boost. Três ensaios aéreos comparam altura, velocidade vertical/longitudinal e pitch. Dois pousos comparam posição, velocidade e energia após bônus e penalidade. Isso demonstra equivalência numérica **nesses cenários controlados**, não equivalência completa em qualquer pista/estado.

Os demais testes cobrem geometria, contato constante, loop invertido, parede/tubo, lançamento/pouso, direção correta, pulso curto, varredura de barreira, JSON, geometrias canônicas e determinismo de cadência 30/60/120 com física a 120 Hz. Browser validation usa Chromium/ANGLE/SwiftShader, com desenho WebGL real, teclado e capturas; não é benchmark de 120 FPS em GPU real.

Comandos:

```sh
node prototypes/physics-08/build.mjs
node prototypes/physics-08/build.mjs --check
node --test prototypes/physics-08/physics08.test.cjs
npm test
npm run build
CHROMIUM_EXECUTABLE=/caminho/chromium PLAYWRIGHT_MODULE=/caminho/playwright node prototypes/physics-08/browser-validation.cjs
CHROMIUM_EXECUTABLE=/caminho/chromium PLAYWRIGHT_MODULE=/caminho/playwright node prototypes/physics-08/direction-browser.cjs
```

Evidências desta revisão: `docs/evidence/physics-08/revision-2/`. As evidências na pasta pai pertencem à revisão 1 e não validam o novo código.

## Limitações que permanecem

Colisão esférica comum de 1 u, CCD incompleto para arestas/vértices, orientação de contato assistida, ausência de tensor de inércia, interpolação visual, controles touch e replay integral de sessão manual. VFX ativos preservam propulsão A, boost B, velocidade A e colisão B; voo/pouso C/D ainda não estão ligados aos estados reais. Câmeras são instrumentos do laboratório, não reprodução da câmera aprovada do P01. Não há corrida, K.O. ou integração com a física principal.

Próximo gate: avaliar a sensação do Perfil C nesta base 3D e as transições, resolver as precisões pendentes sem supor novos números, calibrar captura/altura de contato e seguir para o circuito P09 somente com avaliação explícita. A escolha de A não aprova automaticamente as novas convenções 3D nem todos os valores.
