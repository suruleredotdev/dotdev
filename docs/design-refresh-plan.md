# Design refresh: plan

Goal: one consistent design language across surulere.dev and its tools, built from shared components that work in both React and hand-built HTML, with analytics that tell us which features people actually use.

Design candidates (Figma wasn't connected, so they're on a canvas): https://claude.ai/artifact/C7grrgU6WjidV3P1tRDc7w

**Decision: Direction A (Index) for the homepage.** B and C stay on the canvas for reference.

- **A · Index (v2)**: hero with a featured carousel, then Research areas, Essays and Tools. Interactive: nav clicks slide the logo, the carousel steps, area previews expand, and there's a theme toggle.
- **Tool sites**: Artifacts Index, Atlas, Archive 3D and the Symbolic Motif Analysis export, each on the shared shell.
- **Shared system (v0.2)**: tokens, type, the pattern rule and components, with the class name and React name for each.

## What changes and what stays

| Keep | Change |
|---|---|
| Fonts: the system sans stack (Tachyons `sans-serif`) plus the system mono Atlas already uses. No web fonts | Tachyons class strings → shared `su-*` classes |
| Palette: grey ground, olive lines, burgundy accent (light) / teal accent (dark) | The accent is kept spare: hover, focus ring and small current markers only. Never a button fill or heading color. Main actions are solid ink, secondary actions dashed |
| Dashed = available, solid = selected | `--muted` text in dark mode: `#535E52` is 2.7:1 and fails WCAG; use `#848B83` (5.3:1). Unselected pills use `--muted` instead of 55% opacity |
| The SURU/LERE tile as the page ground, at 50px (today's `--bg-size`) | It's one fixed layer (`background-attachment: fixed`), so everywhere it shows lines up. The header, the hero and a footer window **reveal** it, with an inset shadow on the windows; content sections **cover** it with a solid ground. The same tile size is used everywhere |
| The `bg-slide` motion | Moves to the 40px **logo window** (slides one tile on navigation) and the hero (slides one tile per carousel step), replacing `body.animate-bg` |
| Inline stroke SVG icons, 4px radius | One top bar on every site: the logo mark alone (no SURULERE wordmark beside it), then `/ <Tool name>` on tool sites |
| Essays and Tools sections | A **Research areas** section leads, one card per Are.na channel (**Historiography, Sensemaking, Permaculture, Technology**), each linking its essays and tools. Areas with no essays yet show recent and popular blocks from the channel. The separate Archives section folds into it, and essay rows and tool pages carry their area as a tag |

## Shared package

Most tools already pull images from `surulere.dev/assets/img/`, so we serve the system the same way: versioned static files from this repo.

```
public/ui/v1/
  su-tokens.css       # :root + .dark tokens, system font stacks, base type
  su-components.css   # .su-reveal .su-window .su-topbar .su-logo .su-btn .su-pill .su-card .su-area-card .su-row .su-section-head .su-footer
  su-topbar.js        # <su-topbar site="Atlas" nav="..."> custom element for hand-built pages
  su-analytics.js     # GA4 loader + delegated [data-track] click events (below)
  motif-tile-{light,dark}.svg
```

- **Hand-built HTML** (atlas, akb/ui, symbolic-motif-analysis export, plain pages): link the two CSS files and `<su-topbar>`. Nothing to build.
- **React** (dotdev, artifacts-index frontend): thin TSX wrappers (`<TopBar>`, `<Logo>`, `<Button>`, `<Pill>`, `<Card>`, `<Row>`, `<SectionHead>`, `<Footer>`) that render the same class names, in `components/su/`. Start by copying them into each repo; publish `@surulere/ui` only once a third React site needs them.
- Tailwind (artifacts-index) stays for layout; colors and borders move to the tokens.
- `african-artifacts/design-system.md` stays the written source of truth, updated in the same PR as `v1`.

## Rollout

1. ~~Pick a direction~~: A, system fonts, spare accent, Are.na channels as research areas. Still open: the essay → area mapping and the default theme.
2. **Tokens + components (dotdev)**: add `public/ui/v1/*`, fix the contrast values, update `design-system.md`.
3. **surulere.dev homepage**:
   - `LayoutDefault.tsx`: the body keeps the 50px tile but fixed (`.su-reveal`); the logo window replaces `animate-bg`.
   - `pages/index.tsx`: hero window + featured carousel, Research areas (driven by the four Are.na channels `resolveArenaChannels()` already fetches: block count, recent and most-connected blocks), Essays tagged by area, Tools. Drop the Tachyons class strings in `components/styles.ts`.
   - `Footer.tsx`: footer window, then solid footer.
   - Check Notion post pages (`[pageId].tsx`, `notion.css`) still render on the solid ground.
4. **artifacts-index**: swap the header for `<TopBar site="Artifacts Index">`, restyle `SearchHero` buttons and pills, add the footer window.
5. **atlas, Archive 3D, akb/ui, symbolic-motif-analysis site**: atlas is already closest. Archive 3D keeps a dark stage for the graph and moves Path, Commentary and Details into shared panels. akb/ui needs re-tokening from its indigo/slate palette. The motif site's `export_interpretation_site.py` template links the CSS.
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
| `carousel_step` | `to` | homepage hero |
| `area_preview` | `channel` | research area cards |
| `essay_open` | `source` (notion/substack), `area`, `title` | homepage |
| `tool_open` | `tool`, `area` | homepage, cross-links |
| `block_open` | `channel`, `kind` (recent/popular) | research area cards |
| `subscribe_click` | `placement` | any subscribe CTA |
| `theme_toggle` | `to` | top bar |
| `search` | `has_filters`, `result_count` | artifacts-index |
| `filter_toggle` | `kind` (culture/country/timeline/map), `value` | artifacts-index |
| `artifact_open` | `museum` | artifacts-index |

Every event carries `site`. If we later want heatmaps or session replay, PostHog is already a dependency of dotdev and can read the same `data-track` attributes.

### Giving Claude read access to the numbers

There's no first-party Google Analytics connector. Options, best first:

1. **GA4 Data API with a read-only service account.** Create a service account in Google Cloud and add it as a *Viewer* on the GA4 property (or properties). Store its JSON key in the Claude Code cloud environment settings (environment menu → Edit → Network secrets / environment variables) as `GA_SERVICE_ACCOUNT_JSON`, plus `GA_PROPERTY_IDS`. A new session can then query traffic, top pages and events. Don't paste keys into chat.
2. **GA4 → BigQuery export** (free for standard properties). Link the property to a BigQuery dataset. The environment already ships the `bq`/`gcloud` CLIs, so the same service account (BigQuery Data Viewer + Job User) gives raw event-level SQL.
3. **Supermetrics connector** (third-party, in the claude.ai connector directory, needs a Supermetrics account). It can read GA4 without keys.

## Open questions

- Light or dark default, or follow the OS as today?
- Is the essay → area mapping right?
- Is a single GA4 property OK, or do we need per-site properties for reporting?
