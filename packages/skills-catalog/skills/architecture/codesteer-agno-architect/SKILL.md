---
name: codesteer-agno-architect
description: >
  Agno (Python) multi-agent architecture: Agents, Teams, Workflows, Tools, Knowledge/RAG,
  Memory, Sessions, Reasoning and production patterns. Use when the user wants to create,
  structure, debug or optimize anything built on the Agno framework — including prompts like
  "cria um agente", "monta um time de agentes", "como faço RAG com Agno", "persistência de
  sessão", "workflow determinístico", "agno team modes", "handoff entre agentes" — or when any
  Python code in the conversation imports `from agno.`. Do NOT use for other agent frameworks
  (LangChain, CrewAI, LlamaIndex), for generic Python refactoring, or for frontend work.
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
user-invocable: true
---

# Agno Architect Skill

Você é o **Arquiteto de Sistemas Cognitivos** operando com maestria no framework **Agno** (anteriormente Phidata).
Este skill governa como você projeta, implementa e revisa sistemas multi-agentes em produção com Agno.

> **Documentação oficial:** https://docs.agno.com/sdk/introduction
> **Índice completo de docs:** https://docs.agno.com/llms.txt
> **Referência da API:** https://docs.agno.com/reference/agents/agent

---

## 🏗️ Os Três Primitivos do Agno

Agno expõe três e apenas três primitivos de orquestração. Toda decisão arquitetural começa aqui:

| Primitivo  | Quando usar                                                                 | Classe Python        |
|------------|-----------------------------------------------------------------------------|----------------------|
| **Agent**  | Programa autônomo com modelo, ferramentas e instruções                      | `agno.agent.Agent`   |
| **Team**   | Múltiplos agentes colaborando em tarefas complexas                          | `agno.team.Team`     |
| **Workflow**| Execução determinística, passo-a-passo, com controle explícito de fluxo   | `agno.workflow.Workflow` |

**Regra de ouro:** Comece com um Agent. Adicione um Team quando o contexto estourar ou quando a especialização exigir. Use Workflow quando determinismo e auditoria forem obrigatórios.

---

## 🤖 Agents — Construção e Execução

### Estrutura básica de um Agent

```python
from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.tools.hackernews import HackerNewsTools

agent = Agent(
    name="Research Agent",
    model=Claude(id="claude-sonnet-4-5"),
    tools=[HackerNewsTools()],
    instructions="Escreva relatórios detalhados com fontes citadas.",
    markdown=True,
    debug_mode=True,  # Sempre em desenvolvimento
)

# Dev: imprime formatado no terminal
agent.print_response("Startups de IA mais promissoras de 2025", stream=True)

# Produção: use run() ou arun()
from agno.agent import RunEvent
stream = agent.run("Startups de IA mais promissoras de 2025", stream=True)
for chunk in stream:
    if chunk.event == RunEvent.run_content:
        print(chunk.content, end="", flush=True)
```

### Parâmetros críticos do Agent

```python
agent = Agent(
    # Identidade
    name="Nome do Agente",
    agent_id="uuid-fixo-para-persistência",  # Se omitido, gera UUID

    # Modelo
    model=Claude(id="claude-sonnet-4-5"),
    reasoning_model=Groq(id="deepseek-r1-distill-llama-70b"),  # Modelo separado para reasoning

    # Ferramentas e conhecimento
    tools=[MinhaFerramenta(), outra_funcao],
    knowledge=AgnoKnowledge(...),  # RAG

    # Instruções (aceita str, List[str] ou Callable)
    instructions="Seja direto e preciso.",
    # instructions=["Regra 1", "Regra 2"],
    # instructions=lambda run_context: f"User: {run_context.user_id}",

    # Comportamento
    markdown=True,
    show_tool_calls=True,
    debug_mode=False,

    # Memória e persistência
    db=SqliteDb(db_file="agno.db"),
    update_memory_on_run=True,   # Memória automática
    # enable_agentic_memory=True, # Memória agêntica (mútuo exclusivo com update_memory_on_run)

    # Sessão e estado
    session_id="session-uuid",
    session_state={"chave": "valor_inicial"},

    # Output estruturado
    response_model=MinhaClasse,   # Pydantic model para output tipado

    # Reasoning
    reasoning=True,  # Liga ReasoningAgent com o mesmo modelo
)
```

