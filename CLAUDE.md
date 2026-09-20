# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

Node >= 22, pnpm 9 (`packageManager` fixa a versão). Nx está instalado mas os scripts do `package.json` são o caminho principal.

```bash
pnpm install

# Os gates — idênticos aos passos do .github/workflows/ci.yml
pnpm test              # tsc --noEmit -p tsconfig.base.json && vitest run
pnpm validate:skills   # formato canônico da skill (bloqueante)
pnpm scan:skills       # varredura heurística de segurança (bloqueante)
pnpm compile:catalog   # gera packages/skills-catalog/dist/skills-registry.json (gitignorado)
pnpm catalog:html      # gera packages/skills-catalog/dist/index.html (gitignorado)
pnpm mcp:catalog       # servidor MCP stdio do catálogo local (packages/mcp-server)

# Um arquivo de teste / um caso
pnpm exec vitest run tools/validate-skills.spec.ts
pnpm exec vitest run -t "nome do caso"

# Scaffold de uma skill nova (categoria + nome, ambos kebab-case)
pnpm exec tsx tools/skill-generator/generate.ts product minha-skill
```

Não há vitest.config — os `*.spec.ts` ficam colocados ao lado do fonte (`tools/`, `packages/skills-catalog/src/`, `packages/mcp-server/src/`).

Há dois projetos Nx (`skills-catalog`, `mcp-server`). Os targets `test` / `scan` / `compile` do catálogo envelopam os mesmos scripts: `pnpm exec nx run skills-catalog:compile`.

Gotcha do typecheck: `pnpm test` roda `tsc` sobre o `include` do `tsconfig.base.json`, que cobre `packages/skills-catalog/src/**/*.ts`, `packages/mcp-server/src/**/*.ts` e `tools/**/*.ts`. Código TS fora desses caminhos passa despercebido pelo gate — ao criar um pacote novo, adicione-o ao `include`.

Env do MCP: `ASP_CATALOG_ROOT` (raiz do pacote catálogo, a pasta que contém `skills/`). Sem ela, o default é `packages/skills-catalog` resolvido a partir do cwd.

## Arquitetura

O produto é uma **plataforma de catálogo de skills para agentes de IA**. O blueprint completo está em `arquitetura_plataforma_skills_mcp.md`; esta fatia implementa autoria + gates + compilação de registry + MCP stdio local (`packages/mcp-server`). Não há API de upload, publicação NPM, `libs/core`, CLI, registry HTTP nem embeddings — "subir uma skill" continua sendo abrir um PR que adiciona a pasta canônica; consumir o catálogo no agente é `pnpm mcp:catalog`.

Categorias previstas para as skills: `architecture`, `security`, `testing`, `product` (PO, planning, grill-me, PRD). O validador não impõe essa lista — ela é convenção do README e de `cognitive-base/system/shared/sys-001-skills-catalog.md`.

O fluxo é um pipeline de 3 estágios sobre a mesma árvore `packages/skills-catalog/skills/<categoria>/<nome-kebab>/`:

1. **`tools/validate-skills.ts`** — gate estrutural do formato canônico (ADR `cognitive-base/decisions/dec-002-formato-canonico-skill.md`). Valida kebab-case em toda pasta/arquivo, frontmatter YAML completo e tipado (`name`, `description`, `metadata`, `compatibility`, `sandbox`), `name` do frontmatter == nome da pasta, presença literal de `"Use when"` e `"Do NOT use for"` na `description`, corpo ≤ 500 linhas e ausência de `README.md` na pasta da skill.
2. **`packages/skills-catalog/src/scan-skills.ts`** — scanner heurístico de supply chain sobre `scripts/`: `rm -rf /`, `curl | bash`, nomes de segredos. Substituto mínimo do Snyk/LLM-guard previsto no blueprint; não detecta jailbreak semântico.
3. **`packages/skills-catalog/src/compile-catalog.ts`** — calcula SHA-256 por arquivo e emite `dist/skills-registry.json` conforme `src/types.ts`.

