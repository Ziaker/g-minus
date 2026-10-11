# G-MINUS — Protótipo 08: física 3D

**P08 APROVADO — INTEGRAÇÃO PENDENTE**

Aprovação expressa em 11/10/2026: [registro e escopo](../decisions/2026-10-11-prototype-08-physics-approval.md). Revisões e evidências anteriores preservam o estado histórico de avaliação.

> **Atualização de 11/10/2026:** a especificação vigente combina [Revisão 2 — Perfil C + contato A](08_3d_physics_lab_revision2.md) e [Revisão 3 — recuperação aérea](08_3d_physics_lab_revision3.md), conforme escopo confirmado pelo responsável. O conteúdo abaixo preserva o histórico da revisão 1; os três sistemas independentes de pilotagem foram substituídos.
> **Aprovação posterior:** [revisão 4 — descida com ↓/S + boost e controle aéreo +30%](08_3d_physics_lab_revision4.md), com [decisão e baseline JSON v5](../decisions/2026-10-11-prototype-08-air-control-approval.md). O texto anterior abaixo permanece como histórico; os comandos vigentes constam na revisão 4.

## Entrega e execução

Abra `prototypes/08_3d_physics_lab.html` em um navegador com WebGL. O HTML é independente, contém todos os shaders, malhas, referências e código, e não acessa CDN. Desktop/teclado é o alvo; não há controles touch. Selecione uma das dez áreas e use reset para iniciar nela. X/W acelera; setas esquerda/direita dirigem; Z/C deslocam lateralmente; espaço freia e reduz grip para drift; A aciona boost. No ar, cima/baixo altera pitch, Q/E altera roll. J injeta um impulso de diagnóstico: não é uma proposta de salto manual no jogo. P pausa, R reinicia, V alterna câmera. Inspeção permite arrastar e usar roda de zoom.

A/B/C permanecem simulados simultaneamente com as mesmas entradas e estado inicial. Selecionar uma alternativa altera a observação, sem reiniciar as demais. O botão de comparação mostra três viewports. Sliders pertencem à alternativa selecionada: valores diferentes deixam de constituir uma comparação numericamente equivalente. Reset de parâmetros restaura apenas essa alternativa; reset de simulação recria as três. Velocidade inicial ajustável passa a valer no próximo reset; velocidade limite é um controle físico ao vivo.

## Fontes e preservação

Base documental atualizada até `80f7093`, incluindo o commit do Claude sobre peças cosméticas e roadmap. Foram consultados GDD, aprovação do P01, export original e conversão JSON, reconciliação de parâmetros, P02 D, P04 V2, P05, P06 e P07. A recomendação de alternativas do roadmap não substitui o pedido explícito deste trabalho: aqui A é guiada pela superfície, B é livre com forças e C é híbrida.

O gerador copia literalmente o bloco canônico de geometria do P05, o resolver de pintura B do P06 e renderer/shaders D e efeitos do P04 V2. As nove combinações Falcon/Fox/Goose × A/B/C conservam dimensões e cores canônicas. A escolha de malha não altera qualquer parâmetro físico. Os documentos aprovados e os protótipos anteriores não foram editados.

O export convertido completo do Perfil C está embutido e disponível para download. Isso preserva também suas ambiguidades, sem inventar precisão. A auditoria preexistente registra 18 ambiguidades entre os 93 parâmetros mapeados, 12 divergências numéricas, 53 parâmetros funcionais, 25 lidos sem efeito mensurável e 15 não lidos. O laboratório não resolve silenciosamente essa dívida.

## Arquitetura e unidades

`physics-08/core.js` é independente do DOM e renderer. Vetores XYZ, orientação por base ortonormal frente/cima e passo fixo de 1/120 s. Unidades de distância abstratas `u`; velocidade em u/s, HUD em u/s × 3,6. Massa unitária: campos chamados força têm unidade de aceleração u/s². Não há coordenada de spline na nave nem busca por estação para posicioná-la.

`Course` gera triângulos e índice espacial uniforme de 48 u. Renderização e contato usam os mesmos triângulos. Normais de contato são interpoladas das normais reais de faces adjacentes. Consulta local procura a face mais próxima dentro do alcance, com teste de orientação e de distância lateral às bordas. As estações existem apenas para gerar a geometria e selecionar pontos explícitos de reset.

