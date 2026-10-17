---
name: web-security-audit
description: Conduct an authorized web application security audit and defensive pentest assessment using playwright-cli to detect OWASP Top 10 gaps, misconfigured HTTP security headers, insecure cookies, exposed secrets in DOM/Web Storage/network responses, CORS misconfigurations, broken access control, and source map or debug leaks. Use when the user asks to run a security audit, pentest a website or web app, inspect security headers, find security vulnerabilities or gaps with playwright-cli, or validate production readiness before launch. Do NOT use for unauthorized targets, destructive attacks, denial-of-service, credential brute-forcing, or LGPD/legal privacy compliance reviews (use lgpd-implementation).
license: Apache-2.0
compatibility: "Minimum agent tier: 1. Requires terminal: yes. Network access: yes. Script execution: yes."
metadata:
  version: 0.0.1
  author: "@codesteer"
  category: security
  min-agent-tier: "1"
  requires-terminal: "true"
  sandbox-network: "true"
  sandbox-allow-exec: "true"
---

# Auditoria de Seguranca Web com playwright-cli

Conduza uma avaliacao tecnica de seguranca em aplicacoes web autorizadas usando o `playwright-cli` para inspecionar trafego de rede, cabecalhos HTTP, cookies, armazenamento local, arvore DOM, mensagens de console e controles de sessao.

## Regras de Engajamento e Seguranca Operacional

1. **Escopo autorizado**: execute apenas contra ambientes autorizados pelo usuario (`localhost`, ambientes de staging/homologacao ou dominios proprios sob autorizacao expressa), confirmados na Fase 0. Sem confirmacao de autorizacao, nao abra o alvo. Prefira staging; em producao, limite-se a observacao passiva.
2. **Inspecao nao destrutiva**: priorize observacao passiva e verificacao de configuracao. Nao execute ataques de negacao de servico (DoS/flood), forca bruta de credenciais, injecao destrutiva em banco de dados ou alteracao de dados de terceiros.
3. **Evidencia reprodutivel**: todo achado deve citar o comando `playwright-cli` executado, o cabecalho/cookie/requisicao observado e o impacto pratico.
4. **Sanitizacao de segredos e dados pessoais**: ao encontrar tokens, chaves de API ou credenciais expostas no front-end, mascare parte do valor no relatorio (ex.: `sk_live_4f9a...REDACTED`) para nao amplificar o vazamento. Dados pessoais de terceiros (nome, e-mail, CPF, telefone) vistos em respostas de API nunca entram no relatorio: registre so o nome do campo exposto e o endpoint.
5. **Credenciais sao do usuario**: nunca peca senha, codigo MFA ou token no chat e nunca preencha credenciais com `fill`/`type`. Quando o alvo exigir login, o proprio usuario autentica no navegador visivel (Fase 2). Nao contorne CAPTCHA, MFA ou bloqueio de conta.

## Fluxo de Auditoria (Fases 0 a 8)

Use uma sessao dedicada do `playwright-cli` (`-s=sec-audit`) para isolar o estado do navegador durante a inspecao.

### Fase 0: Escopo e Pre-requisitos

Antes de abrir qualquer URL, confirme com o usuario e registre no relatorio:

- **Alvo e escopo**: dominios, subdominios e rotas incluidos, e o que fica de fora (ex.: gateway de pagamento, servicos de terceiros).
- **Autorizacao**: quem e dono do sistema ou autorizou a avaliacao. Se o usuario nao confirmar que pode testar o alvo, pare aqui.
- **Ambiente**: `localhost`, staging ou producao. Em producao, faca apenas observacao passiva: sem submeter formularios com dados reais e sem testar logout de contas em uso.

Verifique a ferramenta antes de comecar:

```bash
playwright-cli --version
# Se o navegador ainda nao estiver instalado
playwright-cli install-browser
```

### Fase 1: Reconhecimento Inicial e Superficie da Aplicacao

Abra a URL-alvo e colete o inventario inicial de requisicoes, logs de console e estrutura da pagina:

