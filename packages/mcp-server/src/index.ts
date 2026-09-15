import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './catalog/load.ts';
import { createCatalogServer } from './server.ts';

export { loadCatalog } from './catalog/load.ts';
export { createCatalogServer, listRegisteredToolNames } from './server.ts';

function isInvokedDirectly(): boolean {
  const current = fileURLToPath(import.meta.url);
  const invoked = process.argv[1];
  return invoked !== undefined && path.resolve(invoked) === path.resolve(current);
}

export async function startCatalogMcp(): Promise<void> {
  const catalog = loadCatalog();
  const server = createCatalogServer(catalog);
  await server.run();
}

if (isInvokedDirectly()) {
  startCatalogMcp().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
