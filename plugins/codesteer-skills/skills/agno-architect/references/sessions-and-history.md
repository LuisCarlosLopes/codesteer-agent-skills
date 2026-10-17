# Sessions & Chat History — Referência

> Documentação oficial: https://docs.agno.com/sessions/overview | https://docs.agno.com/history/overview

> Docs: https://docs.agno.com/history/overview

Chat History permite que agentes, times e workflows mantenham **continuidade conversacional entre runs**. Requer database configurado.

> **Distinção crítica:** History ≠ Memory. History armazena as **mensagens trocadas** ("o que foi dito"). Memory armazena **fatos aprendidos** sobre o usuário ("Carlos prefere e-mail").

## Três modos de acesso ao histórico

```python
from agno.agent import Agent
from agno.db.sqlite import SqliteDb

db = SqliteDb(db_file="agno.db")

# MODO 1 — Histórico automático no contexto (mais simples, recomendado para chatbots)
# Injeta as últimas N runs automaticamente em cada request ao modelo
agent = Agent(
    db=db,
    add_history_to_context=True,
    num_history_runs=5,       # Últimas 5 interações (padrão: 3)
    num_history_messages=10,  # Controle granular por número de mensagens
)

# MODO 2 — Ferramenta de leitura (agente decide quando buscar)
# Provê get_chat_history() como tool; o agente usa quando achar necessário
agent = Agent(
    db=db,
    read_chat_history=True,       # Tool para ler qualquer msg do histórico
    read_tool_call_history=True,  # Tool para ler tool calls em ordem reversa
)

# MODO 3 — Busca multi-sessão (continuidade entre conversas distintas)
agent = Agent(
    db=db,
    search_session_history=True,
    num_history_sessions=2,  # ⚠️ Mantenha baixo (2-3 máx) — aumenta contexto e custo
)
```

## Guia de escolha

| Cenário                               | Modo recomendado                         |
|---------------------------------------|------------------------------------------|
| Chatbot / assistente conversacional   | `add_history_to_context=True`            |
| Agente que pesquisa o passado         | `read_chat_history=True`                 |
| Continuidade entre sessões distintas  | `search_session_history=True`            |
| Auditoria de tool calls anteriores    | `read_tool_call_history=True`            |

> **Performance:** Mais histórico = contexto maior = mais lento e caro. Comece com `num_history_runs=3`.

> Docs: https://docs.agno.com/sessions/overview

## Modelo mental: Session > Run > RunEvent

```
Session (session_id)          — thread completa de conversa (persiste no DB)
└── Run (run_id)              — uma interação única (1 request → 1 response)
    └── RunEvent              — eventos granulares dentro do run
```

Sem `session_id` explícito, Agno gera UUIDs automaticamente. Sem database, **não há persistência** entre processos.

## Criando e retomando sessões

```python
from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.anthropic import Claude

db = SqliteDb(db_file="agno.db")

# Sessão com ID fixo — pode ser retomada em qualquer run posterior
agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    db=db,
    user_id="user-123",         # Isola histórico e memória por pessoa
    session_id="sess-abc-456",  # ID fixo para retomar a conversa
    add_history_to_context=True,
    num_history_runs=5,
)

response = agent.run("Meu ticker favorito é PETR4")
print(f"Session: {response.session_id}")  # sess-abc-456
print(f"Run ID:  {response.run_id}")       # UUID gerado automaticamente

# Próximo run na MESMA sessão — histórico disponível automaticamente
agent.run("Me fale sobre o meu ticker favorito")  # Lembra: PETR4
```

## Nomeação de sessões

```python
# Nome manual
agent.set_session_name(session_id="sess-abc-456", session_name="Análise PETR4")
nome = agent.get_session_name(session_id="sess-abc-456")

# Nome gerado pelo modelo (1 API call extra — use após 2-3 mensagens)
session = agent.set_session_name(session_id="sess-abc-456", autogenerate=True)
# ex: retorna "Análise Petrobras Q2"
```

## Acessando mensagens da sessão

```python
# Todas as mensagens (inclui tool calls, system msgs)
session_obj = agent.get_session(session_id="sess-abc-456")
todas = session_obj.get_messages()

# Só user + assistant (para UI de chat)
historico = agent.get_chat_history("sess-abc-456")
```

## Session Caching — performance em multi-turn

```python
agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    db=db,
    session_id="sess-abc-456",
    cache_session=True,  # Evita round-trips ao DB em runs sequenciais
    # ⚠️ Apenas para dev/testing — não use em produção com múltiplos workers
)
```

> **Alternativa para produção multi-worker:** Não use `cache_session=True`. Em vez disso, otimize no nível do banco: use **PgBouncer** (connection pooling) na frente do PostgreSQL, ou configure `pool_size` e `max_overflow` no `PostgresDb`. O ganho de latência vem do pooling de conexões, não do cache em memória do agente.
>
> ```python
> # Produção: pooling no banco, não cache no agente
> db = PostgresDb(
>     db_url="postgresql://user:pass@pgbouncer-host:5432/prod_db",
>     # pool_size=10, max_overflow=20  # se configurável no seu driver
> )
> ```

## Padrão produção: isolamento total por usuário × sessão

```python
from agno.db.postgres import PostgresDb

db = PostgresDb(db_url="postgresql://user:pass@host:5432/prod_db")

def get_agent(user_id: str, session_id: str) -> Agent:
    """
    Factory de agente — um por request.
    user_id    → isola memória e histórico por pessoa
    session_id → isola conversas por thread (ex: abas do chat)
    """
    return Agent(
        model=Claude(id="claude-sonnet-4-5"),
        db=db,
        user_id=user_id,
        session_id=session_id,
        add_history_to_context=True,
        num_history_runs=5,
        update_memory_on_run=True,
    )

# Em um endpoint FastAPI:
# agent = get_agent(request.user_id, request.session_id)
# response = await agent.arun(request.message)
```
