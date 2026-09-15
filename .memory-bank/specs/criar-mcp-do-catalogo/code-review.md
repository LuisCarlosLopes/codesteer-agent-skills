# Code Review Report — MCP do catálogo (`criar-mcp-do-catalogo`)

> **Data:** 2026-09-14
> **Agente:** codesteer.code-reviewer
> **Módulos aplicados:** quality / security / tagger
> **Modo:** working-tree vs HEAD (sem commit; sem PR)

---

## Contexto

| Campo | Valor |
|---|---|
| Linguagem/Runtime | TypeScript 5.8 `strict`, Node ≥ 22, Vitest, `tsx` |
| Contexto de execução | Servidor MCP stdio local (processo filho do IDE) |
| Fronteiras de confiança | Entrada das tools = agente/LLM; catálogo = Git local (`ASP_CATALOG_ROOT`) |
| Foco solicitado | quality + security (path/hash/stdio/fixtures/allow_exec) + tagger `@Mind*` |
| Escopo revisado | `packages/mcp-server/**`, `packages/skills-catalog/src/index.ts`, `tsconfig.base.json`, `package.json`, `README.md`, `CLAUDE.md`, `pnpm-lock.yaml` |
| Expansão de escopo | nenhuma |
| Restrições declaradas | Contrato 2.3 / guardrails IPD; NÃO TOCAR; pins exatos; stdout = JSON-RPC |
| Confiança da revisão | alta |

---

## Contexto de Segurança

| Campo | Valor |
|---|---|
| Ativos | Corpo de `SKILL.md` / `references/` / `scripts/`; integridade SHA-256 do manifesto; stdout do protocolo MCP; árvore oficial `skills/` |
| Fronteiras de confiança | `skill_name` e `file_paths` vêm do cliente MCP (não confiável). `skill.path` e `sandbox.allow_exec` vêm do `compileCatalog` (operador + Git). Env `ASP_CATALOG_ROOT` é do operador. |
| Superfície de ataque | Resolução de path, entrega pós-hash, progressive disclosure, staging em `~/.cache`, stdio, fixtures no catálogo oficial |

Ator plausível: LLM chamando tools com `file_paths` maliciosos. Não há rede, auth nem multi-tenant nesta fatia.

---

## 🔴 Problemas Críticos

Nenhum encontrado.

---

## 🟠 Problemas Altos

Nenhum encontrado.

---

## 🟡 Problemas Médios

Nenhum encontrado.

---

## 🔵 Baixo / Info

[BAIXO] [qualidade/integridade] `prepare` descarta o buffer já verificado e copia o disco de novo

LOCALIZAÇÃO: `packages/mcp-server/src/catalog/prepare.ts:50-63`
PROBLEMA:    `readVerifiedUtf8` confirma o SHA-256 e joga o conteúdo fora; `copyFileSync` relê o arquivo. Entre as duas I/O o bytes em disco podem divergir do manifesto — a tool ainda devolve `skill_dir` como se o hash tivesse sido o entregue.
EVIDÊNCIA:

```50:63:packages/mcp-server/src/catalog/prepare.ts
    readVerifiedUtf8(skillDir, manifest.path, manifest.contentHash);
    normalized.push(manifest.path);
  }
  // ...
      const source = resolveSafeSkillFile(skillDir, relative);
      const destination = path.join(destSkillDir, ...relative.split('/'));
      mkdirSync(path.dirname(destination), { recursive: true });
      copyFileSync(source, destination);
```

CORREÇÃO:    Guardar o `Buffer`/`string` de `readVerifiedUtf8` (ou uma variante que devolva bytes) e gravar esse conteúdo no staging; em alternativa, hashear o arquivo copiado e abortar se divergir.
JUSTIFICATIVA: `read`/`fetch` já entregam o mesmo buffer hasheado. Alinha `prepare` ao guardrail “hash mismatch não entrega conteúdo” sem mudar o contrato da tool. Exploração exige escritor local concorrente — fora do ator LLM — por isso não sobe de severidade.

---

## 🏷️ CodeSteer Tagger

**Ausências indevidas:** Nenhuma
**Tags inadequadas:** Nenhuma
**Resumo:** 0 ausências · 0 inadequadas · 9 corretas (`load`, `hash`, `paths`, `errors`, `search`, `read`, `fetch`, `prepare`, `server`)

Tools Zod, `index.ts` de entry/reexport e `*.spec.ts` sem tag — alinhado a `tagger_not_applicable`.

---

## Veredito dos focos de risco

| Foco | Resultado |
|---|---|
| Path traversal em `file_paths` | Recusa `\0`, vazio, absoluto (posix/win32/`~/`), segmento `..` e escape pós-`resolve`; `assertInManifest` é o segundo gate. Spec cobre `../`, `references/../SKILL.md` e `/etc/passwd`. |
| Hash mismatch entregando corpo | `readVerifiedUtf8` lança `HashMismatchError` só com o path; specs de `read`/`fetch` afirmam que a mensagem não contém o texto adulterado. |
| `read_skill` vazando `references/`/`scripts/` | Só listas de path; `JSON.stringify` do resultado não contém o corpo das extras. |
| stdout no start stdio | Sem `console.log` no pacote; falha do entry em `console.error`; FastMCP `logLevel: 'silent'` (default da lib é `info`; sink oficial escreve em stderr). `compileCatalog` não imprime. |
| Fixtures no catálogo oficial | Specs usam `mkdtempSync`; `packages/skills-catalog/skills/**` sem diff. |
| `allow_exec` bypass | Check é a primeira linha de `prepare`; `allow_exec` no compile é `boolean`; Zod da tool não aceita override; spec recusa mesmo com `dry_run: true`. |

NÃO TOCAR intactos (`types.ts`, `compile-catalog.ts`, `scan-skills.ts`, `validate-skills.ts`, `ci.yml`, `cognitive-base/**`, `skills/**`). Pins: FastMCP `1.7.1`, fuse.js `7.5.0`, zod `4.5.4`. `_tools` no FastMCP 1.7.1 é `Map` — o smoke de `server.spec.ts` inspeciona registro real.

---

## Resumo

| Campo | Valor |
|---|---|
| Total de achados | 1 |
| Críticos | 0 |
| Altos | 0 |
| Médios | 0 |
| Baixos / Info | 1 |
| Riscos transversais | 0 |
| Confiança da revisão | alta |
| **Recomendação** | **APROVAR** |
| Correção prioritária | Opcional: gravar no staging o buffer já verificado em `prepare` (não bloqueia merge) |

**Critérios de recomendação:**
- **BLOQUEAR** — ≥1 achado CRÍTICO pendente
- **CONDICIONAL** — ≥1 achado ALTO, zero CRÍTICOS; ou concentração de achados MÉDIOS no mesmo fluxo crítico; ou confiança insuficiente para aprovar
- **APROVAR** — nenhum CRÍTICO ou ALTO, achados MÉDIOS/BAIXOS isolados e confiança suficiente no escopo analisado

**Status Final:** Completa
**next_suggested_action:** `codesteer.tester`
