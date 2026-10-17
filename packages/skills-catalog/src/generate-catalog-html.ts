import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codeSteerIconSrc, ideLogos } from './catalog-brand.ts';
import { compileCatalog, defaultCompileOptions } from './compile-catalog.ts';
import type { RegistrySkill, SkillsRegistry } from './types.ts';

// @MindContext: Gerador de catálogo HTML estático baseado no Design System CodeSteer ("The Cognitive Control Room" — DESING.md)
// @MindFlow: Filtrar SkillsRegistry → escapar campos → template auto-contido (dark canvas #171918, Sora/DM Sans/JetBrains Mono, 3 role colors, paper panel #eee9dc) → dist/index.html
// @MindSpec: Filtros category exact / name+description substring case-insensitive; vazio ou * omite o filtro
// @MindDecision: HTML auto-contido com Tailwind CDN, Google Fonts (Sora, DM Sans, JetBrains Mono), Material Symbols e SVGs de IDE inline
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
const REPO_URL = 'https://github.com/luiscarloslopes/codesteer-agent-skills';

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

// Mapeia cada categoria para os 3 papéis cromáticos de DESING.md (Indigo #b2b9ff, Orange #ff975f, Green #b8ce9c)
// mantendo preenchimento de 10% e borda de 30-35% conforme a regra de Chips/Badges
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  architecture: {
    bg: 'bg-badge-arch-bg',
    text: 'text-badge-arch-text',
    border: 'border-badge-arch-text/35',
  },
  automation: {
    bg: 'bg-badge-automation-bg',
    text: 'text-badge-automation-text',
    border: 'border-badge-automation-text/35',
  },
  creative: {
    bg: 'bg-badge-creative-bg',
    text: 'text-badge-creative-text',
    border: 'border-badge-creative-text/35',
  },
  frontend: {
    bg: 'bg-badge-frontend-bg',
    text: 'text-badge-frontend-text',
    border: 'border-badge-frontend-text/35',
  },
  marketing: {
    bg: 'bg-badge-marketing-bg',
    text: 'text-badge-marketing-text',
    border: 'border-badge-marketing-text/35',
  },
  product: {
    bg: 'bg-badge-product-bg',
    text: 'text-badge-product-text',
    border: 'border-badge-product-text/35',
  },
  'prompt-engineering': {
    bg: 'bg-badge-prompt-bg',
    text: 'text-badge-prompt-text',
    border: 'border-badge-prompt-text/35',
  },
  security: {
    bg: 'bg-badge-security-bg',
    text: 'text-badge-security-text',
    border: 'border-badge-security-text/35',
  },
  testing: {
    bg: 'bg-badge-testing-bg',
    text: 'text-badge-testing-text',
    border: 'border-badge-testing-text/35',
  },
};

