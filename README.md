# G-MINUS // Sci-Fi 3D Combat Anti-Gravity Racing

Jogo de corrida e combate antigravidade 3D em terceira pessoa inspirado em **F-Zero**, desenvolvido em **TypeScript** com **Three.js** e **Vite**, projetado para rodar direto no navegador e pronto para deploy automático no **GitHub Pages**.

---

## 🚀 Como Jogar / Executar Localmente

1. **Instalar dependências**:
   ```bash
   npm install
   ```
2. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
3. Abra no navegador em `http://localhost:3000` (ou a porta informada pelo Vite).

---

## 🎮 Controles

| Ação | Teclado | Mouse |
| :--- | :--- | :--- |
| **Acelerar / Frear** | `W` / `S` ou `↑` / `↓` | - |
| **Curva / Direção** | `A` / `D` ou `←` / `→` | - |
| **Side-Attack (Ataque Lateral / Giro)** | `Q` / `E` ou duplo-toque em `A`/`D` | - |
| **Disparo de Plasma (Canhão)** | `J` | Botão Esquerdo do Mouse |
| **Super Boost (Gasta Escudo)** | `ESPAÇO` | - |

---

## ⚡ Mecânicas Implementadas (Protótipo Base)

- **Física Antigravidade 3D**: Flutuação suave sobre a pista, inclinação dinâmica (*banking roll*), inércia lateral e atrito aerodinâmico.
- **Pista 3D Tridimensional Fechada**: Circuito em *Catmull-Rom spline* com elevações, curvas fechadas, declives e barreiras de contenção com detecção de colisão.
- **Combate de Naves**:
  - **Ataque Lateral (*Side Attack / Spin*)**: Aceleração súbita lateral com rotação que causa dano massivo e arremessa naves rivais para fora da trajetória.
  - **Canhões de Plasma**: Projéteis duplos com detecção de impacto e efeito de faíscas.
  - **Colisão e Impulso**: Choques entre veículos e nas paredes com impacto e perda de velocidade/escudo.
  - **Contador de Abates (Kills)**: Destrua os rivais para pontuar no HUD.
- **Sistema de Energia F-Zero (Shield / Boost)**:
  - Usar o Boost aumenta a velocidade mas drena o escudo.
  - Pistas contam com **Pit Strip (faixa verde fluorescente)** que recarrega os escudos em tempo real.
  - **Pads de Boost (setas amarelas)** espalhadas pelo circuito para impulsos instantâneos.
- **Câmera Dinâmica em 3ª Pessoa**: Câmera de perseguição com FOV dinâmico que se abre conforme a velocidade ultrapassa 1000 km/h e tremores (*screen shake*) em impactos.
- **Áudio Sintetizado Procedural (Web Audio API)**: Sons de turbina com pitch dinâmico, tiros de plasma, ativação de boost, impactos metálicos e explosões com **zero arquivos externos** (garante carregamento instantâneo no GitHub Pages sem erro de CORS/404).
- **IA de Rivais**: Naves oponentes que disputam a liderança e reagem no circuito.

---

## 🌐 Publicação no GitHub Pages

O projeto já está configurado com `base: './'` no [vite.config.ts](file:///c:/Users/zerke/OneDrive/%C3%81rea%20de%20Trabalho/G%20Minus/vite.config.ts) e possui uma automação pronta em [.github/workflows/deploy.yml](file:///c:/Users/zerke/OneDrive/%C3%81rea%20de%20Trabalho/G%20Minus/.github/workflows/deploy.yml):

1. Crie um repositório no GitHub.
2. Faça o push dos arquivos:
   ```bash
   git init
   git add .
   git commit -m "feat: prototipo inicial F-Zero combat racing"
   git remote add origin <URL_DO_SEU_REPOSITORIO>
   git push -u origin main
   ```
3. No GitHub, acesse **Settings > Pages** e certifique-se de que a fonte está definida como **GitHub Actions**. O jogo será publicado automaticamente em sua URL pública do Pages!
