# Validação — revisão 3

**EM AVALIAÇÃO — FÍSICA 3D NÃO APROVADA**

Executado em 11/10/2026 no checkout isolado `prototype/08-3d-physics`, sobre `d413e55`.

- `npm test`: 116/116 passaram, incluindo 31 testes P08. Paridade terrestre com P01, contato invertido, recuperação aérea, ausência de recuperação sem energia, migração JSON e determinismo 30/60/120 Hz.
- `npm run build`: TypeScript e Vite concluídos. HTML standalone regenerado e `build.mjs --check` confirmou identidade com as fontes.
- Chromium WebGL com ANGLE/SwiftShader: laboratório, nove geometrias, quatro câmeras, controles, JSON, lançamento/pouso, loop e cadências sintéticas passaram; nenhum pageerror ou erro WebGL.
- Teclado real no navegador, assistência padrão: estado inicial fora da pista a y=180, vy=−85 e roll do referencial de 90°. Segurar W + ↓ e acionar A; após 240 passos, y=282,91 e vy=+120. A nave permanece em voo, nivelada e com nariz empinado. O teste também verificou consumo de energia, retorno de pitch ao neutro e queda após o término do boost.
- Capturas `05-air-before.png` e `06-air-recovered.png` inspecionadas: horizonte volta à orientação normal e nariz aponta para cima durante recuperação. Demais imagens registram reta, loop invertido, voo e pouso.

As cadências são controladas e usam renderização WebGL real; não são um benchmark de 120 FPS de hardware. Testes não equivalem à aprovação de diversão, dirigibilidade ou física pelo responsável.

Mudanças restritas ao P08, seus testes, especificações e evidências. P01, export original, aprovações, outros protótipos e código principal preservados. Sem push nem integração.
