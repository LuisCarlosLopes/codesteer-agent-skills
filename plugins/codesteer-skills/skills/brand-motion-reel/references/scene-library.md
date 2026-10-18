# Biblioteca de cenas

Catálogo modular da skill `brand-motion-reel`. Cada cena é um componente `scenes/NN-nome.tsx` que recebe `brand`, `copy` e usa `useCurrentFrame()` relativo. Durações são para 60 fps e um reel de 24 s; escale proporcionalmente. Os cues sonoros nomeados aqui correspondem aos instrumentos do `procedural-audio-cookbook.md`.

Convenções de cor: **W** = branco, **I** = ice (`brand.ice`), **S** = secundário (`brand.secondary`), **N** = contraste/navy (`brand.contrast`).

---

## 1. Signal — nascimento do motivo

- **Duração**: 0–2 s (120 f). **Função**: tensão inicial, apresenta o motivo (sparkle) antes do logo.
- **Elementos**:
  - Ponto W no centro que entra com `BOUNCY` e vira o motivo do logo (sparkle de 4 pontas ou equivalente).
  - 16 raios W/I alternados partindo do centro, comprimento com `easeOutExpo` escalonado (`delay = i*2`), opacidade decaindo.
  - Anel de texto rotativo (`copy.orbitRing`) em `fonts.mono`, `<textPath>` num círculo de raio 260 px, rotação 0.15°/frame.
  - Lens flare horizontal W (linha com gradiente, `scaleX` 0→1 e opacidade 0.8→0).
  - Anel em expansão (`<circle>` stroke W, raio 0→620, opacidade 1→0).
- **Saída**: transição **zoom-through 9×** para dentro do sparkle (últimos 12 f).
- **Cues**: `drone` + `clock` desde f0; `whoosh` no início do zoom.
- **Parâmetros**: `rays` (16), `ringText`, `zoomFactor` (9).

## 2. Warp — hiperespaço

- **Duração**: 2–3 s (60 f). **Função**: aceleração e descarga em flash branco.
- **Elementos**: 260 streaks (W 60%, I 30%, N 10%) partindo de um ponto de fuga central, cada um com `z` que avança com `easeInExpo`; projeção perspectiva → `translate` + `scaleX` (comprimento) crescentes. Núcleo W radial que cresce de 40 px a tela inteira nos últimos 10 f.
- **Técnica**: um `<svg>` com `<line>`; blocos em `CameraMotionBlur samples=5`.
- **Saída**: **white flash** (pico no último frame = frame do slam).
- **Cues**: `riser` (ruído + sweep) ao longo da cena; `subBoom` no último frame.
- **Parâmetros**: `streaks` (260), `acceleration`.

## 3. Title slam — nome da marca

- **Duração**: 3–5 s (120 f). **Função**: identificar.
- **Elementos**:
  - `copy.title` em `fonts.headline` 230 px W, letras entram uma a uma (`delay = i*3`) com `SNAPPY` em `translateY` 80→0 e `skewX` 12°→0.
  - Chromatic split: duas cópias (N deslocada −6 px, I deslocada +6 px) que convergem em 14 f e **glitcham uma vez** (frame fixo, ±14 px por 2 f).
  - Light sweep: faixa W inclinada (`scaleX` fina, `translateX` −120%→120%) com `mix-blend-mode: screen`, mascarada ao texto.
  - Sparkle gigante (1.400 px) atrás, opacidade 0.08, rotação 0.05°/frame.
  - `copy.subtitle` em `fonts.tagline` abaixo, fade + rise com `easeOutExpo` após 40 f.
- **Saída**: **whip-pan** para o terminal.
- **Cues**: `subBoom` no f0 (herdado do warp), `heartbeat` + `hihat` + `pad` começam aqui; `whoosh` na saída. Shake 14 px no f0.

## 4. Prompt terminal — feito por IA, em público