### Output estruturado (Pydantic)

```python
from pydantic import BaseModel
from typing import List

class RelatorioMercado(BaseModel):
    empresa: str
    score_risco: float
    recomendacoes: List[str]
    resumo_executivo: str

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    response_model=RelatorioMercado,
)

# Retorna instância tipada de RelatorioMercado
resultado: RelatorioMercado = agent.run("Analise a NVIDIA", stream=False).content
```

---

## 👥 Teams — Orquestração Multi-Agente

### Team Modes (v2.0 — prefira sempre `mode=`)

```python
from agno.team import Team, TeamMode

# COORDINATE (padrão): Líder delega, consolida e responde
team = Team(members=[agente_a, agente_b], mode=TeamMode.coordinate)

# ROUTE: Líder roteia para O MELHOR membro e esse responde diretamente
team = Team(members=[agente_a, agente_b], mode=TeamMode.route)

# BROADCAST: Líder delega para TODOS os membros simultaneamente
team = Team(members=[agente_a, agente_b], mode=TeamMode.broadcast)
```

### Exemplo completo: Time de Pesquisa

```python
from agno.agent import Agent
from agno.team import Team, TeamMode
from agno.models.openai import OpenAIChat
from agno.models.anthropic import Claude
from agno.tools.duckduckgo import DuckDuckGoTools

# Agentes especializados (modelo mais leve para tarefas simples)
coletor_web = Agent(
    name="Web Researcher",
    role="Busca e sintetiza informações da web",
    model=OpenAIChat(id="gpt-4o-mini"),  # Modelo leve para coleta
    tools=[DuckDuckGoTools()],
    instructions="Busque 3 fontes diferentes. Retorne dados estruturados.",
)

analista = Agent(
    name="Senior Analyst",
    role="Analisa dados e produz insights de negócio",
    model=Claude(id="claude-sonnet-4-5"),  # Modelo pesado para síntese
    instructions="Seja crítico. Identifique padrões ocultos. Questione premissas.",
)

redator = Agent(
    name="Technical Writer",
    role="Transforma análises em relatórios executivos claros",
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions="Linguagem clara, estrutura com headers, conclusão acionável.",
)

# Time com Supervisor
research_team = Team(
    name="Research Intelligence Team",
    members=[coletor_web, analista, redator],
    mode=TeamMode.coordinate,
    model=Claude(id="claude-sonnet-4-5"),  # Líder/Supervisor
    instructions="Coordene o time para produzir análises de alta qualidade.",
    markdown=True,
    show_tool_calls=True,
)

research_team.print_response("Analise o impacto da IA generativa no mercado financeiro", stream=True)
```

---

## ⚙️ Tools — Ferramentas Customizadas

### Tool básica (função Python)

```python
from agno.tools import tool

def buscar_cotacao(ticker: str) -> dict:
    """Busca a cotação atual de uma ação.

    Args:
        ticker (str): Símbolo da ação (ex: PETR4, VALE3).

    Returns:
        dict com preco, variacao e volume.
    """
    # Docstring é crítica: popula o JSON Schema enviado ao modelo
    # Retorne erros de forma estruturada para o agente poder tentar outra rota
    try:
        # ... lógica real ...
        return {"ticker": ticker, "preco": 32.50, "variacao": "+1.2%", "status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e), "ticker": ticker}
```

---

## 🧠 Memory — Memória Persistente

Memória automática, memória agêntica e recuperação manual: `references/memory.md`.

---

## 📚 Knowledge — RAG e Bases de Conhecimento

> **⚠️ Diretiva de referência:** Para qualquer pergunta sobre RAG avançado — múltiplas fontes, vector stores, embedders, chunking, hybrid search, filtros por metadados, callable factories de knowledge — **carregue `references/knowledge-and-rag.md` antes de responder**. A seção abaixo cobre apenas o setup básico.

### Setup rápido de RAG

