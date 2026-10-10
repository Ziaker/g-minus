# Especificação Técnica — Protótipo 02: Visual Modular e Opções de Design das 3 Primeiras Naves

> **Atualização de decisão (09/10/2026):** este documento descreve o laboratório histórico com alternativas A/B/C e não registra aprovação dessas alternativas. A direção estética global **D — Toon Vector Flux** foi posteriormente aprovada no [registro de aprovação](02_toon_vector_flux_approval.md), referenciado pelo novo [protótipo WebGL v6](../../prototypes/02_ship_visuals_v6_webgl.html). Esta especificação histórica permanece preservada para rastreabilidade.


**Status:** Especificação Técnica de Direção Visual e Prototipação Modular (GDD Seções 8, 9, 11 [71–78, 81–90, 101]).  
**Data:** 2026-10-09  
**Arquivo do Protótipo:** `prototypes/02_craft_visuals.html`  
**Referência GDD:** Itens [71] (Modelos de Naves e Paletas), [72, 78] (4 Peças Modulares Intercambiáveis e Pinturas), [74] (Impacto Visual de Tamanho/Massa), [81] (Estilo Anime 3D / Low-Poly / Outlines Pretos), [88] (Materiais e Cel-Shading), [89] (Silhueta e Identidade Própria) e [101] (Gate de Prototipação com 3 Opções e Serialização JSON).

---

## 1. Visão Geral do Protótipo 02

O arquivo `prototypes/02_craft_visuals.html` é o laboratório dedicado à **validação visual e arquitetura modular** das 3 primeiras máquinas selecionáveis do **G-MINUS**:

1. **Blue Falcon** (Piloto: Captain Falcon — Interceptador Equilibrado)
2. **Golden Fox** (Piloto: Dr. Stewart — Máquina de Arrancada Ultraleve)
3. **Wild Goose** (Piloto: Pico — Aríete de Combate Pesado / Tanque Blindado)

Cada veículo é construído estritamente sobre a arquitetura de **4 Peças Modulares Independentes** [GDD 72, 78] e pode ser visualizado em **3 Opções de Estilo Arquitetural Distintas** [GDD 101].

---

## 2. As 3 Opções Visuais do Protótipo

### 🎨 Opção A: "Retro-Anime GX Classic" (Estilo Anime Cel-Shaded)
- **Inspiração:** Animes de corrida e Mecha do final dos anos 90 e estética clássica de F-Zero GX.
- **Características:**
  - Silhuetas aerodinâmicas clássicas em forma de cunha e dardo.
  - Contornos pretos expressivos (*Inverted Hull Outlines*).
  - Iluminação *Toon Shading* em bandas de iluminação rígidas.
  - Cores sólidas saturadas com chassi grafite escuro e plumas de plasma em cone cônico limpo.

### ⚡ Opção B: "Cyberpunk Cyber-Vector" (Alta Tecnologia & Dutos Néon)
- **Inspiração:** Cyberpunk japonês moderno, protótipos de caças de 6ª geração e *Wipeout HD*.
- **Características:**
  - Placas de compósito de fibra de carbono em camadas escalonadas.
  - Conduítes e guias de energia néon expostas nas arestas.
  - Canópia facetada em polígonos furtivos (*stealth*) com reflexos polarizados.
  - Asas de enflechamento invertido com pods de estabilização anti-gravidade e tubeiras vetoriais quádruplas.

### 🛡️ Opção C: "Heavy Armored Mecha Predator" (Blindagem Pesada & Combate Físico)
- **Inspiração:** Armaduras Mecha militares, aríetes blindados e estética agressiva de combate veicular.
- **Características:**
  - Proa reforçada com pinças duplas e lâminas de absorção de choque para abalroamento.
  - Cabine em cápsula blindada tipo viseira com fresta de observação de alta densidade.
  - Blindagens laterais de impacto espessas para *Side-Attacks* devastadores.
  - Bocais de exaustão industrial de grande calibre com anéis de pós-combustão energética.

---

## 3. As 4 Peças Modulares por Nave

