import type { FastMCP } from '@prefecthq/fastmcp-ts/server';
import { z } from 'zod';
import { generateCatalogHtml, type GenerateCatalogHtmlResult } from '../../../skills-catalog/src/index.ts';
import type { LoadedCatalog } from '../catalog/load.ts';

export const generateCatalogHtmlInputSchema = z.object({
  category: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  out_path: z.string().optional(),
});

export type GenerateCatalogHtmlInput = z.infer<typeof generateCatalogHtmlInputSchema>;

export function generateCatalogHtmlForCatalog(
  catalog: LoadedCatalog,
  input: GenerateCatalogHtmlInput,
): GenerateCatalogHtmlResult {
  return generateCatalogHtml({
    registry: catalog.registry,
    filters: {
      category: input.category,
      name: input.name,
      description: input.description,
    },
    outPath: input.out_path,
  });
}

export function registerGenerateCatalogHtml(server: FastMCP, catalog: LoadedCatalog): void {
  server.tool(
    {
      name: 'generate_catalog_html',
      description:
        'Gera HTML auto-contido do catálogo para humanos (filtros opcionais de categoria, nome e descrição). Não é passo de progressive disclosure e não substitui search_skills.',
      input: generateCatalogHtmlInputSchema,
    },
    (input) => generateCatalogHtmlForCatalog(catalog, input),
  );
}
