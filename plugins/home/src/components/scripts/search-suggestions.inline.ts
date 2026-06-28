// ponytail: typeahead suggestions using fetchData content index, substring match handles CJK better than FlexSearch

interface ContentItem {
  title: string;
  content: string;
  tags: string[];
}

let searchData: Record<string, ContentItem> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let focusedIndex = -1;

const cleanupFns: Array<() => void> = [];

function addCleanup(fn: () => void) {
  cleanupFns.push(fn);
}

function runCleanups() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns.length = 0;
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightTerm(text: string, term: string): string {
  const escaped = escapeHTML(text);
  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return escaped.replace(regex, '<span class="highlight">$&</span>');
}

function getContextAround(text: string, term: string, startPos?: number, ctxLen = 20): string {
  const lower = text.toLowerCase();
  const idx = startPos ?? lower.indexOf(term.toLowerCase());
  if (idx === -1) return text.slice(0, 100) + "...";
  const start = Math.max(0, idx - ctxLen);
  const end = Math.min(text.length, idx + term.length + ctxLen);
  let result = text.slice(start, end);
  if (start > 0) result = "..." + result;
  if (end < text.length) result += "...";
  return result;
}

function navigateTo(slug: string) {
  const url = new URL(slug, window.location.origin);
  if (window.spaNavigate) {
    window.spaNavigate(url, false);
  } else {
    window.location.href = url.href;
  }
}

function buildSuggestions(term: string, container: HTMLElement) {
  container.innerHTML = "";
  focusedIndex = -1;

  if (!searchData || !term.trim()) return;

  const lowerTerm = term.toLowerCase();
  const results: { slug: string; title: string; matches: string[] }[] = [];

  for (const [slug, item] of Object.entries(searchData)) {
    if (!item.title && !item.content) continue;

    const titleMatch = (item.title || "").toLowerCase().includes(lowerTerm);
    const contentMatches: string[] = [];

    if (item.content) {
      const lowerContent = item.content.toLowerCase();
      let idx = 0;
      while ((idx = lowerContent.indexOf(lowerTerm, idx)) !== -1) {
        contentMatches.push(getContextAround(item.content, term, idx));
        idx += lowerTerm.length;
        if (contentMatches.length >= 3) break; // ponytail: cap per-file matches
      }
    }

    if (titleMatch || contentMatches.length > 0) {
      results.push({ slug, title: item.title || slug, matches: contentMatches });
    }
  }

  if (results.length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "suggestion-no-results";
    noResults.textContent = "没有找到相关内容";
    container.appendChild(noResults);
    return;
  }

  // ponytail: limit total results to prevent DOM bloat, upgrade to virtual scroll if needed
  const maxResults = 10;
  for (const result of results.slice(0, maxResults)) {
    const group = document.createElement("div");
    group.className = "suggestion-group";

    const titleEl = document.createElement("div");
    titleEl.className = "suggestion-title";
    titleEl.setAttribute("data-slug", result.slug);
    titleEl.innerHTML = highlightTerm(result.title, term);
    group.appendChild(titleEl);

    for (const match of result.matches) {
      const contentEl = document.createElement("div");
      contentEl.className = "suggestion-content";
      contentEl.setAttribute("data-slug", result.slug);
      contentEl.innerHTML = highlightTerm(match, term);
      group.appendChild(contentEl);
    }

    container.appendChild(group);
  }
}

function getAllRows(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(".suggestion-title, .suggestion-content"),
  );
}

function setFocus(container: HTMLElement, index: number) {
  const rows = getAllRows(container);
  rows.forEach((r) => r.classList.remove("focus"));
  focusedIndex = index;
  if (index >= 0 && index < rows.length) {
    rows[index]!.classList.add("focus");
    rows[index]!.scrollIntoView({ block: "nearest" });
  }
}

async function loadData() {
  if (searchData) return;
  try {
    searchData = (await fetchData) as unknown as Record<string, ContentItem>;
  } catch {
    // ponytail: fetchData failed, suggestions simply won't show
  }
}

function setupSuggestions() {
  runCleanups();

  const searchInput = document.querySelector<HTMLInputElement>(".neon-search .search-input");
  const searchEl = document.querySelector<HTMLElement>(".neon-search .search");

  if (!searchInput || !searchEl) return;

  // Find or create suggestions container (after .search-container)
  let suggestions = searchEl.querySelector<HTMLElement>(".search-suggestions");
  if (!suggestions) {
    suggestions = document.createElement("div");
    suggestions.className = "search-suggestions";
    const searchContainer = searchEl.querySelector(".search-container");
    if (searchContainer) {
      searchContainer.after(suggestions);
    } else {
      searchEl.appendChild(suggestions);
    }
  }

  const handleInput = (e: Event) => {
    e.stopPropagation(); // prevent community search from also firing
    const value = (e.target as HTMLInputElement).value;

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value.trim()) {
      suggestions.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(async () => {
      await loadData();
      buildSuggestions(value, suggestions);
    }, 150);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    const rows = getAllRows(suggestions);
    if (rows.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setFocus(suggestions, Math.min(focusedIndex + 1, rows.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      setFocus(suggestions, Math.max(focusedIndex - 1, 0));
      return;
    }
    if (e.key === "Enter" && !e.isComposing) {
      if (focusedIndex >= 0 && focusedIndex < rows.length) {
        e.preventDefault();
        e.stopPropagation();
        const slug = rows[focusedIndex]!.getAttribute("data-slug");
        if (slug) navigateTo(slug);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeSuggestions();
      searchInput.blur();
    }
  };

  const closeSuggestions = () => {
    suggestions.innerHTML = "";
    focusedIndex = -1;
  };

  const handleClick = (e: Event) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      ".suggestion-title, .suggestion-content",
    );
    if (!target) return;
    const slug = target.getAttribute("data-slug");
    if (slug) navigateTo(slug);
  };

  searchInput.addEventListener("focus", handleInput, true);
  searchInput.addEventListener("blur", closeSuggestions, true);
  searchInput.addEventListener("input", handleInput, true);
  searchInput.addEventListener("keydown", handleKeydown, true);
  suggestions.addEventListener("click", handleClick);

  addCleanup(() => {
    searchInput.removeEventListener("focus", handleInput, true);
    searchInput.removeEventListener("blur", closeSuggestions, true);
    searchInput.removeEventListener("input", handleInput, true);
    searchInput.removeEventListener("keydown", handleKeydown, true);
    suggestions.removeEventListener("click", handleClick);
  });
}

document.addEventListener("nav", setupSuggestions);
document.addEventListener("render", setupSuggestions);
