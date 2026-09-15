import type { FastMCP } from '@prefecthq/fastmcp-ts/server';
import { z } from 'zod';
import { fetchSkillFiles } from '../catalog/fetch.ts';
import type { LoadedCatalog } from '../catalog/load.ts';

export const fetchSkillFilesInputSchema = z.object({
  skill_name: z.string(),
  file_paths: z.array(z.string()),
});

export function registerFetchSkillFiles(server: FastMCP, catalog: LoadedCatalog): void {
  server.tool(
    {
      name: 'fetch_skill_files',
      description:
        'Entrega o texto de arquivos sob references/ ou templates/ após conferir SHA-256. Recusa scripts/.',
      input: fetchSkillFilesInputSchema,
    },
    ({ skill_name, file_paths }) => fetchSkillFiles(catalog, skill_name, file_paths),
  );
}
