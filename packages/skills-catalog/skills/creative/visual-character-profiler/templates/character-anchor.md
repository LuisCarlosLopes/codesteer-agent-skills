# Template C — Character Anchor

Para reutilização do mesmo personagem em múltiplas peças de campanha. O bloco `[CHARACTER ANCHOR]` é gerado uma vez e **copiado literalmente** em toda cena; só o bloco `[SCENE]` muda.

```
[CHARACTER ANCHOR — Persistent Identity Card]
Character ID: [nome-código interno, ex.: "MAYA-01", "LUCAS-02"]

Physical Identity (IMMUTABLE across all scenes):
- Gender: [male | female | child]
- Apparent age: [faixa]
- Ethnicity: [etnia], Skin tone: [Fitzpatrick + undertone]
- Face shape: [formato]
- Bone structure: [maçãs do rosto, mandíbula, queixo, testa]
- Eyes: [cor, formato, profundidade, cílios, sobrancelhas]
- Nose: [ponte, largura, ponta]
- Lips: [volume, arco do cupido, cor natural]
- Skin signature: [sardas, pintas, cicatrizes, marcas; MUST remain identical]
- Hair: type [1A-4C], color [com reflexos], length [comprimento], default style [penteado base]
- Body: [biotipo, altura relativa, ombros, proporções]
- Distinctive markers: [traço único, ex.: "small mole above left lip", "slight gap between front teeth"]

[SCENE — Current Execution]
Scene number: [01, 02, 03...]
Scene description: [estrutura do Template A ou B para a cena específica]

[CONSISTENCY ENFORCEMENT RULES]
- MUST maintain exact facial bone structure, eye color, nose shape, lip shape across all scenes.
- Skin signature marks (moles, freckles, scars) MUST appear in identical positions.
- Hair color and texture MUST remain consistent; style may vary ONLY if explicitly requested.
- Body proportions MUST be preserved regardless of wardrobe or pose changes.
- Age appearance MUST NOT shift between scenes.

Specs: Resolution [2K|4K] | Ratio [conforme cena] | Preset: realistic
Negative: [Negative Injection contextual], inconsistent facial features, different bone structure,
wrong eye color, missing skin marks, altered body proportions, age shift, uncanny valley
```

## Boas práticas de consistência

- Escolha **2 a 3 marcadores distintivos** pequenos e posicionados (pinta, cicatriz, diastema, mecha). Eles são o que o modelo usa para "reconhecer" o personagem entre cenas.
- Mantenha a mesma direção cinematográfica em toda a campanha, ou mude apenas o cenário mantendo a lente.
- Quando a cena nova divergir, use `references/refinement-chaining.md` em vez de regenerar do zero.
- Entregue ao usuário o Anchor em bloco separado para que ele o cole em cada peça.
