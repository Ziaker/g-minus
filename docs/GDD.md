# G-MINUS — Game Design Document (GDD)

**Estado:** versão inicial de definição; não representa implementação concluída.  
**Data do levantamento:** 2026-10-08.  
**Fonte primária das decisões:** respostas numeradas de 1 a 104 fornecidas pelo responsável pelo projeto.  
**Repositório do jogo:** https://github.com/Ziaker/g-minus (branch principal: main).  
**Referência indicada para F-Zero X:** https://github.com/Zorkats/G-Diffuser (port não oficial para PC de F-Zero X).

> **Convenção obrigatória:** decisões abaixo são requisitos de design, não afirmações de que o recurso já está implementado. Onde a resposta não fecha uma regra, não se deve inventar comportamento. A versão final de cada feature exige protótipo HTML, aprovação e documentação de seus parâmetros antes da implementação. Os números entre colchetes referem-se às perguntas respondidas.

## 1. Visão e identidade da experiência [1–10]

- **Pilar central [1–2]:** combinação épica de sensação de velocidade extrema com combate físico entre naves. O maior foco em confrontos veiculares é parte da identidade de G-MINUS em relação à inspiração em F-Zero.
- **Acessibilidade [3]:** experiência relativamente simples de aprender.
- **Punição [4]:** equilíbrio moderado entre erros relevantes e oportunidade de recuperação.
- **Duração [5]:** aproximadamente 3 minutos por corrida, como meta média de experiência, não limite obrigatório.
- **Motivação de longo prazo [6]:** adiada; não transformar em requisito.
- **Modo confirmado [7]:** Corrida Rápida.
- **Campeonato [8] e multiplayer [9]:** sem resposta específica; não assumidos nem descartados. O modo de equipes confirmado em [51] não define, por si, se a participação será humana, IA, local ou online.
- **Referência de sensação de pilotagem [10]:** F-Zero GX.

## 2. Regras e fluxo das corridas [11–20]

- **Participantes [11]:** 30 veículos por padrão, ajustáveis nas opções anteriores à corrida.
- **Grid [12]:** ordem de largada aleatória.
- **Largada [13]:** aceleração antecipada permitida com risco associado; janela, benefício e penalidade ainda deverão ser prototipados.
- **Voltas [14]:** 3 como padrão, quantidade configurável no pré-jogo.
- **Chegada [15]:** colocação definida pela passagem exata do veículo pela linha de chegada.
- **Vitória [16]:** após a chegada, apresentar uma animação de vitória em uma volta rápida, em câmera lenta, por 3 segundos, e então ir para os resultados. A coreografia e o significado operacional de “volta rápida” devem ser validados no protótipo, sem substituição por outra cena.
- **Eliminações [17]:** remover competidores da disputa; não há bônus de classificação definido por K.O.
- **Checkpoints [18]:** validar voltas e detectar atalhos ilegais.
- **Sentido contrário [19]:** mostrar avisos; não presumir reposicionamento ou penalidade adicionais.
- **Ações durante a corrida [20]:** pausar, continuar, reiniciar e abandonar. Não disponibilizar retomada de checkpoint como opção pedida.
- **Configuração pré-corrida:** opções confirmadas incluem tamanho do grid [11] e número de voltas [14]; regras adicionais só se forem definidas posteriormente.

## 3. Pilotagem, controles e física percebida [21–30]

- **Perfis de direção [21]:** oferecer três opções selecionáveis nas configurações. A resposta pede as três abordagens sugeridas (resposta imediata/precisa, progressiva e com inércia perceptível); denominações, curvas de resposta e parâmetros precisam ser demonstrados e escolhidos em protótipos, sem tratá-los como valores já fixados.
- **Velocidade [22]:** aumentar velocidade reduz estabilidade na curva.
- **Liberação da direção [23]:** nave tende a se estabilizar após o comando ser solto.
- **Drift [24]:** deve existir tanto como mecânica deliberada quanto como consequência da inércia.
- **Freios [25]:** permitem curvas fechadas e manobras, além da redução de velocidade.
- **Freios aerodinâmicos [26]:** comandos independentes à esquerda e à direita.
- **Erros de trajetória [27]:** causam perda de velocidade.
- **Altitude [28]:** comportamento determinado pelos atributos das quatro peças componentes da nave. Não foi definido controle vertical manual; não adicioná-lo por inferência.
- **Superfícies inclinadas/invertidas [29]:** exigem correções de pilotagem.
- **Manobras avançadas [30]:** confirmadas, porém técnicas e comandos exatos ainda em aberto.
- **Referência geral:** sensação arcade próxima de F-Zero GX, não uma exigência de replicar código-fonte, assets ou números sem validação.

