# Memory — Referência

> Documentação oficial: https://docs.agno.com/memory/overview

## Memória Automática (recomendada para a maioria dos casos)

```python
from agno.agent import Agent
from agno.db.sqlite import SqliteDb

db = SqliteDb(db_file="agno.db")

agent = Agent(
    db=db,
    update_memory_on_run=True,  # Extrai e persiste automaticamente
    user_id="user-123",         # Isola memórias por usuário
)

agent.print_response("Meu nome é Carlos e prefiro reuniões às terças.")
agent.print_response("Qual o melhor dia para marcarmos?")  # Usa a memória automaticamente
```

## Memória Agêntica (agente controla)

```python
agent = Agent(
    db=db,
    enable_agentic_memory=True,  # Agente decide o que memorizar
    # NÃO combine com update_memory_on_run=True
)
```

## Recuperação manual de memórias

```python
memorias = agent.get_user_memories(user_id="user-123")
for m in memorias:
    print(f"[{m.topics}] {m.memory}")
```

> **Tabela padrão:** `agno_memories` — customizável via `db = PostgresDb(..., memory_table="minha_tabela")`
