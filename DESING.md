---
version: alpha
name: CodeSteer 
description: Landing de marketing para explicar propósito, limites e prova antes da demonstração.
colors:
  primary: "#ff975f"
  canvas: "#171918"
  surface: "#202321"
  line: "#3b403b"
  text: "#eeeae0"
  text-secondary: "#b5b9ad"
  paper: "#eee9dc"
  ink: "#232b28"
  emphasis: "#ff975f"
  label-indigo: "#b2b9ff"
  evidence-green: "#b8ce9c"
typography:
  display:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "0em"
  label:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: "4px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.emphasis}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.emphasis}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "14px 32px"
  badge-label:
    textColor: "{colors.label-indigo}"
    rounded: "{rounded.full}"
    padding: "4px 14px"
  badge-evidence:
    textColor: "{colors.evidence-green}"
    rounded: "{rounded.full}"
    padding: "4px 14px"
  nav-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  input-field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  paper-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: CodeSteer 

## Overview

Extração documental realizada em 17/10/2026 a partir do repositório local
`/Users/luiscarloslopesjr/GitHub/codesteer-squad-ai-landing-page`.
Site de referência: [CodeSteer](https://codesteer.vercel.app).
Fontes: `DESIGN.md` existente e `src/app/globals.css` do repositório do site.
A página publicada não pôde ser consultada; esta extração não atesta paridade
entre a versão local e a versão em produção.

O conteúdo abaixo preserva o documento de origem. Os headings foram normalizados;
o frontmatter representa o limite superior dos tamanhos fluidos, descritos na prosa,
e usa `0em` para tracking normal. `primary` é um alias semântico de `emphasis`.
Os componentes do YAML simplificam transparências; em badges, o preenchimento translúcido de 10% é descrito em Components
e omitido do YAML, que aceita apenas cores hexadecimais.


**Creative North Star: "The Cognitive Control Room"**

A landing page for engineering leaders who need to understand the mechanism before a demonstration: dark canvas, clear type, and three color roles. Depth comes from surface steps, a light paper panel, and restrained glow, not from a decorative triad.

The system serves **brand** register: design is the product story. Copy is direct and technical in Portuguese. Density stays comfortable for a long narrative. The hero breathes; the explanation follows in the same page.

**Key Characteristics:**

- Dark canvas (`#171918`) for the page, with `#202321` surfaces and `#3b403b` lines
- Orange (`#ff975f`) for emphasis, indigo (`#b2b9ff`) for labels and code, green (`#b8ce9c`) for evidence that confirms
- Light paper (`#eee9dc`) with ink text (`#232b28`) when a fact needs to sit apart from the dark field
- Sora for authority in headlines; DM Sans for editorial body; JetBrains Mono for artifacts and paths
- Glass panels (`backdrop-blur`) only on elevated content cards, never as page chrome
- Pill-shaped navigation and CTAs; larger radii (`24px`) on feature containers
- Glow shadows as accent feedback, not structural elevation

## Colors

The tutorial palette, with a job for each color. Orange emphasizes. Indigo marks a label or a code token. Green marks evidence that confirms. The light panel carries dark ink.

### Primary

- **Emphasis Orange** (`#ff975f`): Primary CTAs, focus, the word that needs weight. Emphasis, not a second brand hue.
- **Label Indigo** (`#b2b9ff`): Eyebrows, code, paths, and other labels. It does not paint large surfaces.

### Secondary

- **Evidence Green** (`#b8ce9c`): A result that confirms, including the comparison that holds. It is not a general accent.

### Paper

- **Paper** (`#eee9dc`): Light panel background.
- **Ink** (`#232b28`): Text on that panel, and label text on the orange CTA.

### Neutral

- **Canvas** (`#171918`): Page background, scrollbar track, header and footer field.
- **Surface** (`#202321`): Cards, icon wells, secondary button fill, scrollbar thumb.
- **Text** (`#eeeae0`): Primary text.
- **Text Secondary** (`#b5b9ad`): Body copy, nav links at rest. Cap line length in editorial blocks at 65–75ch.
- **Line** (`#3b403b`): Borders, dividers, scrollbar thumb on hover.

### Named Rules

**The Role Rule.** Orange, indigo, and green may appear together, but each keeps one job: emphasis, label or code, confirming evidence. Do not invent a fourth accent hue.

**The Paper Rule.** `#eee9dc` is always paired with `#232b28`. Do not put light canvas text on the paper panel.

## Typography

Divergência encontrada: o documento de origem descreve display fluido até
3.75rem, mas `src/app/page.tsx` usa no hero principal 1.875rem na base,
2.25rem em `sm`, 3rem em `md` e 3.25rem em `lg`, com line-height 1.06.
Esses valores do código prevalecem para reproduzir a homepage atual; a escala
abaixo preserva a intenção registrada no documento de origem.


**Display Font:** Sora (with ui-sans-serif, system-ui fallback)  
**Body Font:** DM Sans (with ui-sans-serif, system-ui fallback)  
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Cascadia Code fallback)

