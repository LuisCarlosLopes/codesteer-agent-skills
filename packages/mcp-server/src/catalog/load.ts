import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compileCatalog,
  type CompileOptions,
  type RegistrySkill,
  type SkillsRegistry,
} from '../../../skills-catalog/src/index.ts';
import { HashMismatchError, NotFoundError } from './errors.ts';
import { hashesMatch, sha256Hex } from './hash.ts';
import { resolveSafeSkillFile } from './paths.ts';

// @MindContext: Carrega o registry em memória a partir do catálogo Git local no start do MCP
// @MindFlow: Resolver ASP_CATALOG_ROOT → compileCatalog → indexar skills por name
// @MindDecision: Reusar compileCatalog; fonte é o disco do workspace, não HTTP/CDN
// @MindWhy: Import relativo ao index.ts do catálogo — Vitest não resolve o alias TS sem vitest.config (fora do mapa)
// @MindRisk: Compile grava dist/ no catálogo alvo — testes devem apontar tmpdir, nunca o oficial
// @MindTest: packages/mcp-server/src/catalog/load.spec.ts

export interface LoadedCatalog {
  catalogRoot: string;
  registry: SkillsRegistry;
}

export function compileOptionsForCatalog(catalogRoot: string): CompileOptions {
  return {
    skillsRoot: path.join(catalogRoot, 'skills'),
    catalogRoot,
    outPath: path.join(catalogRoot, 'dist', 'skills-registry.json'),
  };
}

export function resolveCatalogRoot(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): string {
  const override = env.ASP_CATALOG_ROOT?.trim();
  if (override) {
    return path.resolve(override);
  }
  const fromCwd = path.join(cwd, 'packages', 'skills-catalog');
  if (existsSync(path.join(fromCwd, 'skills'))) {
    return path.resolve(fromCwd);
  }
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../skills-catalog');
}

export function loadCatalog(options?: {
  catalogRoot?: string;
  env?: NodeJS.ProcessEnv;
  cwd?: string;
}): LoadedCatalog {
  const catalogRoot = options?.catalogRoot ?? resolveCatalogRoot(options?.env, options?.cwd);
  const { registry } = compileCatalog(compileOptionsForCatalog(catalogRoot));
  return { catalogRoot, registry };
}

export function findSkill(catalog: LoadedCatalog, skillName: string): RegistrySkill {
  const skill = catalog.registry.skills.find((entry) => entry.name === skillName);
  if (!skill) {
    throw new NotFoundError(skillName);
  }
  return skill;
}

export function resolveSkillDirectory(catalog: LoadedCatalog, skill: RegistrySkill): string {
  return path.join(catalog.catalogRoot, ...skill.path.split('/'));
}

export function readVerifiedUtf8(skillDir: string, relativePath: string, expectedHash: string): string {
  const absolute = resolveSafeSkillFile(skillDir, relativePath);
  const content = readFileSync(absolute);
  if (!hashesMatch(sha256Hex(content), expectedHash)) {
    throw new HashMismatchError(relativePath);
  }
  return content.toString('utf8');
}
