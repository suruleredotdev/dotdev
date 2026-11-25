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

/** "Essays 7 · Tools 4 · Archives 4" jump links under the intro. */
export const SectionLinks = ({
  links,
}: {
  links: { id: string; label: string; count: number }[];
}) => (
  <nav aria-label="On this page" className="home-jump">
    {links.map((l) => (
      <a key={l.id} href={`#${l.id}`}>
        {l.label} <span className="o-60">{l.count}</span> ↓
      </a>
    ))}
  </nav>
);

/** Section title row; sticks to the top while its section is on screen. */
const SectionHead = ({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count?: string | number;
  children?: React.ReactNode;
}) => (
  <div className="home-head">
    <h2 id={`${id}-title`} className="home-head-title title">
      {title}
      {count !== undefined && <span className="o-60"> {count}</span>}
    </h2>
    <span className="home-head-fill" />
    {children}
  </div>
);

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
      <SectionHead id="essays" title={config.title} count={essays.length}>
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
    <SectionHead id="tools" title={config.title} count={config.items.length} />
    <ul className="home-grid home-grid--tools">
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
}) => {
  const [open, setOpen] = React.useState(false);
  const shown = open ? config.expandedBlocks : config.previewBlocks;
  const hasMore = areas.some(
    (a) => (a.channel?.blocks.length ?? 0) > config.previewBlocks
  );

  return (
    <section id="archives" aria-labelledby="archives-title" className="home-section">
      <SectionHead id="archives" title={config.title} count={areas.length}>
        <a className="home-head-link" href={config.profileUrl} target="_blank" rel="noopener noreferrer">
          {config.profileLinkLabel} <ExternalLinkIcon />
        </a>
        {hasMore && (
          <ToggleButton
            open={open}
            onToggle={() => setOpen(!open)}
            closedLabel={config.showMoreLabel}
            openLabel={config.showFewerLabel}
            controls="archives-areas"
          />
        )}
      </SectionHead>
      <p className="home-intro">{config.intro}</p>

      <ul id="archives-areas" className="home-grid home-grid--areas">
        {areas.map((area, i) => (
          <li key={i} className="home-area">
            <div className="home-area-head">
              <a
                className="home-tile-title"
                href={area.channel?.url ?? config.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {area.name} <ExternalLinkIcon />
              </a>
              {area.channel && (
                <span className="home-meta">{area.channel.blockCount} blocks</span>
              )}
            </div>
            {area.subtitle && <span className="home-tile-text">{area.subtitle}</span>}

            {area.channel && area.channel.blocks.length > 0 && (
              <ul className="home-blocks">
                {area.channel.blocks.slice(0, shown).map((block) => (
                  <li key={block.id}>
                    <a
                      className="home-block"
                      href={block.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={block.title}
                    >
                      {block.image ? (
                        <img src={block.image} alt={block.title} loading="lazy" />
                      ) : (
                        <span>{clip(block.title, 60)}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
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
        ))}
      </ul>
    </section>
  );
};
