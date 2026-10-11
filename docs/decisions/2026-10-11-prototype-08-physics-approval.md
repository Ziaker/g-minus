# Aprovação do Protótipo 08 — Perfil C + contato A, revisão 3

**Data:** 11/10/2026 (America/Sao_Paulo).  
**Status:** P08 APROVADO — INTEGRAÇÃO PENDENTE.  
**Autoridade:** responsável pelo projeto, declaração direta após a entrega da revisão 3: “está perfeito, faça toda documentação necessária e coloque tudo no repositório atualizando os documentos de aprovação também, aprovo”.

## Artefato e rastreabilidade

- [HTML standalone](../../prototypes/08_3d_physics_lab.html), fontes em `prototypes/physics-08/`.
- Versão funcional aprovada: commit `399e8e5`, revisão 3. A atualização posterior do banner/status e documentação registra esta decisão e não altera a dinâmica aprovada.
- [Especificação histórica e índice](../specs/08_3d_physics_lab_spec.md), [extensão do P01](../specs/08_3d_physics_lab_revision2.md), [recuperação aérea](../specs/08_3d_physics_lab_revision3.md).
- [Baseline reproduzível](2026-10-11-prototype-08-approved-baseline.json): snapshot dos padrões entregues. Não houve JSON personalizado anexado à aprovação; não se afirma ter capturado ajustes locais do responsável. Valores alterados posteriormente nos sliders não recebem aprovação automática.

## Escopo aprovado

1. Pilotagem terrestre baseada nas rotinas do P01 / Perfil C; passo fixo de 120 Hz.
2. **Contato A:** consulta à geometria 3D real e normais locais, restrição de altura e reação limitada; estabilidade sem oscilação periódica artificial; banking, paredes, loop e tubo.
3. Desprendimento, voo com gravidade, pouso e transferência de impulso; colisão de pista/barreiras como implementada no laboratório.
4. **Revisão 3:** autoestabilização gradual em voo livre, pitch controlável e boost dirigido pelo nariz, permitindo frear a queda e voltar a subir. Preserva orientação local enquanto houver contato.
5. Redução de escopo anteriormente confirmada: extensão da pilotagem já aprovada, com contato A escolhido, em vez de desenvolver três sistemas completos de pilotagem. As alternativas independentes B/C da revisão inicial não são escolhidas por esta aprovação.

## Configuração de referência

| Controle | Padrão entregue |
| :--- | ---: |
| Passo físico | 1/120 s |
| Limite de reação A | 2500 u/s² |
| Alcance de contato | 6 u |
| Correção normal máxima por passo | 0,35 u |
| Assistência aérea | ligada |
| Autoestabilização | 120°/s |
| Pitch aéreo | 80°/s; −60° a +75° |
| Empuxo aéreo do boost | 260 u/s² |
| Multiplicador de direção no boost aéreo | 1,6 |
| Limite de subida | 120 u/s |

↓/S empina; ↑/W mergulha; ↓/S tem prioridade quando ambos são pressionados. A/B aciona boost; no ar assistido S/↓ não freia longitudinalmente. Soltar o pitch retorna ao neutro. Consumo/duração do boost continuam nas rotinas P01. A recuperação exige tempo, altitude disponível e energia, não garante resgate de qualquer queda.

JSON v3 preserva o perfil completo; imports v2 mantêm assistência desligada para reproduzir comportamento histórico. O campo legado `approval: "none"` não é certificado de aprovação de uma configuração: a decisão humana é este documento e o snapshot identificado. O campo `status` informa o estado do protótipo. Imports com o status antigo continuam aceitos, normalizados para o novo status, sem mudar parâmetros.

## Preservação e limites

P01 e export original preservados; 41 ambiguidades de precisão continuam registradas, incluindo o subconjunto de 18 do P07. Os valores de trabalho retidos não resolvem tais pendências por inferência. A divergência histórica de esterço 56 × 89 permanece explicada na auditoria existente; o P08 usa a origem numérica documentada na revisão 2. Wake 0,12 / 4,8 permanecem no perfil de referência, sem introduzir senoide de contato.

Direção D, nove geometrias P05, pintura B e decisões VFX anteriores continuam válidas. Esta aprovação não modifica seus registros. VFX de voo/pouso C/D ainda não conectados permanecem trabalho futuro.

O contato A é restrição geométrica assistida, não suspensão spring-damper nem corpo rígido totalmente livre. Colisão usa esfera comum experimental e CCD incompleto em arestas/vértices; isto não define hitboxes competitivas finais. Limites horizontal/vertical separados permitem velocidade total 3D superior ao limite horizontal.

Não aprova o circuito técnico como pista definitiva P09, HUD/câmeras como design final P12, combate, IA, balanceamento de 30 competidores ou regras de eliminação/recuperação. Não autoriza iniciar tais trabalhos automaticamente.

## Validação e integração

Na revisão 3 foram executados 116 testes (31 P08), build TypeScript/Vite, testes reais de navegador WebGL e inspeção de capturas. [Relatório](../evidence/physics-08/revision-3/validation.md). Teste de teclado W + ↓ + A: queda inicial de −85 u/s; após 240 passos, subida de +120 u/s e altura de 180 para 282,91 u. Cadências 30/60/120 são sintéticas com simulação fixa; não são benchmark de hardware. As evidências antigas conservam “em avaliação”, pois antecedem esta decisão humana.

**Aprovação do protótipo não significa integração executada.** `src/` não é alterado nesta entrega. A publicação dos arquivos e desta decisão no repositório mantém o laboratório separado. A próxima integração deve ser explicitamente solicitada, preservar o comportamento aprovado e documentar divergências antes de modificá-lo.

Revalidação após o registro de aprovação: **117/117 testes passaram** (32 P08), incluindo importação de JSON com status antigo e identidade do snapshot padrão; build TypeScript/Vite concluído. Logs preservados em [`docs/evidence/physics-08/approval/`](../evidence/physics-08/approval/). Não foi feita nova avaliação de dirigibilidade nesta etapa documental; a aprovação humana acima se refere à revisão 3 entregue.
