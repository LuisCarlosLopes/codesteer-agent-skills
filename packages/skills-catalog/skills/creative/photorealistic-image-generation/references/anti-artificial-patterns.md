# Padrões Anti-Artificialidade e Diagnóstico de Artefatos de IA

Este guia orienta como identificar e eliminar o aspecto "plástico de IA" (*uncanny valley*, pele de cera, olhos vítreos, simetria sintética) em prompts e gerações fotorrealistas.

---

## 1. Buzzwords Contraproducentes (O que NUNCA usar)

Em modelos modernos (Flux, Midjourney v6+, SDXL), palavras vazias que eram comuns em 2022 hoje ativam datasets de render 3D sintético, videogames ou filtros pesados de Instagram:

| Termo Proibido | Por que Prejudica o Fotorrealismo | Substitutos Fotográficos Reais |
| :--- | :--- | :--- |
| `photorealistic`, `hyperrealistic` | Força o modelo a emular CGI que "tenta parecer real", resultando em pele cerosa e iluminação de videogame. | Descreva a câmera e o sensor: `shot on 35mm film`, `Canon EOS R5 RAW photograph`, `Hasselblad medium format`. |
| `octane render`, `unreal engine 5` | Treinado em motores de videogame e renderizadores de animação 3D. Destrói a textura fotográfica. | Descreva iluminação física: `diffused softbox lighting`, `overcast daylight`, `Rembrandt key light`. |
| `masterpiece`, `trending on artstation` | Puxa estilos de ilustração digital, concept art e renderizadores artísticos. | Descreva o contexto editorial: `editorial photo for Vogue magazine`, `photojournalistic documentary capture for Reuters`. |
| `8k`, `16k`, `ultra detailed` | Gera micro-ruído digital excessivo, dentes duplicados e texturas repetitivas não-naturais. | Descreva o detalhe visível real: `visible skin pores`, `subtle freckles`, `individual hair strands in the breeze`. |
| `smooth skin`, `perfect face` | Resulta em efeito de aerógrafo (*airbrushed*), ausência total de poros e aspecto de manequim. | `authentic skin texture`, `natural facial micro-asymmetry`, `subtle fine lines around eyes`. |

---

## 2. Sintomas Comuns de IA e Como Neutralizá-los

### A. Pele de Cera / Plástica
- **Causa:** Ausência de descrição de micro-textura e excesso de filtros de beleza nos dados de treino.
- **Solução no prompt:** Inclua texturas anatômicas reais:
  - `visible natural skin pores and subtle imperfections`
  - `subtle peach fuzz (vellus hair) on cheeks caught in rim light`
  - `subsurface scattering with warm skin undertones`
  - `no heavy makeup or digital skin smoothing`

### B. Olhos Vítreos e Olhar Perdido (Dead Eyes)
- **Causa:** Falta de reflexo de luz (*catchlight*) ou pupilas com reflexos incoerentes com a cena.
- **Solução no prompt:**
  - `sharp catchlight in the pupils reflecting the octabox softbox`
  - `detailed iris texture with natural depth and slight wet surface reflection`
  - `candid expression looking slightly off-camera` (evita o olhar 100% estático e robótico)

### C. Mãos e Dedos Deformados
- **Causa:** Ambiguidade de posicionamento anatômico em ações complexas.
- **Solução no prompt:**
  - Dê um propósito funcional às mãos: `hands holding a warm ceramic coffee mug with both palms`, `fingers gently adjusting the collar of a wool jacket`, `hands resting naturally in coat pockets`.
  - Evite poses com dedos entrelaçados ou gestos vagos no ar sem suporte físico.

### D. Simetria Facial Artificial
- **Causa:** Modelos tendem a gerar rostos perfeitamente simétricos por otimização estatística média.
- **Solução no prompt:**
  - Adicione assimetria deliberada: `slight smirk on one side of the mouth`, `hair parted casually with loose strands falling across one cheek`, `subtle birthmark near left temple`, `head tilted 5 degrees candidly`.

---

## 3. Elementos Físicos que Validam Fotorrealismo

Adicionar 1 ou 2 destes elementos imediatamente convence o cérebro humano de que a imagem é uma foto física real:

1. **Profundidade Óptica Real:** Nem tudo deve estar nítido. Se o foco está no olho do sujeito, a orelha deve ter um desfoque suave (`f/1.8 optical fall-off`).
2. **Texturas Táteis de Materiais:** Tecidos com trama visível (`coarse knitted wool`, `slub cotton texture`, `creased linen fabric`).
3. **Poeira e Partículas Atmosféricas:** Em cenas iluminadas por frestas de sol: `subtle dust motes floating in sunlight beam`.
4. **Cores Neutras e Menos Saturação:** `muted documentary color grading`, `natural desaturated tones`, `Kodak Portra low-saturation highlights`.
