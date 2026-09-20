import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codeSteerIconSrc, ideLogos } from './catalog-brand.ts';
import { compileCatalog, defaultCompileOptions } from './compile-catalog.ts';
import type { RegistrySkill, SkillsRegistry } from './types.ts';

// @MindContext: Gerador de catálogo HTML estático — irmão do compile, não mistura SHA-256 com UI
// @MindFlow: Filtrar SkillsRegistry → escapar campos → template auto-contido (marca inline) → dist/index.html
// @MindSpec: Filtros category exact / name+description substring case-insensitive; vazio ou * omite o filtro
// @MindDecision: HTML auto-contido com Tailwind CDN, Google Fonts, Material Symbols e SVGs de IDE inline
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

export function escapeHtml(value: string | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE[char] ?? char);
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

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  architecture: { bg: 'bg-badge-arch-bg', text: 'text-badge-arch-text', border: 'border-badge-arch-text/20' },
  product: { bg: 'bg-badge-product-bg', text: 'text-badge-product-text', border: 'border-badge-product-text/20' },
  security: { bg: 'bg-badge-security-bg', text: 'text-badge-security-text', border: 'border-badge-security-text/20' },
  testing: { bg: 'bg-badge-testing-bg', text: 'text-badge-testing-text', border: 'border-badge-testing-text/20' },
};

const SKILL_THEME_TAGS: Record<string, string> = {
  'codesteer-advanced-elicitation': 'Prompt elicitation',
  'codesteer-agno-architect': 'Python Multi-agent',
  'codesteer-electron': 'CDP Desktop Automation',
  'codesteer-grill-me': 'Adversarial Spec Review',
  'codesteer-instruction-densifier': 'Prompt Optimization',
  'design-to-html': 'Pure Static HTML/CSS',
  'lgpd-implementation': 'Data Privacy & Compliance',
  'pipeline-canary': 'CI/CD & Healthcheck',
};

function renderSkillCard(skill: RegistrySkill): string {
  const name = escapeHtml(skill.name);
  const version = escapeHtml(skill.version);
  const category = escapeHtml(skill.category);
  const rawDescription = skill.description.trim();
  const description = escapeHtml(rawDescription);
  const dataName = escapeHtml(skill.name.toLowerCase());
  const dataCategory = escapeHtml(skill.category);
  const dataDescription = escapeHtml(rawDescription.toLowerCase());

  const catStyle = CATEGORY_STYLES[skill.category] ?? {
    bg: 'bg-badge-default-bg',
    text: 'text-badge-default-text',
    border: 'border-surface-border/60',
  };

  const tagLabel = SKILL_THEME_TAGS[skill.name] ?? escapeHtml(skill.category);

  // Divide descricao entre corpo e 'Do NOT use' se presente
  let descBodyHtml: string;
  const doNotUseMatch = rawDescription.match(/\bDo NOT use\b/i);
  if (doNotUseMatch && doNotUseMatch.index !== undefined) {
    const mainPart = rawDescription.slice(0, doNotUseMatch.index).trim();
    const doNotUsePart = rawDescription.slice(doNotUseMatch.index).trim();
    descBodyHtml = `<p>${escapeHtml(mainPart)}</p>
<div class="p-2.5 rounded-lg bg-surface-canvas border border-surface-border/60 font-body-sm text-body-sm text-error/90 flex items-start gap-2">
  <span class="material-symbols-outlined text-[16px] text-error shrink-0 mt-0.5">block</span>
  <span>${escapeHtml(doNotUsePart)}</span>
</div>`;
  } else {
    descBodyHtml = `<p>${description}</p>`;
  }

  return `<article class="skill-card group bg-surface-card border border-surface-border hover:border-surface-border-hover rounded-xl p-space-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" data-skill-card data-name="${dataName}" data-category="${dataCategory}" data-description="${dataDescription}" data-raw-desc="${description}">
  <div class="flex flex-col gap-space-sm">
    <div class="flex items-start justify-between gap-space-xs">
      <div class="flex-1 min-w-0">
        <h2 class="font-title-code text-title-code text-text-primary break-words font-semibold group-hover:text-primary transition-colors">
          ${name}
        </h2>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span class="font-label-code text-label-code px-2 py-0.5 rounded bg-badge-default-bg text-badge-default-text border border-surface-border/60">
            ${version}
          </span>
          <span class="font-badge-label text-badge-label px-2.5 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text} uppercase tracking-wider font-semibold border ${catStyle.border}">
            ${category}
          </span>
        </div>
      </div>
      <button class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-canvas transition-colors" onclick="copyText('${name}', 'Slug copiado!')" title="Copiar identificador">
        <span class="material-symbols-outlined text-[18px]">content_copy</span>
      </button>
    </div>
    <div class="space-y-2.5 pt-1 text-text-secondary font-body-md text-body-md leading-relaxed">
      ${descBodyHtml}
    </div>
  </div>
  <div class="mt-space-md pt-space-sm border-t border-surface-border flex items-center justify-between">
    <span class="font-label-code text-label-code text-text-muted">${tagLabel}</span>
  </div>
</article>`;
}