```python
from agno.knowledge.url import UrlKnowledge
from agno.vectordb.pgvector import PgVector
from agno.embedder.openai import OpenAIEmbedder

knowledge = UrlKnowledge(
    urls=["https://docs.empresa.com/manual"],
    vector_db=PgVector(
        table_name="knowledge_empresa",
        db_url="postgresql://user:pass@localhost/db",
        embedder=OpenAIEmbedder(id="text-embedding-3-small"),
    ),
)

# Carrega e indexa (execute uma vez ou quando docs mudarem)
knowledge.load(recreate=False)

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    knowledge=knowledge,
    search_knowledge=True,  # Habilita RAG automático
    instructions="Use apenas informações da base de conhecimento.",
)
```

> Tópicos avançados (CombinedKnowledge, PdfKnowledge, SqlKnowledge, hybrid search, chunking estratégico, filtros por metadados, callable factory): consulte `references/knowledge-and-rag.md`.

---

## 🔄 Workflows — Controle Determinístico

### Workflow básico (sequencial)

```python
from agno.agent import Agent
from agno.workflow import Workflow
from agno.tools.hackernews import HackerNewsTools

pesquisador = Agent(
    name="Pesquisador",
    instructions="Colete dados e retorne informações estruturadas.",
    tools=[HackerNewsTools()],
)

redator = Agent(
    name="Redator",
    instructions="Escreva um artigo claro baseado nos dados de pesquisa.",
)

revisor = Agent(
    name="Revisor",
    instructions="Revise gramática, clareza e precisão técnica.",
)

pipeline_conteudo = Workflow(
    name="Pipeline de Conteúdo",
    steps=[pesquisador, redator, revisor],  # Execução sequencial
)

pipeline_conteudo.print_response("Escreva sobre os avanços em IA em 2025", stream=True)
```

### Steps de Workflow: o que pode ser um step

| Tipo        | Descrição                                    |
|-------------|----------------------------------------------|
| `Agent`     | Executor autônomo com ferramentas            |
| `Team`      | Sub-time coordenado                          |
| `function`  | Função Python pura para lógica customizada   |

---

## 💾 Database — Persistência de Sessões

### Backends suportados

```python
# SQLite (desenvolvimento / apps menores)
from agno.db.sqlite import SqliteDb
db = SqliteDb(db_file="agno.db")

# PostgreSQL (produção padrão)
from agno.db.postgres import PostgresDb
db = PostgresDb(db_url="postgresql://user:pass@host:5432/db")

# MongoDB
from agno.db.mongo import MongoDb
db = MongoDb(connection_string="mongodb://localhost:27017", database="agno")

# Redis
from agno.db.redis import RedisDb
db = RedisDb(host="localhost", port=6379)

# DynamoDB (AWS)
from agno.db.dynamodb import DynamoDb
db = DynamoDb(table_name="agno-sessions", region_name="us-east-1")
```

### Usando com Agent/Team/Workflow

```python
agent = Agent(
    db=db,
    session_id="session-uuid",  # Retoma sessão existente
)
# ou
workflow = Workflow(
    db=db,
    session_id="session-uuid",
)
```

---

## 🧩 Models — Agnosticismo de Providers

### Principais providers

```python
from agno.models.anthropic import Claude
from agno.models.openai import OpenAIChat, OpenAIResponses
from agno.models.google import Gemini
from agno.models.groq import Groq
from agno.models.ollama import Ollama  # Local/self-hosted

# Troca de modelo por complexidade da tarefa (padrão recomendado):
model_leve = OpenAIChat(id="gpt-4o-mini")      # Roteamento, coleta
model_pesado = Claude(id="claude-sonnet-4-5")  # Síntese, raciocínio
model_local = Ollama(id="llama3.2")             # Dados sensíveis / offline
```

### Reasoning Model separado

```python
agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),           # Modelo de resposta
    reasoning_model=Groq(id="deepseek-r1-distill-llama-70b"),  # Modelo de raciocínio
)
```

---

## 🔍 Reasoning — Três Abordagens

Reasoning Model nativo, ReasoningTools (scratchpad), ReasoningAgent e tabela de escolha: `references/reasoning.md`.

---

## 🛠️ Skills Agno — Pacotes de Expertise Reutilizáveis

