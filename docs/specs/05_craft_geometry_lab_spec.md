# Especificação Técnica — Protótipo 05: Laboratório de Geometria das Três Primeiras Naves

**Status:** **NOVE GEOMETRIAS APROVADAS em 10/10/2026** (baseline = valores padrão) — [registro de decisão](../decisions/2026-10-10-prototype-05-craft-geometry-approval.md). Não integrado ao jogo.
**Data:** 2026-10-10
**Arquivo do protótipo:** [`prototypes/05_craft_geometry_lab.html`](../../prototypes/05_craft_geometry_lab.html) (HTML autônomo, WebGL 1 nativo, sem dependências externas).
**Testes:** [`tests/craft_geometry_lab.test.mjs`](../../tests/craft_geometry_lab.test.mjs).
**Capturas em navegador real:** [`docs/captures/05_craft_geometry_lab/`](../captures/05_craft_geometry_lab/).
**Fontes normativas consultadas:** [GDD](../GDD.md) [71–80, 81–90, 101–104]; [registro de aprovação D — Toon Vector Flux](02_toon_vector_flux_approval.md); [protótipo WebGL v6](../../prototypes/02_ship_visuals_v6_webgl.html); históricos [02_ship_visuals_spec](02_ship_visuals_spec.md) e [02_craft_visual_spec](02_craft_visual_spec.md); [`src/game/Vehicle.ts`](../../src/game/Vehicle.ts) e [`src/game/Game.ts`](../../src/game/Game.ts) (roster).

---

## 1. Objetivo e limites

Oferecer ao responsável **nove propostas geométricas 3D** — três alternativas (A, B, C) para cada uma das três primeiras naves (`falcon`, `fox`, `goose`) — para que ele possa examinar, ajustar, comparar e decidir o que manter, modificar, combinar ou rejeitar.

**Dentro do escopo:** geometria tridimensional, proporções, organização em quatro grupos visuais provisórios, inspeção (órbita, vistas técnicas, silhueta, neutro, grupos), comparação A/B/C e galeria de nove, sliders independentes por alternativa, JSON versionado, diagnóstico técnico básico.

**Fora do escopo (não alterado):** física, combate, IA, corridas, balanceamento, atributos de veículos, modelos usados por `src/game`, as outras sete naves, regras de peças intercambiáveis, VFX do Protótipo 04, dependências do projeto. Nenhum arquivo de `src/` foi modificado.

## 2. Direção estética (aprovada anteriormente) e como foi preservada

A direção **D — Toon Vector Flux** está aprovada como linguagem estética ([registro](02_toon_vector_flux_approval.md)). Neste laboratório A/B/C são **arquiteturas de nave**, nunca estilos: não existe seletor de direção artística, e o JSON rejeita qualquer `artDirection` diferente de `D-TOON-VECTOR-FLUX`.

O passe de renderização é uma adaptação direta do caminho `u_style==3` do HTML v6 (mesma tecnologia: WebGL 1 nativo com shaders próprios — não foi necessário Three.js):

| Elemento D | v6 | Protótipo 05 |
| :--- | :--- | :--- |
| Sombra posterizada | `floor((.25+.78·N·L)·3.2)/3`, cor × (0,44 + 1,18·degrau) | idêntico |
| Retícula | célula 5 × 5 px de fragmento, raio 1,35, −14 % na sombra | idêntico |
| Rim | `vec3(.19,.06,.15)·rim·0,54` | idêntico |
| Emissões (energia/marcação) | `+vec3(.19,.34,.30)` | idêntico |
| Gama | `pow(c, .82)` | idêntico |
| Contorno de tinta | casca expandida 0,032 u, face frontal descartada, cor `(.025,.036,.087)` | idêntico (padrão “v6”) |
| Arestas vetoriais | linhas magenta `(1,.22,.61)`, opacidade 0,46, comprimento ≥ 0,4, diedro com cos ≤ 0,80, vidro e faixas excluídos, deslocamento 0,012 | idêntico |
| Paleta | pintura = mistura 55 % da cor da nave com rosa `(.96,.37,.68)`; secundária = 68 % para violeta escuro; acento ciano `(.44,.98,.96)`; estrutura, vidro, energia âmbar e marcação | idêntico |
| Luz / vista | `L=(.45,.93,.64)`, `V=(.31,.65,.73)` fixas no mundo | idêntico (padrão “Fixa”) |
| Fundo / pódio | `(.035,.034,.083)`; disco + anéis ciano/magenta | idêntico |

Validação: as constantes acima são verificadas por teste de regressão; a aparência foi verificada em navegador real (seção 11).

## 3. Situação das geometrias

> **Atualização de 10/10/2026:** as nove alternativas foram aprovadas (seção 14). O texto abaixo registra a situação durante a avaliação.

**Durante a avaliação, todas as nove alternativas eram propostas não aprovadas.** Implementação, testes ou capturas não constituem aprovação. As intenções da seção 4 são hipóteses de design. Valores e intervalos dos sliders são propostas técnicas do laboratório, não parâmetros aprovados.

Os desenhos históricos dos protótipos 02 (Dart / Needle / Ram etc.) **não** foram tratados como aprovados; as nove propostas foram construídas do zero, com liberdade explícita do responsável para não seguir os originais.

## 4. As nove alternativas

