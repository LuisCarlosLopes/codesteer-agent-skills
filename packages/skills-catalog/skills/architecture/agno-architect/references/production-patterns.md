# Padrões de Produção — Referência

> Documentação oficial: https://docs.agno.com/tracing/overview | https://docs.agno.com/guardrails/overview

## Tracing com OpenTelemetry

```python
from agno.agent import Agent
from agno.models.anthropic import Claude

# Tracing via AgentOS (recomendado)
agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    monitoring=True,  # Envia traces automáticos para https://app.agno.com
)

# Tracing customizado com OTEL
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

provider = TracerProvider()
trace.set_tracer_provider(provider)

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tracer=trace.get_tracer("meu-sistema"),
)
```

## Guardrails — Validação de Input/Output

```python
from agno.agent import Agent
from agno.models.anthropic import Claude

def validar_input(mensagem: str) -> tuple[bool, str]:
    """Valida o input antes de enviar ao modelo.
    Returns: (is_valid, mensagem_de_erro)
    """
    palavras_proibidas = ["senha", "cpf", "cartão"]
    for palavra in palavras_proibidas:
        if palavra.lower() in mensagem.lower():
            return False, f"Informação sensível detectada: '{palavra}'"
    return True, ""

def validar_output(resposta: str) -> tuple[bool, str]:
    """Valida o output antes de retornar ao usuário."""
    if len(resposta) > 10000:
        return False, "Resposta muito longa"
    return True, ""

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    input_guardrails=[validar_input],
    output_guardrails=[validar_output],
)
```

## Evals — Testes de Qualidade em Escala

```python
from agno.eval import AccuracyEval, PerformanceEval

# Eval de precisão
accuracy_eval = AccuracyEval(
    agent=agent,
    questions=[
        {"input": "Qual a capital do Brasil?", "expected": "Brasília"},
        {"input": "Quem escreveu Dom Casmurro?", "expected": "Machado de Assis"},
    ],
)
result = accuracy_eval.run()
print(f"Precisão: {result.accuracy:.1%}")

# Eval de performance
perf_eval = PerformanceEval(agent=agent, num_runs=10)
perf_result = perf_eval.run("Sua pergunta padrão aqui")
print(f"Latência média: {perf_result.avg_latency_ms}ms")
print(f"Tokens médios: {perf_result.avg_tokens}")
```

## AgentOS — Runtime de Produção

```python
# app.py
from agno.app.fastapi import FastApiApp
from agno.agent import Agent
from agno.models.anthropic import Claude

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    monitoring=True,
)

# Cria FastAPI com endpoints REST automáticos para o agente
app = FastApiApp(agents=[agent])
api = app.get_app()

# Rodar: uvicorn app:api --host 0.0.0.0 --port 8000
```

## Session Management em Produção

```python
from agno.agent import Agent
from agno.db.postgres import PostgresDb

db = PostgresDb(db_url="postgresql://user:pass@host:5432/prod_db")

def get_agent_for_user(user_id: str, session_id: str) -> Agent:
    """Factory: um agente por request, isolamento garantido."""
    return Agent(
        model=Claude(id="claude-sonnet-4-5"),
        db=db,
        user_id=user_id,
        session_id=session_id,
        update_memory_on_run=True,
    )

# Uso na API
@app.post("/chat")
async def chat(request: ChatRequest):
    agent = get_agent_for_user(request.user_id, request.session_id)
    response = await agent.arun(request.message, stream=False)
    return {"response": response.content}
```

## Cache de Respostas (Desenvolvimento)

```python
from agno.models.anthropic import Claude

# Cache em desenvolvimento para evitar custos desnecessários
agent = Agent(
    model=Claude(id="claude-sonnet-4-5", cache_response=True),
)
```

## Context Compression — Produção

```python
from agno.agent import Agent
from agno.compression.manager import CompressionManager
from agno.models.anthropic import Claude
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

# Padrão recomendado para produção:
# modelo leve comprime → modelo pesado raciocina sobre o resumo
compression_manager = CompressionManager(
    model=OpenAIChat(id="gpt-4o-mini"),     # Barato para comprimir
    compress_tool_results_limit=3,           # ou compress_token_limit=8000
    compress_tool_call_instructions=(
        "Preserve: números exatos, datas, URLs, entidades nomeadas, valores monetários. "
        "Remova: boilerplate, repetições, texto de navegação, disclaimers."
    ),
)

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tools=[DuckDuckGoTools()],
    compression_manager=compression_manager,
    monitoring=True,
)
```

## Hooks — Callbacks Pre/Post Run

```python
from agno.agent import Agent
from agno.run import RunContext

def antes_do_run(run_context: RunContext):
    """Executado antes de cada run."""
    print(f"[PRE-RUN] User: {run_context.user_id}, Session: {run_context.session_id}")

def apos_o_run(run_context: RunContext, output):
    """Executado após cada run."""
    print(f"[POST-RUN] Tokens: {output.metrics.total_tokens}")
    # Salvar métricas, notificar Slack, etc.

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    pre_run_hooks=[antes_do_run],
    post_run_hooks=[apos_o_run],
)
```

## Checklist de Produção

- [ ] `debug_mode=False` em produção
- [ ] `monitoring=True` para traces no AgentOS
- [ ] `session_id` fixo por conversa para continuidade
- [ ] `user_id` fixo por usuário para isolamento de memória
- [ ] Database PostgreSQL (não SQLite) em produção
- [ ] Variáveis de ambiente para todas as API keys
- [ ] Guardrails de input/output configurados
- [ ] Tratamento de erro em todas as tools (`return {"status": "error", ...}`)
- [ ] Docstrings completas em todas as tools (o modelo depende delas)
- [ ] Evals automatizados no CI/CD
- [ ] Timeout configurado no modelo (`Claude(id="...", request_timeout=30)`)
