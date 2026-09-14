---
id: sys-004
type: service
title: MCP server — canal dinâmico com progressive disclosure
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
tags: [service, mcp, progressive-disclosure]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
  package: packages/mcp-server
---

# MCP server — canal dinâmico com progressive disclosure

## Responsabilidade

Pacote `packages/mcp-server`, publicado como `@scope/agent-skills-mcp`. Canal **dinâmico** ([[dec-004-entrega-dupla-cli-mcp]]): o agente não recebe a árvore da [[meta/glossary#skill|skill]] no repo; consome tools via [[meta/glossary#mcp|MCP]] `stdio` (FastMCP).

```json
{
  "mcpServers": {
    "agent-skills": {
      "command": "npx",
      "args": ["-y", "@scope/agent-skills-mcp"],
      "env": { "ASP_REGISTRY_URL": "https://meu-registro-privado.empresa.com/skills" }
    }
  }
}
```

Tools (ordem de [[meta/glossary#progressive-disclosure|progressive disclosure]]):

| Tool | Retorno |
| --- | --- |
| `search_skills(query, category)` | Títulos + resumos (Fuse.js + cosseno em [[meta/glossary#embeddings|embeddings]] em memória / WASM) |
| `read_skill(skill_name)` | `SKILL.md` + lista de `references/` após [[meta/glossary#content-hash|content hash]] |
| `fetch_skill_files(skill_name, file_paths)` | Texto de referências pontuais |
| `prepare_skill_files(..., dry_run)` | Staging em `~/.cache/agent-skills/staged/<revision-hash>/` |

`prepare_skill_files` não executa o script; no enterprise o runtime usa [[meta/glossary#sandbox|sandbox]] `ASP_EXECUTION_MODE=container`.

## Dependências

- `libs/core` para fetch, hash e resolução de registry ([[sys-002-libs-core]]).
- Artefatos `skills-registry.json` + `embeddings.json` de [[sys-001-skills-catalog]].
- Mesma cadeia de URL [[meta/glossary#air-gapped|air-gapped]] da CLI.

## SLA

> ⚠️ A completar pelo autor. Alvo: `search_skills` em memória (ms, sem round-trip a API de embeddings); hash inválido → erro ao agente, sem entregar corpo.

## Donos

Engenharia de Arquitetura de Software · `@luiscarloslopesjr`

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — MCP entre storage e agentes tool-based
- [[dec-005-integridade-supply-chain]] — revalidação de hash no `read_skill`
- [[sys-003-cli-agent-skills]] — canal irmão (arquivos no disco)

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | Overview alvo extraído do blueprint ASP |