Identidades de origem (roster atual em `Game.ts`, `body · boost · grip`): Blue Falcon **B·C·B** (equilibrada/versátil), Golden Fox **D·A·D** (leve, aceleração), Wild Goose **A·B·C** (robusta, combate físico).

### 4.1 Blue Falcon

| | Nome | Conceito geométrico (hipótese) | Leitura superior · lateral · frontal |
| :---: | :--- | :--- | :--- |
| **A** | Lança Delta | Fuselagem única dominante com proa quinada (seção em losango, n=1,25→3,2), cabine em gota sobre espinha dorsal, asa delta com *strake* e pods de ponta, tomadas laterais, estabilizadores gêmeos inclinados, dupla propulsão, quilhas ventrais e placa inferior. | flecha delta contínua · fuselagem média com derivas · asa larga com derivas em V |
| **B** | Bi-Viga | Três corpos: cápsula curta e alta com bolha grande, duas vigas longas com motores e derivas convergentes, ponte alar, asas externas com pontas caídas e empenagem horizontal ligando as derivas, formando um vão vazado. | tridente com espaço negativo central · cauda alta em “portal” · três círculos de propulsão |
| **C** | Ponta de Flecha | Corpo sustentador lenticular de bordas cortantes, braços em chevron com pontas caídas, cabine facetada (6 lados) embutida, deriva dorsal única, banco de motores com três bocais retangulares, quilha inferior. | ponta de flecha recortada · perfil baixíssimo (≈1,2 u) · lâmina fina com bocais retangulares |

### 4.2 Golden Fox

| | Nome | Conceito geométrico (hipótese) | Leitura superior · lateral · frontal |
| :---: | :--- | :--- | :--- |
| **A** | Agulha | Fuselagem longa e fina (≈7,3 u de comprimento, 0,99 u de altura), proa-agulha, canards, pequena delta traseira com winglets, cabine recuada estilo dragster com tomada dorsal, motor axial dominante e dois boosters. | linha tensionada com massa atrás · perfil esguio · círculo central dominante |
| **B** | Ampulheta | Monocoque estreito entre aerofólio dianteiro em chevron (com placas e pilones) e conjunto traseiro largo: dois pods de propulsão em vigas + asa elevada de dois elementos em pilone; sidepods com bocas; cockpit aberto com santantônio. | ampulheta · asa traseira alta · dois pods externos |
| **C** | Kitsune | Corpo curto em gota, cabine avançada, asa de enflechamento negativo com aletas, duas “orelhas” dorsais inclinadas, motor único em duto anelar sustentado por três suportes. | X compacto · orelhas acima da cabine · anel circular |

### 4.3 Wild Goose

| | Nome | Conceito geométrico (hipótese) | Leitura superior · lateral · frontal |
| :---: | :--- | :--- | :--- |
| **A** | Aríete | Casco-caixa de laterais planas, arado frontal em V inclinado mais largo que o casco (com barras e “olhos” sensores), saias blindadas profundas com placa superior, cabine em fenda sob capô, bloco 2×2 de motores dentro de gaiola. | mais largo na frente · massa baixa e contínua · parede frontal com faixas |
| **B** | Tanque Flutuante | Casco central entre dois sponsons retangulares de comprimento total com para-choques maciços, pontes blindadas, placa “cow-catcher”, placas de convés, torre/cúpula com visor, escotilha e mastro; três motores (dois nos sponsons + central). | retângulo largo e uniforme com vãos · torre central · três bocais em linha |
| **C** | Ombreira | Casco em losango com espinha elevada (corcunda), ombreiras de impacto inclinadas com cravos (ponto mais largo no meio), presas inferiores, capô frontal que esconde a cabine, crista dorsal e trio de bocais em triângulo. | losango · corcunda alta · ombros salientes e triângulo de bocais |

### 4.4 Por que não são redundantes

- Cada alternativa tem **topologia de corpo diferente**: Falcon = corpo único / três corpos / corpo sustentador; Fox = fuso longo / monocoque com aerofólios / gota com duto; Goose = caixa com arado / casco + sponsons / losango com ombreiras.
- A **posição do ponto mais largo** muda: Falcon A meio-trás (asa), B traseira (vigas + asas), C pontas traseiras (chevron); Goose A frente (arado), B uniforme, C meio (ombreiras).
- A **propulsão** muda: 2 redondos / 2+1 em vigas / 3 retangulares; 1 dominante + 2 boosters / 2 pods externos / 1 em duto anelar; 2×2 em gaiola / 3 em linha / 3 em triângulo.
- **Teste objetivo:** silhuetas ortográficas rasterizadas (superior, frontal, lateral) na mesma escala; cada par A×B, A×C, B×C de cada nave precisa de IoU < 0,8 em ≥ 2 vistas e < 0,7 em ≥ 1 vista (seção 11).
- **Entre naves:** em silhueta e em material neutro, Fox é sempre a mais estreita/vazada, Goose a mais compacta e maciça, Falcon a de maior envergadura (ver `gallery_silhouette_top.png` e `gallery_neutral_34.png`).

## 5. Qualidade e construção geométrica

