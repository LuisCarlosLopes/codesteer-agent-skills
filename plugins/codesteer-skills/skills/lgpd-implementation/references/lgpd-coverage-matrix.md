# Matriz de Cobertura LGPD por Capítulo e Artigo

Use quando o usuário pedir cobertura ampla, "todos os itens", revisão por
artigo, readiness de auditoria ou validação jurídico-operacional. O objetivo
não é reproduzir a lei, e sim evitar omissões materialmente relevantes que não
aparecem olhando só o código.

A coluna "Domínio" aponta para a numeração do `SKILL.md` e do
`lgpd-control-framework.md`. Para cada linha, atribua status
(`Implementado`, `Parcial`, `Ausente`, `Vulnerável`, `Não aplicável` com
justificativa), evidência e próxima ação.

Formato de saída recomendado:

| Capítulo | Artigo | Status | Evidência | Risco | Próxima ação |

## Capítulo I: Disposições preliminares (arts. 1-6)

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 3 | aplicação a operação no Brasil, oferta a pessoas no Brasil ou coleta no Brasil | onde roda, para quem vende, de onde coleta | 1 |
| art. 4 | exceções: fins particulares, jornalístico/artístico/acadêmico, segurança pública, dados de fora sem comunicação com agentes brasileiros | se alguma exceção realmente se aplica; não assumir | 1 |
| art. 5 | definições: dado pessoal, sensível, anonimizado, titular, controlador, operador, encarregado | se o time classifica IP, device id, cookie id e perfis como dado pessoal; quem é controlador e operador em cada fluxo | 1, 2 |
| art. 6 | princípios: finalidade, adequação, necessidade, livre acesso, qualidade, transparência, segurança, prevenção, não discriminação, responsabilização | se os princípios aparecem em comportamento e artefatos, não só na política pública | 3 |

## Capítulo II: Requisitos para o tratamento (arts. 7-16)

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 7 | dez bases legais; base por operação | tabela fluxo → dados → base; compatibilidade entre finalidade, dado e base | 3 |
| art. 7 §§3-4 e 7 | dado público ainda tem finalidade e boa-fé | scraping, enriquecimento, dados "públicos" usados sem limite | 3 |
| art. 8 | consentimento por escrito ou meio que demonstre manifestação; cláusula destacada; ônus da prova do controlador; nulo se vício; revogável (§5); nova finalidade exige novo consentimento (§6) | registro de consentimento, versão do texto, fluxo de revogação, impacto de mudança de finalidade | 4 |
| art. 9 | informação clara sobre finalidade, duração, controlador, contato, compartilhamento, responsabilidades e direitos; §3 destaque quando consentimento for condição | política versus prática; destaque quando o produto condiciona o uso ao consentimento | 3, 4 |
| art. 10 | legítimo interesse apenas para finalidades legítimas em situações concretas, com dados estritamente necessários e transparência; ANPD pode exigir RIPD | teste de legítimo interesse documentado para analytics, marketing, segurança, personalização | 3, 10 |
| art. 11 | dado sensível: consentimento específico e destacado ou hipóteses do inciso II; sem legítimo interesse; §4 vedação de uso de saúde para vantagem econômica | inventário de sensíveis, base por dado, controles reforçados | 9 |
| art. 12 | anonimizado não é pessoal salvo reversão razoável; §2 perfil comportamental de pessoa identificável é dado pessoal | técnica de anonimização e risco de reidentificação; perfis e segmentações | 2, 6 |
| art. 13 | estudos em saúde pública com dados sensíveis | se houver pesquisa, condições de anonimização e segurança | 9 |
| art. 14 | melhor interesse de crianças e adolescentes; consentimento parental para crianças (§1); esforços razoáveis de verificação (§5); linguagem acessível (§6); não condicionar a dados além do necessário (§3) | verificação de idade, fluxo parental, textos para menores, minimização | 9 |
| art. 15 | término do tratamento: finalidade alcançada, fim de período, revogação, determinação da ANPD | gatilhos de término implementados por categoria | 7 |
| art. 16 | eliminação após término, salvo obrigação legal, pesquisa, transferência lícita ou uso anonimizado pelo controlador | jobs de descarte, fundamento de cada exceção, backups | 7 |

## Capítulo III: Direitos do titular (arts. 17-22)

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 18 | confirmação, acesso, correção, anonimização/bloqueio/eliminação, portabilidade, eliminação de dados consentidos, informação sobre compartilhamento, informação sobre consequência de não consentir, revogação; §2 oposição; §6 comunicar correções e eliminações a terceiros | fluxo, endpoint ou playbook por direito; propagação a terceiros | 5 |
| art. 19 | confirmação e acesso: imediato em formato simplificado ou declaração completa em 15 dias | prazo medido; formato eletrônico; pequeno porte em dobro | 5 |
| art. 20 | direito a solicitar revisão de decisão unicamente automatizada que afete interesses; informação clara sobre critérios (§1); ANPD pode auditar segredo alegado (§2) | inventário de decisões automatizadas, transparência, canal de revisão | 6 |
| art. 21 | dado sobre exercício regular de direito não pode ser usado em prejuízo | se contestações ou pedidos de exclusão alimentam score ou bloqueio | 6 |
| art. 22 | defesa de interesses em juízo, individual ou coletiva | exposição a ação coletiva (consumidor, MP, Procon) | 12 |

## Capítulo IV: Poder público (arts. 23-30)