## 4. Energia, escudo, boost e colisões energéticas [31–40]

**Decisão do responsável:** para todo o conjunto [31–40], usar como referência o comportamento de F-Zero GX ou F-Zero X. O repositório https://github.com/Zorkats/G-Diffuser é uma referência fornecida para F-Zero X.

**Especificação ainda não fechada:** a resposta não escolhe qual título prevalece em divergências entre GX e X, nem parâmetros numéricos. Portanto, para cada ponto abaixo, o comportamento exato deve ser estudado, apresentado em alternativas de protótipo e aprovado, sem inventar uma regra híbrida:

1. [31] Acionamento e duração do boost;
2. [32] Relação entre custo energético e ganho de velocidade;
3. [33] Limites, condições e possível intervalo entre ativações;
4. [34] Resultado de energia/escudo esgotado e eventual eliminação;
5. [35] Existência ou ausência de recuperação passiva;
6. [36] Risco, velocidade e posicionamento nas áreas de recarga;
7. [37] Efeito temporal das plataformas de aceleração;
8. [38] Interação entre boost ativado e plataformas;
9. [39] Cálculo do dano de colisão sobre o escudo;
10. [40] Comportamento diante de danos em sequência.

**Base atual do projeto (não é decisão final):** o código já usa escudo como recurso do boost, plataformas de aceleração e faixas de recarga. O código também reaparece veículos destruídos após temporizador, enquanto o README associa esgotamento de energia a K.O.; resolver este conflito somente após definir [34].

## 5. Combate físico e clash [41–50]

- **Side-Attack [41]:** investida lateral.
- **Custo [42]:** consumo de energia; custo, temporização e repetição não estão numericamente definidos.
- **Impacto bem-sucedido [43]:** o alvo é lançado contra obstáculos e/ou gira, perdendo controle.
- **Precisão [44]:** resultado depende de uma combinação de fatores, incluindo momento, alinhamento, distância e velocidade; os pesos não estão definidos.
- **Clash [45]:** possibilidade de rebater um ataque. Quando duas naves entram em clash, **ambas continuam voando em alta velocidade durante um desafio de comandos repetidos (mashing)**. O vencedor lança o perdedor com força ampliada. Regras de entrada, desempate, duração, entradas, direção do lançamento e aplicação na IA exigem protótipo.
- **Colisões normais [46]:** não criar diferenciações próprias entre frente/traseira/lateral por tipo de impacto normal. Isso não elimina a mecânica especial de Side-Attack.
- **Saída da pista [47]:** ataques podem lançar adversários totalmente para fora da pista. Eliminação imediata versus recuperação não foi determinada com precisão pela resposta “sim”.
- **Barreiras [48]:** permitir batidas controladas e ricochetes.
- **K.O. [49]:** vantagem de posição ao retirar concorrentes, sem recompensa adicional de recurso definida.
- **Equilíbrio [50]:** combate e corrida devem estar em harmonia; vencer não deve depender exclusivamente de confrontos.

## 6. IA, rivalidade e equipes [51–60]

- **Personalidades [51]:** cada adversário possui uma personalidade própria sorteada dentre quatro arquétipos: agressivo, defensivo, técnico ou oportunista.
- **Rival dedicado [51,60]:** um competidor torna-se o rival com maior foco no jogador, mantendo identidade reconhecível durante a competição; regras de escolha, persistência e intensidade serão prototipadas.
- **Modo de equipes [51]:** confrontos 5v5, 10v10 e 15v15.
- **Contato entre aliados [51]:** configuração prévia que permite ou impede fogo amigo por colisão/abalroamento. Não implica existência de armas.
- **IA parametrizada [52]:** dificuldade combina velocidade, técnica, agressividade e qualidade de decisão, governada por uma lista de atributos/status da IA ainda a especificar.
- **Recuperação competitiva [53]:** rubber banding bidirecional, aplicável ao jogador e à IA, sujeito a prototipação do equilíbrio.
- **Traçado [54]:** escolha guiada pelo perfil de pilotagem do adversário.
- **Decisões dinâmicas [55–59]:** ataque, defesa, trajetória, utilização do boost e dispersão do pelotão seguem o comportamento característico da personalidade; não fixar gatilhos ou probabilidades antes do protótipo.
- **Rivais recorrentes [60]:** sim. Não há definição de sistema de narrativa ou personagens pilotos.
- **Pendente:** o modo de equipes não especifica se times são controlados só pela IA ou se há jogadores humanos; não converter em uma decisão de rede ou multiplayer.

