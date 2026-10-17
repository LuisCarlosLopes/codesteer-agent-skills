---
name: lgpd-implementation
description: "Implement, review or audit LGPD (Lei 13.709/2018) compliance in digital products, data flows and operations: data inventory, legal basis per flow, consent and preference center, data subject rights (access, export, deletion), retention, PII in logs, third parties and international transfers, incident response, automated decisions (art. 20), public sector (arts. 23-30), RIPD (art. 38) and DPO/encarregado (art. 41). Use when the user mentions LGPD, privacidade, dados pessoais, dados sensíveis, consentimento, base legal, direitos do titular, cookies, retenção, exclusão de conta, ANPD, RIPD, incidente de dados, transferência internacional, decisão automatizada, encarregado/DPO, privacy by design, or wants the missing, partial or vulnerable privacy controls exposed in frontend, backend, database, integrations and processes, even without saying \"LGPD\". Do NOT use for formal legal opinions, GDPR-only scope, or security reviews unrelated to personal data (use web-security-audit)."
license: Apache-2.0
compatibility: "Minimum agent tier: 1. Requires terminal: yes. Network access: no. Script execution: no."
metadata:
  version: 0.1.0
  author: "@codesteer"
  category: security
  min-agent-tier: "1"
  requires-terminal: "true"
  sandbox-network: "false"
  sandbox-allow-exec: "false"
---

# Implementação e Auditoria de LGPD

Transforme um pedido vago de "adequar à LGPD" em diagnóstico com evidência,
plano de remediação priorizado por risco e, quando pedido, mudanças concretas
no código, no schema e nos processos do projeto.

## Princípios que guiam o trabalho

- **Evidência antes de conclusão.** Política de privacidade publicada não é
  controle implementado. Só marque algo como `Implementado` depois de ver o
  código, a migration, a configuração, o job ou o contrato que o sustenta.
- **LGPD não é cookie banner.** O art. 7 traz dez bases legais e o
  consentimento é apenas uma delas. Reduzir a análise a consentimento gera
  falsa segurança e esconde lacunas em retenção, direitos, terceiros e logs.
- **Separe três camadas em toda recomendação:** o que a lei exige
  expressamente, o que é recomendação conservadora de engenharia e o que
  depende de decisão do jurídico ou do encarregado. Misturá-las faz o time
  tratar opinião como obrigação ou obrigação como opcional.
- **Proporcionalidade.** Um pedido estreito ("ajuste o banner de cookies")
  recebe resposta estreita, com os riscos adjacentes apenas sinalizados. Um
  pedido de auditoria recebe o diagnóstico completo.

## Modos de trabalho

| Modo | Quando o usuário quer | Entregue | Leia |
| --- | --- | --- | --- |
| **Auditoria** | validar o estado atual, achar o que falta ou está vulnerável | achados com evidência, status, severidade e remediação por domínio | `references/lgpd-control-framework.md` |
| **Implementação** | sair do diagnóstico para mudança concreta | sequência por risco e dependência, mudanças em código/schema/telas/processos, critério de validação por item | framework + domínio afetado na matriz |
| **Cobertura normativa** | saber se cobre "todos os itens", revisão por artigo, readiness de auditoria | mapa por capítulo e artigo com aplicável / não aplicável / pendente | `references/lgpd-coverage-matrix.md` + `references/lgpd-regulatory-checkpoints.md` |

Diagnóstico seguido de implementação é a combinação mais comum: audite
primeiro, implemente a partir dos achados críticos.

## Protocolo

1. **Delimite o escopo real.** Produto, tipos de dado, perfis de titular,
   dados sensíveis, crianças e adolescentes, terceiros, regiões de
   processamento, canais de coleta e quais partes do sistema estão no escopo.
2. **Determine o regime de aplicação.** Confira a aplicação territorial
   (art. 3) e as exceções (art. 4). Identifique se há poder público
   (arts. 23-30), relação de consumo (CDC), provedor de aplicação (Marco
   Civil), setor regulado (saúde, financeiro, educação, telecom) e se o agente
   se enquadra como pequeno porte (Resolução CD/ANPD nº 2/2022), o que altera
   obrigações de encarregado, registro e prazos.
3. **Colete evidência antes de opinar.** Use a tabela "Onde procurar" abaixo.
   Leia schema, migrations, DTOs, rotas, jobs, configuração de analytics,
   templates de e-mail, logs, infraestrutura e documentos. Registre o caminho
   do arquivo ou o artefato que sustenta cada conclusão.
4. **Percorra os 12 domínios.** Siga `references/lgpd-control-framework.md`
   sem assumir que um controle resolve outro. Um preference center não
   implementa retenção; um endpoint de exclusão não prova que backups e
   terceiros foram tratados.
5. **No modo cobertura, aplique a matriz por artigo.** Ela existe para
   expor obrigações que não aparecem olhando só o código: registro de
   operações, RIPD, encarregado, transferência internacional, poder público e
   sanções.
