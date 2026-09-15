import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ExecDeniedError, HashMismatchError, PathDeniedError } from './errors.ts';
import { loadCatalog } from './load.ts';
import { prepareSkillFiles } from './prepare.ts';

function seedPrepareSkill(catalogRoot: string, name: string, allowExec: boolean): string {
  const skillDir = path.join(catalogRoot, 'skills', 'testing', name);
  mkdirSync(path.join(skillDir, 'scripts'), { recursive: true });
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
  allow_exec: ${allowExec}
---

# ${name}
`,
    'utf8',
  );
  writeFileSync(path.join(skillDir, 'scripts', 'executor.py'), 'print("staged")\n', 'utf8');
  return skillDir;
}

describe('catalog/prepare', () => {
  it('dry_run true não cria o diretório de staging e devolve skill_dir previsto', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-prepare-dry-'));
    const stagingRoot = mkdtempSync(path.join(tmpdir(), 'mcp-staging-dry-'));
    seedPrepareSkill(catalogRoot, 'prepare-dry', true);
    const catalog = loadCatalog({ catalogRoot });

    const result = prepareSkillFiles(catalog, 'prepare-dry', ['scripts/executor.py'], {
      dryRun: true,
      stagingRoot,
    });

    expect(result.dry_run).toBe(true);
    expect(result.files).toEqual(['scripts/executor.py']);
    expect(result.skill_dir.startsWith(path.resolve(stagingRoot))).toBe(true);
    expect(existsSync(result.skill_dir)).toBe(false);
  });

  it('dry_run false copia o script para ~/.cache/agent-skills/staged/<hash>/ (ou TMP override de teste)', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-prepare-copy-'));
    const stagingRoot = mkdtempSync(path.join(tmpdir(), 'mcp-staging-copy-'));
    seedPrepareSkill(catalogRoot, 'prepare-copy', true);
    const catalog = loadCatalog({ catalogRoot });

    const result = prepareSkillFiles(catalog, 'prepare-copy', ['scripts/executor.py'], {
      dryRun: false,
      stagingRoot,
    });

    expect(result.dry_run).toBe(false);
    const staged = path.join(result.skill_dir, 'scripts', 'executor.py');
    expect(existsSync(staged)).toBe(true);
    expect(readFileSync(staged, 'utf8')).toBe('print("staged")\n');
    expect(result.skill_dir.startsWith(path.resolve(stagingRoot))).toBe(true);
    expect(result.skill_dir).not.toContain(path.join('.cache', 'agent-skills'));
  });

  it('recusa quando sandbox.allow_exec é false', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-prepare-exec-'));
    seedPrepareSkill(catalogRoot, 'prepare-denied', false);
    const catalog = loadCatalog({ catalogRoot });

    expect(() =>
      prepareSkillFiles(catalog, 'prepare-denied', ['scripts/executor.py'], {
        dryRun: true,
        stagingRoot: mkdtempSync(path.join(tmpdir(), 'mcp-staging-denied-')),
      }),
    ).toThrow(ExecDeniedError);
  });

  it('recusa path traversal', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-prepare-trav-'));
    seedPrepareSkill(catalogRoot, 'prepare-trav', true);
    const catalog = loadCatalog({ catalogRoot });

    expect(() =>
      prepareSkillFiles(catalog, 'prepare-trav', ['../escape.py'], {
        dryRun: true,
        stagingRoot: mkdtempSync(path.join(tmpdir(), 'mcp-staging-trav-')),
      }),
    ).toThrow(PathDeniedError);
  });

  it('recusa SKILL.md', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-prepare-skillmd-'));
    seedPrepareSkill(catalogRoot, 'prepare-skillmd', true);
    const catalog = loadCatalog({ catalogRoot });

    expect(() =>
      prepareSkillFiles(catalog, 'prepare-skillmd', ['SKILL.md'], {
        dryRun: true,
        stagingRoot: mkdtempSync(path.join(tmpdir(), 'mcp-staging-skillmd-')),
      }),
    ).toThrow(PathDeniedError);
  });

  it('falha HashMismatch e não escreve staging se o arquivo mudou depois do load', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-prepare-hash-'));
    const stagingRoot = mkdtempSync(path.join(tmpdir(), 'mcp-staging-hash-'));
    const skillDir = seedPrepareSkill(catalogRoot, 'prepare-hash', true);
    const catalog = loadCatalog({ catalogRoot });
    writeFileSync(path.join(skillDir, 'scripts', 'executor.py'), 'print("adulterado")\n', 'utf8');

    try {
      prepareSkillFiles(catalog, 'prepare-hash', ['scripts/executor.py'], {
        dryRun: false,
        stagingRoot,
      });
      throw new Error('esperava HashMismatchError');
    } catch (error) {
      expect(error).toBeInstanceOf(HashMismatchError);
      expect((error as Error).message).not.toContain('adulterado');
      expect(readdirSync(stagingRoot)).toEqual([]);
    }
  });
});