function renderFilterControls(
  categories: string[],
  categoryCounts: Record<string, number>,
  totalCount: number,
): string {
  const options = ['<option value="all">Todas as categorias</option>']
    .concat(
      categories.map(
        (category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`,
      ),
    )
    .join('');

  const pills = [
    `<button class="cat-pill active px-3 py-1 rounded-full text-xs font-medium font-body-sm bg-primary text-on-primary shadow-xs transition-all flex items-center gap-1.5" data-cat="all" onclick="selectCategoryPill('all')">
  <span>Todas</span>
  <span class="px-1.5 py-0.2 rounded-full text-[10px] font-label-code bg-white/20">${totalCount}</span>
</button>`,
  ]
    .concat(
      categories.map((category) => {
        const style = CATEGORY_STYLES[category] ?? {
          bg: 'bg-badge-default-bg',
          text: 'text-badge-default-text',
          border: 'border-surface-border/60',
        };
        const count = categoryCounts[category] ?? 0;
        return `<button class="cat-pill px-3 py-1 rounded-full text-xs font-medium font-body-sm ${style.bg} ${style.text} border ${style.border} hover:border-current transition-all flex items-center gap-1.5" data-cat="${escapeHtml(category)}" onclick="selectCategoryPill('${escapeHtml(category)}')">
  <span>${escapeHtml(category)}</span>
  <span class="px-1.5 py-0.2 rounded-full text-[10px] font-label-code bg-black/5 dark:bg-white/10">${count}</span>
</button>`;
      }),
    )
    .join('\n');

  return `<div class="sticky top-16 z-30 bg-surface-canvas/95 backdrop-blur-md pb-space-md pt-1 mb-space-md">
  <div class="bg-surface-card rounded-2xl border border-surface-border shadow-sm p-space-sm md:p-space-md flex flex-col gap-space-sm">
    <form class="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center" id="filtros-catalogo" autocomplete="off" onsubmit="return false;">
      <div class="md:col-span-3 relative">
        <label class="block font-label-caps text-label-caps text-text-muted mb-1 uppercase tracking-wider" for="filtro-categoria">
          Filtrar por categoria
        </label>
        <div class="relative">
          <select class="w-full h-10 pl-3 pr-8 rounded-lg bg-surface-canvas border border-surface-border text-text-primary font-body-sm text-body-sm focus:border-primary focus:bg-surface-card focus:outline-none transition-all appearance-none cursor-pointer" id="filtro-categoria" name="categoria" aria-label="Filtrar por categoria" onchange="applyFilters()">
            ${options}
          </select>
          <span class="material-symbols-outlined absolute right-2.5 top-2.5 text-[20px] text-text-muted pointer-events-none">expand_more</span>
        </div>
      </div>
      <div class="md:col-span-4 relative">
        <label class="block font-label-caps text-label-caps text-text-muted mb-1 uppercase tracking-wider" for="filtro-nome">
          Filtrar por nome
        </label>
        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-3 text-[18px] text-text-muted pointer-events-none">tag</span>
          <input class="w-full h-10 pl-9 pr-14 rounded-lg bg-surface-canvas border border-surface-border text-text-primary font-body-sm text-body-sm placeholder:text-text-muted focus:border-primary focus:bg-surface-card focus:outline-none transition-all" id="filtro-nome" name="nome" type="search" placeholder="Filtrar por nome" aria-label="Filtrar por nome" oninput="applyFilters()" />
          <kbd class="hidden sm:inline-flex absolute right-2 px-1.5 py-0.5 text-[10px] font-label-code text-text-muted bg-surface-card border border-surface-border rounded shadow-2xs pointer-events-none">⌘K</kbd>
        </div>
      </div>
      <div class="md:col-span-5 relative">
        <label class="block font-label-caps text-label-caps text-text-muted mb-1 uppercase tracking-wider" for="filtro-descricao">
          Filtrar por descrição
        </label>
        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-3 text-[18px] text-text-muted pointer-events-none">manage_search</span>
          <input class="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-canvas border border-surface-border text-text-primary font-body-sm text-body-sm placeholder:text-text-muted focus:border-primary focus:bg-surface-card focus:outline-none transition-all" id="filtro-descricao" name="descricao" type="search" placeholder="Filtrar por descrição" aria-label="Filtrar por descrição" oninput="applyFilters()" />
          <button class="hidden absolute right-2 text-text-muted hover:text-text-primary p-1 rounded" id="clear-search-btn" type="button" onclick="clearAllFilters()">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    </form>
    <div class="flex flex-wrap items-center justify-between gap-space-xs pt-space-2xs border-t border-surface-border/50">
      <div class="flex flex-wrap items-center gap-1.5" id="category-pills">
        ${pills}
      </div>
      <div class="font-label-code text-label-code text-text-muted flex items-center gap-2">
        <span>Mostrando: <strong class="text-text-primary" id="visible-count">${totalCount}</strong> de ${totalCount} skills</span>
        <button class="text-primary hover:underline text-xs hidden" id="reset-filters-btn" type="button" onclick="clearAllFilters()">Limpar filtros</button>
      </div>
    </div>
  </div>
</div>`;
}

function renderBrandMark(className: string): string {
  const src = escapeHtml(codeSteerIconSrc());
  return `<img class="${className}" alt="CodeSteer Logo" width="36" height="36" src="${src}" />`;
}

function renderIdePills(): string {
  const pills = ideLogos()
    .map((logo) => {
      const alt = escapeHtml(logo.alt);
      const label = escapeHtml(logo.label);
      const src = escapeHtml(logo.src);
      const monoClass = logo.alt === 'OpenCode' ? '' : ' brightness-0';
      return `<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-canvas border border-surface-border hover:border-primary/50 text-text-primary font-body-sm text-body-sm transition-all shadow-xs cursor-default">
  <img alt="${alt}" width="16" height="16" class="w-4 h-4 object-contain${monoClass}" src="${src}" />
  <span class="font-medium">${label}</span>
</div>`;
    })
    .join('\n');

  return `<div class="mt-space-sm pt-space-sm border-t border-surface-border/70 flex flex-col gap-space-xs">
  <span class="font-label-caps text-label-caps text-text-muted uppercase tracking-wider">
    Compatível com sua IDE & Agentes
  </span>
  <div class="flex flex-wrap items-center gap-space-2xs">
    ${pills}
  </div>
</div>`;
}

const CLIENT_FILTER_SCRIPT = `(() => {
  let selectedCategory = 'all';

  const categoryInput = document.getElementById("filtro-categoria") || document.getElementById("filter-category");
  const nameInput = document.getElementById("filtro-nome") || document.getElementById("filter-name");
  const descriptionInput = document.getElementById("filtro-descricao") || document.getElementById("filter-desc");
  const empty = document.getElementById("catalogo-vazio");
  const visibleCountEl = document.getElementById("visible-count");
  const resetBtn = document.getElementById("reset-filters-btn");
  const clearBtn = document.getElementById("clear-search-btn");
  const cards = Array.from(document.querySelectorAll("[data-skill-card]"));

  window.applyFilters = () => {
    const category = categoryInput instanceof HTMLSelectElement ? categoryInput.value : selectedCategory;
    const name = nameInput instanceof HTMLInputElement ? nameInput.value.trim().toLowerCase() : "";
    const description = descriptionInput instanceof HTMLInputElement ? descriptionInput.value.trim().toLowerCase() : "";
    
    selectedCategory = category;
    syncPillState(category);

    let visible = 0;
    for (const card of cards) {
      if (!(card instanceof HTMLElement)) continue;
      const cardCategory = card.dataset.category || "";
      const cardName = card.dataset.name || "";
      const cardDesc = (card.dataset.description || "") + " " + card.innerText.toLowerCase();

      const matchCategory = !category || category === 'all' || cardCategory === category;
      const matchName = !name || cardName.includes(name);
      const matchDescription = !description || cardDesc.includes(description);
      const show = matchCategory && matchName && matchDescription;

      card.hidden = !show;
      if (show) {
        card.classList.remove('hidden');
        visible += 1;
      } else {
        card.classList.add('hidden');
      }
    }

    if (visibleCountEl instanceof HTMLElement) visibleCountEl.textContent = String(visible);

    if (empty instanceof HTMLElement) {
      empty.hidden = visible !== 0;
      if (visible === 0) {
        empty.classList.remove('hidden');
        empty.classList.add('flex');
      } else {
        empty.classList.add('hidden');
        empty.classList.remove('flex');
      }
    }

    const hasFilter = (name !== "") || (description !== "") || (category !== "all" && category !== "");
    if (resetBtn instanceof HTMLElement) {
      if (hasFilter) resetBtn.classList.remove('hidden');
      else resetBtn.classList.add('hidden');
    }
    if (clearBtn instanceof HTMLElement) {
      if (hasFilter) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
  };

  window.selectCategoryPill = (cat) => {
    selectedCategory = cat;
    if (categoryInput instanceof HTMLSelectElement) {
      categoryInput.value = cat;
    }
    window.applyFilters();
  };

  function syncPillState(activeCat) {
    const pills = document.querySelectorAll("#category-pills .cat-pill");
    pills.forEach((pill) => {
      const pillCat = pill.getAttribute("data-cat");
      if (pillCat === activeCat || (activeCat === "" && pillCat === "all")) {
        pill.classList.add("ring-2", "ring-primary", "ring-offset-1");
      } else {
        pill.classList.remove("ring-2", "ring-primary", "ring-offset-1");
      }
    });
  }

  window.clearAllFilters = () => {
    if (nameInput instanceof HTMLInputElement) nameInput.value = "";
    if (descriptionInput instanceof HTMLInputElement) descriptionInput.value = "";
    if (categoryInput instanceof HTMLSelectElement) categoryInput.value = "all";
    selectedCategory = "all";
    window.applyFilters();
  };

  window.copyText = (text, msg) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(msg);
      }).catch(() => {
        fallbackCopy(text, msg);
      });
    } else {
      fallbackCopy(text, msg);
    }
  };

  function fallbackCopy(text, msg) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast(msg);
  }

  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-message");
    if (toastMsg) toastMsg.textContent = message || "Copiado para a área de transferência!";
    if (toast) {
      toast.classList.remove("opacity-0", "translate-y-20", "pointer-events-none");
      toast.classList.add("opacity-100", "translate-y-0");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove("opacity-100", "translate-y-0");
        toast.classList.add("opacity-0", "translate-y-20", "pointer-events-none");
      }, 2400);
    }
  }

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (nameInput instanceof HTMLInputElement) {
        nameInput.focus();
        nameInput.select();
      }
    }
  });

  categoryInput?.addEventListener("change", window.applyFilters);
  nameInput?.addEventListener("input", window.applyFilters);
  descriptionInput?.addEventListener("input", window.applyFilters);
  window.applyFilters();
})();`;

const PAGE_STYLES = `:root {
  color-scheme: dark light;
  --mind-bg: #f7f9ff;
  --mind-accent: #006194;
  --mind-primary: #006194;
}
@media (prefers-color-scheme: light) {
  :root {
    --mind-bg: #f7f9ff;
  }
}
@layer base {
  html, body { margin: 0; padding: 0; }
  body { overscroll-behavior: none; }
  main > :first-child { margin-top: 0 !important; }
  main > :last-child { margin-bottom: 0 !important; }
}
::-webkit-scrollbar { display: none; }
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
}
.brand__name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.01em;
  font-weight: 700;
  color: #0F172A;
}
@media (prefers-color-scheme: dark) {
  .site-header {
    background-color: rgba(26, 29, 36, 0.85);
    border-bottom-color: #27272A;
  }
  .brand__name {
    color: #F8FAFC;
  }
}`;

const TAILWIND_CONFIG_SCRIPT = `tailwind.config={
  darkMode:"class",
  theme:{
    extend:{
      colors:{
        "on-error-container":"#93000a",
        "surface-container-low":"#ecf4ff",
        "badge-product-bg":"#DCFCE7",
        "tertiary-fixed-dim":"#b4c5ff",
        "tertiary-fixed":"#dbe1ff",
        "text-secondary":"#5B6B7A",
        "error":"#ba1a1a",
        "text-muted":"#94A3B8",
        "surface-canvas-subtle":"#F8FAFC",
        "badge-product-text":"#15803D",
        "secondary-container":"#6cf7f6",
        "secondary-fixed":"#6cf7f6",
        "primary-container":"#007bb9",
        "surface-container":"#e1efff",
        "on-secondary-fixed-variant":"#004f4f",
        "on-error":"#ffffff",
        "surface-border-hover":"#CBD5E1",
        "surface-card":"#FFFFFF",
        "background":"#f7f9ff",
        "secondary":"#006a6a",
        "inverse-surface":"#22323f",
        "on-tertiary-fixed":"#00174b",
        "badge-arch-text":"#0369A1",
        "tertiary-container":"#316bf3",
        "on-primary":"#ffffff",
        "tertiary":"#0051d5",
        "primary-fixed":"#cce5ff",
        "primary-fixed-dim":"#93ccff",
        "surface-bright":"#f7f9ff",
        "on-primary-fixed":"#001d31",
        "surface":"#f7f9ff",
        "on-background":"#0d1d2a",
        "inverse-primary":"#93ccff",
        "on-primary-fixed-variant":"#004b73",
        "surface-border":"#E2E8F0",
        "badge-default-bg":"#F1F5F9",
        "outline-variant":"#bfc7d2",
        "badge-testing-text":"#B45309",
        "surface-dim":"#cbdced",
        "on-secondary-container":"#007070",
        "surface-container-high":"#d9eafc",
        "secondary-fixed-dim":"#49dada",
        "on-tertiary-fixed-variant":"#003ea8",
        "badge-default-text":"#475569",
        "on-secondary-fixed":"#002020",
        "surface-canvas":"#F4F7FB",
        "badge-arch-bg":"#E0F2FE",
        "inverse-on-surface":"#e7f2ff",
        "code-pill-bg":"#F1F5F9",
        "on-tertiary":"#ffffff",
        "surface-tint":"#006398",
        "on-surface":"#0d1d2a",
        "surface-variant":"#d4e4f6",
        "error-container":"#ffdad6",
        "outline":"#707881",
        "badge-testing-bg":"#FEF3C7",
        "primary":"#006194",
        "on-primary-container":"#fdfcff",
        "on-secondary":"#ffffff",
        "code-pill-text":"#0F172A",
        "surface-container-lowest":"#ffffff",
        "text-primary":"#14202C",
        "on-surface-variant":"#3f4850",
        "surface-container-highest":"#d4e4f6",
        "on-tertiary-container":"#fefcff",
        "badge-security-text":"#4338CA",
        "badge-security-bg":"#EEF2FF"
      },
      borderRadius:{
        "DEFAULT":"0.25rem",
        "lg":"0.5rem",
        "xl":"0.75rem",
        "full":"9999px"
      },
      spacing:{
        "space-xs":"0.5rem",
        "space-3xl":"4rem",
        "space-xl":"2rem",
        "gutter-desktop":"1.5rem",
        "space-2xs":"0.25rem",
        "space-sm":"0.75rem",
        "gutter":"1.25rem",
        "margin-tablet":"2rem",
        "space-md":"1rem",
        "margin-desktop":"3rem",
        "space-2xl":"3rem",
        "space-lg":"1.5rem",
        "margin":"1rem"
      },
      fontFamily:{
        "display":["Plus Jakarta Sans"],
        "body-md":["Inter"],
        "body-sm":["Inter"],
        "label-caps":["Inter"],
        "headline-md":["Plus Jakarta Sans"],
        "headline-sm":["Plus Jakarta Sans"],
        "label-code":["JetBrains Mono"],
        "title-code":["JetBrains Mono"],
        "body-lg":["Inter"],
        "display-mobile":["Plus Jakarta Sans"],
        "headline-lg":["Plus Jakarta Sans"],
        "badge-label":["Inter"]
      },
      fontSize:{
        "display":["36px",{"lineHeight":"44px","letterSpacing":"-0.025em","fontWeight":"700"}],
        "body-md":["14px",{"lineHeight":"22px","letterSpacing":"0em","fontWeight":"400"}],
        "body-sm":["13px",{"lineHeight":"20px","letterSpacing":"0em","fontWeight":"400"}],
        "label-caps":["11px",{"lineHeight":"16px","letterSpacing":"0.06em","fontWeight":"600"}],
        "headline-md":["20px",{"lineHeight":"28px","letterSpacing":"-0.015em","fontWeight":"600"}],
        "headline-sm":["16px",{"lineHeight":"24px","letterSpacing":"-0.01em","fontWeight":"600"}],
        "label-code":["12px",{"lineHeight":"16px","letterSpacing":"0em","fontWeight":"500"}],
        "title-code":["15px",{"lineHeight":"22px","letterSpacing":"-0.01em","fontWeight":"600"}],
        "body-lg":["16px",{"lineHeight":"26px","letterSpacing":"-0.005em","fontWeight":"400"}],
        "display-mobile":["28px",{"lineHeight":"36px","letterSpacing":"-0.02em","fontWeight":"700"}],
        "headline-lg":["28px",{"lineHeight":"36px","letterSpacing":"-0.02em","fontWeight":"700"}],
        "badge-label":["11px",{"lineHeight":"14px","letterSpacing":"0.01em","fontWeight":"500"}]
      }
    }
  }
};`;

function renderDocument(registry: SkillsRegistry, skills: RegistrySkill[]): string {
  const cards = skills.map(renderSkillCard).join('\n');
  const emptyHidden = skills.length === 0 ? '' : ' hidden';
  const generatedAt = escapeHtml(registry.generatedAt);
  const countLabel = skills.length === 1 ? '1 skill' : `${skills.length} skills`;
  const brandHeader = renderBrandMark('brand__logo w-9 h-9 rounded-lg object-contain');
  const brandFooter = renderBrandMark('site-footer__logo w-6 h-6 rounded object-contain');

  const categoryCounts: Record<string, number> = {};
  for (const skill of skills) {
    categoryCounts[skill.category] = (categoryCounts[skill.category] ?? 0) + 1;
  }

  const categories = uniqueCategories(skills);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Catálogo de skills — CodeSteer</title>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..900&family=Plus+Jakarta+Sans:wght@100..900&display=swap" rel="stylesheet" />
  <style>${PAGE_STYLES}</style>
  <script src="https://cdn.tailwindcss.com"></script>
  <script id="tailwind-config">${TAILWIND_CONFIG_SCRIPT}</script>
</head>
<body class="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
  <!-- Top Navigation Header -->
  <header class="site-header">
    <div class="h-16 max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md">
      <div class="flex items-center gap-space-md">
        <a class="brand flex items-center gap-space-xs group" data-path="catalog-overview" href="#">
          ${brandHeader}
          <div class="flex items-center gap-space-xs">
            <span class="brand__name">CodeSteer</span>
            <span class="inline-flex items-center px-space-xs py-0.5 rounded-full bg-badge-arch-bg text-badge-arch-text font-badge-label text-badge-label border border-surface-border">Agent Skills</span>
          </div>
        </a>
        <div class="hidden lg:block h-4 w-px bg-surface-border"></div>
        <nav class="hidden lg:flex items-center gap-space-md" data-active-classes="text-primary font-headline-sm">
          <a aria-current="page" class="transition-colors text-primary font-headline-sm" data-path="catalog-overview" href="#">Skills Catalog</a>
          <a class="font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors" data-path="skill-details" href="#">Architecture</a>
          <a class="font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors" data-path="integrations-guide" href="#">Integrations</a>
          <a class="font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors" data-path="contributing" href="#">Specification</a>
        </nav>
      </div>
      <div class="flex items-center gap-space-sm">
        <a class="hidden sm:inline-flex items-center gap-1 font-body-sm text-body-sm text-text-secondary hover:text-primary transition-colors px-space-xs py-1 rounded" href="${SITE_URL}" rel="noopener noreferrer" target="_blank">
          <span>Site</span>
          <span class="material-symbols-outlined text-[14px]">north_east</span>
        </a>
        <a class="hidden md:inline-flex items-center gap-1 font-body-sm text-body-sm text-text-secondary hover:text-primary transition-colors px-space-xs py-1 rounded" href="${PAGES_URL}" rel="noopener noreferrer" target="_blank">
          <span>GitHub Pages</span>
          <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
        </a>
        <a class="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-canvas border border-surface-border hover:border-surface-border-hover hover:bg-surface-card transition-all text-text-primary" href="https://github.com/luiscarloslopes/codesteer-agent-skills" rel="noopener noreferrer" target="_blank">
          <span class="material-symbols-outlined text-[16px] text-badge-testing-text">star</span>
          <span class="font-label-code text-label-code font-semibold">Star</span>
          <span class="h-3 w-px bg-surface-border mx-0.5"></span>
          <span class="font-label-code text-label-code text-text-muted">v1.2</span>
        </a>
      </div>
    </div>
  </header>

  <main class="w-full pt-16 flex-1 bg-surface-canvas" id="main-content">
    <div class="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
      <div class="flex flex-col w-full">
        <!-- Toast Notification Feedback -->
        <div class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-out pointer-events-none flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl border border-surface-border/20" id="toast">
          <span class="material-symbols-outlined text-[18px] text-badge-product-text">check_circle</span>
          <span class="font-body-sm text-body-sm" id="toast-message">Copiado para a área de transferência!</span>
        </div>

        <!-- Hero Header Section -->
        <div class="hero relative w-full rounded-2xl bg-surface-card border border-surface-border p-space-lg md:p-space-2xl mb-space-xl overflow-hidden shadow-sm">
          <div class="absolute -right-20 -top-20 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute right-10 bottom-0 opacity-5 pointer-events-none select-none">
            <span class="material-symbols-outlined text-[160px] text-primary">terminal</span>
          </div>
          <div class="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-space-lg">
            <div class="max-w-3xl flex flex-col gap-space-sm">
              <div class="flex flex-wrap items-center gap-space-xs">
                <span class="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-container-low text-primary border border-primary/20 font-label-code text-label-code font-semibold" id="catalogo-contagem">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  v0.1.0 • ${escapeHtml(countLabel)} disponíveis
                </span>
                <span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-md bg-badge-default-bg text-badge-default-text font-label-code text-label-code">
                  <span class="material-symbols-outlined text-[14px]">update</span>
                  gerado em ${generatedAt}
                </span>
              </div>
              <h1 class="font-display text-display text-text-primary tracking-tight">
                Catálogo de skills
              </h1>
              <p class="lede font-body-lg text-body-lg text-text-secondary max-w-2xl leading-relaxed">
                Filtre por categoria, nome e descrição. Skills para agentes de IA — o mesmo catálogo deste repositório, sem o corpo do <code class="px-1.5 py-0.5 rounded bg-code-pill-bg text-code-pill-text font-label-code text-label-code">SKILL.md</code>.
              </p>
              ${renderIdePills()}
            </div>
            <!-- Quick Action Box -->
            <div class="flex flex-col sm:flex-row md:flex-col gap-space-xs shrink-0 self-start">
              <button class="inline-flex items-center justify-center gap-1.5 px-space-md py-2 rounded-xl bg-surface-card border border-surface-border hover:border-surface-border-hover text-text-secondary hover:text-text-primary font-body-sm text-body-sm transition-all" type="button" onclick="copyText('https://github.com/luiscarloslopes/codesteer-agent-skills', 'URL do repositório copiada!')">
                <span class="material-symbols-outlined text-[18px]">link</span>
                <span>Copiar link do catálogo</span>
              </button>
            </div>
          </div>
        </div>

        ${renderFilterControls(categories, categoryCounts, skills.length)}

        <!-- Skills Catalog Grid -->
        <section class="catalog grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md lg:gap-space-lg" id="lista-skills" aria-live="polite">
          ${cards}
        </section>

        <!-- Empty Search State -->
        <div class="empty${emptyHidden} my-space-xl p-space-2xl bg-surface-card rounded-2xl border border-dashed border-surface-border text-center flex-col items-center justify-center gap-space-sm" id="catalogo-vazio">
          <div class="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="font-headline-sm text-headline-sm text-text-primary">Nenhuma skill encontrada.</h3>
            <p class="font-body-md text-body-md text-text-secondary">Tente ajustar seus termos de busca ou selecione outra categoria.</p>
          </div>
          <button class="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary/90 transition-all" type="button" onclick="clearAllFilters()">
            Limpar todos os filtros
          </button>
        </div>

        <!-- Quick Specification Info Card -->
        <div class="mt-space-2xl p-space-lg rounded-2xl bg-surface-card border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-md">
            <div class="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
              <span class="material-symbols-outlined text-[22px]">description</span>
            </div>
            <div>
              <h4 class="font-headline-sm text-headline-sm text-text-primary">Padrão CodeSteer de Agentes</h4>
              <p class="font-body-sm text-body-sm text-text-secondary">Cada skill é especificada com triggers determinísticos e proibições explícitas (Do NOT use) para evitar chamadas alucinadas.</p>
            </div>
          </div>
          <div class="flex items-center gap-space-xs shrink-0">
            <a class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-canvas border border-surface-border hover:border-surface-border-hover text-text-primary font-body-sm text-body-sm transition-colors" href="https://github.com/luiscarloslopes/codesteer-agent-skills" rel="noopener noreferrer" target="_blank">
              <span>Contribuir com nova skill</span>
              <span class="material-symbols-outlined text-[16px]">north_east</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer class="site-footer w-full bg-surface-card border-t border-surface-border mt-auto">
    <div class="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg pb-space-lg border-b border-surface-border">
        <div class="site-footer__brand flex flex-col gap-space-2xs">
          <div class="flex items-center gap-space-xs">
            ${brandFooter}
            <span class="font-headline-sm text-headline-sm text-text-primary font-bold">CodeSteer</span>
            <span class="font-label-code text-label-code text-text-muted">agent-skills</span>
          </div>
          <p class="font-body-sm text-body-sm text-text-secondary max-w-md">Standardized, production-tested prompt specifications, tools, and autonomous skills for engineering-grade AI agents.</p>
        </div>
        <div class="site-footer__links flex flex-wrap items-center gap-space-md">
          <a class="font-body-sm text-body-sm text-text-secondary hover:text-primary transition-colors" href="${SITE_URL}" rel="noopener noreferrer" target="_blank">Production Web App</a>
          <a class="font-body-sm text-body-sm text-text-secondary hover:text-primary transition-colors" href="${PAGES_URL}" rel="noopener noreferrer" target="_blank">Documentation & Guides</a>
          <a class="font-body-sm text-body-sm text-text-secondary hover:text-primary transition-colors" href="https://github.com/luiscarloslopes/codesteer-agent-skills" rel="noopener noreferrer" target="_blank">GitHub Repository</a>
        </div>
      </div>
      <div class="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-code text-label-code text-text-muted">
        <div>© 2025 CodeSteer. Open Source under MIT License.</div>
        <div class="flex items-center gap-space-sm">
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-badge-product-text animate-pulse"></span>
            Registry Active
          </span>
          <span class="text-surface-border">•</span>
          <span>Updated Oct 2025</span>
        </div>
      </div>
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
