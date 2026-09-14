import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateSkill } from './generate.ts';

describe('skill-generator', () => {
  it('cria SKILL.md com name kebab-case e placeholders Use when / Do NOT use for', () => {
    const catalog = path.join(mkdtempSync(path.join(tmpdir(), 'gen-ok-')), 'skills');
    mkdirSync(catalog, { recursive: true });

    const result = generateSkill({
      category: 'testing',
      name: 'new-skill',
      catalogSkillsRoot: catalog,
      author: '@codesteer',
    });

    expect(result.ok).toBe(true);
    expect(result.skillMdPath).toBeDefined();
    const content = readFileSync(result.skillMdPath as string, 'utf8');
    expect(content).toContain('name: new-skill');
    expect(content).toContain('Use when');
    expect(content).toContain('Do NOT use for');
    expect(content).toContain('metadata:');
    expect(content).toContain('compatibility:');
    expect(content).toContain('sandbox:');
    expect(existsSync(path.join(result.skillDir as string, 'README.md'))).toBe(false);
  });

  it('recusa nome inválido e não escreve README.md', () => {
    const catalog = path.join(mkdtempSync(path.join(tmpdir(), 'gen-bad-')), 'skills');
    mkdirSync(catalog, { recursive: true });

    const result = generateSkill({
      category: 'testing',
      name: 'Not_Valid',
      catalogSkillsRoot: catalog,
    });

    expect(result.ok).toBe(false);
    expect(existsSync(path.join(catalog, 'testing'))).toBe(false);
    const entries = existsSync(catalog) ? readdirSync(catalog) : [];
    expect(entries).toEqual([]);
  });
});
