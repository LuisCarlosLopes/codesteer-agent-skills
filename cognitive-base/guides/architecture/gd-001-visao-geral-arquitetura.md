---
id: gd-001
type: architecture-overview
title: Visão geral da arquitetura da Agent Skill Platform
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: dec-001
    rel: documents
  - id: dec-002
    rel: documents
  - id: dec-003
    rel: documents
  - id: dec-004
    rel: documents
  - id: dec-005
    rel: documents
  - id: gd-030
    rel: related-to
tags: [arquitetura, asp, overview]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
---

# Visão geral da arquitetura da Agent Skill Platform

## Componentes

A [[meta/glossary#asp|Agent Skill Platform]] é um **monorepo modular** (Nx) com publicação desacoplada de artefatos — decisão em [[dec-001-monorepo-modular-publicacao-desacoplada]]. Cinco peças formam o sistema-alvo:

| Peça | Pacote | Papel |
| --- | --- | --- |
| Catálogo | `packages/skills-catalog` | Autoria das [[meta/glossary#skill|skills]] no formato canônico ([[dec-002-formato-canonico-skill]]) |
| Núcleo | `libs/core` | Domínio hexagonal: registry, install, lockfile ([[dec-003-arquitetura-hexagonal-core]]) |
| CLI | `packages/cli` | Entrega estática para diretórios dos agentes ([[sys-003-cli-agent-skills]]) |
| MCP | `packages/mcp-server` | Entrega dinâmica via [[meta/glossary#mcp|MCP]] com [[meta/glossary#progressive-disclosure|progressive disclosure]] ([[sys-004-mcp-server]]) |
| Portal | `packages/portal-web` | Catálogo e docs estáticos ([[sys-005-portal-web]]) |

A esteira (`tools/validate-skills.ts` + SAST + compilador de [[meta/glossary#content-hash|content hash]]) é o gate de [[dec-005-integridade-supply-chain]].

Três problemas que a topologia ataca: fragmentação de ecossistemas (cada agente tem pasta própria), [[meta/glossary#prompt-injection|prompt injection]] em skills públicas, e [[meta/glossary#context-bloat|context bloat]].

## Diagrama

```
  packages/skills-catalog          tools/validate-skills.ts
           |                                |
           v                                v
     SKILL.md + refs  ----->  CI: lint + SAST + SHA-256
                                        |
                                        v
                          skills-registry.json + embeddings.json
                                        |
                    +-------------------+-------------------+
                    v                   v                   v
                 NPM/CDN          storage S3/Artifactory   portal-web
                    |                   |
           +--------+--------+          |
           v                 v          |
     @scope/agent-skills   @scope/agent-skills-mcp
     (CLI / symlink)       (stdio / tools)
           |                 |
           v                 v
    .cursor .claude     search_skills → read_skill
    .agent  .github     → fetch_skill_files
                        → prepare_skill_files (sandbox)
```

`libs/core` não aparece na linha de publicação: CLI e MCP **dependem** dele via ports, sem o domínio conhecer Ink, FastMCP ou o sistema de arquivos real.

## Como se conectam

1. O autor versiona uma skill em `packages/skills-catalog`. Merge só passa depois da validação estrutural e do scanner de segurança ([[dec-005-integridade-supply-chain]]).
2. `compile-catalog.ts` emite o [[meta/glossary#registry|registry]] e os [[meta/glossary#embeddings|embeddings]]; o artefato vai para NPM e/ou mirror [[meta/glossary#air-gapped|air-gapped]].
3. Consumo **estático**: a CLI ([[sys-003-cli-agent-skills]]) baixa, verifica hash, grava o [[meta/glossary#lockfile|lockfile]] e instala por symlink/cópia nos diretórios de cada agente.
4. Consumo **dinâmico**: o servidor MCP ([[sys-004-mcp-server]]) não clona a árvore do projeto; entrega contexto em camadas ([[dec-004-entrega-dupla-cli-mcp]]).
5. O portal ([[sys-005-portal-web]]) lê o mesmo registry para humanos; não é caminho de runtime do agente.

Onboarding prático: [[gd-030-primeiros-passos]].

## Notas Relacionadas

- [[dec-001-monorepo-modular-publicacao-desacoplada]] — por que monorepo + artefatos desacoplados
- [[dec-002-formato-canonico-skill]] — contrato da unidade de entrega
- [[dec-003-arquitetura-hexagonal-core]] — por que CLI e MCP compartilham o mesmo núcleo
- [[dec-004-entrega-dupla-cli-mcp]] — os dois canais de consumo
- [[dec-005-integridade-supply-chain]] — o que bloqueia publicação
- [[sys-001-skills-catalog]] · [[sys-002-libs-core]] · [[sys-003-cli-agent-skills]] · [[sys-004-mcp-server]] · [[sys-005-portal-web]] — estado-alvo de cada peça
- [[gd-030-primeiros-passos]] — como começar a construir dentro desta topologia

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | Extraída do blueprint ASP v1.0.0 |
