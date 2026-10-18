// Template do sintetizador de trilha. Copie para scripts/synth-music.js no projeto Remotion.
// Uso: node scripts/synth-music.js [--solo=<cue>] [--out=public/music.wav]
// Lê cues.json (exportado de src/cues.ts) e renderiza cada evento no sample exato.
// Sem samples externos, sem Math.random: tudo determinístico.

import { readFileSync, writeFileSync } from 'node:fs';

const SR = 44100;
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const OUT = args.out ?? 'public/music.wav';
const SOLO = args.solo ?? null;

const { cues, fps, durationInFrames, bpm = 120 } = JSON.parse(readFileSync('src/cues.json', 'utf8'));
const TOTAL = Math.ceil((durationInFrames / fps) * SR);
const L = new Float32Array(TOTAL);
const R = new Float32Array(TOTAL);

// ---------- blocos básicos ----------
const TAU = Math.PI * 2;
const sine = (t, f) => Math.sin(TAU * f * t);
const saw = (t, f) => 2 * ((t * f) % 1) - 1;
const db = (x) => Math.pow(10, x / 20);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const frameToSample = (frame) => Math.round((frame / fps) * SR);
const makeRng = (seed) => () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};
const makeLowpass = () => {
  let y = 0;
  return (x, cutoff) => { const a = 1 - Math.exp((-TAU * cutoff) / SR); y += a * (x - y); return y; };
};
const expDecay = (r, tau) => Math.exp(-r / tau);

// vozes contínuas ganham fade-in e release curtos: start/stop nunca estala. [fade-in, release] em segundos
const EDGES = { drone: [0.4, 0.5], clock: [0, 0.05], heartbeat: [0.02, 0.3], hihat: [0.02, 0.2], pad: [1.5, 1.2], padHigh: [0.8, 0.6], sweep: [0, 0.1] };

// escreve um "voice" no mix: fn(tRel) -> [l, r], por `seconds` a partir de `startSample`
const render = (name, startSample, seconds, gainDb, fn) => {
  if (SOLO && SOLO !== name) return;
  const n = Math.min(Math.floor(seconds * SR), TOTAL - startSample);
  const g = db(gainDb);
  const [fi, fo] = EDGES[name] ?? [0, 0];
  const len = n / SR;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const edge = (fi > 0 ? clamp01(t / fi) : 1) * (fo > 0 ? clamp01((len - t) / fo) : 1);
    const [l, r] = fn(t, i);
    L[startSample + i] += l * g * edge;
    R[startSample + i] += r * g * edge;
  }
};

