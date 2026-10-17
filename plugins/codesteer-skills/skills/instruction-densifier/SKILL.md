---
name: instruction-densifier
description: "Compacts model-facing instructional text (system prompts, AGENTS.md, CLAUDE.md, .cursorrules, skill bodies and skill descriptions) to fewer tokens with the same operational semantics: triggers, precedence, obligations, prohibitions and exact literals survive. Use when the user wants to shorten, condense, trim, deduplicate, densify or \"cut tokens\" from instructions, when a prompt or SKILL.md is over its size budget, or when a skill description must stay short without losing its triggers. Do NOT use for code implementation, product or marketing copy, or summarizing non-instructional text."
license: Apache-2.0
compatibility: "Minimum agent tier: 1. Requires terminal: no. Network access: no. Script execution: no."
metadata:
  version: 0.1.0
  author: "@codesteer"
  category: prompt-engineering
  min-agent-tier: "1"
  requires-terminal: "false"
  sandbox-network: "false"
  sandbox-allow-exec: "false"
---

# Instruction Densifier

Reescreve texto instrucional (prompts, AGENTS.md, rules, skills) na forma mais
curta que ainda produz **o mesmo comportamento** no modelo que vai lê-lo. O
consumidor é um LLM; legibilidade humana só importa quando o usuário pedir ou
quando o arquivo é revisado em diff.

## Princípio

Comportamento constante, tokens mínimos. Compressão que muda o que o consumidor
faria em algum cenário não é compressão — é reescrita, e reescrita só acontece
com pedido explícito. Na dúvida entre perder um átomo e gastar tokens, gaste
tokens.

## Modos

Escolha o modo antes de ler em detalhe; ele define a forma da saída.

| Modo | Saída | Quando |
|---|---|---|
| `replacement-ready` | Markdown enxuto, mesma estrutura e headings do original | default |
| `description-only` | uma frase densa: o que faz + quando usar + near-misses | alvo é a `description` de uma skill ou tool |
| `ultra-dense` | mini-linguagem de átomos ([references/ultra-dense.md](references/ultra-dense.md)) | usuário aceitou texto estranho e o consumidor é só o modelo |

Sinais: "pode ficar estranho", "é só pro modelo ler" → `ultra-dense`. Menção a
revisão humana, diff ou PR → `replacement-ready` preservando headings e ordem,
para o diff continuar legível. Pedido ambíguo → `replacement-ready`.

## Invariantes

Átomos normativos que nunca podem se perder. Inventário no início; auditoria
contra ele no fim.

- **precedência**: qual regra ganha em conflito, e ordem de execução quando ela
  altera o efeito
- **obrigações, proibições, exceções e fallbacks** — inclusive os raros,
  inclusive guardrails de segurança e de tom
- **condicionais**: `IF condição -> efeito`
- **literais sensíveis**: paths, comandos, flags, env vars, nomes de
  tools/agents/arquivos, campos JSON, templates de saída, datas, versões,
  limites numéricos — ficam exatos, nunca parafraseados
- **marcadores exigidos por validadores**: em skills deste catálogo, `"Use when"`
  e `"Do NOT use for"` na `description`, frontmatter completo e `name` igual à
  pasta; em outros ecossistemas, o que o validador de lá exigir
- **em `description`**: o que faz + quando acionar + near-misses que devem
  disparar + os termos de trigger originais

Preserve **efeito, não prosa**. Uma frase longa e uma curta que levam ao mesmo
comportamento são equivalentes; uma proibição apagada não é.

## O que cortar

- introdução, histórico e motivação que não mudam nenhuma decisão
- justificativa longa e ênfase retórica sem restrição nova
- a mesma regra repetida em seções diferentes → uma ocorrência, onde ela se
  aplica primeiro
- exemplos redundantes → só os que carregam formato exato ou edge case único
- tabelas e listas que cabem num bullet ou em `chave: valor`
- meta-instrução sem efeito operacional ("você é um assistente útil que...")

Mantenha a justificativa quando ela **muda a decisão** em casos não listados:
"uma pergunta por vez, porque a resposta A muda a pergunta B" diz ao modelo
como agir em situações que a regra crua não cobre. Isso é átomo, não prosa.

Nunca: invente regra, suavize norma ("nunca" → "evite"), apague exceção rara,
generalize um literal.

## Procedimento

1. **Modo** — escolha pela tabela acima.
2. **Inventário** — leia tudo e liste os átomos normativos (rascunho, não
   entregue). É a referência da auditoria; sem ele a auditoria vira impressão.
3. **Dedupe semântico** — frases que diferem só em tom viram uma; regra
   espalhada em várias seções consolida num ponto.
4. **Realocação, quando o alvo suporta carga sob demanda** — skill com
   `references/`, AGENTS.md com arquivos linkados: material de manual
   (tutoriais, tabelas de referência, listas longas) sai do corpo para um
   arquivo referenciado, com ponteiro de uma linha dizendo *quando* ler.
   Reduz tokens do nível sempre-carregado sem perder nada. Não vale para
   prompt de arquivo único.
5. **Reescrita** — forma mais enxuta que carrega todos os átomos, no formato
   do modo.
6. **Auditoria** — cruze a saída com o inventário (seção abaixo).

## Regras de `description-only`

Menos tokens, mesmo trigger. A `description` é o único texto que o modelo vê ao
decidir se consulta a skill, e modelos tendem a **subacionar** skills; a versão
densa deve ser levemente "pushy", não neutra.

- preserve `o que faz` + `quando usar` + near-misses que evitam undertrigger
- mantenha os termos de trigger originais e variações plausíveis (nomes de
  arquivo como `AGENTS.md`, verbos como "densificar", "deduplicar", nome da
  skill)
- mantenha os marcadores literais que o validador exige
- corte floreio e exemplos longos
- orçamento: 60–100 palavras (as descriptions deste catálogo ficam nessa
  faixa). Acima disso, corte parênteses explicativos e exemplos antes de
  tocar em qualquer termo de trigger; ganhar robustez de trigger não é
  licença para a versão densa sair mais longa que a original
- falha se a versão densa perder um termo de trigger ou ficar abstrata a ponto
  de competir mal com skills vizinhas

Before/after: [references/examples.md](references/examples.md).

## Auditoria de perda

Antes de entregar, para cada item do inventário, localize onde ele está na
saída. Confirme também:

- nenhuma regra nova entrou; nenhuma norma foi suavizada
- nenhuma simplificação virou ambiguidade (duas leituras onde o original tinha
  uma)
- literais idênticos byte a byte
- em `description`: acionável, termos de trigger intactos, marcadores do
  validador presentes
- se o alvo tem limite de tamanho (SKILL.md deste catálogo: corpo ≤ 500
  linhas), a saída respeita

Se algum trecho não comprime com segurança, **não adivinhe**: mantenha o
original nesse ponto e anexe:

```md
LOSS-RISK:
- <trecho e por que depende de confirmação>
```

## Entrega

- alvo é arquivo no repositório → aplique a edição no arquivo
- alvo é texto colado → responda só com o texto compactado
- em ambos: só o texto final, mais `LOSS-RISK` se houver. Sem relatório de
  processo nem contagem de tokens, salvo pedido explícito.
