# Como contribuir com a Base Cognitiva

Esta pasta é um vault Obsidian. Toda navegação interna usa **wikilinks**.
O índice (`index.md`) e as estatísticas do `README.md` são gerados pelo `cb-index` — não edite `index.md` à mão.

## Links

Use sempre wikilinks pelo nome do arquivo:

```
✅ [[dec-020-escolha-formato-canonico]]
✅ [[dec-020-escolha-formato-canonico|Formato canônico da skill]]
✅ [[meta/glossary#idempotencia|idempotência]]

❌ [dec-020](../decisions/dec-020-escolha-formato-canonico.md)
```

O wikilink ativa o Graph View e os Backlinks do Obsidian. Em tabelas, use `[[nome]]` **sem** alias (`|` quebra o parser GFM).

Termos de domínio não se definem inline — apontam para `[[meta/glossary#ancora|termo]]`.

## Ciclo de vida de uma nota

1. Toda nota nasce com `status: draft` (via `cb-note` ou a partir do template em `meta/templates/note.md`).
2. Promoção a `approved` é revisão humana, em PR.
3. `superseded` marca nota substituída; o sucessor entra em `links:`.
4. O `id` é permanente. Mover o arquivo de pasta não muda o `id`.

## Front matter

Campos obrigatórios: `id`, `type`, `title`, `status`, `created`, `author`.

Prefixo do `id` segue o quadrante:

| Quadrante    | Prefixo | Pergunta                              |
| ------------ | ------- | ------------------------------------- |
| `decisions/` | `dec-`  | Por que isso é assim?                 |
| `specs/`     | `spc-`  | O que o sistema faz?                  |
| `system/`    | `sys-`  | Como o sistema existe hoje?           |
| `guides/`    | `gd-`   | Como trabalhar dentro do sistema?     |
| `ops/`       | `ops-`  | Como operar o sistema?                |

O `type` vive no front matter, não na pasta. Subpastas são **domínio de negócio** (exceto `guides/`, organizado por natureza: architecture, framework, patterns, onboarding).

## PRs e o agente

O workflow `doc-agent` comenta no PR uma **sugestão** de nota (quadrante + type) a partir do título/labels. Ele não escreve na base.

Crie o rascunho com `cb-note`. Depois de criar ou atualizar notas, rode `cb-index` para regenerar `index.md` e os blocos `<!-- cb-index:... -->` do README.

O workflow `doc-quality` audita front matter, IDs duplicados e wikilinks quebrados em PRs que tocam `cognitive-base/**.md`.

## Autor padrão

Handle: `@luiscarloslopesjr`