Aplique quando houver órgão ou entidade pública, política pública,
compartilhamento governamental ou base sob regime público.

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 23 | tratamento para finalidade pública e interesse público, no cumprimento de competência legal; informar hipóteses de tratamento em veículo de fácil acesso; indicar encarregado | fundamento de competência, página de transparência, encarregado nomeado | bloco público, 10 |
| art. 25 | dados em formato interoperável e estruturado para uso compartilhado | padrões de dados e interoperabilidade | bloco público |
| art. 26 | uso compartilhado entre órgãos para finalidade pública; §1 vedação de transferência a privados salvo exceções (execução descentralizada, dado acessível publicamente, previsão legal ou contrato, prevenção de fraude, proteção de direitos) | mapa de compartilhamentos entre órgãos e com privados; fundamento de cada um | bloco público, 11 |
| art. 27 | comunicação de dado a privado depende de consentimento, salvo exceções, e deve ser informada à ANPD | registro de comunicações a privados e informação à ANPD | bloco público |
| arts. 29-30 | ANPD pode solicitar informes e editar normas complementares | capacidade de responder à ANPD com evidência | bloco público, 12 |

Normas correlatas: LAI (Lei 12.527/2011) para transparência ativa e passiva;
Decreto 10.046/2019 para compartilhamento na administração federal; Guia da
ANPD para o poder público. Confirme vigência antes de citar.

## Capítulo V: Transferência internacional (arts. 33-36)

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 33 | hipóteses: país com nível adequado; garantias (cláusulas específicas, cláusulas-padrão, normas corporativas globais, selos); cooperação internacional; proteção da vida; autorização da ANPD; compromisso internacional; política pública; consentimento específico e destacado com informação prévia; execução de contrato, obrigação legal, exercício de direitos | inventário de transferências e hipótese por vendor | 11 |
| art. 34 | avaliação de adequação do país pela ANPD | se alguma decisão de adequação está sendo presumida sem existir | 11 |
| art. 35 | cláusulas-padrão e verificação pela ANPD | se as cláusulas-padrão da Resolução CD/ANPD nº 19/2024 foram adotadas | 11 |
| art. 36 | alterações nas garantias comunicadas à ANPD | processo de atualização contratual | 11 |

## Capítulo VI: Agentes de tratamento (arts. 37-45)

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 37 | registro das operações de tratamento, especialmente com legítimo interesse | registro de operações com owner e revisão | 2, 10 |
| art. 38 | RIPD a pedido da ANPD; conteúdo mínimo: tipos de dados, metodologia, medidas de mitigação | RIPD para tratamentos de alto risco, com template e histórico | 10 |
| art. 39 | operador trata conforme instruções do controlador | contratos e DPAs com instruções | 11 |
| art. 40 | padrões de interoperabilidade para portabilidade | formato de exportação | 5 |
| art. 41 | encarregado com identidade e contato públicos; receber reclamações, comunicar-se com a ANPD, orientar funcionários; §3 ANPD pode dispensar | nome e contato na política; Resolução CD/ANPD nº 18/2024; dispensa para pequeno porte | 10 |
| art. 42 | responsabilidade por dano; operador solidário quando descumpre obrigações ou instruções | cláusulas de responsabilidade e capacidade de provar diligência | 11, 12 |
| art. 43 | excludentes: não realizou o tratamento, não houve violação, culpa exclusiva do titular ou de terceiro | evidência que sustente a excludente | 12 |
| art. 44 | tratamento irregular quando não fornece a segurança esperada | adequação das medidas ao estado da técnica | 8 |
| art. 45 | aplicação do CDC em relações de consumo | exposição consumerista | 12 |

## Capítulo VII: Segurança e boas práticas (arts. 46-51)

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 46 | medidas técnicas e administrativas proporcionais; §2 desde a concepção (privacy by design) | criptografia, acesso mínimo, segregação, revisão de design | 8 |
| art. 47 | segurança mantida mesmo após o término do tratamento | descarte seguro, dados em backups e arquivos | 7, 8 |
| art. 48 | comunicação de incidente à ANPD e aos titulares em prazo razoável; conteúdo: natureza dos dados, titulares, medidas, riscos, motivo de atraso, medidas de reversão | playbook, prazo da Resolução CD/ANPD nº 15/2024, registro interno de incidentes | 12 |
| art. 49 | sistemas estruturados para atender segurança, boas práticas e princípios | arquitetura, revisões de design, testes | 8 |
| art. 50 | programa de governança: políticas, salvaguardas, supervisão, resposta a incidentes, adaptado ao porte | programa documentado e praticado | 10 |
| art. 51 | padrões técnicos estimulados pela ANPD | aderência a frameworks (ISO 27701, NIST Privacy) como boa prática | 10 |

## Capítulo VIII: Fiscalização e sanções (art. 52)

| Artigo | O que exige | Verificar no projeto | Domínio |
| --- | --- | --- | --- |
| art. 52 | sanções: advertência, multa de até 2% do faturamento (limite de R$ 50 milhões por infração), multa diária, publicização, bloqueio, eliminação, suspensão do banco de dados ou da atividade, proibição; atenuantes incluem boa-fé, cooperação, políticas de boas práticas e pronta correção | quais lacunas têm maior exposição; evidência de governança e correção que atue como atenuante (Resolução CD/ANPD nº 4/2023) | 12 |

## Regras de preenchimento

- `Não aplicável` exige fato observável (ex.: "não há menores porque o
  produto é B2B com verificação de CNPJ e o cadastro não aceita pessoa
  física"). "Acreditamos que não" é `Ausente` com limitação declarada.
- Um artigo pode ter status diferente por fluxo. Quando isso ocorrer, quebre
  a linha por fluxo em vez de atribuir uma média.
- Obrigações processuais (registro, RIPD, encarregado, contrato) nunca são
  `Implementado` por existir código relacionado; exigem o artefato.
- Registre o checkpoint complementar acionado (resolução ou guia da ANPD)
  na coluna de evidência quando ele mudar o prazo ou a obrigação.