## 7. Pistas e ambiente interativo [61–70]

- **Quantidade inicial [61]:** cinco pistas diferentes.
- **Dificuldade [62]:** progressão de circuitos acessíveis para desafios mais complexos.
- **Geometria [63]:** combinar superfícies abertas, túneis, tubos, loops, espirais, paredes inclinadas e demais formatos citados.
- **Verticalidade [64]:** espetáculo visual e efeito mecânico na pilotagem.
- **Largura variável [65]:** trechos largos e estreitos.
- **Bifurcações [66]:** rotas alternativas.
- **Atalhos [67]:** recompensam escolha de trajetos mais arriscados, sujeitos a validação de checkpoints [18].
- **Perigos [68]:** trechos danificados, quedas, estruturas e barreiras.
- **Distribuição de boost/recarga [69]:** combinação de pontos estratégicos previsíveis com locais de disputa e mudança de trajetória.
- **Cenário funcional [70]:** pistas estáticas por ora; sem transformações dinâmicas obrigatórias durante a corrida.
- **Identidade compartilhada [85]:** pistas distintas dentro de uma linguagem artística coesa.

## 8. Naves, componentes e atributos [71–80]

- **Modelos [71]:** dez veículos inicialmente, com paletas de cores diferentes.
- **Estrutura modular [72,78]:** quatro peças componentes intercambiáveis por nave; jogador pode alterar as quatro peças e suas cores separadamente.
- **Parâmetros [72]:** as peças determinam diferenças de desempenho, incluindo velocidade máxima, aceleração, controle, resistência, ataque, eficiência de boost e demais atributos citados na pergunta. **Os nomes e as funções precisas das quatro peças não foram definidos; não inventar categorias.**
- **Diversidade de desempenho [73]:** combinar equilíbrio geral com especializações relevantes. O grau de diferença exige prototipação; não decidir valores finais silenciosamente.
- **Impactos físicos [74]:** tamanho e massa da nave devem influenciar colisões e manobras.
- **Habilidades especiais exclusivas [75]:** não por ora.
- **Desbloqueios [76]:** adiado/irrelevante por ora.
- **Progressão numérica [77]:** atributos fixos; sem melhorias permanentes de desempenho.
- **Pilotos/personagens [79]:** não por ora; foco nas naves.
- **Recordes, medalhas e recompensas [80]:** adiado/irrelevante por ora.

## 9. Direção visual [81–90]

- **Estilo [81]:** 3D estilizado, combinação de low-poly e anime, com outlines pretos muito presentes.
- **Paleta e atmosfera [82]:** neon vibrante sobre cenários escuros; influência de city pop e cyberpunk japonês.
- **Leitura [83]:** naves devem se destacar claramente dos ambientes.
- **Temas ambientais [84]:** incluir metrópoles futuristas, estações espaciais, planetas alienígenas, complexos industriais e estruturas suspensas, mantendo escopo de cinco pistas sem pressupor um mapeamento tema–pista.
- **Coesão [85]:** identidade artística compartilhada.
- **Arquitetura [86]:** megaconstruções, plataformas monumentais, hologramas, túneis luminosos, estruturas orbitais e outros marcos citados.
- **Silhuetas [87]:** mesclar formas arredondadas/aerodinâmicas, angulares/agressivas e robustas conforme a nave.
- **Materiais/renderização [88]:** 3D estilizado com cel shading se viável; contornos pretos continuam sendo direcionamento explícito.
- **Identidade individual [89]:** combinar silhueta, cor, iluminação e elementos mecânicos próprios.
- **Segundo plano [90]:** cenários de fundo estáticos por ora.

