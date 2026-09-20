import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codeSteerIconSrc, ideLogos } from './catalog-brand.ts';
import { compileCatalog, defaultCompileOptions } from './compile-catalog.ts';
import type { RegistrySkill, SkillsRegistry } from './types.ts';

// @MindContext: Gerador de catálogo HTML estático — irmão do compile, não mistura SHA-256 com UI
// @MindFlow: Filtrar SkillsRegistry → escapar campos → template auto-contido (marca inline) → dist/index.html
// @MindSpec: Filtros category exact / name+description substring case-insensitive; vazio ou * omite o filtro
// @MindDecision: HTML auto-contido (CSS/JS/logos inline) para GitHub Pages; MCP importa esta função, sem spawn
// @MindRisk: XSS via description — escape obrigatório; não embutir corpo de SKILL.md nem files[].contentHash

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const SITE_URL = 'https://codesteer.vercel.app/';
const PAGES_URL = 'https://luiscarloslopes.github.io/codesteer-agent-skills/';

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

function renderSkillCard(skill: RegistrySkill): string {
  const name = escapeHtml(skill.name);
  const version = escapeHtml(skill.version);
  const category = escapeHtml(skill.category);
  const description = escapeHtml(skill.description);
  const dataName = escapeHtml(skill.name.toLowerCase());
  const dataCategory = escapeHtml(skill.category);
  const dataDescription = escapeHtml(skill.description.toLowerCase());

  return `<article class="skill-card" data-skill-card data-name="${dataName}" data-category="${dataCategory}" data-description="${dataDescription}">
  <header class="skill-card__header">
    <h2 class="skill-card__name">${name}</h2>
    <p class="skill-card__meta"><span class="skill-card__version">${version}</span> <span class="chip">${category}</span></p>
  </header>
  <p class="skill-card__description">${description}</p>
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

function renderBrandMark(className: string): string {
  const src = escapeHtml(codeSteerIconSrc());
  return `<img class="${className}" alt="CodeSteer Logo" width="32" height="32" src="${src}" />`;
}

function renderIdePills(): string {
  const pills = ideLogos()
    .map((logo) => {
      const alt = escapeHtml(logo.alt);
      const label = escapeHtml(logo.label);
      const src = escapeHtml(logo.src);
      const mono = logo.alt === 'OpenCode' ? '' : ' ide-pill--mono';
      return `<span class="ide-pill${mono}"><img alt="${alt}" width="20" height="20" src="${src}" /><span>${label}</span></span>`;
    })
    .join('');
  return `<section class="ide-row" aria-label="IDEs compatíveis">
  <p class="ide-row__label">Compatível com sua IDE</p>
  <div class="ide-pills">${pills}</div>
</section>`;
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
  color-scheme: dark light;
  --mind-bg: #08090d;
  --mind-bg-deep: #010203;
  --mind-text: #edf2f8;
  --mind-muted: #a2acb7;
  --mind-accent: #00b9b9;
  --mind-highlight: #8548fe;
  --mind-primary: #524ce3;
  --mind-border: #364452;
  --mind-surface: #1d2a37;
  --trust-emerald: #00d495;
  --hitl-red: #f92434;
  --gradient-mind: linear-gradient(135deg, #4f46e5, #7c3aed 55%, #06b6d4);
  --shadow-glow: 0 0 48px -16px #4f46e573;
  --font-display: ui-sans-serif, "Segoe UI", system-ui, sans-serif;
  --font-editorial: ui-sans-serif, "Segoe UI", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, monospace;
  --radius-card: 1rem;
  --radius-pill: 9999px;
}
@media (prefers-color-scheme: light) {
  :root {
    --mind-bg: #f4f7fb;
    --mind-bg-deep: #e8eef4;
    --mind-text: #14202c;
    --mind-muted: #5b6b7a;
    --mind-border: #d5dee8;
    --mind-surface: #ffffff;
  }
  .ide-pill--mono img { filter: invert(1); }
}
* { box-sizing: border-box; }
html { background: var(--mind-bg); }
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--mind-bg);
  color: var(--mind-text);
  font-family: var(--font-editorial);
  line-height: 1.5;
}
.skip-link {
  position: absolute;
  left: 1rem;
  top: -3rem;
  z-index: 20;
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-pill);
  background: var(--mind-surface);
  color: var(--mind-text);
}
.skip-link:focus { top: 1rem; }
.site-header, .site-footer {
  border-color: color-mix(in srgb, var(--mind-border) 50%, transparent);
}
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 0;
  width: 100%;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--mind-text);
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.03em;
}
.brand__logo, .site-footer img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  flex-shrink: 0;
}
.brand__name { font-size: 1.05rem; }
main {
  flex: 1;
  max-width: 72rem;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3.5rem;
}
.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(1.85rem, 3vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 0.65rem;
}
.lede { max-width: 38rem; margin: 0; color: var(--mind-muted); }
.meta { margin: 0.85rem 0 0; color: var(--mind-muted); font-family: var(--font-mono); font-size: 0.75rem; }
.ide-row { margin: 1.75rem 0 0.25rem; }
.ide-row__label {
  margin: 0 0 0.65rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--mind-muted) 80%, transparent);
}
.ide-pills { display: flex; flex-wrap: wrap; gap: 0.55rem; }
.ide-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--mind-border) 60%, transparent);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--mind-bg) 60%, transparent);
  font-size: 0.85rem;
  color: var(--mind-muted);
}
.ide-pill img { width: 1.25rem; height: 1.25rem; object-fit: contain; }
.filters {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
  margin: 1.5rem 0 1.25rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--mind-border) 60%, transparent);
  border-radius: var(--radius-card);
  background: color-mix(in srgb, var(--mind-surface) 40%, transparent);
}
@media (min-width: 720px) {
  .filters { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.filters__field { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; font-size: 0.85rem; color: var(--mind-muted); }
input, select {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--mind-border);
  border-radius: 0.65rem;
  padding: 0.55rem 0.7rem;
  background: var(--mind-bg-deep);
  color: var(--mind-text);
  font: inherit;
}
input:focus, select:focus, a:focus-visible, .skip-link:focus {
  outline: 2px solid var(--mind-accent);
  outline-offset: 2px;
}
.catalog {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
}
.skill-card {
  background: color-mix(in srgb, var(--mind-surface) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--mind-border) 60%, transparent);
  border-radius: var(--radius-card);
  padding: 1.1rem 1.15rem;
  box-shadow: var(--shadow-glow);
}
.skill-card__name {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 600;
}
.skill-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin: 0.45rem 0 0.75rem;
  font-size: 0.8rem;
  color: var(--mind-muted);
}
.skill-card__description { margin: 0; color: var(--mind-text); }
.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in srgb, var(--mind-accent) 35%, transparent);
  background: color-mix(in srgb, var(--mind-accent) 12%, transparent);
  color: var(--mind-accent);
  font-family: var(--font-mono);
  font-size: 0.7rem;
}
.empty {
  grid-column: 1 / -1;
  border: 1px dashed var(--mind-border);
  border-radius: var(--radius-card);
  padding: 1.25rem;
  color: var(--mind-muted);
}
.site-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  max-width: 72rem;
  width: 100%;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 2rem;
  border-top: 1px solid color-mix(in srgb, var(--mind-border) 40%, transparent);
  background: var(--mind-bg-deep);
  color: var(--mind-muted);
  font-size: 0.85rem;
}
.site-footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.site-footer strong { color: var(--mind-text); }
.site-footer a {
  color: var(--mind-accent);
  text-decoration: none;
}
.site-footer a:hover { color: var(--mind-text); }
.site-footer__links { display: flex; gap: 1rem; }`;

function renderDocument(registry: SkillsRegistry, skills: RegistrySkill[]): string {
  const cards = skills.map(renderSkillCard).join('\n');
  const emptyHidden = skills.length === 0 ? '' : ' hidden';
  const generatedAt = escapeHtml(registry.generatedAt);
  const countLabel = skills.length === 1 ? '1 skill' : `${skills.length} skills`;
  const brandHeader = renderBrandMark('brand__logo');
  const brandFooter = renderBrandMark('site-footer__logo');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Catálogo de skills — CodeSteer</title>
  <style>${PAGE_STYLES}</style>
</head>
<body>
  <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
  <header class="site-header">
    <a class="brand" href="#main-content">
      ${brandHeader}
      <span class="brand__name">CodeSteer</span>
    </a>
  </header>
  <main id="main-content">
    <header class="hero">
      <h1>Catálogo de skills</h1>
      <p class="lede">Filtre por categoria, nome e descrição. Skills para agentes de IA — o mesmo catálogo deste repositório, sem o corpo do SKILL.md.</p>
      <p class="meta" id="catalogo-contagem">${escapeHtml(countLabel)} · gerado em ${generatedAt}</p>
    </header>
    ${renderIdePills()}
    ${renderFilterControls(uniqueCategories(skills))}
    <section class="catalog" id="lista-skills" aria-live="polite">
      ${cards}
      <p class="empty" id="catalogo-vazio"${emptyHidden}>Nenhuma skill encontrada.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="site-footer__brand">
      ${brandFooter}
      <span><strong>CodeSteer</strong> · Catálogo de skills</span>
    </div>
    <div class="site-footer__links">
      <a href="${SITE_URL}">Site</a>
      <a href="${PAGES_URL}">GitHub Pages</a>
    </div>
  </footer>
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
