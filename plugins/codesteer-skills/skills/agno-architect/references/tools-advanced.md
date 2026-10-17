# Tools Avançadas — Referência

> Documentação oficial: https://docs.agno.com/tools/overview

## Acessando estado da sessão dentro de tools

```python
from agno.run import RunContext

def adicionar_item_carrinho(run_context: RunContext, produto: str, quantidade: int) -> str:
    """Adiciona item ao carrinho de compras.

    Args:
        run_context: Contexto do run (injetado automaticamente pelo Agno).
        produto (str): Nome do produto.
        quantidade (int): Quantidade a adicionar.
    """
    if not run_context.session_state:
        run_context.session_state = {"carrinho": []}

    run_context.session_state["carrinho"].append(
        {"produto": produto, "quantidade": quantidade}
    )
    return f"✓ {quantidade}x {produto} adicionado. Carrinho: {run_context.session_state['carrinho']}"

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tools=[adicionar_item_carrinho],
    session_state={"carrinho": []},
    instructions="Carrinho atual: {carrinho}",  # Template de session_state
    db=SqliteDb(db_file="agno.db"),
)
```

## Callable Factory de Tools (dinâmico por usuário/role)

```python
from agno.run import RunContext

def tools_por_role(run_context: RunContext):
    """Retorna ferramentas diferentes baseado no role do usuário."""
    role = (run_context.session_state or {}).get("role", "viewer")

    base = [buscar_cotacao]
    if role == "admin":
        base.append(ferramenta_admin)
    if role in ("admin", "analyst"):
        base.append(relatorio_avancado)
    return base

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tools=tools_por_role,  # Callable, não lista estática
)
```