Gerador procedural próprio (sem arquivos de malha): lofts de seções superelípticas (expoente controla quina × arredondado × quadrado, com estreitamento de topo), placas chanfradas (técnica `poly` da v6 com espessura por vértice), prismas varridos com chanfro e cisalhamento (aríete em V), sólidos de revolução (anéis, lábios de bocal), bocais (carenagem + garganta escura + núcleo de energia), faixas gráficas conformadas às facetas. Faces planas (*flat shading*) dão o caráter facetado; normais suavizadas são guardadas à parte apenas para o modo de contorno “Contínuo/Estrutural”.

Garantias verificadas por teste para **todas** as alternativas, nos valores padrão, em cada extremo de cada slider, com todos os sliders no mínimo, todos no máximo e 12 combinações aleatórias por alternativa:

- toda forma sólida é uma **malha fechada e 2-manifold com orientação consistente** (cada aresta usada exatamente uma vez em cada sentido);
- **volume assinado positivo** (normais para fora — sem faces invertidas);
- posições, normais e normais de contorno **finitas**; simetria bilateral exata em X;
- as nove impressões digitais de malha são distintas.

Sobreposições entre peças são intencionais (encaixes embutidos); não há peças soltas sem contato. Contagens: 988 a 1872 triângulos por modelo (padrões).

## 6. Grupos visuais provisórios

Toda forma pertence a um de quatro grupos: **Proa (`nose`)**, **Cabine (`cockpit`)**, **Asas (`wings`)**, **Motores (`engines`)** — os mesmos rótulos provisórios da v6. Cascos longos são **divididos em segmentos** que compartilham exatamente o anel da junta (proa → cabine → seção traseira), o que permite isolar volumes e identificar encaixes sem refazer a nave. Convenção usada: superfícies aerodinâmicas (asas, derivas, empenagens, ombreiras, sidepods, vigas dianteiras) em *Asas*; seção traseira, bocais e vigas traseiras em *Motores*.

**Estes grupos não são as quatro peças intercambiáveis do GDD [72, 78]** — nomes, funções e regras dessas peças continuam pendentes. Não há troca de peças, atributos, massa ou customização funcional.

## 7. Parâmetros por alternativa

Cada alternativa tem **12 controles geométricos próprios** (mínimo exigido: 6), armazenados de forma independente (`params[nave][alternativa]`). Valores fora do intervalo são limitados no slider e **rejeitados** na importação JSON. “Grupos afetados” é verificado por teste: mover o slider altera ao menos um desses grupos e nenhum outro. No título de cada tabela, “caixa (L×A×C)” é largura × altura × comprimento da malha padrão. Unidades: *fator* = multiplicador adimensional; *unid.* = deslocamento nas unidades do laboratório (as mesmas da v6; a nave tem ≈ 5,5–7,3 u de comprimento); *°* = graus.

Acabamento global (não por alternativa, não geométrico, herdado da v6): `glow` 0–2 (padrão 1) e `saturation` −0,38–+0,38 (padrão 0).

<!-- tabelas geradas a partir do código do laboratório -->
##### Blue Falcon A — 1316 triângulos, 36 formas; caixa (L×A×C) 5.76 × 1.64 × 6.58 u; impressão 902a3acf

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento da fuselagem | 0.82 | 1.22 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura do casco central | 0.8 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura / espessura do casco | 0.75 | 1.35 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `noseLength` | Comprimento da proa | 0.7 | 1.45 | 1 | 0.01 | fator | Proa |
| `span` | Envergadura | 0.75 | 1.35 | 1 | 0.01 | fator | Asas |
| `sweep` | Enflechamento externo | 28 | 58 | 45 | 1 | ° | Asas |
| `dihedral` | Diedro das asas | -8 | 12 | 3 | 0.5 | ° | Asas |
| `cockpitSize` | Volume da cabine | 0.75 | 1.35 | 1 | 0.01 | fator | Cabine |
| `cockpitPos` | Posição da cabine | -0.5 | 0.6 | 0 | 0.01 | unid. | Cabine |
| `finHeight` | Altura dos estabilizadores | 0.6 | 1.5 | 1 | 0.01 | fator | Asas |
| `finCant` | Inclinação dos estabilizadores | 0 | 38 | 18 | 1 | ° | Asas |
| `engineSize` | Tamanho dos motores | 0.75 | 1.35 | 1 | 0.01 | fator | Motores |

##### Blue Falcon B — 1600 triângulos, 32 formas; caixa (L×A×C) 6.01 × 1.50 × 6.30 u; impressão 3b36297f

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento da cápsula | 0.82 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura da cápsula | 0.8 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura dos cascos | 0.75 | 1.35 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `noseLength` | Comprimento da proa | 0.7 | 1.4 | 1 | 0.01 | fator | Proa |
| `boomGap` | Afastamento das vigas | 1.05 | 1.8 | 1.32 | 0.01 | unid. | Asas, Motores |
| `boomLength` | Comprimento das vigas | 0.8 | 1.15 | 1 | 0.01 | fator | Asas, Motores |
| `span` | Envergadura externa | 0.7 | 1.4 | 1 | 0.01 | fator | Asas |
| `sweep` | Enflechamento externo | -15 | 45 | 22 | 1 | ° | Asas |
| `cockpitSize` | Volume da cabine | 0.8 | 1.35 | 1 | 0.01 | fator | Cabine |
| `cockpitPos` | Posição da cabine | -0.5 | 0.5 | 0 | 0.01 | unid. | Cabine |
| `tailHeight` | Altura da empenagem | 0.6 | 1.5 | 1 | 0.01 | fator | Asas |
| `engineSize` | Tamanho dos motores | 0.75 | 1.35 | 1 | 0.01 | fator | Motores |

