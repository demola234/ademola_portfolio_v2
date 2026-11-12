---
tags: [design, redesign, glaze]
date: 2026-11-12
status: draft — awaiting approval
---

# Site redesign on the Glaze design system

## Intent

Restyle the whole portfolio (`astro_portfolio/`, the site Vercel deploys) in the
[Glaze design system](https://design.how/systems/glaze): compact, black and white, with
glass only on the one action you press next. The article audio player is already built
in Glaze; the rest of the site should match it, so the player stops being the one odd
piece.

## Decisions (made by Ademola)

| Topic | Decision |
|---|---|
| Theme | **Dark only**, using Glaze's dark values. No light theme, no toggle. |
| Font | **Geist** and **Geist Mono** (Glaze's own face, PP Neue Montreal, is a paid licence). |
| Accent | **Drop the cyan entirely.** Fully monochrome; colour only for real status. |
| Kept from today | **ASCII portrait**, **grid background**, **terminal touches** (Mac-style code-window chrome, the breadcrumb status bar, mono labels). |
| Dropped | **Live clock** (homepage status bar). |

## Goals

- Every page uses Glaze tokens (colour, type roles, space, radius, lines, motion) from one
  place: `src/styles/global.css` and `tailwind.config.mjs`.
- Components follow the matching Glaze component where one exists (mapping below).
- No cyan left anywhere: no `#5afcfe`, `rgba(90,252,254,…)` or `var(--accent)`.
- Looks right at desktop and phone widths, with no horizontal scroll.

## Non-goals

- Content changes (copy, articles, projects, notes).
- A light theme or theme toggle.
- The legacy Vite app at the repo root, and committed build output in `.vercel/output`.
- Components no page imports today (`components/layout/Navbar.tsx`, `SocialShare.tsx`,
  `blogs/sections/PostsMade.tsx`, `animations/StarAnimation.tsx`). Leave them as they are.

## Anti-goals (a failure even if it "works")

- Glass on anything other than the one lead action in an area (no glass cards, headers,
  tags, nav).
- Colour used as decoration, or a green/red/amber that doesn't mean a status.
- Shadows or glows to lift things; a card inside a card.
- A worse reading experience on articles than today (size, measure, contrast).
- Breaking the audio player, word highlight, comments, ToC highlight or code copy buttons.

## Foundations

**Colour** — Glaze dark values, defined once as CSS custom properties on `:root`
(and mirrored in Tailwind):

| Role | Value |
|---|---|
| `--page` | `#0c0c0c` (replaces `--bg #060606`) |
| `--shell` / `--paper` / `--field` | `#161616` / `#1f1f1f` / `#2a2a2a` |
| `--text-1` / `--text-2` / `--text-3` / `--text-disabled` | `#f4f4f3` / `#f4f4f399` / `#f4f4f373` / `#f4f4f357` |
| `--line-faint` / `--line` / `--line-control` / `--line-focus` / `--line-strong` | `#f4f4f30f` / `1a` / `26` / `57` / `73` |
| `--hover` / `--pressed` | `#f4f4f30f` / `#f4f4f31a` |
| `--ink-03 … --ink-60` | `#f4f4f3` at 3, 6, 10, 15, 32, 45, 60 % |
| `--focus` | `#f4f4f3` |
| Status | `--ok #3fbf75`, `--warn #f0a531`, `--fail #ec6f5a` (+ `-text`, `-tint` variants) |
| Glass (ink) | base `#ffffff9e`, text `#050505e6`, ring `#ffffff3d`, plus the sheen/core/rim/gloss values already in the audio player |

Old tokens map as: `--bg → --page`, `--text-primary → --text-1`,
`--text-secondary → --text-2`, `--border → --line-faint`, `--border-hover → --line`,
`--card-fill → --shell`, `--accent*` → removed (use `--text-1`, `--pressed` or a hairline,
depending on the job).

**Type** — Geist for every word; Geist Mono for IDs, paths, code and the kept terminal
labels, at 0.8 of the surrounding size. Glaze roles: body 14/1.5, body-sm 13, label 13/500,
label-sm 12/500, caption 12, heading-sm 16/500, heading 20/500, title 28/500. Weights 400 and
500 only; 600 for a short strong phrase.

**Space, radius, lines** — 4px grid; controls 32px (sm 26, lg 36); rows 36px. Radius: pill
for one-line controls (buttons, chips, segmented, inputs), 14px card, 11px panel, 10px
overlay and code block, 6px tag. One 1px hairline weight; focus ring 2px `--focus`,
2px offset. No box-shadows.

**Motion** — state changes 160ms `cubic-bezier(.2,.8,.2,1)`; glass presses to 0.99 in 50ms
and returns in 200ms; overlays fade and shift 4px in 200ms. Remove the pulse/glow
animations. All of it off under `prefers-reduced-motion`.

**Icons** — Phosphor, regular weight, 14px in controls, where icons exist today.

## Component mapping

| Today | Becomes |
|---|---|
| Nav chips (`Nav.astro`) | Pill links; the current page gets the paper pill with a `--line` ring (Glaze tab look, no track). |
| Primary CTAs (hero contact, article "reply" email, video play) | One ink **glass** button per area; any neighbour is a flat secondary button. |
| Other buttons/links (share icons, "Read on Medium", copy) | Flat secondary or ghost buttons, pill. |
| Project cards, note cards, the article reply box | Glaze **Card**: `--shell` with a `--line-faint` ring, 14px radius, no glow; hover is the flat hover wash. |
| Writing list rows | Glaze **Item** rows (36px+ rows, hairline rules, hover wash). |
| Tags on posts/projects/notes | Glaze **Badge** (neutral, 6px radius, not pills, not pressable). |
| Tag filters on writing/notes indexes | Glaze **Chip** (pill; "on" = pressed wash + darker line). |
| Experience timeline | Glaze **Timeline** look: hairline spine, small ink marks, no colour. |
| Breadcrumb status bars | Kept (terminal touch); restyled in ink and lines. |
| Status dots with cyan pulse | A Glaze **Status**: a mark and a word, no pulse. Green only if it states a real status. |
| Code blocks | Keep the Mac-style chrome (kept terminal touch) on a 10px-radius `--shell` block, code at 12px/20px Geist Mono. |
| Table of contents | Panel with hairline rules; the active item gets the pressed wash (no side bar, no colour). |
| Prose links | `--text-1` with a `--line-strong` hairline underline; underline goes `--text-1` on hover. |
| Blockquotes | Hairline left rule in `--line-strong`, text-1 — no colour bar. |
| YouTube overlay | Glaze **Dialog**: `--scrim` behind, `--paper` with a `--line` ring, 10px radius. |
| 404 terminal window | Kept; restyled in ink. |
| Giscus comments | Its built-in `transparent_dark` theme so it sits on the page. |
| Audio player + word highlight | Already Glaze; its scoped tokens move to the global ones. |

## Intentional deviations from Glaze

Glaze's anti-slop guidance rules these out; Ademola chose to keep them:

- **Grid background**: kept, recoloured to `--ink-03` hairlines.
- **Terminal touches**: Mac code chrome, breadcrumb status bar, mono labels
  (e.g. "TABLE OF CONTENTS") stay. Mono labels move to sentence case where they are
  plain labels.
- **ASCII portrait**: kept as is, recoloured to ink.

Builder's calls (flag if wrong):

- **Display sizes** for the homepage hero and page titles stay larger than Glaze's 28px title
  (a portfolio hero needs it), at weight 500 with tight tracking.
- **Article prose** stays at a reading size (~17px, line-height ~1.75, max 68ch) rather
  than Glaze's 14px app body.
- **Syntax highlighting** goes monochrome (ink at its steps), per Glaze's code-block rule.
- Content that fades in on scroll is removed (Glaze anti-slop); content is just there.

## Left to the builder

Exact per-section layout, spacing and responsive breakpoints within the rules above.

## Done means

1. `npm run build` passes.
2. Every page (home, experience, projects + one project, writing + one article,
   notes + one note, 404) screenshotted at 1280px and 390px, compared before/after.
3. No cyan left (`grep` for `5afcfe`, `90,252,254`, `--accent`).
4. Audio player, word highlight, ToC highlight, code copy and comments still work.
5. `.vercel/output` left as committed.
