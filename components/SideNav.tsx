import * as React from "react";

/**
 * A floating side panel for finding your way around a page: where you are on
 * the site (Essays · Tools · Archives) and, on an essay, its headings.
 *
 * Wide screens: a fixed column in the page margin, in the spirit of the side
 * notes on v1.surulere.dev (left-hand here: it's the margin with room at
 * every desktop width). As you scroll, the section you're reading is marked.
 * Narrow screens: a "Contents" button in the bottom-right corner opens the
 * same list as a small panel.
 *
 * Links that point at the current page (`#id`) take part in the scroll
 * marking; links elsewhere (`/#essays` from an essay) are plain links.
 */

export type SideNavItem = {
  label: React.ReactNode;
  href: string;
  /** 0 = top level, 1 = nested under the item above, 2 = further nested. */
  level?: number;
};

export type SideNavGroup = {
  title: string;
  items: SideNavItem[];
};

export const SideNav = ({
  groups,
  label = "Contents",
}: {
  groups: SideNavGroup[];
  /** Name of the navigation, and of the phone button. */
  label?: string;
}) => {
  const visible = groups.filter((g) => g.items.length > 0);
  const current = useCurrentSection(visible);
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Escape closes the phone panel and returns focus to its button.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (visible.length === 0) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="side-nav-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {open ? "Close" : label}
      </button>
      <nav
        id={panelId}
        aria-label={label}
        className={`side-nav${open ? " side-nav--open" : ""}`}
      >
        {visible.map((group) => (
          <div key={group.title} className="side-nav-group">
            <span className="side-nav-title">{group.title}</span>
            <ul>
              {group.items.map((item) => (
                <li key={item.href} className={`side-nav-level-${item.level ?? 0}`}>
                  <a
                    href={item.href}
                    aria-current={current === item.href ? "location" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
};

/**
 * The `#id` link whose target was most recently scrolled past the upper
 * third of the screen. Recomputed on scroll and resize, at most once a frame.
 */
function useCurrentSection(groups: SideNavGroup[]): string | null {
  const hrefs = groups
    .flatMap((g) => g.items.map((i) => i.href))
    .filter((h) => h.startsWith("#"));
  const key = hrefs.join(" ");
  const [current, setCurrent] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!hrefs.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let found: string | null = null;
      let foundTop = -Infinity;
      for (const href of hrefs) {
        const el = document.getElementById(decodeURIComponent(href.slice(1)));
        const top = el ? el.getBoundingClientRect().top : Infinity;
        // Items side by side (two archive areas in a row) share a top; the
        // first of them wins.
        if (top <= line && top > foundTop + 1) {
          found = href;
          foundTop = top;
        }
      }
      setCurrent(found);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // `key` stands in for the list of links.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return current;
}
