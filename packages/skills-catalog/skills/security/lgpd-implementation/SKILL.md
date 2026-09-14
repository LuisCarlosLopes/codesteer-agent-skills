---
name: lgpd-implementation
description: >
  Implement, review or audit LGPD compliance across digital products, data flows and software
  operations. Use when the user mentions LGPD, privacidade, dados pessoais, consentimento, base
  legal, direitos do titular, cookies, retenção, exclusão, ANPD, RIPD, incidente de dados,
  transferência internacional, decisão automatizada, encarregado/DPO, art. 20, art. 23, art. 37,
  art. 38, or wants the vulnerable points, missing controls and unimplemented parts exposed in
  frontend, backend, database, integrations and operational processes. Do NOT use for formal
  legal opinions, for GDPR-only scope, or for security reviews unrelated to personal data.
metadata:
  version: 0.0.1
  author: "@codesteer"
  license: Apache-2.0
compatibility:
  min_agent_tier: 1
  requires_terminal: true
sandbox:
  network: false
  allow_exec: false
---

# Revisao e Implementacao de LGPD

Use esta skill para transformar um pedido vago de "adequar a LGPD" em
diagnostico com evidencia, plano de remediacao e, quando pedido, mudancas
concretas no produto ou nos artefatos do projeto.

## Objetivo

Produzir uma avaliacao tecnica de aderencia a LGPD que:

- diferencie o que esta implementado, parcial, ausente ou vulneravel
- amarre cada conclusao a evidencias reais do repositorio ou dos documentos
- priorize risco para titulares, negocio e operacao
- cubra tanto os controles tecnicos quanto os requisitos normativos visiveis
- proponha a menor mudanca efetiva para fechar cada lacuna

## Use quando

- o usuario pedir implementacao de LGPD, privacy by design ou privacy by default
- o usuario quiser revisar se um projeto esta aderente a LGPD
- houver pedido para encontrar lacunas, riscos, vulnerabilidades ou itens nao implementados
- o escopo envolver consentimento, cookies, analytics, perfis de usuario, exportacao/exclusao de dados, logs, terceiros, retencao, base legal, RIPD ou resposta a incidentes
- o usuario quiser cobertura mais exaustiva por artigo, capitulo ou obrigacao da lei
- houver tratamento por ente publico ou uso de decisao automatizada/perfilizacao

## Nao use para

- afirmar conformidade juridica final sem evidencia tecnica suficiente
- substituir parecer juridico, DPO ou avaliacao regulatoria formal
- tratar "tem politica de privacidade" como prova de adequacao real

## Modos de trabalho

### 1. Modo Auditoria

Use quando o usuario quer validar o estado atual, apontar vulnerabilidades ou
descobrir o que falta.

Entregue:

- achados priorizados
- evidencias concretas
- classificacao por severidade e status
- plano de remediacao por dominio

### 2. Modo Implementacao

Use quando o usuario quer sair do diagnostico para uma mudanca concreta.

Entregue:

- sequencia de implementacao por risco e dependencia
- mudancas em codigo, schema, endpoints, telas ou artefatos operacionais
- criterios objetivos para validar que a lacuna foi fechada

### 3. Modo Cobertura Normativa

Use quando o usuario quer saber se o projeto cobre "todos os itens" da LGPD,
ou quando o pedido exigir uma leitura mais sistematica da lei e das normas
complementares.

Entregue:

- mapa de cobertura por bloco normativo
- itens aplicaveis, nao aplicaveis e pendentes
- lacunas juridico-operacionais que nao aparecem so olhando o codigo

## Protocolo

1. Delimite o escopo real.
   Identifique produto, tipos de dados, perfis de titular, dados sensiveis,
   criancas/adolescentes, terceiros, jurisdicoes, canal de coleta e partes do
   sistema no escopo.
2. Determine o regime de aplicacao.
   Verifique se ha tratamento no setor privado, poder publico, relacao de
   consumo, internet, saude, educacao, credito ou outro contexto regulado.
   Verifique tambem se existem excecoes, limitacoes de aplicabilidade ou
   obrigacoes setoriais correlatas.
3. Inspecione a realidade antes de concluir.
   Leia codigo, migrations, schemas, APIs, jobs, dashboards, templates de e-mail,
   configuracoes de analytics, telas de cadastro, logs, contratos e politicas.
   Nao declare nada como implementado sem evidencia.
4. Classifique o pedido.
   Escolha entre auditoria, implementacao, cobertura normativa ou diagnostico seguido de
   implementacao.
5. Aplique o framework de controles.
   Leia `references/lgpd-control-framework.md` e passe por cada dominio
   relevante sem assumir que um unico controle resolve todos os outros.
6. Aplique a matriz normativa.
   Leia `references/lgpd-coverage-matrix.md` para nao deixar de fora temas como
   escopo de aplicacao, poder publico, decisao automatizada, registro de
   operacoes, sancoes e regulamentos complementares.
7. Monte a matriz de evidencias.
   Para cada dominio, marque:
   - `Implementado`
   - `Parcial`
   - `Ausente`
   - `Vulneravel`
   - `Nao aplicavel` com justificativa
8. Priorize por risco.
   Eleve para topo o que:
   - expoe dados pessoais sem base clara
   - coleta alem do necessario
   - impede exercicio de direitos do titular
   - vaza PII em logs, integracoes ou analytics
   - nao possui controle de retencao, exclusao ou revogacao
   - trata dados sensiveis ou de menores sem trilha reforcada
   - automatiza decisao relevante sem transparencia ou revisao humana
   - opera no poder publico sem os artefatos e fundamentos especificos
   - sofre risco sancionatorio relevante por ausencia de governanca minima
9. Feche com remediacao acionavel.
   Cada gap precisa sair com proxima acao, dono provavel, impacto e evidencia
   minima para considerar o item resolvido.

