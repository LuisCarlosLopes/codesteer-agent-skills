import Fuse from 'fuse.js';
import type { LoadedCatalog } from './load.ts';

// @MindContext: Discovery fuzzy do catálogo — só campos curtos, sem corpo de SKILL.md
// @MindDecision: Fuse.js em name+description; embeddings/cosseno ficam para fatia futura
// @MindSpec: Input query + category opcional | Output {name,description,category,version}[] | category desconhecida → []

export interface SkillSearchHit {
  name: string;
  description: string;
  category: string;
  version: string;
}

function toHit(skill: SkillSearchHit): SkillSearchHit {
  return {
    name: skill.name,
    description: skill.description,
    category: skill.category,
    version: skill.version,
  };
}

export function searchSkills(catalog: LoadedCatalog, query: string, category?: string): SkillSearchHit[] {
  const pool = category
    ? catalog.registry.skills.filter((skill) => skill.category === category)
    : catalog.registry.skills;

  if (pool.length === 0) {
    return [];
  }

  const trimmed = query.trim();
  if (trimmed === '' || trimmed === '*') {
    return pool.map(toHit);
  }

  const fuse = new Fuse(pool, {
    keys: ['name', 'description'],
    threshold: 0.4,
    ignoreLocation: true,
  });

  return fuse.search(trimmed).map((result) => toHit(result.item));
}
