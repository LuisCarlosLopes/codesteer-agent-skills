---
id: dec-005
type: adr
title: Integridade de supply chain — SHA-256, SAST e gate bloqueante
status: draft
created: "2026-09-14"
updated: "2026-09-14"
author: "@luiscarloslopesjr"
links:
  - id: gd-001
    rel: related-to
  - id: sys-001
    rel: related-to
  - id: dec-002
    rel: depends-on
tags: [adr, seguranca, supply-chain]
source: greenfield
migration_status: ""
meta:
  blueprint: arquitetura_plataforma_skills_mcp.md
---

# Integridade de supply chain — SHA-256, SAST e gate bloqueante

## Contexto

Skills públicas na web não passam por triagem. Relatos citados no blueprint apontam >13% de scripts/prompts de terceiros com exfiltração, comandos destrutivos ou jailbreak. Sem gate, a [[meta/glossary#asp|ASP]] seria um vetor de [[meta/glossary#prompt-injection|prompt injection]] institucionalizado. Hash só no cliente, sem manifesto, permite swap de arquivo na CDN.

## Decisão

Nenhuma skill entra no [[meta/glossary#registry|registry]] sem esteira bloqueante:

```
PR → validate-skills.ts → SAST / Snyk Agent Scan / LLM Guard
   → compile-catalog.ts (SHA-256 por arquivo = contentHash)
   → publica NPM/S3 com proveniência e SemVer
```

O gatekeeper cobre:

1. Jailbreak e *system prompt override*.
2. AST de `scripts/`: `rm -rf /`, `curl | bash`, leitura de `AWS_SECRET_ACCESS_KEY` / `OPENAI_API_KEY`.
3. Imutabilidade: clientes (`RegistryService.verifyChecksum`) recusam bytes cujo hash ≠ manifesto.

Complementos de runtime: frontmatter `sandbox`, e no enterprise `ASP_EXECUTION_MODE=container` ([[meta/glossary#sandbox|sandbox]] sem rede).

A ausência de `README.md` na pasta da skill ([[dec-002-formato-canonico-skill]]) também é regra de segurança semântica: reduz superfície de instrução ambígua.

## Alternativas Consideradas

| Alternativa | Por que não |
| --- | --- |
| Confiar no autor / review só humana | Não escala; 13%+ de payloads maliciosos em skills soltas |
| Hash no cliente sem manifesto assinado no build | CDN ou mirror comprometido substitui o arquivo |
| Scan só de dependências NPM, ignorar o corpo do prompt | Prompt injection não aparece no SCA clássico |
| Permitir merge com warning | Pressão de prazo publica a skill venenosa |

## Consequências

- Fase 2 ([[gd-030-primeiros-passos]]) é pré-requisito de qualquer publicação — inclusive as 5–10 skills canônicas iniciais.
- `compile-catalog.ts` é compilador de integridade, não só um bundler de JSON.
- Falha crítica de SAST **bloqueia merge**; não há bypass por label.
- CLI e MCP compartilham `verifyChecksum` em [[sys-002-libs-core]]; não reimplementar na borda.

## Notas Relacionadas

- [[dec-002-formato-canonico-skill]] — o que o linter estrutural valida antes do SAST
- [[sys-001-skills-catalog]] — dono de `compile-catalog.ts` e `scan-skills.ts`
- [[sys-004-mcp-server]] — `read_skill` / `prepare_skill_files` revalidam hash no fetch

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-09-14 | @luiscarloslopesjr   | ADR retroativo do blueprint ASP v1.0.0 |
