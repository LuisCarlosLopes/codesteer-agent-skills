import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dump, load } from 'js-yaml';
import { defaultSkillsRoot, findSkillDirectories, parseSkillMarkdown, validateSkillsRoot } from './validate-skills.ts';

// @MindContext: Empacota o catálogo como plugin instalável (Agent Plugins 1.0 + manifests de Claude, Cursor e Gemini)
// @MindFlow: Validar → achatar skills/<categoria>/<nome> em skills/<nome> → normalizar frontmatter → emitir manifests e marketplaces
// @MindSpec: Input = árvore canônica | Output = plugins/codesteer-skills/** + 3 marketplaces na raiz | --check = exit 1 se o disco divergir
// @MindDecision: Saída versionada (o plugin é instalado clonando o repo) e determinística — o CI compara com --check
// @MindRisk: A cópia nunca é editada à mão; o frontmatter normalizado diverge do canônico de propósito (spec agentskills.io)

export const PLUGIN_NAME = 'codesteer-skills';
export const MARKETPLACE_NAME = 'codesteer';
export const PLUGIN_DIR = path.posix.join('plugins', PLUGIN_NAME);

const AGENT_PLUGINS_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const REPOSITORY = 'https://github.com/LuisCarlosLopes/codesteer-agent-skills';
const HOMEPAGE = 'https://luiscarloslopes.github.io/codesteer-agent-skills/';
const OWNER = { name: 'Luis Carlos Lopes Jr.' };
const LICENSE = 'Apache-2.0';
const DESCRIPTION =
  'Catálogo codesteer de skills para agentes de IA: arquitetura, automação, criativo, frontend, marketing, produto, engenharia de prompt, segurança e testes.';
const KEYWORDS = ['agent-skills', 'skills', 'prompt-engineering', 'product', 'marketing', 'frontend'];

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const PASSTHROUGH_KEYS = ['disable-model-invocation', 'user-invocable'] as const;
const EXCLUDED_DIRS = new Set(['evals']);
const MAX_COMPATIBILITY_CHARS = 500;

export interface BuildPluginOptions {
  skillsRoot: string;
  version: string;
}

export interface PluginBuild {
  /** Caminho POSIX relativo à raiz do repo → conteúdo. */
  files: Map<string, Buffer>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toJson(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function listSkillFiles(skillDir: string): string[] {
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (current === skillDir && EXCLUDED_DIRS.has(entry.name)) {
          continue;
        }
        walk(full);
      } else {
        files.push(path.relative(skillDir, full).split(path.sep).join('/'));
      }
    }
  };
  walk(skillDir);
  return files.sort();
}

function yesNo(value: boolean): string {
  return value ? 'yes' : 'no';
}

/**
 * Reescreve o frontmatter canônico no formato do spec agentskills.io:
 * `metadata` vira mapa string→string e `compatibility` vira texto. O corpo é preservado byte a byte.
 */
export function normalizeSkillMarkdown(content: string, category: string): string {
  const parsed = parseSkillMarkdown(content);
  const match = content.match(FRONTMATTER);
  if (parsed.error || !parsed.frontmatter || !match) {
    throw new Error(`SKILL.md inválido: ${parsed.error ?? 'frontmatter ausente'}`);
  }
  const fm = parsed.frontmatter;
  const raw: unknown = load(match[1]);
  const extras = isRecord(raw) ? raw : {};

  const compatibility = [
    `Minimum agent tier: ${fm.compatibility.min_agent_tier}.`,
    `Requires terminal: ${yesNo(fm.compatibility.requires_terminal)}.`,
    `Network access: ${yesNo(fm.sandbox.network)}.`,
    `Script execution: ${yesNo(fm.sandbox.allow_exec)}.`,
  ].join(' ');
  if (compatibility.length > MAX_COMPATIBILITY_CHARS) {
    throw new Error(`compatibility excede ${MAX_COMPATIBILITY_CHARS} caracteres`);
  }

  const normalized: Record<string, unknown> = {
    name: fm.name,
    description: fm.description.trim(),
    license: fm.metadata.license,
    compatibility,
    metadata: {
      version: fm.metadata.version,
      author: fm.metadata.author,
      category,
      'min-agent-tier': String(fm.compatibility.min_agent_tier),
      'requires-terminal': String(fm.compatibility.requires_terminal),
      'sandbox-network': String(fm.sandbox.network),
      'sandbox-allow-exec': String(fm.sandbox.allow_exec),
    },
  };
  for (const key of PASSTHROUGH_KEYS) {
    if (key in extras) {
      normalized[key] = extras[key];
    }
  }

  const yaml = dump(normalized, { lineWidth: -1, noRefs: true, quotingType: '"' });
  return `---\n${yaml}---\n${parsed.body}`;
}

