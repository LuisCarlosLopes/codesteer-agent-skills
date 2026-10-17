# O Sistema Stanislavski Aplicado à Engenharia de Personas de IA

O **Sistema Stanislavski** (*Method Acting*) fornece o alicerce psicológico para que uma persona de Inteligência Artificial não sofra de superficialidade, quebra de personagem (*persona drift*) ou respostas robóticas genéricas.

Ao invés de programar apenas o que a IA *deve responder*, o método define *quem a IA é*, suas tensões internas, sua cosmovisão e sua memória operacional.

---

## Os 5 Pilares Teatrais Aplicados a Prompts de Sistema

### 1. O Super-Objetivo (*Super-Objective*)
Toda persona autêntica possui uma força motriz central que unifica todas as suas ações, independente da pergunta imediata do usuário.
- **Pergunta norteadora:** *"O que esta entidade deseja alcançar no mundo a longo prazo através de cada resposta?"*
- **Exemplo fraco:** "Ajudar o usuário a escrever código."
- **Super-Objetivo Stanislavski:** "Erradicar dívida técnica e bugs de concorrência antes que cheguem a produção, capacitando o desenvolvedor a pensar em sistemas distribuídos resilientes."

### 2. O "Se Mágico" (*The Magic If*)
O mecanismo que coloca a persona na realidade imaginada como se fosse absoluta verdade empírica.
- Em LLMs, o *Magic If* condiciona o modelo a raciocinar a partir das restrições e realidades do papel, sem recorrer a desculpas ou avisos genéricos de IA (como "Como um modelo de linguagem...").
- A persona assume a responsabilidade epistêmica integral de seu ofício.

### 3. Circunstâncias Dadas (*Given Circumstances*)
O ecossistema em que a persona opera.
- Qual é o contexto de mercado, pressão temporal, limitações de recursos e cenário em que a persona vive?
- Exemplo: Um líder técnico em uma startup pré-Série A tem postura e prioridades drasticamente distintas de um engenheiro sênior em infraestrutura bancária legada. As circunstâncias dadas moldam o pragmatismo e as escolhas de trade-offs.

### 4. Memória Emocional e Cicatrizes de Repertório (*Emotional Memory*)
Personas tridimensionais possuem vivências tácitas que sustentam suas opiniões contundentes.
- Defina no prompt as "cicatrizes" profissionais da persona:
  - *"Você já viu sistemas caírem por falta de circuit breakers, por isso desconfia de chamadas síncronas entre microsserviços."*
  - *"Você acompanhou dezenas de pacientes abandonarem dietas restritivas, logo você tem aversão a planos alimentares punitivos."*
- Isso gera consistência natural de tom e fundamentação orgânica para recomendações.

### 5. Vieses Axiológicos e Idiossincrasias (*Point of View*)
Especialistas reais não são neutros ou mornos; eles têm perspectivas lapidadas por anos de prática:
- Quais métodos a persona privilegia?
- O que ela considera armadilha comum ou amadorismo?
- Quais metáforas ou padrões retóricos surgem espontaneamente em seu discurso?

---

## Matriz Anti-Drift: Garantindo Consistência Comportamental

| Dimensão | Persona Bidimensional (Comum) | Persona Tridimensional (Stanislavski) |
| :--- | :--- | :--- |
| **Identidade** | Papel funcional estático ("Sou seu assistente de dieta"). | Identidade viva com propósito, histórico e ética clara ("Nutricionista Comportamental focado em adesão sustentável"). |
| **Reação a Erros do Usuário** | Correção fria ou condescendente. | Empatia informada por vivência prática e redirecionamento estratégico. |
| **Resistência a Pressão** | Cede facilmente à insistência do usuário. | Mantém seus princípios inegociáveis com firmeza didática e respeito. |
| **Profundidade de Resposta** | Responde ao pé da letra o que foi perguntado. | Antecipa os efeitos colaterais e a próxima barreira que o usuário enfrentará. |
