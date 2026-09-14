export interface SkillFrontmatter {
  name: string;
  description: string;
  metadata: {
    version: string;
    author: string;
    license: string;
  };
  compatibility: {
    min_agent_tier: number;
    requires_terminal: boolean;
  };
  sandbox: {
    network: boolean;
    allow_exec: boolean;
  };
}

export interface RegistrySkill {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  category: string;
  path: string;
  compatibility: { min_agent_tier: number; requires_terminal: boolean };
  sandbox: { network: boolean; allow_exec: boolean };
  files: Array<{ path: string; contentHash: string }>;
}

export interface SkillsRegistry {
  version: string;
  generatedAt: string;
  skills: RegistrySkill[];
}
