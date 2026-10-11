# P08 revisão 2 — Perfil C + contato A

**EM AVALIAÇÃO — FÍSICA 3D NÃO APROVADA**

## Resultado executado

- **110 testes passaram**, zero falhas: 85 preexistentes e 25 específicos da revisão 2.
- Dos testes específicos, 13 executam comparação com as rotinas originais do P01: oito cenários de pilotagem, três de voo e dois de pouso. Tolerância numérica de 1e-7 nos estados comparados; geometria plana controlada em memória no harness, sem editar o P01.
- Build TypeScript/Vite do projeto concluído. O HTML do P08 foi gerado e sua identidade com as fontes foi conferida separadamente.
- Chromium 153 com WebGL/SwiftShader: interface, JSON, passo único, nove geometrias e quatro câmeras testados; estados idênticos em cadências sintéticas 30/60/120 mantendo física 120 Hz.
- Quatro verificações de teclado confirmam esquerda/direita para setas e Z/C.
- Quatro capturas reais foram geradas e inspecionadas: reta, loop invertido, voo e recepção. O loop apresenta normal invertida e contato; a rampa apresenta voo; a recepção registra um pouso e retorno à altura alvo.

## O que mudou

A pilotagem experimental do P08 foi substituída por blocos extraídos diretamente do P01. Os wrappers transportam os cálculos do plano de pilotagem para a superfície real. O contato A continua sendo a adaptação 3D em avaliação. B/C foram retirados da seleção ativa. O JSON passou à versão 2, rejeitando a calibração concorrente antiga em vez de reinterpretá-la silenciosamente.

A configuração de trabalho aplica valores inequívocos do export original e conserva os números existentes no P01 para os 41 campos cujo texto não determina precisão única. Todos esses números foram verificados como candidatos compatíveis com o export e são apresentados como pendentes. Isso não constitui confirmação dos valores ambíguos.

## Evidências

- `physics-tests.txt`: 25 testes específicos.
- `all-tests.txt`: suíte completa, 110 testes.
- `build.txt`: build do projeto.
- `standalone-build.txt`: geração do HTML.
- `browser-validation.json`: estados, renderer e verificações de interface/cadência.
- `direction-regression.json`: verificações de teclado.
- `01-straight.png`, `02-loop.png`, `03-flight.png`, `04-landing.png`: capturas desta revisão.

## Limites da conclusão

Equivalência demonstrada nos cenários controlados descritos, não em todas as condições possíveis. A consulta/captura 3D, transições de base, correção de contato, colisão esférica e câmeras são extensões diferentes do P01. A nave não segue automaticamente o traçado: parede/loop em alta velocidade podem exigir correção do jogador. O framebuffer por software não comprova 120 FPS em hardware real. VFX de voo/pouso C/D ainda não estão conectados. A seleção de A não representa aprovação final da física adaptada.

## Isolamento

Branch local `prototype/08-3d-physics`, revisão sobre `6886f3e`. Somente arquivos do P08 e seus registros/testes foram alterados. O P01, `src/`, protótipos anteriores e documentos de aprovação permanecem intactos. Sem push, deploy ou integração ao jogo. O arquivo entregue nesta conversa precisa ser baixado para uso no Windows; não houve escrita direta na pasta do computador do responsável.

Especificação vigente: `docs/specs/08_3d_physics_lab_revision2.md`.
