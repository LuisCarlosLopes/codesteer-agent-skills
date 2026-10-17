# Consistência de talento entre clipes

O erro mais comum em vídeos gerados por IA com apresentador é o talento **mudar de rosto, roupa ou idade** entre cenas. A defesa é uma **Descrição Base** fixa, colada literalmente em todos os prompts.

## Como redigir a Descrição Base

Cubra, nesta ordem, em uma única frase longa em inglês:

| Campo | Exemplo | Por quê |
|---|---|---|
| Gênero e faixa etária aparente | `a charismatic man in his early 30s` | Evita envelhecer/rejuvenescer entre clipes |
| Etnia / tom de pele (se relevante ao roteiro) | `light-brown skin` | Modelos variam muito sem isso |
| Cabelo (corte, cor, comprimento) | `short dark hair, neatly combed` | Um dos atributos que mais deriva |
| Rosto (traços marcantes, barba, óculos) | `clean-shaven, thin black-rimmed glasses` | Âncoras de identidade |
| Roupa completa, inclusive cor | `light-blue dress shirt with sleeves rolled up, no tie` | Roupa é o que mais muda sem especificar |
| Postura e energia | `confident, didactic, warm smile` | Mantém a persona |

Resultado:

```text
a charismatic man in his early 30s, light-brown skin, short dark neatly combed hair, clean-shaven, thin black-rimmed glasses, light-blue dress shirt with sleeves rolled up, no tie, confident and didactic with a warm smile
```

## Regras de uso

1. **Literal, sempre.** Nunca abrevie para "the presenter" ou "the same man". O modelo não tem memória entre gerações.
2. **Descrição Base + ação + expressão.** A Descrição Base define *quem*; cada prompt acrescenta *o que faz* e *o que sente* naquela cena.
3. **Um cenário-âncora.** Fixe também o cenário do A-roll (ex.: `modern office with a bookshelf and a plant on the left`) e reutilize-o; mude de cenário só quando o roteiro pedir.
4. **Frame-âncora com Imagen 3.** Se o pipeline permitir imagem de referência, gere primeiro um retrato do talento com a Descrição Base no Imagen 3 e use-o como referência visual dos clipes Veo.
5. **Múltiplos talentos.** Dê a cada um uma Descrição Base com nome interno (`TALENT_A`, `TALENT_B`) e cores de roupa contrastantes, para o editor e o modelo não confundirem.
6. **Pessoas reais.** Não tente reproduzir rosto de pessoa identificável; descreva um talento genérico com atributos semelhantes.

## Checklist da Fase 4 para talento

- [ ] Toda linha da tabela com A-roll contém a Descrição Base completa.
- [ ] Roupa e cabelo idênticos em todas as linhas.
- [ ] Cenário-âncora idêntico em todas as linhas de A-roll do mesmo bloco.
- [ ] Nenhum prompt usa "the presenter", "he/she again", "same as before".
