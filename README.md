# CodeSteer Agent Skills

Catálogo Git de **skills para agentes de IA** (Cursor, Claude Code e outros clientes MCP). Cada skill é uma pasta canônica com `SKILL.md` — instruções para o modelo, referências sob demanda e, quando necessário, scripts.

Nesta fatia, **publicar uma skill** é abrir um PR que adiciona a pasta no monorepo. Não há API de upload, publicação NPM nem registry HTTP.

```text
packages/skills-catalog/skills/<categoria>/<nome-kebab>/
├── SKILL.md          # obrigatório — corpo ≤ 500 linhas, sem README.md
├── references/       # manuais longos, carregados sob demanda
├── templates/        # artefatos de preenchimento
└── scripts/          # executáveis (passam pelo scanner de supply chain)
```

Categorias: `architecture` · `security` · `testing` · `product`.

---

## Catálogo de skills

O índice humano filtrável (categoria, nome e descrição) é a página pública gerada a partir do mesmo compile do registry:

https://luiscarloslopes.github.io/codesteer-agent-skills/

A página é `packages/skills-catalog/dist/index.html` (gitignorado), emitida por `pnpm catalog:html` e publicada no GitHub Pages (source: GitHub Actions) em push em `main`.

Para gerar o HTML localmente:

```bash
pnpm compile:catalog
pnpm catalog:html
```

A `description` canônica (com *Use when* / *Do NOT use for*) vive no frontmatter de cada `SKILL.md`.

---

## Requisitos

- Node.js ≥ 22
- pnpm 9 (`packageManager` no `package.json` trava a versão)

```bash
pnpm install
```

---

## Consumir o catálogo via MCP (local)

O servidor MCP `stdio` lê o catálogo Git deste checkout. Não há `ASP_REGISTRY_URL`, embeddings nem publicação NPM nesta fatia.

```bash
pnpm mcp:catalog
```

Opcional: `ASP_CATALOG_ROOT` aponta para a raiz do pacote catálogo (a pasta que contém `skills/`). O default é `packages/skills-catalog` a partir do cwd.

Exemplo de `mcpServers` (Cursor / Claude Desktop):

```json
{
  "mcpServers": {
    "codesteer-catalog": {
      "command": "pnpm",
      "args": ["mcp:catalog"],
      "cwd": "/caminho/para/codesteer-agent-skill"
    }
  }
}
```

Alternativa: `pnpm exec tsx packages/mcp-server/src/index.ts`.

### Progressive disclosure

As 4 tools, nesta ordem — cada uma entrega só o que a anterior não cobriu:

| # | Tool | Entrega |
| - | ---- | ------- |
| 1 | `search_skills` | `{ name, description, category, version }[]` — nunca o corpo de `SKILL.md` |
| 2 | `read_skill` | `SKILL.md` depois do SHA-256 + listas de paths em `references/` e `scripts/` (sem o conteúdo delas) |
| 3 | `fetch_skill_files` | texto de `references/` ou `templates/` pontuais — recusa `scripts/` |
| 4 | `prepare_skill_files` | staging local (ou `dry_run`) de scripts/paths do manifesto — **não executa** |

À parte da cadeia de disclosure, `generate_catalog_html` devolve o HTML do catálogo (filtros opcionais de categoria, nome e descrição) ao chamador — não substitui `search_skills`.

---

## Instalar uma skill individual (sem MCP)

Se você deseja usar apenas uma skill específica sem manter o servidor MCP ativo, pode instalar a pasta canônica diretamente no seu projeto ou ambiente global via **symlink** (recomendado para manter sincronizado com atualizações do catálogo) ou **cópia direta**.

### Mapeamento de diretórios por Agente / IDE

| Agente / IDE | Escopo do Projeto (Local) | Escopo Global (Usuário) |
| :--- | :--- | :--- |
| **Cursor** | `.cursor/skills/<nome-skill>/` | `~/.cursor/skills/<nome-skill>/` |
| **Claude Code** | `.claude/skills/<nome-skill>/` | `~/.claude/skills/<nome-skill>/` |
| **Google Antigravity** | `.agent/skills/<nome-skill>/` ou `.gemini/skills/<nome-skill>/` | `~/.gemini/antigravity-cli/skills/<nome-skill>/` |
| **GitHub Copilot** | `.github/skills/<nome-skill>/` | — |
| **Windsurf** | `.windsurf/skills/<nome-skill>/` | `~/.windsurf/skills/<nome-skill>/` |
| **Cline / Roo Code** | `.cline/skills/<nome-skill>/` | `~/.cline/skills/<nome-skill>/` |

