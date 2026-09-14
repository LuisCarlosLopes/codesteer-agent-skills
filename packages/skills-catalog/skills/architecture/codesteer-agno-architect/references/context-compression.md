# Context Compression — Referência

> Documentação oficial: https://docs.agno.com/compression/overview

> Docs: https://docs.agno.com/compression/overview | v2.2.3+

Tool calls verbosos (web search, APIs, SQL) acumulam tokens rapidamente. Sem compressão, um workflow com 4 tool calls pode consumir 12.000 tokens apenas em resultados. Context Compression resolve isso resumindo automaticamente os resultados mais antigos quando um limiar é atingido.

```
Sem compressão:  Tool 1 (2.5k) + Tool 2 (5.7k) + Tool 3 (8.5k) + Tool 4 (12k)  = 💸 caro
Com compressão:  Tool 1 (2.5k) + Tool 2 (5.7k) + [COMPRIMIDO] + Tool 4 (1.3k)  = ✅ eficiente
```

## Ativação rápida (padrão: comprime após 3 tool calls)

```python
from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tools=[DuckDuckGoTools()],
    compress_tool_results=True,  # Threshold padrão: 3 tool calls
)

# Também funciona em membros individuais de Teams
```

## Compressão customizada com `CompressionManager`

```python
from agno.agent import Agent
from agno.compression.manager import CompressionManager
from agno.models.anthropic import Claude
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

compression_manager = CompressionManager(
    # ⭐ Padrão arquitetural: modelo leve para comprimir, pesado para raciocinar
    model=OpenAIChat(id="gpt-4o-mini"),          # Rápido e barato para resumos
    compress_tool_results_limit=2,               # Comprime após 2 tool calls (padrão: 3)
    compress_tool_call_instructions="Preserve números, datas, URLs e entidades-chave. Remova boilerplate.",
)

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),        # Modelo principal
    tools=[DuckDuckGoTools()],
    compression_manager=compression_manager,
)
```

## Dois modos de gatilho

| Modo | Parâmetro | Quando usar |
|------|-----------|-------------|
| **Por contagem** | `compress_tool_results_limit=N` | Padrão de tool calls previsível — comprime após N resultados |
| **Por tokens** | `compress_token_limit=N` | Resultados de tamanho variável ou limites de contexto rígidos |

```python
# Modo por tokens: controle preciso sobre o tamanho do contexto
compression_manager = CompressionManager(
    model=OpenAIChat(id="gpt-4o-mini"),
    compress_token_limit=5000,   # Comprime quando contexto total exceder 5k tokens
    # O contador inclui: mensagens, definições de tools, output schema e multimodal
)
```

> **Nota:** Se nenhum limiar for configurado, `compress_tool_results_limit` assume o valor padrão de `3`.

## Token Counting — estimativa de contexto

```python
from agno.models.message import Message
from agno.models.openai import OpenAIChat
from pydantic import BaseModel

class Resposta(BaseModel):
    resposta: str

model = OpenAIChat(id="gpt-4o")

messages = [
    Message(role="system", content="Você é um assistente preciso."),
    Message(role="user", content="Resuma a compressão de contexto em 2 frases."),
]

tools = [{
    "type": "function",
    "function": {
        "name": "buscar_web",
        "description": "Busca informações na web.",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
}]

# Conta inclui: mensagens + tools + output schema
tokens = model.count_tokens(messages=messages, tools=tools, output_schema=Resposta)
print(f"Tokens estimados: {tokens}")
```

> Para maior precisão de contagem, instale: `pip install tiktoken tokenizers`

## Comportamento assíncrono

Ao usar `arun()` em Agent ou Team, a compressão de cada tool call ocorre **concorrentemente** — sem bloquear o loop principal. Use `arun()`/`aprint_response()` em produção para extrair o máximo benefício.

## Quando usar Context Compression

**Ideal para:**
- Agentes com tools que retornam respostas verbosas (web search, scrapers, SQL com muitas linhas)
- Workflows multi-step com muitas chamadas sequenciais de ferramentas
- Sessões longas onde o contexto acumula ao longo do tempo
- Sistemas de produção onde custo de tokens é crítico

**Não use quando:**
- Workflows curtos com 1–2 tool calls (overhead desnecessário)
- Tools que retornam dados estruturados compactos (o resumo pode perder precisão numérica)
- Quando preservar o resultado exato da tool é obrigatório para o próximo passo