- **Duração**: 5–8 s (180 f). **Função**: mostrar o processo (prompt → logs → shipped).
- **Elementos**:
  - Grid W em perspectiva ao fundo (linhas `<path>`, `translateY` contínuo em loop por módulo).
  - Janela N com borda 1 px I e glow W, flutuando em 3D: `rotateX(8°) rotateY(-6°)` + deriva `smoothNoise` 4 px.
  - Linha de prompt `copy.terminalPrompt` em `fonts.mono`, digitada a **1 caractere a cada 2 f**; cursor █ piscando (período 24 f).
  - `copy.terminalLogs[]` aparecendo a cada 18 f com prefixo `›` e tag de tempo.
  - Barra de progresso `████░░░░` que vai a 100% em 40 f (`scaleX`).
  - Fecho `copy.terminalDone` em 44 px W com `BOUNCY`.
- **Saída**: **iris wipe**.
- **Cues**: `keyClick` em cada caractere digitado (o script lê o comprimento do prompt e o passo de 2 f); `blip` no fecho; `whoosh` na saída.
- **Parâmetros**: `typingStep` (2 f), `logInterval` (18 f).

## 5. Easing study — método

- **Duração**: 8–10 s (120 f). **Função**: traduzir processo em movimento.
- **Elementos**:
  - Headline `copy.easingHeadline` em `fonts.tagline`.
  - 6 linhas: nome da curva (`linear`, `ease-in-out`, `expo-out`, `back-out`, `elastic`, `bounce`) + tag `copy.easingTags[i]` em `fonts.mono` + ícone da curva (`<path>` 40×24 desenhado pela função).
  - Dots W (ímpares) e N (pares) percorrendo a mesma distância (1.100 px) em 70 f, cada um com sua curva; trail esticado de 6 frames; ao chegar, anel W pop (`scale` 0.4→1.6, opacidade 1→0 em 14 f).
- **Saída**: **whip-pan** vertical.
- **Cues**: `tick` leve em cada chegada (6 eventos escalonados); `whoosh`.

## 6. Neural network — a tese

- **Duração**: 10–12.5 s (150 f). **Função**: a mensagem central.
- **Elementos**:
  - Camadas 3-6-8-6-3; nós `<circle>` W, arestas `<line>` W 20% opacidade; desenho camada a camada (`stroke-dashoffset`) com 14 f entre camadas.
  - Pulsos: 10 arestas destacadas com um ponto W viajando (`interpolate` ao longo da linha) e nó destino "disparando" (glow W `scale` 1→1.8→1).
  - Labels `copy.networkIn` à esquerda e `copy.networkOut` à direita em `fonts.mono`.
  - `copy.networkCaption` em `fonts.tagline` no terço inferior, fade-in após 80 f.
- **Saída**: **zoom-through** no nó de saída central.
- **Cues**: `pad` sobe uma oitava (swell); `tick` por disparo de nó (opcional, baixo); `whoosh`.

## 7. Morph — formas → logo

- **Duração**: 12.5–14.5 s (120 f). **Função**: síntese visual.
- **Elementos**:
  - Um `<path>` W com glow, 96 vértices em coordenadas polares; raio por ângulo interpolado entre círculo → triângulo → motivo (sparkle). Cada estágio 36 f com `easeInOutCubic`.
  - Órbita de 6 mini-formas W/I (mesma função, escala 0.12) em raio 300 px, rotação 0.6°/frame.
  - 2 anéis tracejados N (`stroke-dasharray 6 10`) contra-rotacionando.
  - No final, `<Img src={logo}>` entra com `HEAVY` e glow W enquanto o `<path>` faz fade.
- **Saída**: **iris wipe** aberto a partir do logo.
- **Cues**: `blip` suave em cada estágio; `whoosh`.
- **Parâmetros**: `stages` (círculo, triângulo, motivo), `vertices` (96).

## 8. Truchet — sistema

- **Duração**: 14.5–16 s (90 f). **Função**: padrão, repetição, identidade de sistema.
- **Elementos**:
  - Grade 24×14 de tiles 80 px; cada tile é um quarto-arco W (2 arcos opostos); orientação inicial `seeded(i) > .5`.
  - Reveal radial do centro: `scale` 0→1 por tile com `delay = dist(i)*1.2` f.
  - Onda da esquerda para a direita (f30–f80): ao passar, tile gira +90° (`rotate`) e troca para arcos N tracejados.
