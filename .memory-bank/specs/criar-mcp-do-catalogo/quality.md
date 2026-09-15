# Quality Gate — Criar MCP do catálogo

> **IPD:** `.memory-bank/plans/criar-mcp-do-catalogo/plan.md`
> **Delivery:** `.memory-bank/specs/criar-mcp-do-catalogo/delivery.md`
> **Data:** 2026-09-14
> **Agente:** codesteer.verifier
> **Veredicto:** ✅ APROVADO
> **Base git:** working tree vs HEAD (entrega sem commit; não HEAD~1)

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| Total de checks executados | 21 |
| Checks PASSOU | 19 |
| Checks FALHOU | 0 |
| Checks N/A | 2 |
| Divergências 🔴 CRÍTICAS | 0 |
| Divergências 🟡 AVISO | 0 (3 declaradas, todas aceitáveis — V1.6) |
| Ajustes obrigatórios | 0 |

`pnpm test` (tsc + vitest) 36/36. T1–T6 CONCLUÍDA. NÃO TOCAR intactos. Contratos 2.3 e DoD Seção 3 confirmados no código.

---

## Camada 1 — Completude da Entrega

| Check | Status | Evidência |
|---|---|---|
| V1.1 — Arquivos CRIAR existem | ✅ PASSOU | 24 caminhos do mapa 4.3 presentes (`index.ts` do catálogo + 23 do `mcp-server`) |
| V1.2 — Arquivos MODIFICAR alterados | ✅ PASSOU | Diff vs HEAD: `tsconfig.base.json`, `package.json`, `README.md`, `CLAUDE.md` |
| V1.3 — NÃO TOCAR inalterados | ✅ PASSOU | Sem diff em `types.ts`, `compile-catalog.ts`, `scan-skills.ts`, `validate-skills.ts`, `skill-generator/**`, `ci.yml`, `doc-*`, `cognitive-base/**`, `skills/**`, blueprint. `libs/core`, CLI e portal não existem |
| V1.4 — Delivery × Mapa consistentes | ✅ PASSOU | Delivery cobre o mapa 4.3. Extra: `pnpm-lock.yaml` (efeito T1 / IPD 4.4 A5) |
| V1.5 — Escopo (drift detection) | ✅ PASSOU | Tracked: só os 4 MODIFICAR + lock. Untracked de produto: `packages/mcp-server/**` e `skills-catalog/src/index.ts`. `.memory-bank/**` é artefato de pipeline |
| V1.6 — Divergências justificadas | ✅ PASSOU | Três baixas, aceitáveis (ver abaixo) |

Divergências do `delivery.md` (aceitáveis, sem ação bloqueante):

1. Import relativo a `src/index.ts` em vez do alias — Vitest sem `vitest.config` (fora do mapa). Alias permanece no `tsconfig.base.json`.
2. Query `*` devolve hits curtos como query vazia — atende o `it` “query vazia ou genérica” da Seção 6.
3. `logLevel: 'silent'` — protege stdout (guardrail IPD §5); `FastMCP.run()` default é `stdio`.

---

## Camada 2 — Validações Automatizadas

### V2.1 — Typecheck / Compilação · **Status:** ✅ PASSOU

```
comando: pnpm exec tsc --noEmit -p tsconfig.base.json
exit: 0
stdout/stderr: (vazio)
```

### V2.2 — Linter · **Status:** N/A

Sem ESLint no workspace. DoD IPD §3: “Lint/Format: N/A — sem introduzir linter nesta fatia”.

### V2.3 — Testes existentes · **Status:** ✅ PASSOU

```
comando: pnpm test
exit: 0
 ✓ tools/validate-skills.spec.ts (8 tests)
 ✓ packages/skills-catalog/src/scan-skills.spec.ts (4 tests)
 ✓ packages/skills-catalog/src/compile-catalog.spec.ts (4 tests)
 ✓ tools/skill-generator/generate.spec.ts (2 tests)
 Test Files  10 passed (10)
      Tests  36 passed (36)
```

### V2.4 — Novos testes criados · **Status:** ✅ PASSOU

