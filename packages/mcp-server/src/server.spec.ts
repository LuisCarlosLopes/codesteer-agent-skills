import { describe, expect, it } from 'vitest';
import { CATALOG_TOOL_NAMES, createCatalogServer, listRegisteredToolNames } from './server.ts';

describe('server', () => {
  it('registra search_skills, read_skill, fetch_skill_files, prepare_skill_files', () => {
    const server = createCatalogServer({
      catalogRoot: '/tmp/unused-catalog',
      registry: { version: '0.0.1', generatedAt: '2026-09-14T00:00:00.000Z', skills: [] },
    });

    const names = listRegisteredToolNames(server);
    expect(names.sort()).toEqual([...CATALOG_TOOL_NAMES].sort());
    expect(names).toEqual(
      expect.arrayContaining(['search_skills', 'read_skill', 'fetch_skill_files', 'prepare_skill_files']),
    );
  });
});
