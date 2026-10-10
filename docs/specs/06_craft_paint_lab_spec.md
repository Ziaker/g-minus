# Especificação Técnica — Protótipo 06: Pintura e Personalização das Naves

**Status:** **SISTEMA B APROVADO em 10/10/2026** (A e C não escolhidos) — [registro de decisão](../decisions/2026-10-10-prototype-06-paint-system-approval.md). O laboratório abre no Sistema B, e a restauração completa também volta para ele. Não integrado ao jogo.
**Data:** 2026-10-10
**Arquivo:** [`prototypes/06_craft_paint_lab.html`](../../prototypes/06_craft_paint_lab.html) — HTML autônomo, WebGL 1 nativo, sem dependências externas.
**Testes:** [`tests/craft_paint_lab.test.mjs`](../../tests/craft_paint_lab.test.mjs).
**Capturas em navegador real:** [`docs/captures/06_craft_paint_lab/`](../captures/06_craft_paint_lab/).
**Fontes normativas:**
- [GDD](../GDD.md) [72, 78] (cores das peças separadas), [83] (legibilidade), [101] (gate de prototipação), [102] (reprodutibilidade/seed);
- [D — Toon Vector Flux](02_toon_vector_flux_approval.md);
- [aprovação do Protótipo 05](../decisions/2026-10-10-prototype-05-craft-geometry-approval.md), incluindo a regra obrigatória dos modelos e a diretriz de cores por peça e cores aleatórias.

---

## 1. Objetivo e limites

Comparar **três sistemas de personalização de cor**, todos aplicados aos nove modelos aprovados e todos dentro da direção D:

- **A** — cores por grupo visual;
- **B** — cores por função de material;
- **C** — personalização híbrida com sorteio reproduzível por semente.

O responsável escolhe, combina ou rejeita.

**Não altera:** geometria (nem modelos, nem parâmetros padrão, nem o bloco canônico), física, VFX, jogo principal, dependências. Os **quatro grupos visuais continuam provisórios** e **não** são declarados como as quatro peças intercambiáveis.

## 2. Uso obrigatório dos modelos aprovados

- O bloco `@gminus-approved-craft-geometry v1` foi **copiado byte a byte** do Protótipo 05. O teste do Protótipo 05 compara os dois blocos e falharia se divergissem.
- O núcleo de renderização D (shaders, contorno, arestas, pódio, câmera) também foi copiado literalmente do 05. Mudaram apenas a origem das cores e o layout de comparação.
- A geometria é **sempre a baseline aprovada**: os parâmetros vêm de `defaultParams()` e ficam congelados (`Object.freeze`). Não há sliders geométricos, e o JSON não aceita parâmetros de malha. O campo `geometryBaseline` só aceita `"prototype05-v1"`.
- Teste: as nove impressões digitais renderizadas pelo 06 são as aprovadas (`902a3acf`, `3b36297f`, `8dea1899`, `0f6edd34`, `20f67adb`, `c84e2916`, `2dbc008a`, `05c4fe5d`, `92d0c8f3`).

## 3. Pipeline de cor D (comum aos três sistemas)

A v6 calcula, para cada papel de material, `pintura = mix(cor, rosa(.96,.37,.68), 0,55)` e `secundária = mix(cor, violeta(.06,.032,.13), 0,68)`, com acento, estrutura, vidro, energia e marcação fixos. O laboratório mantém essa estrutura e expõe a mistura como controle **"Mistura gráfica D (rosa)"** (padrão **0,55** = v6). Depois vêm saturação (fórmula v6) e brilho das emissões (fórmula v6). O shader D (degraus, retícula, rim, contorno, arestas magenta) não muda.

**Fidelidade:** nos valores padrão, **A e B reproduzem exatamente** a paleta D da v6 para as três naves e os quatro grupos (verificado por teste com tolerância 1e-9). C parte de uma paleta sorteada (semente 1) ancorada na cor de identidade.

## 4. As três alternativas

### 4.1 A — Por grupo visual

- Quatro seletores de cor: Proa, Cabine, Asas e Motores. Cada um é a **cor-base** do grupo.
- Pintura e secundária do grupo derivam da cor-base pela fórmula D. Acento, estrutura, vidro, energia e marcação continuam globais D.
- Controles:

| id | Controle | Mín | Máx | Padrão |
| :--- | :--- | ---: | ---: | ---: |
| `pinkMix` | Mistura gráfica D (rosa) | 0 | 0,8 | 0,55 |
| `shadeMix` | Escurecimento da secundária | 0,4 | 0,85 | 0,68 |
| `unify` | Unificar com a cor de identidade | 0 | 1 | 0 |
| `saturation` | Saturação | −0,38 | 0,38 | 0 |
| `glow` | Brilho das emissões | 0 | 2 | 1 |

