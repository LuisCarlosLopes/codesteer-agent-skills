import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HashMismatchError, NotFoundError } from './errors.ts';
import { loadCatalog } from './load.ts';
import { readSkill } from './read.ts';

function seedReadSkill(
  catalogRoot: string,
  name: string,
  extras?: { body?: string; references?: Record<string, string>; scripts?: Record<string, string> },
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

${extras?.body ?? `# ${name}\n`}`,
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
  return skillDir;
}

describe('catalog/read', () => {
  it('devolve SKILL.md e listas de references/scripts sem o conteúdo delas', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-read-lists-'));
    seedReadSkill(catalogRoot, 'read-skill', {
      body: '# skill body\n',
      references: { 'manual-tecnico.md': '# manual secreto\n' },
      scripts: { 'executor.py': 'print("segredo")\n' },
    });
    const catalog = loadCatalog({ catalogRoot });

    const result = readSkill(catalog, 'read-skill');

    expect(result.name).toBe('read-skill');
    expect(result.skill_md).toContain('# skill body');
    expect(result.references).toEqual(['references/manual-tecnico.md']);
    expect(result.scripts).toEqual(['scripts/executor.py']);
    expect(JSON.stringify(result)).not.toContain('manual secreto');
    expect(JSON.stringify(result)).not.toContain('print("segredo")');
  });

  it('falha NotFound para skill inexistente', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-read-missing-'));
    seedReadSkill(catalogRoot, 'present-skill');
    const catalog = loadCatalog({ catalogRoot });

    expect(() => readSkill(catalog, 'ghost-skill')).toThrow(NotFoundError);
  });

  it('falha HashMismatch e omite o corpo se SKILL.md mudou depois do load', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-read-hash-'));
    const skillDir = seedReadSkill(catalogRoot, 'tampered-skill', { body: '# original\n' });
    const catalog = loadCatalog({ catalogRoot });
    writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: tampered-skill\n---\n# corpo adulterado\n', 'utf8');

    try {
      const leaked = readSkill(catalog, 'tampered-skill');
      expect(leaked.skill_md).not.toContain('corpo adulterado');
      throw new Error('esperava HashMismatchError');
    } catch (error) {
      expect(error).toBeInstanceOf(HashMismatchError);
      expect((error as Error).message).not.toContain('corpo adulterado');
    }
  });
});
