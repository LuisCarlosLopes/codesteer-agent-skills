# Psicologia do Clique para Thumbnails

Manual de apoio da skill `viral-thumbnail`. Consulte ao dissecar o título (Passo 1) e ao escolher cores e layout (Passo 4).

## 1. Gatilhos de clique

| Gatilho | Sinal no título | Como traduzir em imagem |
|---|---|---|
| Promessa de resultado | "Ganhei", "Transformei", "Consegui" | Objeto do resultado em destaque com glow; rosto em euforia |
| Risco / perigo | "Quase morri", "Proibido", "Não faça" | Rosto em medo; elemento ameaçador ampliado; círculo vermelho |
| Contraste absurdo | "R$1 vs R$10.000", "Menor vs Maior" | Split vertical da imagem, dois extremos lado a lado |
| Número / prazo | "24 horas", "100 dias", "1.000.000" | Número como texto de 1 a 3 palavras, amarelo com contorno preto |
| Mistério / segredo | "Ninguém sabe", "Escondido", "A verdade" | Objeto parcialmente coberto ou borrado + seta vermelha |
| Reação / julgamento | "Testei", "Avaliei", "Reagindo" | Rosto em confusão extrema olhando para o objeto |
| Autoridade quebrada | "Especialista errou", "Mito" | Símbolo com X vermelho ou riscado |

## 2. Lacuna de curiosidade (Curiosity Gap)

A thumbnail funciona quando abre uma pergunta e **não a responde**:

- Mostre o **durante**, não o depois. "Abrindo a caixa" vence "caixa aberta".
- Aponte para algo que o espectador não consegue identificar sozinho.
- Combine imagem e título de forma complementar, nunca redundante: título dá o contexto, imagem dá a tensão.
- Uma promessa visual forte exige entrega no vídeo. Clickbait sem entrega reduz retenção e o algoritmo pune.

## 3. Hierarquia visual em milissegundos

Ordem em que o olho lê uma thumbnail pequena:

1. Rosto humano (especialmente olhos e boca).
2. Cor mais saturada ou maior contraste.
3. Seta/círculo vermelho.
4. Texto grande.
5. Todo o resto (deve ser mínimo).

Se o rosto estiver pequeno ou escuro, o item 1 falha e toda a hierarquia cai.

## 4. Paletas por nicho

| Nicho | Fundo | Acento | Texto |
|---|---|---|---|
| Desafio / vlog | Azul elétrico ou laranja | Amarelo | Branco com contorno preto |
| Finanças / dinheiro | Verde escuro saturado | Dourado / amarelo | Amarelo com contorno preto |
| Tech / gadgets | Roxo ou ciano | Magenta / laranja | Branco |
| Drama / fofoca | Vermelho profundo | Branco | Amarelo |
| Educação / explicação | Azul-marinho | Laranja | Branco |
| Terror / mistério | Preto com vinheta | Vermelho | Vermelho ou branco |

Regra geral: fundo e sujeito em cores complementares; acento em amarelo ou vermelho para seta e texto.

## 5. Expressões por emoção

Descreva sempre no prompt com estas palavras-chave (em inglês):

- **Choque:** "wide open eyes, jaw dropped, hands on cheeks, eyebrows raised"
- **Euforia:** "huge open-mouth smile, eyes wide, fists clenched in celebration"
- **Medo:** "terrified expression, eyes wide, mouth open in a scream, leaning back"
- **Confusão:** "one eyebrow raised, mouth slightly open, squinting, head tilted, pointing"
- **Nojo / rejeição:** "grimacing, nose wrinkled, pulling away, hand up"

## 6. Dicas por gerador

- **Gemini / Imagen:** aceita prompts longos em linguagem natural. Descreva a cena como um parágrafo, coloque texto entre aspas ("the text 'DEU ERRADO' in bold yellow Impact font with black outline"). Imagen 3 renderiza texto curto com boa precisão.
- **Midjourney:** use `--ar 16:9` ou `--ar 9:16`, `--stylize 250` para pop visual; texto é pouco confiável, prefira adicionar depois em editor.
- **Flux:** bom com texto curto; reforce "sharp edges, vector-like red arrow" para evitar setas deformadas.
- Para preservar a identidade do criador com foto real: use referência de imagem (image-to-image / character reference) e peça apenas a troca de expressão, iluminação e fundo.

## 7. Dimensões

| Plataforma | Proporção | Resolução sugerida |
|---|---|---|
| YouTube | 16:9 | 1280x720 (mín.), 1920x1080 |
| Shorts / TikTok / Reels | 9:16 | 1080x1920 |
| Capa Instagram feed | 1:1 ou 4:5 | 1080x1080 / 1080x1350 |

Área segura: mantenha texto e seta longe do canto inferior direito no YouTube (sobreposição da duração do vídeo).