| Teste previsto (IPD Seção 6) | Arquivo | Existe? |
|---|---|---|
| catalog/load (2 `it`) | `packages/mcp-server/src/catalog/load.spec.ts` | ✅ |
| catalog/search (4 `it`) | `packages/mcp-server/src/catalog/search.spec.ts` | ✅ |
| catalog/read (3 `it`) | `packages/mcp-server/src/catalog/read.spec.ts` | ✅ |
| catalog/fetch (4 `it`) | `packages/mcp-server/src/catalog/fetch.spec.ts` | ✅ |
| catalog/prepare (4 `it`) | `packages/mcp-server/src/catalog/prepare.spec.ts` | ✅ |
| server registra 4 tools (1 `it`) | `packages/mcp-server/src/server.spec.ts` | ✅ |

Títulos dos 18 `it` batem literalmente com a Seção 6.

### V2.5 — Novos testes passam · **Status:** ✅ PASSOU

```
 ✓ packages/mcp-server/src/catalog/load.spec.ts (2 tests)
 ✓ packages/mcp-server/src/catalog/fetch.spec.ts (4 tests)
 ✓ packages/mcp-server/src/catalog/read.spec.ts (3 tests)
 ✓ packages/mcp-server/src/catalog/search.spec.ts (4 tests)
 ✓ packages/mcp-server/src/catalog/prepare.spec.ts (4 tests)
 ✓ packages/mcp-server/src/server.spec.ts (1 test)
```

### V2.6 — Nenhum teste desabilitado · **Status:** ✅ PASSOU

```
rg '\.skip|\.only|xit\(|xdescribe\(|xtest\(|test\.todo' --glob '*.spec.ts'
(sem matches)
```

---

## Camada 3 — Consistência Código × Documentação

| Check | Status | Evidência |
|---|---|---|
| V3.1 — README/docs atualizados | ✅ PASSOU | README: `pnpm mcp:catalog`, `ASP_CATALOG_ROOT`, `mcpServers`, 4 tools e disclosure. CLAUDE.md: script, include, MCP local, env |
| V3.2 — Contratos batem com IPD | ✅ PASSOU | `search` só 4 campos; `read` sem corpo de references/scripts; `fetch` recusa `scripts/`; `prepare` recusa `allow_exec: false` e SKILL.md; hash via `readVerifiedUtf8` lança `HashMismatchError` sem corpo; `types.ts`/`compileCatalog` intactos |
| V3.3 — CHANGELOG atualizado | N/A | Projeto sem CHANGELOG.md |
| V3.4 — Comentários consistentes | ✅ PASSOU | Sem TODO/FIXME/HACK. Âncoras `@Mind*` alinhadas ao código |
| V3.5 — Nomenclatura reflete comportamento | ✅ PASSOU | Handlers e tools 1:1 com os nomes do contrato 2.3 |
| V3.6 — Orçamento delivery.md | ✅ PASSOU | 147 linhas / teto L 250 |

---

## Camada 4 — DoD (Definition of Done)

| Item DoD | Evidência | Status |
|---|---|---|
| Funcional: stdio + 4 tools + disclosure + hash | Script `mcp:catalog` → `index.ts`; `createCatalogServer` registra as 4; `FastMCP.run()` default `stdio`; handlers + `server.spec.ts` | ✅ |
| Compilação | tsc exit 0; include cobre `packages/mcp-server/src/**/*.ts` | ✅ |
| Testes existentes | validate 8, scan 4, compile 4, generator 2 verdes | ✅ |
| Novos testes Seção 6 | 18 `it` presentes e passando | ✅ |
| Lint/Format | N/A no IPD | ✅ |
| Edge: skill inexistente | `read.spec.ts` → `NotFoundError` | ✅ |
| Edge: hash mismatch omite corpo | `read.spec.ts` / `fetch.spec.ts`; mensagem sem conteúdo | ✅ |
| Edge: fetch `scripts/` | `fetch.spec.ts` → `PathDeniedError` | ✅ |
| Edge: `..` / absoluto | `fetch.spec.ts` + `prepare.spec.ts` | ✅ |
| Edge: `allow_exec: false` | `prepare.spec.ts` → `ExecDeniedError` | ✅ |
| Edge: category inexistente | `search.spec.ts` → `[]` | ✅ |
| Edge: `dry_run` não cria staging | `prepare.spec.ts` `existsSync === false` | ✅ |
| Edge: `ASP_CATALOG_ROOT` tmpdir | `load.spec.ts`; fixtures só em `mkdtempSync` | ✅ |