##### Blue Falcon C — 988 triângulos, 26 formas; caixa (L×A×C) 5.82 × 1.20 × 6.53 u; impressão 8dea1899

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento do corpo | 0.82 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura do corpo central | 0.8 | 1.25 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Espessura do corpo | 0.75 | 1.4 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `noseLength` | Comprimento da proa | 0.7 | 1.4 | 1 | 0.01 | fator | Proa |
| `span` | Envergadura dos braços | 0.8 | 1.25 | 1 | 0.01 | fator | Asas |
| `sweep` | Enflechamento do chevron | 48 | 64 | 57 | 1 | ° | Asas |
| `tipDroop` | Queda das pontas | 0 | 80 | 40 | 1 | ° | Asas |
| `cockpitSize` | Volume da cabine | 0.75 | 1.35 | 1 | 0.01 | fator | Cabine |
| `cockpitPos` | Posição da cabine | -0.5 | 0.5 | 0 | 0.01 | unid. | Cabine |
| `dorsalFin` | Deriva dorsal | 0.3 | 1.4 | 1 | 0.01 | fator | Asas |
| `bankWidth` | Largura do banco de motores | 0.75 | 1.25 | 1 | 0.01 | fator | Motores |
| `engineSize` | Tamanho dos bocais | 0.75 | 1.35 | 1 | 0.01 | fator | Motores |

##### Golden Fox A — 1160 triângulos, 27 formas; caixa (L×A×C) 3.21 × 0.99 × 7.32 u; impressão 0f6edd34

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento da fuselagem | 0.85 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura da fuselagem | 0.8 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura da fuselagem | 0.8 | 1.35 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `noseLength` | Comprimento da agulha | 0.7 | 1.5 | 1 | 0.01 | fator | Proa |
| `span` | Envergadura | 0.75 | 1.35 | 1 | 0.01 | fator | Asas |
| `sweep` | Enflechamento | 38 | 58 | 50 | 1 | ° | Asas |
| `canard` | Tamanho dos canards | 0.4 | 1.5 | 1 | 0.01 | fator | Proa |
| `cockpitSize` | Volume da cabine | 0.75 | 1.35 | 1 | 0.01 | fator | Cabine |
| `cockpitPos` | Posição da cabine | -0.6 | 0.6 | 0 | 0.01 | unid. | Cabine |
| `engineSize` | Motor principal | 0.75 | 1.35 | 1 | 0.01 | fator | Motores |
| `booster` | Boosters laterais | 0.5 | 1.5 | 1 | 0.01 | fator | Motores |
| `winglet` | Altura dos winglets | 0.3 | 1.5 | 1 | 0.01 | fator | Asas |

##### Golden Fox B — 1596 triângulos, 40 formas; caixa (L×A×C) 3.52 × 1.59 × 6.90 u; impressão 20f67adb

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento do monocoque | 0.85 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura do monocoque | 0.8 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura do monocoque | 0.8 | 1.35 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `noseLength` | Comprimento da proa | 0.6 | 1.5 | 1 | 0.01 | fator | Proa |
| `foilSpan` | Envergadura do aerofólio dianteiro | 0.7 | 1.35 | 1 | 0.01 | fator | Proa |
| `sidepod` | Volume dos sidepods | 0.6 | 1.4 | 1 | 0.01 | fator | Asas, Cabine |
| `podGap` | Afastamento dos pods | 1.2 | 1.9 | 1.45 | 0.01 | unid. | Motores, Asas |
| `podSize` | Tamanho dos pods/motores | 0.7 | 1.35 | 1 | 0.01 | fator | Motores |
| `rearWingHeight` | Altura da asa traseira | 0.3 | 1.4 | 0.9 | 0.01 | fator | Asas |
| `rearWingSpan` | Envergadura da asa traseira | 0.75 | 1.3 | 1 | 0.01 | fator | Asas |
| `cockpitSize` | Volume da cabine | 0.75 | 1.35 | 1 | 0.01 | fator | Cabine |
| `cockpitPos` | Posição da cabine | -0.5 | 0.5 | 0 | 0.01 | unid. | Cabine |

##### Golden Fox C — 1136 triângulos, 29 formas; caixa (L×A×C) 4.89 × 1.89 × 6.15 u; impressão c84e2916

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento do corpo | 0.85 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura do corpo | 0.8 | 1.25 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura do corpo | 0.8 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `noseLength` | Comprimento da proa | 0.6 | 1.5 | 1 | 0.01 | fator | Proa |
| `span` | Envergadura | 0.75 | 1.35 | 1 | 0.01 | fator | Asas |
| `forwardSweep` | Enflechamento negativo | 0 | 35 | 20 | 1 | ° | Asas |
| `earHeight` | Altura das orelhas | 0.4 | 1.5 | 1 | 0.01 | fator | Cabine |
| `earCant` | Abertura das orelhas | 0 | 40 | 22 | 1 | ° | Cabine |
| `cockpitSize` | Volume da cabine | 0.75 | 1.3 | 1 | 0.01 | fator | Cabine |
| `cockpitPos` | Posição da cabine | -0.5 | 0.4 | 0 | 0.01 | unid. | Cabine |
| `ringSize` | Diâmetro do duto/motor | 0.75 | 1.35 | 1 | 0.01 | fator | Motores |
| `ringLength` | Comprimento do duto | 0.6 | 1.5 | 1 | 0.01 | fator | Motores |

