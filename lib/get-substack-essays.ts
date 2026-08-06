import { readSubstackSnapshot } from "./content-snapshot";

export interface SubstackEssay {
  id: string;
  title: string;
  description: string;
  url: string;
  published: number; // timestamp
  author: string;
  image?: string;
}

const defaultAuthor = "Korede Aderele";

/**
 * Fetches the raw post objects from a Substack publication's public API.
 *
 * Substack sits behind Cloudflare and rejects CI runners, so this is meant to
 * run from a developer machine via `npm run fetch-content`. Builds read the
 * committed snapshot instead — see lib/content-snapshot.ts.
 */
export async function fetchSubstackPosts(
  substackHandle: string,
  limit: number = 10,
  apiKey?: string
): Promise<any[]> {
  try {
    const apiUrl = `https://${substackHandle}.substack.com/api/v1/posts?limit=${limit}`;

    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (compatible; surulere-dotdev/1.0)",
    };

    // Add API key if provided
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `[substack] fetch failed: ${response.status}`,
        body.slice(0, 200)
      );
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(
        `[substack] unexpected response shape`,
        JSON.stringify(data).slice(0, 200)
      );
      return [];
    }

    return data;
  } catch (err) {
    console.error(`[substack] fetch threw`, err);
    return [];
  }
}

/**
 * Maps raw Substack API posts onto the shape the site renders.
 */
export function parseSubstackPosts(
  posts: any[],
  substackHandle: string
): SubstackEssay[] {
  // The public endpoint already filters to published posts; avoid a strict
  // is_published === true which drops posts where the field is absent.
  return posts
    .filter((post: any) => post.is_published !== false)
    .map((post: any) => ({
      id: String(post.id),
      title: post.title || "",
      description: post.subtitle || post.body_preview?.substring(0, 150) || "",
      url:
        post.canonical_url ||
        `https://${substackHandle}.substack.com/p/${post.slug}`,
      published: new Date(post.post_date).getTime(),
      author: (post.author && post.author.name) || defaultAuthor,
      image: post.cover_image || undefined,
    }));
}

/**
 * Returns the essays to render, preferring the committed snapshot and falling
 * back to a live fetch when there isn't one.
 */
export async function getSubstackEssays(
  substackHandle: string,
  limit: number = 10,
  apiKey?: string
): Promise<SubstackEssay[]> {
  const snapshot = readSubstackSnapshot();

  if (snapshot?.posts) {
    const essays = parseSubstackPosts(snapshot.posts, snapshot.handle).slice(
      0,
      limit
    );

    console.log(
      `[substack] ${essays.length} essays from snapshot (fetched ${snapshot.fetchedAt})`
    );
    return essays;
  }

  const posts = await fetchSubstackPosts(substackHandle, limit, apiKey);
  const essays = parseSubstackPosts(posts, substackHandle);

  console.log(`[substack] fetched ${essays.length} essays from ${substackHandle}`);
  return essays;
}
