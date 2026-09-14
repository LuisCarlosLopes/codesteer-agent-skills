import type { FastMCP } from '@prefecthq/fastmcp-ts/server';
import { z } from 'zod';
import type { LoadedCatalog } from '../catalog/load.ts';
import { readSkill } from '../catalog/read.ts';

export const readSkillInputSchema = z.object({
  skill_name: z.string(),
});

export function registerReadSkill(server: FastMCP, catalog: LoadedCatalog): void {
  server.tool(
    {
      name: 'read_skill',
      description:
        'Lê SKILL.md após conferir SHA-256 e lista paths de references/ e scripts/ sem o conteúdo delas.',
      input: readSkillInputSchema,
    },
    ({ skill_name }) => readSkill(catalog, skill_name),
  );
}