##### Wild Goose A — 1872 triângulos, 37 formas; caixa (L×A×C) 2.76 × 1.32 × 5.54 u; impressão 2dbc008a

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento do casco | 0.85 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura do casco | 0.85 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura do casco | 0.8 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `ramWidth` | Largura do aríete | 0.8 | 1.35 | 1 | 0.01 | fator | Proa |
| `ramSweep` | Abertura em V do aríete | 0 | 35 | 24 | 1 | ° | Proa |
| `ramRake` | Inclinação da face do aríete | 12 | 55 | 32 | 1 | ° | Proa |
| `armor` | Espessura da blindagem | 0.6 | 1.6 | 1 | 0.01 | fator | Proa, Asas |
| `skirtDepth` | Profundidade das saias | 0.5 | 1.5 | 1 | 0.01 | fator | Asas |
| `cockpitSize` | Volume da cabine | 0.75 | 1.3 | 1 | 0.01 | fator | Cabine |
| `cockpitPos` | Posição da cabine | -0.6 | 0.5 | 0 | 0.01 | unid. | Cabine |
| `engineSize` | Tamanho dos motores | 0.75 | 1.3 | 1 | 0.01 | fator | Motores |
| `rearScale` | Proporção traseira | 0.8 | 1.25 | 1 | 0.01 | fator | Motores |

##### Wild Goose B — 1668 triângulos, 33 formas; caixa (L×A×C) 3.78 × 1.70 × 5.99 u; impressão 05c4fe5d

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento do casco | 0.85 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura do casco central | 0.8 | 1.25 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura do casco | 0.8 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `sponsonSize` | Seção dos sponsons | 0.75 | 1.3 | 1 | 0.01 | fator | Asas, Motores, Proa |
| `sponsonGap` | Afastamento dos sponsons | 0 | 0.45 | 0.15 | 0.01 | unid. | Asas, Motores, Proa |
| `sponsonLength` | Comprimento dos sponsons | 0.85 | 1.12 | 1 | 0.01 | fator | Asas, Motores, Proa |
| `bumper` | Massa dos para-choques | 0.4 | 1.5 | 1 | 0.01 | fator | Proa |
| `armor` | Espessura da blindagem | 0.6 | 1.6 | 1 | 0.01 | fator | Asas, Motores |
| `turretSize` | Volume da torre/cabine | 0.75 | 1.3 | 1 | 0.01 | fator | Cabine |
| `turretPos` | Posição da torre | -0.6 | 0.6 | 0 | 0.01 | unid. | Cabine |
| `engineSize` | Motores dos sponsons | 0.75 | 1.3 | 1 | 0.01 | fator | Motores |
| `mainEngine` | Motor central | 0.7 | 1.35 | 1 | 0.01 | fator | Motores |

##### Wild Goose C — 1492 triângulos, 36 formas; caixa (L×A×C) 3.26 × 1.18 × 6.58 u; impressão 92d0c8f3

| Parâmetro (`id`) | Rótulo | Mín | Máx | Padrão | Passo | Unidade | Grupos afetados |
| :--- | :--- | ---: | ---: | ---: | ---: | :---: | :--- |
| `length` | Comprimento do casco | 0.85 | 1.2 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `width` | Largura do casco | 0.85 | 1.3 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `height` | Altura da corcunda | 0.8 | 1.35 | 1 | 0.01 | fator | Proa, Cabine, Asas, Motores |
| `noseLength` | Comprimento da proa | 0.5 | 1.5 | 1 | 0.01 | fator | Proa, Cabine |
| `shoulderSize` | Tamanho das ombreiras | 0.7 | 1.4 | 1 | 0.01 | fator | Asas |
| `shoulderCant` | Inclinação das ombreiras | 0 | 35 | 16 | 1 | ° | Asas |
| `shoulderPos` | Posição das ombreiras | -0.6 | 0.6 | 0 | 0.01 | unid. | Asas |
| `tuskLength` | Comprimento das presas | 0.3 | 1.5 | 1 | 0.01 | fator | Proa |
| `cockpitSize` | Volume da cabine | 0.75 | 1.3 | 1 | 0.01 | fator | Cabine |
| `cowlHeight` | Altura do capô | 0.4 | 1.5 | 1 | 0.01 | fator | Cabine |
| `engineSize` | Tamanho dos bocais | 0.75 | 1.3 | 1 | 0.01 | fator | Motores |
| `rearScale` | Proporção traseira | 0.8 | 1.25 | 1 | 0.01 | fator | Motores |

## 8. Câmera, vistas e modos

