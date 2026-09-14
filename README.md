# codesteer-agent-skills

Plataforma de catálogo de skills para agentes de IA. Nesta fatia, **subir uma skill** significa abrir um PR no Git que adiciona a pasta canônica no monorepo — não há API de upload nem publicação NPM.

## Como adicionar uma skill

1. Crie `packages/skills-catalog/skills/<categoria>/<nome-kebab>/SKILL.md` (categorias iniciais: `architecture`, `security`, `testing`).
2. O frontmatter precisa de `name` (igual à pasta), `description` com **"Use when"** e **"Do NOT use for"**, `metadata`, `compatibility` e `sandbox`.
3. Não coloque `README.md` dentro da pasta da skill. Manuais longos vão em `references/`; scripts em `scripts/`.
4. O corpo de `SKILL.md` tem no máximo 500 linhas. Pastas e arquivos em kebab-case.

Scaffold:

```bash
pnpm exec tsx tools/skill-generator/generate.ts testing minha-skill
```

## Gates locais (os mesmos da CI)

```bash
pnpm test
pnpm validate:skills
pnpm scan:skills
pnpm compile:catalog
```

`compile:catalog` gera `packages/skills-catalog/dist/skills-registry.json` (gitignorado) com SHA-256 por arquivo.

Formato canônico: ver `arquitetura_plataforma_skills_mcp.md` e `cognitive-base/decisions/dec-002-formato-canonico-skill.md`.
