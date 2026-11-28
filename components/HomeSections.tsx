import * as React from "react";

import { HomeConfig } from "lib/home-config";
import { ResearchArea } from "lib/research-areas";
import { ExternalLinkIcon } from "components/ExternalLinkIcon";

export interface HomeEssay {
  title: string;
  description?: string;
  published: number;
  href: string;
  isExternal: boolean;
}

const fillCount = (label: string, count: number) =>
  label.replace("{count}", String(count));

const formatDate = (published: number) =>
  new Date(published).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const clip = (text: string | undefined, max: number) =>
  text && text.length > max ? text.substring(0, max - 3) + "..." : text;

/** "Essays · Tools · Areas" jump links under the intro. */
export const SectionLinks = ({
  links,
}: {
  links: { id: string; label: string }[];
}) => (
  <nav aria-label="On this page" className="home-jump">
    {links.map((l) => (
      <a key={l.id} href={`#${l.id}`}>
        {l.label} ↓
      </a>
    ))}
  </nav>
);

/** Section title row; sticks to the top while its section is on screen. */
const SectionHead = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="home-head">
    <h2 id={`${id}-title`} className="home-head-title title">
      {title}
    </h2>
    <span className="home-head-fill" />
    {children}
  </div>
);

/**
 * Grid props for a section's `columns` setting: a fixed count on desktop
 * (see .home-grid--cols), or 0 to fit as many as the width allows.
 */
const gridColumns = (columns: number) =>
  columns > 0
    ? { className: " home-grid--cols", style: { ["--home-cols" as any]: columns } as React.CSSProperties }
    : { className: "", style: undefined };

const ToggleButton = ({
  open,
  onToggle,
  closedLabel,
  openLabel,
  controls,
}: {
  open: boolean;
  onToggle: () => void;
  closedLabel: string;
  openLabel: string;
  controls: string;
}) => (
  <button
    type="button"
    className="home-more"
    aria-expanded={open}
    aria-controls={controls}
    onClick={onToggle}
  >
    {open ? `${openLabel} ↑` : `${closedLabel} ↓`}
  </button>
);

const EssayLink = ({
  essay,
  className,
  children,
}: {
  essay: HomeEssay;
  className: string;
  children: React.ReactNode;
}) => (
  <a
    className={className}
    href={essay.href}
    target={essay.isExternal ? "_blank" : undefined}
    rel={essay.isExternal ? "noopener noreferrer" : undefined}
  >
    {children}
  </a>
);

