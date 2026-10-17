---
name: advanced-elicitation
description: "Pressione o LLM para reconsiderar, refinar e melhorar sua produção recente. Use quando o usuário solicitar elicitação avançada."
methods: "./references/methods.csv"
---

# Fluxo de Trabalho de Elicitação Avançada

**Objetivo:** Pressionar o LLM a reconsiderar, refinar e melhorar sua produção recente. Use quando o usuário solicitar elicitação avançada.

---

## INSTRUÇÕES CRÍTICAS PARA O LLM

- **OBRIGATÓRIO:** Execute TODAS as etapas na seção de fluxo NA ORDEM EXATA
- NÃO pule etapas ou altere a sequência
- PARE imediatamente quando as condições de parada (halt-conditions) forem atendidas
- Cada ação dentro de uma etapa é uma ação OBRIGATÓRIA para concluir essa etapa
- Seções fora do fluxo (validação, saída, contexto crítico) fornecem contexto essencial - revise e aplique durante toda a execução
- **VOCÊ DEVE SEMPRE FALAR EM Português em sua comunicação como Agente**

---

## INTEGRAÇÃO (Quando Chamado a partir do Workflow)

Quando chamado durante o processamento do fluxo de trabalho do template:

1. Receba ou revise o conteúdo da seção atual que acabou de ser gerado
2. Aplique métodos de elicitação iterativamente para aprimorar esse conteúdo específico
3. Retorne a versão aprimorada quando o usuário selecionar 'x' para prosseguir e retornar
4. O conteúdo aprimorado substitui o conteúdo da seção original no documento de saída

---

## FLUXO

### Etapa 1: Carregamento do Registro de Métodos

**Ação:** Carregue e leia `{methods}` e `{agent_party}`

#### Estrutura do CSV

- **category:** Agrupamento de métodos (core, estrutural, risco, etc.)
- **method_name:** Nome de exibição do método
- **description:** Explicação rica do que o método faz, quando usá-lo e por que é valioso
- **output_pattern:** Guia de fluxo flexível usando setas (ex: "análise -> insights -> ação")

#### Análise de Contexto

- Use o histórico da conversa
- Analise: tipo de conteúdo, complexidade, necessidades das partes interessadas (stakeholders), nível de risco e potencial criativo

#### Seleção Inteligente

1. Analise o contexto: Tipo de conteúdo, complexidade, necessidades das partes interessadas, nível de risco, potencial criativo
2. Analise as descrições: Entenda o propósito de cada método a partir das descrições ricas no CSV
3. Selecione 5 métodos: Escolha os métodos que melhor correspondem ao contexto com base em suas descrições
4. Equilibre a abordagem: Inclua uma mistura de técnicas fundamentais e especializadas conforme apropriado

---

### Etapa 2: Apresentar Opções e Lidar com Respostas

#### Formato de Exibição

```
**Opções de Elicitação Avançada**
_Se o modo "party" estiver ativo, os agentes participarão._
Escolha um número (1-5), [r] para Reembaralhar (Reshuffle), [a] Listar Tudo (List All) ou [x] para Prosseguir:

1. [Nome do Método]
2. [Nome do Método]
3. [Nome do Método]
4. [Nome do Método]
5. [Nome do Método]
r. Reembaralhar a lista com 5 novas opções
a. Listar todos os métodos com descrições
x. Prosseguir / Nenhuma Ação Adicional
```

#### Tratamento de Respostas

**Caso 1-5 (O usuário seleciona um método numerado):**

- Execute o método selecionado usando sua descrição do CSV
- Adapte a complexidade do método e o formato de saída com base no contexto atual
- Aplique o método criativamente ao conteúdo da seção atual que está sendo aprimorada
- Exiba a versão aprimorada mostrando o que o método revelou ou melhorou
- **CRÍTICO:** Pergunte ao usuário se ele deseja aplicar as alterações ao documento (y/n/outro) e PARE para aguardar a resposta.
- **CRÍTICO:** SOMENTE se "Sim" (Yes), aplique as alterações. Se "Não" (No), descarte sua memória das alterações propostas. Se houver qualquer outra resposta, tente ao máximo seguir as instruções dadas pelo usuário.
- **CRÍTICO:** Reapresente o mesmo prompt de 1-5, r, x para permitir elicitações adicionais

**Caso r (Reembaralhar):**

- Selecione 5 métodos aleatórios de `methods.csv`, apresente a nova lista com o mesmo formato de prompt
- Ao selecionar, tente pensar e escolher um conjunto diversificado de métodos abrangendo diferentes categorias e abordagens, sendo que 1 e 2 seriam potencialmente os mais úteis para o documento ou seção sendo descoberta

**Caso x (Prosseguir):**

- Conclua a elicitação e prossiga
- Retorne o conteúdo totalmente aprimorado de volta para `create-doc.md`
- O conteúdo aprimorado torna-se a versão final para essa seção
- Sinalize a conclusão de volta para `create-doc.md` para continuar com a próxima seção

**Caso a (Listar Tudo):**

- Liste todos os métodos com suas descrições do CSV em uma tabela compacta
- Permita que o usuário selecione qualquer método por nome ou número da lista completa
- Após a seleção, execute o método conforme descrito no Caso 1-5 acima

**Caso: Feedback Direto:**

- Aplique as alterações ao conteúdo da seção atual e reapresente as escolhas

**Caso: Múltiplos Números:**

- Execute os métodos em sequência no conteúdo e depois ofereça as escolhas novamente

---

### Etapa 3: Diretrizes de Execução

- **Execução do método:** Use a descrição do CSV para entender e aplicar cada método
- **Padrão de saída:** Use o padrão como um guia flexível (ex: "caminhos -> avaliação -> seleção")
- **Adaptação dinâmica:** Ajuste a complexidade com base nas necessidades do conteúdo (do simples ao sofisticado)
- **Aplicação criativa:** Interprete os métodos de forma flexível com base no contexto, mantendo a consistência do padrão
- Foco em insights acionáveis
- **Mantenha a relevância:** Vincule a elicitação ao conteúdo específico sendo analisado (a seção atual do documento sendo criado, a menos que o usuário indique o contrário)
- **Identifique personas:** Para métodos de persona única ou múltipla, identifique claramente os pontos de vista e use membros do "party" se já estiverem disponíveis na memória
- **Comportamento do loop crítico:** Sempre reapresente as opções 1-5, r, a, x após a execução de cada método
- Continue até que o usuário selecione 'x' para prosseguir com o conteúdo aprimorado, confirme ou pergunte ao usuário o que deve ser aceito da sessão
- Cada aplicação de método baseia-se em aprimoramentos anteriores
- **Preservação do conteúdo:** Rastreie todos os aprimoramentos feitos durante a elicitação
- **Aprimoramento iterativo:** Cada método selecionado (1-5) deve:
  1. Aplicar-se à versão aprimorada atual do conteúdo
  2. Mostrar as melhorias feitas
  3. Retornar ao prompt para elicitações adicionais ou conclusão