**Character:** Sora delivers engineered confidence with tight negative tracking; DM Sans keeps long explanations readable; mono grounds filesystem paths and outputs in credibility.

### Hierarchy

- **Display** (600, clamp 1.875rem–3.75rem, line-height 1.08): Hero headline only. One per viewport above the fold.
- **Headline** (600, clamp 1.875rem–2.6rem, line-height 1.15): Section titles (`h2`). Always `font-sora` with `-0.03em` tracking.
- **Title** (600, 1.25rem, line-height 1.25): Card titles, form section headers (`h3`/`h4`).
- **Body** (400–500, 1rem–1.25rem, line-height 1.625): Paragraphs via `font-editorial`. Max width `max-w-3xl` on marketing copy.
- **Label** (600, 0.75rem, letter-spacing 0.14–0.18em, uppercase): Section eyebrows, form labels.
- **Mono** (400, 0.6875rem–0.75rem): File artifacts (`spec.md`, `plan.md`), email in contact cards.

### Named Rules

**The Single Voice Display Rule.** Only one display-scale headline per section. Supporting emphasis uses weight or solid accent color, not a second display size.

**The Uppercase Eyebrow Rule.** Labels above headlines are always uppercase with wide tracking and a bordered pill. They announce context; they do not repeat the headline wording.

## Layout

Ritmo vertical das seções de 96px (`py-24`), com separadores de 1px na cor
line a 40%. Textos editoriais têm largura de leitura de 65–75ch; blocos de
marketing usam `max-w-3xl`. Cards usam padding de 24px no mobile e 32px no
desktop. Alvos de navegação usam `scroll-mt-28` para compensar o cabeçalho fixo.
Estes padrões são registrados pelo DESIGN.md de origem; não constituem um grid
universal medido em todas as rotas.

## Elevation & Depth

This system is **flat-by-default with luminous response**. Structural depth is conveyed through tonal layering (canvas → surface cards → paper panel), radial washes, and border opacity, not stacked Material shadows.

### Shadow Vocabulary

- **Emphasis Glow** (`box-shadow: 0 0 60px -12px rgb(255 151 95 / 0.45)`): Primary CTAs and flagship cards.
- **Label Glow** (`box-shadow: 0 0 60px -12px rgb(178 185 255 / 0.4)`): Rare alternate beside the emphasis glow.
- **Corner Bloom** (absolute blurred circles, `blur-2xl`/`blur-3xl`, low opacity of orange, indigo, or green): Decorative depth inside cards; never interactive.

### Named Rules

**The Flat-By-Default Rule.** Surfaces at rest have no drop shadow. Glow appears on CTAs and hero containers only.

**The Glass-With-Substance Rule.** `backdrop-blur-md` pairs with a visible border (line at 50–60% opacity) and a tinted fill (surface at 20–30% opacity). Blur alone is insufficient.

## Shapes

Pills de 9999px em botões, chips e navegação; raios de 16px em painéis e de
24px em molduras de destaque. Cantos pequenos de 4px em código inline.
O token `md` de 12px existe no documento de origem; classes utilitárias como
`rounded-xl` usam 16px conforme a descrição dos componentes.

## Components

### Buttons

