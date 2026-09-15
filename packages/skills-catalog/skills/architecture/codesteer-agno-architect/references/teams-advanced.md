# Teams Avançados — Referência

> Documentação oficial: https://docs.agno.com/teams/overview

## TeamMode — Estilos de Orquestração

### Coordinate (padrão — mais flexível)
O líder analisa a tarefa, delega para os membros relevantes, consolida as respostas e produz uma resposta final unificada.

```python
team = Team(
    members=[pesquisador, analista, redator],
    mode=TeamMode.coordinate,
    model=Claude(id="claude-sonnet-4-5"),  # Líder/Supervisor
)
```

### Route (roteamento semântico)
O líder analisa a tarefa e a roteia para O MELHOR membro. Esse membro responde diretamente, sem consolidação.

```python
team = Team(
    members=[
        Agent(name="Python Expert", role="Responde dúvidas de Python"),
        Agent(name="JS Expert", role="Responde dúvidas de JavaScript"),
        Agent(name="DevOps Expert", role="Responde dúvidas de infraestrutura"),
    ],
    mode=TeamMode.route,
)
```

### Broadcast (todos respondem)
O líder delega a tarefa para TODOS os membros simultaneamente. Útil para comparar perspectivas ou gerar variações.

```python
team = Team(
    members=[agente_otimista, agente_pessimista, agente_neutro],
    mode=TeamMode.broadcast,
)
```

## Callable Factories em Teams

```python
from agno.run import RunContext

def membros_por_contexto(run_context: RunContext):
    """Seleciona membros do time baseado no contexto da request."""
    categoria = (run_context.session_state or {}).get("categoria", "geral")

    membros_base = [agente_coordenador]
    if categoria == "financeiro":
        membros_base.append(agente_financeiro)
    elif categoria == "juridico":
        membros_base.append(agente_juridico)
    membros_base.append(agente_redator)
    return membros_base

team = Team(
    members=membros_por_contexto,  # Callable factory
    mode=TeamMode.coordinate,
)
```

## Human-in-the-Loop (HITL)

```python
from agno.agent import Agent
from agno.tools import tool
from agno.tools.human import HumanInputTool

# Ferramenta que pausa o run para aprovação humana
agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tools=[HumanInputTool()],
    instructions="Solicite aprovação antes de executar ações irreversíveis.",
)

# Time com HITL
team = Team(
    members=[agente_planner, agente_executor],
    mode=TeamMode.coordinate,
    # Integre com AgentOS para HITL visual: https://docs.agno.com/hitl/overview
)
```

## Compartilhamento de Contexto entre Membros

O Agno passa automaticamente o output de cada membro para o contexto do próximo (em modo coordinate). Para controle explícito:

```python
from agno.team import Team, TeamMode

team = Team(
    members=[pesquisador, analista],
    mode=TeamMode.coordinate,
    # O output do pesquisador é passado ao analista automaticamente
    share_member_interactions=True,  # Membros veem as interações uns dos outros
)
```

## Memory Compartilhada em Teams

```python
from agno.db.postgres import PostgresDb

db = PostgresDb(db_url="postgresql://...")

team = Team(
    members=[agente_a, agente_b],
    db=db,
    update_memory_on_run=True,  # Memória compartilhada entre todos do time
    user_id="user-123",
)
```

## Debug e Observabilidade

```python
team = Team(
    members=[...],
    debug_mode=True,           # Log detalhado de cada delegação
    show_tool_calls=True,      # Exibe tool calls de cada membro
    monitoring=True,           # Envia traces para AgentOS
)

# Acessar o último run para auditoria
run = team.run("Minha tarefa", stream=False)
print(run.messages)        # Todas as mensagens trocadas
print(run.metrics)         # Tokens, latência, custo
```

## Padrão: Time com Skills Segregadas

```python
# Cada agente tem exatamente 1 responsabilidade (Lei da Modularidade Cognitiva)

coletor = Agent(
    name="Data Collector",
    role="Coleta dados brutos de múltiplas fontes",
    model=OpenAIChat(id="gpt-4o-mini"),       # Modelo leve
    tools=[DuckDuckGoTools(), YFinanceTools()],
)

validador = Agent(
    name="Data Validator",
    role="Valida, limpa e estrutura os dados coletados",
    model=OpenAIChat(id="gpt-4o-mini"),       # Modelo leve
    tools=[PythonTools()],                     # Executa código de validação
)

analista = Agent(
    name="Senior Analyst",
    role="Analisa os dados e produz insights estratégicos",
    model=Claude(id="claude-sonnet-4-5"),      # Modelo pesado para raciocínio
    tools=[ReasoningTools(add_instructions=True)],
)

supervisor = Team(
    name="Intelligence Team",
    members=[coletor, validador, analista],
    mode=TeamMode.coordinate,
    model=Claude(id="claude-sonnet-4-5"),
    instructions=[
        "Coordene o time de forma eficiente.",
        "Reutilize outputs anteriores quando possível.",
        "Sinalize erros de qualquer membro imediatamente.",
    ],
)
```

## Times Aninhados (Nested Teams)

```python
team_germanico = Team(
    name="Germanic Team",
    role="Responde em alemão e holandês",
    members=[agente_alemao, agente_holandes],
    mode=TeamMode.route,
)

team_global = Team(
    members=[
        Agent(name="English Agent", role="Responde em inglês"),
        Agent(name="Portuguese Agent", role="Responde em português"),
        team_germanico,  # Sub-time como membro
    ],
    mode=TeamMode.route,
)
```
