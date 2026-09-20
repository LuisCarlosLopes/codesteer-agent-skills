import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileCatalog, defaultCompileOptions } from './compile-catalog.ts';
import type { RegistrySkill, SkillsRegistry } from './types.ts';

// @MindContext: Gerador de catálogo HTML estático — irmão do compile, não mistura SHA-256 com UI
// @MindFlow: Filtrar SkillsRegistry → escapar campos → template auto-contido → dist/index.html
// @MindSpec: Filtros category exact / name+description substring case-insensitive; vazio ou * omite o filtro
// @MindDecision: HTML auto-contido (CSS/JS inline) para GitHub Pages; MCP importa esta função, sem spawn
// @MindRisk: XSS via description — escape obrigatório; não embutir corpo de SKILL.md nem files[].contentHash

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export interface CatalogHtmlFilters {
  category?: string;
  name?: string;
  description?: string;
}

export interface GenerateCatalogHtmlOptions {
  registry: SkillsRegistry;
  filters?: CatalogHtmlFilters;
  outPath?: string;
}

export interface GenerateCatalogHtmlResult {
  html: string;
  skillCount: number;
  generatedAt: string;
  outPath?: string;
}

export function defaultHtmlOutPath(catalogRoot: string): string {
  return path.join(catalogRoot, 'dist', 'index.html');
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE[char] ?? char);
}

function omittedFilter(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' || trimmed === '*';
}

export function filterRegistrySkills(skills: RegistrySkill[], filters?: CatalogHtmlFilters): RegistrySkill[] {
  const category = omittedFilter(filters?.category) ? undefined : filters?.category?.trim();
  const nameNeedle = omittedFilter(filters?.name) ? undefined : filters?.name?.trim().toLowerCase();
  const descriptionNeedle = omittedFilter(filters?.description)
    ? undefined
    : filters?.description?.trim().toLowerCase();

  return skills.filter((skill) => {
    if (category !== undefined && skill.category !== category) {
      return false;
    }
    if (nameNeedle !== undefined && !skill.name.toLowerCase().includes(nameNeedle)) {
      return false;
    }
    if (descriptionNeedle !== undefined && !skill.description.toLowerCase().includes(descriptionNeedle)) {
      return false;
    }
    return true;
  });
}

function uniqueCategories(skills: RegistrySkill[]): string[] {
  return [...new Set(skills.map((skill) => skill.category))].sort((a, b) => a.localeCompare(b));
}

function sandboxLabel(skill: RegistrySkill): string {
  const network = skill.sandbox.network ? 'sim' : 'não';
  const exec = skill.sandbox.allow_exec ? 'sim' : 'não';
  return `Rede: ${network} · Execução: ${exec}`;
}

function renderSkillCard(skill: RegistrySkill): string {
  const name = escapeHtml(skill.name);
  const version = escapeHtml(skill.version);
  const category = escapeHtml(skill.category);
  const description = escapeHtml(skill.description);
  const sandbox = escapeHtml(sandboxLabel(skill));
  const dataName = escapeHtml(skill.name.toLowerCase());
  const dataCategory = escapeHtml(skill.category);
  const dataDescription = escapeHtml(skill.description.toLowerCase());

  return `<article class="skill-card" data-skill-card data-name="${dataName}" data-category="${dataCategory}" data-description="${dataDescription}">
  <header class="skill-card__header">
    <h2 class="skill-card__name">${name}</h2>
    <p class="skill-card__meta"><span class="skill-card__version">${version}</span> · <span class="skill-card__category">${category}</span></p>
  </header>
  <p class="skill-card__description">${description}</p>
  <p class="skill-card__sandbox">${sandbox}</p>
</article>`;
}

