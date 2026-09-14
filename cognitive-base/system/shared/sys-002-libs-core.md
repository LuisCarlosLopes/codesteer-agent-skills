---
id: sys-002
type: service
title: libs/core — domínio hexagonal compartilhado
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: dec-003
    rel: depends-on
  - id: sys-003
    rel: related-to
  - id: sys-004
    rel: related-to
tags: [service, core, hexagonal]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
  package: libs/core
---

# libs/core — domínio hexagonal compartilhado

## Responsabilidade

Biblioteca `libs/core`: única implementação da lógica de negócio da [[meta/glossary#asp|ASP]] ([[dec-003-arquitetura-hexagonal-core]]).

| Área | Conteúdo |
| --- | --- |
| Ports | `FileSystemPort`, `HttpPort`, `PackageResolverPort`, `PathsPort`, `EnvPort`, `LoggerPort` |
| Adapters | Implementações Node.js (fs, HTTP com fallback, env, paths) |
| Services | `RegistryService`, `InstallerService`, `LockfileService` (+ Agents, Audit no esqueleto) |

- **RegistryService:** resolve versão, download concorrente (ex.: 10), `verifyChecksum` em memória, cache local TTL 24h.
- **InstallerService:** descobre pastas de agentes, symlink ou cópia, bloqueia path traversal.
- **LockfileService:** `.skill-lock.json`, escrita [[meta/glossary#atomicidade|atômica]] e rollback se o processo cair.

Não conhece Ink, FastMCP, Next.js nem o layout do catálogo no git — só registry HTTP/arquivo e ports.

## Dependências

- Nenhuma biblioteca de UI ou protocolo de agente.
- Testes: unitários + property-based (`fast-check`) — Fase 1 ([[gd-030-primeiros-passos]]).
- Consumidores obrigatórios: [[sys-003-cli-agent-skills]] e [[sys-004-mcp-server]].

## SLA

> ⚠️ A completar pelo autor. Alvo: cache de registry com TTL 24h; verificação de hash **antes** de persistir; lockfile nunca pela metade.

## Donos

Engenharia de Arquitetura de Software · `@luiscarloslopesjr`

## Notas Relacionadas

- [[dec-003-arquitetura-hexagonal-core]] — por que este pacote existe
- [[dec-005-integridade-supply-chain]] — `verifyChecksum` é o cliente do manifesto
- [[dec-004-entrega-dupla-cli-mcp]] — duas bordas, este núcleo

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | Overview alvo extraído do blueprint ASP |
