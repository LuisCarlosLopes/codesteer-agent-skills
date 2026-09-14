import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// @MindContext: Scanner heurístico de scripts/prompt — mínimo bloqueante sem Snyk
// @MindRisk: Não detecta jailbreak semântico; falha só padrões explícitos de script e README
// @MindSpec: Input = pasta da skill | Output = exit 0 | Error = exit 1

export interface ScanResult {
  ok: boolean;
  violations: string[];
}

const DESTRUCTIVE_RM = /rm\s+-rf\s+\//;
const CURL_PIPE_BASH = /curl[^|\n]*\|\s*bash/i;
const SECRET_NAMES = /AWS_SECRET_ACCESS_KEY|OPENAI_API_KEY/;

interface SkillLocation {
  category: string;
  name: string;
  dir: string;
}

function findSkillDirectories(skillsRoot: string): SkillLocation[] {
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

function listFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        files.push(full);
      }
    }
  };
  walk(root);
  return files;
}

export function scanSkillsRoot(skillsRoot: string): ScanResult {
  const violations: string[] = [];

  for (const skill of findSkillDirectories(skillsRoot)) {
    const label = `${skill.category}/${skill.name}`;

    if (existsSync(path.join(skill.dir, 'README.md'))) {
      violations.push(`${label}: README.md é proibido na pasta da skill`);
    }

    const scriptsDir = path.join(skill.dir, 'scripts');
    for (const file of listFiles(scriptsDir)) {
      const content = readFileSync(file, 'utf8');
      const relative = path.relative(skill.dir, file);
      if (DESTRUCTIVE_RM.test(content)) {
        violations.push(`${label}: ${relative} contém rm -rf /`);
      }
      if (CURL_PIPE_BASH.test(content) || /curl\s*\|\s*bash/i.test(content)) {
        violations.push(`${label}: ${relative} contém curl | bash`);
      }
      if (SECRET_NAMES.test(content)) {
        violations.push(`${label}: ${relative} referencia AWS_SECRET_ACCESS_KEY ou OPENAI_API_KEY`);
      }
    }
  }

  return { ok: violations.length === 0, violations };
}

function isInvokedDirectly(): boolean {
  const current = fileURLToPath(import.meta.url);
  const invoked = process.argv[1];
  return invoked !== undefined && path.resolve(invoked) === path.resolve(current);
}

if (isInvokedDirectly()) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const skillsRoot = path.join(repoRoot, 'packages', 'skills-catalog', 'skills');
  const result = scanSkillsRoot(skillsRoot);
  if (!result.ok) {
    for (const violation of result.violations) {
      console.error(violation);
    }
    process.exit(1);
  }
}
