# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Build + serve with hot-reload (localhost:8080)
npm run build            # Production build (output: public/)
npm run check            # TypeScript check + Prettier check
npm run test             # Run all tests (tsx --test for framework, vitest for plugins)
npm run sync             # Format + git sync/push
npm run build:plugins    # Build local plugins + install community plugins (re-run after plugin source changes)
npm run build:test       # Build with bundle analysis
```

**Running a single test file:**
```bash
npm test -- quartz/components/renderPage.test.ts # framework tests (tsx --test)
cd plugins/home && npx vitest run path/to/test   # plugin tests (vitest)
```

## Architecture

This is a **Quartz v5** static site generator — a digital garden/blog that converts Markdown into a static website. It's a fork with custom plugins and theming layered on top.

### Pipeline (3 stages)

```
Markdown (.md) → Parse (unified/remark → MD AST → remark-rehype → HTML AST)
                → Filter (remove drafts, unpublished)
                → Emit (write HTML/CSS/JS to public/)
```

- `quartz/processors/parse.ts` — Worker-pool-based Markdown → HTML processing. Plugins hook into the remark/rehype pipeline.
- `quartz/processors/filter.ts` — Runs filter plugins to decide what gets published.
- `quartz/processors/emit.ts` — Runs emitter plugins in order: **ComponentResources** → **PageTypeDispatcher** (generates virtual pages: tag pages, folder pages, etc.) → **everything else** (sitemap, RSS, content index, etc.).

### Plugin system

Plugins are the extensibility mechanism. Four types defined in `quartz/plugins/types.ts`:

| Type | Role |
|------|------|
| **Transformers** | Modify Markdown/HTML AST during parse (syntax highlighting, wikilinks, callouts) |
| **Filters** | Gate what gets published (remove drafts, explicit publish, unlisted pages) |
| **Emitters** | Generate output files (pages, RSS, sitemap, static assets) |
| **PageTypes** | Virtual page generators (tag pages, folder pages, canvas pages) |

### Configuration

Everything flows from `quartz.config.yaml`, loaded by `quartz.ts`:
- `configuration` — site settings (title, theme, analytics, locale, ignore patterns)
- `plugins` — ordered plugin list. Order matters for transformers (determines pipeline order in parse.ts)
- `layout` — component placement by page type (left sidebar, right sidebar, beforeBody, etc.)

### Custom local plugins (`plugins/` directory)

These are TypeScript packages built with tsup:

- **`plugins/home/`** — Page-type plugin providing two frames: `NeonFrame` (dark cyberpunk homepage) and `SkysourceFrame` (standard layout with sidebar, navbar, footer). Homepage matched on `slug === "index"`.
- **`plugins/darkmode/`** — Dark/light mode toggle component with inline script.
- **`plugins/extends-transformer/`** — Transformer plugin: callout title fix, code block filename/header injector.
- **`plugins/gallery/`** — Gallery page type.

Each local plugin has its own `package.json`, `tsup.config.ts`, and vitest setup. After editing, run `npm run build:plugins` (or `npm run build` in the plugin directory) and restart dev server.

### Community plugins

Managed via `.quartz/` (auto-populated by `npm run install-plugins`). Sourced from `github:quartz-community/*` repos. Do not edit `.quartz/` directly — it's regenerated on install.

### Content

Markdown files live in `content/`. Uses Obsidian-flavored markdown (wikilinks `[[page]]`, callouts, block references, tags, mermaid). Page slugs are derived from file paths. The root `content/index.md` is the homepage and matches the `Homepage` page-type plugin.

### Frames & layout

Frames (defined in `plugins/home/src/frames.tsx`) wrap pages with layout. The Quartz layout system positions components (search, explorer, backlinks, TOC, etc.) into named slots: `left`, `right`, `beforeBody`, `afterBody`, `header`, `footer`. Component allocation per page type is configured in `quartz.config.yaml` → `layout.byPageType`.

### Key types

- `GlobalConfiguration` in `quartz/cfg.ts` — site-wide config shape
- `QuartzConfig` — wraps `configuration` + `plugins` + `externalPlugins`
- `FullPageLayout` / `PageLayout` / `SharedLayout` — component slot structure
- Worker context is serialized as `WorkerSerializableBuildCtx` for multi-threaded parsing

# 操作规范

详见项目技能 `.claude/skills/quartz-rules/SKILL.md`，它定义了各类代码变更的唯一正确位置。