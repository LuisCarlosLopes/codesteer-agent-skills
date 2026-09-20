---
id: sys-001
type: service
title: skills-catalog — autoria e compilação do registro
status: draft
created: "2026-09-14"
updated: "2026-09-20"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: dec-002
    rel: depends-on
  - id: dec-005
    rel: depends-on
  - id: sys-005
    rel: related-to
  - id: dec-006
    rel: related-to
tags: [service, catalog, registry]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
  package: packages/skills-catalog
---

# skills-catalog — autoria e compilação do registro

## Responsabilidade

Pacote `packages/skills-catalog`: fonte editável das [[meta/glossary#skill|skills]] oficiais e compilador do [[meta/glossary#registry|registry]].

- Guarda skills em `skills/<categoria>/<nome>/` no formato canônico ([[dec-002-formato-canonico-skill]]).
- `src/compile-catalog.ts` gera `skills-registry.json` (cadastro + [[meta/glossary#content-hash|content hashes]]) e `embeddings.json` ([[meta/glossary#embeddings|embeddings]] da `description`).
- Nesta fatia, `src/generate-catalog-html.ts` (irmão do compile, [[dec-006-catalogo-html-estatico-github-pages]]) emite `dist/index.html` auto-contido a partir do mesmo registry — GitHub Pages e a tool MCP `generate_catalog_html`. Não altera o algoritmo de hash.
- `src/scan-skills.ts` alimenta o scanner de segurança da CI ([[dec-005-integridade-supply-chain]]).
- Categorias previstas: `(architecture)`, `(security)`, `(testing)`, `(product)` — PO, planning, grill-me, PRD.

Não entrega skill ao agente — isso é CLI/MCP. Não é a UI humana de longo prazo — isso é [[sys-005-portal-web]]. A página HTML no GitHub Pages é recorte estático desta fatia, não o portal.

## Dependências

- `tools/validate-skills.ts` (conformidade e frontmatter) — vive em `tools/`, disparado na CI sobre este pacote.
- Esteira SAST / Snyk Agent Scan / LLM Guard.
- Publicação para NPM e/ou storage S3/Artifactory/CDN ([[dec-001-monorepo-modular-publicacao-desacoplada]]).
- Consumidores: [[sys-003-cli-agent-skills]], [[sys-004-mcp-server]], [[sys-005-portal-web]].

## SLA

> ⚠️ A completar pelo autor — o serviço ainda não está em produção. Alvo do blueprint: compile determinístico no CI; qualquer alteração de arquivo muda o `contentHash` e exige novo SemVer.

## Donos

Engenharia de Arquitetura de Software · `@luiscarloslopesjr`

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — posição do catálogo na topologia
- [[gd-030-primeiros-passos]] — quando e como adicionar a primeira skill
- [[dec-002-formato-canonico-skill]] — contrato que este pacote exige
- [[dec-006-catalogo-html-estatico-github-pages]] — gerador HTML + Pages, separado do compile SHA-256

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.2.0  | 2026-09-20 | @luiscarloslopesjr   | Gerador HTML estático em `dist/index.html` ([[dec-006-catalogo-html-estatico-github-pages]]) |
| 1.1.0  | 2026-09-14 | @luiscarloslopesjr   | Categoria `product` (PO, planning, grill-me, PRD) |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | Overview alvo extraído do blueprint ASP |
