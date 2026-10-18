# CodeSteer Agent Skills

Catálogo Git de **skills para agentes de IA**: Claude Code, OpenAI Codex/ChatGPT, GitHub Copilot, Cursor, Gemini CLI, Antigravity e qualquer cliente MCP. Cada skill é uma pasta com um `SKILL.md`, que traz as instruções para o modelo, e opcionalmente referências e templates carregados sob demanda.

**Catálogo navegável:** https://luiscarloslopes.github.io/codesteer-agent-skills/

Categorias: `architecture` · `automation` · `creative` · `frontend` · `marketing` · `product` · `prompt-engineering` · `security` · `testing`.

Início rápido no Claude Code (comandos dentro da sessão):

```text
/plugin marketplace add LuisCarlosLopes/codesteer-agent-skills
/plugin install codesteer-skills@codesteer
```

---

## Formas de usar

| Forma | Quando usar |
| :--- | :--- |
| [Plugin](#instalar-como-plugin) | Quer todas as skills no agente, com atualização pelo próprio agente. **Recomendado.** |
| [Skill individual](#instalar-uma-skill-individual) | Quer só uma ou duas skills num projeto, sem plugin. |
| [Servidor MCP](#consumir-via-mcp-local) | Quer que o agente busque e carregue skills sob demanda a partir de um checkout local. |

---

## Instalar como plugin

O catálogo é distribuído como **um único plugin**, `codesteer-skills`, com todas as skills. Ele segue o padrão [Agent Plugins 1.0](https://agent-plugins.org/) e traz também os manifests próprios das plataformas que não leem esse padrão (Claude, Cursor, Gemini).

| Plataforma | Instalação |
| :--- | :--- |
| **Claude Code** | `/plugin marketplace add LuisCarlosLopes/codesteer-agent-skills` → `/plugin install codesteer-skills@codesteer` |
| **Claude.ai / Desktop** | Customize → Plugins → adicionar o marketplace do GitHub, ou enviar um ZIP de `plugins/codesteer-skills/` |
| **OpenAI Codex** | `codex plugin marketplace add LuisCarlosLopes/codesteer-agent-skills` → `codex plugin add codesteer-skills@codesteer` (ou `/plugins`) |
| **ChatGPT (workspace)** | O admin importa o marketplace do repositório no GitHub |
| **GitHub Copilot CLI** | `copilot plugin marketplace add LuisCarlosLopes/codesteer-agent-skills` → `copilot plugin install codesteer-skills@codesteer` |
| **VS Code (Copilot)** | Setting `"chat.plugins.marketplaces": ["LuisCarlosLopes/codesteer-agent-skills"]` → buscar `@agentPlugins` na aba Extensions |
| **Cursor** | Customize → Plugins → *From GitHub Repository* → `https://github.com/LuisCarlosLopes/codesteer-agent-skills` |
| **Google Antigravity** | `agy plugin install <clone>/plugins/codesteer-skills` |
| **Gemini CLI** (legado) | `gemini extensions install https://github.com/LuisCarlosLopes/codesteer-agent-skills` (usa o archive do GitHub Release) |

<details>
<summary>Qual manifest cada plataforma lê</summary>

| Arquivo | Lido por |
| :--- | :--- |
| `plugins/codesteer-skills/plugin.json` (Agent Plugins) | Codex, Copilot CLI / VS Code, Cursor, Antigravity |
| `plugins/codesteer-skills/.claude-plugin/plugin.json` | Claude Code, Claude.ai |
| `plugins/codesteer-skills/.cursor-plugin/plugin.json` | Cursor |
| `plugins/codesteer-skills/gemini-extension.json` | Gemini CLI |
| `.claude-plugin/marketplace.json` | Claude Code, Copilot CLI / VS Code, import do ChatGPT |
| `.agents/plugins/marketplace.json` | Codex |
| `.cursor-plugin/marketplace.json` | Cursor |

Decisão e trade-offs: [`dec-007`](cognitive-base/decisions/dec-007-distribuicao-como-agent-plugin.md).

</details>

O plugin carrega só as skills. O servidor MCP não vai junto porque depende de `tsx`/pnpm; para usá-lo, veja [Consumir via MCP](#consumir-via-mcp-local).

---

## Instalar uma skill individual

Para usar uma skill específica sem plugin nem MCP, faça um symlink (acompanha o `git pull` do catálogo) ou uma cópia da pasta da skill para o diretório de skills do seu agente.

**Use como origem a cópia em `plugins/codesteer-skills/skills/<nome-skill>/`.** Ela é plana (sem a pasta de categoria) e tem o frontmatter no formato do spec [agentskills.io](https://agentskills.io/), que os clientes mais estritos exigem. A pasta canônica em `packages/skills-catalog/skills/<categoria>/<nome-skill>/` também funciona na maioria dos agentes.

| Agente / IDE | Projeto | Global (usuário) |
| :--- | :--- | :--- |
| **Padrão aberto** (Codex, Cursor, Copilot, Antigravity, Gemini CLI) | `.agents/skills/` | `~/.agents/skills/` |
| **Claude Code** | `.claude/skills/` | `~/.claude/skills/` |
| **Cursor** | `.cursor/skills/` | `~/.cursor/skills/` |
| **GitHub Copilot** | `.github/skills/` (também lê `.claude/skills/`) | `~/.copilot/skills/` |
| **Google Antigravity** | `.agents/skills/` (legado: `.agent/skills/`) | App/IDE: `~/.gemini/config/skills/` · CLI: `~/.gemini/antigravity-cli/skills/` |
| **Windsurf** | `.windsurf/skills/` | `~/.windsurf/skills/` |
| **Cline / Roo Code** | `.cline/skills/` | `~/.cline/skills/` |

Exemplo (macOS / Linux), no projeto de destino:

```bash
CATALOGO=/caminho/absoluto/codesteer-agent-skills
mkdir -p .agents/skills

# Symlink (recomendado: reflete o git pull do catálogo)
ln -s "$CATALOGO/plugins/codesteer-skills/skills/grill-me" .agents/skills/grill-me

# ou cópia (isolamento total)
cp -R "$CATALOGO/plugins/codesteer-skills/skills/grill-me" .agents/skills/grill-me
```

O agente lê o `SKILL.md`, ativa a skill quando o pedido casa com o gatilho *Use when* da `description` e consulta `references/` e `templates/` sob demanda.

---

## Consumir via MCP (local)

O servidor MCP `stdio` lê o catálogo deste checkout. Ainda não há registry remoto, embeddings nem pacote NPM.

```bash
pnpm install
pnpm mcp:catalog
```

Exemplo de `mcpServers` (Cursor / Claude Desktop):

```json
{
  "mcpServers": {
    "codesteer-catalog": {
      "command": "pnpm",
      "args": ["mcp:catalog"],
      "cwd": "/caminho/para/codesteer-agent-skills"
    }
  }
}
```

A variável opcional `ASP_CATALOG_ROOT` aponta para a pasta que contém `skills/`. Sem ela, o default é `packages/skills-catalog` a partir do cwd. Alternativa ao script: `pnpm exec tsx packages/mcp-server/src/index.ts`.

### Progressive disclosure

São 4 tools, usadas nesta ordem. Cada uma entrega só o que a anterior não cobriu:

| # | Tool | Entrega |
| - | ---- | ------- |
| 1 | `search_skills` | `{ name, description, category, version }[]`, nunca o corpo do `SKILL.md` |
| 2 | `read_skill` | `SKILL.md` após conferência do SHA-256, mais a lista de paths em `references/` e `scripts/` (sem o conteúdo) |
| 3 | `fetch_skill_files` | Texto de arquivos pontuais de `references/` ou `templates/`. Recusa `scripts/` |
| 4 | `prepare_skill_files` | Staging local (ou `dry_run`) de arquivos do manifesto. **Não executa nada** |

Fora da cadeia, `generate_catalog_html` devolve o HTML do catálogo (com filtros opcionais de categoria, nome e descrição) ao chamador.

---

## Como adicionar uma skill

> Fluxo do maintainer. Contribuições externas ainda não são aceitas (veja [Contribuições](#contribuições)).

Requisitos: Node.js ≥ 22 e pnpm 9 (a versão está travada em `packageManager`). Rode `pnpm install` antes.

1. Gere o scaffold (categoria e nome em kebab-case):

   ```bash
   pnpm exec tsx tools/skill-generator/generate.ts product minha-skill
   ```

2. Preencha o frontmatter do `SKILL.md`:
   - `name`: igual ao nome da pasta e único em todo o catálogo.
   - `description`: até 1024 caracteres, com os literais em inglês **"Use when"** e **"Do NOT use for"**.
   - `metadata`, `compatibility` e `sandbox`.
3. Organize a pasta: corpo do `SKILL.md` com até 500 linhas, manuais longos em `references/`, templates em `templates/`, scripts em `scripts/`. Pastas e arquivos em kebab-case, e **sem `README.md`** na pasta da skill (skills são escritas para LLMs).

   ```text
   packages/skills-catalog/skills/<categoria>/<nome-kebab>/
   ├── SKILL.md      # obrigatório
   ├── references/   # carregados sob demanda
   ├── templates/    # artefatos de preenchimento
   └── scripts/      # passam pelo scanner de supply chain
   ```

4. Regenere o plugin com `pnpm build:plugin` e commite `plugins/codesteer-skills/` e os marketplaces junto com a skill. **Nunca edite `plugins/` à mão.**
5. Rode os gates abaixo e abra um PR interno.

### Gates (idênticos à CI)

```bash
pnpm test                  # tsc --noEmit + vitest
pnpm validate:skills       # formato canônico (bloqueante)
pnpm build:plugin --check  # plugin em sincronia com o catálogo (bloqueante)
pnpm scan:skills           # heurística de supply chain em scripts/ (bloqueante)
pnpm compile:catalog       # dist/skills-registry.json com SHA-256 por arquivo (gitignorado)
pnpm catalog:html          # dist/index.html do catálogo (gitignorado)
```

### Pipeline

Todos os estágios leem a mesma árvore `packages/skills-catalog/skills/`:

1. **`tools/validate-skills.ts`** verifica: kebab-case, frontmatter tipado, `name` igual à pasta e único entre categorias, *Use when* / *Do NOT use for* na `description` (até 1024 caracteres), corpo com até 500 linhas e ausência de `README.md`.
2. **`packages/skills-catalog/src/scan-skills.ts`** procura `rm -rf /`, `curl | bash` e nomes de segredos. É um substituto mínimo do Snyk/LLM-guard do blueprint e não detecta jailbreak semântico.
3. **`packages/skills-catalog/src/compile-catalog.ts`** gera o registry JSON com o hash de cada arquivo. Qualquer mudança de conteúdo muda o hash.
4. **`tools/build-plugin.ts`** empacota as skills como plugin em `plugins/codesteer-skills/` e gera os marketplaces. A saída é versionada porque o plugin é instalado clonando o repositório.

`generate-catalog-html.ts` reaproveita o registry para gerar a página publicada no GitHub Pages a cada push em `main`. No merge em `main` que altera `packages/skills-catalog/skills/**` ou `tools/build-plugin.ts`, o workflow `bump-plugin-version` sobe o patch da `version` de `packages/skills-catalog/package.json`, regenera o plugin e cria a tag `v<version>`. Essa tag dispara `release-plugin`, que publica o archive usado pelo Gemini CLI. O PR commit a cópia do plugin na versão que já está em `main`; o número novo sai só depois do merge.

---

## Estrutura do repositório

```text
packages/skills-catalog/   # skills canônicas + compilador + scanner + gerador HTML
packages/mcp-server/       # servidor MCP stdio local
tools/                     # validador, scaffold e gerador do plugin
plugins/codesteer-skills/  # plugin gerado — não editar
.claude-plugin/ .agents/plugins/ .cursor-plugin/   # marketplaces gerados
cognitive-base/            # decisões e specs (vault Obsidian, 6 quadrantes)
arquitetura_plataforma_skills_mcp.md   # blueprint completo da plataforma
```

O blueprint prevê CLI, portal web, `libs/core`, registry HTTP e embeddings. **Hoje existem** a autoria, os gates, o registry compilado, o servidor MCP stdio, a página no GitHub Pages e o plugin. "Publicar uma skill" ainda é abrir um PR com a pasta canônica. As decisões estão em `cognitive-base/decisions/`, a começar pelo [formato canônico](cognitive-base/decisions/dec-002-formato-canonico-skill.md).

---

## Licença

[Apache License 2.0](LICENSE). Uso, cópia, modificação e distribuição são livres, inclusive para fins comerciais, desde que a licença e os avisos de copyright sejam preservados.

## Contribuições

Contribuições externas **não são aceitas** no momento. Issues estão desativadas e PRs de forks são fechados automaticamente. Veja [CONTRIBUTING.md](CONTRIBUTING.md).