// Rótulos técnicos em mono para contextualizar o domínio de cada skill no rodapé do card
const SKILL_THEME_TAGS: Record<string, string> = {
  'advanced-elicitation': 'Prompt Elicitation',
  'agno-architect': 'Python Multi-agent',
  'avaliador-de-prompt': 'Prompt Review & Scoring',
  'copywriting-persuasivo': 'Direct Response & Conversion',
  'criador-persona': 'AI Persona Design',
  'debate-entre-experts-tech': 'Multi-expert Decision',
  'deep-research-prompt': 'Research Prompt Architecture',
  'design-to-html': 'Pure Static HTML/CSS',
  'diretor-de-fotografia': 'Cinematography & Lighting',
  'electron-automation': 'CDP Desktop Automation',
  'extrair-contexto-de-negocio': 'Brand & Business Context',
  'gerador-de-campanha': 'Short-form Video Campaigns',
  'grill-me': 'Adversarial Spec Review',
  'instruction-densifier': 'Prompt Optimization',
  'lgpd-implementation': 'Data Privacy & Compliance',
  'photo-character-profiler': 'Photographic Character Spec',
  'photorealistic-image-generation': 'Photorealism & Optics',
  'pipeline-canary': 'CI/CD & Healthcheck',
  'prd-creator': 'Product Requirements & PRD',
  'tiktok-faceless-strategist': 'Faceless Video Strategy',
  'vertical-micro-drama-writer': 'Vertical Scriptwriting',
  'viral-thumbnail': 'High-CTR Thumbnail Design',
  'visual-character-profiler': 'Character Consistency Spec',
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
    border: 'border-mind-border/60',
  };

  const tagLabel = SKILL_THEME_TAGS[skill.name] ?? escapeHtml(skill.category);

  // Separa o gatilho positivo ("Use when") da restrição explícita ("Do NOT use") em um well interno escuro
  let descBodyHtml: string;
  const doNotUseMatch = rawDescription.match(/\bDo NOT use\b/i);
  if (doNotUseMatch && doNotUseMatch.index !== undefined) {
    const mainPart = rawDescription.slice(0, doNotUseMatch.index).trim();
    const doNotUsePart = rawDescription.slice(doNotUseMatch.index).trim();
    descBodyHtml = `<p class="text-mind-text-secondary">${escapeHtml(mainPart)}</p>
<div class="p-3 rounded-xl bg-mind-bg/60 border border-mind-border/60 text-sm text-mind-text/90 flex items-start gap-2.5">
  <span class="material-symbols-outlined text-[16px] text-mind-accent shrink-0 mt-0.5" aria-hidden="true">block</span>
  <span>${escapeHtml(doNotUsePart)}</span>
</div>`;
  } else {
    descBodyHtml = `<p class="text-mind-text-secondary">${description}</p>`;
  }

  return `<article class="skill-card group rounded-2xl bg-mind-surface/30 backdrop-blur-md border border-mind-border/55 hover:border-mind-accent/40 p-6 md:p-8 flex flex-col justify-between transition-colors duration-200 ease-out" data-skill-card data-name="${dataName}" data-category="${dataCategory}" data-description="${dataDescription}" data-raw-desc="${description}">
  <div class="flex flex-col gap-4">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2 mb-2.5">
          <span class="font-label text-label uppercase px-3.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text} border ${catStyle.border}">
            ${category}
          </span>
          <span class="font-mono text-mono px-2 py-0.5 rounded bg-mind-bg/60 text-mind-text-secondary border border-mind-border/60">
            v${version}
          </span>
        </div>
        <h3 class="font-title text-title text-mind-text break-words group-hover:text-mind-accent transition-colors">
          ${name}
        </h3>
      </div>
      <button class="p-2 rounded-full border border-mind-border/50 bg-mind-bg/40 text-mind-text-secondary hover:text-mind-text hover:border-mind-accent/40 transition-colors" type="button" onclick="copyText('${name}', 'Slug ${name} copiado!')" title="Copiar slug da skill">
        <span class="material-symbols-outlined text-[16px]">content_copy</span>
      </button>
    </div>
    <div class="space-y-3 font-body text-body">
      ${descBodyHtml}
    </div>
  </div>
  <div class="mt-6 pt-4 border-t border-mind-border/40 flex items-center justify-between gap-2">
    <span class="font-mono text-mono text-mind-indigo truncate" title="${tagLabel}">${tagLabel}</span>
    <span class="font-mono text-mono text-mind-text-secondary">SKILL.md</span>
  </div>
</article>`;
}

