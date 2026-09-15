import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from './load.ts';
import { searchSkills } from './search.ts';

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
description: ${extras?.description ?? 'Use when testing the local MCP catalog. Do NOT use for production agents.'}
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

describe('catalog/search', () => {
  it('retorna name+description+category+version sem skill_md', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-search-short-'));
    seedSkill(catalogRoot, 'testing', 'fuzzy-skill', {
      description: 'Use when searching the catalog. Do NOT use for production agents.',
      body: '# secret body that must not leak\n',
    });
    const catalog = loadCatalog({ catalogRoot });

    const hits = searchSkills(catalog, 'fuzzy');

    expect(hits).toHaveLength(1);
    expect(hits[0]).toEqual({
      name: 'fuzzy-skill',
      description: 'Use when searching the catalog. Do NOT use for production agents.',
      category: 'testing',
      version: '0.0.1',
    });
    expect(JSON.stringify(hits)).not.toContain('secret body');
    expect(hits[0]).not.toHaveProperty('skill_md');
    expect(hits[0]).not.toHaveProperty('files');
  });

  it('filtra por category quando informado', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-search-cat-'));
    seedSkill(catalogRoot, 'testing', 'test-skill', {
      description: 'Use when testing search filters. Do NOT use for production agents.',
    });
    seedSkill(catalogRoot, 'product', 'product-skill', {
      description: 'Use when testing product search. Do NOT use for production agents.',
    });
    const catalog = loadCatalog({ catalogRoot });

    const hits = searchSkills(catalog, 'skill', 'product');

    expect(hits.map((hit) => hit.name)).toEqual(['product-skill']);
    expect(hits[0]?.category).toBe('product');
  });

  it('category desconhecida retorna lista vazia', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-search-empty-'));
    seedSkill(catalogRoot, 'testing', 'lonely-skill');
    const catalog = loadCatalog({ catalogRoot });

    expect(searchSkills(catalog, 'lonely', 'security')).toEqual([]);
  });

  it('query vazia ou genérica ainda limita-se a campos curtos', () => {
    const catalogRoot = mkdtempSync(path.join(tmpdir(), 'mcp-search-generic-'));
    seedSkill(catalogRoot, 'testing', 'generic-skill', {
      body: '# corpo que não pode aparecer na busca\n',
    });
    const catalog = loadCatalog({ catalogRoot });

    for (const query of ['', 'skill', '*']) {
      const hits = searchSkills(catalog, query);
      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits) {
        expect(Object.keys(hit).sort()).toEqual(['category', 'description', 'name', 'version']);
        expect(JSON.stringify(hit)).not.toContain('corpo que não pode aparecer');
      }
    }
  });
});