```bash
# Iniciar sessao isolada e abrir o alvo
playwright-cli -s=sec-audit open https://alvo-autorizado.exemplo

# Capturar snapshot da interface e elementos interativos
playwright-cli -s=sec-audit snapshot

# Listar todas as requisicoes disparadas no carregamento
playwright-cli -s=sec-audit requests

# Verificar erros, avisos de CSP, Mixed Content ou stack traces no console
playwright-cli -s=sec-audit console
```

Registre este resultado no relatorio (ou nas suas notas) como **linha de base nao autenticada** antes de seguir, porque a Fase 2 pode fechar a sessao e descartar a lista de requisicoes: rotas, cookies e respostas visiveis sem login servem de comparacao no teste de controle de acesso (Fase 7).

### Fase 2: Autenticacao (quando o alvo exige login)

Ao fim da Fase 1, decida se o alvo exige autenticacao. Sinais tipicos:

- Redirecionamento para `/login`, `/signin`, `/auth` ou para um provedor de SSO (Google, Microsoft Entra, Okta, Auth0, Keycloak).
- Respostas `401`/`403` nas chamadas de API listadas em `requests`.
- Formulario com `input[type="password"]` ou botao "Entrar"/"Sign in" no `snapshot`, com o conteudo principal inacessivel.

Sem nenhum sinal, pule para a Fase 3. Com qualquer sinal, **pare e pergunte ao usuario antes de continuar**:

1. Confirme que existe uma conta de teste autorizada para o escopo, de preferencia com o menor privilegio necessario e nunca a conta pessoal ou de producao de alguem.
2. Peca que o usuario faca o login ele mesmo. Explique que o navegador vai abrir visivel, que ele deve concluir login, MFA ou SSO e responder "pronto" no chat, e que voce nao vai pedir nem digitar a senha.
3. Se o usuario recusar ou nao tiver conta, siga apenas com a superficie publica e marque os controles autenticados como `N/A (sem sessao)` no relatorio.

Com a confirmacao, reabra a sessao em modo visivel na pagina de login e aguarde. Se a URL inicial ja indicar login (ex.: `/login`, `/app`), a Fase 1 pode ser feita direto com `open --headed`, sem fechar a sessao:

```bash
playwright-cli -s=sec-audit close
playwright-cli -s=sec-audit open https://alvo-autorizado.exemplo/login --headed
```

Quando o usuario responder "pronto", valide a sessao e salve o estado fora do repositorio:

```bash
# Confirmar que a area autenticada carregou (nome do usuario, menu, dashboard)
playwright-cli -s=sec-audit snapshot

# Confirmar que existe cookie ou token de sessao
playwright-cli -s=sec-audit cookie-list

# Salvar o estado autenticado para retomar se a sessao cair
AUTH_STATE="${TMPDIR:-/tmp}/sec-audit-auth.json"
playwright-cli -s=sec-audit state-save "$AUTH_STATE"
```

O arquivo de estado contem tokens de sessao validos e deve ser tratado como segredo: nunca o salve dentro do repositorio, nunca o anexe ao relatorio e apague-o na Fase 8. Se a sessao expirar durante a auditoria, use `state-load "$AUTH_STATE"`. Se o estado tambem expirou, peca ao usuario que faca o login de novo, pelo mesmo fluxo.

Para testar controle de acesso entre perfis (Fase 7), pergunte se ha uma segunda conta de teste com papel diferente (ex.: usuario comum vs. admin) e repita este fluxo em outra sessao (`-s=sec-audit-b`), salvando o estado em outro arquivo (`sec-audit-auth-b.json`).

Depois de autenticado, repita os comandos da Fase 1 (`snapshot`, `requests`, `console`) para inventariar a superficie autenticada.

### Fase 3: Cabecalhos de Seguranca HTTP e Exposicao de Infraestrutura

Localize na saida de `requests` o numero da requisicao do documento principal (a URL do alvo, tipo documento) e das chamadas de API relevantes. Nao assuma que e o indice `0`: redirecionamentos e service workers mudam a ordem.

```bash
# Inspecionar cabecalhos de resposta do documento principal (troque <index> pelo numero encontrado)
playwright-cli -s=sec-audit response-headers <index>
```

