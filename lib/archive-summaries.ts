import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** One research area's AI summary, written by scripts/summarize-archives.ts. */
export interface ArchiveSummary {
  summary: string;
  themes: string[];
  /** YYYY-MM-DD. */
  generatedAt: string;
  blocksRead: number;
}

export interface ArchiveSummaries {
  model: string;
  /** Keyed by area name, as in config/home.json. */
  areas: Record<string, ArchiveSummary>;
}

const FILE = path.join(process.cwd(), "data", "archive-summaries.json");

/** The committed summaries, or none when the file hasn't been generated. */
export function getArchiveSummaries(): Record<string, ArchiveSummary> {
  if (!existsSync(FILE)) return {};
  try {
    const data = JSON.parse(readFileSync(FILE, "utf8")) as ArchiveSummaries;
    return data.areas || {};
  } catch {
    return {};
  }
}
