---
id: dec-003
type: adr
title: Núcleo hexagonal (Ports & Adapters) em libs/core
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: sys-002
    rel: documents
  - id: sys-003
    rel: related-to
  - id: sys-004
    rel: related-to
tags: [adr, hexagonal, core]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
---

# Núcleo hexagonal (Ports & Adapters) em libs/core

## Contexto

CLI (Ink, `npx`, filesystem, symlinks) e servidor [[meta/glossary#mcp|MCP]] (FastMCP, `stdio`, HTTP/CDN) são superfícies diferentes da **mesma** lógica: resolver versão, baixar, verificar [[meta/glossary#content-hash|content hash]], instalar, gravar [[meta/glossary#lockfile|lockfile]]. Se cada pacote implementar I/O, hashes e paths divergem e testes de domínio viram testes de framework.

## Decisão

Isolar o domínio em `libs/core` com [[meta/glossary#arquitetura-hexagonal|arquitetura hexagonal]]:

**Portas:** `FileSystemPort`, `HttpPort` (inclui `getWithFallback`), `PackageResolverPort`, `PathsPort`, `EnvPort`, `LoggerPort`.

**Serviços de domínio:** `RegistryService` (fetch, download concorrente limitado, hash em memória, cache TTL 24h), `InstallerService` (detecção de agentes, symlink ou cópia, proteção a path traversal), `LockfileService` (`.skill-lock.json`, escrita [[meta/glossary#atomicidade|atômica]]).

Adaptadores Node.js ficam em `libs/core/src/lib/adapters/`. `packages/cli` e `packages/mcp-server` só orquestram UI/protocolo e injetam as portas.

## Alternativas Consideradas

| Alternativa | Por que não |
| --- | --- |
| Lógica dentro da CLI, MCP importa a CLI | Acopla FastMCP a Ink e a `process.argv` |
| Dois núcleos “iguais” em cada pacote | Checksum e lockfile inevitavelmente divergem |
| Core acoplado a `fs`/`fetch` globais | Impede testes PBT e substitui ports em ambiente [[meta/glossary#air-gapped|air-gapped]] |

## Consequências

- Fase 1 do plano ([[gd-030-primeiros-passos]]) é **obrigatoriamente** `libs/core` + testes (`fast-check`), antes de Ink ou FastMCP.
- Trocar CDN por Artifactory é um adapter de `HttpPort` / resolver de URL — não um fork do installer.
- Qualquer feature de instalação nova nasce no core; CLI/MCP só expõem comando ou tool.
- Overview da biblioteca: [[sys-002-libs-core]].

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — o core é dependência pontilhada de CLI e MCP
- [[dec-004-entrega-dupla-cli-mcp]] — duas superfícies, um domínio
- [[dec-005-integridade-supply-chain]] — `verifyChecksum` vive no `RegistryService`, não no workflow YAML

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | ADR retroativo do blueprint ASP v1.0.0 |
