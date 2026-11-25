import * as React from "react";

import {
  TopBar,
  Window,
  Cover,
  Container,
  Panel,
  SectionHead,
  MediaCard,
  MediaCards,
  Footer,
} from "components/su";
import {
  hero,
  areas,
  areaTitle,
  tools,
  researchInProgress,
  footer,
  AreaKey,
  SUBSTACK_URL,
  ARENA_PROFILE_URL,
  GITHUB_URL,
} from "lib/home-content";
import type { AreaChannel } from "lib/resolve-research-areas";

import styles from "./home.module.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const asset = (path: string) => `${base}${path}`;
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export type HomeEssay = {
  id: string;
  title: string;
  href: string;
  external: boolean;
  published: number;
  area?: AreaKey;
};

const formatDate = (t: number) =>
  new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

/* ── Top bar ────────────────────────────────────────────────────────── */

export function HomeTopBar({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  return (
    <TopBar
      navLabel="Sections"
      homeHref={base || "/"}
      items={[
        { label: "Research", href: "#research", track: "research" },
        { label: "Essays", href: "#essays", track: "essays" },
        { label: "Tools", href: "#tools", track: "tools" },
        // On phones About is in the footer, so the bar fits one row.
        { label: "About", href: "#about", track: "about", className: "su-hide-phone" },
        { label: "Subscribe ↗", href: SUBSTACK_URL, track: "subscribe" },
      ]}
      actions={[
        {
          label: isDark ? <SunIcon /> : <MoonIcon />,
          ariaLabel: isDark ? "Switch to light theme" : "Switch to dark theme",
          onClick: onToggleTheme,
        },
      ]}
    />
  );
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
const MoonIcon = () => (
  <svg {...iconProps}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
const SunIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

/* ── Hero ───────────────────────────────────────────────────────────── */

export function HomeHero({ latest }: { latest?: HomeEssay }) {
  return (
    <Window variant="hero" as="header" id="top">
      <Container>
        <div className={styles.heroGrid}>
          <Panel className={styles.intro}>
            <span className={styles.eyebrow}>{hero.eyebrow}</span>
            <h1>{hero.title}</h1>
            <p>{hero.description}</p>
            <div className={styles.actions}>
              <a className="su-btn su-btn--primary" href="#research">
                Explore the research
              </a>
              <a className="su-btn" href="#essays">
                Read the essays
              </a>
            </div>
          </Panel>
          <Featured latest={latest} />
        </div>
      </Container>
    </Window>
  );
}

function Featured({ latest }: { latest?: HomeEssay }) {
  const tool = tools[0];
  const slides: { key: string; node: React.ReactNode }[] = [];
  if (latest) {
    slides.push({
      key: "essay",
      node: (
        <a className={styles.slide} href={latest.href} {...(latest.external ? external : {})} data-track="essay_open" data-track-source="featured">
          <span className={styles.slideText}>
            <span className={styles.eyebrow}>Latest essay · {formatDate(latest.published)}</span>
            <span className={styles.slideTitle}>{latest.title}</span>
            <span className={styles.slideCta}>{latest.external ? "Read on Substack ↗" : "Read the essay"}</span>
          </span>
        </a>
      ),
    });
  }
  slides.push({
    key: "tool",
    node: (
      <a className={styles.slide} href={tool.url} {...external} data-track="tool_open" data-track-tool="artifacts-index">
        <img className={styles.slideImg} src={asset(tool.image)} alt="" />
        <span className={styles.slideText}>
          <span className={styles.eyebrow}>Tool</span>
          <span className={styles.slideTitle}>{tool.title}</span>
          <p className={styles.slideDesc}>Cross-cultural index of museum collections.</p>
          <span className={styles.slideCta}>Open ↗</span>
        </span>
      </a>
    ),
  });
  slides.push({
    key: "research",
    node: (
      <a className={styles.slide} href={researchInProgress.href} {...external}>
        <span className={styles.slideText}>
          <span className={styles.eyebrow}>{researchInProgress.label}</span>
          <span className={styles.slideTitle}>{researchInProgress.title}</span>
          <p className={styles.slideDesc}>{researchInProgress.description}</p>
          <span className={styles.slideCta}>{researchInProgress.stat}</span>
        </span>
      </a>
    ),
  });

  const [index, setIndex] = React.useState(0);
  const go = (to: number) => setIndex((to + slides.length) % slides.length);

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label="Featured">
      <div className={styles.carouselHead}>
        <span className={styles.eyebrow} aria-live="polite">
          Featured · {index + 1} / {slides.length}
        </span>
        <button type="button" className={styles.stepBtn} aria-label="Previous featured item" onClick={() => go(index - 1)} data-track="carousel_step">
          ‹
        </button>
        <button type="button" className={styles.stepBtn} aria-label="Next featured item" onClick={() => go(index + 1)} data-track="carousel_step">
          ›
        </button>
      </div>
      {slides.map((s, i) => (
        <div key={s.key} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`} hidden={i !== index} style={{ display: i === index ? "flex" : undefined, flex: 1 }}>
          {s.node}
        </div>
      ))}
      <div className={styles.dots}>
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={styles.dot}
            aria-label={`Show featured item ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Research areas ─────────────────────────────────────────────────── */

export function ResearchAreas({
  essays,
  channels,
}: {
  essays: HomeEssay[];
  channels: Partial<Record<AreaKey, AreaChannel | null>>;
}) {
  return (
    <Cover id="research" aria-labelledby="research-title" className={styles.section}>
      <Container>
        <SectionHead
          num="01"
          id="research-title"
          title="Research areas"
          link={{ href: ARENA_PROFILE_URL, label: "All channels on Are.na ↗", external: true }}
        />
        <p className={styles.lede}>
          Each area is an Are.na channel of curated references, linked to the essays and tools that grew out of it.
        </p>
        <ul className={styles.areas}>
          {areas.map((area) => (
            <AreaCard
              key={area.key}
              area={area}
              channel={channels[area.key] || null}
              essays={essays.filter((e) => e.area === area.key)}
            />
          ))}
        </ul>
      </Container>
    </Cover>
  );
}

function AreaCard({
  area,
  channel,
  essays,
}: {
  area: (typeof areas)[number];
  channel: AreaChannel | null;
  essays: HomeEssay[];
}) {
  const [open, setOpen] = React.useState(false);
  const previewId = `${area.key}-preview`;
  const links = [
    ...essays.map((e) => ({ title: e.title, kind: "Essay", href: e.href, external: e.external })),
    ...area.links.map((l) => ({ ...l, external: true })),
  ];
  // An area with nothing of ours yet shows the channel's latest blocks instead.
  const recentRows = links.length === 0 && channel ? channel.recent.slice(0, 3) : [];

  return (
    <li className={styles.area}>
      <div className={styles.areaHead}>
        <div className={styles.areaMeta}>
          <span>{area.code}</span>
          {channel?.length != null ? <span>{channel.length} blocks</span> : null}
        </div>
        <h3 className={styles.areaTitle}>{area.title}</h3>
        {area.subtitle ? <span className={styles.areaSub}>{area.subtitle}</span> : null}
        <a className={styles.areaChannel} href={channel?.url || area.fallbackUrl} {...external}>
          Are.na channel ↗
        </a>
      </div>
      <ul className={styles.areaLinks}>
        {links.map((l) => (
          <li key={l.href + l.title}>
            <a href={l.href} {...(l.external ? external : {})}>
              {l.title}
            </a>
            <span className={styles.kind}>{l.kind}</span>
          </li>
        ))}
        {recentRows.map((b) => (
          <li key={b.id}>
            <a href={b.url} {...external}>
              {b.title}
            </a>
            <span className={styles.kind}>Recent{b.connectedAt ? ` · ${formatDate(Date.parse(b.connectedAt))}` : ""}</span>
          </li>
        ))}
        {links.length === 0 && recentRows.length === 0 ? (
          <li>
            <p className={styles.empty}>No essays or tools yet. Browse the references on the channel.</p>
          </li>
        ) : null}
      </ul>
      {channel && channel.recent.length ? (
        <div className={styles.areaFoot}>
          {open ? (
            <ul className={styles.blocks} id={previewId}>
              {channel.recent.map((b) => (
                <li key={b.id}>
                  <a href={b.url} {...external} title={b.title}>
                    {b.image ? <img src={b.image} alt={b.title} loading="lazy" /> : <span>{b.title}</span>}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            className={`su-btn ${styles.previewBtn}`}
            aria-expanded={open}
            aria-controls={previewId}
            onClick={() => setOpen(!open)}
            data-track="area_preview"
            data-track-channel={area.key}
          >
            {open ? "Hide preview –" : "Preview channel +"}
          </button>
        </div>
      ) : null}
    </li>
  );
}

/* ── Essays ─────────────────────────────────────────────────────────── */

export function Essays({ essays }: { essays: HomeEssay[] }) {
  return (
    <Cover id="essays" aria-labelledby="essays-title" className={styles.section}>
      <Container>
        <SectionHead
          num="02"
          id="essays-title"
          title="Essays"
          link={{ href: SUBSTACK_URL, label: "All on Substack ↗", external: true }}
        />
        <ol className="su-rows">
          {essays.map((e, i) => (
            <li key={e.id}>
              <a
                className="su-row"
                href={e.href}
                {...(e.external ? external : {})}
                data-track="essay_open"
                data-track-area={e.area}
              >
                <span className="su-row__num">{String(essays.length - i).padStart(2, "0")}</span>
                <span className="su-row__title">{e.title}</span>
                <span className="su-row__meta">
                  {[areaTitle(e.area), formatDate(e.published)].filter(Boolean).join(" · ")}
                  {e.external ? " ↗" : ""}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </Container>
    </Cover>
  );
}

/* ── Tools ──────────────────────────────────────────────────────────── */

export function Tools() {
  return (
    <Cover id="tools" aria-labelledby="tools-title" className={`${styles.section} ${styles.toolsSection}`}>
      <Container>
        <SectionHead
          num="03"
          id="tools-title"
          title="Tools"
          link={{ href: GITHUB_URL, label: "Source on GitHub ↗", external: true }}
        />
        <MediaCards>
          {tools.map((t) => (
            <MediaCard
              key={t.title}
              href={t.url}
              newTab
              ratio="wide"
              image={asset(t.image)}
              imageAlt={t.alt}
              title={t.title}
              meta={`${areaTitle(t.area)} ↗`}
              description={t.description}
              data-track="tool_open"
            />
          ))}
        </MediaCards>
      </Container>
    </Cover>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────── */

export function HomeFooter() {
  return (
    <Footer id="about">
      <div className="su-footer__cols">
        <div>
          <div className="su-footer__brand">SURULERE</div>
          <p>{footer.line}</p>
        </div>
        {footer.groups.map((g) => (
          <nav key={g.label} className="su-footer__group" aria-label={g.label}>
            <span>{g.label.toUpperCase()}</span>
            {g.links.map((l) => (
              <a key={l.label} href={l.href} {...(l.href.startsWith("http") ? external : {})}>
                {l.label}
              </a>
            ))}
          </nav>
        ))}
      </div>
      <div>© {new Date().getFullYear()} SURULERE.DEV</div>
    </Footer>
  );
}
