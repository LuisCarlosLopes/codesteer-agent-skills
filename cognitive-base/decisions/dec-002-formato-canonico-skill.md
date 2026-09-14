---
id: dec-002
type: adr
title: Formato canônico da skill (SKILL.md + references + scripts)
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: sys-001
    rel: documents
  - id: dec-005
    rel: related-to
tags: [adr, skill, formato]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
---

# Formato canônico da skill (SKILL.md + references + scripts)

## Contexto

Cada agente (Cursor, Claude Code, Copilot, Windsurf, Cline, Antigravity) usa pasta e convenção próprias. Sem um formato **único e validável**, a [[meta/glossary#asp|ASP]] não consegue catalogar, hashear nem entregar a mesma [[meta/glossary#skill|skill]] a todos. Instruções enciclopédicas no arquivo principal causam [[meta/glossary#context-bloat|context bloat]].

## Decisão

Toda skill vive em `packages/skills-catalog/skills/<categoria>/<nome-kebab>/` com:

```
SKILL.md                 # obrigatório — frontmatter YAML + corpo ≤ 500 linhas
references/              # opcional — carregado sob demanda
templates/               # opcional — scaffold
scripts/                 # opcional — automação, sujeita a sandbox
```

Regras que o validador impõe:

- **Sem `README.md`** na pasta da skill (o consumidor é o LLM, não o humano).
- `description` contém *"Use when..."* e *"Do NOT use for..."*.
- Nomenclatura **kebab-case** em pastas e arquivos.
- Frontmatter inclui `name`, `description`, `metadata.version`, `compatibility`, `sandbox`.

[[meta/glossary#progressive-disclosure|Progressive disclosure]] começa aqui: o corpo é o nível 1; `references/` e `scripts/` só entram via MCP `fetch_skill_files` / `prepare_skill_files` ou quando a CLI já instalou os arquivos no disco.

## Alternativas Consideradas

| Alternativa | Por que não |
| --- | --- |
| Um `README.md` humano + prompt solto | Polui o espaço semântico do agente; o validador não sabe o que é instrução |
| Um único arquivo ilimitado | Estoura contexto; impede hash por arquivo e staging seletivo |
| Formato nativo de cada IDE (`.cursor/rules`, `.claude/skills`) | Volta à fragmentação que a plataforma existe para eliminar |
| Pacote NPM por skill, sem `SKILL.md` | Perde gatilhos de ativação e contrato de sandbox no frontmatter |

## Consequências

- `tools/validate-skills.ts` é gate, não linter opcional ([[dec-005-integridade-supply-chain]]).
- Autores fragmentam manuais em `references/`; o MCP não manda o manual no `read_skill`.
- Portal humano ([[sys-005-portal-web]]) documenta o catálogo **fora** da pasta da skill.
- Instalação multi-agente ([[dec-004-entrega-dupla-cli-mcp]]) copia/simlinka este diretório canônico para as pastas nativas.

## Notas Relacionadas

- [[sys-001-skills-catalog]] — onde o formato é armazenado e compilado
- [[gd-030-primeiros-passos]] — checklist para a primeira skill
- [[dec-004-entrega-dupla-cli-mcp]] — como o formato chega ao agente sem duplicar instruções

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | ADR retroativo do blueprint ASP v1.0.0 |
