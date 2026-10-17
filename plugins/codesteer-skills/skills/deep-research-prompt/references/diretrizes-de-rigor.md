# Diretrizes de Rigor e Densidade para Prompts de Pesquisa Aprofundada

Este documento consolida heurísticas de engenharia de prompt voltadas para a extração de conhecimento em profundidade (*Deep Research*). O **Arquiteto de Prompts de Pesquisa** utiliza essas diretrizes para compor a seção `[DIRETRIZES DE RIGOR & DENSIDADE INFORMATIVA]` e `[RESTRIÇÕES, ESCOPO & NEGATIVE PROMPTING]` do Prompt Mestre final.

---

## 1. Princípios da Pesquisa Profunda (Deep Research)

Modelos de linguagem tendem por padrão à generalização, síntese rasa e redundância estilística caso não sejam explicitamente restringidos. Para extrair relatórios investigativos de alto valor:

1. **Prioridade de Evidência Empírica:** Exigir métricas quantitativas, dados estatísticos, nomes de entidades reais, datas e fontes comprovadas em detrimento de generalizações.
2. **Razão Sinal-Ruído (Signal-to-Noise Ratio):** Cada sentença deve carregar um fato, uma correlação, uma restrição ou uma conclusão lógica sustentada. Eliminar preâmbulos vazios e floreios retóricos.
3. **Visão Não-Monolítica (Nuance e Contradições):** Prompts de pesquisa profunda devem instruir o modelo a evidenciar divergências entre especialistas, anomalias nos dados e incertezas ontológicas, evitando forçar consenso fictício.
4. **Análise de Causa-Raiz (First-Principles Thinking):** Estimular o modelo a decompor o problema em seus componentes fundamentais antes de discutir manifestações secundárias.

---

## 2. Negative Prompting Estruturado para Relatórios

Negative prompting em pesquisa impede que o modelo caia em padrões degenerativos clássicos:

| Padrão Degenerativo | Restrição de Negative Prompting |
|---|---|
| Frases de preenchimento ("No mundo dinâmico de hoje...") | Proibir categoricamente introduções clichês e transições óbvias. Ir direto ao ponto. |
| Adjetivação sem métrica ("Solução altamente eficiente") | Proibir adjetivos superlativos sem métrica associada (ex: latência em ms, ganho percentual). |
| Especulação disfarçada de fato ("Especialistas concordam que...") | Exigir citação de correntes teóricas, autores ou relatórios específicos quando fizer afirmações consensuais. |
| Alucinação de dados numéricos | Instruir: se o dado exato não for conhecido com certeza, expor o intervalo estimado ou declarar explicitamente a ausência do número exato. |
| Superficialidade tipo lista de tópicos | Proibir respostas compostas apenas por tópicos sem análise conectiva ou aprofundamento do racional. |

---

## 3. Calibração por Perfil de Público-Alvo

O público-alvo calibrado na Pergunta 2 dita parâmetros essenciais do prompt gerado:

- **Especialistas Técnicos / Engenheiros:** Foco em especificações, arquiteturas, trade-offs técnicos, limitações de hardware/software, benchmarks e código/pseudocódigo de referência.
- **Investidores & Executivos C-Level:** Foco em tamanho de mercado, modelos de negócio, estrutura de custos, barreiras de entrada (moats), risco de cauda e retorno sobre investimento (ROI).
- **Pesquisadores Acadêmicos:** Rigor metodológico, fundamentação epistemológica, literatura primária, hipóteses de pesquisa e lacunas no estado da arte.
- **Público Geral ou Tomadores de Decisão Não-Técnicos:** Uso de analogias precisas, minimização de jargões sem explicação prévia e foco nas implicações práticas no mundo real.

---

## 4. Cadeias de Raciocínio (Deep Reasoning Prompts)

Para maximizar a qualidade analítica no executor do prompt:
- Recomende a inserção de instruções de auto-questionamento ("Analise criticamente as premissas antes de concluir").
- Exija estruturação comparativa através de tabelas bidimensionais com critérios objetivos de avaliação.
- Force a formulação de contra-argumentos a cada tese principal apresentada no relatório.