Verifique:
- **`Strict-Transport-Security` (HSTS)**: ausente ou com `max-age` baixo (< `31536000`).
- **`Content-Security-Policy` (CSP)**: ausente, ou permissiva demais (`'unsafe-inline'`, `'unsafe-eval'`, wildcard `*`).
- **`X-Frame-Options` / `frame-ancestors`**: ausencia expoe a pagina a Clickjacking.
- **`X-Content-Type-Options`**: deve ser `nosniff`.
- **`Referrer-Policy`**: ausencia ou politica que vaza URLs sensiveis (`unsafe-url`).
- **`Permissions-Policy`**: restricao de APIs sensiveis do navegador (`camera`, `microphone`, `geolocation`).
- **Fingerprinting de servidor**: cabecalhos `Server`, `X-Powered-By`, `X-AspNet-Version` expondo versoes exatas de runtime/framework.
- **CORS (`Access-Control-Allow-Origin`)**: verifique se endpoints autenticados retornam `*` ou refletem origens arbitrarias combinadas com `Access-Control-Allow-Credentials: true`.

### Fase 4: Higiene de Cookies, localStorage e sessionStorage

```bash
# Listar todos os cookies da sessao
playwright-cli -s=sec-audit cookie-list

# Listar chaves e valores em localStorage e sessionStorage
playwright-cli -s=sec-audit localstorage-list
playwright-cli -s=sec-audit sessionstorage-list
```

Avalie:
- **Cookies de sessao/autenticacao**: devem possuir `HttpOnly: true` (protecao contra leitura via script), `Secure: true` (transmissao apenas via HTTPS) e `SameSite: Strict` ou `Lax` (mitigacao de CSRF).
- **Tokens em Web Storage**: JWTs, refresh tokens, chaves de API privadas ou dados pessoais (PII) gravados em `localStorage` ou `sessionStorage` ficam totalmente acessiveis a qualquer script na pagina.

### Fase 5: Exposicao de Segredos no DOM, Bundles e Source Maps

Use `eval` em modo somente-leitura para auditar o estado global da pagina, scripts carregados e variaveis expostas:

```bash
# Verificar objetos globais de hidratacao, scripts sem SRI e links inseguros
playwright-cli -s=sec-audit eval "(() => ({
  protocol: location.protocol,
  ExposedGlobals: Object.keys(window).filter(k => /(__NEXT_DATA__|__NUXT__|__INITIAL_STATE__|ENV|CONFIG|SECRET|KEY)/i.test(k)),
  scriptsWithoutSRI: Array.from(document.querySelectorAll('script[src]'))
    .filter(s => new URL(s.src, location.href).origin !== location.origin && !s.integrity)
    .map(s => s.src),
  insecureBlankLinks: Array.from(document.querySelectorAll('a[target=\"_blank\"]'))
    .filter(a => !/(noopener|noreferrer)/i.test(a.rel || ''))
    .map(a => a.href),
  formsSummary: Array.from(document.querySelectorAll('form')).map(f => ({
    action: f.action,
    method: f.method,
    hasPasswordInput: !!f.querySelector('input[type=\"password\"]'),
    csrfFields: Array.from(f.querySelectorAll('input[type=\"hidden\"]')).map(i => i.name)
  }))
}))()"
```

Verifique tambem na lista de `requests` e `response-body`:
- Arquivos `.js.map` (Source Maps) acessiveis em producao expondo o codigo-fonte original.
- Chaves privadas ou credenciais hardcoded no bundle JS ou no objeto de hidratacao (`__NEXT_DATA__`, `window.__ENV`).
- Caminhos sensiveis publicamente acessiveis (`/robots.txt`, `/sitemap.xml`, `/.well-known/security.txt`, endpoints `/graphql`, `/swagger`, `/api-docs` ou `/.env` que devem retornar 404/403).

### Fase 6: Seguranca de Formularios, Autenticacao e Sessao

Inspecione fluxos de login, recuperacao de senha, cadastro e logout:

1. **Protecao de formularios**:
   - Formularios enviando dados sobre HTTP (`action="http://..."`) ou usando metodo `GET` para dados sensiveis.
   - Ausencia de token anti-CSRF em submissoes baseadas em cookies.
   - Enumeracao de usuarios: compare mensagens e codigos HTTP de resposta (`response-body <index>`) ao testar um identificador inexistente vs. formato invalido.
