# Output B — Prompt-Ready Block

Texto corrido em inglês, otimizado para ser copiado diretamente nas seções `[CHARACTER IDENTITY]`, `[FACE]`, `[HAIR]`, `[EXPRESSION]` e `[WARDROBE]` de um prompt de criação de personagem (imagem única ou campanha). Prosa descritiva contínua: modelos como Flux, Imagen e Midjourney `--style raw` respondem melhor a frases completas do que a listas de tags.

```
[CHARACTER IDENTITY]
Gender: [gender]. Apparent age: [age]. Ethnicity (apparent): [ethnicity].
Skin: Fitzpatrick [I-VI], [undertone] undertone, [texture description],
[natural marks with locations].

[FACE — Anatomical Detail]
Face shape: [shape]. [One sentence covering cheekbones, jawline, chin and forehead].
Eyes: [color with detail], [shape], [size], [spacing], [eyelid description],
[lash description]. Eyebrows: [shape], [thickness], [color], [grooming].
Nose: [bridge height], [width], [tip shape], [nostril visibility].
Lips: [volume], [cupid's bow definition], [upper-to-lower ratio], [natural color].
Skin texture: [pore visibility], [peach fuzz], [finish]. Natural marks: [freckles/moles
with exact locations]. [Scars/lines if any].

[HAIR]
Type: [Walker code], color: [base with highlights], length: [length],
style: [current style], texture: [texture], volume: [volume].
[Hairline description if visible]. [Facial hair if applicable].

[EXPRESSION & BODY LANGUAGE]
Micro-expression: [detailed FACS-informed description of the expression].
Gaze: [direction], [intensity], [emotion conveyed].
Posture: [body language description].

[WARDROBE — from source photo, replaceable per scene]
[Main piece]: [color], [fabric], [fit], [details].
[Accessories]: [each with material, color, style].
```

## Diretrizes de redação

- Prefira descritores físicos mensuráveis: `moles` com posição relativa a um ponto de referência (`2cm above left lip corner`, `on right cheekbone below outer canthus`).
- Mantenha as tags `[estimated]`, `[natural]` e `[makeup-applied]` no bloco: o usuário decide se as remove antes de gerar.
- Nunca inclua termos de estilização (`8k`, `masterpiece`, `photorealistic`) neste bloco. Câmera, luz e cena pertencem ao prompt de geração, não ao perfil.
- Se a análise for de criança, prefixe o bloco com `[child-appropriate]` e omita detalhes de corpo além de altura relativa e postura.
