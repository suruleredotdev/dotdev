/*
  Downloads the raw upstream content this site is built from and writes it to
  data/ so the build can parse it without touching the network.

  Both Notion's private api/v3 and Substack's public API sit behind Cloudflare,
  which blocks GitHub Actions runners. Run this from a developer machine and
  commit the result:

    npm run fetch-content              # both sources
    npm run fetch-content -- --only=notion
    npm run fetch-content -- --only=substack
*/
import { statSync } from "node:fs";
import { loadEnvConfig } from "@next/env";

// Everything below is imported lazily so that .env is loaded before any module
// that reads process.env at import time (lib/notion-api, lib/config).
type Lib = {
  snapshot: typeof import("../lib/content-snapshot");
  substack: typeof import("../lib/get-substack-essays");
  config: typeof import("../lib/config");
  siteMap: typeof import("../lib/get-site-map");
};

function megabytes(filePath: string): string {
  return (statSync(filePath).size / 1e6).toFixed(2);
}

async function fetchNotion({ snapshot, config, siteMap }: Lib) {
  console.log(`[notion] crawling from root page ${config.rootNotionPageId}…`);

  const started = Date.now();
  const pages = await siteMap.crawlNotionSpace(
    config.rootNotionPageId,
    config.rootNotionSpaceId
  );

  const loaded = Object.entries(pages).filter(([, recordMap]) => !!recordMap);
  const failed = Object.keys(pages).length - loaded.length;

  if (!loaded.length) {
    throw new Error(
      "[notion] crawl returned no pages — refusing to overwrite the snapshot"
    );
  }

  const filePath = snapshot.writeSnapshot(snapshot.notionSnapshotFile, {
    fetchedAt: new Date().toISOString(),
    rootNotionPageId: config.rootNotionPageId,
    rootNotionSpaceId: config.rootNotionSpaceId,
    pages: Object.fromEntries(loaded),
  } as import("../lib/content-snapshot").NotionSnapshot);

  console.log(
    `[notion] wrote ${loaded.length} pages (${failed} failed) to ${filePath} — ` +
      `${megabytes(filePath)} MB in ${((Date.now() - started) / 1000).toFixed(1)}s`
  );
}

async function fetchSubstack({ snapshot, substack }: Lib) {
  const handle = process.env.SUBSTACK_HANDLE || "suruleredotdev";
  const limit = Number(process.env.SUBSTACK_LIMIT || 50);
  const apiKey = process.env.SUBSTACK_API_KEY;

  console.log(`[substack] fetching up to ${limit} posts from ${handle}…`);

  const posts = await substack.fetchSubstackPosts(handle, limit, apiKey);

  if (!posts.length) {
    throw new Error(
      "[substack] fetch returned no posts — refusing to overwrite the snapshot"
    );
  }

  const filePath = snapshot.writeSnapshot(snapshot.substackSnapshotFile, {
    fetchedAt: new Date().toISOString(),
    handle,
    posts,
  } as import("../lib/content-snapshot").SubstackSnapshot);

  console.log(
    `[substack] wrote ${posts.length} posts to ${filePath} — ${megabytes(filePath)} MB`
  );
}

async function main() {
  loadEnvConfig(process.cwd());

  const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
  const only = onlyArg?.split("=")[1];

  if (only && !["notion", "substack"].includes(only)) {
    throw new Error(`Unknown --only value "${only}" (expected notion|substack)`);
  }

  const lib: Lib = {
    snapshot: await import("../lib/content-snapshot"),
    substack: await import("../lib/get-substack-essays"),
    config: await import("../lib/config"),
    siteMap: await import("../lib/get-site-map"),
  };

  if (only !== "substack") await fetchNotion(lib);
  if (only !== "notion") await fetchSubstack(lib);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
