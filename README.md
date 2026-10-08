# ⚡ G-MINUS // Sci-Fi Combat Anti-Gravity Racing

<p align="center">
  <strong>Jogo de corrida anti-gravidade 3D com combate veicular inspirado em clássicos como F-Zero e WipEout.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-cyan?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Three.js-0.170-black?style=for-the-badge&logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</p>

---

## 🚀 A Ideia do Projeto

**G-MINUS** é um protótipo de corrida futurista em alta velocidade focado em pilotagem precisa, reflexos rápidos e combate veicular direto na pista.

Diferente de jogos de corrida tradicionais, o núcleo do jogo segue a filosofia *Risk-Reward* de **F-Zero**:
> **Sua barra de energia é ao mesmo tempo seu escudo e seu combustível de aceleração extrema.**

Usar o **Super Boost** consome sua vida útil; sofrer ataques de oponentes reduz sua capacidade de acelerar. Para vencer, o piloto deve equilibrar agressividade, velocidade máxima e uso estratégico das zonas de recarga na pista.

---

## ✨ Principais Mecânicas

- 🏎️ **Física Anti-Gravidade**: Flutuação sobre a pista com inclinações nas curvas (*banking*), inércia e sensação visceral de aceleração.
- ⚡ **Sistema Escudo = Boost**: Ative o Super Boost a qualquer instante ao custo de drenar parte do seu escudo de energia vital.
- 💥 **Combate Veicular**:
  - **Canhões de Plasma (`J` / Botão Esquerdo)**: Rajadas energéticas para desgastar a blindagem de rivais à frente.
  - **Side-Attack (`Q` / `E`)**: Manobra agressiva com giro em 360° para arremessar naves adversárias para fora do traçado ou contra barreiras.
- 🔋 **Pit Strip (Faixa de Recarga)**: Zonas energéticas na pista que regeneram escudos durante a passagem.
- 🤖 **Grid com IA Competitiva**: Naves rivais com comportamento combativo, disputando posições e reagindo ao traçado.
- 🔊 **Áudio Procedural**: Efeitos sonoros gerados dinamicamente via **Web Audio API** para turbinas, boosts, tiros e colisões.

---

## 🎮 Comandos & Controles

| Ação | Teclas / Atalho |
| :--- | :--- |
| **Acelerar / Frear** | <kbd>W</kbd> / <kbd>S</kbd> ou <kbd>↑</kbd> / <kbd>↓</kbd> |
| **Curva / Direção** | <kbd>A</kbd> / <kbd>D</kbd> ou <kbd>←</kbd> / <kbd>→</kbd> |
| **Side-Attack (Giro Lateral)** | <kbd>Q</kbd> (Esquerda) / <kbd>E</kbd> (Direita) |
| **Canhão de Plasma** | <kbd>J</kbd> ou <kbd>Clique Esquerdo</kbd> |
| **Super Boost** | <kbd>Espaço</kbd> *(Consome Escudo)* |

---

## 🛠️ Tecnologias Utilizadas

- **[Three.js](https://threejs.org/)** – Renderização gráfica 3D WebGL (iluminação dinâmica, materiais emissores, névoa e sombras).
- **[TypeScript](https://www.typescriptlang.org/)** – Arquitetura tipada para física, vetores, colisões e controle de entidades.
- **[Vite](https://vitejs.dev/)** – Ambiente ultrarrápido para desenvolvimento e empacotamento modular.
- **Web Audio API** – Síntese procedural de áudio em tempo real sem arquivos pesados.

---

## 🏁 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm` (ou `pnpm` / `yarn`)

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

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   Abra a URL exibida no terminal (geralmente `http://localhost:5173`).

---

## 🌐 Publicação no GitHub Pages

O projeto conta com GitHub Actions automatizado em `.github/workflows/deploy.yml`. Para habilitar a página online:
1. No repositório no GitHub, acesse **Settings > Pages**.
2. Em **Build and deployment > Source**, selecione **GitHub Actions**.
3. A cada push na branch `main`, a versão atualizada do jogo será disponibilizada publicamente.

---

## 📦 Build para Produção

Para gerar os arquivos otimizados prontos para publicação:
```bash
npm run build
```
Os arquivos finais serão gerados na pasta `dist/`.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
