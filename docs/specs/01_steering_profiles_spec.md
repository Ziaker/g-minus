# Especificação Técnica 01 — Perfis de Resposta de Direção e Pilotagem

> **Status:** Protótipo construído e aguardando aprovação de alternativa.  
> **Arquivo do Protótipo Interativo:** [`prototypes/01_steering_profiles.html`](file:///c:/Users/zerke/OneDrive/%C3%81rea%20de%20Trabalho/G%20Minus/prototypes/01_steering_profiles.html)  
> **GDD de Referência:** Seções 3 [21–26], 11.1 [101] e 13.2.

---

## 1. Visão Geral

O GDD estabelece no requisito **[21]** a obrigatoriedade de disponibilizar três perfis distintos de direção nas configurações do jogo:
1. **Opção A:** Resposta imediata / precisa;
2. **Opção B:** Resposta progressiva;
3. **Opção C:** Resposta com inércia perceptível.

Além disso, integra os requisitos conexos:
- **[22]** Aumento de velocidade reduz estabilidade nas curvas;
- **[23]** A nave tende a se estabilizar ao soltar os comandos;
- **[24]** Drift como consequência mecânica e inercial;
- **[26]** Freios aerodinâmicos com comandos independentes à esquerda (<kbd>Q</kbd>) e à direita (<kbd>E</kbd>).

---

## 2. Comparativo das Três Opções do Protótipo

| Parâmetro | Opção A: Imediata / Precisa (GX Razor) | Opção B: Progressiva (X Momentum) | Opção C: Inércia Perceptível (Heavy Vector) |
| :--- | :---: | :---: | :---: |
| **Sensação Central** | Direção direta de kart/arcade técnico | Ajustes finos suaves; curvas longas fortes | Massa pesada; exige contra-esterço |
| **Taxa de Esterço (`steerRate`)** | `90` | `75` | `60` |
| **Curva de Progressividade** | `1.0` (Linear) | `1.8` (Exponencial moderada) | `2.2` (Exponencial acentuada) |
| **Inércia / Massa (`inertia`)** | `15` (Muito leve) | `45` (Equilibrada) | `85` (Massa pesada) |
| **Aderência / Grip (`grip`)** | `92` (Grip travado) | `72` (Drift sob carga) | `50` (Derrapagem solta) |
| **Retorno ao Centro (`recenter`)** | `18.0` (Imediato) | `10.0` (Gradual) | `6.0` (Arrasto inercial) |
| **Instabilidade por Alta Velocidade** | `0.25` | `0.45` | `0.65` |
| **Força Freios Aerodinâmicos L/R** | `65` | `80` | `95` |

---

## 3. Descrição Detalhada dos Comportamentos

### Opção A — Imediata / Precisa ("GX Razor")
- **Comportamento:** O vetor de esterçamento é aplicado sem atraso de interpolação. Pequenos toques nas teclas produzem desvios secos na pista.
- **Ao Soltar o Comando:** A força lateral cessa quase instantaneamente (`recenter = 18.0`), alinhando o vetor da nave com a tangente do traçado.
- **Indicado para:** Jogadores que buscam controle cirúrgico de linha de corrida no estilo F-Zero GX de alta precisão.

### Opção B — Progressiva com Aero Drift ("X Momentum")
- **Comportamento:** A aceleração angular começa suave e escala exponencialmente conforme a tecla de direção é mantida pressionada. Permite micro-ajustes na reta sem desestabilizar a nave.
- **Freios Aerodinâmicos (<kbd>Q</kbd> / <kbd>E</kbd>):** Atuam como freios de asa, quebrando a tração traseira e induzindo drift lateral controlado.
- **Indicado para:** Pilotos que gostam de dosar entradas de curva e manter alta velocidade tangencial.

### Opção C — Inércia Perceptível ("Heavy Vector")
- **Comportamento:** A máquina transmite sensação evidente de tonelagem. A velocidade lateral demora para responder e, uma vez iniciada, a força centrífuga empurra a fuselagem em direção à borda externa.
- **Derrapagem & Recuperação:** Exige contra-esterço deliberado para recuperar o grip. Em alta velocidade (+1000 km/h), o risco de desgarrar é elevado.
- **Indicado para:** Máquinas pesadas da classe Wild Goose e Fire Stingray.

---

## 4. Esquema de Importação/Exportação JSON [11.1]

A ferramenta de prototipação expõe exportação e importação direta no formato JSON:

```json
{
  "prototype": "G-MINUS // Protótipo 01: Perfis de Direção",
  "gddSections": [21, 22, 23, 24, 26, 101],
  "profile": "A",
  "params": {
    "steerRate": 90,
    "progressivity": 1.0,
    "inertia": 15,
    "grip": 92,
    "recenter": 18.0,
    "speedInstability": 0.25,
    "airbrakeForce": 65
  }
}
```

---

## 5. Próximos Passos (Critério de Aprovação)

Conforme a Seção 11.1 do GDD:
1. Testar o protótipo em [`prototypes/01_steering_profiles.html`](file:///c:/Users/zerke/OneDrive/%C3%81rea%20de%20Trabalho/G%20Minus/prototypes/01_steering_profiles.html);
2. Ajustar os sliders se desejado e copiar a configuração final gerada;
3. Indicar qual das 3 opções (ou se todas as três como seleção configurável no menu) deve ser aprovada e integrada ao código principal do jogo (`src/game/Vehicle.ts`).
