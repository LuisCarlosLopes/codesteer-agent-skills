import { copyFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ExecDeniedError, PathDeniedError } from './errors.ts';
import { revisionHashFromContentHashes } from './hash.ts';
import { findSkill, readVerifiedUtf8, resolveSkillDirectory, type LoadedCatalog } from './load.ts';
import { assertInManifest, classifySkillPath, resolveSafeSkillFile } from './paths.ts';

// @MindContext: Staging local de scripts/ e paths do manifesto, sem executar e sem container
// @MindFlow: Recusar allow_exec false → validar paths/hash → dry_run ou copiar para staged/<revision-hash>
// @MindDecision: stagingRoot injetável nos testes; default de produção é ~/.cache/agent-skills/staged
// @MindRisk: SKILL.md e traversal recusados; hash mismatch aborta antes de escrever
// @MindTest: packages/mcp-server/src/catalog/prepare.spec.ts

export interface PrepareSkillFilesResult {
  skill_dir: string;
  files: string[];
  dry_run: boolean;
}

export interface PrepareSkillFilesOptions {
  dryRun: boolean;
  stagingRoot?: string;
}

export function defaultStagingRoot(): string {
  return path.join(os.homedir(), '.cache', 'agent-skills', 'staged');
}

export function prepareSkillFiles(
  catalog: LoadedCatalog,
  skillName: string,
  filePaths: string[],
  options: PrepareSkillFilesOptions,
): PrepareSkillFilesResult {
  const skill = findSkill(catalog, skillName);
  if (!skill.sandbox.allow_exec) {
    throw new ExecDeniedError(skillName);
  }

  const skillDir = resolveSkillDirectory(catalog, skill);
  const normalized: string[] = [];

  for (const requested of filePaths) {
    const kind = classifySkillPath(requested);
    if (kind === 'skill_md') {
      throw new PathDeniedError(requested, 'SKILL.md via prepare');
    }
    const manifest = assertInManifest(skill, requested);
    readVerifiedUtf8(skillDir, manifest.path, manifest.contentHash);
    normalized.push(manifest.path);
  }

  const revision = revisionHashFromContentHashes(skill.files.map((file) => file.contentHash));
  const stagingRoot = options.stagingRoot ?? defaultStagingRoot();
  const destSkillDir = path.join(path.resolve(stagingRoot), revision);

  if (!options.dryRun) {
    for (const relative of normalized) {
      const source = resolveSafeSkillFile(skillDir, relative);
      const destination = path.join(destSkillDir, ...relative.split('/'));
      mkdirSync(path.dirname(destination), { recursive: true });
      copyFileSync(source, destination);
    }
  }

  return {
    skill_dir: destSkillDir,
    files: normalized,
    dry_run: options.dryRun,
  };
}
