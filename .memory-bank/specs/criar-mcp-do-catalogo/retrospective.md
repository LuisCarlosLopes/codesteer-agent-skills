# Retrospective: criar-mcp-do-catalogo — 2026-09-14
> **Agent:** codesteer.task-retrospective | **Status:** success
> **Track:** FEATURE

## Resumo executivo

- Cadeia FEATURE (implementer → verifier → code-reviewer → tester) concluiu T1–T6 do IPD v1.0 sem blocker e sem healing.
- Entrega: servidor MCP stdio local (`@codesteer/agent-skills-mcp`) com as 4 tools, progressive disclosure e SHA-256; `pnpm test` 40/40 após o tester.
- Principal aprendizado: sem `vitest.config`, o alias `@codesteer/skills-catalog` serve o typecheck mas não o runtime — import relativo foi o desvio correto e de baixo impacto.
- Closure git/PR autorizado pelo orquestrador (implementer operou com `commit_policy: none`): commit `16b7596` e [PR #1](https://github.com/LuisCarlosLopes/codesteer-agent-skills/pull/1) (sem merge).

## Contexto

| Campo | Valor |
|---|---|
| Modo | pipeline |
| Slug | `criar-mcp-do-catalogo` |
| Branch | `feat/criar-mcp-do-catalogo` (tracks `origin/feat/criar-mcp-do-catalogo`, não protegida) |
| Fases percorridas | bootstrap → implementer → verifier → code-reviewer → tester → closure (task-retrospective) |

### Fontes consultadas

- `.memory-bank/specs/criar-mcp-do-catalogo/state.yaml`
- `.memory-bank/plans/criar-mcp-do-catalogo/plan.md`
- `.memory-bank/plans/criar-mcp-do-catalogo/task.md`
- `.memory-bank/plans/criar-mcp-do-catalogo/architecture.md`
- `.memory-bank/specs/criar-mcp-do-catalogo/delivery.md`
- `.memory-bank/specs/criar-mcp-do-catalogo/quality.md`
- `.memory-bank/specs/criar-mcp-do-catalogo/code-review.md`
- `git status` / `git diff` / `git log` / `git merge-base origin/main HEAD` (working tree vs HEAD; **não** `HEAD~1`)
- `.gitignore` (`.memory-bank/plans/` ignorado; `.memory-bank/specs/` versionável)

### Lacunas de evidência

- Agent transcripts da sessão não foram consultados (handoff não os listou; evidência textual dos artefatos e do git foi suficiente).
- `.memory-bank/constitution.md` ausente neste repo — `ai_provenance` tratado como default `optional`; trailers CodeSteer incluídos por execução de agent.
- `quality.md` registra 36/36 (pós-implementer); o tester acrescentou 4 `it` e o `state.yaml` cita 40/40 — o veredicto do verifier não foi reexecutado após o tester (contrato: este agent não re-audita nem altera `quality.md`).

## Timeline da sessão

| Ordem | Fase / evento | Outcome relevante | Evidência |
|---|---|---|---|
| 1 | HITL pré-implementer | Humano autorizou `/codesteer implemente`; `commit_policy: none` (commit fica para closure) | `state.yaml` `hitl.gates[hitl-pre-implementer]` |
| 2 | bootstrap | Slug reaproveitado de `.memory-bank/plans/`; score 5 FEATURE, confiança 93 | `state.yaml` history 20:36 |
| 3 | implementer | T1–T6 CONCLUÍDA; 24 criados + 5 modificados; 3 divergências baixas; `pnpm test` 36/36 | `delivery.md` |
| 4 | verifier | Veredicto APROVADO; 19 PASSOU, 2 N/A; 0 ajustes obrigatórios | `quality.md` |
| 5 | code-reviewer | Recomendação APROVAR; 0 CRÍTICO/ALTO/MÉDIO; 1 BAIXO (TOCTOU em `prepare`) | `code-review.md` |
| 6 | tester | 4 testes de gap (`templates/`, `SKILL.md` no fetch/prepare, HashMismatch no prepare); `state.yaml` 40/40 | `state.yaml` history 21:55; `fetch.spec.ts`, `prepare.spec.ts` |
| 7 | closure | Retrospectiva + commit/PR governados | este arquivo |

## Entrega vs plano

### Escopo entregue

- Pacote `@codesteer/agent-skills-mcp` (private) com FastMCP 1.7.1, fuse.js 7.5.0, zod 4.5.4
- Reexport `compileCatalog` / types / `defaultCompileOptions` via `packages/skills-catalog/src/index.ts`
- Tools `search_skills`, `read_skill`, `fetch_skill_files`, `prepare_skill_files` com disclosure e hash
- Specs Vitest em tmpdir (18 `it` da Seção 6 + 4 de gap do tester)
- Docs locais: `README.md` (consumo + 4 tools) e `CLAUDE.md` (`mcp:catalog`, include, MCP local)
- Script raiz `pnpm mcp:catalog`; `tsconfig.base.json` include + paths

### Desvios do plano/spec

| Desvio | Impacto | Evidência | Motivo |
|---|---|---|---|
| Runtime importa `compileCatalog` por caminho relativo, não pelo alias `@codesteer/skills-catalog` | Baixo | `delivery.md` Divergências; `quality.md` V1.6 | Vitest sem `vitest.config` (fora do mapa 4.3); alias permanece no typecheck |
| Query `*` em `search_skills` equivale a query vazia | Baixo | `delivery.md`; Seção 6 `it` “query vazia ou genérica” | Fuse.js não trata `*` como curinga; atende o teste |
| `FastMCP` com `logLevel: 'silent'` | Baixo | `delivery.md`; IPD §5 stdout = protocolo | Evita banner/logs no stdio |
| `prepare` relê disco após hash (`copyFileSync`) | Baixo | `code-review.md` [BAIXO] | Implementação literal do mapa; correção opcional, não bloqueia |
| Tester expandiu Seção 6 com 4 `it` extras | Baixo | `fetch.spec.ts`, `prepare.spec.ts`; `state.yaml` tester | Gaps úteis (templates, SKILL.md, HashMismatch no prepare); não mudam contrato |

### Escopo não entregue

| Item | Motivo |
|---|---|
| `libs/core`, CLI, portal, embeddings, registry HTTP, npm publish | Fora do IPD / DECISÃO-001 |
| `vitest.config` + `vite-tsconfig-paths` | Fora do mapa 4.3; evitado de propósito |
| Atualização de `cognitive-base/sys-004` | Guardrail; PR de docs separado |
| Staging de `prepare` gravando o buffer já verificado | Achado BAIXO do code-review; correção opcional |

## Problemas, bugs e incidentes

| Item | Severidade | Evidência | Resolvido? |
|---|---|---|---|
| Janela TOCTOU em `prepare`: hash ok depois `copyFileSync` relê o disco | Baixo | `code-review.md`; `prepare.ts` ~50–63 | Não (opcional, não bloqueia merge) |
| Contagem de testes 36 (verifier) vs 40 (tester) sem re-verify | Baixo | `quality.md` vs `state.yaml` history tester | Parcial — gates subsequentes não reabriram verifier |
| Branch já contém commit alheio ao slug (`e2163f2` skills agno/electron/lgpd/grill-me) | Médio | `git log origin/main..HEAD` | Não — PR desta branch inclui esse commit pré-existente |

## Retrabalho

| O quê | Por quê | Custo (qualitativo) | Evidência |
|---|---|---|---|
| Nenhum ciclo de healing / debate / re-implementação | Cadeia passou de primeira | Baixo | `state.yaml` `healing_attempt: 0`, `debate_round: 0` |
| 4 specs extras no tester | Cobrir gaps da Seção 6 (templates, SKILL.md, HashMismatch no prepare) | Baixo | `state.yaml` metrics tester |

## Decisões importantes

| Decisão | Contexto | Evidência |
|---|---|---|
| Domínio `catalog/` no pacote MCP, sem `libs/core` | Evita plataforma CLI/HTTP sem consumidor | `architecture.md` DECISÃO-001 |
| Reexport via `index.ts` + compile no start | Alias só via `types.ts` quebrava o load | `plan.md` DECISÃO-002 / T1 |
| FastMCP 1.7.1 pinado; fallback SDK só se A6 | Uma lib de transporte, sem empilhar SDK | `plan.md` 4.4; `delivery.md` T1 |
| `commit_policy: none` no implementer; closure commita | Humano autorizou implementar, não commitar | `state.yaml` hitl-pre-implementer |
| Import relativo no runtime | Sem `vitest.config` o alias não resolve no Vitest | `delivery.md` divergência 1 |

## O que funcionou bem

- IPD + ARD + `task.md` pré-existentes permitiram bootstrap sem planner e HITL só de autorização.
- Mapa 4.3 + NÃO TOCAR mantiveram o drift no lockfile (efeito T1) e nada mais.
- Verifier e code-reviewer independentes, ambos APROVAR, com o único achado BAIXO bem localizado.
- Tester fechou gaps sem reabrir implementação.
- Fixtures só em `mkdtempSync` — catálogo oficial `skills/` sem diff desta entrega.

## Candidatos a conhecimento

| Candidato | Tipo sugerido | Maturidade | Evidência | Notas |
|---|---|---|---|---|
| Sem `vitest.config`, use import relativo no runtime e deixe `tsconfig.paths` só para o `tsc` | patterns | pronto | `delivery.md` divergência 1; `quality.md` V1.6 | Recorrente neste repo (sem vitest.config por convenção) |
| FastMCP default `logLevel: info` pode vazar no stdio — pin `silent` quando stdout é protocolo | patterns | pronto | `delivery.md`; `code-review.md` stdout | Guardrail IPD §5; sink oficial da lib é stderr, mas silent é o cinto |
| Fuse.js não interpreta `*` como “match all”; trate query genérica no handler | lessons | pronto | `delivery.md` divergência 2; `search.spec.ts` | Evita “query * vazia” como bug falso |
| `prepare` que hasheia e depois `copyFileSync` não é “hash mismatch não entrega conteúdo” | anti-patterns | imaturo | `code-review.md` [BAIXO] | Uma ocorrência; exploração exige writer local concorrente |
| Closure commita quando implementer veio com `commit_policy: none` | lessons | pronto | `state.yaml` hitl; handoff closure | Evita “entrega sem SHA” e `HEAD~1` falso |
| Reabrir verifier após tester que adiciona specs | lessons | imaturo | `quality.md` 36 vs `state.yaml` 40 | Uma sessão; pode ser ruído de pipeline |

## Candidatos a runbook (sugestão — sem escrita automática v1)

| Gotcha / lição local | Evidência | Ação sugerida |
|---|---|---|
| Pacote TS novo some do gate `pnpm test` se não entrar no `include` do `tsconfig.base.json` | `plan.md` 2.2; `CLAUDE.md` | revisar com skill codesteer-runbook |
| Não `git add` / force-add `.memory-bank/plans/` — está no `.gitignore` | `.gitignore` L6; handoff | revisar com skill codesteer-runbook |
| Delimitar git por working tree vs HEAD quando a entrega ainda não tem commit; nunca `HEAD~1` | handoff `git_delimitation`; `quality.md` Base git | revisar com skill codesteer-runbook |

## Fechamento git

| Campo | Valor |
|---|---|
| Resultado | realizado |
| Hash | `16b75964f320bf1ad9cbaa585804403fbe50803c` |
| Mensagem | `feat(mcp): add stdio catalog server with hash-gated disclosure` |

### Arquivos incluídos no commit

- `packages/mcp-server/**` (pacote, src, specs, tsconfig, project.json)
- `packages/skills-catalog/src/index.ts`
- `tsconfig.base.json`, `package.json`, `pnpm-lock.yaml`, `README.md`, `CLAUDE.md`
- `.memory-bank/specs/criar-mcp-do-catalogo/**` (delivery, quality, code-review, state, retrospective)

### Arquivos excluídos do stage (com motivo)

| Arquivo | Motivo |
|---|---|
| `.memory-bank/plans/**` | gitignorado — não force add |
| `.memory-bank/.DS_Store` | lixo de SO |
| `.memory-bank/plans/criar-estrutura-para-subir-skills/**` | outro slug + gitignorado |
| `node_modules/**` / cache Vitest | gitignorado / fora do escopo |
| `.env` / secrets | denylist (ausentes nesta árvore) |

### Motivo de bloqueio (se aplicável)

Nenhum. Stage seletivo; branch `feat/` não protegida; quality APROVADO.

## Pull Request

| Campo | Valor |
|---|---|
| Resultado | aberta |
| URL | https://github.com/LuisCarlosLopes/codesteer-agent-skills/pull/1 |
| Título | `feat(mcp): add stdio catalog server with hash-gated disclosure` |

### Motivo de bloqueio (se aplicável)

Nenhum. PR não existia; push regular (sem force); merge não executado.

## Próximos passos recomendados

- Revisar a PR: o branch já contém `e2163f2` (skills agno-architect, electron, grill-me, lgpd) **além** do MCP — decidir se o mix é aceitável ou se o MCP deve ir para branch própria a partir de `main`.
- Merge humano apenas (pipeline não faz merge).
- Opcional: gravar no staging o buffer já verificado em `prepare` (achado BAIXO).
- Opcional: nota `cb-note` em `sys-004` noutro PR; extrair `catalog/` para `libs/core` quando a CLI nascer.
- Não promover candidatos a `.knowledge/` nesta fase — só triagem acima.