// ---------- instrumentos ----------
const instruments = {
  drone(start, seconds) {
    const lp = makeLowpass();
    render('drone', start, seconds, -18, (t) => {
      const cutoff = 120 + 280 * (0.5 + 0.5 * Math.sin(TAU * 0.08 * t));
      const x = lp(0.5 * sine(t, 55) + 0.35 * saw(t, 55.6) + 0.3 * sine(t, 27.5), cutoff);
      const y = Math.tanh(x * 1.6);
      return [y, y];
    });
  },
  clock(start, seconds) {
    const rng = makeRng(7);
    render('clock', start, seconds, -26, (t) => {
      const r = t % 0.5;
      const a = expDecay(r, 0.004) * rng() + expDecay(r, 0.006) * sine(t, 2200) * 0.6;
      return [a, a];
    });
  },
  riser(start, seconds, _c, long = false) {
    const rng = makeRng(11);
    const lp = makeLowpass();
    render(long ? 'riserLong' : 'riser', start, seconds, -14, (t) => {
      const p = clamp01(t / seconds);
      const noise = lp(rng(), 300 * Math.pow(30, p));
      const sweep = sine(t, 110 * Math.pow(8, p)) * 0.4;
      const env = p * p;
      return [(noise + sweep) * env, (noise * 0.9 + sweep) * env];
    });
  },
  subBoom(start, seconds = 1.4, _c, big = false) {
    const rng = makeRng(3);
    render(big ? 'boomBig' : 'subBoom', start, big ? 2.6 : seconds, big ? -4 : -6, (t) => {
      const pitch = 38 + 52 * Math.exp(-t / 0.08);
      const body = sine(t, pitch) * expDecay(t, big ? 0.9 : 0.45);
      const second = big ? sine(t, 55) * expDecay(t, 1.2) * 0.5 : 0;
      const click = t < 0.06 ? rng() * expDecay(t, 0.015) * 0.5 : 0;
      const y = body + second + click;
      return [y, y];
    });
  },
  heartbeat(start, seconds) {
    const beat = 60 / bpm;
    render('heartbeat', start, seconds, -12, (t) => {
      const r = t % beat;
      const p1 = sine(r, 50) * expDecay(r, 0.06);
      const r2 = r - 0.14;
      const p2 = r2 > 0 ? sine(r2, 48) * expDecay(r2, 0.05) * 0.7 : 0;
      return [p1 + p2, p1 + p2];
    });
  },
  hihat(start, seconds) {
    const rng = makeRng(5);
    const lp = makeLowpass();
    const step = 60 / bpm / 2;
    render('hihat', start, seconds, -24, (t) => {
      const i = Math.floor(t / step);
      const r = t - i * step;
      const n = rng();
      const hp = n - lp(n, 6000);
      const acc = i % 4 === 0 ? 1 : 0.6;
      const y = hp * expDecay(r, 0.013) * acc;
      return [y, y];
    });
  },
  pad(start, seconds, _c, high = false) {
    // A4 C5 E5 (menor); `padHigh` é o swell uma oitava acima
    const notes = high ? [880, 1046.5, 1318.5] : [440, 523.25, 659.25];
    render(high ? 'padHigh' : 'pad', start, seconds, high ? -26 : -22, (t) => {
      const vib = 1 + 0.0035 * Math.sin(TAU * 5.5 * t);
      const trem = 0.85 + 0.15 * Math.sin(TAU * 0.3 * t);
      const att = clamp01(t / 1.5);
      let l = 0, r = 0;
      notes.forEach((f, k) => { const s = sine(t, f * vib); l += s * (k === 0 ? 0.6 : 0.4); r += s * (k === 2 ? 0.6 : 0.4); });
      return [l * att * trem, r * att * trem];
    });
  },
  whoosh(start, _s, cue) {
    const rng = makeRng(13 + cue.frame);
    const lp = makeLowpass();
    const dir = (cue.frame % 2) * 2 - 1; // alterna pan
    render('whoosh', start, 0.35, -16, (t) => {
      const p = t / 0.35;
      const env = Math.sin(Math.PI * p);
      const cutoff = 1000 + 5000 * Math.sin(Math.PI * p);
      const n = lp(rng(), cutoff) * env;
      const pan = 0.5 + 0.5 * dir * (p * 2 - 1);
      return [n * (1 - pan), n * pan];
    });
  },
  keyClick(start, _s, cue) {
    const rng = makeRng(17 + cue.frame);
    const pitch = 1800 * (1 + (rng() * 0.08));
    render('keyClick', start, 0.01, -24, (t) => {
      const y = rng() * expDecay(t, 0.0015) + sine(t, pitch) * expDecay(t, 0.003);
      return [y, y];
    });
  },
  blip(start, _s, cue) {
    render('blip', start, 0.3, -14 + (cue?.gain ?? 0), (t) => {
      const f = 880 + 440 * clamp01(t / 0.06);
      const y = (sine(t, f) + 0.4 * sine(t, f * 2)) * expDecay(t, 0.11);
      return [y, y];
    });
  },
  tick(start, _s, cue) {
    render('tick', start, 0.012, -28 + (cue?.gain ?? 0), (t) => { const y = sine(t, 3000) * expDecay(t, 0.003); return [y, y]; });
  },
  hit(start, _s, cue) {
    const rng = makeRng(19);
    render('hit', start, 0.6, -10 + (cue.gain ?? 0), (t) => {
      const pitch = 42 + 60 * Math.exp(-t / 0.05);
      const y = sine(t, pitch) * expDecay(t, 0.25) + sine(t, 220) * expDecay(t, 0.04) * 0.5 + (t < 0.03 ? rng() * 0.4 : 0);
      return [y, y];
    });
  },
  sweep(start, seconds) {
    const rng = makeRng(23);
    const lp = makeLowpass();
    render('sweep', start, seconds, -24, (t) => {
      const p = clamp01(t / seconds);
      const y = lp(rng(), 200 + 4800 * p) * Math.sin(Math.PI * p);
      return [y, y];
    });
  },
  shimmer(start) {
    const rng = makeRng(29);
    const partials = Array.from({ length: 12 }, (_, k) => ({ f: 1760 * (k + 1) / 2, tau: 0.6 + 1.4 * ((rng() + 1) / 2), pan: (rng() + 1) / 2 }));
    render('shimmer', start, 2, -20, (t) => {
      let l = 0, r = 0;
      for (const p of partials) { const s = sine(t, p.f) * expDecay(t, p.tau) / 12; l += s * (1 - p.pan); r += s * p.pan; }
      return [l, r];
    });
  },
  padHigh(start, seconds, c) { instruments.pad(start, seconds, c, true); },
  riserLong(start, seconds, c) { instruments.riser(start, seconds, c, true); },
  boomBig(start, _s, c) { instruments.subBoom(start, 2.6, c, true); },
  resolve(start, seconds) {
    const notes = [220, 277.18, 329.63, 440]; // A3 C#4 E4 A4 (maior)
    render('resolve', start, seconds, -16, (t) => {
      const att = clamp01(t / 0.8);
      let y = 0;
      for (const f of notes) y += sine(t, f) / notes.length;
      return [y * att, y * att];
    });
  },
};

