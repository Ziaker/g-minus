# ⚡ G-MINUS // Anti-Gravity High-Speed Racing

<p align="center">
  <strong>Jogo de corrida anti-gravidade 3D em alta velocidade inspirado na essência e física de F-Zero X.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Inspira%C3%A7%C3%A3o-F--Zero%20X-red?style=for-the-badge" alt="F-Zero X" />
  <img src="https://img.shields.io/badge/Three.js-0.170-black?style=for-the-badge&logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</p>

---

## 🚀 A Ideia do Projeto

**G-MINUS** é um jogo de corrida futurista focado em pilotagem técnica a mais de 1000 km/h, física anti-gravidade de alta precisão e contato veicular agressivo na pista — inspirado diretamente na arquitetura e dinâmica de **F-Zero X**.

### 🚫 Sem Armas. Velocidade Pura & Domínio da Pista.
Aqui não existem lasers ou projéteis. As disputas são decididas na trajetória, no peso e no impacto entre as fuselagens:
- **Side-Attack (<kbd>Z</kbd> / <kbd>C</kbd> [Toque duplo])**: Golpes laterais de impacto seco para esmagar adversários contra as bordas de contenção.
- **Spin Attack (<kbd>Z</kbd> + <kbd>C</kbd> / <kbd>SHIFT</kbd>)**: Rotação axial violenta em 360° com campo de força neon que varre múltiplos rivais ao redor.
- **Regra Clássica de Boost (<kbd>A</kbd>)**: Na Volta 1 o turbo é bloqueado (`BOOST LOCKED`). A partir da Volta 2, o sinal **BOOST OK!** se acende e o piloto pode queimar seu próprio escudo para atingir velocidades insanas.

---

## 🏎️ Máquinas & Estatísticas (Body / Boost / Grip)

Assim como no clássico, cada máquina possui atributos distintos que moldam a pilotagem:

| Máquina | Piloto | Body (Peso/Blindagem) | Boost (Turbo) | Grip (Aderência) | Estilo de Pilotagem |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Blue Falcon** | Captain Falcon | **B** | **C** | **B** | Equilibrada, ágil e versátil para qualquer traçado. |
| **Golden Fox** | Dr. Stewart | **D** | **A** | **D** | Arrancada e turbo brutais; exige cuidado nas colisões. |
| **Wild Goose** | Pico | **A** | **B** | **C** | Tanque pesado de combate; domina empurrões e K.O.s. |
| **Fire Stingray** | Samurai Goroh | **A** | **D** | **B** | Excelente velocidade final e blindagem maciça. |

### ⚙️ Engine Settings (Aceleração vs Velocidade Máxima)
Antes da largada, ajuste o balanço do motor no seletor:
- **Foco em Aceleração**: Recuperação rápida após colisões e saídas de curva.
- **Foco em Velocidade Máxima**: Tração superior nas retas longas.

---

## ✨ Mecânicas Principais

- 🏎️ **Física Anti-Gravidade 3D**: Naves flutuando sobre pista tubular com inclinação dinâmica de asa (*banking roll*), atrito de grip e sensação visceral de aceleração.
- ⚡ **Sistema Escudo = Boost**: Ative o Super Boost a qualquer instante ao custo de drenar parte de sua blindagem energética. Se a energia chegar a zero, a máquina explode (K.O.).
- 💥 **Combate Físico Autêntico**:
  - **Side-Attack (Toque duplo em `Z` / `C`)**: Manobra lateral ofensiva para arremessar naves adversárias para fora do traçado.
  - **Spin Attack (`Z` + `C` / `SHIFT`)**: Giro 360° em área para repelir grupos de oponentes.
  - **Inclinar / Strafe (`Z` / `C`)**: Inclinação de asa e deslocamento lateral suave.
  - **Freio / Drift (`ESPAÇO`)**: Freia e quebra tração para derrapagem controlada.
- 🔋 **Pit Strip & Dash Plates**:
  - **Pit Strip (Faixa Verde)**: Recupera os escudos em tempo real.
  - **Dash Plates (Setas Amarelas)**: Impulso imediato de velocidade ao passar por cima.
- 🤖 **Grid Completo com 8 Máquinas**: Disputa acirrada de posições com inteligência artificial combativa.
- 🔊 **Áudio Procedural F-Zero X**: Sons sintetizados em tempo real via **Web Audio API** (turbinas dinâmicas, Boost OK fanfare, alarmes de baixa energia, Spin Attack e colisões).

---

## 🎮 Comandos & Controles

