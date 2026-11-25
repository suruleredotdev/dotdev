import Arena from "are.na";

import { HomeArea, HomeConfig, HomeLink } from "./home-config";
import { log } from "./log";

export interface AreaBlock {
  id: number;
  title: string;
  /** Square-ish thumbnail; null for text blocks. */
  image: string | null;
  url: string;
}

export interface ResearchArea {
  name: string;
  subtitle: string | null;
  links: HomeLink[];
  /** The Are.na channel, or null when it wasn't found at build time. */
  channel: {
    url: string;
    blockCount: number;
    /** Most recent first, up to archives.expandedBlocks. */
    blocks: AreaBlock[];
  } | null;
}

/**
 * Joins each configured research area to its Are.na channel, keeping only
 * what the page shows, so the full channel contents never reach the client.
 * An area whose channel can't be found (no token, or a renamed channel) still
 * renders, with its links and no previews.
 */
export function buildResearchAreas(
  channels: Arena.Channel[],
  archives: HomeConfig["archives"]
): ResearchArea[] {
  return archives.areas.map((area) => {
    const channel = findChannel(channels, area);
    if (!channel && channels.length) {
      log("ERROR", "research area has no matching Are.na channel", {
        area: area.name,
        channel: area.channel,
        available: channels.map((c) => c.slug),
      });
    }
    return {
      name: area.name,
      subtitle: area.subtitle ?? null,
      links: area.links,
      channel: channel
        ? {
            url: `https://www.are.na/${channel.user?.slug}/${channel.slug}`,
            blockCount: channel.length ?? channel.contents?.length ?? 0,
            blocks: recentBlocks(channel, archives.expandedBlocks),
          }
        : null,
    };
  });
}

function findChannel(channels: Arena.Channel[], area: HomeArea) {
  const want = area.channel.trim().toLowerCase();
  return channels.find(
    (c) => c?.slug?.toLowerCase() === want || c?.title?.trim().toLowerCase() === want
  );
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
    }));
}

function time(value: unknown): number {
  const t = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isNaN(t) ? 0 : t;
}