Cada máquina é composta por 4 grupos geométricos com origem local compatível para montagem e troca:

| Peça Modular | Blue Falcon | Golden Fox | Wild Goose |
| :--- | :--- | :--- | :--- |
| **Peça 1: Proa / Bico (`Piece1_Nose`)** | Fuselagem afunilada em flecha com tomadas de ar laterais | Bico em agulha super-alongado com canards de estabilização | Focinho chato de aríete blindado com placas de titânio |
| **Peça 2: Cabine / Cockpit (`Piece2_Cockpit`)** | Canópia em gota com espinha dorsal aerodinâmica | Canópia esférica compacta ultra-aerodinâmica | Cápsula semi-embutida reforçada com blindagem lateral |
| **Peça 3: Asas / Chassi (`Piece3_Wings`)** | Asas delta enflechadas + estabilizadores verticais em ângulo | Asas finas de alta velocidade com winglets levantados | Asas retangulares pesadas com saias blindadas de colisão |
| **Peça 4: Motores / Propulsão (`Piece4_Engines`)** | Turbinas duplas de titânio com plumas de plasma azul/ciano | Propulsor duplo fino de alta pressão com plumas douradas | Bloco de propulsão pesado com saídas quadradas de grande porte |

---

## 4. Parâmetros e Sliders de Calibração Visual

| Parâmetro | Intervalo | Default | Descrição |
| :--- | :---: | :---: | :--- |
| `outlineThickness` | 0.0 a 5.0 | 2.0 | Espessura do contorno preto estilizado (*cel outline*). |
| `celBands` | 2 a 8 | 4 | Quantidade de níveis de iluminação no *Toon Shading*. |
| `roughness` | 0.0 a 1.0 | 0.25 | Rugosidade do material da pintura. |
| `metalness` | 0.0 a 1.0 | 0.85 | Grau metálico do casco. |
| `plasmaLength` | 0.5x a 3.0x | 1.8x | Extensão das chamas de plasma das tubeiras de escape. |
| `plasmaIntensity` | 0.5x a 4.0x | 2.2x | Brilho e emissividade do núcleo de plasma. |
| `wingSpan` | 0.6x a 1.6x | 1.0x | Escala de envergadura e largura das asas. |
| `wingDihedral` | -30° a +30° | 0° | Ângulo de inclinação diedro das asas. |
| `canopyOpacity` | 0.1 a 1.0 | 0.95 | Opacidade da canópia do cockpit. |
| `explodedOffset` | 0.0m a 10.0m | 0.0m | Separação física das 4 peças para montagem e inspeção. |
| `hoverHeight` | 0.5m a 3.0m | 1.35m | Altura do repulsor anti-gravidade em relação ao piso. |
| `hoverBobSpeed` | 0.0 a 5.0 | 2.5 | Frequência de oscilação vertical da flutuação. |

---

## 5. Ferramentas Interativas do Laboratório

1. **Visão Explodida (*Exploded View*)**: Slider que desmonta a nave em tempo real, afastando o Bico para frente ($+Z$), o Cockpit para cima ($+Y$), as Asas para as laterais ($\pm X$) e os Motores para trás ($-Z$), com linhas de laser de alinhamento estrutural.
2. **Câmera Orbital 360° e Foco por Peça**: Modos de inspeção para focar a câmera no conjunto completo ou isoladamente em cada uma das 4 peças.
3. **Ambientes de Iluminação (*Studio Lighting*)**:
   - *Neo Cyber Studio* (Plataforma néon com iluminação de borda ciano/magenta).
   - *Deep Orbital Void* (Espaço profundo com estrelas e luz solar direcional de alto contraste).
   - *Solar Sunset Bay* (Pôr do sol com iluminação âmbar/dourada).
4. **Customização de Cores**: Seletores de Cor Primária, Secundária (Accent), Vidro do Cockpit, Metal do Chassi e Cor do Plasma.
5. **Importação/Exportação JSON**: Serialização em JSON com botão de cópia em 1 clique e aplicação instantânea de código configurado.
