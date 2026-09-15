# Delivery Report — Criar MCP do catálogo

> **Plano:** `.memory-bank/plans/criar-mcp-do-catalogo/plan.md`
> **Task Breakdown:** `.memory-bank/plans/criar-mcp-do-catalogo/task.md`
> **Data:** 2026-09-14
> **Agente:** codesteer.implementer

---

## Arquivos Gerados/Modificados

| Ação | Arquivo | Status | Observação |
|---|---|---|---|
| CRIAR | `packages/skills-catalog/src/index.ts` | ✅ OK | Reexport de types, `compileCatalog`, `defaultCompileOptions` |
| MODIFICAR | `tsconfig.base.json` | ✅ OK | `paths` → `index.ts`; `include` + `packages/mcp-server/src/**/*.ts` |
| MODIFICAR | `package.json` | ✅ OK | Script `mcp:catalog`; toolchain intacta |
| CRIAR | `packages/mcp-server/package.json` | ✅ OK | `@codesteer/agent-skills-mcp` private; pins `1.7.1` / `7.5.0` / `4.5.4` |
| CRIAR | `packages/mcp-server/project.json` | ✅ OK | Target `test` via vitest |
| CRIAR | `packages/mcp-server/tsconfig.json` | ✅ OK | Extends base |
| CRIAR | `packages/mcp-server/src/catalog/load.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/catalog/hash.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/catalog/paths.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/catalog/search.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/catalog/read.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/catalog/fetch.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/catalog/prepare.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/catalog/errors.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/tools/search-skills.ts` | ✅ OK | `tagger_not_applicable` — wrapper Zod |
| CRIAR | `packages/mcp-server/src/tools/read-skill.ts` | ✅ OK | `tagger_not_applicable` — wrapper Zod |
| CRIAR | `packages/mcp-server/src/tools/fetch-skill-files.ts` | ✅ OK | `tagger_not_applicable` — wrapper Zod |
| CRIAR | `packages/mcp-server/src/tools/prepare-skill-files.ts` | ✅ OK | `tagger_not_applicable` — wrapper Zod |
| CRIAR | `packages/mcp-server/src/server.ts` | ✅ OK | `tagger_required` |
| CRIAR | `packages/mcp-server/src/index.ts` | ✅ OK | `tagger_not_applicable` — entry + `isInvokedDirectly` |
| CRIAR | `packages/mcp-server/src/catalog/load.spec.ts` | ✅ OK | `tagger_not_applicable` — teste |
| CRIAR | `packages/mcp-server/src/catalog/search.spec.ts` | ✅ OK | `tagger_not_applicable` — teste |
| CRIAR | `packages/mcp-server/src/catalog/read.spec.ts` | ✅ OK | `tagger_not_applicable` — teste |
| CRIAR | `packages/mcp-server/src/catalog/fetch.spec.ts` | ✅ OK | `tagger_not_applicable` — teste |
| CRIAR | `packages/mcp-server/src/catalog/prepare.spec.ts` | ✅ OK | `tagger_not_applicable` — teste |
| CRIAR | `packages/mcp-server/src/server.spec.ts` | ✅ OK | `tagger_not_applicable` — teste |
| MODIFICAR | `README.md` | ✅ OK | Consumo local + 4 tools |
| MODIFICAR | `CLAUDE.md` | ✅ OK | `mcp:catalog`, include, MCP local existe |
| MODIFICAR | `pnpm-lock.yaml` | ✅ OK | Efeito autorizado de T1 |

---

## Checklist DoD

Cada item do Definition of Done (Seção 3 do IPD) verificado explicitamente:

- [x] **Funcional:** `pnpm mcp:catalog` aponta para o entry stdio; as 4 tools estão registradas (`server.spec.ts`); search só campos curtos; read só `SKILL.md` + listas; fetch recusa `scripts/`; prepare faz staging/`dry_run` com hash ok
- [x] **Compilação:** `pnpm test` (tsc no include ampliado + vitest) zero erros
- [x] **Testes existentes:** 4 suites anteriores verdes (validate 8, scan 4, compile 4, generator 2)
- [x] **Novos testes:** 18 casos da Seção 6 implementados e passando
- [x] **Lint/Format:** N/A — workspace sem ESLint; nenhum linter introduzido
- [x] **Edge Cases:**
  - [x] skill inexistente → `NotFoundError` da tool
  - [x] `SKILL.md` alterado após o load → `HashMismatchError`, corpo omitido
  - [x] `fetch_skill_files` com `scripts/foo.py` → `PathDeniedError`
  - [x] `file_paths` com `..` ou absoluto → `PathDeniedError`
  - [x] `prepare_skill_files` com `sandbox.allow_exec: false` → `ExecDeniedError`
  - [x] `search_skills` com `category` inexistente → lista vazia
  - [x] `dry_run: true` → não cria diretório de staging
  - [x] `ASP_CATALOG_ROOT` aponta para catálogo temporário nos testes

---

## Resultado dos Testes

