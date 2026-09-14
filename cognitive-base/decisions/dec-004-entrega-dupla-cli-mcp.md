---
id: dec-004
type: adr
title: Entrega dupla — CLI estática e MCP com progressive disclosure
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: sys-003
    rel: documents
  - id: sys-004
    rel: documents
  - id: dec-002
    rel: depends-on
  - id: dec-003
    rel: depends-on
tags: [adr, cli, mcp, progressive-disclosure]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
---

# Entrega dupla — CLI estática e MCP com progressive disclosure

## Contexto

Agentes atuais se dividem em dois modos: os que **esperam arquivos** em pastas conhecidas (`.cursor/skills`, `.claude/skills`, …) e os que **chamam tools** via [[meta/glossary#mcp|MCP]]. Um único canal deixa metade do mercado de fora. Copiar o `SKILL.md` inteiro + `references/` no system prompt em ambos os casos reintroduz [[meta/glossary#context-bloat|context bloat]].

## Decisão

Dois canais, mesmo [[meta/glossary#registry|registry]] e mesmo `libs/core` ([[dec-003-arquitetura-hexagonal-core]]):

**1. CLI (`@scope/agent-skills`)** — canal estático. Instala a pasta canônica ([[dec-002-formato-canonico-skill]]) por symlink (ou cópia se o SO bloquear) no diretório local ou global de cada agente. Comandos: `install`, `update` (a partir do [[meta/glossary#lockfile|lockfile]]), escopos `--global` / projeto. UI Ink ou modo headless.

Mapeamento de destino (local / global): Cursor `.cursor/skills/` · Claude Code `.claude/skills/` · Antigravity `.agent/skills/` · Copilot `.github/skills/` · Windsurf `.windsurf/skills/` · Cline `.cline/skills/`.

**2. MCP (`@scope/agent-skills-mcp`)** — canal dinâmico via `stdio`. **Não** clona a árvore do projeto. Tools, nesta ordem:

1. `search_skills(query, category)` — fuzzy (Fuse.js) + cosseno com [[meta/glossary#embeddings|embeddings]]; só títulos e resumos
2. `read_skill(skill_name)` — baixa `SKILL.md`, valida hash, lista `references/` disponíveis
3. `fetch_skill_files` — referência pontual
4. `prepare_skill_files` — staging em `~/.cache/agent-skills/staged/<revision-hash>/` para executar script sem despejar código no contexto

Isso **é** [[meta/glossary#progressive-disclosure|progressive disclosure]] no protocolo.

Cadeia de URL: `ASP_REGISTRY_URL` → `~/.agent-skills/config.json` `registryUrl` → CDN pública ([[meta/glossary#air-gapped|air-gapped]]).

## Alternativas Consideradas

| Alternativa | Por que não |
| --- | --- |
| Só CLI | Agentes MCP-first inflariam o repo e o contexto com arquivos mortos |
| Só MCP | Cursor/Claude/Copilot “clássicos” não recebem a skill na pasta que o produto já indexa |
| MCP que devolve SKILL.md + todas as references de uma vez | Derrota o objetivo de progressive disclosure |
| Gerar wrappers nativos por IDE no catálogo | Volta à fragmentação; o formato canônico deixaria de ser único |

## Consequências

- Busca semântica híbrida é requisito do MCP, compilada na CI (`embeddings.json`), não uma chamada online no `search_skills`.
- Scripts nunca são o default do `read_skill`; passam por staging e [[meta/glossary#sandbox|sandbox]] (`ASP_EXECUTION_MODE=container` no enterprise).
- Overviews: [[sys-003-cli-agent-skills]] e [[sys-004-mcp-server]].
- Testes de entrega cobrem **os dois** canais contra o mesmo registry.

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — posição dos dois canais na topologia
- [[dec-002-formato-canonico-skill]] — o que cada canal entrega
- [[dec-005-integridade-supply-chain]] — hash verificado no download CLI e no `read_skill` MCP

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | ADR retroativo do blueprint ASP v1.0.0 |