function renderFilterControls(
  categories: string[],
  categoryCounts: Record<string, number>,
  totalCount: number,
): string {
  const options = ['<option class="bg-mind-surface text-mind-text" value="all">Todas as categorias</option>']
    .concat(
      categories.map(
        (category) =>
          `<option class="bg-mind-surface text-mind-text" value="${escapeHtml(category)}">${escapeHtml(category)}</option>`,
      ),
    )
    .join('');

  const pills = [
    `<button class="cat-pill active px-3.5 py-1.5 rounded-full font-label text-label uppercase bg-mind-accent text-mind-ink border border-mind-accent transition-colors duration-200 flex items-center gap-2" type="button" data-cat="all" onclick="selectCategoryPill('all')">
  <span>Todas</span>
  <span class="px-1.5 py-0.5 rounded-full font-mono text-mono bg-mind-ink/15 text-mind-ink">${totalCount}</span>
</button>`,
  ]
    .concat(
      categories.map((category) => {
        const style = CATEGORY_STYLES[category] ?? {
          bg: 'bg-badge-default-bg',
          text: 'text-badge-default-text',
          border: 'border-mind-border/60',
        };
        const count = categoryCounts[category] ?? 0;
        return `<button class="cat-pill px-3.5 py-1.5 rounded-full font-label text-label uppercase ${style.bg} ${style.text} border ${style.border} hover:border-mind-accent/50 transition-colors duration-200 flex items-center gap-2" type="button" data-cat="${escapeHtml(category)}" onclick="selectCategoryPill('${escapeHtml(category)}')">
  <span>${escapeHtml(category)}</span>
  <span class="px-1.5 py-0.5 rounded-full font-mono text-mono bg-mind-bg/60 text-mind-text">${count}</span>
</button>`;
      }),
    )
    .join('\n');

  return `<div class="mb-8">
  <div class="rounded-2xl bg-mind-surface/40 backdrop-blur-md border border-mind-border/60 p-6 md:p-8 flex flex-col gap-5">
    <form class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end" id="filtros-catalogo" autocomplete="off" onsubmit="return false;">
      <div class="md:col-span-3 relative">
        <label class="block font-label text-label text-mind-indigo mb-2 uppercase" for="filtro-categoria">
          Filtrar por categoria
        </label>
        <div class="relative">
          <select class="w-full h-11 pl-4 pr-9 rounded-xl bg-mind-bg/60 border border-mind-border/60 text-mind-text font-body text-sm focus:border-mind-accent focus:outline-none transition-colors appearance-none cursor-pointer" id="filtro-categoria" name="categoria" aria-label="Filtrar por categoria" onchange="applyFilters()">
            ${options}
          </select>
          <span class="material-symbols-outlined absolute right-3 top-3 text-[18px] text-mind-text-secondary pointer-events-none">expand_more</span>
        </div>
      </div>
      <div class="md:col-span-4 relative">
        <label class="block font-label text-label text-mind-indigo mb-2 uppercase" for="filtro-nome">
          Filtrar por nome
        </label>
        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-3.5 text-[18px] text-mind-text-secondary pointer-events-none">tag</span>
          <input class="w-full h-11 pl-10 pr-14 rounded-xl bg-mind-bg/60 border border-mind-border/60 text-mind-text font-body text-sm placeholder:text-mind-text-secondary/50 focus:border-mind-accent focus:outline-none transition-colors" id="filtro-nome" name="nome" type="search" placeholder="Filtrar por nome (ex.: grill-me)" aria-label="Filtrar por nome" oninput="applyFilters()" />
          <kbd class="hidden sm:inline-flex absolute right-3 px-2 py-0.5 font-mono text-mono text-mind-text-secondary bg-mind-surface border border-mind-border/60 rounded pointer-events-none">⌘K</kbd>
        </div>
      </div>
      <div class="md:col-span-5 relative">
        <label class="block font-label text-label text-mind-indigo mb-2 uppercase" for="filtro-descricao">
          Filtrar por descrição
        </label>
        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-3.5 text-[18px] text-mind-text-secondary pointer-events-none">manage_search</span>
          <input class="w-full h-11 pl-10 pr-9 rounded-xl bg-mind-bg/60 border border-mind-border/60 text-mind-text font-body text-sm placeholder:text-mind-text-secondary/50 focus:border-mind-accent focus:outline-none transition-colors" id="filtro-descricao" name="descricao" type="search" placeholder="Filtrar por descrição, gatilho Use when ou Do NOT use" aria-label="Filtrar por descrição" oninput="applyFilters()" />
          <button class="hidden absolute right-2.5 text-mind-text-secondary hover:text-mind-text p-1 rounded-full" id="clear-search-btn" type="button" onclick="clearAllFilters()" title="Limpar busca">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    </form>
    <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-mind-border/40">
      <div class="flex flex-wrap items-center gap-2" id="category-pills">
        ${pills}
      </div>
      <div class="font-mono text-mono text-mind-text-secondary flex items-center gap-3">
        <span>Exibindo <strong class="text-mind-green" id="visible-count">${totalCount}</strong> de ${totalCount} skills</span>
        <button class="text-mind-accent hover:underline font-mono text-mono hidden" id="reset-filters-btn" type="button" onclick="clearAllFilters()">Limpar filtros</button>
      </div>
    </div>
  </div>
</div>`;
}

function renderBrandMark(className: string): string {
  const src = escapeHtml(codeSteerIconSrc());
  return `<img class="${className}" alt="CodeSteer Logo" width="36" height="36" src="${src}" />`;
}

// Renderiza a faixa de logos de IDE conforme DESING.md (IDE Logo Strip):
// pills inline flex, logo 20px, border-mind-border/60, bg-mind-bg/60, texto secundário, linha única com wrap em container glass
function renderIdePills(): string {
  const pills = ideLogos()
    .map((logo) => {
      const alt = escapeHtml(logo.alt);
      const label = escapeHtml(logo.label);
      const src = escapeHtml(logo.src);
      return `<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mind-bg/60 border border-mind-border/60 text-mind-text-secondary font-body text-sm">
  <img alt="${alt}" width="20" height="20" class="w-5 h-5 object-contain opacity-90" src="${src}" />
  <span>${label}</span>
</div>`;
    })
    .join('\n');

  return `<div class="mt-6 rounded-2xl bg-mind-surface/25 backdrop-blur-md border border-mind-border/60 p-4 md:p-5 flex flex-col gap-3">
  <span class="font-label text-label text-mind-indigo uppercase">
    Compatível com sua IDE &amp; Clientes MCP
  </span>
  <div class="flex flex-wrap items-center gap-2.5">
    ${pills}
  </div>
</div>`;
}

