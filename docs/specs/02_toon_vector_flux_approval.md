# G-MINUS — Registro de aprovação da direção artística D: Toon Vector Flux

**Estado da decisão:** APROVADA — direção estética geral para futuros protótipos visuais do G-MINUS.  
**Data da aprovação expressa:** 09/10/2026.  
**Autoridade da decisão:** responsável pelo projeto G-MINUS (declaração direta na conversa).  
**Objeto aprovado:** alternativa D — **TOON VECTOR FLUX** — do laboratório de naves WebGL v6 anexado pelo responsável.  
**Arquivo de referência preservado no repositório:** [Protótipo 02 — WebGL v6](../../prototypes/02_ship_visuals_v6_webgl.html).  
**Proveniência:** cópia byte a byte do arquivo enviado como GMINUS_02_REBUILD_v6_WEBGL(1).html. SHA-256 do HTML original: **560f751db1a22bccac23f52f0b8e595c1a7293da82eea94a91c075a091e8df02**; objeto Git blob: **1543866bdb0cf668f91155168602186d1de99592**.  
**Requisitos de origem:** [GDD](../GDD.md), itens [81–90] (identidade visual), [71–80] (naves e módulos), [83] (leitura), [95, 99] (velocidade/VFX legíveis) e [101–104] (aprovação, documentação, continuidade).

## 1. Decisão autorizada e delimitação

O responsável **aprova a opção D, Toon Vector Flux, como direção estética de referência do jogo G-MINUS e dos seus próximos protótipos visuais**. A opção D é uma linguagem **3D estilizada, não fotorrealista**, formada pela fusão deliberada de **massa e sombras de anime/cel shading** com **grafismos, fluxos e contornos de arte vetorial neon**. A aprovação incide sobre a linguagem estética identificável na v6 e não autoriza substituí-la livremente por A, B, C ou E.

Esta decisão **não aprova** automaticamente: geometrias definitivas das dez naves, valores individuais dos sliders, peças intercambiáveis e suas regras, HUD/menus finais, cenário Neo Metropolis, quaisquer cinco pistas, VFX/efeitos de ataque finais, câmera final, atributos dos veículos, física, balanceamento, programação de gameplay, ou a integração do renderizador WebGL da vitrine no jogo. Nenhuma implementação em src/game foi autorizada aqui. As outras opções A/B/C/E são alternativas históricas/de comparação, **não** escolhas aprovadas para a identidade principal.

**Escopo das afirmações:** as seções seguintes distinguem (a) comportamentos efetivos observáveis no **código-fonte da v6**, (b) o **contrato de linguagem visual aprovado** por escolha da opção D, e (c) exigências de **validação futura**. A existência de shaders na vitrine não prova fidelidade, performance nem execução deles dentro do jogo Three.js.

## 2. Assinatura visual — o que faz uma imagem ser Toon Vector Flux

### 2.1 Volumes, superfícies e sombras

- Casco com **volumes tridimensionais sólidos, facetados e hierarquizados**; os elementos de proa, cabine, asas, propulsores e painéis podem ter grandes planos gráficos, em vez de densidade decorativa fotográfica.
- **Sombras posterizadas em faixas discretas**, com transições de luz visíveis, não uma reflexão física suave. Na v6, o fragment shader da opção D usa quantização da iluminação em degraus derivados do produto entre normal e direção de luz; a fórmula de referência produz até **quatro níveis**.
- **Contraste explícito de claro/escuro**, suficiente para definir cada massa à distância e em movimento. Facetas e regiões de sombra permanecem legíveis mesmo com efeitos luminosos reduzidos.
- Acabamento com caráter de **ilustração técnica/anime**: reflexos funcionam como grafismos desenhados, e não como cromado, vidro hiper-realista ou carenagem PBR.

### 2.2 Contornos e hierarquia de linhas

- **Contorno de silhueta escuro e marcante**, preferencialmente quase preto ou azul-negríssimo. Esta é uma âncora da identidade do GDD [81, 88].
- O arquivo v6 executa um passe de casco expandido com descarte da face frontal (front-face culling). Na opção D, a referência numérica é **espessura de expansão 0,032 nas unidades geométricas do laboratório**, **não 0,032 px** nem valor universal de produção.
- Arestas vetoriais são **secundárias ao contorno estrutural**. A v6 extrai arestas relevantes dos tipos de geometria elegíveis, filtra comprimentos muito curtos e ângulos pouco acentuados, e as desenha com linhas. Não copiar cada triângulo como wireframe indiscriminado.
- **Cor efetiva das linhas do passe vetorial D na v6: magenta luminoso** (shader: RGB normalizado [1, 0,22, 0,61]); o ciano/turquesa aparece também na paleta das peças e acentos. Não descrever equivocadamente a v6 como se todas as linhas fossem brancas ou ciano.

