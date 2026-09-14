---
name: codesteer-instruction-densifier
description: >
  Compacts instructional text (prompts, AGENTS.md, rules, skills) for LLMs:
  fewer tokens, same operational semantics (triggers, precedence, obligations,
  prohibitions). Use when shortening, condensing, deduplicating, or densifying
  model-facing instructions. Do NOT use for code implementation, product copy,
  or summarizing non-instructional text.
metadata:
  version: 0.0.1
  author: "@codesteer"
  license: Apache-2.0
compatibility:
  min_agent_tier: 1
  requires_terminal: false
sandbox:
  network: false
  allow_exec: false
---

# Instruction Densifier

Transforma texto instrucional em texto de alta densidade semântica para LLM.
Preserva o comportamento; remove a prosa. Legibilidade humana é secundária, a
menos que o usuário peça o contrário. Opera em Markdown/texto; sem build,
deploy ou stack específica.

## Princípio

Comportamento constante, tokens mínimos. Se a compressão muda o que o consumidor
do texto faria, ela está errada — não é compressão, é reescrita.

## Invariantes (nunca perca)

Lista canônica de **átomos normativos**. A auditoria final é contra ela.

- precedência normativa (qual regra ganha em conflito)
- obrigações, proibições, exceções e fallbacks
- condicionais (`IF condição -> efeito`)
- ordem de execução quando ela altera o comportamento
- literais sensíveis: paths, comandos, flags, env vars, nomes de tools/agents,
  campos JSON, templates que precisem ficar exatos
- datas, versões, limites numéricos
- em `description` de skill: o que a skill faz + quando acionar + near-misses
  que devem disparar

Preserve **efeito, não prosa**. Literal sensível fica literal e exato.

## Comprima ou remova

- introduções, contexto histórico e motivação que não mudam decisão
- justificativas longas e ênfase retórica sem nova restrição
- repetição da mesma regra em seções diferentes
- exemplos redundantes — mantenha só o que carrega formato ou edge case único
- tabelas/listas que cabem em bullet curto ou `chave: valor`

Nunca invente regra nova, suavize regra normativa ou apague exceção rara.

## Algoritmo

1. Leia tudo. Conte os átomos normativos do original (referência para a auditoria).
2. Dedupe semântico: frases que diferem só no tom viram uma; regra espalhada em
   várias seções consolida num ponto só.
3. Reescreva na forma mais enxuta que ainda carregue **todos** os átomos (ver
   [Forma de saída](#forma-de-saída)).
4. Audite contra os Invariantes em silêncio. Token delta só se o usuário pedir.

## Forma de saída

O **default preserva a estrutura do original**. Mini-linguagem de átomos é
agressiva e opt-in.

| Modo | Forma de saída | Default quando |
|---|---|---|
| `replacement-ready` | markdown enxuto, mesma estrutura e headings | caso geral |
| `diff-safe` | preserva headings e ordem atuais; corta só prosa | arquivo versionado / revisão em diff |
| `description-only` | uma frase densa "o que faz + quando usar" | alvo é a frontmatter `description` |
| `ultra-dense` | mini-linguagem de átomos | usuário aceita texto estranho e o consumidor é só LLM |

Seleção default: alvo é `description` → `description-only`; usuário disse "pode
ficar estranho / é só para o modelo" → `ultra-dense`; caso contrário →
`replacement-ready`.

No modo `ultra-dense`, leia [references/ultra-dense.md](references/ultra-dense.md)
antes de emitir.

## Regras para `description-only`

Objetivo: menos tokens, mesmo trigger.

- preserve explicitamente `o que faz` + `quando usar` + near-misses que evitam
  undertrigger
- mantenha os termos de trigger principais e variações plausíveis
- corte floreio e exemplos longos; deixe a descrição densa e levemente "pushy"
- falha se a description compactada perder um termo de trigger que a original
  tinha (`AGENTS.md`, `densificar`, `deduplicar`, nome da skill, etc.)
- não fique tão abstrata que passe a competir mal com skills vizinhas

Exemplos before/after: [references/examples.md](references/examples.md).

## Auditoria de perda (gate final)

Antes de entregar, confirme contra os Invariantes:

- nenhuma proibição, exceção, ordem obrigatória ou literal sensível se perdeu
- nenhuma regra nova entrou; nenhuma norma foi suavizada
- nenhuma simplificação virou ambiguidade
- em `description`, a skill continua claramente acionável e nenhum termo de
  trigger original desapareceu

Se em algum ponto a compressão segura não for possível, **não adivinhe** —
anexe:

```md
LOSS-RISK:
- <ponto ambíguo ou que depende de confirmação>
```

## Entrega

1. identifique o modo
2. entregue **só** o texto compactado (mais `LOSS-RISK`, se houver)
3. não produza relatório de processo, salvo pedido explícito — o foco é o texto final
