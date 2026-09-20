import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// @MindContext: Assets de marca CodeSteer vendored — inline no HTML, sem fetch em runtime
// @MindDecision: PNG como data-URI; SVG de IDE como data-URI com alt textual
// @MindRisk: path relativo a import.meta.url precisa resolver no Vitest e no tsx CLI

const BRAND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../brand');

export interface IdeLogo {
  alt: string;
  label: string;
  src: string;
}

const OPENCODE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00b9b9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`;

const IDE_FILES: Array<{ alt: string; label: string; file: string }> = [
  { alt: 'Cursor', label: 'Cursor', file: 'cursor.svg' },
  { alt: 'Claude Code', label: 'Claude Code', file: 'claude.svg' },
  { alt: 'GitHub Copilot', label: 'GitHub Copilot', file: 'github-copilot.svg' },
  { alt: 'Antigravity', label: 'Antigravity', file: 'antigravity.svg' },
  { alt: 'Kiro', label: 'Kiro', file: 'kiro.svg' },
  { alt: 'Codex', label: 'Codex', file: 'codex.svg' },
];

function pngDataUri(relativePath: string): string {
  const buffer = readFileSync(path.join(BRAND_ROOT, relativePath));
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

function readIdeSvg(file: string): string {
  return readFileSync(path.join(BRAND_ROOT, 'logos', file), 'utf8').trim();
}

export function codeSteerIconSrc(): string {
  return pngDataUri('codeSteer-icon.png');
}

export function ideLogos(): IdeLogo[] {
  const fromFiles = IDE_FILES.map((item) => ({
    alt: item.alt,
    label: item.label,
    src: svgDataUri(readIdeSvg(item.file)),
  }));
  const openCode: IdeLogo = {
    alt: 'OpenCode',
    label: 'OpenCode',
    src: svgDataUri(OPENCODE_SVG),
  };
  return [
    fromFiles[0]!,
    fromFiles[1]!,
    fromFiles[2]!,
    fromFiles[3]!,
    fromFiles[4]!,
    openCode,
    fromFiles[5]!,
  ];
}
