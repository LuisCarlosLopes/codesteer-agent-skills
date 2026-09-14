---
id: gd-030
type: how-to
title: Primeiros passos na Agent Skill Platform
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: depends-on
  - id: dec-002
    rel: related-to
tags: [onboarding, nx, skill]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
---

# Primeiros passos na Agent Skill Platform

## Contexto

O repositório ainda está na Fase 1 do blueprint (fundação Nx + `libs/core`). Este guia diz **por onde começar** para não inverter a ordem das fases nem violar o formato canônico da [[meta/glossary#skill|skill]]. A topologia completa está em [[gd-001-visao-geral-arquitetura]].

## Estrutura obrigatória

Antes de escrever código de produto, o monorepo deve existir neste esqueleto (decisão [[dec-001-monorepo-modular-publicacao-desacoplada]]):

```
agent-skills-platform/
├── libs/core/                 # ports, adapters, services
├── packages/
│   ├── skills-catalog/
│   ├── cli/
│   ├── mcp-server/
│   └── portal-web/
├── tools/
│   ├── validate-skills.ts
│   └── skill-generator/
├── nx.json
└── tsconfig.base.json
```

Uma skill nova **só** nasce em `packages/skills-catalog/skills/<categoria>/<nome-kebab>/` com `SKILL.md` — nunca com `README.md` na pasta da skill ([[dec-002-formato-canonico-skill]]).

## Passo a passo

1. **Ler a visão** — [[gd-001-visao-geral-arquitetura]] e as cinco ADRs ligadas a ela. Não implemente CLI/MCP antes do núcleo hexagonal ([[dec-003-arquitetura-hexagonal-core]]).
2. **Fase 1 — Fundação** — configurar Nx, TypeScript estrito e `libs/core` com testes unitários + property-based (`fast-check`). Portas primeiro; adaptadores Node depois. Overview: [[sys-002-libs-core]].
3. **Fase 2 — Catálogo e segurança** — `compile-catalog.ts`, `validate-skills.ts` e scanner SAST. Gate bloqueante de merge ([[dec-005-integridade-supply-chain]]). Sem isso, não publique.
4. **Primeira skill canônica** — `description` com *"Use when..."* e *"Do NOT use for..."*; corpo ≤ 500 linhas; extras em `references/`. Valide com `tools/validate-skills.ts`.
5. **Fase 3 — CLI** — `npx @scope/agent-skills install --skill <nome> --agents cursor claude-code ...` ([[sys-003-cli-agent-skills]]).
6. **Fase 4 — MCP** — `search_skills` → `read_skill` → `fetch_skill_files` / `prepare_skill_files` ([[sys-004-mcp-server]], [[dec-004-entrega-dupla-cli-mcp]]).
7. **Fase 5 — Enterprise** — `ASP_REGISTRY_URL`, [[meta/glossary#embeddings|embeddings]] no build, portal ([[sys-005-portal-web]]), [[meta/glossary#sandbox|sandbox]] `ASP_EXECUTION_MODE=container`.

## Checklist

- [ ] Nx e `libs/core` existem com ports cobertos por teste
- [ ] Nenhuma skill tem `README.md` na própria pasta
- [ ] `description` tem gatilho positivo e escopo negativo
- [ ] CI calcula SHA-256 e bloqueia [[meta/glossary#prompt-injection|prompt injection]] crítico
- [ ] CLI e MCP dependem de `libs/core`, não reimplementam download/hash
- [ ] Mirror [[meta/glossary#air-gapped|air-gapped]] só entra depois do registry público/privado funcionar

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — mapa mental antes de clonar a árvore
- [[dec-002-formato-canonico-skill]] — regras que o validador vai recusar no PR
- [[sys-001-skills-catalog]] — onde as skills vivem e como compilam o registry

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | Extraída do plano de fases do blueprint ASP |