## 10. Câmera, HUD e efeitos [91–100]

- **Câmera [91–92]:** perspectivas/enquadramentos variáveis selecionáveis por botão. Distâncias e quais perspectivas serão disponibilizadas dependem de protótipo; não presumir visão em primeira pessoa como confirmada.
- **Movimento de câmera [93]:** épico, dinâmico, capaz de reforçar forças e eventos.
- **FOV [94]:** alterações discretas com a velocidade.
- **Sensação de velocidade [95]:** alongamento visual da nave e action lines; demais efeitos não são obrigatórios sem aprovação.
- **HUD [96]:** exibir velocidade, escudo, posição, volta, cronômetro e distâncias para rivais, conforme opções apresentadas na pergunta.
- **Navegação [97]:** minimapa/radar com opção de ativar ou desativar nas configurações; formato exato do instrumento ainda aberto.
- **Alertas [98]:** priorizar animações para acontecimentos importantes.
- **VFX [99]:** espetaculares, mas sem comprometer legibilidade e tomada de decisão.
- **Menus [100]:** interface básica por ora; não fixar linguagem elaborada de HUD/menu sem prototipar.

## 11. Política obrigatória de prototipação, telemetria e documentação [101–104]

### 11.1 Gate de protótipo antes da implementação [101, diretriz final]

**Toda feature nova ou modificada deve primeiro passar por uma prototipação-base e aprovação antes de ser implementada no jogo.** A implementação deve reproduzir exatamente o comportamento e a aparência da alternativa aprovada, inclusive sua configuração.

Cada solicitação de protótipo deve entregar:
1. **HTML utilizável**, como formato de prototipação exigido;
2. **três opções de gameplay ou direção visual realmente diferentes** para a feature em questão;
3. **sliders próprios para cada opção**, possibilitando decisões e ajustes relevantes; outros controles podem complementar, sem substituir os sliders;
4. **importação e exportação de configurações por copiar/colar**, contemplando opção escolhida e parâmetros;
5. **documento de especificação completo** da feature escolhida, com comportamento, estados, controles, valores/intervalos/defaults, feedback, dependências, exceções e informações necessárias à implementação posterior;
6. **incorporação dos protótipos anteriores pertinentes**, de modo que decisões já aprovadas e relevantes não sejam esquecidas.

**Critério de aprovação:** registrar a opção aprovada e uma configuração final reproduzível. Sem aprovação não se deve implementar gameplay correspondente. Quando uma divergência técnica impossibilitar fidelidade exata, expor a divergência e pedir decisão antes de alterar escopo ou comportamento.

**Decisão vigente — Protótipo 01 (10/10/2026):** o Perfil C — Inercial / Drift foi aprovado como baseline de física e dinâmica. A aprovação abrange o comportamento funcional proposto pelo laboratório e exclui visual, VFX, áudio e pistas. O registro e o estado de integração estão em [`docs/decisions/2026-10-10-prototype-01-physics-approval.md`](decisions/2026-10-10-prototype-01-physics-approval.md).

### 11.2 Telemetria e depuração [102]

Deve existir um sistema de telemetria e debug que facilite o teste do jogador e de todos os comportamentos de IA, inclusive situações difíceis de reproduzir. Requisitos explícitos:
- seeds de partida;
- capacidade de investigar qualquer situação de gameplay relevante;
- gameloop constante;
- observabilidade suficiente para inspecionar corrida, veículos e IA.

**Em aberto, sujeito a prototipação:** formato dos dados, interface de debug, conceito exato de “gameloop constante”, controle de tempo, cenários reproduzíveis e estratégia de persistência de seeds. Não pressupor automaticamente determinismo completo sem validação.

### 11.3 Fonte de verdade e documentação contínua [103]

Para **toda** mudança: consultar primeiro os arquivos atuais do jogo e a documentação atualizada do repositório; verificar implementação e requisitos existentes; documentar toda feature nova/modificada e manter documentação continuamente sincronizada. Evidenciar diferenças entre: requisito decidido, protótipo aprovado, código alterado e comportamento validado. Não tratar documentação desatualizada como fonte de verdade sobre código atual.

