# Output C — Character Anchor Block

Bloco para a seção `[CHARACTER ANCHOR — Persistent Identity Card]` de prompts de consistência. Garante que o mesmo personagem permaneça reconhecível entre múltiplas gerações (campanhas, séries, storyboards). Contém **somente** o que é imutável: nada de vestuário, expressão, pose, iluminação ou cenário.

```
[CHARACTER ANCHOR — Persistent Identity Card]
Character ID: [CODE-NAME]

Physical Identity (IMMUTABLE across all scenes):
- Gender: [gender]
- Apparent age: [age range]
- Ethnicity (apparent): [ethnicity], Skin tone: Fitzpatrick [I-VI], [undertone] undertone
- Face shape: [shape]
- Bone structure: [cheekbones], [jawline], [chin], [forehead]
- Eyes: [color with detail], [shape], [size], [spacing], [lash detail], [eyebrow detail]
- Nose: [bridge], [width], [tip], [nostril detail]
- Lips: [volume], [cupid's bow], [ratio], [natural color]
- Skin signature: [ALL natural marks with EXACT locations — moles, freckles, scars, lines]
- Hair: type [Walker code], color [base + highlights], length [length], default style [style]
- Body: [build], [shoulders], [proportions if visible]
- Distinctive markers:
  1. [most recognizable trait, with exact location]
  2. [second trait]
  3. [third trait]
  [...]
```

## Diretrizes

- **Skin signature e Distinctive markers são o coração do anchor.** Modelos de geração perdem identidade principalmente por mudar pintas, formato de sobrancelha e linha do cabelo; descreva-os com posição exata.
- O cabelo entra como `default style`: a cena pode alterá-lo, mas tipo, cor e comprimento devem persistir salvo instrução contrária.
- Se houver `[estimated]` em um campo imutável (ex.: cor da íris), mantenha a tag e sugira ao usuário confirmar com uma segunda foto antes de fixar o anchor.
- Use o mesmo `Character ID` dos Outputs A e B.
