# Knowledge & RAG — Referência Avançada

> Documentação oficial: https://docs.agno.com/knowledge/concepts/overview

## Conceito: Agentic RAG

No Agno, RAG não é um pipeline fixo — é uma capacidade agêntica. O agente decide **quando** buscar conhecimento com base no contexto da conversa. Isso é controlado pelo parâmetro `search_knowledge=True`.

## Fontes de Conhecimento Suportadas

```python
from agno.knowledge.url import UrlKnowledge          # URLs e sitemaps
from agno.knowledge.pdf import PdfKnowledge           # Arquivos PDF
from agno.knowledge.pdf_url import PdfUrlKnowledge    # PDFs via URL
from agno.knowledge.text import TextKnowledge         # Texto puro
from agno.knowledge.json import JsonKnowledge         # Arquivos JSON
from agno.knowledge.csv import CsvKnowledge           # Arquivos CSV
from agno.knowledge.docx import DocxKnowledge         # Word documents
from agno.knowledge.website import WebsiteKnowledge   # Websites completos
from agno.knowledge.combined import CombinedKnowledge # Múltiplas fontes
from agno.knowledge.sql import SqlKnowledge           # Bancos de dados SQL
```

## Vector Stores Suportados

```python
# PostgreSQL com pgvector (recomendado para produção)
from agno.vectordb.pgvector import PgVector
vector_db = PgVector(
    table_name="knowledge_base",
    db_url="postgresql://user:pass@localhost:5432/db",
    embedder=OpenAIEmbedder(id="text-embedding-3-small"),
)

# Qdrant
from agno.vectordb.qdrant import Qdrant
vector_db = Qdrant(collection="my_collection", url="http://localhost:6333")

# Pinecone
from agno.vectordb.pinecone import Pinecone
vector_db = Pinecone(index_name="my-index", api_key="...")

# ChromaDB (dev/local)
from agno.vectordb.chroma import ChromaDb
vector_db = ChromaDb(collection="dev_knowledge", path="./chroma_db")

# LanceDB (serverless)
from agno.vectordb.lancedb import LanceDb
vector_db = LanceDb(table_name="knowledge", uri="./lancedb")

# Weaviate
from agno.vectordb.weaviate import Weaviate
vector_db = Weaviate(collection="KnowledgeBase", url="http://localhost:8080")
```

## Embedders Disponíveis

```python
from agno.embedder.openai import OpenAIEmbedder
from agno.embedder.anthropic import AnthropicEmbedder
from agno.embedder.google import GeminiEmbedder
from agno.embedder.ollama import OllamaEmbedder  # Local/offline
from agno.embedder.cohere import CohereEmbedder
```

## Exemplos Completos

### RAG com múltiplas fontes (CombinedKnowledge)

```python
from agno.knowledge.combined import CombinedKnowledge
from agno.knowledge.pdf import PdfKnowledge
from agno.knowledge.url import UrlKnowledge
from agno.vectordb.pgvector import PgVector
from agno.embedder.openai import OpenAIEmbedder
from agno.agent import Agent
from agno.models.anthropic import Claude

embedder = OpenAIEmbedder(id="text-embedding-3-small")
vector_db = PgVector(
    table_name="empresa_knowledge",
    db_url="postgresql://user:pass@localhost:5432/db",
    embedder=embedder,
)

knowledge = CombinedKnowledge(
    sources=[
        PdfKnowledge(paths=["docs/manual.pdf", "docs/faq.pdf"], vector_db=vector_db),
        UrlKnowledge(urls=["https://empresa.com/docs"], vector_db=vector_db),
    ],
    vector_db=vector_db,
    num_documents=5,  # Documentos retornados por busca
)

# Indexação (execute uma vez ou ao atualizar docs)
knowledge.load(recreate=False)  # recreate=True para recriar o índice

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    knowledge=knowledge,
    search_knowledge=True,
    instructions=[
        "Use APENAS informações da base de conhecimento.",
        "Cite as fontes ao responder.",
        "Se não souber, diga explicitamente.",
    ],
)
```

### RAG com filtros por metadados

```python
from agno.vectordb.pgvector import PgVector

# Filtro por departamento durante a busca
agent.print_response(
    "Qual a política de férias?",
    knowledge_filters={"departamento": "RH", "versao": "2025"},
)
```

### Callable Factory para Knowledge (dinâmico por usuário)

```python
from agno.run import RunContext
from agno.knowledge.pdf import PdfKnowledge

def knowledge_para_usuario(run_context: RunContext):
    """Retorna base de conhecimento baseada no plano do usuário."""
    plano = (run_context.session_state or {}).get("plano", "basico")

    if plano == "enterprise":
        return PdfKnowledge(paths=["docs/enterprise/"], vector_db=vector_db_enterprise)
    return PdfKnowledge(paths=["docs/basico/"], vector_db=vector_db_basico)

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    knowledge=knowledge_para_usuario,  # Callable factory
    search_knowledge=True,
)
```

## Estratégias de Chunking

Por padrão, Agno usa chunking automático. Para controle fino:

```python
from agno.document.chunking.fixed import FixedSizeChunking
from agno.document.chunking.semantic import SemanticChunking
from agno.document.chunking.recursive import RecursiveChunking

knowledge = PdfKnowledge(
    paths=["doc.pdf"],
    vector_db=vector_db,
    chunking_strategy=RecursiveChunking(chunk_size=1000, chunk_overlap=200),
)
```

## Hybrid Search

```python
from agno.vectordb.pgvector import PgVector, SearchType

vector_db = PgVector(
    table_name="knowledge",
    db_url="...",
    embedder=embedder,
    search_type=SearchType.hybrid,  # Combina semântico + BM25
)
```