- **Shape:** Fully rounded pills (`rounded-full` / 9999px).
- **Primary:** `bg-gradient-mind` (orange emphasis), ink text `#232b28`, `font-semibold`, `tracking-tight`, padding `py-3.5`–`py-4` / `px-8`, class `shadow-glow`. Hover: `-translate-y-0.5` (no bounce).
- **Secondary:** `border-mind-border/80`, `bg-mind-surface/40`, text `#eeeae0`, `backdrop-blur-sm`. Hover: surface brightens, border picks up orange at 40% opacity.
- **Submit (forms):** Same gradient as primary but `rounded-xl` (16px) and full width on mobile. Label uses ink, not light text.

### Chips / Badges

- **Style:** `rounded-full`, 1px border at 30–35% role opacity, 10% role fill, uppercase label typography.
- **Variants:** Indigo for labels and code, orange for emphasis, green for confirming evidence.

### Cards / Containers

- **Corner Style:** `rounded-2xl` (16px) for content panels; `rounded-3xl` (24px) for hero/feature frames.
- **Background:** `bg-mind-surface/20`–`/30` with `bg-mind-bg/40` inner wells.
- **Shadow Strategy:** `shadow-glow` on flagship cards only.
- **Border:** `border-mind-border/50`–`/60`.
- **Paper panel:** `bg-mind-paper` and `text-mind-ink`. Use it for a fact that must be read as a record, such as expected versus observed.
- **Internal Padding:** `p-6` mobile, `p-8` desktop (`24px`–`32px`).

### Inputs / Fields

- **Style:** `rounded-xl`, `border-mind-border/50`, `bg-mind-bg/40`, text `#eeeae0`, muted placeholders at 50% opacity.
- **Focus:** Border shifts to `mind-accent` (orange); no default browser outline.
- **Error / Success:** `rounded-xl` banners. Success uses evidence green. Error stays a distinct failure state and does not borrow the orange CTA.

### Navigation

- **Header:** Fixed top; transparent at rest, canvas at 85% + `backdrop-blur-md` + bottom border on scroll.
- **Desktop links:** Pill hover (`rounded-full`, `bg-mind-surface/40`, text `#eeeae0`).
- **Mobile:** Full-width stack under header.
- **Logo lockup:** Symbol with auto width beside the CodeSteer wordmark in the header and the footer. The hero symbol is limited by height, with automatic width, and does not reuse the old wide logotype widths.

### IDE Logo Strip

- **Style:** Inline flex pills, logo 20px, `border-mind-border/60`, `bg-mind-bg/60`, muted label text. No card grid; single wrapping row inside a glass container.
- **Order:** After the squad concept and before the Cognitive Base. Cursor, Claude Code, GitHub Copilot, Antigravity, Kiro, OpenCode, Codex. OpenCode has no SVG and uses the `Code2` icon.

## Do's and Don'ts

### Do:

- **Do** keep the page on the dark canvas (`#171918`) with `#eeeae0` text.
- **Do** use the orange gradient only on primary CTAs and brand moments, not on body text blocks.
- **Do** pair every `backdrop-blur` panel with border + tinted fill so content stays legible.
- **Do** reserve uppercase eyebrows and mono spans for artifacts, paths, and technical outputs.
- **Do** use hover lift (`-translate-y-0.5`) with ease-out transitions under 300ms on buttons only.
- **Do** maintain section rhythm with `py-24` and `border-t border-mind-border/40` separators.
- **Do** keep shortcut targets below the fixed header with `scroll-mt-28`.

### Don't:

- **Don't** restore indigo `#4f46e5`, violet `#7c3aed`, or cyan `#06b6d4`.
- **Don't** use pure `#000000` or `#ffffff` as the palette text; body text is `#eeeae0` and paper text is `#232b28`.
- **Don't** add colored left/right stripes thicker than 1px on cards or alerts; use full borders or tinted backgrounds instead.
- **Don't** use `background-clip: text` gradient headlines.
- **Don't** deploy glassmorphism on the header at page top without scroll state; transparency is for scrolled chrome or inner cards only.
- **Don't** invent a numeric proof metric. The page proves the mechanism in prose.
- **Don't** bring back pipeline tabs, an agent catalog, or a quality-gates comparison table.
- **Don't** open modals for content that fits inline.
- **Don't** use bounce or elastic easing on motion; particles and hover use ease-in-out or ease-out only.
- **Don't** copy the tutorial layout. This palette is the tutorial's; the page structure is the landing's.
