import type { FastMCP } from '@prefecthq/fastmcp-ts/server';
import { z } from 'zod';
import type { LoadedCatalog } from '../catalog/load.ts';
import { searchSkills } from '../catalog/search.ts';

export const searchSkillsInputSchema = z.object({
  query: z.string(),
  category: z.string().optional(),
});

export function registerSearchSkills(server: FastMCP, catalog: LoadedCatalog): void {
  server.tool(
    {
      name: 'search_skills',
      description:
        'Busca skills do catálogo local por nome e descrição (fuzzy). Devolve só campos curtos, sem SKILL.md.',
      input: searchSkillsInputSchema,
    },
    ({ query, category }) => searchSkills(catalog, query, category),
  );
}
