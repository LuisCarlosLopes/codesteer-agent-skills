import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { compileCatalog } from './compile-catalog.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function sha256(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function writeCanonicalSkill(skillDir: string, name: string, body = `# ${name}\n`): void {
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(
    path.join(skillDir, 'SKILL.md'),
    `---
name: ${name}
description: Use when compiling the catalog. Do NOT use for production agents.
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

${body}`,
    'utf8',
  );
}

describe('compile-catalog', () => {
  it('emite skills: [] quando não há SKILL.md (apenas .gitkeep)', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'compile-empty-'));
    mkdirSync(path.join(catalogRoot, 'skills', 'architecture'), { recursive: true });
    writeFileSync(path.join(catalogRoot, 'skills', 'architecture', '.gitkeep'), '');
    const outPath = path.join(catalogRoot, 'dist', 'skills-registry.json');

    const { registry } = compileCatalog({
      skillsRoot: path.join(catalogRoot, 'skills'),
      catalogRoot,
      outPath,
      generatedAt: '2026-09-14T00:00:00.000Z',
    });

    expect(registry.skills).toEqual([]);
    const written = JSON.parse(readFileSync(outPath, 'utf8')) as { skills: unknown[] };
    expect(written.skills).toEqual([]);
  });

  it('inclui pipeline-canary com files[].contentHash sha256 hex', () => {
    const catalogRoot = path.join(repoRoot, 'packages', 'skills-catalog');
    const outPath = path.join(mkdtempSync(path.join(tmpdir(), 'compile-canary-')), 'skills-registry.json');
    const { registry } = compileCatalog({
      skillsRoot: path.join(catalogRoot, 'skills'),
      catalogRoot,
      outPath,
      generatedAt: '2026-09-14T00:00:00.000Z',
    });

    const canary = registry.skills.find((skill) => skill.name === 'pipeline-canary');
    expect(canary).toBeDefined();
    expect(canary?.category).toBe('testing');
    expect(canary?.path).toBe('skills/testing/pipeline-canary');
    const skillMd = canary?.files.find((file) => file.path === 'SKILL.md');
    expect(skillMd?.contentHash).toMatch(/^[a-f0-9]{64}$/);
    const disk = readFileSync(path.join(catalogRoot, 'skills', 'testing', 'pipeline-canary', 'SKILL.md'));
    expect(skillMd?.contentHash).toBe(sha256(disk));
  });

  it('muda contentHash quando um byte do SKILL.md muda', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'compile-hash-'));
    const skillDir = path.join(catalogRoot, 'skills', 'testing', 'hash-skill');
    writeCanonicalSkill(skillDir, 'hash-skill', '# one\n');
    const outPath = path.join(catalogRoot, 'dist', 'skills-registry.json');

    const first = compileCatalog({
      skillsRoot: path.join(catalogRoot, 'skills'),
      catalogRoot,
      outPath,
      generatedAt: '2026-09-14T00:00:00.000Z',
    });
    const hashOne = first.registry.skills[0]?.files.find((file) => file.path === 'SKILL.md')?.contentHash;

    writeCanonicalSkill(skillDir, 'hash-skill', '# onf\n');
    const second = compileCatalog({
      skillsRoot: path.join(catalogRoot, 'skills'),
      catalogRoot,
      outPath,
      generatedAt: '2026-09-14T00:00:00.000Z',
    });
    const hashTwo = second.registry.skills[0]?.files.find((file) => file.path === 'SKILL.md')?.contentHash;

    expect(hashOne).toBeDefined();
    expect(hashTwo).toBeDefined();
    expect(hashOne).not.toBe(hashTwo);
  });

  it('lista arquivos opcionais de references/ e scripts/ no manifesto', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'compile-files-'));
    const skillDir = path.join(catalogRoot, 'skills', 'testing', 'with-extras');
    writeCanonicalSkill(skillDir, 'with-extras');
    mkdirSync(path.join(skillDir, 'references'), { recursive: true });
    mkdirSync(path.join(skillDir, 'scripts'), { recursive: true });
    writeFileSync(path.join(skillDir, 'references', 'manual-tecnico.md'), '# manual\n');
    writeFileSync(path.join(skillDir, 'scripts', 'executor.py'), 'print("ok")\n');

    const { registry } = compileCatalog({
      skillsRoot: path.join(catalogRoot, 'skills'),
      catalogRoot,
      outPath: path.join(catalogRoot, 'dist', 'skills-registry.json'),
      generatedAt: '2026-09-14T00:00:00.000Z',
    });

    const paths = registry.skills[0]?.files.map((file) => file.path) ?? [];
    expect(paths).toContain('SKILL.md');
    expect(paths).toContain('references/manual-tecnico.md');
    expect(paths).toContain('scripts/executor.py');
  });
});
