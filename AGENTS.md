# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

Node >= 22, pnpm 9 (`packageManager` fixa a versão). Nx está instalado mas os scripts do `package.json` são o caminho principal.

```bash
pnpm install

# Os gates — idênticos aos passos do .github/workflows/ci.yml
pnpm test              # tsc --noEmit -p tsconfig.base.json && vitest run
pnpm validate:skills   # formato canônico da skill (bloqueante)
pnpm build:plugin      # regenera plugins/codesteer-skills/ + marketplaces (versionados); --check no CI é bloqueante
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

Categorias previstas para as skills: `architecture` (decisão técnica, frameworks de agentes), `automation` (automação de apps e browsers), `creative` (fotografia, geração de imagens realistas, mídia visual), `frontend` (UI, HTML/CSS a partir de mocks), `marketing` (copywriting, SEO, inbound, growth, campanhas), `product` (PO, planning, grill-me, PRD), `prompt-engineering` (avaliar, densificar, projetar prompts e personas), `security`, `testing`. Nomes de skill não levam prefixo `codesteer-`. O validador não impõe essa lista — ela é convenção do README e de `cognitive-base/system/shared/sys-001-skills-catalog.md`.

O fluxo é um pipeline de 3 estágios sobre a mesma árvore `packages/skills-catalog/skills/<categoria>/<nome-kebab>/`:

1. **`tools/validate-skills.ts`** — gate estrutural do formato canônico (ADR `cognitive-base/decisions/dec-002-formato-canonico-skill.md`). Valida kebab-case em toda pasta/arquivo, frontmatter YAML completo e tipado (`name`, `description`, `metadata`, `compatibility`, `sandbox`), `name` do frontmatter == nome da pasta, presença literal de `"Use when"` e `"Do NOT use for"` na `description`, corpo ≤ 500 linhas e ausência de `README.md` na pasta da skill.
2. **`packages/skills-catalog/src/scan-skills.ts`** — scanner heurístico de supply chain sobre `scripts/`: `rm -rf /`, `curl | bash`, nomes de segredos. Substituto mínimo do Snyk/LLM-guard previsto no blueprint; não detecta jailbreak semântico.
3. **`packages/skills-catalog/src/compile-catalog.ts`** — calcula SHA-256 por arquivo e emite `dist/skills-registry.json` conforme `src/types.ts`.

**`tools/build-plugin.ts`** empacota a mesma árvore como plugin único `codesteer-skills` (ADR `dec-007`): achata `skills/<categoria>/<nome>` em `plugins/codesteer-skills/skills/<nome>` (por isso o validador exige `name` único entre categorias e `description` ≤ 1024), normaliza o frontmatter da cópia para o spec agentskills.io (`metadata` só strings, `compatibility` texto) e emite `plugin.json` (Agent Plugins 1.0 — mínimo `$schema`/`name`/`description` por causa do schema fechado do Antigravity), `.claude-plugin/plugin.json` (sem `version` → updates por commit), `.cursor-plugin/plugin.json`, `gemini-extension.json` e os marketplaces da raiz (`.claude-plugin/`, `.agents/plugins/`, `.cursor-plugin/`). A saída é versionada e determinística: editou uma skill → rode `pnpm build:plugin` e commite; nunca edite `plugins/` à mão e não altere a `version` de `packages/skills-catalog/package.json` no PR. No merge em `main` que mexe em `packages/skills-catalog/skills/**` ou `tools/build-plugin.ts`, `.github/workflows/bump-plugin-version.yml` sobe o patch, regenera o plugin e cria a tag usando a deploy key `plugin-version-bump`. Tag `v<version>` dispara `release-plugin.yml` (archive para o Gemini CLI). Validação local: `claude plugin validate ./plugins/codesteer-skills`, `agy plugin validate plugins/codesteer-skills --strict`, `gemini extensions validate plugins/codesteer-skills`.

O gerador `packages/skills-catalog/src/generate-catalog-html.ts` é irmão do compile (`cognitive-base/decisions/dec-006-…`): emite `dist/index.html` (GitHub Pages + tool MCP `generate_catalog_html`), sem alterar o algoritmo de hash. Na CI, push em `main` publica `packages/skills-catalog/dist` no Pages. O HTML é auto-contido: Tailwind CDN + Google Fonts, e os assets de marca de `packages/skills-catalog/brand/` entram como data-URI via `catalog-brand.ts` (sem fetch em runtime). O visual segue os tokens de **`DESING.md`** na raiz (design system "The Cognitive Control Room" — a grafia `DESING` é o nome real do arquivo); mudança de cor/tipografia no catálogo deve partir de lá. `description` precisa passar pelo escape HTML (risco de XSS); o corpo de `SKILL.md` nunca é embutido.

### Servidor MCP (`packages/mcp-server`)

FastMCP stdio (`@prefecthq/fastmcp-ts` + Zod). `src/catalog/` carrega o mesmo catálogo e expõe progressive disclosure em 4 tools, nesta ordem: `search_skills` (metadados, nunca o corpo) → `read_skill` (`SKILL.md` + listas de paths) → `fetch_skill_files` (conteúdo de `references/`/`templates/`; recusa `scripts/`) → `prepare_skill_files` (staging em `~/.cache/agent-skills/staged/<revision-hash>` ou `dry_run`; **nunca executa**). `generate_catalog_html` fica fora da cadeia. Invariantes: todo conteúdo é conferido contra o SHA-256 antes de ser devolvido (mismatch não entrega nada); traversal e paths fora do manifesto são recusados; stdout é o protocolo JSON-RPC — nada de `console.log` no caminho de start. Ao adicionar uma tool, registre-a em `server.ts` e em `CATALOG_TOOL_NAMES`.

`SkillFrontmatter` / `RegistrySkill` / `SkillsRegistry` em `packages/skills-catalog/src/types.ts` são o contrato compartilhado — validador, scanner e compilador parseiam o frontmatter independentemente, então mudar o schema exige tocar os três.

Fixtures de validação vivem em `tools/__fixtures__/skills/<caso>/` — uma pasta por violação esperada (`invalid-no-use-when`, `invalid-readme`, …) mais `valid/`. Ao adicionar uma regra de validação, adicione a fixture correspondente. Já `skills/testing/pipeline-canary` é uma skill real do catálogo que serve de canário do pipeline; os specs do compile, do HTML e do MCP dependem dela — não remova.

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
- Comentários âncora `// @MindContext:`, `@MindSpec:`, `@MindFlow:`, `@MindRisk:`, `@MindDecision:`, `@MindWhy:`, `@MindTest:` (aponta o spec) no topo dos módulos de pipeline resumem propósito, contrato e risco — mantenha o padrão ao criar módulos novos.
- Scripts TS rodam via `tsx` com imports `.ts` explícitos (`allowImportingTsExtensions`, `noEmit`). Cada entrypoint é também módulo importável: o bloco de execução fica atrás de um guard `isInvokedDirectly()`.
- `.github/pull_request_template.md` traz os checklists de skill e de base cognitiva — preencha o que o PR tocar.
- `.memory-bank/plans/<slug>/` (gitignorado) guarda os artefatos do pipeline codesteer — `plan.md`, `task.md`, `architecture.md`, `delivery.md`. Útil como contexto do que foi planejado; não é entregável versionado.
- `.cursor/` e `design-systems/` também são gitignorados (config local do MCP e rascunhos de design) — não dependa deles em código ou docs versionados.
- Repo Apache-2.0, **fechado a contribuições externas** (`CONTRIBUTING.md`): o workflow `close-external-contributions` fecha PRs de forks. O trabalho do maintainer é por branch interna + PR no próprio remoto.
