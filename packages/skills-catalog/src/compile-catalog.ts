import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import type { RegistrySkill, SkillFrontmatter, SkillsRegistry } from './types.ts';

// @MindContext: Compilador de integridade — SHA-256 por arquivo vira contentHash do registry
// @MindFlow: Descobrir SKILL.md → parsear frontmatter → hashear arquivos → gravar dist/skills-registry.json
// @MindDecision: Artefato só em dist/ (gitignore); publish NPM fica fora desta fatia

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const REGISTRY_VERSION = '0.0.1';

export interface CompileOptions {
  skillsRoot: string;
  catalogRoot: string;
  outPath: string;
  generatedAt?: string;
}

export interface CompileResult {
  registry: SkillsRegistry;
  outPath: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseFrontmatter(content: string): SkillFrontmatter {
  const match = content.match(FRONTMATTER);
  if (!match) {
    throw new Error('SKILL.md sem frontmatter YAML');
  }
  const parsed: unknown = load(match[1]);
  if (!isRecord(parsed) || !isRecord(parsed.metadata) || !isRecord(parsed.compatibility) || !isRecord(parsed.sandbox)) {
    throw new Error('frontmatter inválido');
  }
  if (
    typeof parsed.name !== 'string' ||
    typeof parsed.description !== 'string' ||
    typeof parsed.metadata.version !== 'string' ||
    typeof parsed.metadata.author !== 'string' ||
    typeof parsed.metadata.license !== 'string' ||
    typeof parsed.compatibility.min_agent_tier !== 'number' ||
    typeof parsed.compatibility.requires_terminal !== 'boolean' ||
    typeof parsed.sandbox.network !== 'boolean' ||
    typeof parsed.sandbox.allow_exec !== 'boolean'
  ) {
    throw new Error('frontmatter incompleto');
  }
  return {
    name: parsed.name,
    description: parsed.description,
    metadata: {
      version: parsed.metadata.version,
      author: parsed.metadata.author,
      license: parsed.metadata.license,
    },
    compatibility: {
      min_agent_tier: parsed.compatibility.min_agent_tier,
      requires_terminal: parsed.compatibility.requires_terminal,
    },
    sandbox: {
      network: parsed.sandbox.network,
      allow_exec: parsed.sandbox.allow_exec,
    },
  };
}

function findSkillDirectories(skillsRoot: string): Array<{ category: string; name: string; dir: string }> {
  if (!existsSync(skillsRoot)) {
    return [];
  }
  const found: Array<{ category: string; name: string; dir: string }> = [];
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

function listSkillFiles(skillDir: string): string[] {
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name !== '.gitkeep') {
        files.push(full);
      }
    }
  };
  walk(skillDir);
  return files.sort((a, b) => a.localeCompare(b));
}

function sha256Hex(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export function compileCatalog(options: CompileOptions): CompileResult {
  const skills: RegistrySkill[] = findSkillDirectories(options.skillsRoot).map((skill) => {
    const skillMd = readFileSync(path.join(skill.dir, 'SKILL.md'), 'utf8');
    const frontmatter = parseFrontmatter(skillMd);
    const files = listSkillFiles(skill.dir).map((absolute) => ({
      path: path.relative(skill.dir, absolute).split(path.sep).join('/'),
      contentHash: sha256Hex(readFileSync(absolute)),
    }));

    return {
      name: frontmatter.name,
      description: frontmatter.description,
      version: frontmatter.metadata.version,
      author: frontmatter.metadata.author,
      license: frontmatter.metadata.license,
      category: skill.category,
      path: path.relative(options.catalogRoot, skill.dir).split(path.sep).join('/'),
      compatibility: frontmatter.compatibility,
      sandbox: frontmatter.sandbox,
      files,
    };
  });

  skills.sort((a, b) => a.name.localeCompare(b.name));

  const registry: SkillsRegistry = {
    version: REGISTRY_VERSION,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    skills,
  };

  mkdirSync(path.dirname(options.outPath), { recursive: true });
  writeFileSync(options.outPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

  return { registry, outPath: options.outPath };
}

export function defaultCompileOptions(repoRoot: string): CompileOptions {
  const catalogRoot = path.join(repoRoot, 'packages', 'skills-catalog');
  return {
    skillsRoot: path.join(catalogRoot, 'skills'),
    catalogRoot,
    outPath: path.join(catalogRoot, 'dist', 'skills-registry.json'),
  };
}

function isInvokedDirectly(): boolean {
  const current = fileURLToPath(import.meta.url);
  const invoked = process.argv[1];
  return invoked !== undefined && path.resolve(invoked) === path.resolve(current);
}

if (isInvokedDirectly()) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  compileCatalog(defaultCompileOptions(repoRoot));
}
