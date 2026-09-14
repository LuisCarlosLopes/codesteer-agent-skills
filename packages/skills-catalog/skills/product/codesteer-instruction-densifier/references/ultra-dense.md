# Mini-linguagem ultra-dense

Use só no modo `ultra-dense`. Emita **apenas as chaves que existem** no original.

```md
# titulo
P: precedência
S: escopo
DO:
- ação
DONT:
- proibição
IF: condição -> efeito
EXC:
- exceção
FLOW: 1) passo 2) passo 3) passo
LIT:
- `template/comando exato`
REF:
- `arquivo/caminho`
```

Regras de emissão:

- uma regra normativa por linha quando isso reduz ambiguidade
- verbos canônicos (`usar`, `não usar`, `preservar`, `executar`, `notificar`)
- mantenha headings só se ajudarem navegação ou compatibilidade
- literais sensíveis ficam literais e exatos (paths, flags, templates, nomes)