- "↺ id." devolve o grupo à cor de identidade da nave.
- Teste: mudar a cor de um grupo altera **somente** pintura e secundária desse grupo.

### 4.2 B — Por função de material

- Sete seletores: pintura, secundária, acento, estrutura, vidro, energia e marcação. Cada cor vale para os quatro grupos.
- Exceto a pintura, cada papel aceita o valor `"D"` (usa a paleta D da v6). "↺ D" restaura esse valor.
- Controle de **hierarquia**: escurece secundária (≤ 65 % da luminância da pintura com hierarquia 1), estrutura e vidro (≤ 40 %), para não inverter a leitura das massas.
- Controles:

| id | Controle | Mín | Máx | Padrão |
| :--- | :--- | ---: | ---: | ---: |
| `pinkMix` | Mistura gráfica D (rosa) | 0 | 0,8 | 0,55 |
| `shadeMix` | Escurecimento da secundária (quando `"D"`) | 0,4 | 0,85 | 0,68 |
| `hierarchy` | Proteção da hierarquia de massas | 0 | 1 | 0 |
| `saturation` | Saturação | −0,38 | 0,38 | 0 |
| `glow` | Brilho das emissões | 0 | 2 | 1 |

### 4.3 C — Híbrida com sorteio por semente

**Estrutura**
- Por grupo: pintura e secundária próprias.
- Globais: acento, energia e marcação. Estrutura e vidro ficam fixos em D, para preservar a hierarquia.

**Sorteio**
- Gerador **mulberry32** com semente `seed ⊕ hash(nave)`: a mesma semente gera paletas diferentes por nave, mas sempre as mesmas.
- Consome números em **ordem fixa**, de modo que travar um grupo não altera o sorteio dos demais.
- **Harmonia:**
  - análoga: −28°, −8°, 12°, 30°;
  - complementar: 0°, 180°, 0°, 180°;
  - tríade: 0°, 120°, 240°, 0°;
  - livre: matiz aleatório por grupo.
- Matiz base interpolado entre um sorteio e a cor de identidade (`identity`).
- Saturação e luminosidade dentro de faixas; a secundária vem do mesmo matiz, com saturação × 0,75 e luminosidade × 0,42.

**Correção de contraste** (só grupos automáticos, até 40 iterações)
- Contra o fundo Vitrine D: sobe a luminosidade até o alvo `contrastBg`.
- Entre grupos vizinhos (Proa–Cabine, Cabine–Asas, Asas–Motores): afasta a luminosidade até `contrastAdj`.
- Medido em 600 paletas (3 naves × sementes 1–200, controles padrão): **2.396/2.400 grupos (99,8 %)** atingem o alvo de fundo e **1.791/1.800 pares (99,5 %)** atingem o alvo entre vizinhos. Os casos restantes aparecem como "abaixo" no painel de Legibilidade.

**Edição manual**
- Editar a cor de um grupo **trava** esse grupo (🔒). A secundária vem da mesma regra.
- Uma trava sobrevive a novos sorteios; "Auto" destrava.
- Acento, energia e marcação também podem ser fixados.

**Botões**
- **Sortear:** nova semente aleatória (1–999.999). O resultado é sempre reproduzível pela semente exibida.
- **Repetir:** regenera com a mesma semente; o resultado é idêntico, verificado por teste.
- Campo numérico para digitar uma semente.

**Controles**

| id | Controle | Mín | Máx | Padrão |
| :--- | :--- | ---: | ---: | ---: |
| `seed` | Semente (inteiro) | 1 | 999999 | 1 |
| `harmony` | Harmonia | — | — | complementar |
| `identity` | Âncora na cor de identidade | 0 | 1 | 0,5 |
| `satMin` / `satMax` | Faixa de saturação | 0 | 1 | 0,45 / 0,85 |
| `lightMin` / `lightMax` | Faixa de luminosidade | 0,15 / 0,2 | 0,85 / 0,9 | 0,35 / 0,65 |
| `contrastBg` | Contraste mínimo com o fundo | 1 | 7 | 3:1 |
| `contrastAdj` | Contraste mínimo entre vizinhos | 1 | 3 | 1,3:1 |
| `pinkMix` | Mistura gráfica D (rosa) | 0 | 0,8 | 0,55 |
| `saturation` | Saturação | −0,38 | 0,38 | 0 |
| `glow` | Brilho das emissões | 0 | 2 | 1 |

Na interface, mover um mínimo acima do máximo arrasta o máximo junto. No JSON, essa inversão é rejeitada.

### 4.4 Escopo das pinturas

Cada sistema guarda **uma pintura por nave** (`liveries[sistema][nave]`), válida para os três modelos aprovados daquela nave. São 9 pinturas independentes (3 sistemas × 3 naves). Alterar um sistema ou uma nave não altera os outros (verificado por teste).

## 5. Comparação e inspeção

