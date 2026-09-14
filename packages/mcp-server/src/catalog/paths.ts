import path from 'node:path';
import type { RegistrySkill } from '../../../skills-catalog/src/index.ts';
import { PathDeniedError } from './errors.ts';

// @MindContext: Normalização de file_paths do manifesto contra path traversal
// @MindSpec: Input relativo kebab | Output path POSIX | Error PathDenied (absoluto, .., escape, fora do manifesto)
// @MindRisk: Path absoluto ou `..` nunca pode resolver fora do diretório da skill

export type SkillPathKind = 'skill_md' | 'reference' | 'template' | 'script' | 'other';

const POSIX_SEP = '/';

export function normalizeSkillRelativePath(filePath: string): string {
  if (filePath.includes('\0')) {
    throw new PathDeniedError(filePath, 'nulo');
  }
  const posix = filePath.replace(/\\/g, POSIX_SEP).trim();
  if (posix === '' || posix === '.') {
    throw new PathDeniedError(filePath, 'vazio');
  }
  if (path.posix.isAbsolute(posix) || path.win32.isAbsolute(filePath) || posix.startsWith('~/')) {
    throw new PathDeniedError(filePath, 'absoluto');
  }
  const parts = posix.split(POSIX_SEP);
  if (parts.some((part) => part === '..')) {
    throw new PathDeniedError(filePath, 'traversal');
  }
  const cleaned = parts.filter((part) => part !== '' && part !== '.');
  if (cleaned.length === 0) {
    throw new PathDeniedError(filePath, 'vazio');
  }
  return cleaned.join(POSIX_SEP);
}

export function classifySkillPath(filePath: string): SkillPathKind {
  const normalized = normalizeSkillRelativePath(filePath);
  if (normalized === 'SKILL.md') {
    return 'skill_md';
  }
  if (normalized.startsWith('references/')) {
    return 'reference';
  }
  if (normalized.startsWith('templates/')) {
    return 'template';
  }
  if (normalized.startsWith('scripts/')) {
    return 'script';
  }
  return 'other';
}

export function resolveSafeSkillFile(skillDir: string, relativePath: string): string {
  const normalized = normalizeSkillRelativePath(relativePath);
  const root = path.resolve(skillDir);
  const resolved = path.resolve(root, ...normalized.split(POSIX_SEP));
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(prefix)) {
    throw new PathDeniedError(relativePath, 'escape');
  }
  return resolved;
}

export function assertInManifest(
  skill: RegistrySkill,
  relativePath: string,
): { path: string; contentHash: string } {
  const normalized = normalizeSkillRelativePath(relativePath);
  const file = skill.files.find((entry) => entry.path === normalized);
  if (!file) {
    throw new PathDeniedError(relativePath, 'fora do manifesto');
  }
  return file;
}
