/*
  Build-time content snapshot.

  Notion's private api/v3 and Substack's public API both sit behind Cloudflare,
  which blocks GitHub Actions runners. So the raw upstream data is fetched from
  a developer machine (`npm run fetch-content`), committed under data/, and
  parsed at build time here instead of over the network.

  Server-only: this module touches the filesystem and must never be reachable
  from a client bundle.
*/
import fs from "node:fs";
import path from "node:path";

import { log } from "./log";

export const snapshotDir = path.join(process.cwd(), "data");

export const notionSnapshotFile = "notion.json";
export const substackSnapshotFile = "substack.json";

export interface NotionSnapshot {
  fetchedAt: string;
  rootNotionPageId: string;
  rootNotionSpaceId: string | null;
  /** pageId (dashed uuid) -> raw ExtendedRecordMap as returned by notion-client */
  pages: Record<string, any>;
}

export interface SubstackSnapshot {
  fetchedAt: string;
  handle: string;
  /** raw post objects exactly as returned by substack's /api/v1/posts */
  posts: any[];
}

/**
 * - "auto" (default): use the snapshot when present, otherwise fetch live.
 * - "snapshot": use the snapshot only, and fail the build if it is missing.
 *   CI sets this so a missing snapshot is loud instead of silently shipping an
 *   empty site.
 * - "live": ignore the snapshot entirely.
 */
export type ContentSource = "auto" | "snapshot" | "live";

export const contentSource: ContentSource =
  (process.env.CONTENT_SOURCE as ContentSource) || "auto";

const cache = new Map<string, unknown>();

function snapshotPath(fileName: string): string {
  return path.join(snapshotDir, fileName);
}

/**
 * Reads a snapshot file, or returns null when it is unavailable and the current
 * content source allows falling back to a live fetch.
 */
export function readSnapshot<T>(fileName: string): T | null {
  if (contentSource === "live") return null;

  if (cache.has(fileName)) return cache.get(fileName) as T;

  const filePath = snapshotPath(fileName);

  if (!fs.existsSync(filePath)) {
    if (contentSource === "snapshot") {
      throw new Error(
        `Missing content snapshot "${filePath}". Run \`npm run fetch-content\` ` +
          `locally and commit data/, or build with CONTENT_SOURCE=live.`
      );
    }

    log("DEBUG", `[snapshot] ${fileName} not found, falling back to live fetch`);
    cache.set(fileName, null);
    return null;
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  cache.set(fileName, parsed);

  log("DEBUG", `[snapshot] loaded ${fileName}`);
  return parsed;
}

export function readNotionSnapshot(): NotionSnapshot | null {
  return readSnapshot<NotionSnapshot>(notionSnapshotFile);
}

export function readSubstackSnapshot(): SubstackSnapshot | null {
  return readSnapshot<SubstackSnapshot>(substackSnapshotFile);
}

export function writeSnapshot(fileName: string, data: unknown): string {
  fs.mkdirSync(snapshotDir, { recursive: true });

  const filePath = snapshotPath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  cache.delete(fileName);

  return filePath;
}
