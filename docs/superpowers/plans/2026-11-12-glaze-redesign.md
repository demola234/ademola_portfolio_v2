# Glaze Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every page of the Astro portfolio in the Glaze design system (dark only, Geist, monochrome), keeping the ASCII portrait, grid background and terminal touches.

**Architecture:** Glaze tokens and shared primitives live once in `src/styles/global.css` (CSS custom properties + classes) and are mirrored in `tailwind.config.mjs`. Existing shared classes (`.card`, `.tag`, `.btn-accent`, `.btn-ghost`, `.status-dot`, `.section-label`) are redefined in place so pages inherit the new look; page-scoped `<style>` blocks are then swept page by page to remove cyan and apply the component mapping.

**Tech Stack:** Astro 5 (static), Tailwind 3, React islands, Geist / Geist Mono (Google Fonts), Shiki (Astro markdown).

**Spec:** `docs/superpowers/specs/2026-11-12-glaze-redesign-design.md`

## Global Constraints

- Dark only. Token values exactly as in the spec's Foundations table (`--page #0c0c0c`, `--shell #161616`, `--paper #1f1f1f`, `--field #2a2a2a`, `--text-1 #f4f4f3`, `--text-2 #f4f4f399`, `--text-3 #f4f4f373`, lines `#f4f4f30f/1a/26/57/73`, `--focus #f4f4f3`, status `--ok #3fbf75 --warn #f0a531 --fail #ec6f5a`).
- Fonts: Geist (400, 500, 600) and Geist Mono (400, 500); mono at 0.8 of surrounding size.
- Radius: pill 999px (one-line controls), 14px card, 11px panel, 10px overlay/code block, 6px tag. Hairlines 1px. Focus 2px `--focus`, offset 2px. No box-shadows used for lift; no glows.
- Motion: state 160ms `cubic-bezier(.2,.8,.2,1)`; glass press scale .99 in 50ms, release 200ms; all transitions/animations off under `prefers-reduced-motion: reduce`.
- Glass (ink) only on one lead action per area.
- No `#5afcfe`, `90,252,254`, `--accent`, `text-accent` remaining in `astro_portfolio/src`.
- Do not modify `astro_portfolio/.vercel/output` (restore with `git checkout -- .vercel/output && git clean -fdq .vercel/output` after any build) or the root Vite app.
- Kept on purpose: grid background (recoloured to `--ink-03`), ASCII portrait (ink), Mac code chrome, breadcrumb status bars, mono labels (sentence case where plain labels).
- Article prose ~17px / 1.75, max 68ch. Hero and page titles keep display sizes, weight 500.

## Review Focus

1. **Phone width (390px)**: no horizontal page scroll on any page; nav, cards and filters wrap. — checked by the screenshot sweep's `scrollWidth` assertion in Task 7.
2. **Keyboard focus**: every link/button/chip/radio shows the 2px ink ring (Glaze removes colour, so a missing ring makes focus invisible). — Task 1 global `:focus-visible` rule; Task 7 sweep tabs once per page and asserts a non-`none` outline.
3. **Existing interactions keep working**: audio player + word highlight, ToC active highlight, code copy button, tag filters on writing/notes, video overlay. — Task 7 CDP run asserts each.
4. **Text contrast**: `--text-3` (`#f4f4f373`) only for placeholders/meta, never body copy. — Task 1 maps old `--text-secondary` to `--text-2`, not `--text-3`.
5. **Reduced motion**: removed pulses/fades stay removed; remaining transitions disabled. — Task 1 global media query; Task 7 greps for `@keyframes` left in use.

---

## Verification tooling (used by every task)

Scratch scripts live in the session scratchpad, not the repo:

- `shots.mjs <outDir> <width>` — headless Chrome (CDP on port 9333, profile dir wiped per run) loads each URL below from the dev server (`npm run dev -- --port 4321`), saves a full-page PNG, and prints `{url, scrollWidth, innerWidth}`.
  URLs: `/`, `/experience`, `/projects`, `/projects/rodinia`, `/writing`, `/writing/the-hidden-cost-of-ai`, `/notes`, `/notes/circuit-breakers`, `/404`.
- Cyan check: `grep -rnE "5afcfe|90, ?252, ?254|--accent|text-accent|accent-" astro_portfolio/src` → expected empty at the end; per task, expected empty for the task's files.

Before Task 1, capture "before" screenshots at 1280 and 390 for comparison.

---

### Task 0: Branch and commit the audio feature

**Files:** none new.

- [ ] **Step 1:** `git checkout -b glaze-redesign`.
- [ ] **Step 2:** Commit the existing audio work as its own commit: `astro_portfolio/{scripts,public/audio,src/data/audio.json,.env.example,package.json,package-lock.json,src/pages/writing/[slug].astro}` plus `docs/superpowers/specs/2026-11-12-glaze-redesign-design.md` and this plan. Message: `feat: narrated articles with word highlight, speed control and Glaze player`.
- [ ] **Step 3:** Capture "before" screenshots (1280, 390).

