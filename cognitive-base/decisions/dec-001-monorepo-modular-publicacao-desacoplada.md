---
id: dec-001
type: adr
title: Monorepo modular com publicação desacoplada de artefatos
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: sys-001
    rel: related-to
  - id: sys-002
    rel: related-to
tags: [adr, nx, monorepo]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
---

# Monorepo modular com publicação desacoplada de artefatos

## Contexto

A plataforma precisa versionar juntas a [[meta/glossary#skill|skill]], o validador, o núcleo de domínio e os dois clientes (CLI e [[meta/glossary#mcp|MCP]]), mas os **artefatos publicados** (registry, pacotes NPM, CDN) não podem exigir que o consumidor clone o monorepo. Fragmentar em vários repositórios cedo duplicaria contratos; um monólito de deploy acoplaria o portal ao runtime dos agentes.

## Decisão

Adotar **monorepo Nx modular** (`libs/core`, `packages/*`, `tools/*`) com **publicação desacoplada**: o merge no monorepo dispara compile + CI, e só os artefatos (`skills-registry.json`, `embeddings.json`, pacotes `@scope/agent-skills` e `@scope/agent-skills-mcp`) saem para NPM, storage corporativo ou CDN.

A árvore-alvo está em [[gd-001-visao-geral-arquitetura]]. O catálogo permanece fonte editável; o registry é o artefato de consumo ([[sys-001-skills-catalog]]).

## Alternativas Consideradas

| Alternativa | Por que não |
| --- | --- |
| Multirepo (um repo por pacote) | Contratos `SKILL.md` / ports divergem; bump coordenado vira processo manual |
| Monólito publicado inteiro | Consumidor [[meta/glossary#air-gapped|air-gapped]] e o agente puxariam código de portal, testes e gerador |
| Só CDN de arquivos soltos, sem monorepo | Sem gate único de validação; supply chain fica no autor de cada gist |

## Consequências

- Nx Release e tags SemVer por pacote; o catálogo pode versionar independente da CLI.
- CLI e MCP **devem** depender de `libs/core` ([[dec-003-arquitetura-hexagonal-core]]), não copiar I/O.
- Primeiro passo de implementação é o esqueleto Nx, não a UI Ink ([[gd-030-primeiros-passos]]).
- Mudança de formato canônico ([[dec-002-formato-canonico-skill]]) quebra o compilador no mesmo PR — desejável.

## Notas Relacionadas

- [[gd-001-visao-geral-arquitetura]] — topologia que esta decisão materializa
- [[sys-001-skills-catalog]] — pacote de autoria vs artefato publicado
- [[sys-002-libs-core]] — biblioteca compartilhada no monorepo, não publicada como runtime de agente

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | ADR retroativo do blueprint ASP v1.0.0 |
