import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLElement>;
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/**
 * The page ground and its one fixed SURU/LERE pattern. Wrap the whole page
 * (or put `su-page` on <body>). Sections inside choose to reveal or cover it.
 */
export function Page({ className, ...rest }: DivProps) {
  return <div {...rest} className={cx("su-page", className)} />;
}

/** Reveals the pattern: header, hero, footer window. */
export function Window({
  variant,
  className,
  as: Tag = "section",
  ...rest
}: DivProps & { variant?: "hero" | "footer"; as?: "section" | "div" | "header" }) {
  return <Tag {...rest} className={cx("su-window", variant && `su-window--${variant}`, className)} />;
}

/** Covers the pattern with solid ground: every content section. */
export function Cover({ className, as: Tag = "section", ...rest }: DivProps & { as?: "section" | "div" | "main" }) {
  return <Tag {...rest} className={cx("su-cover", className)} />;
}

export function Container({ className, ...rest }: DivProps) {
  return <div {...rest} className={cx("su-container", className)} />;
}

/** Solid panel for text that sits inside a Window. */
export function Panel({ className, ...rest }: DivProps) {
  return <div {...rest} className={cx("su-panel", className)} />;
}

export function Label({ className, as: Tag = "span", ...rest }: DivProps & { as?: "span" | "h2" | "h3" }) {
  return <Tag {...rest} className={cx("su-label", className)} />;
}

/** Footer window (pattern) followed by the solid footer row. */
export function Footer({ children, className, ...rest }: DivProps) {
  return (
    <>
      <div className="su-window su-window--footer" aria-hidden="true" />
      <footer {...rest} className={cx("su-footer", className)}>
        <div className="su-container">{children}</div>
      </footer>
    </>
  );
}
