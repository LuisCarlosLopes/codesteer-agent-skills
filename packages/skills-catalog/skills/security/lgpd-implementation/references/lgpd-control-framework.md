# Framework de Controles LGPD

Use este arquivo como checklist tecnico-operacional. Ele nao substitui a lei
nem parecer juridico, mas reduz omissoes recorrentes na auditoria e na
implementacao.

## 1. Inventario de dados e mapa de tratamento

Perguntas-chave:

- Quais dados pessoais entram no sistema?
- Em quais telas, APIs, jobs e integracoes eles aparecem?
- Quais tabelas, buckets, filas, logs e provedores recebem esses dados?
- Existem dados sensiveis, biometria, saude, criancas ou adolescentes?

Evidencias uteis:

- schema do banco
- contratos de API
- eventos de analytics
- formularios de coleta
- documentacao de integracoes

Sinais de risco:

- time nao sabe onde os dados trafegam
- mesma informacao duplicada em varios provedores
- PII em observabilidade, fila ou dead-letter queue

## 2. Finalidade, necessidade e base legal

Perguntas-chave:

- Cada coleta tem finalidade especifica?
- Existe justificativa para cada campo coletado?
- A base legal esta definida por fluxo, e nao genericamente por produto?
- Foi usado legitimo interesse onde o caso parece exigir outra base?

Evidencias uteis:

- telas de cadastro
- textos de consentimento
- tabela de finalidades e bases
- backlog ou PRD com justificativa de negocio

Sinais de risco:

- coleta preventiva "para talvez usar depois"
- campos obrigatorios sem relacao clara com a entrega do servico
- consentimento usado como base universal

## 3. Consentimento, preferencias e revogacao

Perguntas-chave:

- O usuario consegue aceitar e recusar finalidades opcionais?
- A recusa bloqueia indevidamente o produto?
- Existe prova do consentimento e da revogacao?
- Pixels, cookies e automacoes opcionais respeitam a escolha?

Evidencias uteis:

- banner e centro de preferencias
- eventos de auditoria de consentimento
- configuracao de tag manager
- integracoes de e-mail marketing

Sinais de risco:

- caixas pre-marcadas
- botao "aceitar" mais facil que "recusar"
- revogacao que nao propaga para terceiros

## 4. Direitos do titular

Perguntas-chave:

- Existe fluxo para acesso, correcao, exportacao e exclusao?
- Ha validacao de identidade antes de entregar dados?
- O sistema consegue localizar dados em fontes distribuidas?
- Ha SLA e rastreabilidade de atendimento?

Evidencias uteis:

- portal de privacidade
- endpoints de exportacao/delecao
- playbooks operacionais
- logs de atendimento

Sinais de risco:

- processo totalmente manual e nao rastreavel
- exportacao incompleta
- exclusao sem tratamento de dependencias e backups

## 5. Retencao, descarte e anonimizacao

Perguntas-chave:

- Cada categoria de dado tem regra de retencao?
- O sistema apaga ou anonimiza quando a finalidade termina?
- Backups e restores evitam reintroducao indevida?
- Existe diferenca entre delecao logica e delecao efetiva?

Evidencias uteis:

- jobs de limpeza
- politicas de retention
- TTLs
- playbooks de backup

Sinais de risco:

- dados mantidos indefinidamente por inercia
- backup tratado como desculpa para nao excluir
- delecao sem prova de execucao

## 6. Seguranca e acesso

Perguntas-chave:

- Dados em transito e em repouso estao protegidos de forma proporcional?
- Existe segregacao por papel e privilegio minimo?
- Admins e suporte deixam trilha de acesso?
- Logs e observabilidade evitam expor PII desnecessaria?

Evidencias uteis:

- RBAC/ABAC
- configuracoes de secrets
- hardening de banco e storage
- redaction de logs

Sinais de risco:

- acesso amplo a producao
- dumps compartilhados sem mascaramento
- segredos em repositorio ou client

## 7. Dados sensiveis e grupos de maior risco

Perguntas-chave:

- O projeto trata saude, biometria, origem racial, opiniao politica ou outros dados sensiveis?
- Ha menores de idade no fluxo?
- Esses dados recebem controles reforcados e minimizacao maior?

Evidencias uteis:

- campos do cadastro
- pipelines de onboarding
- regras de negocio

Sinais de risco:

- mesma retencao e mesma exposicao de dados sensiveis e comuns
- ausencia de verificacao etaria onde o produto exige

## 8. Terceiros e transferencias internacionais

Perguntas-chave:

- Quais operadores e subprocessadores recebem dados?
- Existe mapeamento por finalidade e categoria de dado?
- Ha transferencia internacional ou processamento cross-region?
- O projeto sabe desligar terceiros quando o usuario revoga consentimento?

Evidencias uteis:

- lista de vendors
- DPAs
- configuracoes regionais
- integracoes de CRM, analytics, suporte e cloud

Sinais de risco:

- ferramenta de marketing instalada sem inventario
- cloud/regiao escolhida sem avaliacao de impacto

## 9. Incidentes, rastreabilidade e auditoria

Perguntas-chave:

- Existe playbook para incidente com dados pessoais?
- O time sabe detectar, classificar e escalar incidente?
- A auditoria permite reconstruir quem acessou, alterou ou exportou dados?

Evidencias uteis:

- runbooks
- trilha de auditoria
- alertas
- classificacao de incidente

Sinais de risco:

- ausencia de logs para operacoes administrativas
- sem canal de escalonamento para incidente de privacidade

## 10. Governanca e evidencia continua

Perguntas-chave:

- Existe encarregado/DPO ou papel equivalente definido?
- O projeto possui politica, owner e rotina de revisao?
- Tratamentos de maior risco passam por RIPD ou analise formal?
- Time de produto e engenharia recebeu orientacao operacional?

Evidencias uteis:

- politicas internas
- matriz RACI
- templates de RIPD
- treinamento

Sinais de risco:

- adequacao depende so de memoria oral
- ninguem consegue provar decisoes passadas

## Escala recomendada para classificar achados

Status:

- `Implementado`: ha evidencia real e operacional
- `Parcial`: existe parte do controle, mas com lacuna relevante
- `Ausente`: o controle nao foi encontrado
- `Vulneravel`: existe implementacao, mas ela introduz risco ou falsa seguranca
- `Nao aplicavel`: somente com justificativa explicita

Severidade:

- `Critica`: risco alto de dano, vazamento, tratamento indevido ou quebra de direito essencial
- `Alta`: lacuna importante com exposicao relevante ou dependencia forte de acao manual
- `Media`: gap real, mas com impacto contornavel no curto prazo
- `Baixa`: melhoria importante, porem nao bloqueante