- **Órbita:** arrastar (yaw/elevação, elevação limitada a ±1,553 rad), roda = zoom (0,45–3 ×), duplo clique = enquadrar; com o canvas focado, setas e `+`/`−`. O alvo é o centro da caixa envolvente; a distância nunca fica abaixo de 1,12 × o raio envolvente, de modo que a câmera não atravessa a nave nem perde o enquadramento.
- **Enquadramento automático:** distância derivada do raio envolvente e do campo de visão horizontal/vertical do viewport.
- **Vistas técnicas:** ¾ frontal, Frente, Traseira, Perfil, Superior (proa para cima), Inferior. Selecionar uma vista zera o giro do modelo e pausa a rotação automática. Atalho `V` percorre as vistas.
- **Rotação automática:** opcional, desligada por padrão; gira o modelo (luz fixa no mundo, como na v6). Pausar = vista estática.
- **Comparação A·B·C:** três viewports (colunas, ou linhas em telas altas), **mesmo raio de referência, mesma distância, mesma luz, mesmo ângulo e mesmo giro sincronizado**; nenhuma nave é escalada para preencher seu quadro.
- **Galeria:** 3 × 3 (linhas = Falcon, Fox, Goose; colunas = A, B, C) com escala comum às nove.
- **Renderização:** *Toon Flux* (D completo), *Neutro* (mesma gramática D em cinzas, sem matiz, arestas em grafite), *Silhueta* (preenchimento plano escuro sobre fundo claro).
- **Grupos:** destacar (outros esmaecidos como na v6) ou isolar (outros ocultos).
- **Fundos de legibilidade:** Vitrine D, Claro, Cinza.
- **Diagnóstico (fora da v6, não aprovado):** luz que acompanha a câmera; contorno *Contínuo* (normais suavizadas) ou *Estrutural* (casca invertida com profundidade, gera contornos internos); pigmento “cor pura” (sem a mistura de 55 % com rosa). Os padrões reproduzem a v6.

Atalhos: `Q`/`W`/`E` nave, `1`–`3` alternativa, `M` modo, `V` vista, `R` rotação, `S` renderização, `0` reset de câmera.

## 9. Contrato JSON (versão 1)

```json
{
 "schema": "gminus.craft-geometry-lab",
 "schemaVersion": 1,
 "artDirection": "D-TOON-VECTOR-FLUX",
 "geometryApproval": "none",
 "selection": { "ship": "falcon", "variant": "A", "variants": { "falcon": "A", "fox": "A", "goose": "A" } },
 "params": { "falcon": { "A": { "length": 1, "...": 1 }, "B": { }, "C": { } }, "fox": { }, "goose": { } },
 "inspection": { "mode": "single", "view": "threeQuarter", "yaw": 0.62, "elev": 0.36, "zoom": 1, "autoRotate": false, "turntable": 0,
   "render": "flux", "background": "vitrine", "focus": "all", "focusMode": "highlight", "light": "fixed", "ink": "v6", "pigment": "v6" },
 "finish": { "glow": 1, "saturation": 0 }
}
```

- `selection.variants` guarda a alternativa ativa de **cada** nave; `selection.variant` (opcional) deve coincidir com a da nave ativa.
- `params` é **obrigatório e completo**: as três naves, as três alternativas e exatamente os 12 parâmetros de cada uma, números finitos dentro do intervalo.
- `inspection` e `finish` são opcionais; se presentes, são validados integralmente (enums, intervalos, booleanos).
- `geometryApproval` só aceita `"none"`. O valor **não** quer dizer que os modelos estejam desaprovados. Ele existe para que **nenhum arquivo JSON possa declarar uma aprovação por conta própria**. A aprovação das nove geometrias vale apenas pelo [registro de decisão](../decisions/2026-10-10-prototype-05-craft-geometry-approval.md) e é protegida pelos testes de impressão digital (item 14 da seção 11). Por isso o contrato JSON v1 não mudou: inclusive a [baseline aprovada](../decisions/2026-10-10-prototype-05-approved-baseline.json) é exportada com `"none"`.
- **Validação estrita:** chaves desconhecidas, ausentes, identificadores desconhecidos, alternativa fora de A/B/C, valores não finitos, nulos, strings ou fora do intervalo → rejeição completa com mensagem em português.
- **Atômica:** tudo é validado antes de alterar o estado; em erro, nada muda. Em sucesso, botões, sliders, título e o próprio campo JSON são ressincronizados.
- Interface: *Copiar JSON* (API de área de transferência → fallback `execCommand` → seleção manual), *Aplicar JSON*, *Ver estado atual* (descarta rascunho), *Baixar .json*. O indicador mostra “sincronizado” ou “rascunho não aplicado”.

## 10. Resets

| Comando | Afeta | Não afeta |
| :--- | :--- | :--- |
| Reset alternativa | 12 parâmetros da alternativa ativa | outras alternativas, naves, vista, acabamento |
| Reset nave (A/B/C) | parâmetros das três alternativas da nave ativa | outras naves, vista, acabamento |
| Restaurar configuração inicial completa | tudo (parâmetros das nove, seleção, inspeção, acabamento) | — exige **segundo clique de confirmação em até 5 s** |
| Reset câmera / Enquadrar | apenas câmera | parâmetros |

## 11. Testes e resultados (2026-10-10)

**Automatizados** (`npm test`, Node 25.8): **37/37 aprovados** — 20 regressões pré-existentes + 17 em `tests/craft_geometry_lab.test.mjs` (13 da avaliação + 4 adicionados com a aprovação de 10/10/2026, itens 14–17). Na avaliação, antes da aprovação, o resultado era 33/33.

