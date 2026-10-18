# Cookbook de áudio procedural (Node → WAV)

A trilha é sintetizada por `scripts/synth-music.js` sem nenhum sample externo. Parta de `templates/synth-music.js`. Tudo é renderizado offline num `Float32Array` estéreo a 44.1 kHz e escrito como WAV PCM 16-bit.

## Princípios

1. **A cue sheet manda.** O script lê `cues.ts` (exporte também um `cues.json` em build) e posiciona cada evento em `sample = Math.round(frame / fps * 44100)`. Nada é posicionado "a olho".
2. **Determinístico.** Ruído branco vem de um PRNG com seed fixa (xorshift), nunca de `Math.random`.
3. **Mix por camadas.** Cada instrumento escreve num buffer próprio com ganho nominal; o master soma, aplica limiter e normaliza. Facilita silenciar camadas no QA.
4. **Sem clipping.** Limiter em −1 dBTP e alvo de ~−14 LUFS integrado (aproximação: RMS ponderado; veja "Master").

## Blocos básicos

```js
// osciladores
const sine = (t, f) => Math.sin(2 * Math.PI * f * t);
const saw  = (t, f) => 2 * ((t * f) % 1) - 1;
const tri  = (t, f) => 1 - 4 * Math.abs(Math.round(t * f) - t * f);
// envelope ADSR em segundos, retorna ganho [0,1] para o tempo relativo r
const adsr = (r, a, d, s, rel, len) =>
  r < 0 ? 0 : r < a ? r / a : r < a + d ? 1 - (1 - s) * ((r - a) / d) : r < len - rel ? s : r < len ? s * (1 - (r - (len - rel)) / rel) : 0;
// filtro passa-baixa de 1 polo (estado por canal)
const lowpass = () => { let y = 0; return (x, cutoff, sr) => { const a = 1 - Math.exp(-2 * Math.PI * cutoff / sr); y += a * (x - y); return y; }; };
// PRNG determinístico
const rng = (seed) => () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; };
```

## Instrumentos (nome da cue → síntese)

