# Framework de Controles LGPD

Checklist técnico-operacional por domínio. Segue a mesma numeração dos 12
domínios do `SKILL.md`; use-a para cruzar achados, artigos e remediação. Não
substitui a lei nem parecer jurídico: reduz omissões recorrentes.

Cada domínio traz: âncora legal, perguntas-chave, onde procurar, sinais de
risco e a evidência mínima para marcar `Implementado`.

## Índice

1. [Escopo e regime de aplicação](#1-escopo-regime-de-aplicação-e-contexto-regulatório)
2. [Inventário e mapa de tratamento](#2-inventário-de-dados-e-mapa-de-tratamento)
3. [Finalidade, necessidade e base legal](#3-finalidade-necessidade-transparência-e-base-legal)
4. [Consentimento e revogação](#4-consentimento-preferências-e-revogação)
5. [Direitos do titular](#5-direitos-do-titular)
6. [Decisão automatizada](#6-decisão-automatizada-e-perfilização)
7. [Retenção e descarte](#7-retenção-término-do-tratamento-e-descarte)
8. [Segurança, acesso e logs](#8-segurança-acesso-mínimo-e-logs)
9. [Dados sensíveis e menores](#9-dados-sensíveis-crianças-e-adolescentes)
10. [Agentes, encarregado e governança](#10-agentes-de-tratamento-encarregado-ripd-e-governança)
11. [Terceiros e transferência internacional](#11-terceiros-operadores-e-transferência-internacional)
12. [Incidentes e sanções](#12-incidentes-responsabilidade-e-sanções)
- [Escalas de status e severidade](#escalas-de-status-e-severidade)

## 1. Escopo, regime de aplicação e contexto regulatório

Âncora: arts. 1-4.

Perguntas-chave:

- O tratamento ocorre no Brasil, oferta a pessoas no Brasil ou coleta dados
  no Brasil (art. 3)?
- Alguma exceção do art. 4 se aplica (fins exclusivamente particulares,
  jornalísticos, acadêmicos, segurança pública)?
- Há poder público, relação de consumo, provedor de aplicação ou setor
  regulado somando obrigações?
- O agente é de pequeno porte (Resolução CD/ANPD nº 2/2022)? Isso muda
  encarregado, registro e prazos, mas não se aplica a tratamento de alto
  risco em larga escala.

Onde procurar: README e docs do produto, termos de uso, contratos, estatuto
ou natureza jurídica do controlador, regiões de deploy.

Sinais de risco: time não sabe quem é o controlador; produto público tratado
como SaaS; "dado técnico" (IP, device id, cookie id) considerado fora do
escopo quando identifica a pessoa.

Evidência mínima: descrição do produto, identificação do controlador e
regime aplicável registrados no diagnóstico.

## 2. Inventário de dados e mapa de tratamento

Âncora: art. 37 (registro das operações), art. 5 (definições).

Perguntas-chave:

- Quais dados pessoais entram, em quais telas, APIs, jobs, eventos e
  integrações?
- Quais tabelas, buckets, filas, caches, logs e provedores recebem cada dado?
- Existe um registro de operações com finalidade, base legal, retenção e
  compartilhamento por fluxo, e quem o mantém?

Onde procurar: migrations e schema, DTOs e validators, eventos de analytics,
formulários, contratos de API, planilha ou ferramenta de data mapping.

Sinais de risco: mesma informação duplicada em vários provedores; PII em
observabilidade, fila ou dead-letter queue; mapa informal só na cabeça do
time.

Evidência mínima: registro de operações versionado ou mantido em ferramenta,
com owner e data de revisão.

## 3. Finalidade, necessidade, transparência e base legal

Âncora: art. 6 (princípios), art. 7 (bases legais), art. 9 (acesso à
informação), art. 10 (legítimo interesse).

Perguntas-chave:

- Cada coleta tem finalidade específica e cada campo tem justificativa de
  necessidade?
- A base legal está definida por operação, não genericamente por produto?
- Legítimo interesse tem teste documentado (finalidade legítima, necessidade,
  balanceamento, salvaguardas e transparência)?
- O titular recebe as informações do art. 9 (finalidade, duração,
  controlador e contato, compartilhamento, direitos) de forma clara?

Onde procurar: telas de cadastro e campos obrigatórios, política de
privacidade versus comportamento real, tabela de finalidades e bases, PRDs.

Sinais de risco: coleta "para talvez usar depois"; campos obrigatórios sem
relação com a entrega; consentimento como base universal; uma única base
legal para tudo; política genérica que não reflete os fluxos existentes.

Evidência mínima: tabela finalidade → dados → base legal por fluxo, com
teste de legítimo interesse quando essa base for invocada.

## 4. Consentimento, preferências e revogação

Âncora: art. 8 (forma, ônus da prova, revogação no §5, nova finalidade no
§6), art. 9 §§2-3, art. 18 IX.

Perguntas-chave:

- O usuário consegue aceitar e recusar finalidades opcionais separadamente,
  com a recusa tão fácil quanto o aceite?
- A recusa bloqueia indevidamente o produto (art. 9 §3 exige destaque quando
  o consentimento é condição)?
- Existe prova de quem consentiu, quando, para quê e em qual versão do texto?
- Revogação e recusa se propagam para pixels, tag manager, e-mail marketing,
  CRM e outros operadores?

Onde procurar: banner e preference center, tabela de consentimento com
auditoria, configuração do tag manager, integrações de marketing, versão dos
termos armazenada junto ao aceite.

Sinais de risco: caixas pré-marcadas; "aceitar" em destaque e "recusar"
escondido; rastreadores disparando antes da escolha; revogação sem
propagação; consentimento sem versão nem timestamp.

Evidência mínima: registro de consentimento (titular, finalidade, versão,
timestamp, origem) e teste mostrando que a recusa bloqueia os rastreadores.

## 5. Direitos do titular

Âncora: arts. 17-19 (direitos e prazos), art. 21 (uso em prejuízo),
art. 22.

Perguntas-chave:

- Existe fluxo para confirmação, acesso, correção, anonimização/bloqueio/
  eliminação, portabilidade, informação sobre compartilhamento e revogação
  (art. 18)?
- O acesso completo é entregue em até 15 dias (art. 19 II)? Pequeno porte
  tem prazo em dobro.
- Há validação de identidade proporcional antes de entregar ou excluir?
- O sistema localiza dados em fontes distribuídas (bancos, buckets, terceiros,
  backups)?
- Há SLA, rastreabilidade e canal público (encarregado) para o pedido?

Onde procurar: portal de privacidade ou settings, endpoints de exportação e
exclusão, playbooks de suporte, logs de atendimento, política de privacidade
(canal informado).

Sinais de risco: processo totalmente manual e sem registro; exportação que
ignora tabelas secundárias e terceiros; exclusão que só desativa; sem
tratamento de dependências (pedidos, faturas, obrigações legais).

Evidência mínima: endpoint ou playbook rastreável por direito, com prazo
medido e registro de atendimento.

## 6. Decisão automatizada e perfilização

Âncora: art. 20 (revisão e informação sobre critérios), art. 12 §2 (perfil
comportamental é dado pessoal), art. 6 IX (não discriminação).

Perguntas-chave:

- Há score, antifraude, ranking, recomendação, precificação, bloqueio ou
  limite de crédito decidido só por tratamento automatizado com efeito
  relevante?
- O titular recebe informações claras sobre critérios e procedimentos
  (respeitado segredo comercial)?
- Existe canal para solicitar revisão e um fluxo que de fato a executa?
- Há owner, trilha de decisão e avaliação de viés ou discriminação?

Onde procurar: serviços de score e risco, regras de bloqueio, modelos e
features utilizadas, logs de decisão, textos de transparência, fluxo de
contestação.

Sinais de risco: bloqueio de conta sem trilha nem revisão; score sem owner
nem explicabilidade operacional; features que usam dado sensível ou proxies.

Evidência mínima: inventário das decisões automatizadas, texto de
transparência, canal de revisão funcionando e log por decisão.

Nota de redação: a exigência de revisão "por pessoa natural" foi vetada.
Trate revisão humana como recomendação conservadora e transparência mais
canal de revisão como exigência.

## 7. Retenção, término do tratamento e descarte

Âncora: art. 15 (término), art. 16 (eliminação e exceções), art. 18 VI.

Perguntas-chave:

- Cada categoria de dado tem prazo e gatilho de retenção definidos?
- O sistema elimina ou anonimiza quando a finalidade termina ou o
  consentimento é revogado?
- As exceções do art. 16 (obrigação legal, pesquisa, anonimização) estão
  documentadas por categoria, e não usadas como desculpa genérica?
- Backups e restores evitam reintroduzir dado já eliminado?
- Há diferença clara entre exclusão lógica e efetiva, com prova de execução?

Onde procurar: jobs de limpeza e crons, TTLs, lifecycle de buckets, colunas
`deleted_at`, política de retenção, playbooks de backup e restore.

Sinais de risco: dados mantidos indefinidamente por inércia; "backup" como
justificativa para não excluir; exclusão sem log de execução; retenção igual
para dado sensível e comum.

Evidência mínima: tabela de retenção por categoria com fundamento, job
automatizado e log de execução.

## 8. Segurança, acesso mínimo e logs

Âncora: art. 46 (medidas técnicas e administrativas; §2 privacy by design),
art. 47, art. 49 (sistemas estruturados para segurança).

Perguntas-chave:

- Dados em trânsito e em repouso têm proteção proporcional ao risco?
- Há segregação por papel, privilégio mínimo e revisão periódica de acesso?
- Admins, suporte e impersonation deixam trilha de auditoria?
- Logs, observabilidade e mensagens de erro evitam PII desnecessária?
- Dumps, ambientes de teste e seeds usam dados mascarados?

Onde procurar: RBAC/ABAC, middlewares de autorização, configuração de
secrets, hardening de banco e storage, loggers e redaction, configuração de
Sentry/Datadog, scripts de seed e dump.

Sinais de risco: acesso amplo a produção; dumps compartilhados sem máscara;
segredos no repositório ou no client; PII em log de requisição; ausência de
audit log para operações administrativas.

Evidência mínima: matriz de acesso, audit log de operações sensíveis e
configuração de redaction verificada com exemplo de log.

## 9. Dados sensíveis, crianças e adolescentes

Âncora: art. 11 (sensíveis: consentimento específico e destacado ou
hipóteses do inciso II; sem legítimo interesse), art. 11 §4 (vedação de
uso de dado de saúde para vantagem econômica), art. 12, art. 13,
art. 14 (melhor interesse; consentimento parental para crianças; esforços
razoáveis de verificação; linguagem acessível).

Perguntas-chave:

- O projeto trata saúde, biometria, origem racial, religião, opinião
  política, orientação sexual, dado genético ou de sindicato?
- Há menores no fluxo? Como a idade é conhecida e como o consentimento
  parental é obtido e verificado (art. 14 §§1 e 5)?
- Dados sensíveis recebem minimização, retenção, acesso e criptografia
  reforçados em relação aos comuns?
- Geolocalização persistente e biometria têm finalidade e base próprias?

Onde procurar: campos de cadastro, pipelines de onboarding e KYC, regras de
negócio, modelos de ML, políticas de idade, textos destinados a crianças.

Sinais de risco: mesma retenção e exposição para sensível e comum; ausência
de verificação etária onde o produto exige; legítimo interesse invocado para
dado sensível; dado de saúde usado em precificação ou marketing.

Evidência mínima: inventário de dados sensíveis com base legal específica,
controles reforçados demonstráveis e fluxo parental quando houver menores.

Nota: o Enunciado CD/ANPD nº 1/2023 admite outras bases dos arts. 7 e 11
para dados de crianças e adolescentes, observado o melhor interesse.
Confirme a vigência antes de citar.

## 10. Agentes de tratamento, encarregado, RIPD e governança

Âncora: art. 37 (registro), art. 38 (RIPD), art. 39 (operador segue
instruções), art. 41 (encarregado com identidade e contato públicos),
art. 50 (programa de governança).

Perguntas-chave:

- Controlador e operador estão definidos por fluxo, inclusive em
  controladoria conjunta?
- Há encarregado nomeado com contato público, ou dispensa fundamentada
  (pequeno porte) com canal de atendimento mesmo assim?
- Tratamentos de alto risco têm RIPD com tipos de dados, metodologia,
  medidas de mitigação e owner?
- Existe programa de governança (políticas, treinamento, revisão periódica,
  resposta a incidentes) proporcional ao porte?

Onde procurar: política de privacidade (nome e contato do encarregado),
organograma e matriz RACI, templates e histórico de RIPD, materiais de
treinamento, atas de decisão.

Sinais de risco: owner técnico sem owner jurídico-operacional; ninguém sabe
responder ao titular ou à ANPD; adequação depende de memória oral; RIPD
inexistente para profiling ou dado sensível em escala.

Evidência mínima: encarregado publicado, registro de operações, RIPD para os
tratamentos de alto risco e política com data de revisão.

## 11. Terceiros, operadores e transferência internacional

Âncora: art. 26 (uso compartilhado), art. 33-36 (transferência
internacional e mecanismos), art. 39, art. 42 (responsabilidade solidária
do operador), Resolução CD/ANPD nº 19/2024.

Perguntas-chave:

- Quais operadores e suboperadores recebem dados, para qual finalidade e com
  qual categoria?
- Há contrato ou DPA com instruções, segurança, subcontratação e exclusão ao
  término?
- Existe transferência internacional (cloud, analytics, CRM, suporte,
  antifraude fora do Brasil) e qual hipótese do art. 33 a sustenta
  (cláusulas-padrão, cláusulas específicas, normas corporativas, consentimento
  específico, decisão de adequação)?
- O projeto consegue desligar um terceiro quando o titular revoga ou exclui?

Onde procurar: `package.json` e SDKs, `.env.example`, terraform e
docker-compose (regiões), lista de vendors, DPAs e anexos de segurança,
configuração de região em cloud e SaaS.

Sinais de risco: ferramenta instalada sem inventário; região escolhida sem
avaliação; cláusulas-padrão não assinadas após o prazo da Resolução 19/2024;
revogação que não chega ao terceiro.

Evidência mínima: inventário de operadores com finalidade, categoria,
país, mecanismo de transferência e contrato vinculado.

## 12. Incidentes, responsabilidade e sanções

Âncora: art. 48 (comunicação de incidente), arts. 42-45 (responsabilidade
e reparação), art. 52 (sanções), Resolução CD/ANPD nº 15/2024, Resolução
CD/ANPD nº 4/2023 (dosimetria).

Perguntas-chave:

- Existe playbook para incidente com dado pessoal: detecção, classificação de
  risco ou dano relevante, escalonamento, comunicação à ANPD e aos titulares
  no prazo regulatório, registro interno?
- A auditoria permite reconstruir quem acessou, alterou, exportou ou excluiu
  dados e quando?
- O controlador consegue demonstrar boa-fé, governança e pronta correção
  (atenuantes na dosimetria)?
- Quais lacunas têm maior potencial de sanção, litígio ou dano ao titular?

Onde procurar: runbooks de incidente, canal de escalonamento, alertas,
trilha de auditoria, registro de incidentes anteriores, apólices e cláusulas
contratuais de responsabilidade.

Sinais de risco: sem owner para incidente de privacidade; sem log para
operações administrativas; incidente passado tratado só como problema de
infra; impossibilidade de listar titulares afetados.

Evidência mínima: playbook com prazos, registro de incidentes e trilha de
auditoria que permita reconstruir um evento de ponta a ponta.

## Escalas de status e severidade

Status:

- `Implementado`: há evidência real e operacional (código, job, contrato,
  registro) e ela foi observada.
- `Parcial`: existe parte do controle, mas com lacuna relevante.
- `Ausente`: o controle não foi encontrado.
- `Vulnerável`: existe implementação, mas ela introduz risco ou falsa
  segurança (ex.: exclusão que só desativa).
- `Não aplicável`: somente com justificativa por fato observável.

Severidade:

- `Crítica`: risco alto de dano, vazamento, tratamento ilícito ou quebra de
  direito essencial; exposição direta a sanção ou incidente.
- `Alta`: lacuna importante com exposição relevante ou dependência forte de
  ação manual.
- `Média`: gap real, mas com impacto contornável no curto prazo.
- `Baixa`: melhoria importante, porém não bloqueante.
