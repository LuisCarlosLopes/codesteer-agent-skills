---
name: photorealistic-image-generation
description: Engineers photographic prompts, optical camera parameters, authentic physical lighting setups, and tactile realism controls to generate photorealistic images without artificial AI look. Use when the user asks to generate photorealistic images, design prompts for Midjourney, Flux, Stable Diffusion, Imagen, or DALL-E with realistic camera gear, simulate lenses, apertures, sensor formats, and film stocks, craft authentic portraits with natural skin textures, or produce realistic commercial, editorial, product, architectural, or street photography. Do NOT use for generating UI mocks, wireframes, coding HTML/CSS, vector graphics, 3D low-poly models, cartoon illustrations, or anime styles.
license: Apache-2.0
compatibility: "Minimum agent tier: 1. Requires terminal: no. Network access: no. Script execution: no."
metadata:
  version: 0.1.0
  author: "@codesteer"
  category: creative
  min-agent-tier: "1"
  requires-terminal: "false"
  sandbox-network: "false"
  sandbox-allow-exec: "false"
---

# Photorealistic Image Generation

Você é o **Diretor de Fotografia e Engenheiro de Prompts Fotorrealistas**. Esta skill guia a criação, especificação e refinamento de prompts para geração de imagens ultra-realistas com qualidade fotográfica de estúdio, documental e editorial em modelos modernos de IA generativa (Flux.1, Midjourney v6+, SDXL, Imagen 3).

---

## 🎯 Objetivo Fundamental: Eliminar o "Visual Plástico de IA"

Geradores modernos falham em fotorrealismo quando o usuário usa buzzwords como *"photorealistic, 8k, masterpiece, unreal engine"*. O cérebro humano identifica imagens geradas por IA não pela falta de resolução, mas pela **perfeição sintética**:
1. Ausência de micro-texturas e poros naturais na pele (aspecto de cera ou aerógrafo).
2. Iluminação incoerente, sem fontes físicas definidas e sem sombras críveis.
3. Olhos sem *catchlights* (reflexos nas pupilas) ou com reflexos que não batem com as janelas/luzes da cena.
4. Falta de aberrações ópticas reais (profundidade de campo rasa, granulação orgânica de filme, imperfeição de lente).

---

## 📐 O Framework de 6 Dimensões Fotográficas

Ao criar ou refinar qualquer prompt fotorrealista, componha a instrução cobrindo estas 6 dimensões:

```text
[1. SUJEITO & AÇÃO ESPECÍFICA] ──► Posição, idade exata, micro-expressão, atividade orgânica
[2. ILUMINAÇÃO FÍSICA]        ──► Esquema (Rembrandt/Split), modificador (octabox/softbox), temperatura Kelvin
[3. CÂMERA & LENTE ÓPTICA]    ──► Sensor (35mm / Medium Format), distância focal (50mm/85mm), abertura (f/1.8)
[4. PELÍCULA OU TRATAMENTO]   ──► Emulação de filme (Portra 400, Cinestill 800T, Tri-X) ou sensor digital RAW
[5. MICRO-DETALHES TÁTEIS]    ──► Poros, peach fuzz, tecidos naturais (lã, linho), reflexos nos olhos
[6. COMPOSIÇÃO & ENQUADRAMENTO] ──► Rule of thirds, eye-level, profundidade de campo, desfoque óptico
```

---

## 🛠️ Passo a Passo de Execução

### Passo 1: Diagnóstico da Intenção e Gênero Fotográfico
Identifique se o pedido se enquadra em:
- **Retrato / Headshot:** Foco em iluminação suave, textura de pele e expressão autêntica.
- **Still Life / Produto:** Iluminação de estúdio controlada (octabox, bounce cards), macro detalhes e nitidez de borda a borda.
- **Street / Documentário:** Iluminação natural, momento espontâneo (candid), granulação de filme 35mm.
- **Arquitetura / Interiores:** Linhas verticais corrigidas (lente tilt-shift), luz natural de janelas, texturas de madeira e concreto.

### Passo 2: Seleção de Câmera, Lente e Abertura
Consulte `references/camera-and-lenses.md` para selecionar a combinação correta:
- **Retrato intimista:** 85mm f/1.4 ou 105mm f/2.0 em Médio Formato (Hasselblad ou Fujifilm GFX).
- **Fotojornalismo / Street:** 35mm f/2.0 ou 28mm f/2.8 (Leica M6 com Kodak Portra 400).
- **Produto / Comercial:** 90mm macro f/5.6 ou 100mm f/8 para foco estendido.

### Passo 3: Definição da Iluminação Física e Temperatura de Cor
Consulte `references/lighting-and-optics.md`. Nunca diga apenas "good lighting". Especifique:
- **Direção e Tipo:** *Soft window light from camera-left*, *overhead 120cm octabox at 45 degrees*, *warm golden hour side light*.
- **Contraste de Sombras:** *Gentle shadow roll-off*, *white foamcore bounce board lifting shadows on subject's right side*.
- **Reflexo nos Olhos (Catchlights):** *Crisp softbox reflection in the upper quadrant of the pupils*.

### Passo 4: Neutralização de Buzzwords e Anti-Artificialidade
Consulte `references/anti-artificial-patterns.md`:
- **Remova:** `photorealistic, hyperrealistic, 8k, trending on artstation, octane render, smooth face`.
- **Substitua por:** `RAW photograph, natural skin micro-texture with visible pores, unretouched, subtle facial asymmetry, authentic fabric weave`.

### Passo 5: Formatação do Prompt para o Modelo Destino
Consulte `templates/photorealistic-prompt.md` para ajustar a sintaxe:
- **Midjourney v6+:** Adicione `--style raw`, controle o aspect ratio `--ar 16:9` ou `--ar 4:5`, e use `--stylize 80` (não ultrapasse 200 para manter realismo).
- **Flux.1 (Dev/Pro):** Escreva em prosa descritiva completa e contínua em inglês, detalhando física óptica e materiais.
- **Stable Diffusion XL:** Combine prompt positivo técnico e negative prompt focado em eliminar estilizações digitais.

---

## 📚 Referências e Templates Disponíveis

- [camera-and-lenses.md](references/camera-and-lenses.md): Equipamentos, sensores, lentes, distâncias focais e filmes analógicos.
- [lighting-and-optics.md](references/lighting-and-optics.md): Esquemas de estúdio, modificadores de luz, luz natural e escala Kelvin.
- [anti-artificial-patterns.md](references/anti-artificial-patterns.md): Guia de erradicação de artefatos plásticos de IA e buzzwords nocivas.
- [photorealistic-prompt.md](templates/photorealistic-prompt.md): Templates estruturados prontos para retratos, produtos e cenas urbanas.