2. **Ciclo de vida da sessao**:
   - Com a sessao autenticada da Fase 2, use `state-save` antes do logout, acione o logout e verifique se `cookie-list` e `localstorage-list` foram limpos e se o backend realmente invalidou o token anterior.
   - Faca este teste **por ultimo, depois da Fase 7**: se o logout funcionar, ele invalida a sessao no servidor, e o `state-load` nao a recupera. Seria preciso pedir um novo login ao usuario.

### Fase 7: Vazamento de Dados em Respostas de API e Controle de Acesso

Analise as requisicoes XHR/Fetch listadas em `playwright-cli -s=sec-audit requests`:

```bash
# Inspecionar cabecalhos e corpo de uma resposta de API especifica
playwright-cli -s=sec-audit response-headers <index>
playwright-cli -s=sec-audit response-body <index>
```

Procure por:
- **Excessive Data Exposure (OWASP API3)** — registre so os nomes dos campos, nunca os valores (regra 4): APIs retornando campos internos (`password_hash`, `role`, `internal_notes`, `cpf`, `email` de outros usuarios) que a UI apenas oculta visualmente.
- **Cache indevido de dados sensiveis**: respostas autenticadas sem `Cache-Control: no-store, private`.
- **Stack traces e erros verbosos**: respostas `4xx`/`5xx` expondo nomes de tabelas SQL, caminhos de arquivos do servidor ou versoes de bibliotecas.
- **Rotas desprotegidas**: abra uma segunda aba ou limpe o estado (`delete-data`) e navegue diretamente para rotas internas descobertas na sessao autenticada ou no bundle, para verificar se o bloqueio ocorre no servidor ou apenas visualmente no cliente. Compare com a linha de base nao autenticada da Fase 1 e, havendo segunda conta, com a sessao `-s=sec-audit-b`.

### Fase 8: Encerramento e Limpeza

Sempre encerre a sessao do navegador ao concluir a coleta:

```bash
playwright-cli -s=sec-audit delete-data
playwright-cli -s=sec-audit close

# Se houve segunda conta na Fase 2
playwright-cli -s=sec-audit-b delete-data
playwright-cli -s=sec-audit-b close

# Se houve login na Fase 2: apagar o estado salvo (contem tokens de sessao)
rm -f "${TMPDIR:-/tmp}/sec-audit-auth.json" "${TMPDIR:-/tmp}/sec-audit-auth-b.json"
```

Se o usuario autenticou, recomende que ele encerre a sessao da conta de teste no proprio sistema (logout ou revogacao), para invalidar os tokens no servidor.

## Classificacao de Severidade

| Severidade | Criterio | Exemplos Tipicos |
| :--- | :--- | :--- |
| **Critica** | Comprometimento imediato de dados sensiveis, contas ou infraestrutura sem interacao complexa | Credenciais/chaves secretas de backend expostas no bundle, rota administrativa aberta sem autenticacao, CORS refletindo origem arbitraria com credenciais |
| **Alta** | Risco direto a sessoes de usuarios, dados pessoais ou controle de acesso | JWT/token de sessao em `localStorage` combinado com ausencia de CSP, cookie de sessao sem `HttpOnly`/`Secure`, Source Maps expondo logica sensivel ou segredos, API vazando PII de outros usuarios |
| **Media** | Ausencia de defesa em profundidade ou configuracao fragil exploravel em cadeia | Ausencia de CSP, HSTS ou `X-Frame-Options`, CSRF sem `SameSite`/token, scripts de terceiros sem SRI (`integrity`), enumeracao de usuarios no login |
| **Baixa / Info** | Hardening recomendado e higiene de metadados | `Server`/`X-Powered-By` expondo versao, `Referrer-Policy` ou `Permissions-Policy` ausentes, links `target="_blank"` sem `rel="noopener"` |

## Referencias e Templates sob Demanda

- Para o catalogo detalhado de verificacoes por categoria do OWASP Top 10:2025, scripts `eval` de inspecao e recomendacoes de correcao, leia `references/owasp-playwright-checks.md`.
- Para estruturar o entregavel final com evidencias, severidade e plano de acao, use o modelo em `templates/security-audit-report.md`.
