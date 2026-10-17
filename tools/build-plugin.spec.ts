import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { buildPlugin, checkPlugin, normalizeSkillMarkdown, PLUGIN_DIR, writePlugin } from './build-plugin.ts';

const fixturesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__/skills');
const AGENT_PLUGINS_NAME = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

function fixture(name: string): string {
  return path.join(fixturesRoot, name);
}

function readJson(build: ReturnType<typeof buildPlugin>, relative: string): Record<string, unknown> {
  const content = build.files.get(relative);
  expect(content, relative).toBeDefined();
  return JSON.parse(content!.toString('utf8')) as Record<string, unknown>;
}

function frontmatterOf(markdown: string): Record<string, unknown> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  expect(match).not.toBeNull();
  return load(match![1]) as Record<string, unknown>;
}

describe('build-plugin', () => {
  const build = buildPlugin({ skillsRoot: fixture('valid'), version: '1.2.3' });

  it('achata skills/<categoria>/<nome> em skills/<nome>', () => {
    expect(build.files.has(`${PLUGIN_DIR}/skills/canonical-skill/SKILL.md`)).toBe(true);
    expect([...build.files.keys()].some((key) => key.includes('/testing/'))).toBe(false);
  });

  it('normaliza o frontmatter para o spec agentskills.io', () => {
    const fm = frontmatterOf(build.files.get(`${PLUGIN_DIR}/skills/canonical-skill/SKILL.md`)!.toString('utf8'));
    expect(fm.name).toBe('canonical-skill');
    expect(fm.license).toBe('Apache-2.0');
    expect(typeof fm.compatibility).toBe('string');
    expect((fm.compatibility as string).length).toBeLessThanOrEqual(500);
    expect(fm.sandbox).toBeUndefined();
    const metadata = fm.metadata as Record<string, unknown>;
    expect(metadata.category).toBe('testing');
    expect(Object.values(metadata).every((value) => typeof value === 'string')).toBe(true);
  });

  it('preserva o corpo e repassa chaves de invocação', () => {
    const source = `---
name: passthrough
description: Use when testing. Do NOT use for production.
metadata:
  version: 0.0.1
  author: "@codesteer"
  license: Apache-2.0
compatibility:
  min_agent_tier: 2
  requires_terminal: true
sandbox:
  network: false
  allow_exec: true
user-invocable: true
disable-model-invocation: true
---

# Corpo

Linha final.
`;
    const output = normalizeSkillMarkdown(source, 'product');
    expect(output.endsWith('\n# Corpo\n\nLinha final.\n')).toBe(true);
    const fm = frontmatterOf(output);
    expect(fm['user-invocable']).toBe(true);
    expect(fm['disable-model-invocation']).toBe(true);
    expect(fm.compatibility).toContain('Requires terminal: yes');
  });

  it('emite manifests de plugin válidos por plataforma', () => {
    const agentPlugins = readJson(build, `${PLUGIN_DIR}/plugin.json`);
    expect(Object.keys(agentPlugins).sort()).toEqual(['$schema', 'description', 'name']);
    expect(agentPlugins.$schema).toBe('https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
    expect(agentPlugins.name).toMatch(AGENT_PLUGINS_NAME);
    expect(agentPlugins.name).not.toMatch(/--|\.\./);

    const claude = readJson(build, `${PLUGIN_DIR}/.claude-plugin/plugin.json`);
    expect(claude.name).toBe(agentPlugins.name);
    expect(claude.name).not.toMatch(/^(claude-|anthropic-)/);

    expect(readJson(build, `${PLUGIN_DIR}/.cursor-plugin/plugin.json`).version).toBe('1.2.3');
    expect(readJson(build, `${PLUGIN_DIR}/gemini-extension.json`).version).toBe('1.2.3');
  });

  it('emite marketplaces apontando para a pasta do plugin', () => {
    const claude = readJson(build, '.claude-plugin/marketplace.json');
    expect((claude.plugins as Array<Record<string, unknown>>)[0].source).toBe(`./${PLUGIN_DIR}`);

    const codex = readJson(build, '.agents/plugins/marketplace.json');
    const codexEntry = (codex.plugins as Array<Record<string, unknown>>)[0];
    expect(codexEntry.source).toEqual({ source: 'local', path: `./${PLUGIN_DIR}` });
    expect(codexEntry.policy).toBeDefined();
    expect(codexEntry.category).toBeDefined();

    const cursor = readJson(build, '.cursor-plugin/marketplace.json');
    expect((cursor.plugins as Array<Record<string, unknown>>)[0].source).toBe(PLUGIN_DIR);
  });

  it('é determinístico', () => {
    const again = buildPlugin({ skillsRoot: fixture('valid'), version: '1.2.3' });
    expect([...again.files.keys()]).toEqual([...build.files.keys()]);
    for (const [key, content] of again.files) {
      expect(content.equals(build.files.get(key)!), key).toBe(true);
    }
  });

  it('rejeita catálogo inválido', () => {
    expect(() => buildPlugin({ skillsRoot: fixture('invalid-duplicate-name'), version: '1.2.3' })).toThrow(
      /duplicado/,
    );
  });

  it('--check acusa drift depois de editar a cópia ou sobrar arquivo', () => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), 'plugin-check-'));
    const skillsRoot = path.join(repoRoot, 'skills');
    cpSync(fixture('valid'), skillsRoot, { recursive: true });
    const fresh = buildPlugin({ skillsRoot, version: '1.2.3' });
    writePlugin(repoRoot, fresh);
    expect(checkPlugin(repoRoot, fresh)).toEqual([]);

    const copied = path.join(repoRoot, PLUGIN_DIR, 'skills', 'canonical-skill', 'SKILL.md');
    writeFileSync(copied, 'editado à mão\n', 'utf8');
    writeFileSync(path.join(repoRoot, PLUGIN_DIR, 'stale.md'), 'sobra\n', 'utf8');
    expect(checkPlugin(repoRoot, fresh)).toEqual([
      `${PLUGIN_DIR}/skills/canonical-skill/SKILL.md`,
      `${PLUGIN_DIR}/stale.md`,
    ]);
  });
});
