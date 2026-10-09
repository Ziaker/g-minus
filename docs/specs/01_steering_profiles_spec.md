# Especificação Técnica — Protótipo 01: Laboratório Completo de Física, Combate e IA

**Status:** Laboratório de Prototipação e Especificação Técnica Integrada (GDD Seções 1 a 11).  
**Data:** 2026-10-08  
**Arquivo do Protótipo:** `prototypes/01_steering_profiles.html`  
**Referência GDD:** Itens [21] (3 Perfis de Direção), [22] (Instabilidade em Alta Velocidade), [23] (Auto-estabilização ao soltar), [24] (Mecânica de Drift e Inércia), [26] (Airbrakes <kbd>Q</kbd>/<kbd>E</kbd>), [31–40] (Escudo, Boost, Pit Zones, Dash Plates), [41–50] (Side-Attack, Spin Attack, Clash Duel Mashing), [51–60] (Grid de IA e K.O.s), [61–70] (Circuitos e Tubo Zero-G), [91–94] (Câmeras Múltiplas e FOV dinâmico) e [101–102] (Telemetria, Controle de Tempo e Exportação JSON).

---

## 1. Visão Geral do Laboratório de Prototipação

O arquivo `prototypes/01_steering_profiles.html` é o ambiente de teste e calibração definitiva do **G-MINUS**. Ele reúne em uma única aplicação web interativa:

1. **Os 3 Perfis de Direção do GDD [21]:**
   * **Perfil A (Direto / Preciso - F-Zero GX):** Resposta imediata, sem rampa de atraso, tração firme nos trilhos.
   * **Perfil B (Progressivo / Suave - Filtro Dinâmico):** Rampa exponencial de aceleração angular para toques curtos vs longos.
   * **Perfil C (Inercial / Drift - F-Zero X):** Grande inércia lateral e transferência de massa, exigindo contra-esterço deliberado em curvas fechadas.
2. **Ambientes e Pistas:**
   * **Circuito 3D Neo-Tokyo:** Curvas fechadas, elevações e declives em alta velocidade.
   * **Reta de Ensaio Slalom:** Pista reta de 2600m com cones de referência para avaliar tempo de resposta isolado.
   * **Tubo Zero-G (Cilíndrico):** Pista tubular fechada em 360° para testar condução invertida e giros de câmera.
3. **Mecânicas de Combate Físico e Manobras:**
   * **Side-Attack (<kbd>Q</kbd> / <kbd>E</kbd>):** Deslocamento lateral explosivo para arremessar oponentes contra guardrails.
   * **Spin Attack (<kbd>Z</kbd> / <kbd>SHIFT</kbd>):** Rotação radial em 360° que repele múltiplos adversários ao redor.
   * **Clash Duel [GDD 45]:** Disputa de colisão mashing entre duas naves em alta velocidade com indicador visual de equilíbrio de força.
4. **Sistema de Grid & IA Configurável:**
   * Slider de 0 a 29 rivais simultâneos na pista.
   * Colisões físicas entre veículos, perda de escudo e contagem de K.O.s.
5. **Boost, Escudo & Elementos de Pista:**
   * Super Boost (<kbd>ESPAÇO</kbd>) com consumo de blindagem.
   * Dash Plates (placas amarelas de aceleração instantânea).
   * Pit Recharge Strips (faixas de recarga de escudo neon verde).
6. **Múltiplas Perspectivas de Câmera (<kbd>C</kbd>):**
   * Câmera de Perseguição Dinâmica (Chase Cam com FOV proporcional à velocidade).
   * Câmera Cockpit / Primeira Pessoa.
   * Câmera Orbital 360° para inspeção estética das naves e peças.
7. **Áudio Procedural Web Audio API:**
   * Síntese de motor em tempo real com pitch por velocidade, sons de impacto, boost e recarga.
8. **Controle de Tempo e Telemetria Completa:**
   * Slider de Time Scale (0.1x Slow-Mo a 2.0x Fast-Forward) e Pausa (<kbd>P</kbd>).
   * Importação e Exportação de Configurações em JSON com cópia em 1 clique.

---

## 2. Parâmetros e Intervalos de Calibração

| Parâmetro | Tipo / Range | Default (A) | Descrição |
| :--- | :---: | :---: | :--- |
| `steerRate` | 20 a 120 | 65 | Força base de esterço lateral. |
| `progressivity` | 1.0 a 3.5 | 1.0 | Expoente da curva de resposta temporal ao segurar a direção. |
| `inertia` | 5 a 80 | 18 | Massa inercial da nave durante mudanças de direção. |
| `grip` | 30% a 100% | 92% | Aderência dos repulsores da nave contra derrapagem. |
| `recenter` | 1.0 a 25.0 | 14.0 | Velocidade de auto-estabilização ao soltar os controles. |
| `speedInstability` | 0.0 a 1.0 | 0.15 | Taxa de perda de aderência quando a velocidade supera a marca base. |
| `sideAttackForce` | 80 a 350 | 190 | Impulso lateral gerado pelo golpe de Side-Attack (<kbd>Q</kbd>/<kbd>E</kbd>). |

---

## 3. Tabela Completa de Comandos

| Tecla / Atalho | Ação no Protótipo |
| :--- | :--- |
| <kbd>W</kbd> / <kbd>↑</kbd> | Acelerar nave |
| <kbd>S</kbd> / <kbd>↓</kbd> | Frear nave |
| <kbd>A</kbd> / <kbd>←</kbd> | Esterço para a Esquerda |
| <kbd>D</kbd> / <kbd>→</kbd> | Esterço para a Direita |
| <kbd>Q</kbd> | Side-Attack / Airbrake para a Esquerda |
| <kbd>E</kbd> | Side-Attack / Airbrake para a Direita |
| <kbd>Z</kbd> / <kbd>SHIFT</kbd> | Spin Attack 360° em área |
| <kbd>ESPAÇO</kbd> | Super Boost (consome escudo) |
| <kbd>C</kbd> | Alternar perspectiva de câmera (Perseguição / Cockpit / Órbita) |
| <kbd>R</kbd> | Reposicionar / Resetar posição na pista |
| <kbd>P</kbd> | Pausar / Despausar simulação |