### Exemplo de instalação (macOS / Linux)

No seu projeto de destino:

```bash
# Método 1: Symlink (recomendado — reflete git pull do catálogo)
mkdir -p .cursor/skills
ln -s "/caminho/absoluto/codesteer-agent-skill/packages/skills-catalog/skills/product/codesteer-grill-me" .cursor/skills/codesteer-grill-me

# Método 2: Cópia direta (isolamento total)
mkdir -p .cursor/skills
cp -R "/caminho/absoluto/codesteer-agent-skill/packages/skills-catalog/skills/product/codesteer-grill-me" .cursor/skills/codesteer-grill-me
```

O agente lerá o `SKILL.md` automaticamente e ativará as instruções com base no gatilho `"Use when"` definido no frontmatter, consultando as pastas `references/` e `templates/` sob demanda.

---

## Como adicionar uma skill

1. Scaffold (categoria + nome, ambos kebab-case):

   ```bash
   pnpm exec tsx tools/skill-generator/generate.ts product minha-skill
   ```

2. Preencha o frontmatter de `SKILL.md`: `name` (igual à pasta), `description` com **"Use when"** e **"Do NOT use for"** (literais em inglês), `metadata`, `compatibility` e `sandbox`.
3. Não coloque `README.md` na pasta da skill. Manuais longos vão em `references/`; scripts em `scripts/`; templates em `templates/`.
4. Corpo de `SKILL.md` ≤ 500 linhas. Pastas e arquivos em kebab-case.
5. (Maintainer) Abra um PR interno. A CI roda os mesmos gates locais abaixo. Contribuições externas ainda não são aceitas.

---

## Gates locais (idênticos à CI)

```bash
pnpm test              # tsc --noEmit + vitest
pnpm validate:skills   # formato canônico (bloqueante)
pnpm scan:skills       # heurística de supply chain em scripts/ (bloqueante)
pnpm compile:catalog   # gera packages/skills-catalog/dist/skills-registry.json (gitignorado)
pnpm catalog:html      # gera packages/skills-catalog/dist/index.html (gitignorado)
```

`compile:catalog` calcula SHA-256 por arquivo. Qualquer alteração de conteúdo muda o hash. `catalog:html` reusa esse registry para a página filtrável.

Pipeline interno (3 estágios sobre a mesma árvore `skills/`):

1. **`tools/validate-skills.ts`** — kebab-case, frontmatter tipado, `name` == pasta, presença de *Use when* / *Do NOT use for*, corpo ≤ 500 linhas, sem `README.md`.
2. **`packages/skills-catalog/src/scan-skills.ts`** — `rm -rf /`, `curl | bash`, nomes de segredos. Substituto mínimo do Snyk/LLM-guard do blueprint; não detecta jailbreak semântico.
3. **`packages/skills-catalog/src/compile-catalog.ts`** — registry JSON com hashes.

O gerador `packages/skills-catalog/src/generate-catalog-html.ts` é irmão do compile: emite o HTML estático publicado no GitHub Pages, sem alterar o algoritmo de hash.

---

## Estrutura do repositório

```text
packages/skills-catalog/   # skills + compiler + scanner + gerador HTML
packages/mcp-server/       # MCP stdio local
tools/                     # validador + gerador de scaffold
cognitive-base/            # decisões e specs (Obsidian, 6 quadrantes)
arquitetura_plataforma_skills_mcp.md   # blueprint ASP (alvo completo)
```

O blueprint descreve CLI, portal web, `libs/core`, registry HTTP e embeddings. **Esta fatia implementa** autoria + gates + compilação do registry + MCP stdio + página HTML no GitHub Pages. O consumo no agente pode ser dinâmico via MCP (`pnpm mcp:catalog`) ou estático via instalação direta (symlink/cópia) de cada skill.

Formato canônico: [`cognitive-base/decisions/dec-002-formato-canonico-skill.md`](cognitive-base/decisions/dec-002-formato-canonico-skill.md).

---

## Licença

[Apache License 2.0](LICENSE). Uso, cópia, modificação e distribuição livres — inclusive comercial — desde que a licença e os avisos de copyright sejam preservados.

## Contribuições

Contribuições externas **não são aceitas** neste momento. Issues estão desativadas; PRs de forks são fechados automaticamente. Veja [CONTRIBUTING.md](CONTRIBUTING.md). O fluxo “Como adicionar uma skill” acima é para o maintainer do repositório.