- **Individual:** um modelo com o sistema ativo.
- **A · B · C:** o mesmo modelo com os três sistemas lado a lado, mesma escala, luz e câmera.
- **Galeria:** os nove modelos com o sistema ativo.
- Vistas ¾, frente, traseira, perfil, superior e inferior; órbita, zoom, rotação, enquadrar e reset de câmera (comportamento do Protótipo 05).
- Destacar ou isolar grupos visuais (útil para ver a área de cada cor no sistema A).
- Fundos Vitrine D, Claro e Cinza.
- **Legibilidade:** contraste WCAG da pintura final de cada grupo contra o fundo Vitrine e entre vizinhos. O status ✓/abaixo aparece só no sistema C, onde há alvo; em A e B os valores são de referência. É uma aproximação calculada sobre a cor-base sem iluminação.
- **Exemplos de demonstração:** um botão carrega exemplos **não oficiais** nos três sistemas para facilitar a comparação, sem mexer nos controles deslizantes. Não criam cores oficiais.

## 6. Restaurações

| Comando | Afeta |
| :--- | :--- |
| Reset desta nave | pintura do sistema ativo para a nave ativa |
| Reset do sistema (3 naves) | pinturas do sistema ativo |
| Restaurar configuração inicial completa | tudo; exige segundo clique em até 5 s |
| Reset câmera / Enquadrar | apenas câmera |

## 7. Contrato JSON (v1)

```json
{
 "schema": "gminus.craft-paint-lab", "schemaVersion": 1,
 "artDirection": "D-TOON-VECTOR-FLUX", "geometryBaseline": "prototype05-v1", "paintApproval": "none",
 "selection": { "ship": "falcon", "model": "A", "models": { "falcon": "A", "fox": "A", "goose": "A" }, "system": "B" },
 "liveries": {
  "A": { "falcon": { "groups": { "nose": "#2468f6", "cockpit": "#2468f6", "wings": "#2468f6", "engines": "#2468f6" }, "pinkMix": 0.55, "shadeMix": 0.68, "unify": 0, "saturation": 0, "glow": 1 }, "fox": {}, "goose": {} },
  "B": { "falcon": { "roles": { "paint": "#2468f6", "secondary": "D", "accent": "D", "structure": "D", "glass": "D", "energy": "D", "marking": "D" }, "pinkMix": 0.55, "shadeMix": 0.68, "hierarchy": 0, "saturation": 0, "glow": 1 }, "fox": {}, "goose": {} },
  "C": { "falcon": { "seed": 1, "harmony": "complementar", "identity": 0.5, "satMin": 0.45, "satMax": 0.85, "lightMin": 0.35, "lightMax": 0.65, "contrastBg": 3, "contrastAdj": 1.3, "pinkMix": 0.55, "saturation": 0, "glow": 1,
     "overrides": { "nose": null, "cockpit": null, "wings": null, "engines": null }, "roleOverrides": { "accent": null, "energy": null, "marking": null } }, "fox": {}, "goose": {} }
 },
 "inspection": { "mode": "single", "view": "threeQuarter", "yaw": 0.62, "elev": 0.36, "zoom": 1, "autoRotate": false, "turntable": 0, "background": "vitrine", "focus": "all", "focusMode": "highlight" }
}
```

**Formato**
- Cores sempre `"#rrggbb"` minúsculo. `"D"` só é aceito nos papéis de B, exceto a pintura.
- Em C, a paleta automática **não é gravada**: é recalculada a partir de semente + controles, e só travas e cores fixadas são gravadas. Assim o mesmo JSON reproduz exatamente o mesmo resultado (verificado por teste).

**Validação**
- Esquema, versão, `artDirection` e `geometryBaseline` fixos; `paintApproval` só aceita `"none"`, para que nenhum JSON declare aprovação.
- Chaves exatas; identificadores conhecidos; `selection.model` coerente com a nave ativa.
- Semente inteira; faixas não invertidas; números finitos dentro dos intervalos.
- `inspection` é opcional; `liveries` é obrigatório e completo (3 sistemas × 3 naves).
- **Aplicação atômica:** em qualquer erro, nada muda. Os 27 casos inválidos testados preservam o estado.
- Interface: Copiar (com alternativa se a área de transferência falhar), Aplicar, Ver estado atual e Baixar `.json`.

## 8. Testes e resultados (2026-10-10)

`npm test`: **51/51** na avaliação — 20 regressões de jogo + 17 do Protótipo 05 + **14** do Protótipo 06. Com a aprovação do Sistema B foi adicionado o teste 15 (selo de aprovação, baseline do B igual à v6, registro de decisão): **52/52**.