// ---------- despacho a partir da cue sheet ----------
// Cada cue tem `sound` como string ("subBoom", "hit", "pad (start)" …) ou null.
// Eventos contínuos ("X (start)") duram até a cue "X (stop)" ou até o fim.
// Os tokens são lidos ao pé da letra: "heartbeat, pad (start)" inicia só o pad; o heartbeat vira evento pontual.
const CONTINUOUS = new Set(['drone', 'clock', 'riser', 'riserLong', 'heartbeat', 'hihat', 'pad', 'padHigh', 'sweep', 'resolve']);
const warn = (msg) => console.error(`aviso: ${msg}`);
const starts = {};
for (const cue of cues) {
  if (!cue.sound) continue;
  for (const token of cue.sound.split(/[;,]\s*/)) {
    const m = token.match(/^(\w+)(?:\s*\((start|stop)\))?/);
    if (!m) continue;
    const [, name, mode] = m;
    if (!instruments[name]) { warn(`instrumento desconhecido "${name}" no frame ${cue.frame} — ignorado`); continue; }
    if (!mode && CONTINUOUS.has(name)) { warn(`"${name}" é contínuo e precisa de (start)/(stop) — frame ${cue.frame} ignorado`); continue; }
    const s = frameToSample(cue.frame);
    if (mode === 'start') { starts[name] = cue; continue; }
    if (mode === 'stop') {
      const from = starts[name]; if (!from) continue;
      instruments[name]?.(frameToSample(from.frame), (cue.frame - from.frame) / fps, from);
      delete starts[name];
      continue;
    }
    instruments[name]?.(s, undefined, cue);
  }
}
for (const [name, from] of Object.entries(starts)) {
  if (name === 'riser' || name === 'riserLong') warn(`"${name} (start)" do frame ${from.frame} não tem (stop): vai subir até o fim do reel`);
  instruments[name]?.(frameToSample(from.frame), (durationInFrames - from.frame) / fps, from);
}

// ---------- master ----------
// loudness aproximada (RMS global) → alvo; limiter de redução de ganho com lookahead; fade-out 2 s.
// Sem waveshaping (tanh/clip) no master: ele gera picos entre samples e estoura o −1 dBTP.
let ms = 0;
for (let i = 0; i < TOTAL; i++) ms += (L[i] * L[i] + R[i] * R[i]) / 2;
const lufs = -0.691 + 10 * Math.log10(ms / TOTAL || 1e-12);
const TARGET = -12.8; // alvo pré-limiter: o limiter tira ~1 dB, e o integrado cai perto de −14 LUFS
const gain = db(TARGET - lufs);
const CEIL = db(-2); // teto em sample peak; deixa o true peak abaixo de −1 dBTP
const LOOK = Math.round(0.005 * SR);
const REL = Math.exp(-1 / (0.08 * SR));
const need = new Float32Array(TOTAL);
for (let i = 0; i < TOTAL; i++) {
  const peak = Math.max(Math.abs(L[i]), Math.abs(R[i])) * gain;
  need[i] = peak > CEIL ? CEIL / peak : 1;
}
// mínimo deslizante na janela de lookahead; ataque instantâneo, release suave
const gr = new Float32Array(TOTAL);
let env = 1;
for (let i = 0; i < TOTAL; i++) {
  let m = 1;
  for (let k = i; k < Math.min(TOTAL, i + LOOK); k++) if (need[k] < m) m = need[k];
  env = m < env ? m : m + (env - m) * REL;
  gr[i] = env;
}
const FADE = 2 * SR;
for (let i = 0; i < TOTAL; i++) {
  const fade = i > TOTAL - FADE ? 0.5 + 0.5 * Math.cos((Math.PI * (i - (TOTAL - FADE))) / FADE) : 1;
  for (const ch of [L, R]) ch[i] = Math.max(-CEIL, Math.min(CEIL, ch[i] * gain * gr[i] * fade));
}

// ---------- WAV ----------
function writeWav(path, left, right, sampleRate) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sampleRate, 24); buf.writeUInt32LE(sampleRate * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(left[i] * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(right[i] * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
}
writeWav(OUT, L, R, SR);
console.error(`ok: ${OUT} (${(TOTAL / SR).toFixed(2)}s, pre-master ${lufs.toFixed(1)} LUFS, gain ${(20 * Math.log10(gain)).toFixed(1)} dB)`);
