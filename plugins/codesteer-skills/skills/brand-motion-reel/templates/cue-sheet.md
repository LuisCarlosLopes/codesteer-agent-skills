# Cue sheet — contrato frame ↔ visual ↔ som

Preencha **uma linha por evento**. `frame` é absoluto (0 = primeiro frame do reel). `shake` em px (0 = sem shake). `sound` usa os nomes do `procedural-audio-cookbook.md`. Depois, exporte como `src/cues.ts`:

```ts
export type Cue = { frame: number; scene: string; visual: string; sound: string | null; shake: number; gain?: number };
export const cues: Cue[] = [ /* linhas abaixo */ ];
export const FPS = 60;
```

## Exemplo preenchido (24 s · 60 fps · mood suspense-cinematic)

| frame | t (s) | scene | visual | sound | shake |
|---:|---:|---|---|---|---:|
| 0 | 0.00 | 01-signal | ponto W nasce no centro | drone (start), clock (start) | 0 |
| 108 | 1.80 | 01-signal | início zoom-through 9× | whoosh | 0 |
| 120 | 2.00 | 02-warp | streaks aparecem | riser (start) | 0 |
| 170 | 2.83 | 02-warp | núcleo W começa a estourar | — | 0 |
| 180 | 3.00 | 03-title | **pico do flash / slam** | riser (stop), clock (stop), drone (stop), subBoom, heartbeat (start), hihat (start), pad (start) | 14 |
| 222 | 3.70 | 03-title | glitch único do chromatic split | tick | 0 |
| 290 | 4.83 | 03-title | início whip-pan | whoosh | 0 |
| 300 | 5.00 | 04-terminal | janela entra | — | 0 |
| 312–430 | 5.2–7.2 | 04-terminal | 1 caractere a cada 2 f (N = len(prompt)) | keyClick × N | 0 |
| 436 | 7.27 | 04-terminal | log 1 … log 4 (a cada 18 f) | tick × 4 | 0 |
| 466 | 7.77 | 04-terminal | "✓ shipped. in public." | blip | 0 |
| 470 | 7.83 | 04-terminal | início iris wipe | whoosh | 0 |
| 480 | 8.00 | 05-easing | dots largam | — | 0 |
| 520–556 | 8.7–9.3 | 05-easing | chegadas (6, escalonadas pela curva) | tick × 6 | 0 |
| 590 | 9.83 | 05-easing | início whip-pan vertical | whoosh | 0 |
| 600 | 10.00 | 06-network | camada 1 desenha | padHigh (start) | 0 |
| 680 | 11.33 | 06-network | caption entra | — | 0 |
| 738 | 12.30 | 06-network | início zoom-through | whoosh | 0 |
| 750 | 12.50 | 07-morph | círculo | padHigh (stop), blip (gain −8) | 0 |
| 786 | 13.10 | 07-morph | → triângulo | blip (gain −8) | 0 |
| 822 | 13.70 | 07-morph | → motivo | blip (gain −8) | 0 |
| 850 | 14.17 | 07-morph | logo real entra (HEAVY) | hit (gain −8) | 4 |
| 858 | 14.30 | 07-morph | início iris wipe | whoosh | 0 |
| 870 | 14.50 | 08-truchet | reveal radial | sweep (start) | 0 |
| 900–950 | 15.0–15.8 | 08-truchet | onda L→R | sweep | 0 |
| 960 | 16.00 | 09-torus | flash 8 f → torus | sweep (stop), hihat (stop), hit (gain −6) | 6 |
| 1038 | 17.30 | 09-torus | início zoom-through | whoosh | 0 |
| 1050 | 17.50 | 10-kinetic | PROMPT. | hit (gain 0) | 10 |
| 1072 | 17.87 | 10-kinetic | BUILD. | hit (gain +2) | 11 |
| 1094 | 18.23 | 10-kinetic | SHIP. | hit (gain +4) | 12 |
| 1116 | 18.60 | 10-kinetic | REPEAT. | hit (gain +6) | 14 |
| 1140 | 19.00 | 11-lock | partículas partem | heartbeat (stop), riserLong (start) | 0 |
| 1250 | 20.83 | 11-lock | **lock do logo + shockwave** | riserLong (stop), boomBig, shimmer | 14 |
| 1290 | 21.50 | 11-lock | logo desliza; título por light sweep | — | 0 |
| 1320 | 22.00 | 11-lock | tagline entra | pad (stop), resolve (start) | 0 |
| 1360 | 22.67 | 11-lock | footer entra | — | 0 |
| 1390 | 23.17 | 11-lock | início fade para navy | — (o master já faz fade nos últimos 2 s) | 0 |
| 1439 | 23.98 | 11-lock | último frame | — | 0 |

## Regras

- Toda transição tem **duas** linhas: início (whoosh) e pico (impacto, se houver).
- Todo `shake > 0` precisa de um som de impacto na mesma linha.
- A coluna `sound` é lida **ao pé da letra** pelo `synth-music.js`: tokens separados por vírgula, cada um `nome`, `nome (start)` ou `nome (stop)`, com nomes exatos do cookbook. Instrumento contínuo (`drone`, `clock`, `riser`, `riserLong`, `heartbeat`, `hihat`, `pad`, `padHigh`, `sweep`, `resolve`) exige `(start)` e normalmente `(stop)`; sem `(stop)` ele toca até o fim, e um riser sem stop sobe pelo reel inteiro. `(gain ±N)` na tabela vira o campo `gain` (dB) da cue, não o texto do `sound`.
- Linhas de faixa (`312–430`) são expandidas pelo script em eventos individuais a partir dos parâmetros da cena (`typingStep`, `logInterval`, etc.); mantenha a fonte da verdade na cena e referencie aqui.
- Ao mudar a duração de uma cena, **recalcule todos os frames seguintes** e re-rode o sintetizador. Nunca edite o WAV à mão.
