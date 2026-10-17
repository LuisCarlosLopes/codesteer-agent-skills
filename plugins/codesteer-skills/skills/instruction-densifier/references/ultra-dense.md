# Mini-linguagem ultra-dense

Use só no modo `ultra-dense`. Emita **apenas as chaves que existem** no
original; chave vazia é ruído.

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
- `arquivo/caminho` — quando ler
```

Regras de emissão:

- uma regra normativa por linha quando isso reduz ambiguidade
- verbos canônicos (`usar`, `não usar`, `preservar`, `executar`, `notificar`)
- mantenha headings só se ajudarem navegação ou compatibilidade com quem
  referencia o arquivo por seção
- literais sensíveis ficam literais e exatos (paths, flags, templates, nomes)
- frontmatter YAML de skill **não** entra na mini-linguagem: a `description`
  continua prosa (é o trigger e passa por validador); só o corpo é convertido

## Exemplo

Original:

```md
## Perguntas

Faça perguntas não óbvias, uma de cada vez. Várias perguntas em paralelo
confundem o raciocínio. Se a resposta puder ser obtida lendo o código ou os
artefatos em `.memory-bank/specs/`, explore primeiro; só pergunte quando a
resposta depende de intenção ou decisão de produto não registrada.
```

Ultra-dense:

```md
# perguntas
DO:
- perguntar não óbvio, uma por vez
DONT:
- várias perguntas em paralelo
IF: resposta está no código ou em `.memory-bank/specs/` -> explorar antes de perguntar
IF: resposta depende de intenção/decisão de produto não registrada -> perguntar
```
