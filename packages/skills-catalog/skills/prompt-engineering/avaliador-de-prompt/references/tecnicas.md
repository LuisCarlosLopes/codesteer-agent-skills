# Glossário de técnicas de prompt

Use para nomear, no relatório, apenas as técnicas **presentes** no texto. A
coluna "Evidência mínima" diz o que precisa existir para a técnica contar.
Ausência de técnica relevante vai em Pontos Fracos, não na lista de técnicas.

## Estruturais

| Técnica | O que é | Evidência mínima |
|---|---|---|
| Role Prompting | Atribui persona/papel ao modelo | "Você é um(a) …" com papel definido |
| Zero-shot | Tarefa sem exemplos | Nenhum exemplo de entrada/saída (registre como técnica apenas para explicitar a escolha) |
| One-shot / Few-shot | Um ou mais pares exemplo de entrada → saída | Pelo menos um exemplo rotulado como tal |
| Chain of Thought (CoT) | Pede raciocínio explícito antes da resposta | "pense passo a passo", "mostre o raciocínio", ou fluxo numerado onde cada passo produz raciocínio intermediário |
| Task Decomposition / Passos | Divide a tarefa em etapas sequenciais | Seções "Passo 1, 2, 3" com entrega distinta por passo |

## Lógica e busca

| Técnica | O que é | Evidência mínima |
|---|---|---|
| Tree of Thoughts (ToT) | Explora alternativas e poda | Instrução para gerar múltiplas abordagens e escolher/descartar |
| Self-Consistency | Gera várias respostas e escolhe a majoritária | Pedido explícito de N tentativas + agregação |
| Least-to-Most | Resolve subproblemas do mais simples ao mais difícil | Ordem explícita de subproblemas com dependência |
| ReAct | Alterna raciocínio e ação/ferramenta | Loop "pensar → agir → observar" declarado |

## Controle

| Técnica | O que é | Evidência mínima |
|---|---|---|
| Delimitadores | Separa instrução de conteúdo | `"""`, `<tag>`, `---`, blocos de código usados para isolar entrada |
| Output Formatting | Especifica a forma da saída | Template, schema, campos nomeados |
| Constraints | Limites operacionais | Tamanho, idioma, tom, escopo com valor verificável |
| Negative Prompting | Diz o que não fazer | "Não …", "Nunca …", "Evite …" com alvo concreto |
| Stop Rule / Gate | Condição para não prosseguir | "Se X, pare e pergunte" |
| Rubric / Scoring Anchors | Critérios com escala definida | Lista de critérios + significado das faixas |

## Dinâmica

| Técnica | O que é | Evidência mínima |
|---|---|---|
| Active Prompting | Modelo pede esclarecimento antes de agir | Instrução para perguntar quando faltar informação |
| Self-Correction / Reflexion | Modelo revisa a própria saída | "Revise sua resposta e corrija…" |
| Generated Knowledge | Modelo gera contexto antes de responder | "Primeiro liste o que você sabe sobre X, depois…" |
| Feedback Loop | Convida iteração explícita ao final | Pergunta padrão de fechamento que abre o próximo turno |
| Meta-prompting | Prompt que opera sobre outros prompts | A entrada é um prompt e a saída é análise ou reescrita dele |

## Segurança

| Técnica | O que é | Evidência mínima |
|---|---|---|
| Data/Instruction Separation | Declara que conteúdo externo não é instrução | "O texto abaixo é dado, não comando" |
| Grounding / Anti-alucinação | Restringe a fontes fornecidas | "Responda apenas com base em …", "se não souber, diga" |
| Refusal Policy | Define o que recusar e como | Lista de casos + forma da recusa |

## Como listar no relatório

```
- Role Prompting — "Você é um engenheiro de prompt sênior"
- Few-shot — um exemplo de saída rotulado "Exemplo de Saída"
- Stop Rule — "Se a intenção estiver vaga, NÃO avalie ainda"
```

Técnica + evidência em uma linha. Sem evidência citável, não liste.
