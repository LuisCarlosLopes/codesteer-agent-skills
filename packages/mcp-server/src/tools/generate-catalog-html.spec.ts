import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../catalog/load.ts';
import { generateCatalogHtmlForCatalog } from './generate-catalog-html.ts';

function seedSkill(
  catalogRoot: string,
  category: string,
  name: string,
  extras?: { description?: string; body?: string },
): void {
  const skillDir = path.join(catalogRoot, 'skills', category, name);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(
    path.join(skillDir, 'SKILL.md'),
    `---
name: ${name}
description: ${extras?.description ?? 'Use when generating catalog HTML. Do NOT use for production agents.'}
metadata:
  version: 0.0.1
  author: "@codesteer"
  license: Apache-2.0
compatibility:
  min_agent_tier: 1
  requires_terminal: false
sandbox:
  network: false
  allow_exec: false
---

${extras?.body ?? `# ${name}\n`}`,
    'utf8',
  );
}

describe('tools/generate-catalog-html', () => {
  it('devolve html + skillCount usando o LoadedCatalog em memória', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-html-memory-'));
    seedSkill(catalogRoot, 'testing', 'html-skill', {
      description: 'Use when emitting catalog HTML. Do NOT use for production agents.',
      body: '# secret body that must not leak\n',
    });
    const catalog = loadCatalog({ catalogRoot });

    const result = generateCatalogHtmlForCatalog(catalog, {});

    expect(result.skillCount).toBe(1);
    expect(result.generatedAt).toBe(catalog.registry.generatedAt);
    expect(result.html).toContain('html-skill');
    expect(result.html).toContain('Use when emitting catalog HTML. Do NOT use for production agents.');
    expect(result.html).not.toContain('secret body that must not leak');
    expect(result.outPath).toBeUndefined();
  });

  it('sem out_path não escreve arquivo', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-html-nowrite-'));
    seedSkill(catalogRoot, 'testing', 'nowrite-skill');
    const catalog = loadCatalog({ catalogRoot });

    generateCatalogHtmlForCatalog(catalog, {});

    expect(existsSync(path.join(catalogRoot, 'dist', 'index.html'))).toBe(false);
  });

  it('com out_path grava o HTML e ecoa outPath', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-html-write-'));
    seedSkill(catalogRoot, 'testing', 'write-skill');
    const catalog = loadCatalog({ catalogRoot });
    const outPath = path.join(mkdtempSync(path.join(tmpdir(), 'mcp-html-out-')), 'catalog.html');

    const result = generateCatalogHtmlForCatalog(catalog, { out_path: outPath });

    expect(result.outPath).toBe(outPath);
    expect(readFileSync(outPath, 'utf8')).toBe(result.html);
    expect(result.html).toContain('write-skill');
  });

  it('category desconhecida → skillCount 0', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-html-unknown-'));
    seedSkill(catalogRoot, 'testing', 'lonely-skill');
    const catalog = loadCatalog({ catalogRoot });

    const result = generateCatalogHtmlForCatalog(catalog, { category: 'does-not-exist' });

    expect(result.skillCount).toBe(0);
    expect(result.html).not.toContain('lonely-skill');
    expect(result.html).toContain('Nenhuma skill encontrada.');
  });
});