### Task 1: Foundations — tokens, fonts, shared primitives

**Files:**
- Modify: `astro_portfolio/src/styles/global.css` (whole file)
- Modify: `astro_portfolio/tailwind.config.mjs`

**Interfaces — Produces (later tasks use only these):**
- CSS vars: `--page --shell --paper --field --text-1 --text-2 --text-3 --text-disabled --line-faint --line --line-control --line-focus --line-strong --hover --pressed --ink-03 --ink-06 --ink-10 --ink-15 --ink-32 --ink-45 --ink-60 --focus --ok --ok-text --ok-tint --warn --warn-text --warn-tint --fail --fail-text --fail-tint`, glass vars `--glass-ink-base --glass-ink-text --glass-ink-ring --glass-sheen --glass-sheen-hover --glass-core --glass-core-held --glass-rim --glass-glaze --glass-gloss`, `--ease-out`, `--dur-state: 160ms`, `--radius-pill/shell/panel/overlay/tag`, `--control-sm/--control/--control-lg`, `--font-sans`, `--font-mono`. Keep `--max-w` and `--grid`.
- Classes: `.glass` (ink glass button recipe, moved verbatim from the audio player), `.btn` (flat secondary pill, `--paper` + `--line-faint` ring, hover `#262626`), `.btn-ghost` (no fill, hover `--hover`), `.card` (shell recipe), `.badge` (neutral tag, 6px), `.chip` (pill filter; `.active`/`[aria-pressed=true]` = `--pressed` + `--line-control` ring), `.status` (mark + word; `.status--ok` uses `--ok`), `.section-label` (Geist Mono 12px, `--text-2`, sentence case), `.prose` link/blockquote/code rules per spec.
- Legacy aliases kept so untouched markup still renders during the sweep: `.btn-accent` = `.glass` look, `.tag` = `.badge` (filters override to `.chip` in their tasks), `.text-accent` = `color: var(--text-1)`. Task 7 removes the aliases.

