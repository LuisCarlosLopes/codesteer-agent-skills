import { PathDeniedError } from './errors.ts';
import { findSkill, readVerifiedUtf8, resolveSkillDirectory, type LoadedCatalog } from './load.ts';
import { assertInManifest, classifySkillPath } from './paths.ts';

// @MindContext: Entrega pontual de references/ e templates/ após conferir SHA-256
// @MindSpec: Input skill_name + file_paths | Output {files:[{path,content}]} | Error PathDenied/HashMismatch/NotFound
// @MindRisk: scripts/ e traversal são recusados; mismatch não devolve conteúdo
// @MindTest: packages/mcp-server/src/catalog/fetch.spec.ts

export interface FetchSkillFilesResult {
  files: Array<{ path: string; content: string }>;
}

export function fetchSkillFiles(
  catalog: LoadedCatalog,
  skillName: string,
  filePaths: string[],
): FetchSkillFilesResult {
  const skill = findSkill(catalog, skillName);
  const skillDir = resolveSkillDirectory(catalog, skill);
  const files: Array<{ path: string; content: string }> = [];

  for (const requested of filePaths) {
    const kind = classifySkillPath(requested);
    if (kind !== 'reference' && kind !== 'template') {
      const reason = kind === 'script' ? 'scripts via fetch' : 'prefixo proibido';
      throw new PathDeniedError(requested, reason);
    }
    const manifest = assertInManifest(skill, requested);
    const content = readVerifiedUtf8(skillDir, manifest.path, manifest.contentHash);
    files.push({ path: manifest.path, content });
  }

  return { files };
}
