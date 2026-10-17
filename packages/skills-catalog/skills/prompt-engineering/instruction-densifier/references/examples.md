# Exemplos before/after

## `description-only` — boa

Original:

```text
Ajuda a compactar instruções longas para modelos. Pode ser usada quando alguém
quer encurtar um AGENTS.md, condensar rules, deduplicar prompts ou densificar
a description de uma skill sem perder o gatilho.
```

Compactada:

```text
Compacts instructional text (prompts, AGENTS.md, rules, skills) for LLMs.
Use when shortening, condensing, deduplicating, or densifying model-facing
instructions. Do NOT use for code implementation, product copy, or summarizing
non-instructional text.
```

Por quê: mantém o que faz, quando usar, near-misses e os termos de trigger
(`AGENTS.md`, `densifying`, `deduplicating`); adiciona os marcadores `Use when`
/ `Do NOT use for` que o validador do catálogo exige.

## `description-only` — ruim

```text
Ajuda com várias coisas relacionadas a instruções para IA.
```

Por quê: perdeu termos de trigger, ficou abstrata e compete mal com skills
vizinhas.

## `replacement-ready` — corpo

Original:

```md
## Commits

É muito importante que você sempre escreva mensagens de commit claras. Use o
formato Conventional Commits, por exemplo `feat(auth): add JWT login`. Nunca
faça commit direto na branch `main`; crie uma branch antes. Lembre-se: nunca
commite direto na main, isso quebra o fluxo de PR. Antes de commitar, rode
`pnpm test` e confirme que passou. Se os testes falharem, não commite — avise
o usuário com a saída do erro.
```

Compactado:

```md
## Commits

- formato Conventional Commits: `feat(auth): add JWT login`
- nunca commite em `main`; crie branch antes
- rode `pnpm test` antes de commitar; se falhar, não commite e mostre a saída
  do erro ao usuário
```

Por quê: a proibição de `main` aparecia duas vezes e virou uma; a justificativa
("quebra o fluxo de PR") não muda nenhuma decisão e saiu; o condicional de
teste falhando e o fallback (avisar com a saída) ficaram inteiros; os literais
(`main`, `pnpm test`, o exemplo de mensagem) estão exatos.

## Quando **não** cortar a justificativa

Original:

```md
Faça uma pergunta por vez. Decisões de plano formam uma árvore: a resposta da
pergunta A muda qual deve ser a pergunta B.
```

Manter as duas frases. A segunda não é ênfase: ela diz ao modelo como escolher
a próxima pergunta em casos que a regra crua não lista. Cortá-la muda o
comportamento em situações novas.
