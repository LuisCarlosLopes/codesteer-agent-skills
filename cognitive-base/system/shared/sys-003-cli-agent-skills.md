---
id: sys-003
type: service
title: CLI agent-skills — canal estático de instalação
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: dec-004
    rel: depends-on
  - id: sys-002
    rel: depends-on
tags: [service, cli, entrega]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
  package: packages/cli
---

# CLI agent-skills — canal estático de instalação

## Responsabilidade

Pacote `packages/cli`, publicado como `@scope/agent-skills`. Canal **estático** da entrega dupla ([[dec-004-entrega-dupla-cli-mcp]]): materializa a pasta canônica da [[meta/glossary#skill|skill]] no disco do desenvolvedor.

- Modo interativo (React/Ink) e modo headless para CI.
- Comandos: `install`, `update`, `remove`, `list`, `audit`.
- Escopo projeto vs `--global`.
- Exemplos:

```bash
npx @scope/agent-skills install --skill feature-planner --agents cursor claude-code antigravity
npx @scope/agent-skills install --skill aws-architect --global
npx @scope/agent-skills update
```

Não implementa download/hash/lockfile — delega a [[sys-002-libs-core]]. Não serve tools MCP — isso é [[sys-004-mcp-server]].

## Dependências

- `libs/core` (ports injetadas nos adapters Node).
- [[meta/glossary#registry|Registry]] publicado por [[sys-001-skills-catalog]].
- Resolução de URL: `ASP_REGISTRY_URL` → config global → CDN ([[meta/glossary#air-gapped|air-gapped]]).
- Sistema de arquivos do agente (symlink; fallback cópia).

## SLA

> ⚠️ A completar pelo autor. Alvo do blueprint: `update` [[meta/glossary#idempotencia|idempotente]] a partir do [[meta/glossary#lockfile|lockfile]]; instalação interrompida não deixa lockfile corrupto.

## Donos

Engenharia de Arquitetura de Software · `@luiscarloslopesjr`

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — CLI entre storage e IDEs
- [[gd-030-primeiros-passos]] — Fase 3 do plano
- [[dec-003-arquitetura-hexagonal-core]] — proibição de I/O de negócio neste pacote

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | Overview alvo extraído do blueprint ASP |