1. três naves × três alternativas = nove combinações; quatro grupos;
2. nove malhas padrão fechadas, 2-manifold, volume positivo, finitas, simétricas, com formas nos quatro grupos;
3. nove impressões distintas; A/B/C de cada nave distintas por IoU de silhueta (superior/frontal/lateral);
4. ≥ 6 controles por alternativa, limites e padrões coerentes;
5. cada slider muda os grupos declarados e só eles; extremos individuais, todos-mín, todos-máx e 12 combinações aleatórias por alternativa geram malhas válidas;
6. independência e preservação ao trocar nave/alternativa (cenário obrigatório Falcon A → B → A), limitação de valores e rejeição de parâmetro alheio;
7. resets nos três níveis, inclusive confirmação em dois cliques;
8. exportação → importação reproduz nave, alternativa, nove conjuntos, inspeção e sincroniza interface e campo JSON;
9. 23 entradas inválidas rejeitadas com estado inalterado (sintaxe, esquema, versão, direção artística, aprovação presumida, nave/alternativa desconhecida, intervalo, tipos, ausências, extras, inspeção/acabamento inválidos, erro na última chave);
10. renderizador com **WebGL simulado** (apenas contagem de buffers/draw calls): todos os modos desenham; 40 ciclos de troca de nave/alternativa/modo/vista/parâmetro sem crescimento de buffers vivos (contagem = criados − excluídos);
11. sem WebGL: modal de falha e controles/JSON funcionando;
12. constantes do passe D da v6 presentes; nenhuma outra direção artística oferecida;
13. SHA-256 da v6 aprovada inalterado (`560f751d…`, com normalização de fim de linha) e nenhuma referência ao laboratório em `src/` ou `index.html`;
14. baseline aprovada: as nove impressões digitais padrão coincidem com as do registro de decisão;
15. selo da interface distingue baseline aprovada de variação exploratória;
16. protótipos `NN ≥ 06` que envolvem naves devem embutir o bloco `@gminus-approved-craft-geometry v1` sem alterações;
17. o JSON da baseline aprovada importa sem erro e reproduz exatamente os padrões.

**Build:** `npm run build` (tsc + Vite) concluído sem erros; o laboratório passa a ser emitido em `dist/prototypes/05_craft_geometry_lab.html` (104 kB).

**Visuais em navegador real (WebGL efetivo, não simulado):**

- Microsoft Edge headless via Chrome DevTools Protocol, `WebGL 1.0 (OpenGL ES 2.0 Chromium)`, viewport 1600 × 1000: capturas das nove alternativas em ¾, superior, traseira, perfil, inferior, frente; galeria em Toon Flux, Neutro e Silhueta; comparação A·B·C por nave; extremos (todos-mín/todos-máx). Evidências salvas em [`docs/captures/05_craft_geometry_lab/`](../captures/05_craft_geometry_lab/). As capturas são da avaliação, anterior à aprovação: por isso mostram o selo “proposta · geometria não aprovada”. A geometria aprovada é idêntica (mesmas impressões digitais).
- Navegador embutido do aplicativo (Chromium, WebGL real): cenário Falcon A → B → A com **cliques e teclado reais** nos sliders; aplicação de JSON inválido (rejeitado com mensagem, estado preservado) e válido (nave/alternativa/slider/título sincronizados); cópia com fallback; órbita por arrasto e zoom por roda; layout 375 × 812 sem rolagem horizontal e sem botões fora da tela.

**Defeitos encontrados e corrigidos durante a validação:** pódio opaco ocultava as naves na vista inferior (agora omitido quando a câmera está abaixo do plano); Goose B com visor em crescente (refeito como faixa horizontal); enquadramento cortava a Goose B na comparação ¾ (margem própria nos modos múltiplos); painel de diagnóstico cobria células da galeria e o palco em telas estreitas (movido, recolhido automaticamente); `affects` incorreto do `noseLength` da Goose C (corrigido, detectado pelo teste).

## 12. Dependências e limitações conhecidas

- Nenhuma dependência nova. WebGL 1 nativo; Three.js do projeto não é usado pelo laboratório.
- Linhas vetoriais usam `gl.LINES` (1 px; largura não controlável em WebGL), como na v6; em telas de alta densidade ficam mais finas.
- Retícula e espessura de contorno seguem os valores do protótipo v6 (5 px de fragmento; 0,032 u). Em miniaturas da galeria o contorno fica sutil — coerente com a referência, mas a ser recalibrado se/quando houver protótipo do jogo real.
- A paleta D da v6 mistura a cor de cada nave 55 % com rosa. Resultado: Falcon lilás, Fox salmão, Goose rosa-acinzentado com secundária verde-escura. **Divergência apresentada:** a identidade cromática documentada fica atenuada; a distinção entre naves continua garantida por geometria (silhueta/neutro). O modo diagnóstico “Cor pura” mostra a alternativa sem a mistura — **não aprovado**.
- **Divergência de roster:** as cores usadas são as da v6 (`#2468f6`, `#f8c32c`, `#218e54`), que diferem levemente das de `Game.ts` (`0x0044ff`, `0xf5b800`, `0x228b22`). Nenhuma cor oficial nova foi criada.
- FPS, tempo de CPU por quadro, draw calls e triângulos são **medidos no JavaScript**; não são métricas de GPU. A renderização é sob demanda: FPS só é contínuo com rotação/arrasto.
- Parâmetros vivem na memória da sessão (preservados ao trocar nave/alternativa/modo); recarregar a página restaura os padrões — use o JSON para guardar.
- Não testado: Firefox e Safari (WebGL 1 padrão, sem extensões, deve ser compatível); desempenho em hardware-alvo; leitura em movimento sobre pista.