O acumulador desacopla física da renderização; aceita até 250 ms por frame e registra tempo descartado acima disso. Pausa e perda de visibilidade não recuperam tempo pendente. Não há interpolação visual entre passos físicos nesta revisão. O ensaio programado de dez segundos usa a seed para fase das entradas, iguais entre modelos. Determinismo é demonstrado no mesmo runtime; não há garantia bit a bit entre motores JS distintos, nem gravação/reprodução de toda sessão manual.

### Modelos diferentes

| Modelo | Restrição/força | Transição para voo | Assistência medida |
|---|---|---|---|
| A | Transporta velocidade tangente entre normais e aplica correção normal local limitada por passo | Sem face válida, velocidade de saída excessiva ou reação necessária acima do limite magnético | Deslocamento de correção, reação e remoção de velocidade normal |
| B | Integra posição por velocidade; mola, amortecimento, gravidade e força normal limitada | Sem superfície no alcance ou velocidade normal acima da captura | Sem projeção de posição; orientação arcade assistida |
| C | Integra corpo livre como B, acrescentando correção limitada da velocidade normal | Mesmas condições de captura de B | Módulo da alteração de velocidade por segundo; zero projeção de posição |

B/C: força normal `clamp(-k*(h-hAlvo)-d*vn-g·n, ±limite)`. C acrescenta `dv=clamp((clamp(8*(hAlvo-h),±18)-vn)*assist,±limite*dt)`. A limita correção normal a 0,35 u por passo por padrão; isso é uma restrição explícita, não teletransporte a outro trecho. A orientação de B/C se aproxima exponencialmente da normal; não há tensor de inércia ou torques de corpo rígido. No ar, orientação responde a pitch/roll/yaw e a posição continua sob gravidade global real.

O limite magnético é experimental e não modela eletromagnetismo real. A/B/C cancelam a gravidade lateral ao contato e amortecem slip para resposta arcade. Propulsão tem limite de velocidade, mas descidas e impactos podem ultrapassá-lo. Guarda numérica interrompe estados não finitos ou velocidade acima de 2000 u/s, sem ocultar o erro por reposicionamento.

### Estados, pouso e colisão

Contato, desprendimento, voo e pouso são estados observáveis; o evento pouso dura um passo. Gravidade aérea atua em Y global, enquanto suspensão e aderência usam a normal local. Captura exige face no alcance, orientação compatível e velocidade de afastamento inferior ao limite calculado. Não há atração a uma superfície distante.

No pouso, uma fração experimental da velocidade de impacto normal acrescenta velocidade tangencial, limitada a 140 u/s antes do multiplicador. A nave recebe resolução sólida contra pista e barreiras por varredura de esfera de raio 1 u e correção local de sobreposição. Barreiras usam restituição 0,18. A esfera é comum às nove geometrias: não representa a silhueta visível e não constitui aprovação de hitbox. A varredura cobre faces; contatos rasantes de aresta/vértice ainda precisam de um CCD completo. Não há dano, destruição ou K.O.; queda abaixo de -500 u interrompe a nave e pede reset explícito.

## Pista de calibração

Dez áreas conectadas, acessíveis individualmente: reta de 950 u com barreiras nos primeiros 650 u; curva aberta; curva fechada; banking; transição gradual de plano a parede 90° e retorno; loop vertical de raio 190 u; tubo com transição da seção plana para cilindro e retorno; rampa; lacuna real sem triângulos; recepção de 2400 u. O loop desloca lateralmente sua saída em 200 u para impedir interseção com a entrada. O tubo tem 32 subdivisões transversais. A região de recepção está abaixo da rampa para permitir voo balístico. As curvas exigem direção do jogador: não há piloto automático de spline.

Esse percurso aberto não é um circuito de corrida, não tem voltas, checkpoints ou IA. Não substitui o P09.

## Configuração, referências e divergências

JSON `gminus.physics08`, versão 1; validação exata de chaves, enumerações, limites, números finitos, seed uint32 e status sem aprovação. Importação só substitui o estado após validar o documento inteiro. Export inclui as três calibrações, nave, variante, câmera, área, velocidade inicial, seed e toggle legado. Export separado de telemetria contém estado e histórico de 60 s amostrado a 10 Hz, além de custos e configuração.

