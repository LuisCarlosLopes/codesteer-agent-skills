# Perfis de experts — catálogo estendido

Lentes cognitivas para compor o painel. Cada perfil tem: o que enxerga primeiro,
perguntas típicas e armadilhas da própria lente. Use para sugerir perfis na
Etapa 3 e para manter a voz de cada expert distinta na Etapa 4.

## Arquiteto de Soluções

- **Enxerga primeiro:** fronteiras de domínio, acoplamento, alinhamento com
  objetivos de negócio, evolução em 2-3 anos.
- **Perguntas típicas:** quais são os bounded contexts? O que muda com 10x de
  carga? Onde está o lock-in?
- **Armadilha:** over-engineering; propor plataforma quando um módulo resolve.

## Engenheiro de DevOps / SRE

- **Enxerga primeiro:** pipeline de entrega, infraestrutura como código,
  observabilidade (logs, métricas, traces), SLOs, rollback.
- **Perguntas típicas:** como isso é deployado e revertido? Quem acorda às 3h?
  Qual o custo mensal de infra?
- **Armadilha:** otimizar operação e ignorar velocidade de produto.

## Desenvolvedor Full-Stack

- **Enxerga primeiro:** esforço real de implementação, DX, UX, contratos de API,
  testabilidade.
- **Perguntas típicas:** quantos sprints? Que parte dá para reaproveitar? Como o
  front consome isso?
- **Armadilha:** pragmatismo que vira dívida técnica não declarada.

## Especialista em Cibersegurança

- **Enxerga primeiro:** superfície de ataque, autenticação/autorização, dados
  sensíveis, compliance (LGPD, PCI, SOC 2), supply chain.
- **Perguntas típicas:** quem acessa o quê? Onde o segredo vive? Qual o modelo
  de ameaças?
- **Armadilha:** controles que travam o time sem reduzir risco real.

## Engenheiro de Dados

- **Enxerga primeiro:** fluxo de dados ponta a ponta, schema evolution,
  idempotência, qualidade e lineage, custo de processamento.
- **Perguntas típicas:** batch ou streaming? Quem é dono do dado? Como reprocessa?
- **Armadilha:** pipeline elegante que o produto não precisa ainda.

## Especialista em Banco de Dados

- **Enxerga primeiro:** modelagem, índices, padrões de acesso, consistência vs.
  disponibilidade, estratégia de cache, tuning.
- **Perguntas típicas:** qual a razão leitura/escrita? Qual query domina? Qual o
  tamanho em 12 meses?
- **Armadilha:** resolver no banco o que é problema de domínio.

## Perfis adicionais

| Perfil | Lente | Quando sugerir |
| --- | --- | --- |
| Engenheiro Mobile | offline-first, bateria, versões de SO, app review | app nativo ou híbrido no escopo |
| Especialista em Performance | latência p99, profiling, caching, hot paths | problema é lentidão ou custo de compute |
| Engenheiro de Plataforma | golden paths, self-service, multi-tenancy interna | muitos times consumindo a solução |
| Especialista em IA/LLM | prompts, RAG, avaliação, custo por token, guardrails | solução envolve modelos de linguagem |
| Engenheiro de QA / Testes | estratégia de testes, contratos, ambientes, flakiness | risco de regressão alto |
| Product Engineer / PO técnico | valor, escopo mínimo, métricas de sucesso | prazo apertado ou escopo inflado |
| Especialista em Mensageria (Kafka, RabbitMQ, SQS) | ordering, entrega, DLQ, backpressure | arquitetura orientada a eventos |
| Especialista em Cloud (AWS/GCP/Azure) | serviços gerenciados, custo, limites, regiões | decisão entre gerenciado e self-hosted |

## Como manter vozes distintas

- Cada expert abre com a sua pergunta típica aplicada ao problema.
- Se dois experts chegam à mesma solução, a justificativa deve vir de lentes
  diferentes (ex.: DevOps por operabilidade, DBA por padrão de acesso).
- Um expert pode discordar de premissa de outro — registre isso para o debate.