| Cue | Síntese | Duração | Ganho nominal |
|---|---|---|---|
| `drone` | 2 osciladores (sine + saw) em 55 Hz detunados ±0.6 Hz, lowpass com cutoff oscilando 120→400 Hz por LFO de 0.08 Hz; leve saturação `tanh` | contínuo | −18 dB |
| `clock` | Click: ruído 4 ms com decay exponencial + sine 2.2 kHz 6 ms; a cada 0.5 s | até o warp | −26 dB |
| `riser` | Ruído branco com lowpass cutoff 300→9.000 Hz exponencial + sine com pitch 110→880 Hz; ganho crescente `r^2` | 1.0 s antes do slam | −14 dB |
| `subBoom` | Sine com pitch 90→38 Hz em 250 ms, decay 1.2 s; camada de ruído 60 ms no ataque | 1.4 s | −6 dB |
| `heartbeat` | Dois pulsos de sine 50 Hz (decay 180 ms) separados por 140 ms, repetidos a cada batida de `bpm` | 3–19 s | −12 dB |
| `hihat` | Ruído highpass (subtraia lowpass 6 kHz do ruído), decay 40 ms, em colcheias; acento a cada 4 | 3–16 s | −24 dB |
| `pad` | 3 sines em acorde menor (ex.: A3-C4-E4) uma oitava acima com vibrato 5.5 Hz ±6 cents e tremolo lento; attack 1.5 s | 3–22 s | −22 dB |
| `padHigh` | Swell do `pad` uma oitava acima, attack 0.8 s (cena da tese) | janela da cena | −26 dB |
| `whoosh` | Ruído com bandpass (lowpass 1 kHz→6 kHz→1 kHz em 0.35 s), envelope senoidal; pan L→R ou R→L alternado | 0.35 s | −16 dB |
| `keyClick` | Ruído 3 ms + sine 1.8 kHz 4 ms, pitch variando ±8% por `seeded(i)` | 10 ms | −24 dB |
| `blip` | Sine 880→1.320 Hz em 60 ms + harmônico 2×, decay 220 ms | 0.3 s | −14 dB |
| `tick` | Sine 3 kHz 5 ms | 10 ms | −28 dB |
| `hit` | `subBoom` curto (decay 0.5 s) + ruído 30 ms + sine 220 Hz 80 ms; ganho = base + índice × 2 dB | 0.6 s | −10 dB |
| `sweep` | Ruído com lowpass abrindo 200→5.000 Hz ao longo da onda | duração da cena | −24 dB |
| `riserLong` | Igual a `riser`, 3 s, com `heartbeat` acelerando 120→160 BPM | 3 s | −14 dB |
| `boomBig` | `subBoom` ×1.5 em duração + segunda camada em 55 Hz; decay 2.4 s | 2.6 s | −4 dB |
| `shimmer` | 12 sines em série harmônica de 1.760 Hz com decays 0.6–2.0 s, pan aleatório `seeded` | 2 s | −20 dB |
| `resolve` | Acorde maior (ex.: A3-C#4-E4-A4) em sines com attack 0.8 s, sustain até o fim, fade 2 s | 22–24 s | −16 dB |

Ajustes por mood: `upbeat` → `heartbeat` vira kick (sine 60 Hz decay 90 ms) + `hihat` em semicolcheias; `minimal` → sem `hihat`, `pad` sem vibrato, `hit` em −16 dB; `lofi` → lowpass global 8 kHz + ruído de vinil (`rng` com lowpass 2 kHz a −36 dB).

## Estrutura da trilha (default 24 s, `suspense-cinematic`)

| Janela | Camadas |
|---|---|
| 0–3 s | `drone` + `clock` |
| 2–3 s | `riser` → `subBoom` exatamente no frame do title slam |
| 3–19 s | `heartbeat` (bpm) + `hihat` + `pad`; `whoosh` em toda transição |
| Terminal | `keyClick` por caractere (`typingStep` da cena) + `blip` no `terminalDone` |
| Easing / network | `tick` por chegada/disparo |
| Kinetic type | `hit` crescente por palavra |
| 19–22 s | `riserLong` → `boomBig` + `shimmer` no lock |
| 22–24 s | `resolve`; master fade-out em 2 s |

Para outras durações, escale as janelas com a timeline; os eventos pontuais já vêm da cue sheet.

## Master

```js
// 1. soma das camadas
// 2. loudness aproximada: RMS em janelas de 400 ms com filtro K simplificado (highpass 60 Hz + shelf +4 dB > 2 kHz)
//    LUFS ≈ -0.691 + 10*log10(meanSquare). Calcule o ganho g para o alvo pré-limiter (~-12.8; o limiter tira ~1 dB).
// 3. limiter de redução de ganho: ganho necessário por sample = CEIL/|x| (CEIL = -2 dBFS), mínimo deslizante
//    em 5 ms de lookahead, ataque instantâneo e release de 80 ms
// 4. aplique g × ganho do limiter; clamp em ±CEIL; 5. fade-out dos últimos 2 s (curva cos)
```

**Não use `tanh`/soft-clip no master.** O waveshaping cria harmônicos acima do sample peak: com teto em 0.89 o
true peak medido chega a +2 dBTP. Teto de −2 dBFS no limiter mantém o true peak abaixo de −1 dBTP.

Se não quiser implementar o medidor, use o `ffmpeg -i music.wav -af loudnorm=print_format=summary -f null -` no QA e ajuste o ganho global do script até ficar entre −15 e −13 LUFS.

## Escrita do WAV

Cabeçalho RIFF/WAVE PCM 16-bit, 2 canais, 44.100 Hz; converta `Float32` para `Int16` com `Math.round(x * 32767)`. Escreva em `public/music.wav`. O template já traz `writeWav(path, left, right, sampleRate)`.

## Sincronia com a imagem

- Impactos (`subBoom`, `hit`, `boomBig`) têm ataque de 0 ms: o pico de energia está no sample inicial. Isso coincide com o frame onde o elemento visual está no ponto máximo (último frame da transição/flash).
- Whooshes começam **no primeiro frame** da transição e duram a transição inteira.
- Um ouvido humano percebe dessincronia acima de ~2 frames a 60 fps (33 ms). Não arredonde frames para segundos.

## QA sonoro

1. `node scripts/synth-music.js --solo=hit` (ou qualquer cue) para checar cada camada isoladamente.
2. Render de preview em 0.5× e escute com os stills da cue sheet abertos.
3. `ffmpeg … loudnorm` para loudness e `ffmpeg -af astats` para pico.
