# Matriz de Cobertura LGPD

Use esta matriz quando o usuario pedir cobertura ampla, "todos os itens",
revisao por artigo, readiness de auditoria ou validacao mais juridico-operacional.

O objetivo nao e reproduzir a lei inteira, e sim evitar omissoes materialmente
relevantes no diagnostico.

## Bloco 1. Aplicacao, escopo e excecoes

Verifique:

- se o tratamento realmente cai no escopo da LGPD
- se ha alguma excecao ou limitacao relevante de aplicacao
- se existem regras setoriais que se somam a LGPD

Procure:

- produto privado
- ente publico
- relacao de consumo
- aplicacao de internet
- saude, educacao, credito ou contexto altamente regulado

Evidencia minima:

- descricao do produto
- ownership do tratamento
- fluxo real de dados pessoais

## Bloco 2. Fundamentos, principios e definicoes

Verifique:

- se o projeto consegue distinguir controlador, operador e encarregado
- se finalidade, necessidade, transparencia, seguranca e prestacao de contas
  aparecem em artefatos e comportamento, e nao so em politica publica

Sinais de alerta:

- papeis contratuais indefinidos
- dado pessoal tratado como "dado tecnico"

## Bloco 3. Bases legais e tratamento por finalidade

Verifique:

- base legal por operacao de tratamento
- compatibilidade entre finalidade, dado coletado e base invocada
- uso indevido de consentimento ou legitimo interesse como rotulo generico

Sinais de alerta:

- uma unica base legal para tudo
- dados sensiveis tratados como se fossem dados comuns

## Bloco 4. Direitos dos titulares

Verifique:

- confirmacao de tratamento
- acesso
- correcao
- anonimizacao, bloqueio ou eliminacao
- portabilidade
- informacao sobre compartilhamento
- revogacao e oposicao

Evidencia minima:

- fluxo, endpoint, playbook ou atendimento operacional rastreavel

## Bloco 5. Decisao automatizada e perfilizacao

Verifique:

- se o projeto usa score, recomendacao, ranking, bloqueio, antifraude ou
  outro mecanismo automatizado com efeito relevante
- se ha transparencia minima sobre a logica operacional
- se existe possibilidade de revisao por pessoa natural quando aplicavel

Sinais de alerta:

- bloqueio de conta sem trilha de revisao
- score de risco sem owner e sem explicabilidade operacional

## Bloco 6. Dados sensiveis e grupos vulneraveis

Verifique:

- dados sensiveis
- criancas e adolescentes
- biometria
- saude
- geolocalizacao persistente

Evidencia minima:

- campos, eventos, pipelines e regras de negocio que demonstrem necessidade
  e controles reforcados

## Bloco 7. Seguranca e incidentes

Verifique:

- medidas tecnicas e administrativas proporcionais
- acesso minimo
- trilha de auditoria
- deteccao, classificacao e escalonamento de incidente
- capacidade de comunicacao do incidente no prazo regulatorio aplicavel

Sinais de alerta:

- PII em log
- operador sem processo de escalonamento
- nenhum owner para incidente de privacidade

## Bloco 8. Registro de operacoes e RIPD

Verifique:

- inventario de operacoes de tratamento
- responsavel por manter o mapa atualizado
- criterio para acionar RIPD
- existencia de template, owner e historico

Sinais de alerta:

- mapa de dados informal
- tratamento de alto risco sem avaliacao estruturada

## Bloco 9. Agentes de tratamento e governanca

Verifique:

- definicao de controlador e operador por fluxo
- encarregado/DPO ou papel equivalente
- treinamento
- politicas
- accountability e aprovacoes

Sinais de alerta:

- owner tecnico sem owner juridico-operacional
- ninguem sabe responder contato do titular ou da ANPD

## Bloco 10. Terceiros e transferencia internacional

Verifique:

- lista de operadores e subprocessadores
- compartilhamentos por finalidade
- transferencia internacional e mecanismo usado
- dependencia contratual e regional de cloud/SaaS

Sinais de alerta:

- vendor instalado sem inventario
- processamento cross-border sem base documental

## Bloco 11. Poder publico

Aplique este bloco quando houver orgao publico, entidade publica, politica
publica, compartilhamento governamental ou base de dados sob regime publico.

Verifique:

- finalidade publica e competencia
- publicidade e transparencia adequadas
- compartilhamentos institucionais
- governanca especifica do tratamento

Guardrail:

- nao reutilize checklist simplificado de SaaS privado como resposta suficiente

## Bloco 12. Exposicao sancionatoria

Verifique:

- quais lacunas tem maior potencial de sancao, incidente ou litigio
- se ha evidencia de boa-fe, governanca, mitigacao e pronta correcao
- se o projeto conseguiria demonstrar accountability perante auditoria

Formato recomendado:

| Bloco | Status | Evidencia | Risco | Proxima acao |