- **Saída**: **white flash** curto (8 f).
- **Cues**: `sweep` (filtro abrindo) acompanhando a onda; `hit` leve no flash.

## 9. Depth torus — respiro

- **Duração**: 16–17.5 s (90 f). **Função**: profundidade e calma antes do clímax.
- **Elementos**: ~1.100 pontos num torus (R=420, r=170), rotação em X e Y por frame (0.8°/0.5°), projeção perspectiva (`fov` 900): `scale` 0.4–1.4 e opacidade 0.2–1 por `z`; 8% dos pontos em N. Light spot W suave atrás.
- **Saída**: **zoom-through** no centro do torus.
- **Cues**: `pad` sustenta; `hihat` some (respiro); `whoosh`.

## 10. Kinetic type — mantra

- **Duração**: 17.5–19 s (90 f). **Função**: ritmo, memorização.
- **Elementos**:
  - `copy.kineticWords` (3–5 palavras, ponto final sempre em N) em `fonts.headline` 260 px W; uma palavra a cada **22 f**.
  - Letras entram com `SNAPPY` + `CameraMotionBlur`; 2 cópias outline (stroke W 2 px, sem fill) empilhadas acima e abaixo (`translateY` ±280) com `delay` de 2 f.
  - Palavra anterior sai em 6 f por `scale` 1→1.15 + opacidade 1→0.
- **Saída**: **white flash** na última palavra.
- **Cues**: `hit` crescente em cada palavra (ganho +2 dB por palavra); shake 10, 11, 12, 14 px.

## 11. Particle logo lock — clímax e CTA

- **Duração**: 19–24 s (300 f). **Função**: lock do logo, nome, tagline, CTA, fade.
- **Elementos**:
  - f0–f110: 1.400 partículas W partindo de posições `seeded` fora do frame, convergindo para `logo-points.json` com `easeOutExpo` + leve espiral (ângulo decresce com o progresso); trails curtos.
  - f110: **lock** — `<Img logo>` nítido aparece, partículas fazem fade em 8 f; glow W pulsa (`scale` 1→1.3→1, 20 f); shockwave (anel W, raio 0→900, opacidade 1→0, 30 f).
  - f140–f180: logo desliza para a esquerda (`translateX` −380, `HEAVY`); `copy.title` entra à direita por **light sweep** (máscara `translateX`); depois `brand.tagline` em `fonts.tagline` (fade + rise).
  - f220: `copy.footer` em `fonts.mono` 22 px na base, dentro da safe margin.
  - f250–f300: fade para `brand.contrast` (overlay opacidade 0→1, `easeInOutCubic`).
- **Cues**: `riserLong` f0–f110; `boomBig` + `shimmer` no f110 (shake 14 px); `pad` resolve em acorde maior a partir de f180; fade de master até f300.

---

## Montagem em `Reel.tsx`

```tsx
const S = [ /* {id, Comp, from, durationInFrames, transitionOut: {kind, frames}} derivado de cues.ts */ ];
<AbsoluteFill>
  <LivingBackground />
  <CameraShakeWrapper cues={cues}>
    {S.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames + s.transitionOut.frames}>
        <s.Comp />
      </Sequence>
    ))}
    <TransitionLayer scenes={S} />
  </CameraShakeWrapper>
  {hud.enabled && <GlobalHud scenes={S} />}
  <Finish />   {/* grain + vignette + scanlines */}
  <Audio src={staticFile('music.wav')} />
</AbsoluteFill>
```

## Adaptação por mood

| Mood | Remover | Ajustar |
|---|---|---|
| `suspense-cinematic` (default) | — | Como acima |
| `upbeat` | 1 (Signal) | Começa no Warp com flash; BPM 128; hits mais curtos |
| `minimal` | 2, 8, 9 | Transições só iris/fade; sem shake; pad limpo |
| `lofi` | 2, 10 | Grain 8%; BPM 85; sem shockwave |

## Cena nova

Se o usuário pedir uma cena fora do catálogo, defina: função narrativa, duração, elementos (só `transform`/`opacity`), transição de saída e cues, e registre-a aqui no mesmo formato antes de codar.