O gerador `packages/skills-catalog/src/generate-catalog-html.ts` é irmão do compile: emite `dist/index.html` (GitHub Pages + tool MCP `generate_catalog_html`), sem alterar o algoritmo de hash.

`SkillFrontmatter` / `RegistrySkill` / `SkillsRegistry` em `packages/skills-catalog/src/types.ts` são o contrato compartilhado — validador, scanner e compilador parseiam o frontmatter independentemente, então mudar o schema exige tocar os três.

Fixtures de validação vivem em `tools/__fixtures__/skills/<caso>/` — uma pasta por violação esperada (`invalid-no-use-when`, `invalid-readme`, …) mais `valid/`. Ao adicionar uma regra de validação, adicione a fixture correspondente.

Regras recorrentes: skills são escritas para LLMs, não para humanos (daí a proibição de `README.md` dentro da pasta); manuais longos vão em `references/`, scripts em `scripts/`, templates em `templates/`.

## Base cognitiva (`cognitive-base/`)

Vault Obsidian de 6 quadrantes (`decisions/`, `specs/`, `system/`, `guides/`, `ops/`, `meta/`) que documenta as decisões deste repo — é a fonte do "por quê". Consulte antes de mudar o formato canônico ou o pipeline.

`system/shared/sys-001..sys-005` mapeiam os componentes do blueprint (catálogo, `libs/core`, CLI, servidor MCP, portal web); `sys-001` e o MCP local (`packages/mcp-server`, recorte de `sys-004` sem HTTP/embeddings) têm código hoje — `libs/core`, CLI e portal descrevem o alvo. Mudança no pipeline implica atualizar `sys-001` e, se for decisão nova, um `dec-` novo.

- Navegação interna **sempre** com wikilinks `[[nome-arquivo]]`, nunca links Markdown relativos.
- Front matter obrigatório: `id`, `type`, `title`, `status`, `created`, `author`. O prefixo do `id` segue o quadrante: `dec-`, `spc-`, `sys-`, `gd-`, `ops-`. O `id` é permanente mesmo se o arquivo mudar de pasta.
- Notas nascem `draft`; promoção a `approved` é revisão humana em PR.
- `index.md` é gerado — não edite à mão; regenere com a skill `cb-index` após criar/alterar notas.
- Use as skills `cb-note` / `cb-index` / `cb-audit` em vez de editar manualmente. Detalhes em `cognitive-base/CONTRIBUTING.md`.

O workflow `doc-quality` roda `.github/scripts/cb/audit.py` (mesmo auditor do `cb-audit` local) em PRs que tocam `cognitive-base/**.md`; `doc-agent` apenas comenta uma sugestão de nota no PR.

## Convenções

- Documentação, mensagens de erro e comentários em pt-BR. `SKILL.md` pode ser escrito em pt-BR ou inglês, mas os gatilhos literais `"Use when"` / `"Do NOT use for"` são exigidos na `description` em inglês.
- Comentários âncora `// @MindContext:`, `@MindSpec:`, `@MindFlow:`, `@MindRisk:`, `@MindDecision:` no topo dos módulos de pipeline resumem propósito, contrato e risco — mantenha o padrão ao criar módulos novos.
- Scripts TS rodam via `tsx` com imports `.ts` explícitos (`allowImportingTsExtensions`, `noEmit`). Cada entrypoint é também módulo importável: o bloco de execução fica atrás de um guard `isInvokedDirectly()`.
- `.github/pull_request_template.md` traz os checklists de skill e de base cognitiva — preencha o que o PR tocar.
- `.memory-bank/plans/<slug>/` (gitignorado) guarda os artefatos do pipeline codesteer — `plan.md`, `task.md`, `architecture.md`, `delivery.md`. Útil como contexto do que foi planejado; não é entregável versionado.
