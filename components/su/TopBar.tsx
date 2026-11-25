import * as React from "react";

export type TopBarItem = {
  label: React.ReactNode;
  /** Renders a link when set, a button otherwise. */
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  /** The current page or view: ink text plus the small accent marker. */
  current?: boolean;
  /** For toggles (e.g. a sidebar): announced as pressed, styled as current. */
  pressed?: boolean;
  ariaLabel?: string;
  /** Analytics name for the shared delegated listener (`data-track`). */
  track?: string;
};

export type TopBarProps = {
  /** Tool name after the slash. Omit on surulere.dev itself. */
  site?: React.ReactNode;
  items?: TopBarItem[];
  navLabel?: string;
  homeHref?: string;
};

/** [logo] / Tool name ······ [cell|cell|cell] */
export function TopBar({
  site,
  items = [],
  navLabel = "Site",
  homeHref = "https://surulere.dev",
}: TopBarProps) {
  return (
    <header className="su-topbar">
      <a className="su-topbar__logo" href={homeHref} aria-label="surulere.dev home">
        <span className="su-logo" />
      </a>
      {site ? (
        <span className="su-topbar__site">
          <span>{site}</span>
        </span>
      ) : null}
      {items.length ? (
        <nav className="su-seg" aria-label={navLabel}>
          {items.map((item, i) => {
            const common = {
              className: "su-seg__cell",
              onClick: item.onClick,
              "aria-label": item.ariaLabel,
              "data-track": item.track ? "nav_click" : undefined,
              "data-track-target": item.track,
            };
            return item.href ? (
              <a key={i} {...common} href={item.href} aria-current={item.current ? "page" : undefined}>
                {item.label}
              </a>
            ) : (
              <button
                key={i}
                {...common}
                type="button"
                aria-pressed={item.pressed ?? (item.current ? true : undefined)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
