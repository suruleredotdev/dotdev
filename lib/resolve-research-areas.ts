/*
  Build-time: reduce the Are.na channels fetched by resolveArenaChannels() to
  what the homepage's research areas show, so the page doesn't ship every
  channel's full contents. Server-only.
*/
import { areas, AreaKey } from "./home-content";

export type AreaBlock = {
  id: number;
  title: string;
  image: string | null;
  url: string;
  connectedAt: string | null;
};

export type AreaChannel = {
  url: string;
  length: number | null;
  /** Most recently connected first. */
  recent: AreaBlock[];
};

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

export function resolveResearchAreas(channels: any[]): Record<AreaKey, AreaChannel | null> {
  const out = {} as Record<AreaKey, AreaChannel | null>;
  for (const area of areas) {
    // A channel owned by the account, with the area's title.
    const channel = (channels || []).find((c) => norm(c?.title) === norm(area.channelTitle));
    if (!channel) {
      out[area.key] = null;
      continue;
    }
    const owner = channel.user?.slug || channel.owner_slug || "korede-aderele";
    const recent: AreaBlock[] = (channel.contents || [])
      .filter((b: any) => b && b.base_class === "Block")
      .sort((a: any, b: any) => String(b.connected_at || "").localeCompare(String(a.connected_at || "")))
      .slice(0, 4)
      .map((b: any) => ({
        id: b.id,
        title: b.title || b.generated_title || "Untitled block",
        image: b.image?.square?.url || b.image?.thumb?.url || null,
        url: `https://www.are.na/block/${b.id}`,
        connectedAt: b.connected_at || null,
      }));
    out[area.key] = {
      url: `https://www.are.na/${owner}/${channel.slug}`,
      length: typeof channel.length === "number" ? channel.length : null,
      recent,
    };
  }
  return out;
}
