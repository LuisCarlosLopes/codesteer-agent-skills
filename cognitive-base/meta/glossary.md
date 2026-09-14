# Glossário

> Termos do domínio e da arquitetura. Cada entrada tem uma âncora `#termo`
> para ser linkada via `[[meta/glossary#termo|termo]]` nas notas.
> Não defina termos inline nas notas — link aqui.

Fonte semente: blueprint `arquitetura_plataforma_skills_mcp.md` (ASP v1.0.0).

## A

### air-gapped {#air-gapped}
Ambiente corporativo sem acesso direto à internet. Clientes CLI e MCP resolvem o catálogo por `ASP_REGISTRY_URL` ou `registryUrl` em `~/.agent-skills/config.json`, com fallback só então à CDN pública.

### Agent Skill Platform {#asp}
Plataforma (ASP / Open Agent Skills Engine) de registro, validação e entrega de [[meta/glossary#skill|skills]] a agentes de IA via CLI ou [[meta/glossary#mcp|MCP]], com [[meta/glossary#progressive-disclosure|progressive disclosure]] e checagem de integridade.

### arquitetura hexagonal {#arquitetura-hexagonal}
Estilo Ports & Adapters: a lógica de domínio depende só de interfaces (`FileSystemPort`, `HttpPort`, `PackageResolverPort`, `PathsPort`, `EnvPort`, `LoggerPort`). Adaptadores Node.js ficam na borda, para o núcleo não se acoplar a SO ou provedor de rede.

### atomicidade {#atomicidade}
Propriedade de uma operação que ocorre por completo ou não ocorre: não há estado intermediário observável. Na Base Cognitiva, cada nota registra **uma** ideia; na plataforma, a escrita do [[meta/glossary#lockfile|lockfile]] e a publicação de uma [[meta/glossary#skill|skill]] não podem deixar o catálogo pela metade.

## C

### content hash {#content-hash}
Checksum SHA-256 de cada arquivo de [[meta/glossary#skill|skill]], gravado no manifesto do [[meta/glossary#registry|registry]]. Clientes rejeitam download cujo hash divergir do manifesto oficial.

### context bloat {#context-bloat}
Inchaço da janela de contexto do LLM ao injetar manuais e regras extensas no *system prompt*. Aumenta latência, custo de tokens e reduz acurácia. Mitigado por [[meta/glossary#progressive-disclosure|progressive disclosure]].

## E

### embeddings {#embeddings}
Vetores densos gerados no build da CI (`embeddings.json`) a partir da `description` de cada [[meta/glossary#skill|skill]] (ex.: `text-embedding-3-small` ou `all-MiniLM-L6-v2`). O servidor [[meta/glossary#mcp|MCP]] calcula similaridade de cosseno em memória para busca semântica híbrida.

## I

### idempotência {#idempotencia}
Propriedade de uma operação que pode ser repetida com o mesmo efeito da primeira execução. Scripts de índice (`cb-index`), entrega de skills e retries de CI devem ser idempotentes: rodar duas vezes produz o mesmo resultado.

## L

### lockfile {#lockfile}
Arquivo `.skill-lock.json` no repositório do consumidor. Registra quais [[meta/glossary#skill|skills]] estão instaladas em quais agentes, com metadados e hashes, para reproducibilidade e reversão [[meta/glossary#atomicidade|atômica]] se a instalação for interrompida.

## M

### MCP {#mcp}
Model Context Protocol — protocolo de integração pelo qual agentes de IA descobrem e invocam ferramentas (incluindo o servidor de skills da plataforma) sem acoplar a um IDE específico.

## P

### progressive disclosure {#progressive-disclosure}
Estratégia de contexto: expor só o sumário e as instruções de primeiro nível da [[meta/glossary#skill|skill]]; carregar referências, scripts e ferramentas especializadas estritamente sob demanda, para evitar [[meta/glossary#context-bloat|context bloat]].

### prompt injection {#prompt-injection}
Ataque que tenta substituir ou desviar as instruções de sistema do agente (jailbreak, exfiltração de segredos, comandos destrutivos). A esteira de CI bloqueia merge quando o scanner (SAST / Snyk Agent Scan / LLM Guard) encontra vetores críticos.

## R

### registry {#registry}
Catálogo compilado da plataforma: `skills-registry.json` (cadastro + [[meta/glossary#content-hash|content hashes]]) e `embeddings.json`. Publicado em NPM, storage corporativo (S3/Artifactory) ou CDN; clientes resolvem a URL pela cadeia [[meta/glossary#air-gapped|air-gapped]].

## S

### sandbox {#sandbox}
Isolamento de execução de scripts de [[meta/glossary#skill|skill]]. Frontmatter da skill declara `sandbox.network` e `sandbox.allow_exec`; no modo corporativo `ASP_EXECUTION_MODE=container`, o script roda em container Docker efêmero sem rede.

### skill {#skill}
Unidade portável de instrução para um agente de IA, no formato canônico `SKILL.md` + `references/` + scripts. Catalogada, validada e entregue pela [[meta/glossary#asp|Agent Skill Platform]].