## 13. Diferenças técnicas em relação ao WebGL v6

| Aspecto | v6 | Protótipo 05 |
| :--- | :--- | :--- |
| Objetivo | comparar 5 estilos sobre 10 geometrias fixas | comparar 3 geometrias por nave sobre 1 estilo fixo (D) |
| Estilos | A–E | somente D (sem seletor) |
| Sliders | 6 compartilhados por nave | 12 independentes por alternativa (108 no total) |
| Geometria | lofts elípticos, placas, aletas, tubos | + seções superelípticas, segmentação por grupo, varredura com cisalhamento, revolução, bocais compostos, faixas conformadas |
| Validação de malha | não havia | fechamento, orientação e volume testados |
| Câmera | órbita + 4 vistas, rotação do modelo | órbita + 6 vistas (inclui perfil e inferior), enquadramento automático, limites anti-atravessamento |
| Comparação | A–E de uma nave; galeria de 10 | A·B·C com escala comum; galeria 3 × 3 com escala comum |
| Inspeção | silhueta escura sobre fundo escuro | + modo Neutro, silhueta sobre fundo claro, isolar grupo, fundos alternativos |
| Pódio | sempre desenhado | omitido quando a câmera está abaixo do piso |
| Profundidade | — | `polygonOffset` no preenchimento (estabiliza arestas; sem mudança de cor) |
| Recursos GL | buffers por forma | lotes por grupo/papel, cache por alternativa, descarte ao reconstruir, perda/restauração de contexto |
| JSON | `schemaVersion: 6`, uma nave | `gminus.craft-geometry-lab` v1, nove conjuntos completos |

## 14. Decisões de aprovação

**Atualização de 10/10/2026 — APROVADO:** o responsável aprovou as **nove** geometrias ("aprovo todos os 9 designs"). A baseline aprovada é a configuração padrão (seção 7), com impressões digitais e JSON registrados no [registro de decisão](../decisions/2026-10-10-prototype-05-craft-geometry-approval.md).

**Blue Falcon**
- [x] A — Lança Delta: aprovada (`902a3acf`)
- [x] B — Bi-Viga: aprovada (`3b36297f`)
- [x] C — Ponta de Flecha: aprovada (`8dea1899`)

**Golden Fox**
- [x] A — Agulha: aprovada (`0f6edd34`)
- [x] B — Ampulheta: aprovada (`20f67adb`)
- [x] C — Kitsune: aprovada (`c84e2916`)

**Wild Goose**
- [x] A — Aríete: aprovada (`2dbc008a`)
- [x] B — Tanque Flutuante: aprovada (`05c4fe5d`)
- [x] C — Ombreira: aprovada (`92d0c8f3`)

**Configurações numéricas:** baseline = valores padrão da seção 7 ([JSON](../decisions/2026-10-10-prototype-05-approved-baseline.json)). Valores diferentes exigem nova aprovação.

**Regra obrigatória:** os próximos protótipos que envolvem estas naves devem embutir, sem alterações, o bloco `@gminus-approved-craft-geometry v1` deste laboratório e partir da baseline (verificado por teste).

**Ainda pendentes (fora deste escopo):**
- relação entre as três alternativas aprovadas e as naves jogáveis;
- estrutura definitiva das quatro peças intercambiáveis — GDD [72, 78];
- cores por peça e opção de cores aleatórias (diretriz registrada; exige protótipo próprio);
- paleta definitiva sob D;
- calibração de contorno/retícula no jogo real;
- geometrias das outras sete naves;
- integração em `src/game`.

## 15. Informações para implementação futura

- **Fonte única:** os construtores `falconA…gooseC` e o `Builder` produzem buffers planos (`positions`, `normals`, `onormals`) por forma, com `part` (grupo) e `role` (pintura, secundária, acento, estrutura, vidro, energia, marcação). Podem ser portados para `BufferGeometry` do Three.js sem mudar números.
- **Orientação:** +Z = proa, +Y = topo, X lateral; origem perto do centro de massa visual; unidades da v6. O jogo atual usa escala e pivô próprios em `Vehicle.ts` — a conversão deve ser registrada e testada.
- **Reprodutibilidade:** a impressão digital da malha (FNV) por alternativa e por grupo permite verificar que a integração reproduz exatamente a configuração aprovada.
- **Renderização:** reproduzir o passe D (seção 2) em Three.js exigirá `ShaderMaterial`/`onBeforeCompile` para posterização, retícula e rim, casca invertida para o contorno e `LineSegments` para arestas; validar contra capturas deste laboratório.
- **Grupos:** a segmentação em quatro grupos facilita futura modularidade, mas as peças definitivas exigem decisão própria.

## 16. Como abrir e usar

1. `npm install` (uma vez) e `npm run dev`; abrir `http://localhost:5173/prototypes/05_craft_geometry_lab.html`.
2. Alternativamente, abrir o arquivo `prototypes/05_craft_geometry_lab.html` diretamente no navegador (não há dependências externas).
3. Escolher nave (Falcon/Fox/Goose) e alternativa (A/B/C); usar *A · B · C* para comparar e *Galeria* para as nove; vistas técnicas, *Silhueta* e *Neutro* para julgar forma; ajustar sliders; exportar o JSON da configuração preferida.
