# Design refresh: plan

Goal: one consistent design language across surulere.dev and its tools, built from shared components that work in both React and hand-built HTML, with analytics that tell us which features people actually use.

Design candidates (Figma wasn't connected, so they're on a canvas): https://claude.ai/artifact/C7grrgU6WjidV3P1tRDc7w

- **A · Index**: light; a numbered research-lab index of essays, tools and archives. Interactive: nav clicks slide the logo, theme toggle.
- **B · Observatory**: dark; sidebar index, gridded hero panel, coordinate-style labels.
- **C · Practice**: mission statement first, then research areas that link essays to tools, as think tanks and labs do.
- **Shared system**: tokens, type, components, with the class name and React name for each.
- **Applied · Artifacts Index**: the same system on a tool site.

## What changes and what stays

| Keep | Change |
|---|---|
| Palette: grey ground, olive lines, burgundy accent (light) / teal accent (dark) | `--muted` text in dark mode: `#535E52` is 2.7:1 and fails WCAG; use `#848B83` (5.3:1) |
| Dashed = available, solid = selected | Unselected pills use `--muted` instead of 55% opacity |
| The SURU/LERE motif tile | The tile leaves the page background. It lives in a **logo window** (slides one tile on navigation/load, which replaces `body.animate-bg`) and a **footer band** |
| Essays → Tools → Archives order | System font stack and Tachyons → IBM Plex Sans + Plex Mono, shared `su-*` classes |
| Inline stroke SVG icons, 4px radius | One top bar on every site: `mark · SURULERE / <Site> · nav` |

## Shared package

Most tools already pull images from `surulere.dev/assets/img/`, so we serve the system the same way: versioned static files from this repo.

```
public/ui/v1/
  su-tokens.css       # :root + .dark tokens, Plex @import, base type
  su-components.css   # .su-topbar .su-logo .su-btn .su-pill .su-card .su-row .su-section-head .su-footer .su-motif-band
  su-topbar.js        # <su-topbar site="Atlas" nav="..."> custom element for hand-built pages
  su-analytics.js     # GA4 loader + delegated [data-track] click events (below)
  motif-tile-{light,dark}.svg
```

- **Hand-built HTML** (atlas, akb/ui, symbolic-motif-analysis export, plain pages): link the two CSS files and `<su-topbar>`. Nothing to build.
- **React** (dotdev, artifacts-index frontend): thin TSX wrappers (`<TopBar>`, `<Logo>`, `<Button>`, `<Pill>`, `<Card>`, `<Row>`, `<SectionHead>`, `<Footer>`) that render the same class names, in `components/su/`. Start by copying them into each repo; publish `@surulere/ui` only once a third React site needs them.
- Tailwind (artifacts-index) stays for layout; colors and borders move to the tokens.
- `african-artifacts/design-system.md` stays the written source of truth, updated in the same PR as `v1`.

## Rollout

1. **Pick a direction**: comment on the canvas (direction, default theme, typeface, research-area wording).
2. **Tokens + components (dotdev)**: add `public/ui/v1/*`, fix the contrast values, update `design-system.md`.
3. **surulere.dev homepage**:
   - `LayoutDefault.tsx`: logo window replaces the body background and `animate-bg`.
   - `pages/index.tsx`: rebuild sections from the shared components (drop the Tachyons class strings in `components/styles.ts`).
   - `Footer.tsx`: motif band.
   - Check Notion post pages (`[pageId].tsx`, `notion.css`) still render, then remove the background SVG from `styles.css`.
4. **artifacts-index**: swap the header for `<TopBar site="Artifacts Index">`, restyle `SearchHero` buttons and pills, and use the footer strip.
5. **atlas, akb/ui, symbolic-motif-analysis site**: atlas is already closest. akb/ui needs re-tokening from its indigo/slate palette. The motif site's `export_interpretation_site.py` template links the CSS.
6. **Review analytics after 4–6 weeks** and adjust the homepage (for example, if tools get more clicks than essays, move tools up).

## Analytics

Current state:

| Site | Tracking |
|---|---|
| artifacts-index | GA4 `G-M5R51L7ZVC`, pageviews only |
| archive-knowledge-base (Archive 3D) | GA4 `G-7R7YSBMT6W`, pageviews only |
| surulere.dev | Fathom + PostHog, only if `NEXT_PUBLIC_FATHOM_ID` / `NEXT_PUBLIC_POSTHOG_ID` are set; Plausible commented out |
| atlas, akb | none |

Proposal: **one GA4 measurement ID on every `*.surulere.dev` site**, loaded by `su-analytics.js` (React: a `<script>` in `_document` / `index.html`). GA4 sets its cookie on `surulere.dev`, so a visitor going from the homepage to a tool is one journey. Keep the two old IDs running alongside for a month so history isn't lost, then remove them, along with Fathom and PostHog if unused.

Feature usage comes from custom events. Mark elements with `data-track` and one delegated listener sends them:

```html
<a href="https://artifacts-index.surulere.dev" data-track="tool_open" data-track-tool="artifacts-index">…</a>
```

| Event | Params | Where |
|---|---|---|
| `nav_click` | `target` | top bar / sidebar |
| `logo_slide` | – | logo window |
| `essay_open` | `source` (notion/substack), `title` | homepage |
| `tool_open` | `tool` | homepage, cross-links |
| `archive_expand` | `channel` | homepage archives |
| `subscribe_click` | `placement` | any subscribe CTA |
| `theme_toggle` | `to` | top bar |
| `search` | `has_filters`, `result_count` | artifacts-index |
| `filter_toggle` | `kind` (culture/country/timeline/map), `value` | artifacts-index |
| `artifact_open` | `museum` | artifacts-index |

Every event carries `site`. If we later want heatmaps or session replay, PostHog is already a dependency of dotdev and can read the same `data-track` attributes.

## Open questions

- Direction A, B or C, or a mix (for example, A's index with C's research areas)?
- Light or dark default, or follow the OS as today?
- Are.na channel names for the archive section (the mockups use placeholders).
- Is a single GA4 property OK, or do we need per-site properties for reporting?
