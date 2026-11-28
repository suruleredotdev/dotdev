import Arena from "are.na";
import fetch from "node-fetch";

import { HomeArea, HomeConfig, HomeLink } from "./home-config";
import { log } from "./log";
import { ArchiveSummary, getArchiveSummaries } from "./archive-summaries";

export interface AreaBlock {
  id: number;
  title: string;
  /** Square-ish thumbnail; null for text blocks. */
  image: string | null;
  url: string;
  /** ISO time it was added to the channel; orders blocks across channels. */
  connectedAt: string | null;
}

export interface AreaChannel {
  title: string;
  url: string;
  blockCount: number;
}

export interface ResearchArea {
  name: string;
  subtitle: string | null;
  links: HomeLink[];
  /** The channels found at build time; empty when none were. */
  channels: AreaChannel[];
  /** Newest across all its channels, up to archives.expandedBlocks. */
  blocks: AreaBlock[];
  /** From data/archive-summaries.json; shown when the area is expanded. */
  summary: ArchiveSummary | null;
}

/**
 * Joins each configured research area to its Are.na channels, keeping only
 * what the page shows, so the full channel contents never reach the client.
 *
 * Each channel is a URL, a slug or a title. A URL or slug that isn't among
 * the account's fetched channels (the account list is one page long) is
 * fetched by itself from the public API. A channel that still can't be found
 * is skipped and logged; the area renders with whatever was found.
 */
export async function buildResearchAreas(
  channels: Arena.Channel[],
  archives: HomeConfig["archives"]
): Promise<ResearchArea[]> {
  const summaries = getArchiveSummaries();
  return Promise.all(
    archives.areas.map(async (area) => {
      const found = await Promise.all(
        area.channels.map(async (value) => {
          const ref = parseChannelRef(value);
          const channel =
            findChannel(channels, ref) ||
            (ref.slug ? await fetchChannel(ref.slug, archives.expandedBlocks) : null);
          if (!channel) {
            log("ERROR", "research area channel not found on Are.na", {
              area: area.name,
              channel: value,
              available: channels.map((c) => c.slug),
            });
          }
          return channel ? { ref, channel } : null;
        })
      );
      const hits = found.filter(Boolean) as { ref: ChannelRef; channel: Arena.Channel }[];
      const seen = new Set<number>();
      const blocks = hits
        .flatMap(({ channel }) => recentBlocks(channel, archives.expandedBlocks))
        .sort((a, b) => time(b.connectedAt) - time(a.connectedAt))
        .filter((b) => !seen.has(b.id) && seen.add(b.id))
        .slice(0, archives.expandedBlocks);
      return {
        name: area.name,
        subtitle: area.subtitle ?? null,
        links: area.links,
        channels: hits.map(({ ref, channel }) => ({
          title: channel.title,
          // A URL in the config is used as written.
          url: ref.url || `https://www.are.na/${channel.user?.slug}/${channel.slug}`,
          blockCount: channel.length ?? channel.contents?.length ?? 0,
        })),
        blocks,
        summary: summaries[area.name] ?? null,
      };
    })
  );
}

type ChannelRef = { url: string | null; slug: string | null; name: string };

/** "https://www.are.na/<owner>/<slug>", "<slug>" (has a dash) or a title. */
export function parseChannelRef(value: string): ChannelRef {
  const v = value.trim();
  const m = v.match(/^https?:\/\/(?:www\.)?are\.na\/[^/]+\/([^/?#]+)/i);
  if (m) return { url: v, slug: m[1].toLowerCase(), name: m[1].toLowerCase() };
  return { url: null, slug: v.includes("-") ? v.toLowerCase() : null, name: v.toLowerCase() };
}

function findChannel(channels: Arena.Channel[], ref: ChannelRef) {
  return channels.find(
    (c) =>
      c?.slug?.toLowerCase() === ref.name ||
      (ref.slug && c?.slug?.toLowerCase() === ref.slug) ||
      c?.title?.trim().toLowerCase() === ref.name
  );
}

const ARENA_API = "https://api.are.na/v2";

/**
 * One channel straight from the public API: its length, then the last page
 * of its contents (blocks are listed oldest first, so that page is newest).
 */
export async function fetchChannel(slug: string, newest: number): Promise<Arena.Channel | null> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = process.env.ARENA_PERSONAL_ACCESS_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const metaRes = await fetch(`${ARENA_API}/channels/${encodeURIComponent(slug)}?per=1`, { headers });
    if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status}`);
    const meta: any = await metaRes.json();
    const per = Math.max(newest, 50);
    const lastPage = Math.max(1, Math.ceil((meta.length || 0) / per));
    const getPage = async (n: number) => {
      const res = await fetch(
        `${ARENA_API}/channels/${encodeURIComponent(slug)}/contents?per=${per}&page=${n}`,
        { headers }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return ((await res.json()) as any).contents || [];
    };
    let contents = await getPage(lastPage);
    // The last page can be short (754 blocks at 50 a page leaves 4).
    if (contents.length < newest && lastPage > 1) {
      contents = [...(await getPage(lastPage - 1)), ...contents];
    }
    return { ...meta, contents } as Arena.Channel;
  } catch (e) {
    log("ERROR", "could not fetch Are.na channel", { slug, error: String(e) });
    return null;
  }
}

function recentBlocks(channel: Arena.Channel, limit: number): AreaBlock[] {
  return (channel.contents ?? [])
    .filter((b: any) => b?.base_class === "Block")
    .sort((a: any, b: any) => time(b.connected_at) - time(a.connected_at))
    .slice(0, limit)
    .map((b: any) => ({
      id: b.id,
      title: b.title || b.generated_title || b.source?.url || "Untitled",
      image: b.image?.square?.url || b.image?.thumb?.url || b.image?.display?.url || null,
      url: `https://www.are.na/block/${b.id}`,
      connectedAt: b.connected_at || null,
    }));
}

function time(value: unknown): number {
  const t = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isNaN(t) ? 0 : t;
}