### 2.3 Grafismo vetorial, meio-tom e emissões

- Integrar **acentos vetoriais seletivos**, faixas de energia, marcações de pintura e divisões de painéis em vez de preencher todos os objetos com grade eletroluminescente.
- A opção D da v6 aplica **halftone/retícula de pontos** no shader, com célula de aproximadamente **5 × 5 pixels de fragmento** e modulação sutil de zonas pouco iluminadas. Essa densidade é característica do **protótipo**: em outras resoluções, telas e distâncias, deve ser calibrada e novamente verificada, não congelada como unidade universal.
- Energias e propulsores servem como **assinatura visual pontual**, sem ofuscar silhueta, trajetória, barreiras, indicadores de gameplay ou competidores.
- A v6 **não demonstra um pipeline de bloom/pós-processamento final**. Seu controle “Brilho” influencia sobretudo as cores do papel energético, e não é prova de halos físicos, emissividade PBR ou partículas finais. Esses efeitos precisam de protótipo próprio.

### 2.4 Paleta cromática e ambiente

- **Base noturna escura**, com sombras azuis, violáceas e magenta; acentos vivos **ciano/turquesa, rosa-magenta e tons luminosos quentes pontuais**. As naves conservam identidade de cor individual em vez de receber uma tintura única obrigatória.
- Na v6, a cor da pintura D é derivada por mistura da cor individual da máquina com um rosa gráfico; a cor secundária escurece essa base; há acentos turquesa, elementos escuros violeta, emissões claras e marcações luminosas. A direção, portanto, é **policromática**, não “tudo ciano”.
- **Fundo da vitrine D**: RGB normalizado [0,035, 0,034, 0,083] — violeta-azulado muito escuro. **Esta é uma cor de cenário de inspeção, não um requisito de pintar todos os biomas com o mesmo fundo.**
- O GDD [82–85] já exige neon vibrante, influência city pop/cyberpunk japonês, coesão entre pistas e distinção clara das naves. Ambientes claros ou outros biomas podem existir conforme o GDD, desde que preservem a gramática de tinta/sombra/linha e o contraste necessário; sua adaptação ainda necessita protótipo.

### 2.5 Elementos que não representam a direção aprovada

Não tomar **cromado PBR**, acabamento industrial realista puro, wireframe em cada aresta, brilhos difusos exagerados, saturação uniforme, perda de contorno, silhuetas indistintas ou o visual holográfico translúcido da opção C como substitutos da opção D. Não confundir o tema gráfico/estética do laboratório de comparação com a interface/HUD final do jogo.

## 3. Âncora técnica verificável — comportamento específico do WebGL v6

O HTML foi recebido **sem alteração de conteúdo** e preservado como referência do desenho e do código. Seus conceitos de implementação são:

| Elemento | Estado na v6 D | Significado para futuras implementações |
|---|---|---|
| Renderização | WebGL nativo com vertex/fragment shaders próprios; opção D no índice de estilo 3, identificador “D” | Reproduzir a **aparência** em tecnologia apropriada ao jogo; não pressupor que esse shader já está em Three.js |
| Iluminação | Bandas discretas e termo de rim light colorido | Conserva volume anime e bordas ilustradas |
| Traço estrutural | Passe invertido de casca em tom escuro; espessura de referência 0,032 unidade | Silhueta em tinta; ajustar escala/oclusão conforme câmera |
| Traço vetorial | Extração de arestas selecionadas; linhas magenta na D; acentos também ciano | Fluxo gráfico como apoio às formas, não malha total |
| Superfícies | Paleta por funções de malha (pintura, secundária, acento, estrutura, vidro, energia, marcação) | Diferenciar material visual por função, preservando identidade de nave |
| Halftone | Retícula em espaço de tela, passo ~5 px, modulada pela sombra | Textura gráfica sutil, sob teste de resolução/legibilidade |
| Fundo de laboratório | Base violeta-escura com pedestal de exibição | Referência de inspeção, não pista aprovada |
| Controle de acabamento | Parâmetros de brilho e saturação | São controles de exploração; não estabelecem números finais de gameplay |