function renderFilterControls(categories: string[]): string {
  const options = ['<option value="">Todas</option>']
    .concat(categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`))
    .join('');

  return `<form class="filters" id="filtros-catalogo" autocomplete="off">
  <label class="filters__field">
    <span>Categoria</span>
    <select id="filtro-categoria" name="categoria" aria-label="Filtrar por categoria">${options}</select>
  </label>
  <label class="filters__field">
    <span>Nome</span>
    <input id="filtro-nome" name="nome" type="search" placeholder="Filtrar por nome" aria-label="Filtrar por nome" />
  </label>
  <label class="filters__field">
    <span>Descrição</span>
    <input id="filtro-descricao" name="descricao" type="search" placeholder="Filtrar por descrição" aria-label="Filtrar por descrição" />
  </label>
</form>`;
}

const CLIENT_FILTER_SCRIPT = `(() => {
  const categoryInput = document.getElementById("filtro-categoria");
  const nameInput = document.getElementById("filtro-nome");
  const descriptionInput = document.getElementById("filtro-descricao");
  const empty = document.getElementById("catalogo-vazio");
  const cards = Array.from(document.querySelectorAll("[data-skill-card]"));
  const apply = () => {
    const category = categoryInput instanceof HTMLSelectElement ? categoryInput.value : "";
    const name = nameInput instanceof HTMLInputElement ? nameInput.value.trim().toLowerCase() : "";
    const description = descriptionInput instanceof HTMLInputElement ? descriptionInput.value.trim().toLowerCase() : "";
    let visible = 0;
    for (const card of cards) {
      if (!(card instanceof HTMLElement)) continue;
      const matchCategory = !category || card.dataset.category === category;
      const matchName = !name || (card.dataset.name || "").includes(name);
      const matchDescription = !description || (card.dataset.description || "").includes(description);
      const show = matchCategory && matchName && matchDescription;
      card.hidden = !show;
      if (show) visible += 1;
    }
    if (empty instanceof HTMLElement) empty.hidden = visible !== 0;
  };
  categoryInput?.addEventListener("change", apply);
  nameInput?.addEventListener("input", apply);
  descriptionInput?.addEventListener("input", apply);
  apply();
})();`;

const PAGE_STYLES = `:root {
  color-scheme: light dark;
  --bg: #0f1419;
  --surface: #1a222c;
  --border: #2c3947;
  --text: #e8eef4;
  --muted: #9aa8b6;
  --accent: #7dd3c0;
  font-family: "Segoe UI", system-ui, sans-serif;
}
@media (prefers-color-scheme: light) {
  :root {
    --bg: #f4f7fb;
    --surface: #ffffff;
    --border: #d5dee8;
    --text: #14202c;
    --muted: #5b6b7a;
    --accent: #0f766e;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}
main { max-width: 920px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
h1 { font-size: 1.75rem; margin: 0 0 0.5rem; }
.lede, .meta, .skill-card__meta, .skill-card__sandbox { color: var(--muted); }
.filters {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin: 1.5rem 0 1.25rem;
}
.filters__field { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem; }
input, select {
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  padding: 0.5rem 0.65rem;
  background: var(--surface);
  color: var(--text);
}
.catalog { display: grid; gap: 0.9rem; }
.skill-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.7rem;
  padding: 1rem 1.1rem;
}
.skill-card__name { margin: 0; font-size: 1.05rem; }
.skill-card__meta { margin: 0.2rem 0 0.7rem; font-size: 0.85rem; }
.skill-card__description { margin: 0 0 0.7rem; }
.skill-card__sandbox { margin: 0; font-size: 0.85rem; }
.skill-card__category { color: var(--accent); }
.empty { border: 1px dashed var(--border); border-radius: 0.7rem; padding: 1.25rem; color: var(--muted); }`;

function renderDocument(registry: SkillsRegistry, skills: RegistrySkill[]): string {
  const cards = skills.map(renderSkillCard).join('\n');
  const emptyHidden = skills.length === 0 ? '' : ' hidden';
  const generatedAt = escapeHtml(registry.generatedAt);
  const countLabel = skills.length === 1 ? '1 skill' : `${skills.length} skills`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Catálogo de skills</title>
  <style>${PAGE_STYLES}</style>
</head>
<body>
  <main>
    <header>
      <h1>Catálogo de skills</h1>
      <p class="lede">Filtre por categoria, nome e descrição. Os dados vêm do registry compilado — sem corpo de SKILL.md.</p>
      <p class="meta" id="catalogo-contagem">${escapeHtml(countLabel)} · gerado em ${generatedAt}</p>
    </header>
    ${renderFilterControls(uniqueCategories(skills))}
    <section class="catalog" id="lista-skills" aria-live="polite">
      ${cards}
      <p class="empty" id="catalogo-vazio"${emptyHidden}>Nenhuma skill encontrada.</p>
    </section>
  </main>
  <script>${CLIENT_FILTER_SCRIPT}</script>
</body>
</html>
`;
}

export function generateCatalogHtml(options: GenerateCatalogHtmlOptions): GenerateCatalogHtmlResult {
  const skills = filterRegistrySkills(options.registry.skills, options.filters);
  const html = renderDocument(options.registry, skills);
  const result: GenerateCatalogHtmlResult = {
    html,
    skillCount: skills.length,
    generatedAt: options.registry.generatedAt,
  };

  if (options.outPath !== undefined && options.outPath.trim() !== '') {
    const outPath = options.outPath;
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, 'utf8');
    result.outPath = outPath;
  }

  return result;
}

function isInvokedDirectly(): boolean {
  const current = fileURLToPath(import.meta.url);
  const invoked = process.argv[1];
  return invoked !== undefined && path.resolve(invoked) === path.resolve(current);
}

if (isInvokedDirectly()) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const compileOptions = defaultCompileOptions(repoRoot);
  const { registry, outPath } = compileCatalog(compileOptions);
  generateCatalogHtml({
    registry,
    outPath: path.join(path.dirname(outPath), 'index.html'),
  });
}
