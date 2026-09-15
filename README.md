# codesteer-agent-skills

Plataforma de catálogo de skills para agentes de IA. Nesta fatia, **subir uma skill** significa abrir um PR no Git que adiciona a pasta canônica no monorepo — não há API de upload nem publicação NPM.

## Como adicionar uma skill

1. Crie `packages/skills-catalog/skills/<categoria>/<nome-kebab>/SKILL.md` (categorias: `architecture`, `security`, `testing`, `product` — PO, planning, grill-me, PRD).
2. O frontmatter precisa de `name` (igual à pasta), `description` com **"Use when"** e **"Do NOT use for"**, `metadata`, `compatibility` e `sandbox`.
3. Não coloque `README.md` dentro da pasta da skill. Manuais longos vão em `references/`; scripts em `scripts/`.
4. O corpo de `SKILL.md` tem no máximo 500 linhas. Pastas e arquivos em kebab-case.

Scaffold:

```bash
pnpm exec tsx tools/skill-generator/generate.ts testing minha-skill
pnpm exec tsx tools/skill-generator/generate.ts product grill-me
```

## Gates locais (os mesmos da CI)

```bash
pnpm test
pnpm validate:skills
pnpm scan:skills
pnpm compile:catalog
```

`compile:catalog` gera `packages/skills-catalog/dist/skills-registry.json` (gitignorado) com SHA-256 por arquivo.

## Consumir o catálogo via MCP (local)

O servidor MCP `stdio` lê o catálogo Git deste repo (não há publicação NPM, `ASP_REGISTRY_URL` nem embeddings nesta fatia).

```bash
pnpm mcp:catalog
```

Opcional: `ASP_CATALOG_ROOT` aponta para a raiz do pacote catálogo (a pasta que contém `skills/`). O default é `packages/skills-catalog` do workspace.

Exemplo de `mcpServers` (Cursor / Claude Desktop) contra o checkout local:

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

Alternativa com `tsx` direto: `pnpm exec tsx packages/mcp-server/src/index.ts`.

Progressive disclosure — as 4 tools, nesta ordem:

1. `search_skills` — `{ name, description, category, version }[]` (nunca o corpo de `SKILL.md`)
2. `read_skill` — `SKILL.md` depois do SHA-256 + listas de paths em `references/` e `scripts/` (sem o conteúdo delas)
3. `fetch_skill_files` — texto de `references/` ou `templates/` pontuais (recusa `scripts/`)
4. `prepare_skill_files` — staging local (ou `dry_run`) de scripts/paths do manifesto; não executa

Formato canônico: ver `arquitetura_plataforma_skills_mcp.md` e `cognitive-base/decisions/dec-002-formato-canonico-skill.md`.
