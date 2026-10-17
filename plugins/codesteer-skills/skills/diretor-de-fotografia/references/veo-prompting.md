# Guia de prompting para Google Veo

Vocabulário e estrutura para prompts de vídeo curtos (3–5s), verticais, com um sujeito e uma ação.

## Anatomia do prompt (ordem recomendada)

```text
[1. ESTILO UNIFICADO]   Cinematic, 4K, shot on 35mm lens, soft natural light, warm palette
[2. TIPO DE PLANO]      Extreme close-up | Close-up | Medium shot | Medium wide | Wide | Over-the-shoulder | Insert/detail
[3. SUJEITO]            Descrição Base literal (talento) OU objeto/cenário do B-roll
[4. AÇÃO]               Um verbo principal + micro-expressão (ex.: "raises one finger and smirks knowingly")
[5. MOVIMENTO DE CÂMERA] Static | Slow push-in | Slow pull-out | Pan left/right | Tilt up/down | Handheld subtle shake | Orbit | Tracking shot | Whip pan
[6. CENÁRIO E LUZ]      Local, hora do dia, fonte de luz, profundidade de campo (bokeh)
[7. COMPOSIÇÃO/SEO]     Rule of thirds, subject on the left, clean negative space on the right for text, lower third clear for captions
[8. FORMATO]            Vertical 9:16, 4 seconds
```

Exemplo completo (A-roll):

```text
Cinematic 4K video, 35mm lens, soft natural window light, warm palette. Medium shot of a charismatic man in his early 30s, short dark hair, light-blue dress shirt, confident and didactic, gesturing with both hands as he explains something directly to camera, eyebrows raised. Slow push-in. Modern office background with shallow depth of field (bokeh). Rule of thirds, subject on the left third, clean negative space on the right for on-screen text. Vertical 9:16, 4 seconds.
```

Exemplo completo (B-roll):

```text
Cinematic 4K B-roll, 50mm lens. Close-up of a laptop screen showing a financial line chart climbing sharply, reflections on the glass, fingers tapping the trackpad out of focus in the foreground. Slow tilt up. Dim office lighting with a warm desk lamp, shallow depth of field. Lower third of the frame kept clean for captions. Vertical 9:16, 3 seconds.
```

## Vocabulário de movimento de câmera

| Intenção | Termo |
|---|---|
| Intensificar emoção | `slow push-in`, `dolly in` |
| Revelar contexto | `slow pull-out`, `dolly out`, `crane up` |
| Energia / urgência | `whip pan`, `fast tracking shot`, `handheld` |
| Autoridade / calma | `static tripod shot`, `locked-off` |
| Produto / objeto | `slow orbit`, `360 rotation`, `macro slider` |
| Transição entre clipes | `tilt down to black`, `pan into wall` (match-cut no editor) |

## Tipos de plano e quando usar

- **Extreme close-up (olhos, boca, mãos):** gancho, reação, mid-hook.
- **Close-up (rosto):** afirmação principal, segredo, pergunta direta.
- **Medium shot (cintura para cima):** explicação com gestos; o plano mais seguro para A-roll.
- **Medium wide / Wide:** contexto do ambiente, início de bloco, respiro.
- **Insert / detail:** B-roll de objetos, telas, documentos — cobre a narração sem o talento.

## O que o Veo faz bem

- Um sujeito, uma ação clara, movimento de câmera único e contínuo.
- Clipes de 3–5s com iluminação definida e profundidade de campo.
- Reações faciais, gestos amplos, caminhar, virar-se para a câmera.
- B-roll de objetos, cenários, natureza, cidades, telas (sem texto legível).

## O que evitar (gera artefatos ou inconsistência)

- **Texto legível dentro do vídeo** (placas, telas com palavras, legendas): deixe o texto para o editor.
- **Múltiplas ações encadeadas** no mesmo clipe ("ele senta, pega o celular, liga e sorri"): divida em clipes.
- **Mãos manipulando objetos pequenos** com precisão (digitar, escrever, abotoar).
- **Multidões com rostos visíveis** e grupos interagindo.
- **Pessoas reais identificáveis, logos, marcas registradas.**
- **Troca de plano dentro do prompt** ("corta para…"): um prompt = um plano.
- **Descrições vagas** ("bonito", "profissional", "boa iluminação"): troque por fonte de luz, lente e paleta.
- Clipes acima de 8s: perdem coerência temporal e quebram o ritmo do formato.

## Segmentação de cenas longas

Cena do roteiro de 12–15s → 3–4 clipes:

1. **Abertura (A-roll, 3–4s):** plano médio, talento apresenta a ideia.
2. **Cobertura (B-roll, 3–4s):** objeto/tela/cenário que ilustra a narração.
3. **Reforço (A-roll, 3s):** close-up, gesto ou expressão que pontua.
4. **Transição (B-roll ou detalhe, 2–3s):** prepara o próximo bloco.

Mantenha o estilo unificado idêntico em todos os prompts da cena.