const CLIENT_FILTER_SCRIPT = `(() => {
  let selectedCategory = 'all';

  const headerEl = document.querySelector(".site-header");
  const categoryInput = document.getElementById("filtro-categoria") || document.getElementById("filter-category");
  const nameInput = document.getElementById("filtro-nome") || document.getElementById("filter-name");
  const descriptionInput = document.getElementById("filtro-descricao") || document.getElementById("filter-desc");
  const empty = document.getElementById("catalogo-vazio");
  const visibleCountEl = document.getElementById("visible-count");
  const resetBtn = document.getElementById("reset-filters-btn");
  const clearBtn = document.getElementById("clear-search-btn");
  const cards = Array.from(document.querySelectorAll("[data-skill-card]"));

  // Alterna o estado de scroll do header fixo conforme a regra de Navigation do DESING.md
  function syncHeaderScroll() {
    if (!(headerEl instanceof HTMLElement)) return;
    if (window.scrollY > 12) {
      headerEl.setAttribute("data-scrolled", "true");
    } else {
      headerEl.removeAttribute("data-scrolled");
    }
  }
  window.addEventListener("scroll", syncHeaderScroll, { passive: true });
  syncHeaderScroll();

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
        pill.classList.add("ring-2", "ring-mind-accent");
      } else {
        pill.classList.remove("ring-2", "ring-mind-accent");
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

// Estilos base ancorados nos tokens de DESING.md ("The Cognitive Control Room")
const PAGE_STYLES = `:root {
  color-scheme: dark light;
  --mind-bg: #171918;
  --mind-surface: #202321;
  --mind-border: #3b403b;
  --mind-text: #eeeae0;
  --mind-text-secondary: #b5b9ad;
  --mind-paper: #eee9dc;
  --mind-ink: #232b28;
  --mind-accent: #ff975f;
  --mind-primary: #ff975f;
  --mind-indigo: #b2b9ff;
  --mind-green: #b8ce9c;
}
@media (prefers-color-scheme: light) {
  :root {
    --mind-bg: #171918;
    --mind-surface: #202321;
  }
}
@layer base {
  html, body {
    margin: 0;
    padding: 0;
    background-color: var(--mind-bg);
    color: var(--mind-text);
    scroll-behavior: smooth;
  }
  body { overscroll-behavior: none; }
}
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #171918; }
::-webkit-scrollbar-thumb { background: #202321; border-radius: 9999px; border: 1px solid #3b403b; }
::-webkit-scrollbar-thumb:hover { background: #3b403b; }
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color 200ms ease-out, border-color 200ms ease-out, backdrop-filter 200ms ease-out;
}
.site-header[data-scrolled="true"] {
  background-color: rgb(23 25 24 / 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: rgb(59 64 59 / 0.6);
}
.brand__name {
  font-family: 'Sora', ui-sans-serif, system-ui, sans-serif;
  font-size: 1.125rem;
  line-height: 1.25;
  letter-spacing: -0.02em;
  font-weight: 600;
  color: #eeeae0;
}
.shadow-glow {
  box-shadow: 0 0 60px -12px rgb(255 151 95 / 0.45);
}
.shadow-glow-indigo {
  box-shadow: 0 0 60px -12px rgb(178 185 255 / 0.4);
}
.paper-panel {
  color-scheme: light;
  background-color: #eee9dc;
  color: #232b28;
}`;

const TAILWIND_CONFIG_SCRIPT = `tailwind.config={
  darkMode:"class",
  theme:{
    extend:{
      colors:{
        "mind-bg":"#171918",
        "mind-surface":"#202321",
        "mind-border":"#3b403b",
        "mind-text":"#eeeae0",
        "mind-text-secondary":"#b5b9ad",
        "mind-paper":"#eee9dc",
        "mind-ink":"#232b28",
        "mind-accent":"#ff975f",
        "mind-indigo":"#b2b9ff",
        "mind-green":"#b8ce9c",
        "primary":"#ff975f",
        "badge-arch-text":"#b2b9ff",
        "badge-arch-bg":"rgb(178 185 255 / 0.10)",
        "badge-automation-text":"#b2b9ff",
        "badge-automation-bg":"rgb(178 185 255 / 0.10)",
        "badge-frontend-text":"#b2b9ff",
        "badge-frontend-bg":"rgb(178 185 255 / 0.10)",
        "badge-prompt-text":"#b2b9ff",
        "badge-prompt-bg":"rgb(178 185 255 / 0.10)",
        "badge-product-text":"#ff975f",
        "badge-product-bg":"rgb(255 151 95 / 0.10)",
        "badge-creative-text":"#ff975f",
        "badge-creative-bg":"rgb(255 151 95 / 0.10)",
        "badge-marketing-text":"#ff975f",
        "badge-marketing-bg":"rgb(255 151 95 / 0.10)",
        "badge-security-text":"#b8ce9c",
        "badge-security-bg":"rgb(184 206 156 / 0.10)",
        "badge-testing-text":"#b8ce9c",
        "badge-testing-bg":"rgb(184 206 156 / 0.10)",
        "badge-default-text":"#b2b9ff",
        "badge-default-bg":"rgb(178 185 255 / 0.10)"
      },
      borderRadius:{
        "sm":"4px",
        "md":"12px",
        "lg":"16px",
        "xl":"16px",
        "2xl":"16px",
        "3xl":"24px",
        "full":"9999px"
      },
      fontFamily:{
        "display":["Sora","ui-sans-serif","system-ui","sans-serif"],
        "headline":["Sora","ui-sans-serif","system-ui","sans-serif"],
        "title":["Sora","ui-sans-serif","system-ui","sans-serif"],
        "body":["DM Sans","ui-sans-serif","system-ui","sans-serif"],
        "label":["DM Sans","ui-sans-serif","system-ui","sans-serif"],
        "mono":["JetBrains Mono","ui-monospace","Cascadia Code","monospace"]
      },
      fontSize:{
        "display":["clamp(1.875rem, 4vw, 3.25rem)",{"lineHeight":"1.08","letterSpacing":"-0.04em","fontWeight":"600"}],
        "headline":["clamp(1.875rem, 3vw, 2.6rem)",{"lineHeight":"1.15","letterSpacing":"-0.03em","fontWeight":"600"}],
        "title":["1.25rem",{"lineHeight":"1.25","letterSpacing":"-0.02em","fontWeight":"600"}],
        "body":["1rem",{"lineHeight":"1.625","letterSpacing":"0em","fontWeight":"400"}],
        "label":["0.75rem",{"lineHeight":"1.2","letterSpacing":"0.14em","fontWeight":"600"}],
        "mono":["0.75rem",{"lineHeight":"1.4","letterSpacing":"0em","fontWeight":"400"}]
      }
    }
  }
};`;

function renderDocument(registry: SkillsRegistry, skills: RegistrySkill[]): string {
  const cards = skills.map(renderSkillCard).join('\n');
  const emptyHidden = skills.length === 0 ? '' : ' hidden';
  const generatedAt = escapeHtml(registry.generatedAt);
  const countLabel = skills.length === 1 ? '1 skill' : `${skills.length} skills`;
  const brandHeader = renderBrandMark('brand__logo h-8 w-auto object-contain');
  const brandFooter = renderBrandMark('site-footer__logo h-6 w-auto object-contain');

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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=JetBrains+Mono:wght@400..600&family=Sora:wght@500..700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
  <style>${PAGE_STYLES}</style>
  <script src="https://cdn.tailwindcss.com"></script>
  <script id="tailwind-config">${TAILWIND_CONFIG_SCRIPT}</script>
</head>
<body class="bg-mind-bg font-body text-body text-mind-text antialiased min-h-screen flex flex-col">
  <!-- Cabeçalho fixo: transparente no topo, canvas 85% + backdrop-blur no scroll -->
  <header class="site-header">
    <div class="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <a class="brand flex items-center gap-3 group" data-path="catalog-overview" href="#">
          ${brandHeader}
          <div class="flex items-center gap-2.5">
            <span class="brand__name">CodeSteer</span>
            <span class="inline-flex items-center px-3.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo font-label text-label uppercase border border-mind-indigo/35">Agent Skills</span>
          </div>
        </a>
        <nav class="hidden lg:flex items-center gap-1" aria-label="Navegação de seções">
          <a aria-current="page" class="px-4 py-2 rounded-full bg-mind-surface text-mind-text font-body text-sm transition-colors" href="#catalogo">Catálogo</a>
          <a class="px-4 py-2 rounded-full text-mind-text-secondary hover:bg-mind-surface/40 hover:text-mind-text font-body text-sm transition-colors" href="#como-usar">Consumo MCP</a>
          <a class="px-4 py-2 rounded-full text-mind-text-secondary hover:bg-mind-surface/40 hover:text-mind-text font-body text-sm transition-colors" href="#padrao-codesteer">Contrato Canônico</a>
        </nav>
      </div>
      <div class="flex items-center gap-2.5">
        <a class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-mind-text-secondary hover:bg-mind-surface/40 hover:text-mind-text font-body text-sm transition-colors" href="${SITE_URL}" rel="noopener noreferrer" target="_blank">
          <span>CodeSteer</span>
          <span class="material-symbols-outlined text-[15px]">north_east</span>
        </a>
        <a class="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-mind-text-secondary hover:bg-mind-surface/40 hover:text-mind-text font-body text-sm transition-colors" href="${PAGES_URL}" rel="noopener noreferrer" target="_blank">
          <span>GitHub Pages</span>
          <span class="material-symbols-outlined text-[15px]">arrow_outward</span>
        </a>
        <a class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mind-surface/40 border border-mind-border/80 backdrop-blur-sm hover:bg-mind-surface hover:border-mind-accent/40 text-mind-text font-body text-sm transition-all duration-200 ease-out" href="${REPO_URL}" rel="noopener noreferrer" target="_blank">
          <span class="material-symbols-outlined text-[16px] text-mind-accent">terminal</span>
          <span>Repositório</span>
          <span class="font-mono text-mono text-mind-indigo">v${escapeHtml(registry.version)}</span>
        </a>
      </div>
    </div>
  </header>

  <main class="w-full pt-24 flex-1 bg-mind-bg" id="main-content">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Toast de confirmação -->
      <div class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-200 ease-out pointer-events-none flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-mind-surface border border-mind-green/40 text-mind-text backdrop-blur-md" id="toast" role="status" aria-live="polite">
        <span class="material-symbols-outlined text-[18px] text-mind-green">check_circle</span>
        <span class="font-body text-sm" id="toast-message">Copiado para a área de transferência!</span>
      </div>

      <!-- Hero Section ("The Cognitive Control Room") -->
      <section class="py-8 md:py-12">
        <div class="hero relative w-full rounded-3xl bg-mind-surface/30 backdrop-blur-md border border-mind-border/60 p-6 sm:p-8 md:p-12 overflow-hidden shadow-glow">
          <!-- Corner Bloom decorativo (nunca interativo) -->
          <div class="absolute -right-24 -top-24 w-96 h-96 bg-mind-accent/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
          <div class="absolute -left-24 -bottom-24 w-80 h-80 bg-mind-indigo/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

          <div class="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div class="max-w-3xl flex flex-col gap-5">
              <!-- Uppercase Eyebrow + Evidence Badge -->
              <div class="flex flex-wrap items-center gap-2.5">
                <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo border border-mind-indigo/35 font-label text-label uppercase">
                  THE COGNITIVE CONTROL ROOM
                </span>
                <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-badge-testing-bg text-mind-green border border-mind-green/35 font-label text-label uppercase" id="catalogo-contagem">
                  <span class="w-1.5 h-1.5 rounded-full bg-mind-green"></span>
                  ${escapeHtml(countLabel)} verificadas • SHA-256
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mind-bg/60 border border-mind-border/60 text-mind-text-secondary font-mono text-mono">
                  <span class="material-symbols-outlined text-[14px] text-mind-indigo">schedule</span>
                  gerado em ${generatedAt}
                </span>
              </div>

              <!-- Display Headline única por seção -->
              <h1 class="font-display text-display text-mind-text">
                Catálogo de skills
              </h1>

              <!-- Editorial Body (65-75ch) -->
              <p class="lede font-body text-lg text-mind-text-secondary max-w-3xl leading-relaxed">
                Índice determinístico de instruções operacionais para agentes de IA. Filtre por categoria, nome e gatilho sem carregar o corpo de <code class="px-1.5 py-0.5 rounded bg-mind-bg/80 border border-mind-border/60 text-mind-indigo font-mono text-mono">SKILL.md</code> nem expor hashes internos de <code class="px-1.5 py-0.5 rounded bg-mind-bg/80 border border-mind-border/60 text-mind-indigo font-mono text-mono">skills-registry.json</code>.
              </p>

              <!-- Botões Pill (Primary Emphasis + Secondary Glass) -->
              <div class="pt-2 flex flex-wrap items-center gap-3">
                <a class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-mind-accent text-mind-ink font-body font-semibold tracking-tight shadow-glow hover:-translate-y-0.5 transition-all duration-200 ease-out" href="#catalogo">
                  <span>Explorar skills</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_downward</span>
                </a>
                <button class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-mind-surface/40 border border-mind-border/80 text-mind-text backdrop-blur-sm hover:bg-mind-surface hover:border-mind-accent/40 hover:-translate-y-0.5 transition-all duration-200 ease-out" type="button" onclick="copyText('pnpm mcp:catalog', 'Comando MCP copiado!')">
                  <span class="font-mono text-mono text-mind-indigo">pnpm mcp:catalog</span>
                  <span class="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
                <button class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-mind-surface/40 border border-mind-border/80 text-mind-text-secondary backdrop-blur-sm hover:bg-mind-surface hover:text-mind-text hover:border-mind-accent/40 hover:-translate-y-0.5 transition-all duration-200 ease-out" type="button" onclick="copyText('${REPO_URL}', 'URL do repositório copiada!')">
                  <span class="material-symbols-outlined text-[18px]">link</span>
                  <span>Copiar repositório</span>
                </button>
              </div>

              <!-- IDE Logo Strip (ordem exata do DESING.md) -->
              ${renderIdePills()}
            </div>
          </div>
        </div>
      </section>

      <!-- Seção Principal do Catálogo -->
      <section class="py-12 border-t border-mind-border/40 scroll-mt-28" id="catalogo">
        <div class="mb-8 flex flex-col gap-2">
          <span class="self-start inline-flex items-center px-3.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo border border-mind-indigo/35 font-label text-label uppercase">
            ÍNDICE FILTRÁVEL DE ESPECIFICAÇÕES
          </span>
          <h2 class="font-headline text-headline text-mind-text">
            Skills por domínio e gatilho de ativação
          </h2>
          <p class="font-body text-body text-mind-text-secondary max-w-3xl">
            Cada card apresenta o identificador canônico em kebab-case, a categoria, o contrato positivo (<span class="font-mono text-mono text-mind-indigo">Use when</span>) e a fronteira explícita de recusa (<span class="font-mono text-mono text-mind-accent">Do NOT use for</span>).
          </p>
        </div>

        ${renderFilterControls(categories, categoryCounts, skills.length)}

        <!-- Grid de Cards -->
        <div class="catalog grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="lista-skills" aria-live="polite">
          ${cards}
        </div>

        <!-- Estado Vazio -->
        <div class="empty${emptyHidden} my-12 p-12 rounded-2xl bg-mind-surface/30 backdrop-blur-md border border-mind-border/60 text-center flex-col items-center justify-center gap-4" id="catalogo-vazio">
          <div class="w-12 h-12 rounded-full bg-mind-bg/80 border border-mind-border/60 flex items-center justify-center text-mind-accent">
            <span class="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <div class="flex flex-col gap-1 max-w-md">
            <h3 class="font-title text-title text-mind-text">Nenhuma skill encontrada.</h3>
            <p class="font-body text-body text-mind-text-secondary">Ajuste os termos de filtro ou limpe a seleção atual para visualizar todo o catálogo.</p>
          </div>
          <button class="mt-2 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-mind-accent text-mind-ink font-body font-semibold tracking-tight shadow-glow hover:-translate-y-0.5 transition-all duration-200 ease-out" type="button" onclick="clearAllFilters()">
            Limpar todos os filtros
          </button>
        </div>
      </section>

      <!-- Seção de Consumo MCP & Progressive Disclosure -->
      <section class="py-24 border-t border-mind-border/40 scroll-mt-28" id="como-usar">
        <div class="mb-10 flex flex-col gap-3 max-w-3xl">
          <span class="self-start inline-flex items-center px-3.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo border border-mind-indigo/35 font-label text-label uppercase">
            PROGRESSIVE DISCLOSURE &amp; INTEGRAÇÃO
          </span>
          <h2 class="font-headline text-headline text-mind-text">
            Consumo em 4 estágios sem poluir a janela de contexto
          </h2>
          <p class="font-body text-body text-mind-text-secondary">
            O servidor MCP local (<code class="px-1.5 py-0.5 rounded bg-mind-surface border border-mind-border/60 text-mind-indigo font-mono text-mono">pnpm mcp:catalog</code>) entrega apenas o artefato necessário a cada etapa, preservando tokens e validando integridade SHA-256 antes da leitura.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="rounded-2xl bg-mind-surface/30 backdrop-blur-md border border-mind-border/55 p-6 flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-3">
              <span class="self-start font-mono text-mono px-2.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo border border-mind-indigo/35">01 • DESCOBERTA</span>
              <h3 class="font-title text-title text-mind-text">search_skills</h3>
              <p class="font-body text-sm text-mind-text-secondary">Retorna apenas metadados (<code class="font-mono text-mono text-mind-indigo">name</code>, <code class="font-mono text-mono text-mind-indigo">description</code>, <code class="font-mono text-mono text-mind-indigo">category</code>, <code class="font-mono text-mono text-mind-indigo">version</code>) — nunca o corpo completo de <code class="font-mono text-mono text-mind-indigo">SKILL.md</code>.</p>
            </div>
            <span class="font-mono text-mono text-mind-green">Contexto mínimo</span>
          </div>

          <div class="rounded-2xl bg-mind-surface/30 backdrop-blur-md border border-mind-border/55 p-6 flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-3">
              <span class="self-start font-mono text-mono px-2.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo border border-mind-indigo/35">02 • INSTRUÇÃO</span>
              <h3 class="font-title text-title text-mind-text">read_skill</h3>
              <p class="font-body text-sm text-mind-text-secondary">Verifica o hash SHA-256 e entrega o corpo de <code class="font-mono text-mono text-mind-indigo">SKILL.md</code> junto à lista de caminhos em <code class="font-mono text-mono text-mind-indigo">references/</code> e <code class="font-mono text-mono text-mind-indigo">scripts/</code>.</p>
            </div>
            <span class="font-mono text-mono text-mind-green">Verificado por SHA-256</span>
          </div>

          <div class="rounded-2xl bg-mind-surface/30 backdrop-blur-md border border-mind-border/55 p-6 flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-3">
              <span class="self-start font-mono text-mono px-2.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo border border-mind-indigo/35">03 • REFERÊNCIAS</span>
              <h3 class="font-title text-title text-mind-text">fetch_skill_files</h3>
              <p class="font-body text-sm text-mind-text-secondary">Carrega sob demanda apenas os manuais em <code class="font-mono text-mono text-mind-indigo">references/</code> ou <code class="font-mono text-mono text-mind-indigo">templates/</code> solicitados pela tarefa, recusando executáveis.</p>
            </div>
            <span class="font-mono text-mono text-mind-green">Leitura sob demanda</span>
          </div>

          <div class="rounded-2xl bg-mind-surface/30 backdrop-blur-md border border-mind-border/55 p-6 flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-3">
              <span class="self-start font-mono text-mono px-2.5 py-1 rounded-full bg-badge-arch-bg text-mind-indigo border border-mind-indigo/35">04 • STAGING</span>
              <h3 class="font-title text-title text-mind-text">prepare_skill_files</h3>
              <p class="font-body text-sm text-mind-text-secondary">Prepara scripts auditados em diretório local ou executa <code class="font-mono text-mono text-mind-indigo">dry_run</code> após validação de supply chain, sem execução cega.</p>
            </div>
            <span class="font-mono text-mono text-mind-green">Isolamento seguro</span>
          </div>
        </div>
      </section>

      <!-- Seção Contrato Canônico em Paper Panel (#eee9dc + #232b28 conforme The Paper Rule do DESING.md) -->
      <section class="py-24 border-t border-mind-border/40 scroll-mt-28" id="padrao-codesteer">
        <div class="paper-panel rounded-2xl p-6 sm:p-8 md:p-10 border border-mind-ink/15 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div class="max-w-3xl flex flex-col gap-3">
            <span class="self-start inline-flex items-center px-3.5 py-1 rounded-full bg-mind-ink/10 text-mind-ink border border-mind-ink/25 font-label text-label uppercase">
              REGISTRO DE VERIFICAÇÃO • CONTRATO CANÔNICO
            </span>
            <h2 class="font-headline text-headline text-mind-ink">
              Padrão CodeSteer de Agentes
            </h2>
            <p class="font-body text-body text-mind-ink/90 leading-relaxed">
              Cada skill deste repositório passa por três gates determinísticos antes de publicar o catálogo no GitHub Pages: validação estrutural (<code class="px-1.5 py-0.5 rounded bg-mind-ink/10 text-mind-ink font-mono text-mono">validate:skills</code> exige gatilhos literais <code class="px-1.5 py-0.5 rounded bg-mind-ink/10 text-mind-ink font-mono text-mono">Use when</code> e <code class="px-1.5 py-0.5 rounded bg-mind-ink/10 text-mind-ink font-mono text-mono">Do NOT use for</code> e corpo ≤ 500 linhas), varredura de supply chain (<code class="px-1.5 py-0.5 rounded bg-mind-ink/10 text-mind-ink font-mono text-mono">scan:skills</code>) e compilação íntegra por hash SHA-256 (<code class="px-1.5 py-0.5 rounded bg-mind-ink/10 text-mind-ink font-mono text-mono">compile:catalog</code>).
            </p>
          </div>
          <div class="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-mind-accent text-mind-ink font-body font-semibold tracking-tight shadow-glow hover:-translate-y-0.5 transition-all duration-200 ease-out" href="${REPO_URL}" rel="noopener noreferrer" target="_blank">
              <span>Inspecionar pipeline no GitHub</span>
              <span class="material-symbols-outlined text-[18px]">north_east</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer class="site-footer w-full bg-mind-bg border-t border-mind-border/40 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-mind-border/40">
        <div class="site-footer__brand flex flex-col gap-2">
          <div class="flex items-center gap-2.5">
            ${brandFooter}
            <span class="font-title text-title text-mind-text">CodeSteer</span>
            <span class="font-mono text-mono text-mind-indigo">agent-skills</span>
          </div>
          <p class="font-body text-sm text-mind-text-secondary max-w-md">
            Catálogo Git de skills determinísticas, referências sob demanda e servidor MCP local para engenharia de software assistida por agentes.
          </p>
        </div>
        <div class="site-footer__links flex flex-wrap items-center gap-6">
          <a class="font-body text-sm text-mind-text-secondary hover:text-mind-text transition-colors" href="${SITE_URL}" rel="noopener noreferrer" target="_blank">CodeSteer Web</a>
          <a class="font-body text-sm text-mind-text-secondary hover:text-mind-text transition-colors" href="${PAGES_URL}" rel="noopener noreferrer" target="_blank">GitHub Pages</a>
          <a class="font-body text-sm text-mind-text-secondary hover:text-mind-text transition-colors" href="${REPO_URL}" rel="noopener noreferrer" target="_blank">Repositório Git</a>
        </div>
      </div>
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-mono text-mind-text-secondary">
        <div>© 2026 CodeSteer • Apache-2.0 License</div>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 text-mind-green">
            <span class="w-2 h-2 rounded-full bg-mind-green"></span>
            Registry compilado &amp; íntegro
          </span>
          <span class="text-mind-border">•</span>
          <span>Design System: The Cognitive Control Room</span>
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
