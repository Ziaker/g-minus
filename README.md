# ⚡ G-MINUS // Anti-Gravity High-Speed Racing

<p align="center">
  <strong>Jogo de corrida anti-gravidade 3D em alta velocidade inspirado puramente em F-Zero.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Inspira%C3%A7%C3%A3o-F--Zero-red?style=for-the-badge" alt="F-Zero" />
  <img src="https://img.shields.io/badge/Three.js-0.170-black?style=for-the-badge&logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</p>

---

## 🚀 A Ideia do Projeto

**G-MINUS** é um jogo de corrida futurista de altíssima velocidade focado em pilotagem técnica, reflexos rápidos e contato veicular direto na pista — seguindo fielmente as raízes e a essência da franquia **F-Zero**.

### 🚫 Sem Armas. Velocidade Pura & Habilidade.
Aqui não existem projéteis, lasers ou armas de fogo. Toda a disputa é decidida no traçado, na aerodinâmica e no impacto físico direto entre as máquinas:
- **Side-Attack**: Golpes laterais agressivos de carroceria para empurrar, desestabilizar e arremessar naves rivais contra as muretas de energia.
- **Risk-Reward Autêntico**: A barra de energia é ao mesmo tempo seu **escudo vital** e seu **combustível para o Super Boost**.

> **"Gastar energia para alcançar a liderança ou economizar para sobreviver às colisões da corrida?"**

---

## ✨ Mecânicas Principais

- 🏎️ **Física Anti-Gravidade 3D**: Naves flutuando sobre pistas tubulares e curvas sinuosas, com inclinação dinâmica de asa (*banking roll*), inércia e sensação extrema de velocidade (+1000 km/h).
- ⚡ **Sistema Escudo = Boost**: Ative o Super Boost a qualquer instante ao custo de drenar parte de sua blindagem energética. Se a energia chegar a zero, a nave não suporta e explode (Crash / K.O.).
- 💥 **Impacto Físico & Side-Attack (`Q` / `E`)**: Manobras laterais de impacto brusco para acertar rivais no traçado, infligir dano por colisão e buscar o K.O.
- 🔋 **Pit Strip (Faixa de Recarga)**: Faixa de indução magnética verde na pista que restaura seu escudo conforme você passa sobre ela.
- 🤖 **Grid de Rivais com IA**: Pilotos agressivos disputando posições, usando impulsos e reagindo ao traçado.
- 🔊 **Áudio Procedural Dinâmico**: Sons de turbina, boosts, colisões metálicas e explosões sintetizados em tempo real via **Web Audio API** (sem arquivos pesados).

---

## 🎮 Comandos & Controles

| Ação | Teclas / Atalho |
| :--- | :--- |
| **Acelerar / Frear** | <kbd>W</kbd> / <kbd>S</kbd> ou <kbd>↑</kbd> / <kbd>↓</kbd> |
| **Curva / Direção** | <kbd>A</kbd> / <kbd>D</kbd> ou <kbd>←</kbd> / <kbd>→</kbd> |
| **Side-Attack (Ataque Lateral / Bater)** | <kbd>Q</kbd> (Esquerda) / <kbd>E</kbd> (Direita) |
| **Super Boost** | <kbd>Espaço</kbd> *(Consome Escudo)* |

---

## 🛠️ Tecnologias Utilizadas

- **[Three.js](https://threejs.org/)** – Renderização gráfica 3D WebGL (câmera dinâmica com FOV por velocidade, névoa, iluminação e faíscas).
- **[TypeScript](https://www.typescriptlang.org/)** – Código estritamente tipado para física vetorial, spline de pista e colisões.
- **[Vite](https://vitejs.dev/)** – Bundler moderno com carregamento instantâneo.
- **Web Audio API** – Síntese de áudio procedural sem dependências externas.

---

## 🏁 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm`

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Ziaker/g-minus.git
   cd g-minus
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor local:**
   ```bash
   npm run dev
   ```

4. **Abra no navegador:**
   Acesse a URL indicada no terminal (geralmente `http://localhost:5173`).

---

## 🌐 Publicação no GitHub Pages

O projeto conta com GitHub Actions automatizado em `.github/workflows/deploy.yml`. Para disponibilizar o jogo online:
1. No repositório no GitHub, acesse **Settings > Pages**.
2. Em **Build and deployment > Source**, escolha **GitHub Actions**.
3. A cada alteração na branch `main`, a versão do jogo é atualizada e hospedada automaticamente.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
