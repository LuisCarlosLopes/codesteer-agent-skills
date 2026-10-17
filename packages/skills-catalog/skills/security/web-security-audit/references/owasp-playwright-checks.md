# Guia de Verificacao OWASP Top 10 com playwright-cli

Este guia mapeia as categorias do **OWASP Top 10:2025** e controles do **OWASP ASVS** para inspecoes praticas e nao destrutivas usando o `playwright-cli`.

---

## 1. A01:2025 Broken Access Control (Controle de Acesso Quebrado)

### O que procurar
- Rotas administrativas ou autenticadas acessiveis sem sessao valida (validacao apenas no roteador client-side da SPA).
- Endpoints de API retornando dados mesmo apos limpeza de cookies/storage (`delete-data`).
- Politicas de CORS permissivas que permitem que origens nao confiaveis leiam respostas autenticadas.

### Comandos de inspecao
```bash
# 1. Descobrir rotas referenciadas nos links e bundles da pagina
playwright-cli -s=sec-audit eval "Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'))"

# 2. Limpar dados da sessao e testar se uma rota restrita redireciona ou entrega dados
playwright-cli -s=sec-audit delete-data
playwright-cli -s=sec-audit goto https://alvo-autorizado.exemplo/admin

# 3. Verificar se chamadas de API foram disparadas e retornaram 200 OK sem sessao
playwright-cli -s=sec-audit requests
```

### Como corrigir
- Validar autenticacao e autorizacao em cada endpoint no backend (middleware/guard server-side).
- Configurar `Access-Control-Allow-Origin` com lista explicita de origens confiaveis; nunca combinar refletor de origem arbitraria com `Access-Control-Allow-Credentials: true`.

---

## 2. A04:2025 Cryptographic Failures & Transporte Inseguro

### O que procurar
- Pagina acessivel em HTTP puro sem redirecionamento `301`/`308` para HTTPS.
- Ausencia do cabecalho `Strict-Transport-Security` (HSTS).
- Recursos carregados via `http://` em pagina `https://` (Mixed Content).
- Cookies sensiveis sem flag `Secure`.
- Dados sensiveis ou tokens armazenados em texto claro no `localStorage` ou `sessionStorage`.

### Comandos de inspecao
```bash
# Detectar recursos Mixed Content e formularios HTTP na pagina
playwright-cli -s=sec-audit eval "(() => ({
  isHttps: location.protocol === 'https:',
  mixedResources: performance.getEntriesByType('resource')
    .map(r => r.name)
    .filter(url => url.startsWith('http://')),
  insecureForms: Array.from(document.querySelectorAll('form[action^=\"http://\"]'))
    .map(f => f.action)
}))()"
```

### Como corrigir
- Emitir `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- Adicionar `Content-Security-Policy: upgrade-insecure-requests`.
- Marcar todos os cookies de sessao com `Secure; HttpOnly; SameSite=Lax` (ou `Strict`).

---

## 3. A05:2025 Injection & Superficie de DOM XSS

### O que procurar
- Uso de sinks perigosos no DOM (`innerHTML`, `outerHTML`, `document.write`, `eval`) alimentados por parametros de URL (`location.search`, `location.hash`) sem sanitizacao.
- Ausencia de `Content-Security-Policy` capaz de bloquear scripts inline nao autorizados.
- Reflexao direta de parametros de busca no HTML sem codificacao de entidades.

### Comandos de inspecao (somente-leitura / marcador inofensivo)
```bash
# Testar reflexao usando string alfanumerica inofensiva (nunca payloads destrutivos)
playwright-cli -s=sec-audit goto "https://alvo-autorizado.exemplo/busca?q=codesteerprobe123"
playwright-cli -s=sec-audit find "codesteerprobe123"

# Auditar inline scripts sem nonce/integrity na pagina
playwright-cli -s=sec-audit eval "(() => ({
  inlineScriptsCount: document.querySelectorAll('script:not([src])').length,
  scriptsWithNonce: document.querySelectorAll('script[nonce]').length,
  metaCSP: document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')?.content || null
}))()"
```

### Como corrigir
- Aplicar escape contextual automatico no template engine / framework UI e usar `textContent` em vez de `innerHTML` (ou sanitizar com DOMPurify quando HTML rico for indispensavel).
- Implementar `Content-Security-Policy` baseada em nonces ou hashes (`script-src 'self' 'nonce-...'`; `object-src 'none'`; `base-uri 'self'`).

---

## 4. A02:2025 Security Misconfiguration (Configuracao Incorreta de Seguranca)

### Tabela de Referencia de Cabecalhos HTTP

| Cabecalho | Valor Recomendado | Risco quando Ausente ou Incorreto |
| :--- | :--- | :--- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Downgrade HTTP / interceptacao MITM no primeiro acesso |
| `Content-Security-Policy` | Politica restritiva sem `'unsafe-inline'`/`'unsafe-eval'` em `script-src` | Amplificacao de impacto de XSS e injecao de scripts |
| `X-Content-Type-Options` | `nosniff` | MIME-sniffing executando uploads como HTML/JS |
| `X-Frame-Options` / CSP `frame-ancestors` | `DENY` ou `SAMEORIGIN` / `frame-ancestors 'none'` | Clickjacking (sobreposicao invisivel de iframe) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` ou `no-referrer` | Vazamento de tokens/IDs na URL via cabecalho `Referer` para terceiros |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Uso indevido de APIs de hardware por scripts/iframes |
| `Cross-Origin-Opener-Policy` | `same-origin` | Compartilhamento de grupo de contexto de navegacao (`window.opener`) |
| `Server` / `X-Powered-By` | Omitir ou anonimizar | Facilitacao de busca por CVEs especificas da versao exposta |

