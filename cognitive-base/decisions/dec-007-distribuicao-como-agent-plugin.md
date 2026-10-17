---
id: dec-007
type: adr
title: Distribuição do catálogo como plugin único no padrão Agent Plugins, com manifests de vendor
status: draft
created: "2026-10-17"
updated: "2026-10-17"
author: "@luiscarloslopesjr"
links:
  - id: dec-002
    rel: depends-on
  - id: dec-004
    rel: related-to
  - id: dec-005
    rel: related-to
  - id: sys-001
    rel: documents
tags: [adr, plugin, agent-plugins, distribuicao]
source: greenfield
migration_status: ""
meta:
  generator: tools/build-plugin.ts
  output: plugins/codesteer-skills
---

# Distribuição do catálogo como plugin único no padrão Agent Plugins, com manifests de vendor

## Contexto

Até aqui uma [[meta/glossary#skill|skill]] chegava ao agente por dois caminhos: o MCP local ([[dec-004-entrega-dupla-cli-mcp]]) ou cópia/symlink manual de cada pasta. Os agentes que usamos (Claude Code, OpenAI Codex/ChatGPT, GitHub Copilot, Cursor, Gemini CLI e Antigravity) agora instalam **plugins** direto de um repositório GitHub. Por isso o catálogo precisava de um formato instalável em todos eles.

Dois obstáculos:

1. **Árvore aninhada.** Nenhum formato de plugin aceita `skills/<categoria>/<nome>/`. O padrão [Agent Plugins 1.0](https://agent-plugins.org/) varre só um nível (`skills/<nome>/SKILL.md`, sem busca recursiva), e Claude, Cursor e Gemini assumem o mesmo layout.
2. **Formatos divergentes.** O Agent Plugins (root `plugin.json`) é lido por Codex, Copilot CLI/VS Code, Cursor e Antigravity. O Claude Code **não** o lê e continua exigindo `.claude-plugin/`. O import do GitHub no Cursor exige `.cursor-plugin/marketplace.json`, e o Gemini CLI exige `gemini-extension.json` na raiz do repo ou do archive de release.

## Decisão

O catálogo é distribuído como **um plugin único**, `codesteer-skills`, em `plugins/codesteer-skills/`. Essa pasta é gerada por `tools/build-plugin.ts` (`pnpm build:plugin`) a partir da árvore canônica de [[dec-002-formato-canonico-skill]], que não muda.

- **Achatamento.** `skills/<categoria>/<nome>` vira `plugins/codesteer-skills/skills/<nome>`. Para isso o validador ganhou duas regras: `name` único entre categorias e `description` ≤ 1024 caracteres (limite do spec agentskills.io; acima dele VS Code/Copilot descartam a skill em silêncio). `evals/` e dotfiles não entram na cópia.
- **Normalização do frontmatter só na cópia.** O resultado segue o spec agentskills.io: `metadata` como mapa string→string (inclui `category`), `compatibility` como texto e `license` no topo. `disable-model-invocation` e `user-invocable` são repassados, e o corpo é copiado byte a byte.
- **Manifests emitidos:**

| Arquivo | Atende |
| --- | --- |
| `plugins/codesteer-skills/plugin.json` (Agent Plugins 1.0, só `$schema`/`name`/`description`) | Codex, Copilot CLI/VS Code, Cursor, Antigravity (cujo schema fechado só aceita `name`/`description`) |
| `plugins/codesteer-skills/.claude-plugin/plugin.json` (sem `version`) | Claude Code / Claude.ai |
| `plugins/codesteer-skills/.cursor-plugin/plugin.json` | Cursor (resolução a partir do marketplace) |
| `plugins/codesteer-skills/gemini-extension.json` | Gemini CLI (via archive de release) |
| `.claude-plugin/marketplace.json` (raiz, `source` em string) | Claude Code, Copilot CLI/VS Code, import de marketplace do ChatGPT |
| `.agents/plugins/marketplace.json` (raiz, com `policy`/`category`) | Codex |
| `.cursor-plugin/marketplace.json` (raiz) | Cursor *From GitHub Repository* |

- **Saída versionada e determinística.** O plugin é instalado clonando o repo, e `dist/` está no gitignore. Por isso a cópia vai para o Git, marcada como `linguist-generated`. O CI roda `pnpm build:plugin --check` e bloqueia drift.
- **Release do Gemini.** Uma tag `v<version>` (igual à de `packages/skills-catalog/package.json`) dispara `release-plugin.yml`, que publica o archive com `gemini-extension.json` na raiz.

## Alternativas Consideradas

| Alternativa | Por que não |
| --- | --- |
| Symlinks de `plugins/…/skills/<nome>` para a árvore canônica | Quebram ao copiar o plugin para o cache do agente (aponta para fora da raiz do plugin) e no Windows |
| Mover o canônico para `skills/<nome>` plano com categoria no metadata | Refatora validador, scanner, compilador e MCP e reabre [[dec-002-formato-canonico-skill]] |
| Plugin na raiz do repositório | Instala o repo inteiro (cognitive-base, packages) no cache e põe um `skills/` duplicado ao lado do canônico, confundindo quem contribui |
| Um plugin por categoria | Multiplica manifests, e Agent Plugins/Gemini só suportam um plugin por raiz |
| Só o manifest Agent Plugins | Claude Code não lê, e o import do GitHub no Cursor exige `.cursor-plugin/marketplace.json` |

## Consequências

- Toda mudança de skill exige `pnpm build:plugin` e o commit da saída. O CI falha se a cópia estiver fora de sincronia, e a cópia nunca é editada à mão.
- O `contentHash` do [[meta/glossary#registry|registry]] ([[dec-005-integridade-supply-chain]]) continua calculado sobre a árvore canônica. Os `SKILL.md` normalizados do plugin têm hash diferente, de propósito.
- `.claude-plugin/plugin.json` sem `version` faz cada commit virar versão nova (updates automáticos), mas `claude plugin validate --strict` emite warning. Validamos sem `--strict`.
- Com o `plugin.json` Agent Plugins presente, o Copilot ignora `.claude-plugin/`. Isso é aceitável porque o plugin só carrega skills.
- O servidor MCP ([[sys-004-mcp-server]]) fica fora do plugin no v1: depende de `tsx`/pnpm e grava `dist/` na raiz do catálogo, então não é autocontido.
- Gemini CLI é tratado como legado: foi substituído pelo Antigravity CLI no free tier em 2026-06-18. O Antigravity instala por caminho local (`agy plugin install <clone>/plugins/codesteer-skills`) ou por `agy plugin import gemini`.
- Verificado em 2026-10-17: `claude plugin validate` (plugin e marketplace, só o warning de `version`), `agy plugin validate --strict` (23 skills), `gemini extensions validate`, e instalação isolada via marketplace no Codex e no Copilot CLI (23 skills cada). Cursor e Claude.ai ainda precisam de teste manual.

## Notas Relacionadas

- [[dec-002-formato-canonico-skill]] — a árvore canônica continua sendo a fonte; o plugin é derivado dela
- [[dec-004-entrega-dupla-cli-mcp]] — o plugin é um terceiro canal de entrega, estático como a CLI, sem progressive disclosure
- [[dec-005-integridade-supply-chain]] — os hashes do registry seguem sobre o canônico, não sobre a cópia normalizada
- [[sys-001-skills-catalog]] — pacote de onde o gerador lê as skills

## Histórico

| Versão | Data       | Autor                | Descrição |
| ------ | ---------- | -------------------- | --------- |
| 1.0.0  | 2026-10-17 | @luiscarloslopesjr   | ADR draft: plugin único Agent Plugins + manifests Claude/Cursor/Gemini/Codex |
