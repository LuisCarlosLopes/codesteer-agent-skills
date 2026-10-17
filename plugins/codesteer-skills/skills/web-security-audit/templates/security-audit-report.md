# Relatorio de Auditoria de Seguranca Web

- **Alvo avaliado**: `{{URL_ALVO}}`
- **Data da execucao**: `{{DATA_ISO}}`
- **Escopo e modo**: Inspecao autorizada e nao destrutiva via `playwright-cli`
- **Autorizado por**: `{{RESPONSAVEL_AUTORIZACAO}}` · **Ambiente**: `{{LOCALHOST_STAGING_PRODUCAO}}`
- **Sessao autenticada**: `{{SIM_NAO}}` — conta de teste com papel `{{PAPEL_CONTA}}` (nunca registre credenciais; controles sem sessao ficam `N/A (sem sessao)`)
- **Responsavel**: `{{AUTOR_AUDITORIA}}`

---

## 1. Escopo e Limitacoes

- **Incluido**: `{{DOMINIOS_E_ROTAS_NO_ESCOPO}}`
- **Fora do escopo**: `{{DOMINIOS_E_ROTAS_EXCLUIDOS}}`
- **Nao avaliado**: liste controles marcados `N/A` e o motivo (ex.: `N/A (sem sessao)`, sem segunda conta para comparar perfis, ambiente de producao restrito a observacao passiva).

Esta auditoria e uma inspecao pelo navegador; ela nao substitui revisao de codigo, analise de dependencias no servidor nem pentest completo. Ausencia de achados significa apenas que nada foi observado dentro deste escopo.

---

## 2. Resumo Executivo

Descreva em 3 a 5 linhas a postura geral de seguranca observada na aplicacao, destacando os principais riscos identificados e as defesas ja presentes.

| Severidade | Quantidade | Status |
| :--- | :---: | :--- |
| **Critica** | `{{QTD_CRITICA}}` | `{{STATUS_CRITICA}}` |
| **Alta** | `{{QTD_ALTA}}` | `{{STATUS_ALTA}}` |
| **Media** | `{{QTD_MEDIA}}` | `{{STATUS_MEDIA}}` |
| **Baixa / Info** | `{{QTD_BAIXA}}` | `{{STATUS_BAIXA}}` |

---

## 3. Matriz de Controles Inspecionados

| Dominio | Controle Verificado | Status (`OK` / `Parcial` / `Vulneravel` / `N/A`) | Observacao Resumida |
| :--- | :--- | :---: | :--- |
| **Transporte & HTTPS** | Redirecionamento HTTPS + HSTS + Ausencia de Mixed Content | `{{STATUS_HTTPS}}` | `{{OBS_HTTPS}}` |
| **Cabecalhos HTTP** | CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` | `{{STATUS_HEADERS}}` | `{{OBS_HEADERS}}` |
| **Cookies & Storage** | Flags `HttpOnly`, `Secure`, `SameSite` e ausencia de segredos em `localStorage` | `{{STATUS_STORAGE}}` | `{{OBS_STORAGE}}` |
| **Exposicao no Cliente** | Bundles JS, Source Maps, objetos globais, `console` e SRI em scripts externos | `{{STATUS_CLIENT}}` | `{{OBS_CLIENT}}` |
| **Autenticacao & Formularios** | Protecao CSRF, autocomplete, enumeracao de conta e invalidacao no logout | `{{STATUS_AUTH}}` | `{{OBS_AUTH}}` |
| **APIs & Controle de Acesso** | CORS, exposicao excessiva de dados (PII), cache de respostas e erros verbosos | `{{STATUS_API}}` | `{{OBS_API}}` |

---

## 4. Detalhamento dos Achados

### [SEC-01] `{{TITULO_DO_ACHADO}}`

- **Severidade**: `Critica | Alta | Media | Baixa | Info`
- **Categoria OWASP**: `{{OWASP_CATEGORY}}` (ex.: `A02:2025 - Security Misconfiguration`)
- **Componente / Endpoint afetado**: `{{ENDPOINT_OU_RECURSO}}`
- **Descricao do problema**:
  Explicacao objetiva da falha de configuracao ou exposicao identificada.
- **Evidencia coletada (`playwright-cli`)**:
  ```text
  Comando: playwright-cli -s=sec-audit {{COMANDO_EXECUTADO}}
  Resultado observado (segredos e dados pessoais mascarados; de respostas de API, registre so os nomes dos campos expostos):
  {{EVIDENCIA_OBSERVADA}}
  ```
- **Impacto pratico**:
  O que um atacante poderia realizar caso essa brecha seja explorada em producao.
- **Recomendacao de correcao**:
  Mudanca exata de codigo, cabecalho de servidor/CDN ou configuracao de framework para mitigar o risco.

---

## 5. Controles Positivos Observados

Liste os controles de seguranca que ja estao corretamente implementados na aplicacao (ex.: uso de HTTPS, ausencias de erros no console, flags de cookie corretas).

---

## 6. Plano de Remediacao Priorizado

1. **Imediato (Bloqueadores / Criticos e Altos)**:
   - `[ ]` `{{ACAO_IMEDIATA_1}}`
   - `[ ]` `{{ACAO_IMEDIATA_2}}`
2. **Curto Prazo (Medios - Hardening de Defesa em Profundidade)**:
   - `[ ]` `{{ACAO_CURTO_PRAZO_1}}`
3. **Melhoria Continua (Baixos / Higiene Arquitetural)**:
   - `[ ]` `{{ACAO_MELHORIA_1}}`
