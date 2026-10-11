# Aprovação do Protótipo 08 — revisão 4, boost e comandos aéreos

**Data:** 11/10/2026 (America/Sao_Paulo).

**Status:** P08 APROVADO — INTEGRAÇÃO PENDENTE.

**Autoridade:** responsável pelo projeto, após testar a correção de ↓ + boost: “perfeito, atualize os documentos e faça tudo que for necessário para atualizar o repositorio com as novas mudanças, aprovei”.

## Alcance da decisão

Esta decisão acrescenta a revisão 4 à [aprovação histórica da revisão 3](2026-10-11-prototype-08-physics-approval.md). O código funcional apresentado para aprovação está no commit local `cbd9be9`, posterior a `399e8e5` (revisão 3). O [laboratório](../../prototypes/08_3d_physics_lab.html) continua isolado de `src/game`. O Perfil C, o contato A e o passo de 120 Hz mantêm a aprovação anterior.

No ar com assistência ativa, ↓/S inclina o nariz para baixo; ↑ o empina; W continua a acelerar e mergulhar. A/B aciona o boost na direção do nariz. Assim, ↓/S + boost acelera a descida e ↑ + boost permite recuperar altitude. Durante o boost aéreo, o novo fator padrão `boostControl = 1,30` aumenta em 30% o comando de pitch, a direção, o strafe e o teto de velocidade vertical descendente, de 85 para 110,5 u/s. O teto de subida é 120 u/s, e a tolerância extra de descida volta gradualmente ao limite normal após o boost. A energia continua sendo consumida conforme o Perfil C.

A aprovação vale para os padrões reproduzíveis do [JSON v5](2026-10-11-prototype-08-revision4-approved-baseline.json), não para valores que o usuário venha a alterar nos sliders. O campo legado `approval: "none"` não representa uma decisão humana. JSONs v2–v4 importados preservam seu mapeamento anterior: ↓/S empina e ↑/W mergulha. JSONs v2–v3 preservam também o fator 1,00; JSONs v4 preservam o fator exportado. A [especificação da revisão 4](../specs/08_3d_physics_lab_revision4.md) descreve a implementação e suas limitações.

## Verificação e limites

Testes de física verificam ↓/S + boost, subida por ↑, migração de JSON, determinismo e ausência de alteração da pilotagem apoiada. Ensaio em Chromium WebGL com teclas reais observou −110,5 u/s na descida e +120 u/s na subida, sem erro de página ou WebGL. [Evidências](../evidence/physics-08/revision-4/) e [relatório da aprovação](../evidence/physics-08/revision-4/approval-validation.md). A aprovação de sensação de pilotagem é a declaração do responsável; testes automatizados não a substituem.

Esta decisão **não integra a física ao jogo principal** nem aprova HUD, câmeras, pistas definitivas, hitboxes ou combate. A entrada `prototype08` no Vite permite que o HTML seja incluído no build desta branch; disponibilidade no GitHub Pages depende da publicação posterior da branch usada pelo deployment, que deve ser verificada separadamente.
