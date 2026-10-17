# Rubrica detalhada

Cada critério é pontuado de 0 a 10 e multiplicado pelo peso. A nota final é a
soma ponderada com uma casa decimal. As âncoras abaixo existem para que duas
avaliações do mesmo prompt cheguem à mesma faixa.

## Âncoras gerais por faixa

| Faixa | Significado |
|---|---|
| 9–10 | Nada a corrigir neste critério; um revisor sênior não mudaria nada. |
| 7–8 | Atende; lacuna pontual que raramente causa falha. |
| 5–6 | Atende parcialmente; funciona na maioria dos casos por boa vontade do modelo. |
| 3–4 | Lacuna que causa falha frequente ou saída imprevisível. |
| 0–2 | Critério ausente ou contraditório. |

## 1. Clareza semântica (20%)

Pergunta: uma leitura literal do prompt leva a uma única interpretação?

- Penalize: termos polissêmicos sem definição ("resumo curto", "tom
  profissional", "melhore isto"), instruções contraditórias entre seções,
  pronomes sem referente, listas numeradas com itens vazios ou truncados.
- Pontue alto: verbos de ação concretos, quantidades explícitas, definição dos
  termos que o modelo poderia interpretar de várias formas.
- Prompt com erro de estrutura visível (item "7." vazio, seção duplicada) cai
  pelo menos para a faixa 5–6.

## 2. Contextualização (15%)

Pergunta: quem fala (persona), para quem (público) e em que situação?

- Persona: papel + nível de senioridade + domínio. "Você é um assistente" não
  pontua; "Você é um engenheiro de prompt sênior especializado em revisão"
  pontua.
- Público: quem consome a saída e o que já sabe. Ausência de público custa 3–4
  pontos neste critério mesmo com persona forte.
- Situação: canal, etapa do fluxo, o que aconteceu antes. Opcional em prompts
  de tarefa única; obrigatório em system prompts de agente.

## 3. Restrições (15%)

Pergunta: está claro o que fazer e o que **não** fazer?

- Conta: limites de tamanho, tom, idioma, escopo, proibições explícitas
  (negative prompting), regras de parada, o que fazer quando faltar informação.
- Não conta: restrições que o modelo não consegue verificar ("seja criativo",
  "seja o melhor possível").
- Restrição sem critério de verificação ("seja criterioso") vale metade de uma
  restrição operacional ("notas acima de 9 exigem X, Y e Z").

## 4. Formatação de saída (15%)

Pergunta: a estrutura da resposta está especificada a ponto de ser parseável
ou comparável entre execuções?

- Pontue alto: template literal, campos nomeados, ordem fixa, tipo de cada
  campo (número com uma casa decimal, lista de bullets, bloco de código).
- Pontue médio: formato descrito em prosa ("responda com uma lista").
- Pontue baixo: nada, ou formato especificado em um lugar e contradito por um
  exemplo em outro.
- Se o prompt traz exemplo de saída, verifique se o exemplo **respeita** o
  template; divergência entre template e exemplo custa 2–3 pontos.

## 5. Robustez (20%)

Pergunta: o prompt resiste a alucinação, ambiguidade e injeção?

- Alucinação: há instrução para não inventar dados? Há fallback para "não há
  informação suficiente"? A tarefa depende de dados que o prompt não fornece?
- Injeção: se o prompt processa texto de terceiros (documentos, prompts de
  outros usuários, páginas web), ele declara que esse texto é dado e não
  instrução? Usa delimitadores para separar instrução de conteúdo?
- Deriva: há regra de parada que impede o modelo de avançar com entendimento
  parcial? Há limite para quantas perguntas fazer antes de agir?
- Prompt que processa entrada de terceiros **sem** tratar injeção não passa de
  6 neste critério.

## 6. Exemplificação (15%)

Pergunta: há exemplos quando a tarefa exige padrão complexo?

- Primeiro classifique a tarefa: **simples** (classificação binária, tradução
  curta, resposta factual) ou **complexa** (formato multi-campo, estilo
  específico, raciocínio em etapas, saída que será parseada).
- Tarefa simples sem exemplo: 7–8 (não penalize por ausência).
- Tarefa complexa sem exemplo: no máximo 4.
- Exemplo presente: verifique qualidade. Exemplo que contradiz o template,
  mostra só o caso feliz, ou é tão curto que não ilustra o padrão vale 5–6.
- Exemplos múltiplos cobrindo caso típico + caso limite: 9–10.

## Cálculo

```
nota = 0.20*clareza + 0.15*contexto + 0.15*restricoes
     + 0.15*formato + 0.20*robustez + 0.15*exemplos
```

Arredonde para uma casa decimal. Se o resultado ficar entre 8,9 e 9,1,
reavalie: nota ≥ 9 exige que **nenhum** critério esteja abaixo de 8.

## Ajustes que não estão na soma

Aplique no máximo um, e declare no relatório quando aplicar:

- **−1,0** se o prompt contém uma contradição que torna impossível obedecer a
  todas as instruções ao mesmo tempo.
- **−0,5** se o prompt tem erro estrutural visível (item vazio, seção
  duplicada, exemplo que não segue o template) — sinal de que não foi revisado.
- Nenhum bônus. Excelência já cabe dentro da escala.