| Ação | Teclas / Atalho |
| :--- | :--- |
| **Acelerar (Manter Pressionado)** | <kbd>X</kbd> *(Segure para acelerar)* |
| **Direção / Manobra** | <kbd>←</kbd> / <kbd>→</kbd> *(Apenas as setas movem a nave)* |
| **Inclinar / Strafe** | <kbd>Z</kbd> (Esquerda) / <kbd>C</kbd> (Direita) |
| **Side-Attack (Ataque Lateral)** | Toque duplo em <kbd>Z</kbd> (Esquerda) ou <kbd>C</kbd> (Direita) |
| **Freio / Drift** | <kbd>ESPAÇO</kbd> *(Freia e quebra tração para derrapagem)* |
| **Super Boost** | <kbd>A</kbd> *(Consome Escudo / Liberado na Volta 2)* |
| **Spin Attack (Giro 360° em Área)** | <kbd>Z</kbd> + <kbd>C</kbd> ou <kbd>SHIFT</kbd> *(Varredura em área)* |

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


---

## 📘 Game Design Document e processo de prototipação

**Revisão de 10/10/2026:** o [Protótipo 01 foi aprovado para física e dinâmica](docs/decisions/2026-10-10-prototype-01-physics-approval.md), usando o Perfil C — Inercial / Drift como baseline. A aprovação não inclui visual, VFX, áudio ou pistas. Consulte também as [novidades verificadas, bugs corrigidos e limites](docs/audits/2026-10-09-fixes.md). Também em 10/10/2026: o [Protótipo 05 foi aprovado](docs/decisions/2026-10-10-prototype-05-craft-geometry-approval.md) — nove geometrias (Blue Falcon, Golden Fox e Wild Goose × A/B/C) na direção D, que passam a ser **obrigatórias nos próximos protótipos que envolvem essas naves**. Ainda não estão integradas ao jogo.

Validação: `npm test` executa regressões de input, geometria, combate, pads, chegada e laboratórios; `npm run build` verifica TypeScript antes do Vite. Os laboratórios de prototipação (`/prototypes/01_steering_profiles.html`, `/prototypes/02_craft_visuals.html`, `/prototypes/02_ship_visuals_v6_webgl.html`, `/prototypes/03_neo_metropolis_visual.html`, `/prototypes/04_craft_vfx.html` e `/prototypes/05_craft_geometry_lab.html`) rodam de forma independente e podem ser abertos diretamente no navegador.

As decisões atuais de gameplay, visual e processo de desenvolvimento estão registradas no **[GDD inicial](docs/GDD.md)**. O documento diferencia requisitos definidos, detalhes pendentes e recursos já presentes no código; não significa que os novos recursos estejam implementados.

**Regra de desenvolvimento:** toda feature passa por protótipo HTML com **3 alternativas distintas**, sliders independentes e configuração copiável/colável, acompanhada de especificação completa e aprovação **antes** de ser integrada ao jogo. A integração deve ser fiel à versão aprovada. Novas mudanças exigem consulta ao repositório atualizado, atualização documental, telemetria/debug e atualização do README.

- **Protótipo 01 — Física, Combate e Direção (Perfil C aprovado):** [abrir laboratório](prototypes/01_steering_profiles.html) · [especificação](docs/specs/01_steering_profiles_spec.md) · [decisão](docs/decisions/2026-10-10-prototype-01-physics-approval.md)
- **Protótipo 02 — Modelos & Silhuetas de Naves:** [abrir laboratório](prototypes/02_craft_visuals.html) · [especificação](docs/specs/02_craft_visual_spec.md)
- **Protótipo 02 — WebGL v6 (direção estética aprovada D / Toon Vector Flux):** [abrir laboratório atualizado](prototypes/02_ship_visuals_v6_webgl.html) · [registro formal de aprovação e guia para futuros protótipos](docs/specs/02_toon_vector_flux_approval.md). **A aprovação é da estética, não das geometrias/peças definitivas ou implementação no jogo.**
- **Protótipo 03 — Ambiente Neo Metropolis:** [abrir laboratório](prototypes/03_neo_metropolis_visual.html) · [especificação](docs/specs/03_neo_metropolis_visual_spec.md)
- **Protótipo 04 — Efeitos Visuais das Naves (VFX Lab):** [abrir laboratório](prototypes/04_craft_vfx.html) · [especificação](docs/specs/04_craft_vfx_spec.md)
- **Protótipo 05 — Geometria das Três Primeiras Naves (9 modelos A/B/C aprovados, Toon Vector Flux):** [abrir laboratório](prototypes/05_craft_geometry_lab.html) · [especificação](docs/specs/05_craft_geometry_lab_spec.md) · [capturas](docs/captures/05_craft_geometry_lab/). · [decisão](docs/decisions/2026-10-10-prototype-05-craft-geometry-approval.md). **Nove geometrias aprovadas (baseline = valores padrão); uso obrigatório nos próximos protótipos de naves; ainda não integradas ao jogo.**

**Jogar via GitHub Pages (endereço previsto):** https://ziaker.github.io/g-minus/  
**Aviso de disponibilidade (2026-10-08):** o endereço ainda não foi validado como jogável. A última publicação consultada falhou na etapa *Setup Pages*, apesar de o build ter passado. [Ver workflow](https://github.com/Ziaker/g-minus/actions/runs/37830599287). O jogo pode ser iniciado localmente pelas instruções acima; a falha de publicação não foi corrigida nesta alteração.