function pluginManifests(version: string): Record<string, unknown> {
  return {
    // Agent Plugins 1.0 — mínimo de propósito: o schema fechado do Antigravity só aceita name/description
    'plugin.json': { $schema: AGENT_PLUGINS_SCHEMA, name: PLUGIN_NAME, description: DESCRIPTION },
    // Claude Code: sem version → cada commit é uma versão nova (updates automáticos)
    '.claude-plugin/plugin.json': {
      name: PLUGIN_NAME,
      description: DESCRIPTION,
      author: OWNER,
      homepage: HOMEPAGE,
      repository: REPOSITORY,
      license: LICENSE,
      keywords: KEYWORDS,
    },
    '.cursor-plugin/plugin.json': {
      name: PLUGIN_NAME,
      version,
      description: DESCRIPTION,
      author: OWNER,
      homepage: HOMEPAGE,
      repository: REPOSITORY,
      license: LICENSE,
      keywords: KEYWORDS,
    },
    'gemini-extension.json': { name: PLUGIN_NAME, version, description: DESCRIPTION },
  };
}

function marketplaces(version: string): Record<string, unknown> {
  return {
    // Também lido por Copilot CLI/VS Code, Codex (legado) e import de marketplace do ChatGPT (source em string simples)
    '.claude-plugin/marketplace.json': {
      name: MARKETPLACE_NAME,
      owner: OWNER,
      metadata: { description: DESCRIPTION, version },
      plugins: [
        {
          name: PLUGIN_NAME,
          source: `./${PLUGIN_DIR}`,
          description: DESCRIPTION,
          category: 'productivity',
          keywords: KEYWORDS,
        },
      ],
    },
    '.agents/plugins/marketplace.json': {
      name: MARKETPLACE_NAME,
      interface: { displayName: 'Codesteer' },
      plugins: [
        {
          name: PLUGIN_NAME,
          source: { source: 'local', path: `./${PLUGIN_DIR}` },
          policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
          category: 'Productivity',
        },
      ],
    },
    '.cursor-plugin/marketplace.json': {
      name: MARKETPLACE_NAME,
      owner: OWNER,
      metadata: { description: DESCRIPTION, version },
      plugins: [{ name: PLUGIN_NAME, source: PLUGIN_DIR, description: DESCRIPTION }],
    },
  };
}