- [ ] **Step 1: Replace the Google Fonts import** with `Geist:wght@400;500;600` and `Geist+Mono:wght@400;500`; set `--font-sans: "Geist", system-ui, sans-serif` and `--font-mono: "Geist Mono", ui-monospace, Menlo, monospace`.
- [ ] **Step 2: Replace `:root` tokens** with the Produces list (values from Global Constraints/spec); body background `--page`, grid lines `var(--ink-03)`; selection `--pressed`; scrollbar thumb `#f4f4f333`.
- [ ] **Step 3: Redefine the shared primitives** listed above; delete hover glows, the blinking status-dot keyframes and the fade-up/fade-in entrance animations (keep the class names as no-ops so markup doesn't break). Add `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }` and the global reduced-motion rule.
- [ ] **Step 4: Update `tailwind.config.mjs`** colours to the new tokens (`page`, `shell`, `paper`, `text-1`, `text-2`, `text-3`, `line`, …); remove `accent*`; fonts to Geist.
- [ ] **Step 5: Move the audio player onto globals** — in `src/pages/writing/[slug].astro`, delete the player's scoped `--g-*` token block and `.glass` rules, switch its references to the global vars/`.glass`.
- [ ] **Step 6: Verify** `cd astro_portfolio && npm run build` passes; restore `.vercel/output`; screenshot `/writing/the-hidden-cost-of-ai` at 1280 and confirm the player looks identical to before.
- [ ] **Step 7: Commit** `feat(design): Glaze foundations — tokens, Geist, shared primitives`.

### Task 2: Shell — layout, nav, footer

**Files:** `src/layouts/BaseLayout.astro`, `src/components/layout/Nav.astro`, `src/components/layout/Footer.astro`

- [ ] **Step 1:** Nav: pill links (`--control` height, label 13/500, `--text-2`); current page = `--paper` pill with `--line` ring and `--text-1`; hover `--hover`. No track behind the group.
- [ ] **Step 2:** Footer: hairline top rule `--line-faint`, social links as ghost pills, caption text `--text-2`.
- [ ] **Step 3:** BaseLayout: `<meta name="theme-color" content="#0c0c0c">`; nothing else structural.
- [ ] **Step 4: Verify** cyan grep empty for these three files; screenshot `/experience` at 1280 and 390, no horizontal scroll.
- [ ] **Step 5: Commit** `feat(design): Glaze nav, footer and layout`.

### Task 3: Home page

**Files:** `src/pages/index.astro`, `src/components/AsciiPortrait.tsx`; delete `src/components/LiveClock.tsx`

- [ ] **Step 1:** Status bar: remove `<LiveClock>` and its import; keep `ademola.dev` and the location in Geist Mono `--text-2`; replace the cyan dot with nothing (the bar is a terminal touch, not a status).
- [ ] **Step 2:** Hero: title keeps display size at weight 500, `--text-1`; supporting copy `--text-2`; exactly one `.glass` CTA; other CTAs `.btn`.
- [ ] **Step 3:** Sections (selected work, stack, writing preview, YouTube): cards → `.card`; tags → `.badge`; section labels → `.section-label`; writing preview rows → Item rows (hairline rules, hover `--hover-row` `#f4f4f30a`).
- [ ] **Step 4:** Video overlay → Glaze dialog: `--scrim #000000a3`, `--paper` panel, `--line` ring, 10px radius, fades + scales from .97 in 200ms; close is a ghost icon button with `aria-label="Close video"`.
- [ ] **Step 5:** AsciiPortrait: any cyan/colour → `--text-1`/`--text-2` ink.
- [ ] **Step 6: Verify** build; cyan grep empty for these files; screenshot `/` at 1280 and 390; open and close the video overlay via CDP (Escape closes it).
- [ ] **Step 7: Commit** `feat(design): Glaze home page; drop live clock`.

### Task 4: Experience

**Files:** `src/pages/experience.astro`

- [ ] **Step 1:** Timeline → hairline spine `--line`, 7px ink marks (`--text-1` current, `--ink-32` past), dates in Geist Mono `--text-2`; roles heading-sm 16/500; no colour.
- [ ] **Step 2:** Education block → `.card`.
- [ ] **Step 3: Verify** cyan grep empty; screenshot 1280/390.
- [ ] **Step 4: Commit** `feat(design): Glaze experience page`.

### Task 5: Projects

**Files:** `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`, `src/components/ProjectCard.astro`

- [ ] **Step 1:** ProjectCard → `.card` (shell, 14px, `--line-faint`; hover flat wash, no lift, no glow); tags `.badge`; store links `.btn` sm (`--control-sm`).
- [ ] **Step 2:** Project detail: header title display size 500; meta as Glaze data list (label `--text-2`, value `--text-1`, hairline rules); prose inherits global `.prose`; one `.glass` lead link (GitHub or primary store link), others `.btn`.
- [ ] **Step 3: Verify** cyan grep empty; screenshot `/projects` and `/projects/rodinia` at 1280/390.
- [ ] **Step 4: Commit** `feat(design): Glaze projects`.

### Task 6: Writing, notes, 404, comments, code

**Files:** `src/pages/writing/index.astro`, `src/pages/writing/[slug].astro`, `src/pages/notes/index.astro`, `src/pages/notes/[slug].astro`, `src/pages/404.astro`, `src/components/blogs/Comments.tsx`, `astro.config.mjs`

- [ ] **Step 1:** Writing and notes indexes: tag filters → `.chip` with `aria-pressed` reflecting state (keep existing filter JS; only class/attribute changes); post list → Item rows; note cards → `.card`.
- [ ] **Step 2:** Article and note pages: status bar ink; tags `.badge`; share buttons `.btn-ghost` icon pills (`--control`); "Read on Medium" `.btn`; reply box → `.card` with one `.glass` email button; ToC → panel (11px radius, `--line-faint` ring), active item `--pressed` wash, no side bar; label "Table of contents" in `.section-label`.
- [ ] **Step 3:** Code blocks: keep the injected Mac chrome; block `--shell`, 10px radius, `--line-faint` ring; code Geist Mono 12px / 20px; copy button `.btn` sm. In `astro.config.mjs` set `markdown.shikiConfig.theme` to a monochrome theme (`min-dark`), override its background to transparent.
- [ ] **Step 4:** Comments: giscus `theme="transparent_dark"`.
- [ ] **Step 5:** 404: terminal window kept; ink colours; one `.glass` "Back home" button.
- [ ] **Step 6: Verify** build; cyan grep empty for these files; screenshots of all five routes at 1280/390; CDP: on the article, play audio and assert a `.rw-active` word appears and `.tocitem.active` exists after scrolling; click a code copy button and assert its label becomes "copied!"; on `/writing`, toggle a chip and assert `aria-pressed="true"` and the list filters.
- [ ] **Step 7: Commit** `feat(design): Glaze writing, notes, 404, code and comments`.

### Task 7: Sweep and verify

**Files:** any stragglers in `astro_portfolio/src`; `global.css` (remove legacy aliases)

- [ ] **Step 1:** Remove the Task 1 legacy aliases (`.btn-accent`, `.tag`, `.text-accent`) and fix any markup still using them.
- [ ] **Step 2:** Full cyan grep → expected empty. Grep `@keyframes` in `src` → only the spinner/sweep ones Glaze allows (or none).
- [ ] **Step 3:** Run `shots.mjs` at 1280 and 390 for all nine URLs; assert `scrollWidth <= innerWidth` for every page; review each screenshot against the "before" set and the spec's anti-goals.
- [ ] **Step 4:** Keyboard check via CDP on `/` and the article: press Tab once, assert `getComputedStyle(document.activeElement).outlineStyle !== 'none'`.
- [ ] **Step 5:** `npm run build` passes; restore `.vercel/output`; `git status` shows only intended files.
- [ ] **Step 6: Commit** `chore(design): remove legacy aliases, final Glaze sweep`.