1. as nove impressões aprovadas; sem parâmetros geométricos no JSON; `geometryBaseline` obrigatória;
2. A e B nos padrões = paleta D da v6 exata;
3. A isola grupos;
4. B aplica papéis em todos os grupos e respeita a hierarquia;
5. C reproduzível por semente (inclusive pela interface "Repetir"); sementes diferentes variam;
6. travas de C sobrevivem a novos sorteios e não alteram os grupos automáticos;
7. contraste de C contra o fundo atingido em ≥ 98 % de 120 paletas testadas; faixa invertida corrigida;
8. independência entre sistemas, naves e modelos, com seletores sincronizados;
9. resets nos três níveis, com confirmação dupla;
10. JSON ida e volta, inclusive a paleta C idêntica e a interface sincronizada;
11. 27 entradas inválidas rejeitadas sem alterar o estado;
12. renderizador simulado nos três modos, sem variação de buffers em 30 ciclos;
13. sem WebGL: falha exibida e controles funcionando;
14. constantes D presentes, nenhum texto declarando sistema aprovado e laboratório fora do jogo.

**Outras verificações**
- **Regra do Protótipo 05:** o teste de obrigatoriedade reconhece `06_craft_paint_lab.html` como protótipo de naves e confirma o bloco canônico idêntico.
- **Build:** `npm run build` concluído sem erros; o laboratório é emitido em `dist/prototypes/06_craft_paint_lab.html`.
- **Navegador real (WebGL efetivo):** Edge headless via DevTools Protocol, `WebGL 1.0 (OpenGL ES 2.0 Chromium)`, 1600 × 1000. Comparação A·B·C nos padrões e com exemplos, galerias A, B e C (sementes 1 e 4242), painéis B e C e efeito da mistura D em 0,2. As capturas são da avaliação, anteriores à aprovação do Sistema B: por isso mostram o selo “personalização em avaliação · não aprovada”. Os cálculos de cor não mudaram.
- **Navegador do aplicativo:** carregamento sem erros de console e impressão `902a3acf` exibida no diagnóstico.

## 9. Observação de avaliação importante

Com a mistura D padrão (**0,55** de rosa, como na v6), todas as escolhas de cor ficam fortemente puxadas para rosa/lilás. As diferenças entre os sistemas existem, mas ficam suaves (ver `compare_falcon_exemplos.png`). Com a mistura em 0,2 as cores escolhidas aparecem com clareza (`compare_falcon_exemplos_mistura020.png`). **Definir quanto da mistura D se mantém na personalização é uma decisão sua**; o laboratório não altera o padrão da v6.

## 10. Diferenças técnicas em relação ao Protótipo 05

- **Cor:** passa a ser resolvida por grupo × papel (tabela 4 × 7 por pintura), em vez de por papel global.
- **Comparação:** agora entre sistemas de pintura, não entre geometrias.
- **Inspeção:** sem os modos de diagnóstico de renderização (neutro, silhueta, luz da câmera, contornos alternativos). O passe D da v6 é sempre usado.
- **Geometria:** fixa, sem sliders; o cache de malhas nunca é reconstruído.

## 11. Limitações conhecidas

- O contraste é calculado sobre cores-base sem iluminação. O sombreamento em degraus e a retícula mudam a luminância percebida. Vale só o fundo Vitrine D; os fundos Claro e Cinza não entram no cálculo.
- O seletor nativo de cor (`input type=color`) varia entre navegadores. Firefox e Safari não foram testados.
- Os exemplos de demonstração são arbitrários e não representam cores oficiais.
- Pinturas por modelo (em vez de por nave) e pinturas por peça definitiva dependem de decisões futuras.

## 12. Decisões de aprovação

**Atualização de 10/10/2026 — Sistema B APROVADO** ("Aprovo a opção B") — [registro de decisão](../decisions/2026-10-10-prototype-06-paint-system-approval.md).

- [ ] Sistema **A** — por grupo visual: **não escolhido** (mantido para comparação)
- [x] Sistema **B** — por função de material: **aprovado**. Mecanismo aprovado; cores livres; controles de pipeline na baseline padrão (`pinkMix` 0,55, `shadeMix` 0,68, `hierarchy` 0, `saturation` 0, `glow` 1)
- [ ] Sistema **C** — híbrido com sorteio reproduzível: **não escolhido** (mantido para comparação)

**Ainda pendentes:**
- cores aleatórias dentro do Sistema B (diretriz do responsável ainda sem forma definida);
- relação entre a cor por papel e as cores por peça do GDD [72, 78];
- escopo da pintura (por nave, por modelo ou por peça);
- valores de pipeline diferentes da baseline (incluindo a mistura D);
- interface de personalização no jogo;
- telemetria [102];
- integração.
- **Fora deste escopo:** peças intercambiáveis definitivas; VFX; física.

## 13. Como abrir

`npm run dev` → `http://localhost:5173/prototypes/06_craft_paint_lab.html`. O arquivo também abre direto do disco.
