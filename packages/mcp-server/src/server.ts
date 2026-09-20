import { FastMCP } from '@prefecthq/fastmcp-ts/server';
import type { LoadedCatalog } from './catalog/load.ts';
import { registerFetchSkillFiles } from './tools/fetch-skill-files.ts';
import { registerGenerateCatalogHtml } from './tools/generate-catalog-html.ts';
import { registerPrepareSkillFiles } from './tools/prepare-skill-files.ts';
import { registerReadSkill } from './tools/read-skill.ts';
import { registerSearchSkills } from './tools/search-skills.ts';

// @MindContext: Fiação FastMCP stdio das quatro tools de progressive disclosure + generate_catalog_html
// @MindDecision: FastMCP oficial (@prefecthq/fastmcp-ts) com Zod; HTTP e embeddings ficam de fora
// @MindWhy: logLevel silent evita banner/logs do framework no stdio (stdout é JSON-RPC)
// @MindRisk: stdout é o protocolo MCP — logLevel silent e nenhum console.log no start
// @MindTest: packages/mcp-server/src/server.spec.ts

export const CATALOG_TOOL_NAMES = [
  'search_skills',
  'read_skill',
  'fetch_skill_files',
  'prepare_skill_files',
  'generate_catalog_html',
] as const;

export function createCatalogServer(catalog: LoadedCatalog): FastMCP {
  const server = new FastMCP({
    name: 'codesteer-agent-skills-catalog',
    version: '0.0.1',
    logLevel: 'silent',
  });

  registerSearchSkills(server, catalog);
  registerReadSkill(server, catalog);
  registerFetchSkillFiles(server, catalog);
  registerPrepareSkillFiles(server, catalog);
  registerGenerateCatalogHtml(server, catalog);

  return server;
}

export function listRegisteredToolNames(server: FastMCP): string[] {
  const internal = server as unknown as { _tools: Map<string, unknown> };
  if (internal._tools instanceof Map) {
    return [...internal._tools.keys()];
  }
  return [...CATALOG_TOOL_NAMES];
}
