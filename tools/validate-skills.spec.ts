import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { validateSkillsRoot } from './validate-skills.ts';

const fixturesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__/skills');

function fixture(name: string): string {
  return path.join(fixturesRoot, name);
}

describe('validate-skills', () => {
  it('aceita fixture canônica com frontmatter completo e gatilhos', () => {
    const result = validateSkillsRoot(fixture('valid'));
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('rejeita ausência de frontmatter YAML', () => {
    const result = validateSkillsRoot(fixture('invalid-no-frontmatter'));
    expect(result.ok).toBe(false);
    expect(result.violations.some((item) => item.includes('frontmatter'))).toBe(true);
  });

  it('rejeita description sem Use when', () => {
    const result = validateSkillsRoot(fixture('invalid-no-use-when'));
    expect(result.ok).toBe(false);
    expect(result.violations.some((item) => item.includes('Use when'))).toBe(true);
  });

  it('rejeita description sem Do NOT use for', () => {
    const result = validateSkillsRoot(fixture('invalid-no-do-not'));
    expect(result.ok).toBe(false);
    expect(result.violations.some((item) => item.includes('Do NOT use for'))).toBe(true);
  });

  it('rejeita README.md na pasta da skill', () => {
    const result = validateSkillsRoot(fixture('invalid-readme'));
    expect(result.ok).toBe(false);
    expect(result.violations.some((item) => item.includes('README.md'))).toBe(true);
  });

  it('rejeita corpo com mais de 500 linhas', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'skill-too-long-'));
    const skillDir = path.join(root, 'testing', 'too-long');
    mkdirSync(skillDir, { recursive: true });
    const body = Array.from({ length: 501 }, (_, index) => `line-${index}`).join('\n');
    writeFileSync(
      path.join(skillDir, 'SKILL.md'),
      `---
name: too-long
description: Use when testing body size. Do NOT use for production agents.
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

${body}
`,
      'utf8',
    );
    const result = validateSkillsRoot(root);
    expect(result.ok).toBe(false);
    expect(result.violations.some((item) => item.includes('500'))).toBe(true);
  });

  it('rejeita pasta ou arquivo que não seja kebab-case', () => {
    const folder = validateSkillsRoot(fixture('invalid-not-kebab'));
    expect(folder.ok).toBe(false);
    expect(folder.violations.some((item) => item.includes('kebab-case'))).toBe(true);

    const file = validateSkillsRoot(fixture('invalid-file-not-kebab'));
    expect(file.ok).toBe(false);
    expect(file.violations.some((item) => item.includes('NotKebab.md'))).toBe(true);
  });

  it('rejeita name do frontmatter diferente do nome da pasta', () => {
    const result = validateSkillsRoot(fixture('invalid-name-mismatch'));
    expect(result.ok).toBe(false);
    expect(result.violations.some((item) => item.includes('difere do nome da pasta'))).toBe(true);
  });
});
