## Tipo de mudança

- [ ] Nova nota (`draft`)
- [ ] Promoção `draft` → `approved`
- [ ] Atualização de nota existente
- [ ] Correção de IA (`ai-correction`)
- [ ] Nova skill / alteração de skill
- [ ] Código / outro

## Checklist de skill

Preencha quando o PR tocar `packages/skills-catalog/skills/`:

- [ ] Path `packages/skills-catalog/skills/<categoria>/<nome-kebab>/SKILL.md`
- [ ] `description` contém "Use when" e "Do NOT use for"
- [ ] Sem `README.md` na pasta da skill
- [ ] `pnpm validate:skills`, `pnpm scan:skills` e `pnpm compile:catalog` passam localmente

## Checklist da Base Cognitiva

Preencha quando o PR tocar `cognitive-base/`:

- [ ] Front matter completo (`id`, `type`, `title`, `status`, `created`, `author`)
- [ ] Prefixo do `id` bate com o quadrante (`dec-` / `spc-` / `sys-` / `gd-` / `ops-`)
- [ ] Links internos são wikilinks `[[nome-arquivo]]` (sem Markdown relativo)
- [ ] Termos de domínio apontam para `[[meta/glossary#termo|termo]]`
- [ ] `cb-index` regenerado se notas foram criadas ou alteradas

## Notas

<!-- O que esta mudança registra e por quê. -->
