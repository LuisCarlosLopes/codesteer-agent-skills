# Reasoning — Referência

> Documentação oficial: https://docs.agno.com/reasoning/overview

## 1. Reasoning Model (nativo)

```python
# Use modelos com CoT nativo (gpt-5, claude-sonnet-4-5, deepseek-r1)
agent = Agent(model=OpenAIResponses(id="gpt-5.2"))
agent.print_response("Problema complexo...", show_full_reasoning=True)
```

## 2. Reasoning Tools (scratchpad explícito)

```python
from agno.tools.reasoning import ReasoningTools

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tools=[ReasoningTools(add_instructions=True)],
    markdown=True,
)
# Agente usa think() e analyze() como ferramentas antes de responder
```

## 3. Reasoning Agent (qualquer modelo)

```python
agent = Agent(
    model=OpenAIChat(id="gpt-4o"),  # Modelo comum → vira reasoning system
    reasoning=True,
    markdown=True,
)
# Cria um agente de raciocínio interno com o mesmo modelo
```

## Tabela de escolha

| Abordagem           | Transparência    | Melhor para                             | Restrição de modelo  |
|---------------------|------------------|-----------------------------------------|----------------------|
| Reasoning Models    | Alta (trace)     | Problemas complexos single-shot         | Precisa de CoT nativo|
| Reasoning Tools     | Estruturada      | Pesquisa, análise, planejamento         | Qualquer modelo      |
| Reasoning Agents    | Iterativa        | Múltiplas tool calls sequenciais        | Qualquer modelo      |
