import { NotionAPI } from "notion-client";

/**
 * Notion's private api/v3 sits behind Cloudflare, which answers requests that
 * don't look like they came from a browser with a 403 HTML challenge page.
 * Sending browser-ish headers is enough to get through.
 */
export const notionBrowserHeaders: Record<string, string> = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "*/*",
  origin: "https://www.notion.so",
  referer: "https://www.notion.so/",
};

const maxRetries = 3;

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL,
  // notion-client sends this as the browser's `token_v2` cookie. It is NOT the
  // `ntn_`/`secret_` token issued to an official Notion integration — passing
  // one of those makes every request fail. Only needed for non-public pages.
  authToken: process.env.NOTION_TOKEN_V2,
  ofetchOptions: {
    headers: notionBrowserHeaders,
    retry: maxRetries,
    retryDelay: (context: any) => {
      // ofetch counts `retry` down, so remaining tells us which attempt we're on
      const remaining =
        typeof context?.options?.retry === "number"
          ? context.options.retry
          : maxRetries;
      const attempt = maxRetries - remaining; // 0-based
      return Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
    },
  },
});
