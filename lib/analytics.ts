/**
 * Product analytics for surulere.dev, sent as GA4 events.
 *
 * Mirrors the Artifacts Index (african-artifacts/docs/analytics.md) so the two
 * sites read the same in GA:
 *
 * - The measurement ID comes from NEXT_PUBLIC_GA_ID. Unset, no GA script is
 *   ever loaded and events only go to the console.
 * - Only the production host sends. Everywhere else (localhost, Netlify and
 *   GitHub Pages previews) events are printed as `[analytics] <event> {…}`, so
 *   testing never lands in the numbers. Add `?analytics_debug` to a URL to
 *   send them anyway, flagged `debug_mode`, to GA's DebugView.
 * - Every event carries `site: "surulere.dev"`.
 *
 * Elements are marked up rather than wired by hand: `data-track="<event>"`
 * plus one `data-track-<param>` attribute per parameter, read by a single
 * delegated click listener. The catalogue is in readme.md → Analytics.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const SITE = "surulere.dev";
const PRODUCTION_HOSTS = ["surulere.dev", "www.surulere.dev"];
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
// GA4 truncates string parameters at 100 characters; trimming here keeps the
// console log honest about what is stored.
const MAX_PARAM_LENGTH = 100;

type Toggle = "open" | "closed";

/** Every event the site sends, and its parameters. */
export type AnalyticsEvents = {
  /** The jump links under the intro. */
  nav_click: { target: string };
  essay_open: { source: "substack" | "site"; area?: string; title: string };
  /** `to` is the state the click puts the list in. */
  essays_show_all: { to: Toggle };
  tool_open: { tool: string };
  /** "See all (N)" and the per-channel links on an Archives card. */
  channel_open: { area: string; channel: string };
  /** An Are.na block thumbnail on an Archives card. */
  block_open: { area: string };
  area_show_more: { area: string; to: Toggle };
  subscribe_click: { placement: string };
  theme_toggle: { to: "dark" | "light" };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

/**
 * The same names at runtime, so the delegated listener can catch a typo in a
 * `data-track` attribute. Typed as a Record so it can't drift from the map.
 */
const EVENT_NAMES: Record<AnalyticsEventName, true> = {
  nav_click: true,
  essay_open: true,
  essays_show_all: true,
  tool_open: true,
  channel_open: true,
  block_open: true,
  area_show_more: true,
  subscribe_click: true,
  theme_toggle: true,
};

type ParamValue = string | number | boolean;

let sendMode: "send" | "debug" | "log" | undefined;

const getSendMode = () => {
  if (sendMode === undefined) {
    sendMode = PRODUCTION_HOSTS.includes(window.location.hostname)
      ? "send"
      : new URLSearchParams(window.location.search).has("analytics_debug")
      ? "debug"
      : "log";
  }
  return sendMode;
};

const send = (name: string, params: Record<string, ParamValue | undefined>) => {
  const cleaned: Record<string, ParamValue> = { site: SITE };
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    cleaned[key] =
      typeof value === "string" ? value.slice(0, MAX_PARAM_LENGTH) : value;
  }

  const mode = getSendMode();
  if (mode !== "send") console.debug("[analytics]", name, cleaned);
  if (mode === "log" || !GA_ID) return;

  // Analytics must never be the thing that breaks the page.
  try {
    window.gtag?.(
      "event",
      name,
      mode === "debug" ? { ...cleaned, debug_mode: true } : cleaned
    );
  } catch {}
};

export function trackEvent<K extends AnalyticsEventName>(
  name: K,
  params: AnalyticsEvents[K]
) {
  send(name, params as Record<string, ParamValue | undefined>);
}

/**
 * Spreads onto an element to mark it for the delegated listener:
 * `<a {...track("tool_open", { tool: "atlas" })}>` renders
 * `data-track="tool_open" data-track-tool="atlas"`.
 */
export function track<K extends AnalyticsEventName>(
  name: K,
  params: AnalyticsEvents[K]
): Record<string, string> {
  const attrs: Record<string, string> = { "data-track": name };
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    attrs[`data-track-${key.replace(/_/g, "-")}`] = String(value);
  }
  return attrs;
}

/** `data-track-foo-bar` arrives in dataset as `trackFooBar`; send it as `foo_bar`. */
const paramsFromDataset = (el: HTMLElement) => {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (!key.startsWith("track") || key === "track" || value === undefined) {
      continue;
    }
    const name = key
      .slice("track".length)
      .replace(/^[A-Z]/, (c) => c.toLowerCase())
      .replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    params[name] = value;
  }
  return params;
};

const onClick = (event: MouseEvent) => {
  const target = event.target as Element | null;
  const el = target?.closest?.("[data-track]") as HTMLElement | null;
  if (!el) return;
  const name = el.dataset.track as string;
  if (!(name in EVENT_NAMES)) {
    console.warn("[analytics] unknown data-track event", name);
    return;
  }
  send(name, paramsFromDataset(el));
};

const loadGtag = (id: string, debug: boolean) => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js reads the `arguments` object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // `site` here rides on the automatic page_view too.
  window.gtag("config", id, debug ? { site: SITE, debug_mode: true } : { site: SITE });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
};

let initialized = false;

/** Call once on the client, from _app. Safe to call again. */
export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const mode = getSendMode();
  if (GA_ID && mode !== "log") {
    loadGtag(GA_ID, mode === "debug");
  } else if (mode === "debug") {
    console.debug("[analytics] NEXT_PUBLIC_GA_ID is unset; logging only");
  }

  // Capture phase, so the listener reads an element's attributes before
  // React re-renders it: a toggle's data-track-to is still the pre-click
  // value, i.e. the state the click is moving to.
  document.addEventListener("click", onClick, true);
}
