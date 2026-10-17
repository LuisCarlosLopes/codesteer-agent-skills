# Refinamento de Personagem (Prompt Chaining)

Quando o personagem gerado estiver **próximo mas não perfeito**, não reescreva o prompt inteiro: a identidade já conquistada se perde. Envie um prompt de refinamento curto que fixa tudo e muda só o necessário. Regras:

1. Primeira linha sempre declara o que fica **inalterado** (identidade + composição).
2. No máximo **3 ajustes** por rodada; se precisar de mais, encadeie rodadas.
3. Fecha com `Do NOT change:` listando explicitamente os eixos protegidos.
4. Uma rodada ataca **um eixo** (face, pele ou luz). Não misture.

---

## Refinamento facial

```
Keep the character identity and overall composition unchanged. Apply ONLY these facial adjustments:
- [Ajuste 1: ex. "narrow the jaw slightly, making it more V-shaped"]
- [Ajuste 2: ex. "add subtle crow's feet lines near outer eye corners"]
- [Ajuste 3: ex. "shift gaze direction 15 degrees to camera left"]

Do NOT change: bone structure, eye color, skin tone, hair, clothing, lighting setup.
```

## Refinamento de pele / textura

```
Keep the character and composition identical. Adjust ONLY skin rendering:
- [Ajuste 1: ex. "increase pore visibility on nose and cheeks"]
- [Ajuste 2: ex. "add subtle subsurface scattering warmth on ear lobes and nose tip"]
- [Ajuste 3: ex. "introduce 3-4 natural freckles across nose bridge"]

Do NOT change: facial features, expression, hair, clothing, lighting, background.
```

## Refinamento de iluminação

```
Keep the character identity perfectly intact. Adjust ONLY the lighting:
- [Ajuste 1: ex. "shift key light to Rembrandt position, creating triangle on right cheek"]
- [Ajuste 2: ex. "add warm rim light from behind at camera right"]
- [Ajuste 3: ex. "reduce fill light ratio to 1:4 for more dramatic contrast"]

Do NOT change: character features, expression, wardrobe, background, color palette.
```

---

## Diagnóstico rápido: qual eixo refinar

| Sintoma na imagem | Eixo |
|---|---|
| Rosto "parecido mas não é", mandíbula/olhos fora do perfil | Facial |
| Pele de cera, sem poros, aparência de aerógrafo | Pele |
| Sardas/pinta do Character Anchor ausentes | Pele (reintroduzir marcas em posição exata) |
| Sombras chapadas, sem volume, catchlight ausente | Iluminação |
| Olhar na direção errada, expressão rígida | Facial (gaze + micro-expressão) |
| Idade aparente deslocou entre cenas | Facial (reafirmar faixa etária + marcas) |
