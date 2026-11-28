/*
  Writes a short AI summary of each research area in config/home.json to
  data/archive-summaries.json, for the homepage's expanded archive cards.

  It reads each area's Are.na channels (the newest blocks: titles,
  descriptions, sources) and asks Claude what the collection is about. Run it
  from a developer machine when the channels have grown, review the result
  and commit it; the build only reads the file, so CI never calls the API.

    ANTHROPIC_API_KEY=... npm run summarize-archives
    npm run summarize-archives -- --area=Permaculture   # one area only

  Areas missing from the file simply show no summary.
*/
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import Anthropic from "@anthropic-ai/sdk";

import type { ArchiveSummaries, ArchiveSummary } from "../lib/archive-summaries";

const MODEL = "claude-opus-5-5";
/** Newest blocks read per channel. */
const BLOCKS_PER_CHANNEL = 150;
const OUT = path.join("data", "archive-summaries.json");

const SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "Two to four plain sentences, at most 90 words, on what the collection covers and how its parts connect.",
    },
    themes: {
      type: "array",
      items: { type: "string" },
      description: "Three to five recurring themes, each two to four words, lower case.",
    },
  },
  required: ["summary", "themes"],
  additionalProperties: false,
} as const;

const SYSTEM = `You write the short notes that sit beside a research archive on surulere.dev, a research studio's homepage. Each archive is a set of Are.na channels: images, links, papers and quotes collected around one area of study.

From the blocks given, say what the collection is actually about: the subjects, places, periods and questions it keeps returning to, and how they connect. Write for a curious visitor deciding whether to browse it. Describe the material, not the curator; don't praise it, don't open with "This collection", and don't mention Are.na, blocks or channels. Only name things that appear in the blocks.`;

type Block = { title: string; description: string; source: string; kind: string };

function blockLine(b: Block): string {
  const parts = [b.title];
  if (b.description) parts.push(b.description.replace(/\s+/g, " ").slice(0, 280));
  if (b.source) parts.push(`(${b.source})`);
  return `- [${b.kind}] ${parts.join(" — ")}`;
}

async function main() {
  loadEnvConfig(process.cwd());
  const only = process.argv.find((a) => a.startsWith("--area="))?.split("=")[1];

  // Lazily, so .env is loaded first.
  const { getHomeConfig } = await import("../lib/home-config");
  const { fetchChannel, parseChannelRef } = await import("../lib/research-areas");

  const home = getHomeConfig();
  const client = new Anthropic();
  const existing: ArchiveSummaries = existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, "utf8"))
    : { model: MODEL, areas: {} };

  for (const area of home.archives.areas) {
    if (only && area.name.toLowerCase() !== only.toLowerCase()) continue;
    const channels = [];
    for (const value of area.channels) {
      const ref = parseChannelRef(value);
      if (!ref.slug) {
        console.warn(`[${area.name}] skipping "${value}": give a URL or slug`);
        continue;
      }
      const channel: any = await fetchChannel(ref.slug, BLOCKS_PER_CHANNEL);
      if (channel) channels.push(channel);
    }
    if (!channels.length) {
      console.warn(`[${area.name}] no channels found; left as it was`);
      continue;
    }

    const sections = channels.map((ch) => {
      const blocks: Block[] = (ch.contents || [])
        .filter((b: any) => b?.base_class === "Block")
        .slice(-BLOCKS_PER_CHANNEL)
        .reverse()
        .map((b: any) => ({
          title: b.title || b.generated_title || "Untitled",
          description: b.description || "",
          source: b.source?.url ? new URL(b.source.url).hostname.replace(/^www\./, "") : "",
          kind: String(b.class || "Block").toLowerCase(),
        }));
      return `<channel title="${ch.title}" total_blocks="${ch.length}">\n${
        ch.metadata?.description ? `Description: ${ch.metadata.description}\n` : ""
      }${blocks.map(blockLine).join("\n")}\n</channel>`;
    });

    const prompt = `Area: ${area.name}${area.subtitle ? ` (${area.subtitle})` : ""}\n\nThe newest blocks of each channel in this area:\n\n${sections.join("\n\n")}`;

    console.log(`[${area.name}] summarising ${channels.length} channel(s)…`);
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    } as any);

    if (response.stop_reason !== "end_turn") {
      throw new Error(`[${area.name}] stopped early: ${response.stop_reason}`);
    }
    const text = response.content.flatMap((c) => (c.type === "text" ? [c.text] : [])).join("");
    const parsed = JSON.parse(text) as Pick<ArchiveSummary, "summary" | "themes">;

    existing.areas[area.name] = {
      summary: parsed.summary.trim(),
      themes: parsed.themes.slice(0, 5),
      generatedAt: new Date().toISOString().slice(0, 10),
      blocksRead: channels.reduce((n, ch) => n + Math.min(ch.contents?.length || 0, BLOCKS_PER_CHANNEL), 0),
    };
    console.log(`  ${parsed.summary}\n  themes: ${parsed.themes.join(", ")}`);
  }

  existing.model = MODEL;
  mkdirSync("data", { recursive: true });
  writeFileSync(OUT, JSON.stringify(existing, null, 2) + "\n");
  console.log(`wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
