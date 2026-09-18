---
name: design-to-html
description: >
  Recreates a UI mock (PNG/JPG/WebP) as static HTML + CSS + JS without a
  framework, in gated stages with user approval: typed ASCII wireframe plus
  plan → full background → components with fonts → remaining assets → final
  review. Also produces a typed nested UI wireframe in ASCII or SVG from a
  screen image or brief. Use when the user mentions design-to-html,
  img-to-html or to-wireframe, attaches a UI mock, screenshot, Figma export
  or interface image and asks to recreate it as HTML, wants a pixel-faithful
  static recreation of a screen, or asks for a typed UI wireframe (ASCII or
  SVG) from a screenshot or screen brief. Do NOT use for React, Vue, Vite or
  other framework apps unless the user explicitly asks, for frontend work
  without a visual mock or screen brief, for design-system documentation, or
  for converting photos that are not UI screens.
metadata:
  version: 0.1.0
  author: "@codesteer"
  license: Apache-2.0
compatibility:
  min_agent_tier: 1
  requires_terminal: true
sandbox:
  network: true
  allow_exec: true
disable-model-invocation: true
---

# Design → HTML

Recria um mock de UI (PNG/JPG/WebP) como HTML estático, camada por camada, ou entrega só o wireframe tipado quando isso for o pedido. Recriar a tela inteira de uma vez mistura erros de cor, glass, ícone e fonte.

Chamadas `$to-wireframe` e pedidos de wireframe ASCII/SVG passam por esta skill — a skill `to-wireframe` não existe mais.

## Modo

Escolha **um** modo pelo pedido, não pelo fato de existir uma imagem no contexto.

| Pedido | Modo | O que entregar |
|--------|------|----------------|
| Recriar a tela em HTML / `design-to-html` / `img-to-html` | Recriação HTML | `.memory-bank/design/{slug}/` com referência, `wireframe.txt`, `index.html` e `assets/` |
| Só o wireframe / `to-wireframe` / `format=ascii\|svg` | Só-wireframe | `.memory-bank/design/{slug}/wireframe.txt` ou `.svg`; **pare**. Sem HTML, CSS, assets, plano de etapas ou gates |

Não dispare a recriação HTML só porque uma imagem apareceu. O HTML principal chama-se exatamente `index.html`.

## Modo só-wireframe

O usuário deve informar `format=svg` ou `format=ascii`. Se faltar, pergunte; não escolha um padrão.

Aceite uma única fonte: `image=<path>` (ou anexo) **ou** `brief=<descrição>`. `output=<path>` é opcional e só sobrescreve o destino. Sem `output`, grave em `.memory-bank/design/{slug}/` (`wireframe.svg` ou `wireframe.txt`). Slug: kebab-case do arquivo ou do brief.

```text
image=mocks/dashboard.png format=svg    → .memory-bank/design/dashboard/wireframe.svg
image=mocks/dashboard.png format=ascii  → .memory-bank/design/dashboard/wireframe.txt
```

Exemplos de chamada (o prefixo `$to-wireframe` ainda é válido):

```text
Use $to-wireframe: format=svg image=mocks/dashboard.png
Use $to-wireframe: format=ascii image=mocks/dashboard.png
Use $to-wireframe: format=svg brief="Dashboard de projetos com sidebar, KPIs e atividade" output=mocks/12-wire-a.svg
```

Leia [references/wireframe.md](references/wireframe.md), desenhe, mostre o path, abra SVG quando fizer sentido, e termine.

## Recriação HTML

**Entrada:** imagem de referência (anexo, path ou URL). Se faltar, peça.
**Saída:** `.memory-bank/design/{slug}/` com a referência copiada, `wireframe.txt`, `index.html` e `assets/`. Pasta temporária, gitignorada — não versionar.
**Slug:** kebab-case curto (ex.: `chatgpt-glass-dash`). Derive do arquivo ou pergunte.

### Pipeline

```
1. reference → ASCII tipado → wireframe.txt + plano → [gate]
2. fundo completo (CSS e/ou imagens)                 → [gate]
3. estrutura e componentes + fontes                  → [gate]
4. assets restantes (ícones, imagens de conteúdo)    → [gate, se houver]
5. revisão final integrada                           → [gate]
```

Cada camada só começa depois da anterior aprovada. A aprovação do plano autoriza a sequência; não substitui os gates de implementação. Se não houver assets restantes, declare isso no plano, omita a etapa 4 e, após a 3, vá para a 5.

### Gate

1. Mostre o resultado (path + abrir `index.html` no browser e/ou screenshot).
2. Pergunte se está correto / se mudaria algo.
3. Pare. Não inicie a etapa seguinte.

Avance só com confirmação explícita ("aprovado", "pode seguir", "ok"). Correção: edite, mostre de novo, espere nova aprovação.

## Layout e stack

```
.memory-bank/design/{slug}/
  reference.[ext]
  wireframe.txt
  index.html
  assets/
    styles.css
    app.js          # só se o mock exigir comportamento
    crops/
    *.png / *.mp4 …
```

Sem build, bundler, framework, `node_modules` ou dev server — abre no browser e funciona.

