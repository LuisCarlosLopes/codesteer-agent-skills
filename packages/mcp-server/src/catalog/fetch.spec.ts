import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HashMismatchError, PathDeniedError } from './errors.ts';
import { fetchSkillFiles } from './fetch.ts';
import { loadCatalog } from './load.ts';

function seedFetchSkill(
  catalogRoot: string,
  name: string,
  extras?: {
    references?: Record<string, string>;
    scripts?: Record<string, string>;
    templates?: Record<string, string>;
  },
): string {
  const skillDir = path.join(catalogRoot, 'skills', 'testing', name);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(
    path.join(skillDir, 'SKILL.md'),
    `---
name: ${name}
description: Use when testing the local MCP catalog. Do NOT use for production agents.
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

# ${name}
`,
    'utf8',
  );
  for (const [relative, content] of Object.entries(extras?.references ?? {})) {
    mkdirSync(path.join(skillDir, 'references'), { recursive: true });
    writeFileSync(path.join(skillDir, 'references', relative), content, 'utf8');
  }
  for (const [relative, content] of Object.entries(extras?.scripts ?? {})) {
    mkdirSync(path.join(skillDir, 'scripts'), { recursive: true });
    writeFileSync(path.join(skillDir, 'scripts', relative), content, 'utf8');
  }
  for (const [relative, content] of Object.entries(extras?.templates ?? {})) {
    mkdirSync(path.join(skillDir, 'templates'), { recursive: true });
    writeFileSync(path.join(skillDir, 'templates', relative), content, 'utf8');
  }
  return skillDir;
}

describe('catalog/fetch', () => {
  it('devolve o texto de references/*.md com hash ok', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-fetch-ok-'));
    seedFetchSkill(catalogRoot, 'fetch-skill', {
      references: { 'manual-tecnico.md': '# manual ok\n' },
    });
    const catalog = loadCatalog({ catalogRoot });

    const result = fetchSkillFiles(catalog, 'fetch-skill', ['references/manual-tecnico.md']);

    expect(result.files).toEqual([{ path: 'references/manual-tecnico.md', content: '# manual ok\n' }]);
  });

  it('recusa scripts/ mesmo se o arquivo existir no manifesto', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-fetch-script-'));
    seedFetchSkill(catalogRoot, 'fetch-script', {
      scripts: { 'executor.py': 'print("ok")\n' },
    });
    const catalog = loadCatalog({ catalogRoot });

    expect(() => fetchSkillFiles(catalog, 'fetch-script', ['scripts/executor.py'])).toThrow(PathDeniedError);
  });

  it('recusa path com .. ou absoluto', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-fetch-path-'));
    seedFetchSkill(catalogRoot, 'fetch-path', {
      references: { 'manual-tecnico.md': '# manual\n' },
    });
    const catalog = loadCatalog({ catalogRoot });

    expect(() => fetchSkillFiles(catalog, 'fetch-path', ['../secrets.txt'])).toThrow(PathDeniedError);
    expect(() => fetchSkillFiles(catalog, 'fetch-path', ['references/../SKILL.md'])).toThrow(PathDeniedError);
    expect(() => fetchSkillFiles(catalog, 'fetch-path', ['/etc/passwd'])).toThrow(PathDeniedError);
  });

  it('devolve o texto de templates/ com hash ok', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-fetch-tpl-'));
    seedFetchSkill(catalogRoot, 'fetch-template', {
      templates: { 'snippet.md': '# template ok\n' },
    });
    const catalog = loadCatalog({ catalogRoot });

    const result = fetchSkillFiles(catalog, 'fetch-template', ['templates/snippet.md']);

    expect(result.files).toEqual([{ path: 'templates/snippet.md', content: '# template ok\n' }]);
  });

  it('recusa SKILL.md e prefixos fora de references/templates', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-fetch-kind-'));
    seedFetchSkill(catalogRoot, 'fetch-kind', {
      references: { 'manual-tecnico.md': '# manual\n' },
    });
    const catalog = loadCatalog({ catalogRoot });

    expect(() => fetchSkillFiles(catalog, 'fetch-kind', ['SKILL.md'])).toThrow(PathDeniedError);
    expect(() => fetchSkillFiles(catalog, 'fetch-kind', ['notes.md'])).toThrow(PathDeniedError);
  });

  it('falha HashMismatch se a referência mudou depois do load', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-fetch-hash-'));
    const skillDir = seedFetchSkill(catalogRoot, 'fetch-hash', {
      references: { 'manual-tecnico.md': '# original\n' },
    });
    const catalog = loadCatalog({ catalogRoot });
    writeFileSync(path.join(skillDir, 'references', 'manual-tecnico.md'), '# adulterado\n', 'utf8');

    try {
      const leaked = fetchSkillFiles(catalog, 'fetch-hash', ['references/manual-tecnico.md']);
      expect(leaked.files.some((file) => file.content.includes('adulterado'))).toBe(false);
      throw new Error('esperava HashMismatchError');
    } catch (error) {
      expect(error).toBeInstanceOf(HashMismatchError);
      expect((error as Error).message).not.toContain('adulterado');
    }
  });
});
