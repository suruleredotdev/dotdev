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

export interface HomeConfig {
  hero: {
    tagline: string;
    description: string;
  };
  essays: {
    title: string;
    substackLinkLabel: string;
  };
  tools: {
    title: string;
    items: HomeTool[];
  };
  archives: {
    title: string;
    intro: string;
    /** Most Are.na channels to list. */
    maxChannels: number;
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
    },
    tools: {
      title: c.string(tools.title, "tools.title"),
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
      intro: c.string(archives.intro, "archives.intro"),
      maxChannels: c.count(archives.maxChannels, "archives.maxChannels"),
    },
  };

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

  throwIfErrors() {
    if (this.errors.length) {
      throw new Error(
        `${this.file} has ${this.errors.length} problem(s):\n- ${this.errors.join("\n- ")}`
      );
    }
  }
}
