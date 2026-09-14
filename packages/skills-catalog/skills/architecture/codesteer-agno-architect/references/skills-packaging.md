# Skills Agno — Referência

> Documentação oficial: https://docs.agno.com/skills/overview

> Docs: https://docs.agno.com/skills/overview

Skills em Agno são **pacotes de arquivos** (não classes Python) que estendem as capacidades de um agente com expertise de domínio. Baseadas na especificação de Agent Skills da Anthropic, permitem **descoberta progressiva**: o agente vê os resumos no system prompt e carrega instruções completas apenas quando relevante — economizando tokens.

## Estrutura de um Skill

```
minha-skill/
├── SKILL.md           # Obrigatório: instruções + metadados YAML
├── scripts/           # Opcional: scripts executáveis (com shebang)
│   └── helper.py
└── references/        # Opcional: docs de referência carregadas sob demanda
    └── guia.md
```

## Criando um Skill — SKILL.md

```yaml
---
name: analise-mercado           # lowercase, hifens, máx 64 chars. Deve bater com o nome do diretório
description: >
  Analisa ativos financeiros usando indicadores técnicos e fundamentalistas.
  Use quando o usuário pedir análise de ações, FIIs ou criptoativos.
license: MIT
metadata:
  version: "1.0.0"
  author: seu-nome
  tags: ["finance", "analysis"]
---

# Skill: Análise de Mercado

## Quando usar
- Usuário pede análise de ações, FIIs ou criptoativos
- Usuário quer entender indicadores técnicos (RSI, MACD, Bollinger)

## Processo
1. Execute `scripts/fetch_data.py` via get_skill_script para coletar dados
2. Aplique indicadores sobre os dados coletados
3. Consulte `references/indicadores.md` para a definição de cada indicador
4. Produza relatório com recomendação clara

## Referências disponíveis
- `references/indicadores.md` — guia completo de indicadores técnicos
```

## Regras de validação de Skills

| Campo         | Regra                                               |
|---------------|-----------------------------------------------------|
| `name`        | Máx 64 chars, `[a-z0-9-]`, sem `--`, sem hífen inicial/final |
| `description` | Máx 1024 chars — é o que o agente vê no system prompt |
| `name`        | Deve ser idêntico ao nome do diretório              |

## Carregando Skills em Agentes

```python
from pathlib import Path
from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.skills import Skills, LocalSkills, SkillValidationError

skills_dir = Path(__file__).parent / "skills"

try:
    skills = Skills(loaders=[LocalSkills(str(skills_dir))])
except SkillValidationError as e:
    print(f"Skill inválida: {e.errors}")

# O agente ganha automaticamente 3 ferramentas de descoberta:
# - get_skill_instructions(skill_name)        → carrega SKILL.md completo
# - get_skill_reference(skill_name, path)     → carrega arquivo de referência
# - get_skill_script(skill_name, path, ...)   → lê ou executa um script
agent = Agent(
    name="Analista Financeiro",
    model=Claude(id="claude-sonnet-4-5"),
    skills=skills,
    instructions=[
        "Você tem acesso a skills especializadas.",
        "Use get_skill_instructions para carregar orientações completas quando necessário.",
    ],
    markdown=True,
)

agent.print_response("Analise o ativo PETR4")
```

## Múltiplos loaders e recarregamento

```python
# Combinando skills de múltiplas origens (última sobrescreve em conflito de nome)
skills = Skills(loaders=[
    LocalSkills("/path/to/skills-compartilhadas"),
    LocalSkills("/path/to/skills-do-projeto"),
])

# Recarregar após alterações em disco (útil em dev)
skills.reload()
```

## Skills em Teams — expertise direto no líder

```python
from agno.team import Team

implementador = Agent(
    name="Implementador",
    role="Escreve código com base no feedback do review",
    model=Claude(id="claude-sonnet-4-5"),
)

# Skills no Team: o líder usa expertise para coordenar, delega execução ao membro
review_team = Team(
    name="Code Review Team",
    model=Claude(id="claude-sonnet-4-5"),
    members=[implementador],
    skills=skills,
    instructions=[
        "Use suas skills para revisar o código.",
        "Delegue implementação das melhorias ao Implementador.",
    ],
    show_members_responses=True,
)
```

## Quando usar Skills no Team vs. no Agent membro

| Nível               | Quando usar                                                      |
|---------------------|------------------------------------------------------------------|
| `Team(skills=...)`  | Líder precisa de expertise para coordenar (padrões de review, regras de roteamento) |
| `Agent(skills=...)` | Agente especialista precisa da expertise para executar seu próprio trabalho |
| Ambos               | Líder coordena com contexto; membros executam com orientação     |
