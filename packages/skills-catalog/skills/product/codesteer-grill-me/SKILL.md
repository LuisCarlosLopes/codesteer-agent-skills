---
name: codesteer-grill-me
description: >
  Adversarial interrogation of a plan, design or spec before it becomes code: surfaces hidden
  assumptions, contradictions, dead ends and decisions made by inertia, one question at a time.
  Use when the user asks to be grilled or pressure-tested — "me grille", "encontre buracos no
  plano", "o que pode dar errado?", "está pronto pra implementar?", "challenge my design".
  Do NOT use for implementing, debugging or reviewing code already written, nor for gathering
  requirements from scratch.
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

Interrogue o usuário sobre o plano até que não reste nenhuma dependência não-resolvida entre decisões. O objetivo é surfacer premissas ocultas, contradições, becos sem saída e decisões tomadas por inércia — não confirmar o que já está claro.

Faça perguntas **não óbvias**, uma de cada vez. Várias perguntas em paralelo confundem o raciocínio e escondem o impacto de cada resposta nas próximas decisões.

## Por que uma pergunta por vez

Decisões de plano formam uma árvore, não uma lista. A resposta da pergunta A muda qual deve ser a pergunta B. Disparar várias ao mesmo tempo congela ramificações que ainda não foram examinadas e força o usuário a responder sobre premissas que ainda não foram testadas. O custo de uma pergunta por vez é alguns turnos a mais; o ganho é não ter que refazer o plano depois.

## Turno padrão

Para cada pergunta, use exatamente este formato:

```
Pergunta N: <pergunta curta e específica>

Por que perguntar: <o que essa pergunta tenta desestabilizar/confirmar — qual premissa ou dependência ela toca>

Resposta recomendada: <sua melhor recomendação, com justificativa>

Próximo ramo se "sim": <o que fica desbloqueado ou precisa ser checado a seguir>
Próximo ramo se "não": <o que precisa ser replanejado>
```

A recomendação não é o veredito — é o ponto de partida para o usuário reagir. O usuário pode aceitar, refutar ou redirecionar.

## Como escolher a próxima pergunta

Siga por dependência, não por tópico:

1. Comece pela decisão com mais dependências pendentes (a que, se respondida, mais reduz incerteza do resto do plano).
2. Dentro dela, ataque a premissa mais frágil primeiro — aquela que, se falsa, derruba o maior número de decisões dependentes.
3. Só avance para outro ramo quando o atual não tiver mais decisões pendentes que afetem o resto.

Prefira perguntas que, se respondidas de forma contraintuitiva, invalidam o plano — são elas que geram valor. Perguntas cuja resposta qualquer seja mantém o plano intacto são baixo valor e devem ser raras.

## Antes de perguntar

Se a pergunta puder ser respondida explorando o código-fonte, artefatos existentes (`.memory-bank/specs/`, PRDs, IPDs, ADRs) ou logs, **explore primeiro**. Não transfira para o usuário trabalho que você pode resolver lendo o repositório. Só pergunte quando a resposta depende de intenção, contexto futuro ou decisão de produto que não está registrada.

## Critério de parada

Pare quando TODAS estas condições forem verdadeiras:

- Não há decisão pendente cuja resposta afete mais de uma outra decisão.
- Toda premissa crítica do plano foi explicitada e confirmada ou refutada.
- Os caminhos "se sim / se não" das últimas perguntas convergem para o mesmo conjunto de ações.
- O usuário não levantou objeção nova nos últimos turnos.

Ao parar, emita um fechamento curto listando: premissas confirmadas, premissas refutadas (com impacto no plano), e decisões ainda em aberto (se houver) — marcadas como risco, não como bloqueio.

## O que NÃO fazer

- Não liste todas as perguntas de uma vez "para o usuário escolher" — isso transfere o trabalho de orquestração de volta para o usuário.
- Não repita a resposta do usuário de volta para ele como "então você quer X" — só avance para a próxima pergunta não-óbvia.
- Não faça perguntas de "checklist de compliance" (vai ter testes? vai ter logs?) que valem para qualquer projeto — foque no que é específico deste plano.
