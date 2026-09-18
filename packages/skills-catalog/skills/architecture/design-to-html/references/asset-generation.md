# Geração de assets (etapas 2, 3 e 4)

Leia este runbook só quando a etapa atual precisar de imagem gerada a partir da `reference`. O gate continua sendo o da etapa — não peça aprovação por arquivo.

## Quando gerar o quê

| Função | Etapa | Destino típico |
|--------|-------|----------------|
| Fundo da tela | 2 | `assets/` + CSS (`background-image` e/ou camadas) |
| Fundo de componente | 3 | junto da superfície do componente |
| Ícone, avatar, imagem de conteúdo | 4 | `<img src="assets/{id}.png">` |

Não regenere um fundo já aprovado só para cumprir a etapa 4.

Para fundo gerado a partir do mock: peça só a arte de fundo, sem textos, cards ou controles sobrepostos.

## Procedimento

1. Recorte todos os crops da etapa **antes** de gerar qualquer asset → `assets/crops/{id}.png`.
2. Separe lotes: assets sem dependência entre si e com arquivos de destino distintos vão no mesmo lote. Um asset que depende de imagem recém-gerada, ou de composição ainda não aprovada, fica no lote seguinte.
3. Regenere o lote com **GPT Image 2** via OpenRouter (`gpt2`), em paralelo. Ícones e camadas recortadas: PNG com **fundo transparente**. Fundo completo: preserve o fundo necessário. Adapte o prompt à arte (foto, textura, 3D); não imponha estilo flat a todo asset.
4. Depois que o lote terminar, encaixe cada resultado (`<img src="assets/{id}.png">` ou `background-image`) e compare com a referência.
5. Falha: prepare só os afetados para um lote novo, com prompt ajustado. Não regenere os que já passaram.
6. Avalie os assets na composição da etapa. Sem gate extra por arquivo.

## Como disparar a geração

Prefira o gerador da skill `openrouter-img` se ela estiver instalada no ambiente. Um comando por asset; lote independente em segundo plano + `wait` antes de encaixar. Um único asset: o mesmo comando, sem `&` / `wait`. Ajuste `--aspect-ratio` ao crop ou à camada de destino.

```bash
uv run <openrouter-img>/scripts/generate_image.py \
  --prompt "Recreate this UI icon/asset exactly. Transparent background. No extra padding, no mockup frame." \
  --input-image .memory-bank/design/{slug}/assets/crops/{id}.png \
  --filename .memory-bank/design/{slug}/assets/{id}.png \
  --model gpt2 --resolution 1K --aspect-ratio 1:1
```

`<openrouter-img>` é o path da skill no ambiente (ex.: `~/.agents/skills/openrouter-img`). Use o cwd do repo de skills ou paths absolutos. Requer `OPENROUTER_API_KEY` (`.env` do projeto ou `~/.env`).

Se `openrouter-img` não existir, use outra API de image-edit equivalente: crop + prompt → PNG no path de destino, mesma regra de lote/paralelo.