**Contraste com outras alternativas do próprio arquivo:** A é anime cel com tinta preta e cores de corrida; C privilegia arte vetorial eletroluminescente; **D deve apresentar ao mesmo tempo a massa/sombra anime e os cortes/grafismos vetoriais**. B e E são linguagens diferentes e não foram aprovadas.

## 4. Dez naves: diversidade formal preservada, aprovação limitada à estética

A v6 demonstra **dez máquinas com construtores geométricos distintos**: Blue Falcon (dart), Golden Fox (needle), Wild Goose (ram), Fire Stingray (manta), White Cat (twin-fork), Red Gazelle (rocket), Iron Tiger (block), Deep Claw (pincer), Black Bull (brute) e Blood Hawk (gull). As identidades cromáticas originais variam por máquina.

**Regra estrutural demonstrada no protótipo:** trocar A/B/C/D/E **não reconstrói outra silhueta**. O gerador de geometria recebe identificador da nave e proporções; o estilo atua em materiais, paleta e passes de desenho. Isto permite comparar o mesmo objeto sem falsear a avaliação.

O protótipo separa quatro grupos **visuais provisórios** (proa, cabine, asas, motores) e oferece inspeção por grupo. Os nomes são **organização interna do laboratório**, **não** aprovação dos nomes/funções das quatro peças intercambiáveis previstas no GDD [72, 78]. A presença de campos de piloto na lista do HTML tampouco aprova personagens ou pilotos jogáveis (GDD [79]).

**Não há aprovação automática das dez geometrias, suas massas, componentes ou paletas definitivas.** Ao avançar no design, demonstrar cada nave sob a identidade D e submeter a aprovação de forma/peças/cores quando essas decisões forem requeridas.

## 5. Configuração reproduzível do laboratório — exemplo técnico, não preset final aprovado

A decisão expressa foi **“opção D Toon Vector”**, sem envio de JSON de parâmetros individuais ajustados. Portanto, somente a **seleção D** é uma aprovação humana inequívoca. A configuração seguinte representa **valores-padrão existentes no código v6** para demonstrar a reprodução inicial; os números **não** foram escolhidos nem ratificados separadamente pelo responsável.

    {
      "schemaVersion": 6,
      "prototype": "gminus-craft-visual-lab",
      "machine": "falcon",
      "style": "D",
      "mode": "single",
      "focusPiece": "all",
      "view": "hero",
      "params": {
        "length": 1,
        "width": 1,
        "wingSpan": 1,
        "canopy": 1,
        "glow": 1,
        "saturation": 0
      }
    }

**Intervalos do HTML:** length/width/wingSpan/canopy = **0,78 a 1,22** em passo **0,01**; glow = **0 a 2**; saturation = **−0,38 a +0,38**. O estilo é indexado pelo campo style = “D”. Geometria/proporções são guardadas **por nave**, não redefinidas ao trocar a direção visual; os controles da D **não** são sliders independentes de toonBands, retícula, contorno ou cores vetoriais. Não apresentar esses valores visuais fixos de shader como controles aprovados.

**Divergência documental explícita com o gate do GDD [101]:** a v6 oferece seis sliders de geometria/acabamento **compartilhados por nave** enquanto compara A–E; não possui conjuntos de sliders próprios e independentes para cada alternativa. A aprovação da **direção estética D** não equivale a aprovar essa exceção de interface nem dispensa o requisito de sliders independentes nos futuros protótipos de features. A geometria invariável entre estilos é um objetivo deliberado de comparação, mas a adequação do laboratório à política integral de prototipação continua sujeita a revisão específica.

**Operação:** abrir o HTML isoladamente em navegador compatível com WebGL; selecionar **D** ou a tecla **4**; selecionar nave; usar modos **Vitrine**, **Comparador A–E** ou **Galeria de 10 naves**; vistas ¾, topo, frente e traseira; rotação, órbita/zoom, inspeção de silhueta e grupos. O JSON pode ser copiado e aplicado com validação de versão, nave, estilo, modo, foco, vista e limites dos parâmetros.

## 6. Contrato de continuidade para protótipos futuros

