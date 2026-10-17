# Template Modular de Prompt Fotorrealista

Utilize esta estrutura de 6 blocos para compor prompts fotográficos de alta fidelidade para Midjourney (v6+), Flux (Dev/Pro), SDXL e Google Imagen.

---

## Estrutura dos 6 Blocos

```text
[1. TIPO DE FOTOGRAFIA & SUJEITO] +
[2. AMBIENTAÇÃO & AÇÃO CONTEXTUAL] +
[3. ILUMINAÇÃO FÍSICA & CLIMA] +
[4. EQUIPAMENTO ÓPTICO, LENTE & FILME] +
[5. DETALHES TÁTEIS & MICRO-TEXTURAS] +
[6. PARÂMETROS ESPECÍFICOS DO MOTOR]
```

---

## 1. Exemplo: Retrato Editorial Autêntico

```text
A candid 35mm editorial photograph of a 32-year-old female architect with subtle freckles across her nose and natural curly brown hair. She is standing next to a large studio drafting table, looking thoughtfully out of a floor-to-ceiling industrial steel-frame window, holding a rolled blueprint. Soft diffused morning daylight enters through the glass, casting gentle loop lighting across her face and creating sharp catchlights in her eyes. Shot on Leica M6 with a Summicron 50mm f/2 lens, Kodak Portra 400 film grain. Visible fine skin texture, natural pores, soft peach fuzz, unretouched skin, subtle wrinkles around eyes from a warm faint smile. Shallow depth of field with architectural workspace softly blurred in the background. --ar 4:5 --style raw --v 6.1
```

---

## 2. Exemplo: Fotografia de Produto & Gastronomia (Still Life)

```text
Professional commercial still life photograph of a frosted glass bottle of artisanal cold-pressed olive oil on a textured slate countertop. Two fresh green olive branches with dewy leaves rest next to a shallow ceramic dipping bowl containing golden oil. Lighting is a single large 120cm octabox from the top-left at 5600K daylight, paired with a white foam bounce card on the right to gently lift shadows. Captured on Hasselblad H6D-100c with HC 100mm f/2.2 lens at f/5.6 for crisp edge-to-edge sharpness. Macro details showing tiny condensation beads on the chilled glass surface, microscopic fabric weave of the raw linen placemat, and rich refractive golden highlights inside the liquid. Clean minimalist culinary studio setting.
```

---

## 3. Exemplo: Fotografia Urbana / Street Photography

```text
An authentic 1980s street documentary photo of a Tokyo pedestrian crossing during a light evening drizzle. A commuter in a dark beige trench coat walks under a transparent umbrella illuminated by vibrant neon signs of ramen shops and pharmacy storefronts. Wet asphalt street with high-contrast reflections of crimson and amber neon lights. Captured on 35mm rangefinder camera with 35mm f/1.4 lens, Cinestill 800T film stock displaying characteristic subtle red halation around brightest neon highlights. Authentic analog grain, slight motion blur in passing background pedestrians, crisp raindrops on umbrella surface, candid unposed moment.
```

---

## 4. Matriz de Parâmetros por Motor de Geração

| Motor | Parâmetros e Convenções Recomendadas |
| :--- | :--- |
| **Midjourney (v6 / v6.1)** | `--ar 16:9` ou `--ar 4:5` · `--style raw` (reduz intervenção artística padrão) · `--stylize 50` a `150` (evita estilização excessiva). |
| **Flux.1 (Dev / Schnell)** | Não use tags soltas em vírgulas; escreva frases completas descritivas em prosa rica em física e óptica. |
| **Stable Diffusion XL** | Use prompt positivo com especificação de câmera + negative prompt estrito (`plastic skin, airbrushed, 3d render, doll, cartoon, oversaturated, deformed hands, extra fingers`). |
| **Google Imagen 3 / DALL-E 3** | Descrições semânticas detalhadas de composição, enquadramento cinematográfico e materiais do cenário. |
