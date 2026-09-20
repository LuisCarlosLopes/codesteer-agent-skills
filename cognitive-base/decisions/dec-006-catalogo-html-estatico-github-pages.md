---
id: dec-006
type: adr
title: Catálogo HTML estático no GitHub Pages, não portal Next.js
status: draft
created: "2026-09-20"
updated: "2026-09-20"
author: "@luiscarloslopesjr"
links:
  - id: sys-001
    rel: related-to
  - id: sys-004
    rel: related-to
  - id: sys-005
    rel: related-to
  - id: dec-002
    rel: related-to
  - id: dec-005
    rel: related-to
tags: [adr, catalogo, github-pages, html]
source: greenfield
migration_status: ""
meta: {}
---

# Catálogo HTML estático no GitHub Pages, não portal Next.js

## Contexto

O README humano replicava o [[meta/glossary#registry|registry]] em tabelas e envelhecia a cada [[meta/glossary#skill|skill]]. O blueprint prevê [[sys-005-portal-web]] (Next.js SSG) na Fase 5, mas esta fatia ainda não tem `packages/portal-web`. Precisávamos de um índice filtrável (categoria, nome, descrição) para humanos, uma tool MCP que devolvesse o mesmo HTML ao chamador, e publicação CI — sem versionar `dist/` (já gitignorado pelo compile de [[dec-005-integridade-supply-chain]]).

## Decisão

Um gerador HTML estático irmão de `compile-catalog.ts` (`packages/skills-catalog/src/generate-catalog-html.ts`) emite `dist/index.html` auto-contido. O CLI `pnpm catalog:html` compila o registry e grava o HTML. O MCP importa a mesma função (`generate_catalog_html`) — sem `child_process`. O job `pages` do `ci.yml` publica `packages/skills-catalog/dist` no GitHub Pages em push em `main`/`master`. O README aponta para `https://luiscarloslopes.github.io/codesteer-agent-skills/` no lugar das tabelas.

A página **não** é [[sys-005-portal-web]]: o portal Next.js permanece o alvo da Fase 5. `dist/` continua fora do Git; o artifact de Actions é o único modo compatível com o gitignore.

## Alternativas Consideradas

| Alternativa | Por que não |
| --- | --- |
| Materializar `packages/portal-web` (Next.js SSG) agora | Explode o mapa desta fatia; CLAUDE.md declara o portal fora do recorte atual |
| Estender `compile-catalog.ts` para também gravar `index.html` | Mistura integridade SHA-256 ([[dec-005-integridade-supply-chain]]) com UI humana |
| Spawn `tsx generate-catalog-html.ts` na tool MCP | Corrompe stdout JSON-RPC; nenhuma tool atual faz spawn |
| Commitar `index.html` ou branch `gh-pages` | Contraria `dist/` gitignorado e deixa HTML stale no Git |

## Consequências

- CI de PR passa a falhar se `pnpm catalog:html` quebrar; deploy Pages só ocorre após o job `skills` em push em `main`/`master`.
- O primeiro URL público 404 até o dono ligar Settings → Pages → Source: GitHub Actions.
- `generate_catalog_html` é adjacente às 4 tools de [[meta/glossary#progressive-disclosure|progressive disclosure]] em [[sys-004-mcp-server]] — não é o 5º passo da cadeia.
- Campos interpolados no HTML são escapados; corpo de `SKILL.md` e `files[].contentHash` ficam de fora, alinhado ao formato canônico ([[dec-002-formato-canonico-skill]]).

## Notas Relacionadas

- [[sys-001-skills-catalog]] — dono do gerador e de `dist/index.html`
- [[sys-004-mcp-server]] — tool `generate_catalog_html` importa a função do catálogo
- [[sys-005-portal-web]] — esta página é recorte estático, não o portal Next.js
- [[dec-005-integridade-supply-chain]] — compile SHA-256 permanece separado do HTML

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-20 | @luiscarloslopesjr   | ADR draft: gerador HTML + Pages, sem portal |
