import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { generateCatalogHtml } from './generate-catalog-html.ts';
import type { RegistrySkill, SkillsRegistry } from './types.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function sampleSkill(overrides: Partial<RegistrySkill> = {}): RegistrySkill {
  return {
    name: 'alpha-skill',
    description: 'Use when listing the catalog. Do NOT use for production agents.',
    version: '0.0.1',
    author: '@codesteer',
    license: 'Apache-2.0',
    category: 'testing',
    path: 'skills/testing/alpha-skill',
    compatibility: { min_agent_tier: 1, requires_terminal: false },
    sandbox: { network: false, allow_exec: false },
    files: [{ path: 'SKILL.md', contentHash: 'deadbeefcafebabe0123456789abcdef0123456789abcdef0123456789abcdef' }],
    ...overrides,
  };
}

function registryOf(skills: RegistrySkill[], generatedAt = '2026-09-20T12:00:00.000Z'): SkillsRegistry {
  return { version: '0.0.1', generatedAt, skills };
}

describe('generate-catalog-html', () => {
  it('grava HTML com name, category, description das skills do registry', () => {
    const outPath = path.join(mkdtempSync(path.join(tmpdir(), 'catalog-html-write-')), 'index.html');
    const skill = sampleSkill({
      name: 'pipeline-canary',
      category: 'testing',
      description: 'Use when verifying the catalog pipeline. Do NOT use for production agents.',
      version: '0.0.1',
      sandbox: { network: true, allow_exec: true },
    });

    const result = generateCatalogHtml({ registry: registryOf([skill]), outPath });

    expect(result.outPath).toBe(outPath);
    expect(result.skillCount).toBe(1);
    const html = readFileSync(outPath, 'utf8');
    expect(html).toContain('pipeline-canary');
    expect(html).toContain('testing');
    expect(html).toContain('Use when verifying the catalog pipeline. Do NOT use for production agents.');
    expect(html).toContain('0.0.1');
    expect(html).toContain('Rede: sim');
    expect(html).toContain('Execução: sim');
  });

  it('HTML contém controles de filtro por categoria, nome e descrição', () => {
    const { html } = generateCatalogHtml({ registry: registryOf([sampleSkill()]) });

    expect(html).toContain('id="filtro-categoria"');
    expect(html).toContain('id="filtro-nome"');
    expect(html).toContain('id="filtro-descricao"');
    expect(html).toContain('Filtrar por categoria');
    expect(html).toContain('Filtrar por nome');
    expect(html).toContain('Filtrar por descrição');
    expect(html).toContain('Catálogo de skills');
  });

  it('registry vazio emite HTML válido e skillCount 0', () => {
    const result = generateCatalogHtml({ registry: registryOf([]) });

    expect(result.skillCount).toBe(0);
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('id="filtro-categoria"');
    expect(result.html).toContain('id="filtro-nome"');
    expect(result.html).toContain('id="filtro-descricao"');
    expect(result.html).toContain('Nenhuma skill encontrada.');
    expect(result.html).not.toMatch(/<article class="skill-card"/);
  });

  it('filtro category exact exclui outras categorias', () => {
    const testing = sampleSkill({ name: 'test-skill', category: 'testing' });
    const product = sampleSkill({ name: 'product-skill', category: 'product' });

    const result = generateCatalogHtml({
      registry: registryOf([testing, product]),
      filters: { category: 'product' },
    });

    expect(result.skillCount).toBe(1);
    expect(result.html).toContain('product-skill');
    expect(result.html).not.toContain('test-skill');
  });

  it('filtros name e description são substring case-insensitive', () => {
    const grill = sampleSkill({
      name: 'codesteer-grill-me',
      description: 'Use when grilling a plan. Do NOT use for production agents.',
      category: 'product',
    });
    const smoke = sampleSkill({
      name: 'pipeline-canary',
      description: 'Use when compiling the catalog. Do NOT use for production agents.',
      category: 'testing',
    });

    const byName = generateCatalogHtml({
      registry: registryOf([grill, smoke]),
      filters: { name: 'GRILL' },
    });
    const byDescription = generateCatalogHtml({
      registry: registryOf([grill, smoke]),
      filters: { description: 'Compiling' },
    });
    const omitted = generateCatalogHtml({
      registry: registryOf([grill, smoke]),
      filters: { name: '*', description: '  ', category: '' },
    });

    expect(byName.skillCount).toBe(1);
    expect(byName.html).toContain('codesteer-grill-me');
    expect(byName.html).not.toContain('pipeline-canary');
    expect(byDescription.skillCount).toBe(1);
    expect(byDescription.html).toContain('pipeline-canary');
    expect(omitted.skillCount).toBe(2);
  });

  it('escapa tags HTML na description (não interpreta <script>)', () => {
    const skill = sampleSkill({
      description: 'Use when safe. Do NOT use for <script>alert(1)</script> payloads.',
    });

    const { html } = generateCatalogHtml({ registry: registryOf([skill]) });

    expect(html).toContain('Do NOT use for &lt;script&gt;alert(1)&lt;/script&gt; payloads.');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('não inclui contentHash nem corpo de SKILL.md', () => {
    const skill = sampleSkill({
      files: [{ path: 'SKILL.md', contentHash: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899' }],
    });
    const { html } = generateCatalogHtml({ registry: registryOf([skill]) });

    expect(html).not.toContain(skill.files[0]?.contentHash);
    expect(html).not.toContain('contentHash');
    expect(html).not.toContain('# secret body that must not leak');
    expect(html).not.toContain(skill.path);
  });

  it('mantém dist/ no gitignore', () => {
    const gitignore = readFileSync(path.join(repoRoot, '.gitignore'), 'utf8');
    const lines = gitignore.split(/\r?\n/);
    expect(lines).toContain('dist/');
  });

  it('README aponta para GitHub Pages e não replica tabelas do índice humano', () => {
    const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
    expect(readme).toContain('https://luiscarloslopes.github.io/codesteer-agent-skills/');
    expect(readme).toContain('pnpm catalog:html');
    expect(readme).toContain('generate_catalog_html');
    expect(readme).not.toMatch(/### Product\s*\n\s*\| Skill \|/);
    expect(readme).not.toMatch(/### Architecture\s*\n\s*\| Skill \|/);
  });

  it('ci.yml gera HTML no job skills e publica Pages só em push main/master', () => {
    const ci = readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).toContain('pnpm catalog:html');
    expect(ci).toMatch(/jobs:\s*\n\s*skills:/);
    expect(ci).toMatch(/^\s{2}pages:/m);
    expect(ci).toContain('github.event_name == \'push\'');
    expect(ci).toContain('packages/skills-catalog/dist');
    expect(ci).toContain('actions/upload-pages-artifact@v4');
    expect(ci).toContain('actions/deploy-pages@v4');
    expect(ci).toContain('environment:\n      name: github-pages');
    expect(ci).not.toContain('required_reviewers');
  });
});
