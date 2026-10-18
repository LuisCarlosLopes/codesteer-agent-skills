# Regras de suavidade no Remotion (sem lag, sem stutter)

Este manual é a referência técnica da skill `brand-motion-reel`. Cada regra existe para garantir dois resultados: render determinístico (todo frame idêntico em qualquer máquina) e playback fluido a 60 fps.

## 1. Determinismo por frame

- A única fonte de tempo é `useCurrentFrame()` (e `useVideoConfig()` para `fps`, `width`, `height`, `durationInFrames`).
- Proibido: `Math.random`, `Date.now`, `performance.now`, `useState`/`useEffect` para animar, `requestAnimationFrame`, bibliotecas que animam por tempo real (GSAP, Framer Motion em modo autônomo).
- Aleatoriedade controlada: hash determinístico por índice.

```ts
// lib/noise.ts
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s); // [0,1)
};
export const seeded = (i: number, salt = 0) => hash(i * 0.618 + salt * 7.13);

// ruído suave 1D (soma de senos lentos) — usar em shake, deriva do light spot, vibrato
export const smoothNoise = (t: number, seed = 0) =>
  (Math.sin(t * 1.3 + seed) + Math.sin(t * 2.9 + seed * 1.7) * 0.5 + Math.sin(t * 0.7 + seed * 2.3) * 0.25) / 1.75;
```

- Dentro de um `<Sequence from={start}>`, `useCurrentFrame()` já é relativo ao início da cena. Use isso para que cada cena seja autocontida.

## 2. Só `transform` e `opacity`

- Anime `translate`, `scale`, `rotate`, `skew` e `opacity`. Isso roda no compositor e evita reflow.
- Nunca anime `width`, `height`, `top`, `left`, `margin`, `font-size`, `border-radius`, `box-shadow` ou `filter`.
- Para "crescer" uma barra de progresso, use `transform: scaleX()` com `transform-origin: left`.
- Para texto que "preenche", use um container com `overflow: hidden` e translade o conteúdo.

## 3. Glows sem `filter: blur()`

- `filter: blur()` em dezenas de elementos quebra o frame budget. Use no máximo 3–5 elementos com blur por cena, e prefira:
  - `drop-shadow(0 0 24px rgba(255,255,255,.55))` em um único wrapper.
  - Radial gradients pré-desfocados: `radial-gradient(circle, rgba(255,255,255,.6) 0%, rgba(255,255,255,0) 60%)`.
  - Camadas empilhadas: 3 `<div>` com gradientes de raio crescente e opacidade decrescente simulam bloom.
- Em fundo saturado (azul da marca, por exemplo) o glow é **branco ou ice**; um glow da mesma cor do fundo some.

## 4. Fundo vivo (living gradient)

```tsx
// layers/LivingBackground.tsx
const t = frame / fps;
const x = 50 + smoothNoise(t * 0.25, 1) * 14;  // % — deriva lenta
const y = 50 + smoothNoise(t * 0.21, 2) * 10;
return (
  <AbsoluteFill style={{ background: brand.primaryColor }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x}% ${y}%, ${brand.bgGlow} 0%, ${brand.primaryColor} 45%, ${brand.bgEdge} 100%)` }} />
  </AbsoluteFill>
);
```

Animar a posição do gradiente via string é aceitável aqui porque é **um** elemento full-screen.

## 5. Motion blur real

Instale `@remotion/motion-blur`. Envolva apenas os blocos rápidos:

```tsx
import { CameraMotionBlur } from '@remotion/motion-blur';
<CameraMotionBlur shutterAngle={180} samples={5}>
  <WarpStreaks />