## Dominios obrigatorios de verificacao

Considere estes dominios, salvo justificativa objetiva para exclusao:

1. Escopo de aplicacao, excecoes e contexto regulatorio
2. Inventario de dados e mapa de tratamento
3. Finalidade, necessidade, transparencia e base legal por fluxo
4. Consentimento, preferencia e revogacao
5. Direitos do titular: confirmacao, acesso, correcao, portabilidade, exclusao, oposicao e revisao
6. Decisao automatizada, perfilizacao e explicabilidade operacional
7. Retencao, descarte, anonimizacao e backups
8. Seguranca, acesso minimo, segregacao e logs
9. Dados sensiveis, biometria, saude, criancas e adolescentes
10. Controlador, operador, suboperador, encarregado e governanca
11. Registro de operacoes, RIPD, politicas, treinamento e evidencias
12. Terceiros, operadores, subprocessadores e transferencias internacionais
13. Incidentes, notificacao, auditoria e rastreabilidade
14. Poder publico, quando aplicavel
15. Exposicao sancionatoria e fragilidade regulatoria

## Cobertura normativa minima

Mesmo quando o usuario pedir algo estreito como "ajuste o banner de cookies",
nao perca de vista estes blocos:

1. Fundamentos, principios e definicoes operacionais da LGPD
2. Hipoteses de aplicacao e possiveis excecoes do tratamento
3. Regras para tratamento de dados pessoais e dados sensiveis
4. Requisitos especificos para criancas e adolescentes
5. Direitos dos titulares e capacidade real de atende-los
6. Controlador, operador, encarregado e cadeia de responsabilidades
7. Registro das operacoes e RIPD
8. Seguranca e incidente de dados pessoais
9. Transferencia internacional
10. Poder publico, se o caso envolver ente publico ou dados sob esse regime
11. Decisoes automatizadas e possibilidade de revisao
12. Programa de governanca e exposicao a sancoes

## Heuristicas de deteccao

Procure sinais que costumam indicar falso senso de conformidade:

- banner de cookies sem botao claro de recusa
- consentimento misturado com termos contratuais obrigatorios
- analytics, pixels ou CRM ativos antes da escolha do usuario
- endpoint de exclusao que apenas desativa conta, sem politica de retencao
- exportacao de dados inexistente ou manual demais para operar com prazo
- PII em logs de aplicacao, observabilidade ou fila
- coleta de CPF, telefone, data de nascimento ou geolocalizacao sem justificativa clara
- ausencia de trilha de auditoria para consentimento e revogacao
- dados sensiveis no mesmo fluxo de dados comuns sem tratamento reforcado
- terceiros processando dados fora do Brasil sem mapeamento contratual
- uso de legitimo interesse como rotulo generico sem teste documentado
- perfilizacao ou score automatizado sem transparencia minima
- fluxo de orgao publico avaliado como se fosse mero SaaS privado
- ausencia de inventario de operadores, SCCs ou base de transferencia internacional
- impossibilidade de provar quem decidiu, acessou, exportou ou excluiu dados

## Quando implementar mudancas

Ao editar o projeto:

1. Relacione cada mudanca a um risco ou requisito de privacidade.
2. Prefira controles verificaveis:
   - preference center
   - trilha de consentimento
   - exportacao de dados
   - workflow de exclusao
   - retencao automatizada
   - mascaramento de logs
   - segregacao de acesso
3. Nao esconda lacunas processuais com patch de codigo.
   Se faltar contrato com operador, RIPD, politica ou definicao de base legal,
   diga explicitamente.
4. Se o pedido exigir decisao juridica, separe:
   - o que e requisito legal expresso
   - o que e recomendacao conservadora de engenharia
   - o que depende de validacao com juridico ou encarregado
5. Se o sistema usar ML, score, antifraude, ranking, recomendacao ou bloqueio
   automatico com efeito relevante para o titular, avalie explicitamente o
   tema de decisao automatizada e revisao.
6. Se o caso envolver ente publico, nao reutilize checklist simplificado do
   setor privado; trate as regras especificas como bloco proprio.

## Formato de saida

Use esta estrutura por padrao:

```markdown
# Diagnostico LGPD
## Escopo avaliado
## Resumo executivo
## Achados prioritarios
| Severidade | Status | Dominio | Evidencia | Risco | Proxima acao |
## Mapa de cobertura normativa
## Lacunas por dominio
## Plano de remediacao
## Evidencias ausentes ou limitacoes
## Dependencias de juridico, DPO ou operacao
```

Se o pedido for implementacao, adicione:

```markdown
## Mudancas propostas
## Ordem de implementacao
## Como validar a correcao
```

## Guardrails

- Nao use linguagem de certificacao final como "100% aderente" ou "em conformidade" sem ressalvas.
- Nao marque `Implementado` quando existir apenas intencao documental.
- Nao misture ausencia de prova com prova de ausencia; explicite a limitacao.
- Nao reduza LGPD a consentimento e cookie banner.
- Nao deixe de apontar risco operacional so porque a mitigacao depende de processo e nao de codigo.
- Nao omita arquivos, tabelas, endpoints, jobs, provedores ou telas relevantes quando eles estiverem acessiveis.
- Nao trate checklist de produto privado como suficiente para poder publico.
- Nao ignore art. 20 so porque nao existe modelo de IA no nome do projeto; score, recomendacao, bloqueio e perfilizacao tambem importam.
- Nao declarar "nao aplicavel" sem justificar por fato observavel do caso.

## Referencia

Antes de fechar o diagnostico, consulte
`references/lgpd-control-framework.md`,
`references/lgpd-coverage-matrix.md` e
`references/lgpd-regulatory-checkpoints.md`.
