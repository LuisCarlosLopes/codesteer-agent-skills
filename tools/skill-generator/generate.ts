import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface GenerateSkillInput {
  category: string;
  name: string;
  catalogSkillsRoot: string;
  author?: string;
}

export interface GenerateSkillResult {
  ok: boolean;
  skillDir?: string;
  skillMdPath?: string;
  error?: string;
}

export function isKebabCase(value: string): boolean {
  return KEBAB_CASE.test(value);
}

export function renderSkillMarkdown(name: string, author: string): string {
  return `---
name: ${name}
description: Use when describing the task this skill should handle. Do NOT use for unrelated workflows.
metadata:
  version: 0.0.1
  author: "${author}"
  license: Apache-2.0
compatibility:
  min_agent_tier: 1
  requires_terminal: false
sandbox:
  network: false
  allow_exec: false
---

# ${name}

Replace this body with the skill instructions (max 500 lines). Put long manuals in references/.
`;
}

export function generateSkill(input: GenerateSkillInput): GenerateSkillResult {
  if (!isKebabCase(input.category) || !isKebabCase(input.name)) {
    return { ok: false, error: 'categoria e nome devem ser kebab-case' };
  }

  const skillDir = path.join(input.catalogSkillsRoot, input.category, input.name);
  if (existsSync(skillDir)) {
    return { ok: false, error: `skill já existe em ${skillDir}` };
  }

  const content = renderSkillMarkdown(input.name, input.author ?? '@codesteer');
  mkdirSync(skillDir, { recursive: true });
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  writeFileSync(skillMdPath, content, 'utf8');

  return { ok: true, skillDir, skillMdPath };
}

export function defaultCatalogSkillsRoot(repoRoot: string): string {
  return path.join(repoRoot, 'packages', 'skills-catalog', 'skills');
}

function isInvokedDirectly(): boolean {
  const current = fileURLToPath(import.meta.url);
  const invoked = process.argv[1];
  return invoked !== undefined && path.resolve(invoked) === path.resolve(current);
}

if (isInvokedDirectly()) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const category = process.argv[2];
  const name = process.argv[3];
  if (!category || !name) {
    console.error('uso: tsx tools/skill-generator/generate.ts <categoria> <nome-kebab>');
    process.exit(1);
  }
  const result = generateSkill({
    category,
    name,
    catalogSkillsRoot: defaultCatalogSkillsRoot(repoRoot),
  });
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }
}