</CameraMotionBlur>
```

- `samples={5}` é o ponto de equilíbrio; acima de 8 o render dobra sem ganho visual.
- Alternativa barata para partículas e dots: **trails esticados**. Desenhe cada ponto como `<line>` do ponto atual ao ponto de N frames atrás, com `stroke-linecap: round` e opacidade decrescente.
- Nunca combine `CameraMotionBlur` com `filter: blur()` no mesmo bloco.

## 6. Camera shake

```ts
// layers/CameraShake.tsx — amplitude em px, decai em `decay` frames a partir de cada cue
export const shakeOffset = (frame: number, cues: Cue[], fps: number) => {
  let x = 0, y = 0;
  for (const c of cues) {
    if (c.shake <= 0 || frame < c.frame) continue;
    const dt = frame - c.frame;
    const decay = 20;
    if (dt > decay) continue;
    const env = (1 - dt / decay) ** 2 * c.shake;      // 14px no pico, por exemplo
    const t = frame / fps;
    x += smoothNoise(t * 18, c.frame) * env;
    y += smoothNoise(t * 15, c.frame + 99) * env;
  }
  return { x, y };
};
```

- Aplique no wrapper do conteúdo (não no HUD) via `transform: translate(x, y)`.
- Nunca use `seeded(frame)`: isso é jitter, não shake.

## 7. Transições (8–14 frames, nunca corte seco)

| Transição | Como | Quando usar |
|---|---|---|
| Zoom-through | Cena A escala 1→9× com `easeInExpo` enquanto cena B escala 0.4→1 e opacidade 0→1 | Entrar "dentro" de um elemento (sparkle, logo) |
| Whip-pan | Ambas transladam 120% em X com `CameraMotionBlur`, 10 frames | Mudança de assunto |
| Iris wipe | `clip-path: circle(r% at 50% 50%)` animado (um único elemento) | Fechar/abrir cena limpa |
| White flash | Overlay branco opacidade 0→1→0 em 8–12 frames com pico no frame da cue | Impactos, slam |

- Implemente como `<Transition kind from to durationInFrames>`, sobrepondo as sequências em `Reel.tsx` (`from = sceneEnd - transitionFrames`).
- A cue sonora de whoosh fica no frame inicial da transição; o boom, no frame do pico.

## 8. Grain, vinheta e scanlines

- Gere **uma vez** um PNG de ruído 256×256 (`scripts/make-grain.js` com hash determinístico) em `public/grain-tile.png`.
- Camada: `background-image: url(grain)`, `background-size: 256px`, `background-position: ${(frame*37)%256}px ${(frame*61)%256}px`, `opacity: 0.05`, `mix-blend-mode: overlay`.
- Vinheta: um radial-gradient fixo de transparente a `brand.contrast` 55%.
- Scanlines: `repeating-linear-gradient(0deg, rgba(10,11,61,.08) 0 1px, transparent 1px 4px)`, opacidade 0.25, estático.
- Jamais `<feTurbulence>` full-screen por frame.

## 9. Partículas e geometria pesada

- Teto: **1.400** partículas, num único `<svg>` com `<circle>`/`<line>`; sem `<g>` por partícula com estilo próprio.
- Posições-alvo do logo: em build time (`scripts/sample-logo.js`), leia `logo-mark.png`, pegue pixels com alpha > 128 em grade de passo 6–8 px, embaralhe com `seeded()`, salve `src/data/logo-points.json`.
- Torus 3D: ~1.100 pontos, projeção perspectiva manual (`z` → `scale`/`opacity`), ordenados por `z` uma vez por frame.
- Neural net, truchet, easing: números baixos; priorize `<path>` com `stroke-dasharray`/`stroke-dashoffset` animados via `interpolate`, que são baratos.

## 10. Springs e easings

```ts
// lib/spring-presets.ts
export const SNAPPY = { damping: 18, stiffness: 220, mass: 0.8 };
export const HEAVY  = { damping: 22, stiffness: 120, mass: 1.6 };
export const BOUNCY = { damping: 9,  stiffness: 180, mass: 0.9 };
// lib/easings.ts
export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const easeInExpo  = (x: number) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10));
export const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
```

- Entrada de qualquer elemento: `spring({ frame: frame - delay, fps, config })` ou `interpolate(frame, [a,b], [0,1], { easing: easeOutExpo, extrapolateRight: 'clamp' })`.
- Letras em sequência: `delay = i * 3` frames (a 60 fps) com skew que vai de 12° a 0°.
- Nada permanece estático por mais de ~30 frames: adicione deriva de 1–3 px, rotação lenta ou pulso de opacidade de 2%.

## 11. Fontes

- Carregue via `@remotion/google-fonts/ArchivoBlack`, `.../InstrumentSerif`, `.../JetBrainsMono` (ou `loadFont` com `staticFile` para fontes locais) e aguarde `waitUntilDone()` no `Root`.
- Sem fonte carregada o render usa fallback e os stills de QA denunciam isso: confira.

## 12. Orçamento de performance por cena

| Item | Limite |
|---|---|
| Elementos com `filter` | ≤ 5 |
| Blocos com `CameraMotionBlur` | ≤ 2 simultâneos |
| Partículas SVG | ≤ 1.400 |
| Camadas full-screen com gradiente | ≤ 4 |
| Tempo de render por frame (1080p, máquina média) | ≤ 120 ms |

Se o preview a 0.5× estiver travando, corte nesta ordem: samples de blur → contagem de partículas → camadas de glow → elementos com `filter`.