Estrutura de um Skill, `SKILL.md`, regras de validação, loaders e Skills em Teams: `references/skills-packaging.md`.

---

## 💬 Chat History — Histórico de Conversas

Os três modos de acesso ao histórico, sessões, retomada, caching e isolamento por usuário × sessão: `references/sessions-and-history.md`.

---

## 🗜️ Context Compression — Compressão de Contexto `BETA`

Ativação, `CompressionManager`, modos de gatilho, token counting e quando comprimir: `references/context-compression.md`.

---

## 🏛️ Padrões Arquiteturais Recomendados

### Padrão 1: Supervisor + Especialistas

```
SupervisorAgent (modelo pesado, sem tools)
├── WebResearcher (modelo leve, DuckDuckGo + Scraper)
├── DataAnalyst (modelo médio, Python + SQL tools)
└── ReportWriter (modelo leve, markdown tools)
```

### Padrão 2: Pipeline Determinístico (Workflow)

```
Workflow
├── Step 1: Coleta (Agent com tools externas)
├── Step 2: Validação (função Python pura)
├── Step 3: Enriquecimento (Agent com RAG)
└── Step 4: Síntese (Agent com modelo pesado)
```

### Padrão 3: Reasoning + Response (dois modelos)

```python
agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),           # Resposta polida
    reasoning_model=Groq(id="deepseek-r1-..."),     # Raciocínio preciso
)
```

---

## 🚨 Anti-Padrões — O que NUNCA fazer

1. **Agente Deus:** Um agente com 10+ ferramentas → dividir em time especializado
2. **Docstring vazia em tools:** O modelo não saberá como usar a ferramenta
3. **update_memory_on_run + enable_agentic_memory juntos:** São mutuamente exclusivos
4. **Session sem `session_id` fixo:** Perde continuidade entre requests em produção
5. **Modelo pesado para roteamento:** Use modelos leves no supervisor router
6. **Tool sem tratamento de erro:** Retorne `{"status": "error", "message": "..."}` sempre
7. **Workflow sem steps tipados:** Sempre especifique o tipo de cada step
8. **Skill com classe Python:** Skills são pacotes de arquivos (SKILL.md), não classes. Use `LocalSkills`
9. **num_history_sessions alto:** Manter em 2-3 máx; valores altos esturam a janela de contexto
10. **cache_session=True em produção multi-worker:** Causa inconsistência entre instâncias
11. **Modelo pesado no CompressionManager:** Use `gpt-4o-mini` ou equivalente leve — o objetivo é custo baixo
12. **compress_tool_results em workflows curtos:** Overhead desnecessário em fluxos com ≤ 2 tool calls

---

## 📦 Setup e Instalação

```bash
pip install agno

# Providers de modelo
pip install agno[anthropic]
pip install agno[openai]
pip install agno[google-genai]

# Databases
pip install agno[postgres]
pip install agno[sqlite]

# Vector stores para RAG
pip install agno[pgvector]

# Ferramentas populares
pip install duckduckgo-search yfinance
```

### Variáveis de ambiente necessárias

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## 📖 Referências Detalhadas

Carregue sob demanda — o corpo acima cobre a decisão arquitetural; o detalhe vive em `references/`:

| Arquivo | Conteúdo |
| --- | --- |
| `references/memory.md` | Memória automática, agêntica e recuperação manual |
| `references/knowledge-and-rag.md` | RAG avançado, vector stores, embedders, hybrid search, chunking |
| `references/tools-advanced.md` | Estado de sessão dentro de tools, callable factories |
| `references/teams-advanced.md` | Team modes, callable factories, HITL, nested teams, memory compartilhada |
| `references/sessions-and-history.md` | Chat history, sessões, retomada, caching, isolamento por usuário |
| `references/context-compression.md` | CompressionManager, gatilhos, token counting |
| `references/reasoning.md` | Reasoning model, ReasoningTools, ReasoningAgent |
| `references/skills-packaging.md` | Autoria e carregamento de Skills Agno |
| `references/production-patterns.md` | Guardrails, tracing OTEL, evals, AgentOS, hooks |

**Documentação oficial completa:** https://docs.agno.com/llms.txt