### 11.4 README e link de jogo [104]

Em toda alteração autorizada ao projeto, atualizar o README de forma proporcional e rastreável, preservando conteúdo não relacionado. Incluir o link do GitHub Pages para jogar, mas **não alegar que a página está funcional sem verificar a publicação**.

**Endereço convencional pretendido:** https://ziaker.github.io/g-minus/ — disponibilidade não confirmada. Em 2026-10-08, o workflow "Deploy to GitHub Pages" falhou em "Setup Pages" após o build passar: https://github.com/Ziaker/g-minus/actions/runs/37830599287 .

## 12. Comparação documental com o código existente (inspeção estática, não teste do jogo)

Referências examinadas na branch principal em 2026-10-08:
- README.md
- src/game/Game.ts
- src/game/Vehicle.ts
- src/game/Track.ts
- src/game/Combat.ts
- src/game/Input.ts
- index.html
- .github/workflows/deploy.yml

| Aspecto | Presença na implementação consultada | Diferença para o GDD |
| --- | --- | --- |
| Participantes | 1 jogador + 3 rivais criados em Game.ts | Padrão proposto de 30, ajustável |
| Voltas | HUD mostra 3 voltas | Pré-jogo configurável e encerramento/resultado a especificar |
| Escudo/boost | Existentes em Vehicle.ts | Revisar conforme referência GX/X e protótipos |
| Destruição | Respawn temporizado em Vehicle.ts | Eliminação e resultado quando energia zera a decidir em [34] |
| Combate | Side-Attack e colisões em Game.ts/Vehicle.ts | Falta projetar/validar sistema de clash e rebotes definidos |
| IA | Trajetória variada e comportamentos probabilísticos em Vehicle.ts | Faltam personalidades, rival dedicado, atributos e equipes |
| Pistas | Uma curva/circuito declarado em Track.ts | Cinco pistas, bifurcações e diversidade geométrica |
| Naves | Um modelo geométrico base parametrizado | Dez modelos e quatro peças customizáveis |
| Direção visual | Materiais e iluminação neon, geometria simples | Anime/low-poly, contorno preto, cel shading, estilo japonês |
| Câmara | Câmera de perseguição com FOV variável | Alternância configurável de perspectivas e refinamento |
| HUD | Velocidade, escudo, posição, volta, K.O. | Cronômetro, distâncias e minimapa/radar conforme escolha |
| Telemetria/seed | Não constatadas nas fontes consultadas | Especificar e prototipar observabilidade e reprodução de cenários |

**Limite:** comparação por leitura dos fontes, sem execução do jogo, testes de build locais ou validação em navegador. Os itens acima não substituem inspeção de versões posteriores.

## 13. Pendências explícitas; não decidir sem autorização

1. **[8–9]** Campeonato e definição de multiplayer: perguntas não respondidas. Equipes são confirmadas, mas modalidade humana/IA não.
2. **[21]** Definição detalhada dos três perfis de resposta da direção.
3. **[28,30]** Nomes/funções das quatro peças, regras de altitude e lista de manobras avançadas.
4. **[31–40]** Quando F-Zero GX e X divergem, escolher comportamento; estabelecer valores e exceções por protótipos antes de codificar.
5. **[45]** Mecânica precisa do clash, janela de input, controles, equilíbrio contra IA, duração e desfecho.
6. **[47]** Destino exato após sair da pista: K.O., recuperação ou regras condicionais.
7. **[51–59]** Status da IA, seleção e persistência do rival, equipes e funcionamento do rubber banding.
8. **[72–74]** Estrutura das quatro peças, atributos, limites de composição e regras de colisão com tamanho/massa.
9. **[91–97]** Perspectivas de câmera, instrumentos de navegação e seus comportamentos de alternância.
10. **[101–102]** Formatos específicos da configuração copiável, documentação de protótipos e ferramentas de telemetria/seed.
11. **[6,76,80]** Progressão/recompensas/desbloqueios: deliberadamente adiados.
12. **[104]** GitHub Pages: publicação atualmente não confirmada; não afirmar que o endereço previsto permite jogar.

**Alterações de gameplay e visuais efetuadas nesta etapa:** nenhuma. Este documento registra decisões e lacunas para prototipação futura.