| Tema | Referência / implementação atual | P08 experimental |
|---|---|---|
| Esterço | Export 89; jogo 56 | 89 °/s, nova integração espacial |
| Altura | Export 2,1; jogo 2,8 | 2,1 u, relativa à face real |
| Oscilação | Amplitude 0,12; argumento 4,8×tempo | Desligada por padrão; toggle reproduz alvo legado |
| Frequência | Export rotula 4,8 Hz; código usa seno sem 2π | Mantém a fórmula existente, sem corrigir silenciosamente a unidade |
| Roll visual | Export 34°; jogo 75° | Orientação por superfície e comandos aéreos; não replica roll cosmético |
| Mola/amortecimento | 250 / 50 como referência | B/C usam 250 / 50 com forças reais; A não usa mola |
| Atributos por nave | Jogo ainda diferencia desempenho | Todas as nove malhas usam a mesma física |
| Boost | Perfil C como referência | Duração 2,4 s, limite +20%, custo/consumo experimentais no novo núcleo |
| VFX | Aprovações do P04 V2 | Propulsão A, Boost B, Velocidade A e Colisão B com baseline preservado |

Grip, inércia de direção, gravidade, limite magnético, captura, assistência, transferência de pouso e orientação são calibrações experimentais. Não há equivalência declarada com a pilotagem completa do Perfil C. A referência original continua acessível nos protótipos anteriores. VFX de voo C/D, drift, opções cumulativas de boost e representação específica do pouso ainda não estão ligados aos estados 3D; marcador técnico de contato não é apresentado como efeito aprovado. Essa é uma lacuna desta revisão, não uma revogação dessas aprovações.

## Instrumentação

Painel: posição/velocidade XYZ; velocidade vertical global; normal; distância; suspensão; magnetismo; assistência C; correção A; slip; último impacto; erro angular; pousos/desprendimentos; FPS; custo agregado dos três passos físicos; custo CPU de desenho; tempo descartado. Histórico e comparação permitem reconhecer a estabilidade de cada modelo. Custos não são tempo GPU, nem percentis de profiling. Distância ausente é apresentada como ausência de contato, não zero.

## Build e testes reproduzíveis

```sh
node prototypes/physics-08/build.mjs
node prototypes/physics-08/build.mjs --check
node --test prototypes/physics-08/physics08.test.cjs
npm test
npm run build
CHROMIUM_EXECUTABLE=/caminho/chromium PLAYWRIGHT_MODULE=/caminho/playwright node prototypes/physics-08/browser-validation.cjs
```

O gerador valida sintaxe e compõe HTML standalone. A entrada `prototype08` inclui o HTML independente na distribuição Vite; isso não integra sua física em `src/game`. A publicação no GitHub Pages depende de atualização e verificação do deployment. Node/Playwright e Chromium são requisitos de validação, não dependências do HTML. Logs em `docs/evidence/physics-08`. Testes verificam malha finita, normais, lacuna, estabilidade em repouso, loop invertido, parede/tubo, voo/pouso, continuidade, colisão rápida, distinção dos modelos, oscilação legada, configuração e determinismo em 30/60/120 cadências. Os testes não cobrem todos os valores extremos ou todas as trajetórias dirigidas.

## O que ainda precisa de brainstorm e avaliação humana

1. Escolher A, B ou C pela pilotagem e ajustar a tolerância desejada de captura: quanto um erro de alinhamento deve custar ao jogador? Testar especialmente bordas e mudanças de inclinação.
2. Definir sensação de drift, liberdade de orientação aérea e quanto impulso normal deve virar velocidade no pouso. A fórmula atual é uma hipótese testável.
3. Decidir padronização de hitbox, massa e altura sem vantagens cosméticas, conforme nova decisão. A esfera unitária é ferramenta de comparação.
4. Resolver ambiguidades do export e a divergência de esterço antes de prometer equivalência ao Perfil C. Aprovar expressamente a substituição da oscilação periódica.
5. Definir feedback de perda de contato e pouso, aproveitando Voo C/D; reconciliar efeitos visuais com altura real e câmera invertida.
6. Deixar recuperação/K.O. para P10, circuito/atalhos/checkpoints para P09 e conforto/refinamento da câmera para P12. Não é necessário decidir esses sistemas para experimentar este laboratório.

Nenhum resultado automatizado escolhe a alternativa mais divertida. Antes de integrar: jogar cada cenário, avaliar desorientação e sensação de velocidade, realizar testes de bordas/hitboxes e hardware real, resolver as lacunas acima e registrar aprovação explícita.