### Edge Cases

| Edge Case | Cobertura | Teste |
|---|---|---|
| Skill inexistente | Teste | `catalog/read.spec.ts` |
| Hash mismatch (SKILL.md / reference) | Teste | `read.spec.ts`, `fetch.spec.ts` |
| scripts/ no fetch | Teste | `fetch.spec.ts` |
| Path traversal / absoluto | Teste | `fetch.spec.ts`, `prepare.spec.ts` |
| allow_exec false | Teste | `prepare.spec.ts` |
| Category desconhecida | Teste | `search.spec.ts` |
| dry_run | Teste | `prepare.spec.ts` |
| ASP_CATALOG_ROOT isolado | Teste | `load.spec.ts` |

### Guardrails

| Guardrail | Status | Verificação |
|---|---|---|
| Não criar libs/core, CLI, portal, embeddings, publish | ✅ Respeitado | Paths ausentes; sem `embeddings.json` |
| Sem ASP_REGISTRY_URL / HTTP / container | ✅ Respeitado | Ausentes no `src/`; `run()` default stdio |
| read_skill sem corpo de references/scripts | ✅ Respeitado | Só paths; spec garante ausência do texto |
| Hash mismatch não entrega conteúdo | ✅ Respeitado | `readVerifiedUtf8` lança antes do return |
| Sem log em stdout | ✅ Respeitado | `console.error` só no catch do entry; `logLevel: 'silent'`; sem `console.log` |
| Fixtures só em tmpdir | ✅ Respeitado | Specs usam `mkdtempSync`; `skills/**` sem diff |
| cognitive-base / blueprint / ci / doc-* | ✅ Respeitado | Sem diff |
| Sem `any`; pins exatos | ✅ Respeitado | Sem `: any`/`as any`; FastMCP 1.7.1, fuse.js 7.5.0, zod 4.5.4 |
| Só mapa 4.3 (+ lock T1) | ✅ Respeitado | Drift só lock justificado |
| Deps só Seção 4.4 | ✅ Respeitado | Três deps diretas; SDK MCP só transitivo do FastMCP |
| Não reimplementar validador dec-002 | ✅ Respeitado | MCP não valida Use when / kebab |
| prepare não executa scripts | ✅ Respeitado | Só `copyFileSync`; sem `child_process` |

---

## Escopo de Arquivos Verificados

| Classificação | Arquivo | Status |
|---|---|---|
| ✅ ESPERADO | `packages/skills-catalog/src/index.ts` | Reexport types + `compileCatalog` + `defaultCompileOptions` |
| ✅ ESPERADO | `packages/mcp-server/**` (src, specs, package/tsconfig/project) | Pacote `@codesteer/agent-skills-mcp` private |
| ✅ ESPERADO | `tsconfig.base.json`, `package.json`, `README.md`, `CLAUDE.md` | Include, script, docs |
| ✅ ESPERADO | `pnpm-lock.yaml` | Efeito autorizado de T1 |
| 🔒 PROTEGIDO | `types.ts`, `compile-catalog.ts`, `scan-skills.ts`, `validate-skills.ts` | Inalterado ✅ |
| 🔒 PROTEGIDO | `ci.yml`, `doc-*`, `cognitive-base/**`, `skills/**`, blueprint | Inalterado ✅ |

---

## Conclusão

**Veredicto:** ✅ APROVADO

Entrega completa e verificável: 4 tools, progressive disclosure, SHA-256 sem vazamento de corpo, fixtures só em tmpdir, NÃO TOCAR intactos, `pnpm test` 36/36. As 3 divergências do delivery são aceitáveis e não exigem correção.

**Próximo passo recomendado:** code-review

**next_suggested_action:** `codesteer.code-reviewer`
