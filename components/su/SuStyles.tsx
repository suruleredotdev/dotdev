import * as React from "react";

/** Major version of the shared CSS this copy of the wrappers was written for. */
export const SU_UI_VERSION = "v1";

/**
 * URL of a shared file. Other sites use the default (absolute, surulere.dev).
 * dotdev passes its own base path so PR previews serve their own copy:
 * `suUiHref("su-tokens.css", process.env.NEXT_PUBLIC_BASE_PATH || "")`.
 */
export function suUiHref(file: string, base = "https://surulere.dev"): string {
  return `${base}/ui/${SU_UI_VERSION}/${file}`;
}

/**
 * The two stylesheets. Render inside <head>: in Next, inside _document's
 * <Head> (next/document). Not inside a page's next/head <Head>, which only
 * keeps its direct children on the client; write the two links there.
 */
export function SuStyles({ base }: { base?: string }) {
  return (
    <>
      <link rel="stylesheet" href={suUiHref("su-tokens.css", base)} />
      <link rel="stylesheet" href={suUiHref("su-components.css", base)} />
    </>
  );
}
