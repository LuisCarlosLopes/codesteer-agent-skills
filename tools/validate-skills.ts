import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import type { SkillFrontmatter } from '../packages/skills-catalog/src/types.ts';

// @MindContext: Gate estrutural do formato canônico (dec-002) antes do merge
// @MindSpec: Input = árvore skills/<categoria>/<nome>/SKILL.md | Output = exit 0 | Error = exit 1 + violações
// @MindRisk: Warning não pode ser tratado como sucesso — o gate é bloqueante

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BODY_LINES = 500;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export interface SkillLocation {
  category: string;
  name: string;
  dir: string;
}

export interface ValidationResult {
  ok: boolean;
  violations: string[];
}

export function isKebabCase(value: string): boolean {
  return KEBAB_CASE.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function parseSkillMarkdown(content: string): {
  frontmatter: SkillFrontmatter | null;
  body: string;
  error: string | null;
} {
  const match = content.match(FRONTMATTER);
  if (!match) {
    return { frontmatter: null, body: content, error: 'ausência de frontmatter YAML delimitado por ---' };
  }

  let parsed: unknown;
  try {
    parsed = load(match[1]);
  } catch {
    return { frontmatter: null, body: match[2] ?? '', error: 'frontmatter YAML inválido' };
  }

  const frontmatter = toFrontmatter(parsed);
  if (!frontmatter) {
    return { frontmatter: null, body: match[2] ?? '', error: 'frontmatter incompleto ou com tipos inválidos' };
  }

  return { frontmatter, body: match[2] ?? '', error: null };
}

function toFrontmatter(value: unknown): SkillFrontmatter | null {
  if (!isRecord(value)) {
    return null;
  }
  const metadata = value.metadata;
  const compatibility = value.compatibility;
  const sandbox = value.sandbox;
  if (
    typeof value.name !== 'string' ||
    typeof value.description !== 'string' ||
    !isRecord(metadata) ||
    typeof metadata.version !== 'string' ||
    typeof metadata.author !== 'string' ||
    typeof metadata.license !== 'string' ||
    !isRecord(compatibility) ||
    !isNumber(compatibility.min_agent_tier) ||
    !isBoolean(compatibility.requires_terminal) ||
    !isRecord(sandbox) ||
    !isBoolean(sandbox.network) ||
    !isBoolean(sandbox.allow_exec)
  ) {
    return null;
  }

  return {
    name: value.name,
    description: value.description,
    metadata: {
      version: metadata.version,
      author: metadata.author,
      license: metadata.license,
    },
    compatibility: {
      min_agent_tier: compatibility.min_agent_tier,
      requires_terminal: compatibility.requires_terminal,
    },
    sandbox: {
      network: sandbox.network,
      allow_exec: sandbox.allow_exec,
    },
  };
}

export function findSkillDirectories(skillsRoot: string): SkillLocation[] {
  if (!existsSync(skillsRoot)) {
    return [];
  }

  const found: SkillLocation[] = [];
  for (const category of readdirSync(skillsRoot)) {
    const categoryDir = path.join(skillsRoot, category);
    if (!statSync(categoryDir).isDirectory()) {
      continue;
    }
    for (const name of readdirSync(categoryDir)) {
      const skillDir = path.join(categoryDir, name);
      if (!statSync(skillDir).isDirectory()) {
        continue;
      }
      if (existsSync(path.join(skillDir, 'SKILL.md'))) {
        found.push({ category, name, dir: skillDir });
      }
    }
  }
  return found;
}

function listRelativeFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        files.push(path.relative(root, full));
      }
    }
  };
  walk(root);
  return files;
}

function fileStem(relativePath: string): string {
  const base = path.basename(relativePath);
  if (base === 'SKILL.md' || base === '.gitkeep') {
    return base;
  }
  const ext = path.extname(base);
  return ext ? base.slice(0, -ext.length) : base;
}

export function validateSkillsRoot(skillsRoot: string): ValidationResult {
  const violations: string[] = [];
  const skills = findSkillDirectories(skillsRoot);

  for (const skill of skills) {
    const label = `${skill.category}/${skill.name}`;

    if (!isKebabCase(skill.category)) {
      violations.push(`${label}: categoria deve ser kebab-case`);
    }
    if (!isKebabCase(skill.name)) {
      violations.push(`${label}: pasta da skill deve ser kebab-case`);
    }

    const readme = path.join(skill.dir, 'README.md');
    if (existsSync(readme)) {
      violations.push(`${label}: README.md é proibido na pasta da skill`);
    }

    for (const relative of listRelativeFiles(skill.dir)) {
      const segments = relative.split(path.sep);
      for (const segment of segments.slice(0, -1)) {
        if (!isKebabCase(segment)) {
          violations.push(`${label}: pasta "${segment}" deve ser kebab-case`);
        }
      }
      const stem = fileStem(relative);
      if (stem !== 'SKILL.md' && stem !== '.gitkeep' && !isKebabCase(stem)) {
        violations.push(`${label}: arquivo "${relative}" deve ser kebab-case`);
      }
    }

    const skillMdPath = path.join(skill.dir, 'SKILL.md');
    const content = readFileSync(skillMdPath, 'utf8');
    const parsed = parseSkillMarkdown(content);
    if (parsed.error || !parsed.frontmatter) {
      violations.push(`${label}: ${parsed.error ?? 'SKILL.md inválido'}`);
      continue;
    }

    const fm = parsed.frontmatter;
    if (fm.name !== skill.name) {
      violations.push(`${label}: name do frontmatter (${fm.name}) difere do nome da pasta`);
    }
    if (!isKebabCase(fm.name)) {
      violations.push(`${label}: name do frontmatter deve ser kebab-case`);
    }
    if (!fm.description.includes('Use when')) {
      violations.push(`${label}: description deve conter "Use when"`);
    }
    if (!fm.description.includes('Do NOT use for')) {
      violations.push(`${label}: description deve conter "Do NOT use for"`);
    }

    const bodyLines = parsed.body.length === 0 ? 0 : parsed.body.split(/\r?\n/).length;
    if (bodyLines > MAX_BODY_LINES) {
      violations.push(`${label}: corpo de SKILL.md excede ${MAX_BODY_LINES} linhas (${bodyLines})`);
    }
  }

  return { ok: violations.length === 0, violations };
}

export function defaultSkillsRoot(repoRoot: string): string {
  return path.join(repoRoot, 'packages', 'skills-catalog', 'skills');
}

function isInvokedDirectly(): boolean {
  const current = fileURLToPath(import.meta.url);
  const invoked = process.argv[1];
  return invoked !== undefined && path.resolve(invoked) === path.resolve(current);
}

if (isInvokedDirectly()) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = validateSkillsRoot(defaultSkillsRoot(repoRoot));
  if (!result.ok) {
    for (const violation of result.violations) {
      console.error(violation);
    }
    process.exit(1);
  }
}