1. **Fonte de verdade:** consultar sempre o GDD vigente, este registro e o HTML v6 aprovado **antes de propor a linguagem visual** de qualquer nova nave, cenário, efeito, interface ou material de G-MINUS. Em conflitos futuros, explicitar a divergência e solicitar decisão; não mudar a direção artística por interpretação tácita.
2. **Base de arte:** usar D — Toon Vector Flux — como **referência estética fixa**. Em protótipos de novos recursos, as três ou mais alternativas exigidas pelo GDD [101] devem explorar **variações do recurso em si**, mantendo a linguagem D, salvo pedido explícito de reabrir a escolha global do estilo.
3. **Naves e partes:** preservar silhueta reconhecível, contorno de tinta, iluminação posterizada e assinatura vetorial seletiva; permitir comparar geometrias com o mesmo acabamento D. Não promover automaticamente os quatro nomes de grupos do laboratório a regra de negócio.
4. **Pistas e ambientes:** demonstrar materiais de pista, arquitetura, neblina, sinais, boosters e bordas na mesma gramática de volumes e sombras ilustradas; respeitar a hierarquia de leitura e a diversidade de biomas do GDD. A iluminação/cor precisa ser testada no contexto, não inferida a partir do pedestal do laboratório.
5. **VFX e combate:** usar brilho e vetores como feedback legível para propulsão, colisões e ataques, sem ocultar posição, rumo, proximidade de rivais e riscos. **O protótipo 04 VFX permanece experimental**; seus presets não são aprovados por esta decisão.
6. **HUD/câmera/menus:** elementos próprios ainda precisam ser prototipados e aprovados; compatibilidade visual com D é requisito de coesão, mas **layout, tipografia, transições, perspectivas e números** não são fixados pelo HTML v6.
7. **Fidelidade à escolha:** apresentar comparativos com a opção D de referência (mesma nave/câmera/escala e condições visuais controladas) e descrever objetivamente discrepâncias; não “melhorar” os traços alterando silenciosamente a estética selecionada.
8. **Gate técnico-documental:** seguir GDD [101–104]: HTML utilizável, **três alternativas relevantes**, controles/sliders adequados para cada alternativa, importação/exportação de parâmetros, especificação da proposta, testes e aprovação expressa **antes de integrar recursos ao jogo**.
9. **Mudança de direção artística:** qualquer abandono de D ou mudança de gramática material depende de **nova autorização do responsável** e de registro rastreável que declare quais decisões anteriores estão substituídas.

## 7. Critérios visuais verificáveis para uma futura integração

**Inspeção comparativa:** (i) silhueta isolada e vista traseira; (ii) sombreamento toon ainda visível com emissões desligadas; (iii) contorno escuro contínuo sem explosão de espessura, inclusive em objetos pequenos; (iv) linhas vetoriais selecionadas e separadas do contorno de massa; (v) sinais e obstáculos legíveis contra naves em múltiplas cores; (vi) efeitos de velocidade sem perda de direção/posição de rivais; (vii) diferentes tamanhos e posições de câmera; (viii) compatibilidade com diferentes cenários, inclusive fundos não escuros; (ix) leitura em movimento e com múltiplas naves; (x) desempenho medido no hardware-alvo.

**Aceitação técnica ainda pendente:** produzir e aprovar testes de renderização do estilo D no **jogo real**, não apenas no laboratório; documentar custos de contorno, linhas, transparência, resolução de retícula, eventuais ajustes de escala e diferenças de shader/engine. Alterações que prejudiquem aparência aprovada exigem apresentação de alternativas antes da implementação.

## 8. Estado de verificação e alterações não realizadas

- **Verificação estática da fonte enviada:** sintaxe JavaScript validada; construtores das dez geometrias executados em teste isolado de Node.js, com dez assinaturas distintas e dados finitos; variação de comprimento testada e detectada na geometria. O estilo não é argumento do gerador geométrico v6.
- **Verificação da cópia integral:** SHA-256 do arquivo anexado e SHA do blob Git conferidos antes da publicação.
- **Validação de navegador/WebGL:** **não concluída neste ambiente**. O Chromium de teste bloqueou o contexto WebGL, impossibilitando certificar shader, screenshot fiel, desempenho ou interação gráfica completa em navegador. A checagem sintática/geométrica não substitui essa etapa.
- **Não realizados por esta aprovação:** adaptação de shader a Three.js, integração em Vehicle.ts, alterações nos modelos do jogo, novas pistas, física, combate, efeitos, mudanças nas dependências ou alteração dos protótipos legados.

**Em caso de dúvida de interpretação visual, a referência primária é a opção D do HTML v6 preservado e a decisão explícita do responsável; este documento traduz a referência em critérios para trabalho posterior, sem alegar aprovações que não aconteceram.**
