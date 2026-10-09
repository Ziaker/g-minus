# Especificação Técnica — Protótipo 01: Perfis de Direção e Dinâmica Lateral

**Status:** Proposta de Protótipo e Especificação conforme GDD (Seção 3 [21–30]).  
**Data:** 2026-10-08  
**Arquivo do Protótipo:** `prototypes/01_steering_profiles.html`  
**Referência GDD:** Itens [21] (3 Perfis de Direção), [22] (Instabilidade por Velocidade), [23] (Auto-estabilização ao soltar), [24] (Mecânica de Drift e Inércia) e [26] (Airbrakes <kbd>Q</kbd>/<kbd>E</kbd>).

---

## 1. Objetivo do Protótipo

Validar em ambiente isolado e interativo as três abordagens de pilotagem para o **G-MINUS**, permitindo testar em tempo real em traçado sinuoso e pista reta de testes, com telemetria de ângulo de derrapagem (*slip angle*), aceleração lateral (*G-force*), estado de aderência e exportação/importação de parâmetros em formato JSON.

---

## 2. Sistema de Coordenadas e Referencial da Pista

Para garantir a coerência tridimensional sem inversão de eixos, a nave e a câmera utilizam o referencial ortonormal dextrógiro da curva da pista (Frenet-Serret ajustado):

$$\vec{T} = \text{Tangente normalizada da curva (Direção de avanço)}$$
$$\vec{B} = \frac{\vec{up} \times \vec{T}}{\|\vec{up} \times \vec{T}\|} \quad (\text{Vetor lateral direito: } +X)$$
$$\vec{N} = \frac{\vec{T} \times \vec{B}}{\|\vec{T} \times \vec{B}\|} \quad (\text{Vetor normal superior da pista: } +Y)$$

* **Posicionamento:** $\vec{P}_{\text{nave}} = \vec{P}_{\text{pista}}(t) + \vec{B} \cdot \text{lateralOffset} + \vec{N} \cdot h_{\text{hover}}$
* **Direção dos Comandos:**
  * Pressionar <kbd>A</kbd> / Seta Esquerda: $\text{steerDir} < 0 \implies$ deslocamento em $-\vec{B}$ (**Esquerda da tela**).
  * Pressionar <kbd>D</kbd> / Seta Direita: $\text{steerDir} > 0 \implies$ deslocamento em $+\vec{B}$ (**Direita da tela**).
* **Inclinação de Asa (*Banking Roll*):**
  * Curva para a esquerda: rotação positiva no eixo Z local (asa esquerda desce, asa direita sobe).
  * Curva para a direita: rotação negativa no eixo Z local (asa direita desce, asa esquerda sobe).

---

## 3. Os 3 Perfis de Direção Propostos

### Perfil A: Resposta Direta / Precisa (Arcade F-Zero GX)
* **Conceito:** Resposta instantânea aos comandos digitais, sem atraso perceptível de esterço. Aderência alta que mantém a nave nos trilhos da trajetória desejada.
* **Parâmetros Base:**
  * `steerRate`: 65
  * `progressivity`: 1.0 (Linear, sem rampa de atraso)
  * `inertia`: 18 (Baixa inércia lateral)
  * `grip`: 92% (Aderência firme)
  * `recenter`: 14.0 (Auto-centralização vigorosa ao soltar os direcionais)
  * `speedInstability`: 0.15 (Perda sutil de tração em velocidade máxima)
  * `airbrakeForce`: 40

### Perfil B: Progressivo / Suave (Filtro Dinâmico)
* **Conceito:** A taxa de esterço aumenta progressivamente conforme a tecla é mantida pressionada. Permite ajustes finos em toques rápidos e curvas amplas em toques longos.
* **Parâmetros Base:**
  * `steerRate`: 52
  * `progressivity`: 2.2 (Rampa exponencial de entrada)
  * `inertia`: 28 (Inércia moderada)
  * `grip`: 85%
  * `recenter`: 9.0
  * `speedInstability`: 0.30
  * `airbrakeForce`: 55

### Perfil C: Inercial / Drift (F-Zero X Clássico)
* **Conceito:** Nave pesada com grande inércia lateral. Em alta velocidade, curvas fechadas causam derrapagem controlada (*slip angle* acentuado), exigindo contra-esterço e uso ativo de airbrakes (<kbd>Q</kbd>/<kbd>E</kbd>) para dominar a curva.
* **Parâmetros Base:**
  * `steerRate`: 75
  * `progressivity`: 1.4
  * `inertia`: 55 (Alta inércia com transferência de massa)
  * `grip`: 68% (Quebra de tração mais fácil)
  * `recenter`: 4.5 (Permite manter o ângulo de drift)
  * `speedInstability`: 0.60 (Forte influência da velocidade na perda de grip)
  * `airbrakeForce`: 80 (Airbrakes vitais para ancorar a traseira)

---

## 4. Controles do Protótipo

| Tecla | Função |
| :--- | :--- |
| <kbd>W</kbd> / <kbd>↑</kbd> | Aceleração |
| <kbd>S</kbd> / <kbd>↓</kbd> | Freio |
| <kbd>A</kbd> / <kbd>←</kbd> | Esterço para a Esquerda |
| <kbd>D</kbd> / <kbd>→</kbd> | Esterço para a Direita |
| <kbd>Q</kbd> | Airbrake Esquerdo (arrasto e torque lateral à esquerda) |
| <kbd>E</kbd> | Airbrake Direito (arrasto e torque lateral à direita) |
| <kbd>Espaço</kbd> | Boost de Teste |
| <kbd>R</kbd> | Reiniciar posição na pista |

---

## 5. Telemetria e Indicadores do HUD

1. **Velocidade:** Apresentada em KM/H e unidades/segundo.
2. **Slip Angle (°):** Diferença angular entre o vetor de movimento real da nave e o eixo longitudinal do veículo.
3. **G-Force:** Estimativa da força centrífuga lateral suportada pela nave.
4. **Estado de Aderência:**
   * `TRAÇÃO TOTAL`: Desvio lateral mínimo ($< 4^\circ$).
   * `SLIP MODERADO`: Início de deslizamento ($4^\circ - 9^\circ$).
   * `DRIFT CONTROLADO`: Ângulo ideal de derrapagem ($9^\circ - 18^\circ$).
   * `OVERSTEER / DERRAPAGEM`: Perda acentuada de tração ($> 18^\circ$).
