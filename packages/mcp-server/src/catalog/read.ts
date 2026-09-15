import { PathDeniedError } from './errors.ts';
import { findSkill, readVerifiedUtf8, resolveSkillDirectory, type LoadedCatalog } from './load.ts';

// @MindContext: Progressive disclosure — SKILL.md verificado + listas de paths, sem corpo de references/scripts
// @MindSpec: Input skill_name | Output {name,description,skill_md,references[],scripts[]} | Error NotFound/HashMismatch
// @MindRisk: Hash mismatch omite o corpo; references/scripts são só paths relativos
// @MindTest: packages/mcp-server/src/catalog/read.spec.ts

export interface ReadSkillResult {
  name: string;
  description: string;
  skill_md: string;
  references: string[];
  scripts: string[];
}

export function readSkill(catalog: LoadedCatalog, skillName: string): ReadSkillResult {
  const skill = findSkill(catalog, skillName);
  const skillDir = resolveSkillDirectory(catalog, skill);
  const skillMd = skill.files.find((file) => file.path === 'SKILL.md');
  if (!skillMd) {
    throw new PathDeniedError('SKILL.md', 'fora do manifesto');
  }

  const skill_md = readVerifiedUtf8(skillDir, 'SKILL.md', skillMd.contentHash);

  return {
    name: skill.name,
    description: skill.description,
    skill_md,
    references: skill.files.filter((file) => file.path.startsWith('references/')).map((file) => file.path),
    scripts: skill.files.filter((file) => file.path.startsWith('scripts/')).map((file) => file.path),
  };
}