- `index.html` carrega `<link rel="stylesheet" href="assets/styles.css">` no `<head>` e, se houver JS, `<script src="assets/app.js" defer></script>`.
- Sem `<style>`, `<script>` inline ou `style="…"`. CSS vive em `assets/styles.css`. Default: um arquivo; só quebre por região se passar de ~1500 linhas.
- `assets/` é a única pasta auxiliar.
- CSS puro com custom properties no `:root`. Sem Tailwind. Sem CDN de framework — Google Fonts via `<link>` (ou `@font-face`) é a exceção permitida.
- Região do wireframe → classe CSS (`.nav`, `.hero`, `.card`). Tag tipada → classe utilitária (`.h1`, `.t2`, `.btn`). Mesmo id = mesma classe.
- Conteúdo repetido vai no HTML; `app.js` só para comportamento real, não para gerar markup.
- Paths relativos: `assets/{id}.png`.
- React/Vite só se o usuário pedir explicitamente.

## Etapa 1 — Wireframe ASCII + plano

O wireframe é o contrato com o HTML: cada região e tag tipada vira classe CSS. Vocabulário, aninhamento e revisão estrutural estão em [references/wireframe.md](references/wireframe.md) — leia antes de desenhar.

1. Criar `.memory-bank/design/{slug}/` e copiar a imagem para `reference.[ext]`.
2. Desenhar o ASCII (`format=ascii`, `image=…/reference.[ext]`) e gravar em `…/wireframe.txt`.
3. `wireframe.txt` é o contrato canônico. Sem SVG nesta etapa. Correção estrutural reescreve o mesmo ASCII; não pule para HTML.

Depois do ASCII, mostre um plano curto **na mensagem** (não no ASCII): para cada região, etapa + técnica. Agrupe regiões iguais.

| Região / elemento | Etapa | Técnica prevista |
|-------------------|-------|------------------|
| … | 2–5 | CSS / imagem / composição |

Escolha visualmente CSS, imagem ou os dois (fidelidade vs esforço vs ajuste). Cores, gradientes e formas simples → CSS; arte e textura → imagem; camadas independentes quando precisam de ajuste separado. Textos e controles ficam HTML.

Classifique imagem pela **função**, não pelo formato: fundo da tela → 2; fundo de componente → 3; conteúdo, ícone, avatar → 4. Superfície não se aprova com fundo essencial pendente. Planejar na etapa 1 não é recortar nem gerar.

Gate único: o plano cobre todas as regiões do wireframe e distingue fundo vs assets restantes?

## Etapa 2 — Fundo completo

Pré-requisito: wireframe e plano aprovados.

1. Criar o esqueleto: `index.html` com o `<link>` para `assets/styles.css` e `<body>` vazio; `assets/styles.css` com reset curto + `:root`.
2. Recriar o fundo com a técnica do plano. Gerar agora as imagens necessárias — leia [references/asset-generation.md](references/asset-generation.md). Camadas independentes: mesmo lote paralelo; só compor depois que todas terminarem.
3. Sem navbar, cards ou conteúdo. Elementos decorativos no `<body>`, backgrounds CSS e pseudo-elementos são válidos para o fundo.
4. Ajustar posição, escala, recorte, transparência e mistura. Abrir `index.html` e comparar com a referência.
5. Gate.

## Etapa 3 — Estrutura, componentes e fontes

Markup no `index.html`, estilo no `assets/styles.css`. Ordem: chrome (`nav` — top bar e/ou sidebar), cada tipo de card, demais regiões. Fundo de componente entra junto dele.

### Fontes antes do ajuste fino

1. Para cada tipo de tag (`h1`…`t3`, `btn`, `lnk`, …): família + peso. Se `find-font` existir, crop de uma linha com `text=` case-sensitive; senão, Google Font mais próxima e declare a aproximação.
2. Aplicar `<link>` no HTML ou `@font-face` no CSS; `font-family` / `font-weight` nas classes. Mesmo id de tag = mesma tipografia.
3. Confirmar o carregamento das fontes **antes** de quebras de linha, dimensões e espaçamentos. Não deixe a família/peso para a etapa 5.

Meta: cada superfície indistinguível da referência. Iterar medindo: cores, gradientes, transparência, bordas/rim, glow/sombra, radius, padding, espaçamento, tipografia já aplicada.

Por superfície (nav primeiro, depois card a card): crop da referência → amostrar pixels → markup + classe → screenshot recreate vs crop → ajustar.

Placeholders só para assets da etapa 4, com dimensões reservadas. Gate quando as regiões estiverem implementadas e comparadas.

## Etapa 4 — Assets restantes

Implementar `[ico:]` / `[img:]` / `[av:]` e o que o plano deixou aqui. Não regenerar fundos já aprovados. Omitir se o plano não tiver pendências. Ler [references/asset-generation.md](references/asset-generation.md), gerar o lote, comparar o conjunto, gate da etapa.

## Etapa 5 — Revisão final

1. Screenshot da tela completa vs referência, mesmo viewport, fontes e assets carregados.
2. Cobertura do wireframe/plano; corrigir integração (camadas, recortes, alinhamentos, quebras, espaçamentos).
3. Paths relativos e comportamentos, se houver. Informar aproximações reais.
4. Mostrar tela completa + arquivos → gate.

## Não fazer

- Pular gates ou adiantar várias etapas no mesmo turno.
- Na etapa 1: medir, croppar, OCR, desenhar arte, ou refinar o wireframe além da revisão única.
- Adiar fundo essencial para a etapa 4, ou a escolha de fontes para a revisão final.
- Substituir asset gerado da ref por Lucide/placeholder "parecido".
- CSS inline; `package.json`, bundler, framework; arquivos fora de `assets/`.
- Invocar uma skill `to-wireframe` — o vocabulário e a renderização estão em [references/wireframe.md](references/wireframe.md).