6. **Classifique cada item.** Status: `Implementado`, `Parcial`, `Ausente`,
   `Vulnerável` (existe, mas introduz risco ou falsa segurança) ou
   `Não aplicável` com justificativa por fato observável. Severidade:
   `Crítica`, `Alta`, `Média`, `Baixa` conforme a escala do framework.
7. **Priorize por risco ao titular.** Vai para o topo o que:
   - expõe dado pessoal sem base legal clara ou coleta além do necessário
   - impede o exercício de direitos (acesso, exclusão, revogação, revisão)
   - vaza PII em logs, observabilidade, filas, analytics ou terceiros
   - não tem retenção, descarte ou revogação funcionando de ponta a ponta
   - trata dado sensível ou de menor sem trilha reforçada
   - automatiza decisão com efeito relevante sem transparência nem revisão
   - opera no poder público sem fundamentos e artefatos próprios
   - deixa o controlador sem capacidade de demonstrar accountability
8. **Feche com remediação acionável.** Cada lacuna sai com próxima ação,
   dono provável, artigo ou risco associado e a evidência mínima que
   permitirá marcá-la como resolvida.

## Os 12 domínios de verificação

Taxonomia única usada pela skill, pelo framework e pela matriz. Não substitua
por checklist próprio: a numeração é o que permite cruzar achados, artigos e
remediação.

| # | Domínio | Âncora na Lei 13.709/2018 |
| --- | --- | --- |
| 1 | Escopo, regime de aplicação e contexto regulatório | arts. 1-4 |
| 2 | Inventário de dados e mapa de tratamento | art. 37 |
| 3 | Finalidade, necessidade, transparência e base legal por fluxo | arts. 6, 7, 9, 10 |
| 4 | Consentimento, preferências e revogação | arts. 8, 9 §§2-3, 18 IX |
| 5 | Direitos do titular e capacidade real de atendê-los | arts. 17-19, 21-22 |
| 6 | Decisão automatizada, perfilização e revisão | art. 20, art. 12 §2 |
| 7 | Retenção, término do tratamento, descarte e backups | arts. 15-16 |
| 8 | Segurança, acesso mínimo, segregação e logs | arts. 46-47, 49 |
| 9 | Dados sensíveis, biometria, saúde, crianças e adolescentes | arts. 11-14 |
| 10 | Agentes de tratamento, encarregado, RIPD e governança | arts. 37-41, 50 |
| 11 | Terceiros, operadores e transferência internacional | arts. 26, 33-36, 39, 42 |
| 12 | Incidentes, responsabilidade, rastreabilidade e sanções | arts. 42-45, 48, 52 |

**Bloco adicional: poder público (arts. 23-30).** Quando houver órgão ou
entidade pública, política pública ou base de dados sob regime público, trate
como bloco próprio. Finalidade pública, competência legal, compartilhamento
entre órgãos (art. 26) e vedação de transferência a privados (art. 26 §1)
não cabem no checklist de SaaS.

## Onde procurar evidência no repositório

| Sinal | Onde buscar | Padrões úteis |
| --- | --- | --- |
| Campos pessoais e sensíveis | migrations, schema, DTOs, forms, validators | `cpf`, `cnpj`, `rg`, `phone`, `telefone`, `birth`, `nascimento`, `address`, `cep`, `lat`, `geo`, `health`, `saude`, `biometr`, `race`, `religi` |
| Rastreadores e pixels | layout raiz, `_app`, `index.html`, tag manager, SDKs mobile | `gtag`, `fbq`, `dataLayer`, `hotjar`, `clarity`, `segment`, `mixpanel`, `amplitude`, `posthog` |
| PII em logs e observabilidade | loggers, interceptors, middlewares, Sentry/Datadog config | `logger.*(user`, `req.body`, `console.log(.*email`, `sendDefaultPii`, `beforeSend` |
| Consentimento e preferências | tabelas de consent, banner, settings do usuário | `consent`, `preferences`, `opt_in`, `marketing`, `accepted_terms`, `terms_version` |
| Direitos do titular | rotas e jobs de exportação/exclusão, painel admin, playbooks | `export`, `download`, `delete`, `erase`, `anonymi`, `privacy`, `lgpd`, `gdpr` |
| Retenção e descarte | crons, jobs, TTLs, políticas de bucket, soft delete | `retention`, `ttl`, `purge`, `cleanup`, `deleted_at`, `soft_delete`, `lifecycle` |
| Terceiros e regiões | `package.json`, `.env.example`, terraform, docker-compose, contratos | nomes de SDKs, `region`, `us-east`, `eu-`, DPAs e anexos de segurança |
| Decisão automatizada | serviços de score, antifraude, ranking, recomendação, bloqueio | `score`, `risk`, `fraud`, `block`, `ban`, `rank`, `recommend`, `ml`, `model` |
| Acesso e auditoria | RBAC, middlewares de autorização, audit log | `role`, `permission`, `is_admin`, `audit`, `impersonat` |