export const EssaysSection = ({
  essays,
  config,
  substackUrl,
}: {
  essays: HomeEssay[];
  config: HomeConfig["essays"];
  substackUrl: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const latest = essays.slice(0, config.previewCount);
  const earlier = essays.slice(config.previewCount);

  return (
    <section id="essays" aria-labelledby="essays-title" className="home-section">
      <SectionHead id="essays" title={config.title}>
        <a
          className="home-head-link"
          href={substackUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {config.substackLinkLabel} <ExternalLinkIcon />
        </a>
        {earlier.length > 0 && (
          <ToggleButton
            open={open}
            onToggle={() => setOpen(!open)}
            closedLabel={fillCount(config.showAllLabel, essays.length)}
            openLabel={config.showFewerLabel}
            controls="essays-earlier"
          />
        )}
      </SectionHead>

      <ul className="home-grid home-grid--essays">
        {latest.map((essay, i) => (
          <li key={i}>
            <EssayLink essay={essay} className="home-tile">
              <span className="home-meta">{formatDate(essay.published)}</span>
              <span className="home-tile-title">
                {essay.title}
                {essay.isExternal && <ExternalLinkIcon />}
              </span>
              {essay.description && (
                <span className="home-tile-text">{clip(essay.description, 200)}</span>
              )}
            </EssayLink>
          </li>
        ))}
      </ul>

      {earlier.length > 0 && (
        <ol id="essays-earlier" className="home-rows" hidden={!open}>
          {earlier.map((essay, i) => (
            <li key={i}>
              <EssayLink essay={essay} className="home-row">
                <span className="home-row-title">
                  {essay.title}
                  {essay.isExternal && <ExternalLinkIcon />}
                </span>
                {essay.description && (
                  <span className="home-row-text">{clip(essay.description, 140)}</span>
                )}
                <span className="home-meta">{formatDate(essay.published)}</span>
              </EssayLink>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export const ToolsSection = ({ config }: { config: HomeConfig["tools"] }) => (
  <section id="tools" aria-labelledby="tools-title" className="home-section">
    <SectionHead id="tools" title={config.title} />
    <ul
      className={"home-grid home-grid--tools" + gridColumns(config.columns).className}
      style={gridColumns(config.columns).style}
    >
      {config.items.map((tool, i) => (
        <li key={i}>
          <a className="home-tile home-tile--media" href={tool.url} target="_blank" rel="noopener noreferrer">
            <img className="home-tile-image" src={tool.image} alt="" loading="lazy" />
            <span className="home-tile-body">
              <span className="home-tile-title">
                {tool.title} <ExternalLinkIcon />
              </span>
              <span className="home-tile-text">{clip(tool.description, 200)}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  </section>
);

export const ArchivesSection = ({
  areas,
  config,
}: {
  areas: ResearchArea[];
  config: HomeConfig["archives"];
}) => (
  <section id="archives" aria-labelledby="archives-title" className="home-section">
    <SectionHead id="archives" title={config.title}>
      <a className="home-head-link" href={config.profileUrl} target="_blank" rel="noopener noreferrer">
        {config.profileLinkLabel} <ExternalLinkIcon />
      </a>
    </SectionHead>
    <p className="home-intro">{config.intro}</p>

    <ul
      className={"home-grid home-grid--areas" + gridColumns(config.columns).className}
      style={gridColumns(config.columns).style}
    >
      {areas.map((area, i) => (
        <AreaCard key={i} id={`area-${i}`} area={area} config={config} />
      ))}
    </ul>
  </section>
);

/**
 * One research area. "Show more" opens it in place: it takes the whole row,
 * shows more of its blocks and, when one has been generated, a short AI
 * summary of the area alongside.
 */
const AreaCard = ({
  id,
  area,
  config,
}: {
  id: string;
  area: ResearchArea;
  config: HomeConfig["archives"];
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLLIElement>(null);
  const toggled = React.useRef(false);
  const shown = open ? config.expandedBlocks : config.previewBlocks;
  const hasMore = area.blocks.length > config.previewBlocks || !!area.summary;
  const bodyId = `${id}-body`;

  // Opening or closing can move the card to another row; keep it in view.
  React.useEffect(() => {
    if (!toggled.current) return;
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  return (
    <li ref={ref} className={`home-area${open ? " home-area--open" : ""}`}>
      <div className="home-area-head">
        <h3 className="home-tile-title">{area.name}</h3>
        {area.subtitle && <span className="home-tile-text">{area.subtitle}</span>}
        {/* One channel: "See all (N)". Several: one link per channel. */}
        {area.channels.length === 1 && (
          <a
            className="home-meta home-area-channel"
            href={area.channels[0].url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fillCount(config.channelLinkLabel, area.channels[0].blockCount)} <ExternalLinkIcon />
          </a>
        )}
        {area.channels.length > 1 && (
          <ul className="home-area-channels">
            {area.channels.map((ch) => (
              <li key={ch.url}>
                <a
                  className="home-meta home-area-channel"
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ch.title}{" "}
                  {/* The count and arrow stay with the end of the name. */}
                  <span className="nowrap">
                    ({ch.blockCount}) <ExternalLinkIcon />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="home-area-body" id={bodyId}>
        {open && area.summary && (
          <aside className="home-area-summary" aria-label={`${config.summaryLabel}: ${area.name}`}>
            <span className="home-area-summary-label">{config.summaryLabel}</span>
            <p>{area.summary.summary}</p>
            {area.summary.themes.length > 0 && (
              <ul className="home-area-themes">
                {area.summary.themes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <span className="home-area-summary-note">
              {fillCount(config.summaryNote, area.summary.blocksRead)} · {area.summary.generatedAt}
            </span>
          </aside>
        )}

        {area.blocks.length > 0 && (
          <ul className="home-blocks">
            {area.blocks.slice(0, shown).map((block, j) => (
              <li key={block.id}>
                {/* The newest block leads, larger; each image carries its
                    title in a caption strip, so you know what it opens. */}
                <a
                  className={`home-block${j === 0 ? " home-block--lead" : ""}`}
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {block.image ? (
                    <>
                      <img src={block.image} alt="" loading="lazy" />
                      <span className="home-block-caption">{block.title}</span>
                    </>
                  ) : (
                    <span>{clip(block.title, 60)}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hasMore && (
        <button
          type="button"
          className="home-more home-more--small"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => {
            toggled.current = true;
            setOpen(!open);
          }}
        >
          {open ? `${config.showFewerLabel} ↑` : `${config.showMoreLabel} ↓`}
        </button>
      )}

      {area.links.length > 0 && (
        <ul className="home-area-links">
          {area.links.map((link, j) => (
            <li key={j}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
