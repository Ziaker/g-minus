# Protótipo 08 — entrega e validação

**EM AVALIAÇÃO — FÍSICA 3D NÃO APROVADA**

> Relatório histórico da revisão 1. Para a implementação atual, consulte [validação da revisão 2](revision-2/validation-report.md).

## Alterações

Laboratório standalone em `prototypes/08_3d_physics_lab.html`, gerado por fontes isoladas em `prototypes/physics-08/`; especificação em `docs/specs/08_3d_physics_lab_spec.md`; testes e evidências nesta pasta. Três modelos físicos, dez áreas de ensaio, nove malhas canônicas, pintura B, renderer D, calibração independente, câmeras, controles físicos, JSON e telemetria.

## Evidência técnica

- `tests.txt`: 115 testes aprovados, zero falhas; 30 testes específicos do P08 e 85 testes preexistentes.
- `build.txt`: TypeScript e build Vite do projeto existente.
- `standalone-build.txt`: integridade do HTML gerado em relação às fontes.
- `browser-validation.json`: Chromium 153, WebGL por ANGLE/SwiftShader, checagens de UI, teclado, nove modelos, quatro câmeras e cadências sintéticas 30/60/120 com desenho WebGL real. Estados completos dos cenários capturados incluídos.
- `01-straight.png`, `02-loop-comparison.png`, `03-flight.png`, `04-landing.png`: capturas reais do navegador, não imagens geradas.

A inspeção das capturas confirma UI e naves renderizadas, três viewports, pista visível, voo sem superfície imediata e retorno ao contato. A câmera acompanha a normal e, portanto, uma nave invertida pode parecer vertical na tela; a normal XYZ no painel e os estados JSON comprovam a orientação no mundo. Não se declara aprovação da pilotagem, conforto de câmera, qualidade artística final ou performance de hardware. As capturas não substituem o teste de jogo do responsável.

## Limitações materiais

- A colisão é uma esfera comum de 1 u; a silhueta pode tocar visualmente a pista antes da esfera. CCD de faces não cobre integralmente arestas/vértices.
- Orientação assistida arcade, sem torque ou tensor de inércia. Captura magnética pode rejeitar pousos muito desalinhados. Testar deliberadamente bordas e diferentes orientações.
- A usa correção normal explícita limitada; B usa forças; C usa forças e assistência normal de velocidade. A escolha não foi feita.
- A baseline numérica está preservada, mas a pilotagem não é equivalente ao Perfil C inteiro. Estabilidade sem oscilação é experimental e não revoga aprovação anterior.
- VFX de voo/pouso C/D, drift e toggles cumulativos de boost ainda precisam ser ligados aos novos estados; os efeitos ativos usam os baselines aprovados.
- Não há corrida completa, IA, dano/K.O., controle touch, interpolação visual ou replay de todas as entradas manuais.
- O ensaio de cadência comprova desacoplamento temporal; SwiftShader não comprova execução a 120 FPS reais. Custos exibidos são CPU.

## Git e isolamento

A implementação foi feita no worktree `g-minus-p08`, branch local `prototype/08-3d-physics`. Base inicial `bccd2a6`, atualizada por fast-forward para `80f7093`, incorporando integralmente o commit documental do Claude. O checkout original não foi editado por esta entrega. Apenas caminhos novos do P08 foram acrescentados. Nenhum arquivo em `src/`, protótipo anterior, documento de aprovação ou configuração do build principal foi alterado. Sem push, deploy ou integração.

## Próxima decisão do responsável

Jogar A/B/C nas mesmas condições, começar pela reta e pelo ensaio programado, depois parede/loop/tubo, rampa e pouso. Exportar a configuração e telemetria das alternativas preferidas. As pendências de brainstorm estão na especificação: tolerância de captura, drift, controle aéreo, ganho no pouso, padronização de hitbox/massa/altura e conexão de VFX aos eventos reais.
