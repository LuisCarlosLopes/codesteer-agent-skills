import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { loadCatalog } from './load.ts';

const officialCatalogRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../skills-catalog');
const previousCatalogRoot = process.env.ASP_CATALOG_ROOT;

function seedSkill(catalogRoot: string, category: string, name: string): void {
  const skillDir = path.join(catalogRoot, 'skills', category, name);
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
}

afterEach(() => {
  if (previousCatalogRoot === undefined) {
    delete process.env.ASP_CATALOG_ROOT;
  } else {
    process.env.ASP_CATALOG_ROOT = previousCatalogRoot;
  }
});

describe('catalog/load', () => {
  it('compila um catálogo temporário e indexa a skill pelo name', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-load-index-'));
    seedSkill(catalogRoot, 'testing', 'alpha-skill');

    const catalog = loadCatalog({ catalogRoot });

    expect(catalog.catalogRoot).toBe(catalogRoot);
    expect(catalog.registry.skills.map((skill) => skill.name)).toEqual(['alpha-skill']);
    expect(catalog.registry.skills[0]?.category).toBe('testing');
  });

  it('respeita ASP_CATALOG_ROOT e não lê o catálogo oficial do repo', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-load-env-'));
    seedSkill(catalogRoot, 'testing', 'tmp-only-skill');
    process.env.ASP_CATALOG_ROOT = catalogRoot;

    const catalog = loadCatalog({ env: process.env });

    expect(catalog.catalogRoot).toBe(path.resolve(catalogRoot));
    expect(catalog.registry.skills.map((skill) => skill.name)).toEqual(['tmp-only-skill']);
    expect(catalog.registry.skills.some((skill) => skill.name === 'pipeline-canary')).toBe(false);
    expect(path.resolve(catalog.catalogRoot)).not.toBe(path.resolve(officialCatalogRoot));
  });
});
