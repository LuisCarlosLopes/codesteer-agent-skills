# Checkpoints Regulatórios Complementares

A Lei 13.709/2018 é a base, mas prazos, formas e dispensas vêm de resoluções e
guias da ANPD e de normas correlatas. Use este arquivo quando o caso envolver
incidente, transferência internacional, encarregado, pequeno porte, legítimo
interesse, cookies, menores ou setor regulado.

Os números e prazos abaixo refletem o estado conhecido na data de escrita da
skill. A ANPD revisa e consolida atos com frequência: antes de citar um
prazo ou número de resolução no diagnóstico, confirme a vigência na fonte
oficial e registre a data da consulta.

## Atos normativos da ANPD

| Ato | Tema | O que muda na prática |
| --- | --- | --- |
| Resolução CD/ANPD nº 1/2021 | processo de fiscalização e processo administrativo sancionador | como a ANPD instaura, instrui e decide; relevância de cooperação e correção |
| Resolução CD/ANPD nº 2/2022 | agentes de tratamento de pequeno porte (ME, EPP, startups, pessoas naturais, entidades sem fins lucrativos) | dispensa de encarregado (mantendo canal de atendimento), registro simplificado, prazos em dobro para titulares e incidentes; não vale para alto risco em larga escala |
| Resolução CD/ANPD nº 4/2023 | dosimetria e aplicação de sanções | critérios de gravidade, reincidência, boa-fé, cooperação e pronta correção como atenuantes |
| Resolução CD/ANPD nº 15/2024 | comunicação de incidente de segurança | notificar a ANPD em 3 dias úteis a partir do conhecimento quando houver risco ou dano relevante; comunicar titulares; manter registro de incidentes por 5 anos |
| Resolução CD/ANPD nº 18/2024 | atuação do encarregado | requisitos, atribuições, publicidade do contato, possibilidade de pessoa jurídica e de acúmulo com salvaguardas |
| Resolução CD/ANPD nº 19/2024 | transferência internacional | cláusulas-padrão contratuais (CPC), cláusulas específicas e normas corporativas globais; prazo de adequação dos contratos existentes |
| Enunciado CD/ANPD nº 1/2023 | crianças e adolescentes | tratamento pode se fundar em outras bases dos arts. 7 e 11, observado o melhor interesse |

## Guias orientativos da ANPD

- Cookies e proteção de dados pessoais (2022): classificação de cookies,
  consentimento granular, recusa tão fácil quanto aceite, base legal por
  categoria.
- Legítimo interesse (2024): teste em etapas (finalidade legítima,
  necessidade, balanceamento, salvaguardas) e documentação exigida.
- Agentes de tratamento e encarregado (2021, revisto em 2022): critérios
  para definir controlador, operador, controladoria conjunta e suboperador.
- Tratamento de dados pessoais pelo poder público (2022): finalidade
  pública, competência, compartilhamento e transparência.
- Segurança da informação para agentes de pequeno porte (2021): medidas
  mínimas esperadas.
- Orientações e perguntas frequentes sobre RIPD: quando elaborar e conteúdo
  mínimo.

## Quando cada checkpoint é crítico

### Incidente de segurança (art. 48, Resolução 15/2024)

Obrigatório quando houver vazamento, acesso não autorizado, alteração
indevida ou indisponibilidade de dado pessoal com risco ou dano relevante
(dado sensível, financeiro, de menores, larga escala, possibilidade de
fraude ou discriminação). Verifique: prazo de 3 dias úteis, conteúdo da
comunicação, comunicação aos titulares, registro interno e evidência de
contenção.

### Transferência internacional (arts. 33-36, Resolução 19/2024)

Obrigatório quando houver cloud, analytics, CRM, suporte, antifraude ou
storage com processamento fora do Brasil, inclusive suboperadores. Verifique:
inventário por vendor, hipótese do art. 33 invocada, cláusulas-padrão
assinadas, informação ao titular quando a hipótese for consentimento.

### RIPD (art. 38, art. 10 §3)

Obrigatório quando houver tratamento de alto risco: dado sensível em escala,
profiling ou decisão automatizada com efeito relevante, monitoramento
sistemático, menores, tecnologia nova ou invasiva, ou quando a ANPD puder
exigir demonstração formal. Verifique: template, owner, histórico e medidas
de mitigação vinculadas a achados.

### Legítimo interesse (art. 10, guia de 2024)

Obrigatório quando essa base for usada para analytics, marketing, segurança,
antifraude ou personalização. Verifique o teste documentado em etapas e a
transparência ao titular. Guardrail: legítimo interesse não serve para dado
sensível (art. 11) nem como atalho para evitar consentimento onde o titular
esperaria escolher.

### Encarregado e governança (art. 41, Resolução 18/2024)

Obrigatório quando não houver canal público de atendimento ao titular, houver
conflito de papéis ou faltar rotina de orientação, escalonamento e resposta.
Para pequeno porte, confirme a dispensa e mantenha o canal.

### Cookies e rastreadores (guia de 2022)

Obrigatório quando houver analytics, pixels, tag manager, SDKs de atribuição
ou personalização. Verifique: categorias, consentimento prévio para
não essenciais, recusa fácil, registro da escolha e propagação ao tag manager.

## Normas correlatas fora da ANPD

| Norma | Quando entra | O que verificar |
| --- | --- | --- |
| Constituição, art. 5º LXXIX (EC 115/2022) | sempre | proteção de dados como direito fundamental: pesa em balanceamento de legítimo interesse |
| Marco Civil da Internet (Lei 12.965/2014), arts. 13 e 15 | provedores de conexão e de aplicação | guarda de registros de conexão por 1 ano e de acesso a aplicações por 6 meses, sob sigilo; não confundir com retenção de dado cadastral |
| CDC (Lei 8.078/1990), art. 43 | relação de consumo | acesso e correção em bancos de dados de consumidores; ação coletiva |
| LAI (Lei 12.527/2011) | poder público | transparência ativa e passiva convivendo com proteção de dados |
| Decreto 10.046/2019 | administração federal | níveis de compartilhamento de dados entre órgãos |
| Lei 12.414/2011 (Cadastro Positivo) | crédito | regras próprias para histórico de crédito |
| Normas setoriais (BACEN, CVM, ANS, CFM, MEC, Anatel) | financeiro, saúde, educação, telecom | prazos de guarda específicos (ex.: prontuário), segurança cibernética, sigilo |
| Contratos enterprise e DPAs | B2B | obrigações contratuais que podem ser mais estritas que a lei |

## Saída esperada quando houver checkpoint complementar

No diagnóstico, para cada checkpoint acionado, deixe explícito:

- qual ato ou guia foi acionado e a data da confirmação de vigência
- por que ele se aplica ao caso (fato observável)
- evidência encontrada
- lacuna observada e prazo ou obrigação específica afetada
- dependência de jurídico, encarregado ou operação
