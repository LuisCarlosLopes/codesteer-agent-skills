import type { FastMCP } from '@prefecthq/fastmcp-ts/server';
import { z } from 'zod';
import type { LoadedCatalog } from '../catalog/load.ts';
import { prepareSkillFiles } from '../catalog/prepare.ts';

export const prepareSkillFilesInputSchema = z.object({
  skill_name: z.string(),
  file_paths: z.array(z.string()),
  dry_run: z.boolean(),
});

export function registerPrepareSkillFiles(server: FastMCP, catalog: LoadedCatalog): void {
  server.tool(
    {
      name: 'prepare_skill_files',
      description:
        'Copia paths do manifesto (exceto SKILL.md) para o staging local. Não executa. Recusa allow_exec false.',
      input: prepareSkillFilesInputSchema,
    },
    ({ skill_name, file_paths, dry_run }) =>
      prepareSkillFiles(catalog, skill_name, file_paths, { dryRun: dry_run }),
  );
}