### Verificacao de arquivos e caminhos expostos
Durante uma auditoria autorizada, verifique se arquivos de configuracao, mapas de codigo ou documentacao interna estao expostos:
- **Source maps (`.js.map`)**: verifique na saida de `playwright-cli -s=sec-audit requests` se arquivos `.js` incluem `//# sourceMappingURL=` acessivel publicamente.
- **Endpoints de debug/metadados**: `/graphql` (introspection aberta em producao), `/swagger-ui.html`, `/openapi.json`, `/actuator/health`, `/.well-known/security.txt`.

---

## 5. A03:2025 Software Supply Chain Failures & A08:2025 Software or Data Integrity Failures (SRI)

### O que procurar
- Scripts ou folhas de estilo carregados de CDNs externas sem atributo `integrity` (Subresource Integrity) e `crossorigin="anonymous"`.
- Bibliotecas client-side antigas e conhecidas por vulnerabilidades de Prototype Pollution ou XSS (ex.: versoes legadas de jQuery, Lodash, Moment, Bootstrap) expostas no escopo global `window`.

### Comandos de inspecao
```bash
playwright-cli -s=sec-audit eval "(() => ({
  jqueryVersion: window.jQuery?.fn?.jquery || null,
  lodashVersion: window._?.VERSION || null,
  externalScripts: Array.from(document.querySelectorAll('script[src]')).map(s => ({
    src: s.src,
    integrity: s.integrity || null,
    crossOrigin: s.crossOrigin || null
  })),
  externalStyles: Array.from(document.querySelectorAll('link[rel=\"stylesheet\"][href]')).map(l => ({
    href: l.href,
    integrity: l.integrity || null
  }))
}))()"
```

### Como corrigir
- Hospedar assets criticos na propria origem (`self-hosting`) ou exigir hash SHA-384 no atributo `integrity="sha384-..."` para todos os scripts de terceiros.
- Atualizar bibliotecas front-end com CVEs conhecidas.

---

## 6. A07:2025 Authentication Failures

### O que procurar
- Cookies de sessao sem `HttpOnly`, sem `Secure` ou com `SameSite=None` desnecessario.
- Tokens de autenticacao gravados em `localStorage` ou expostos em query strings na URL.
- Formularios de senha com `method="GET"` ou sem `autocomplete="current-password"` / `new-password`.
- Respostas de login/recuperacao de senha que revelam se um e-mail/CPF esta cadastrado.
- Sessao que continua ativa apos logout.

### Comandos de inspecao
Use os comandos da Fase 4 do `SKILL.md` (`cookie-list`, `localstorage-list`, `sessionstorage-list`) e, para o ciclo de logout, o roteiro da Fase 6. Rode essas checagens na sessao autenticada da Fase 2; sem sessao, elas mostram so os cookies publicos.

### Como corrigir
- Armazenar tokens de sessao em cookies `HttpOnly; Secure; SameSite=Lax` com tempo de expiracao curto.
- Unificar mensagens e tempos de resposta em endpoints de login e redefinicao de senha ("Se o e-mail existir, enviaremos as instrucoes").
- Invalidar a sessao no servidor ao executar logout e limpar cookies com `Clear-Site-Data: "cookies", "storage"`.

---

## 7. A09:2025 Security Logging and Alerting Failures & A10:2025 Mishandling of Exceptional Conditions

### O que procurar
- Mensagens no `console` do navegador contendo tokens de sessao, payloads completos de usuarios, chaves de servicos ou stack traces detalhados.
- Respostas HTTP de erro (`400`, `401`, `403`, `404`, `500`) retornando stack traces do backend, queries SQL ou caminhos internos do sistema de arquivos.

### Comandos de inspecao
```bash
# Listar todas as mensagens de console (log, warn, error)
playwright-cli -s=sec-audit console

# Inspecionar respostas com status >= 400 encontradas em `requests`
playwright-cli -s=sec-audit request <index>
```

### Como corrigir
- Remover `console.log`/`console.debug` de builds de producao no bundler (Terser/esbuild `drop: ['console', 'debugger']`).
- Retornar mensagens de erro padronizadas e opacas ao cliente em producao, registrando o stack trace completo apenas no observabilidade/SIEM do backend.
