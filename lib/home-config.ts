/*
  Home page copy and cards that don't come from Notion or Substack: the hero,
  section titles, tool cards and archive settings. Edit config/home.json to
  change them; the build validates the file and fails with a message naming
  the bad field, so a typo never ships as a broken page.

  Server-only: reads the filesystem, so call it from getStaticProps.
*/
import fs from "node:fs";
import path from "node:path";

export interface HomeTool {
  title: string;
  url: string;
  /** Path under public/, e.g. "/archive-3d-preview.jpeg" */
  image: string;
  description: string;
}

export interface HomeLink {
  label: string;
  url: string;
}

export interface HomeArea {
  name: string;
  subtitle?: string;
  /**
   * Are.na channels the area collects: each a URL, slug or title (case
   * ignored). A URL is also that channel's link. Empty for an area with none.
   */
  channels: string[];
  /** Tools and research that grew out of this area (essays live in the Essays section). */
  links: HomeLink[];
}

export interface HomeConfig {
  hero: {
    tagline: string;
    description: string;
  };
  essays: {
    title: string;
    substackLinkLabel: string;
    /** Essays shown before "Show all". */
    previewCount: number;
    /** "{count}" is replaced with the number of essays. */
    showAllLabel: string;
    showFewerLabel: string;
  };
  tools: {
    title: string;
    /** Cards per row on desktop; 0 fits as many as the width allows. */
    columns: number;
    items: HomeTool[];
  };
  archives: {
    title: string;
    /** Areas per row on desktop; 0 fits as many as the width allows. */
    columns: number;
    intro: string;
    profileUrl: string;
    profileLinkLabel: string;
    /** Link for an area with one channel; "{count}" is its number of blocks. */
    channelLinkLabel: string;
    /** Block previews per area before "More from each", and after. */
    previewBlocks: number;
    expandedBlocks: number;
    showMoreLabel: string;
    showFewerLabel: string;
    areas: HomeArea[];
  };
}

export const homeConfigPath = path.join(process.cwd(), "config", "home.json");

export function getHomeConfig(): HomeConfig {
  const raw = JSON.parse(fs.readFileSync(homeConfigPath, "utf8"));
  return validateHomeConfig(raw);
}

export function validateHomeConfig(raw: unknown): HomeConfig {
  const c = new Checker("config/home.json");
  const root = c.object(raw, "");
  const hero = c.object(root.hero, "hero");
  const essays = c.object(root.essays, "essays");
  const tools = c.object(root.tools, "tools");
  const archives = c.object(root.archives, "archives");

  const config: HomeConfig = {
    hero: {
      tagline: c.string(hero.tagline, "hero.tagline"),
      description: c.string(hero.description, "hero.description"),
    },
    essays: {
      title: c.string(essays.title, "essays.title"),
      substackLinkLabel: c.string(essays.substackLinkLabel, "essays.substackLinkLabel"),
      previewCount: c.count(essays.previewCount, "essays.previewCount"),
      showAllLabel: c.string(essays.showAllLabel, "essays.showAllLabel"),
      showFewerLabel: c.string(essays.showFewerLabel, "essays.showFewerLabel"),
    },
    tools: {
      title: c.string(tools.title, "tools.title"),
      columns: c.count(tools.columns, "tools.columns"),
      items: c.array(tools.items, "tools.items").map((item, i) => {
        const at = `tools.items[${i}]`;
        const tool = c.object(item, at);
        return {
          title: c.string(tool.title, `${at}.title`),
          url: c.url(tool.url, `${at}.url`),
          image: c.string(tool.image, `${at}.image`),
          description: c.string(tool.description, `${at}.description`),
        };
      }),
    },
    archives: {
      title: c.string(archives.title, "archives.title"),
      columns: c.count(archives.columns, "archives.columns"),
      intro: c.string(archives.intro, "archives.intro"),
      profileUrl: c.url(archives.profileUrl, "archives.profileUrl"),
      profileLinkLabel: c.string(archives.profileLinkLabel, "archives.profileLinkLabel"),
      channelLinkLabel: c.string(archives.channelLinkLabel, "archives.channelLinkLabel"),
      previewBlocks: c.count(archives.previewBlocks, "archives.previewBlocks"),
      expandedBlocks: c.count(archives.expandedBlocks, "archives.expandedBlocks"),
      showMoreLabel: c.string(archives.showMoreLabel, "archives.showMoreLabel"),
      showFewerLabel: c.string(archives.showFewerLabel, "archives.showFewerLabel"),
      areas: c.array(archives.areas, "archives.areas").map((item, i) => {
        const at = `archives.areas[${i}]`;
        const area = c.object(item, at);
        return {
          name: c.string(area.name, `${at}.name`),
          ...(area.subtitle !== undefined
            ? { subtitle: c.string(area.subtitle, `${at}.subtitle`) }
            : {}),
          // `channel` (one) is still accepted alongside `channels` (several).
          channels: [
            ...(area.channel !== undefined ? [c.string(area.channel, `${at}.channel`)] : []),
            ...(area.channels !== undefined
              ? c.array(area.channels, `${at}.channels`).map((v, j) => c.string(v, `${at}.channels[${j}]`))
              : []),
          ],
          links: c.array(area.links, `${at}.links`).map((l, j) => {
            const linkAt = `${at}.links[${j}]`;
            const link = c.object(l, linkAt);
            return {
              label: c.string(link.label, `${linkAt}.label`),
              url: c.url(link.url, `${linkAt}.url`),
            };
          }),
        };
      }),
    },
  };

  if (config.archives.expandedBlocks < config.archives.previewBlocks) {
    c.fail("archives.expandedBlocks should be at least archives.previewBlocks");
  }

  c.throwIfErrors();
  return config;
}

/** Collects every problem in the file, so one build run reports them all. */
class Checker {
  private errors: string[] = [];

  constructor(private file: string) {}

  object(value: unknown, at: string): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    this.errors.push(`${at || "(root)"} should be an object`);
    return {};
  }

  array(value: unknown, at: string): unknown[] {
    if (Array.isArray(value)) return value;
    this.errors.push(`${at} should be a list`);
    return [];
  }

  string(value: unknown, at: string): string {
    if (typeof value === "string" && value.trim() !== "") return value;
    this.errors.push(`${at} should be non-empty text`);
    return "";
  }

  url(value: unknown, at: string): string {
    const s = this.string(value, at);
    if (s && !/^https?:\/\//.test(s)) this.errors.push(`${at} should start with https://`);
    return s;
  }

  count(value: unknown, at: string): number {
    if (Number.isInteger(value) && (value as number) >= 0) return value as number;
    this.errors.push(`${at} should be a whole number, 0 or more`);
    return 0;
  }

  fail(message: string) {
    this.errors.push(message);
  }

  throwIfErrors() {
    if (this.errors.length) {
      throw new Error(
        `${this.file} has ${this.errors.length} problem(s):\n- ${this.errors.join("\n- ")}`
      );
    }
  }
}