```
 ✓ packages/mcp-server/src/catalog/load.spec.ts (2 tests)
 ✓ packages/mcp-server/src/catalog/fetch.spec.ts (4 tests)
 ✓ packages/mcp-server/src/catalog/prepare.spec.ts (4 tests)
 ✓ packages/mcp-server/src/catalog/read.spec.ts (3 tests)
 ✓ packages/mcp-server/src/catalog/search.spec.ts (4 tests)
 ✓ packages/mcp-server/src/server.spec.ts (1 test)
 Test Files  10 passed (10)
      Tests  36 passed (36)
```

---

## Auto-Correção (5 Checks da Fase 2)

| Check | Descrição | Resultado |
|---|---|---|
| CHECK 1 | Compilação sem erros | ✅ `tsc --noEmit -p tsconfig.base.json` + vitest verdes |
| CHECK 2 | Contratos preservados (Seção 2.3 IPD) | ✅ `types.ts` / `compile-catalog.ts` / `validate-skills.ts` intactos; `read_skill` sem corpo de references/scripts; hash mismatch sem corpo |
| CHECK 3 | Escopo respeitado (apenas Mapa de Alterações) | ✅ Sem `libs/core`, CLI, portal, cognitive-base, ci.yml, doc-*; `pnpm-lock.yaml` só como efeito de T1 |
| CHECK 4 | Todos itens DoD satisfeitos | ✅ Seção 3 e todos os `it` da Seção 6 |
| CHECK 5 | Task Breakdown consistente (se disponível) | ✅ T1–T6 `CONCLUÍDA` com checks marcados |

---

## Divergências do Plano Original

| Divergência | Motivo Técnico | Impacto |
|---|---|---|
| Runtime do MCP importa `compileCatalog` via caminho relativo a `src/index.ts`, não pelo alias `@codesteer/skills-catalog` | Vitest/Vite não resolve `tsconfig.paths` sem `vitest.config` (fora do Mapa 4.3). O alias permanece no `tsconfig.base.json` para o typecheck. | Baixo |
| Query `*` em `search_skills` devolve todos os hits de campos curtos (como query vazia) | Fuse.js não trata `*` como “genérico”; o `it` da Seção 6 pede query genérica limitada a campos curtos. | Baixo |
| `FastMCP` criado com `logLevel: 'silent'` | Evita banner/logs do framework no stdio; stdout fica só para JSON-RPC. | Baixo |

---

## Status do Task Breakdown

| Task | Status Inicial | Status Final | Evidência |
|---|---|---|---|
| T1 | PENDENTE | CONCLUÍDA | `index.ts`, tsconfig include/paths, `mcp:catalog`, pins FastMCP 1.7.1 / fuse.js 7.5.0 / zod 4.5.4 |
| T2 | PENDENTE | CONCLUÍDA | `load` / `hash` / `paths` / `errors`; load.spec com tmpdir + `ASP_CATALOG_ROOT` |
| T3 | PENDENTE | CONCLUÍDA | search/read/fetch/prepare; `stagingRoot` injetável; `revision-hash` dos contentHash |
| T4 | PENDENTE | CONCLUÍDA | 4 tools Zod + FastMCP stdio; `server.spec.ts` registra os 4 nomes; sem `console.log` |
| T5 | PENDENTE | CONCLUÍDA | 18 `it` da Seção 6 + 18 suites antigas; `pnpm test` 36/36 |
| T6 | PENDENTE | CONCLUÍDA | README (4 tools + mcpServers) e CLAUDE.md (`mcp:catalog` + include + MCP local) |

---

## Tagging

- `tagger_required` em `catalog/load|hash|paths|errors|search|read|fetch|prepare` e `server.ts` (domínio, contrato, risco de path/hash, decisão FastMCP).
- `tagger_not_applicable` em reexport `index.ts` do catálogo, tools Zod, entry `isInvokedDirectly`, specs, package/tsconfig/project e docs (wiring óbvio ou teste).

---

## Sugestões Fora de Escopo (não implementadas)

- Extrair `catalog/` para `libs/core` quando a CLI nascer → DECISÃO-001 / Seção 5 do ARD
- `embeddings.json` + cosseno no `search_skills` → DECISÃO-003 adiada
- Transporte HTTP do FastMCP e `ASP_REGISTRY_URL` → Fase 5
- `vitest.config` com `vite-tsconfig-paths` para usar o alias em runtime → evitado de propósito (arquivo fora do mapa)
- Atualizar `cognitive-base/sys-004` via `cb-note` → PR de docs separado

---

## Status Final

| Campo | Valor |
|---|---|
| **Implementação** | ✅ Completa |
| **Bloqueadores** | Nenhum |
| **Arquivos criados** | 24 |
| **Arquivos modificados** | 5 (`tsconfig.base.json`, `package.json`, `README.md`, `CLAUDE.md`, `pnpm-lock.yaml`) |
| **Divergências** | 3 (baixas) |
| **Sugestões fora de escopo** | 5 |

**Status Final:** Completa

**next_suggested_action:** `codesteer.verifier`