Quando o repositório não estiver acessível, peça os artefatos equivalentes e
registre a limitação em "Evidências ausentes".

## Heurísticas de falso senso de conformidade

Sinais que costumam indicar que a adequação é só aparente:

- banner de cookies sem recusa tão fácil quanto a aceitação, ou com
  rastreadores disparando antes da escolha
- consentimento misturado com aceite obrigatório de termos contratuais
- caixas pré-marcadas ou finalidades opcionais (push, marketing,
  personalização) ativadas por padrão
- "excluir conta" que só desativa o registro, sem retenção definida, sem
  propagação a terceiros e sem tratamento de backups
- exportação de dados inexistente ou tão manual que não cumpre os 15 dias do
  art. 19 II
- PII em logs de aplicação, filas, dead-letter queues ou eventos de analytics
- CPF, telefone, data de nascimento ou geolocalização obrigatórios sem
  justificativa de necessidade
- legítimo interesse usado como rótulo genérico sem teste documentado
  (finalidade, necessidade, balanceamento, salvaguardas)
- dado sensível tratado no mesmo fluxo, retenção e exposição dos dados comuns
- score, bloqueio ou perfilização sem transparência sobre critérios e sem
  canal de revisão
- operadores processando fora do Brasil sem inventário nem mecanismo do
  art. 33
- ninguém consegue provar quem decidiu, acessou, exportou ou excluiu dados
- órgão público avaliado como se fosse SaaS privado

## Ao implementar mudanças

1. **Ordene pelo risco, não pela facilidade.** Primeiro o que sangra (PII em
   logs, rastreadores antes de consentimento, sobrecoleta), depois direitos
   do titular, depois retenção, depois governança e documentação.
2. **Prefira controles verificáveis.** Preference center com trilha de
   auditoria, exportação de dados por endpoint, workflow de exclusão com
   propagação, retenção automatizada por job, mascaramento de logs,
   segregação de acesso com audit log.
3. **Vincule cada mudança a um domínio e a um artigo ou risco** e defina o
   critério objetivo que prova que a lacuna fechou.
4. **Não esconda lacuna processual com patch de código.** Se faltar contrato
   com operador, RIPD, política de retenção aprovada ou definição de base
   legal, diga explicitamente e aponte o dono.
5. **Trate decisão automatizada com cuidado de redação.** O art. 20 garante o
   direito de solicitar revisão e de obter informações sobre os critérios. A
   exigência de revisão "por pessoa natural" foi vetada, então apresente
   revisão humana como recomendação conservadora, não como exigência literal,
   e exija transparência e canal de revisão em qualquer caso.
6. **Em poder público, não reaproveite o checklist privado.** Use o bloco
   dos arts. 23-30 e o guia da ANPD para o setor público.

## Formato de saída

Para auditoria e cobertura normativa:

```markdown
# Diagnóstico LGPD
## Escopo avaliado
## Resumo executivo
## Achados prioritários
| Severidade | Status | Domínio | Evidência | Risco | Próxima ação |
## Lacunas por domínio
## Mapa de cobertura normativa   <!-- só no modo cobertura ou quando pedido -->
## Plano de remediação
## Evidências ausentes ou limitações
## Dependências de jurídico, encarregado ou operação
```

Para implementação, acrescente:

```markdown
## Mudanças propostas
## Ordem de implementação
## Como validar a correção
```

Para pedido estreito (um controle específico), entregue a mudança pedida com
evidência e critério de validação, seguida de uma seção curta "Riscos
adjacentes observados" em vez do diagnóstico completo.

## Guardrails

- Não use linguagem de certificação ("100% aderente", "em conformidade") sem
  ressalvas: a skill produz evidência técnica, não parecer jurídico.
- Não marque `Implementado` com base em intenção documental.
- Não confunda ausência de prova com prova de ausência; declare a limitação.
- Não declare `Não aplicável` sem fato observável que justifique.
- Não omita arquivos, tabelas, endpoints, jobs, provedores ou telas
  relevantes quando estiverem acessíveis.
- Não ignore o art. 20 só porque o projeto não se chama "IA": score,
  antifraude, ranking, recomendação e bloqueio automático contam.
- Não deixe de apontar risco operacional só porque a mitigação depende de
  processo e não de código.

## Referências

- `references/lgpd-control-framework.md`: perguntas, onde procurar, sinais de
  risco e evidência mínima por domínio. Leia em toda auditoria e
  implementação.
- `references/lgpd-coverage-matrix.md`: matriz por capítulo e artigo da lei.
  Leia no modo cobertura normativa ou quando o usuário pedir revisão por
  artigo.
- `references/lgpd-regulatory-checkpoints.md`: resoluções e guias da ANPD,
  prazos e normas correlatas. Leia quando o caso envolver incidente,
  transferência internacional, encarregado, pequeno porte, legítimo interesse
  ou setor regulado.
