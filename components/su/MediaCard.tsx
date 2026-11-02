import * as React from "react";

export type MediaCardProps = {
  title: React.ReactNode;
  /** One short line under the title: kind · area · date, museum · culture … */
  meta?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  /** Replace the <img> (e.g. ImageWithPlaceholder in the Artifacts Index). */
  media?: React.ReactNode;
  /** Renders a link when set; a button when only onClick is given. */
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  /** "contain" never crops: use it for museum objects. */
  fit?: "cover" | "contain";
  ratio?: "portrait" | "square" | "wide";
  className?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick">;

/** Image first, then a borderless title + meta bar. Put several in <MediaCards>. */
export function MediaCard({
  title,
  meta,
  image,
  imageAlt = "",
  media,
  href,
  onClick,
  fit = "cover",
  ratio = "portrait",
  className,
  ...rest
}: MediaCardProps) {
  const classes = [
    "su-card",
    fit === "contain" && "su-card--contain",
    ratio === "square" && "su-card--square",
    ratio === "wide" && "su-card--wide",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <span className="su-card__media">
        {media ?? (image ? <img src={image} alt={imageAlt} loading="lazy" decoding="async" /> : null)}
      </span>
      <span className="su-card__bar">
        <span className="su-card__title">{title}</span>
        {meta ? <span className="su-card__meta">{meta}</span> : null}
      </span>
    </>
  );

  if (href) {
    return (
      <a {...rest} className={classes} href={href} onClick={onClick}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button {...rest} type="button" className={classes} onClick={onClick}>
        {body}
      </button>
    );
  }
  return (
    <div {...rest} className={classes}>
      {body}
    </div>
  );
}

/** The flush grid. Children are MediaCards; each is wrapped in an <li>. */
export function MediaCards({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul {...rest} className={["su-cards", className].filter(Boolean).join(" ")}>
      {React.Children.map(children, (child) => (child == null ? null : <li>{child}</li>))}
    </ul>
  );
}