function pluginReadme(skillNames: string[]): string {
  return `# ${PLUGIN_NAME}

> Gerado por \`pnpm build:plugin\` a partir de \`packages/skills-catalog/skills/\`. Não edite esta pasta à mão.

${DESCRIPTION}

| Plataforma | Instalação |
|---|---|
| Claude Code | \`/plugin marketplace add LuisCarlosLopes/codesteer-agent-skills\` → \`/plugin install ${PLUGIN_NAME}@${MARKETPLACE_NAME}\` |
| OpenAI Codex | \`codex plugin marketplace add LuisCarlosLopes/codesteer-agent-skills\` → \`codex plugin add ${PLUGIN_NAME}@${MARKETPLACE_NAME}\` |
| GitHub Copilot CLI | \`copilot plugin marketplace add LuisCarlosLopes/codesteer-agent-skills\` → \`copilot plugin install ${PLUGIN_NAME}@${MARKETPLACE_NAME}\` |
| VS Code (Copilot) | \`chat.plugins.marketplaces\`: \`["LuisCarlosLopes/codesteer-agent-skills"]\` |
| Cursor | Customize → Plugins → From GitHub Repository → \`${REPOSITORY}\` |
| Gemini CLI | \`gemini extensions install ${REPOSITORY}\` (usa o archive do GitHub Release) |
| Antigravity | \`agy plugin install <clone>/${PLUGIN_DIR}\` |

Skills incluídas (${skillNames.length}): ${skillNames.map((name) => `\`${name}\``).join(', ')}.
`;
}

export function buildPlugin(options: BuildPluginOptions): PluginBuild {
  const validation = validateSkillsRoot(options.skillsRoot);
  if (!validation.ok) {
    throw new Error(`catálogo inválido:\n${validation.violations.join('\n')}`);
  }

  const files = new Map<string, Buffer>();
  const skills = findSkillDirectories(options.skillsRoot).sort((a, b) => a.name.localeCompare(b.name));

  for (const skill of skills) {
    for (const relative of listSkillFiles(skill.dir)) {
      const source = readFileSync(path.join(skill.dir, ...relative.split('/')));
      const target = path.posix.join(PLUGIN_DIR, 'skills', skill.name, relative);
      const content =
        relative === 'SKILL.md'
          ? Buffer.from(normalizeSkillMarkdown(source.toString('utf8'), skill.category), 'utf8')
          : source;
      files.set(target, content);
    }
  }

  for (const [relative, manifest] of Object.entries(pluginManifests(options.version))) {
    files.set(path.posix.join(PLUGIN_DIR, relative), toJson(manifest));
  }
  files.set(
    path.posix.join(PLUGIN_DIR, 'README.md'),
    Buffer.from(pluginReadme(skills.map((skill) => skill.name)), 'utf8'),
  );
  for (const [relative, manifest] of Object.entries(marketplaces(options.version))) {
    files.set(relative, toJson(manifest));
  }

  return { files };
}

function listDiskFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        files.push(full);
      }
    }
  };
  walk(root);
  return files;
}

/** Apaga e recria plugins/codesteer-skills/; os marketplaces da raiz são sobrescritos individualmente. */
export function writePlugin(repoRoot: string, build: PluginBuild): void {
  rmSync(path.join(repoRoot, PLUGIN_DIR), { recursive: true, force: true });
  for (const [relative, content] of build.files) {
    const target = path.join(repoRoot, ...relative.split('/'));
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

/** Retorna os caminhos que divergem do disco (ausentes, alterados ou sobrando no plugin). */
export function checkPlugin(repoRoot: string, build: PluginBuild): string[] {
  const drift: string[] = [];
  for (const [relative, content] of build.files) {
    const target = path.join(repoRoot, ...relative.split('/'));
    if (!existsSync(target) || !readFileSync(target).equals(content)) {
      drift.push(relative);
    }
  }
  for (const file of listDiskFiles(path.join(repoRoot, PLUGIN_DIR))) {
    const relative = path.relative(repoRoot, file).split(path.sep).join('/');
    if (!build.files.has(relative)) {
      drift.push(relative);
    }
  }
  return drift.sort();
}

export function defaultBuildOptions(repoRoot: string): BuildPluginOptions {
  const pkg: unknown = JSON.parse(readFileSync(path.join(repoRoot, 'packages', 'skills-catalog', 'package.json'), 'utf8'));
  if (!isRecord(pkg) || typeof pkg.version !== 'string') {
    throw new Error('packages/skills-catalog/package.json sem version');
  }
  return { skillsRoot: defaultSkillsRoot(repoRoot), version: pkg.version };
}

function isInvokedDirectly(): boolean {
  const current = fileURLToPath(import.meta.url);
  const invoked = process.argv[1];
  return invoked !== undefined && path.resolve(invoked) === path.resolve(current);
}

if (isInvokedDirectly()) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const build = buildPlugin(defaultBuildOptions(repoRoot));
  if (process.argv.includes('--check')) {
    const drift = checkPlugin(repoRoot, build);
    if (drift.length > 0) {
      console.error('plugin fora de sincronia com o catálogo — rode `pnpm build:plugin` e commite:');
      for (const relative of drift) {
        console.error(`  ${relative}`);
      }
      process.exit(1);
    }
  } else {
    writePlugin(repoRoot, build);
    console.log(`plugin gerado em ${PLUGIN_DIR} (${build.files.size} arquivos)`);
  }
}
