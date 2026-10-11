# P08 — Revisão 3: autoestabilização e recuperação aérea

**P08 APROVADO — INTEGRAÇÃO PENDENTE**

Aprovação expressa em 11/10/2026: [registro e escopo](../decisions/2026-10-11-prototype-08-physics-approval.md). Revisões e evidências anteriores preservam o estado histórico de avaliação.

Complementa a revisão 2, a pedido do responsável: impedir a retenção de orientação lateral/invertida após desprendimento e permitir recuperar altitude usando pitch e boost. Mantém Perfil C terrestre e contato A. Nenhuma integração no jogo principal.

## Comportamento

Em voo livre, o referencial da nave converge gradualmente para o horizonte e a vertical global, a 120 graus/s. A assistência altera a orientação, sem reposicionar a nave ou zerar sua velocidade. Não atua enquanto apoiada: banking, paredes, tubos e loops continuam usando as normais da geometria. Soltar os controles retorna o pitch ao neutro com decaimento exponencial de 3/s; o roll visual neutro recebe amortecimento adicional de 5/s.

↓ ou S empina a 80 graus/s; ↑ ou W mergulha. Empinar tem prioridade sobre W, permitindo W + ↓. O pitch experimental varia de −60° a +75°. No ar assistido, S/↓ deixa de acionar o freio longitudinal do P01; espaço mantém o freio. Setas laterais dirigem; Z/C deslocam lateralmente.

A/B aciona o boost original (custo, duração e energia preservados). Durante sua duração, acrescenta 260 u/s² na direção do nariz, compartilhada entre física e renderização. A direção aérea recebe multiplicador 1,6. A gravidade continua atuando, com sustentação limitada a metade dela. A velocidade vertical fica entre −airDiveMaxSpeed do Perfil C e +120 u/s. A componente horizontal mantém os limites topSpeed/boostTopSpeed. O ganho de altitude exige orientação, tempo e energia; não há retorno automático para a pista.

A orientação visual foi corrigida: pitch positivo representa nariz para cima. Roll ocorre em torno do nariz já inclinado. A câmera acompanha o referencial estabilizado e não o pitch voluntário, para manter o horizonte legível.

## Calibração e compatibilidade

Controles separados e explicitamente experimentais: nivelamento 30–240°/s, pitch 30–120°/s, empuxo 120–400 u/s², direção no boost 1–2,5× e subida 50–180 u/s. O checkbox desliga toda a extensão aérea para comparação com a revisão 2. Não modifica os 207 valores exportados do Perfil C nem resolve suas 41 ambiguidades.

JSON v3 armazena `air` e valida chaves/tipos/limites. Importação v2 migra com assistência **desligada**, preservando seu comportamento anterior. Telemetria acrescenta erro de nivelamento e empuxo aéreo. Passo permanece 1/120 s.

## Limitações

A extensão é uma assistência arcade, não aerodinâmica completa. Há limites independentes horizontal/vertical, portanto a velocidade total 3D pode ultrapassar o limite horizontal. Autoestabilização não evita toda colisão ou queda: começar muito baixo, sem energia ou apontando para baixo pode impedir recuperação. Aquisição de contato e colisão esférica conservam as limitações da revisão 2. A jogabilidade continua dependendo de avaliação humana.

Evidências e reprodução: `docs/evidence/physics-08/revision-3/`; testes Node em `physics08.test.cjs`; testes WebGL em `browser-validation.cjs` e `air-browser.cjs`. O segundo usa condição inicial controlada e comandos reais de teclado para a recuperação.
