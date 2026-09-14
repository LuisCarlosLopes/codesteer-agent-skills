---
id: sys-005
type: service
title: portal-web — catálogo e documentação estática
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: sys-001
    rel: depends-on
  - id: dec-001
    rel: related-to
tags: [service, portal, docs]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
  package: packages/portal-web
---

# portal-web — catálogo e documentação estática

## Responsabilidade

Pacote `packages/portal-web`: portal estático (Next.js SSG) para **humanos** — documentação e catálogo online da [[meta/glossary#asp|ASP]].

- Consome o mesmo [[meta/glossary#registry|registry]] publicado por [[sys-001-skills-catalog]].
- Não é runtime de agente: CLI e MCP não dependem deste pacote.
- Hospeda guias que **não** podem viver como `README.md` dentro da pasta da [[meta/glossary#skill|skill]] ([[dec-002-formato-canonico-skill]]).
- Entrega da Fase 5 (extensões enterprise), junto com mirrors e busca híbrida.

## Dependências

- Artefato `skills-registry.json` (e eventualmente páginas geradas a partir das `description`).
- Storage/CDN da camada de distribuição ([[dec-001-monorepo-modular-publicacao-desacoplada]]).
- Não depende de `libs/core` no browser; se houver preview de hash, é leitura do manifesto, não instalação.

## SLA

> ⚠️ A completar pelo autor. Alvo: site estático, publicável em ambiente [[meta/glossary#air-gapped|air-gapped]] a partir do registry interno.

## Donos

Engenharia de Arquitetura de Software · `@luiscarloslopesjr`

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — portal na camada de distribuição, não na de entrega ao agente
- [[gd-030-primeiros-passos]] — Fase 5; não bloquear Fases 1–4
- [[sys-001-skills-catalog]] — fonte de verdade do que o portal lista

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | Overview alvo extraído do blueprint ASP |
