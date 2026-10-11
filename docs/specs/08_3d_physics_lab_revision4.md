# P08 — revisão 4 aprovada: controle aéreo durante boost

**Estado:** P08 APROVADO — INTEGRAÇÃO PENDENTE. [Decisão e baseline](../decisions/2026-10-11-prototype-08-air-control-approval.md).

Esta revisão parte do P08 revisão 3 aprovado em 11/10/2026. Não altera o Perfil C, a pilotagem apoiada, a geometria, a física do jogo principal ou o registro histórico de aprovação da revisão 3. A revisão 3 continua disponível na branch `prototype/08-3d-physics`.

## Alteração jogável

Durante o voo com boost ativo, o fator `air.boostControl` (padrão 1,30; intervalo 1,00–1,60) multiplica a velocidade de comando de pitch, a autoridade de direção e a força lateral de strafe. Também multiplica o limite de descida do Perfil C: 85 × 1,30 = 110,5 u/s. O empuxo direcional existente continua apontando para o nariz; na configuração nova, ↓/S mergulha e ↑ empina (W continua a acelerar e mergulhar). Assim, ↓/S + A/B permite descer com boost até −110,5 u/s, e ↑ + A/B mantém a recuperação de altitude. A gravidade e os parâmetros de força sem boost permanecem nos valores anteriores; o mapeamento de ↓/S e ↑ também muda no voo da nova configuração, com ou sem boost.

O teto de subida continua 120 u/s. Quando o boost acaba, a tolerância adicional de descida diminui continuamente até o limite anterior, em aproximadamente um segundo, sem cortar a velocidade vertical num único passo. Em contato com a pista, essa tolerância é zerada. Energia insuficiente não ativa o ganho.

## Comparação e persistência

O laboratório mostra o fator num slider e a velocidade vertical e o limite de descida na telemetria. Ajustar o fator para 1,00× elimina o ganho de 30%, mas mantém o novo mapeamento vertical. Para reproduzir os comandos anteriores, importe um JSON das revisões 2–4; o estado aprovado original continua na revisão 3. Configurações novas usam JSON versão 5 e status aprovado do laboratório. JSONs versões 2 e 3 são importados com fator 1,00× e comando ↓/S de subida. JSONs da versão 4 mantêm o fator que exportaram e o comando ↓/S de subida. Assim os controles antigos permanecem reproduzíveis; apenas novas configurações usam ↓/S para descer. A exportação é versionada; a decisão da revisão 4 consta em registro próprio, preservando o registro histórico da revisão 3.

## Validação e limites

`npm test -- --test-concurrency=1` e `npm run build` passaram. O ensaio Playwright/Chromium 153 com WebGL SwiftShader usou teclas reais: com ↓ + boost no mergulho a velocidade vertical chegou a −110,5 u/s, com limite 110,5 u/s e sem erro de página/WebGL; na subida chegou a +120 u/s. Evidências e capturas estão em `docs/evidence/physics-08/revision-4/`.

A calibração de diversão exige avaliação jogável do usuário. O boost não altera o teto de subida nem o empuxo de base; o limite de descida permanece um teto arcade. A entrada `prototype08` no Vite inclui o HTML na distribuição gerada nesta branch; a disponibilidade no GitHub Pages depende de publicação posterior. Este ajuste não integra `src/game`.
