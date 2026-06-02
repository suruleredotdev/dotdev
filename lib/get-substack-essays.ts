import { log } from "./log";

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
 * Fetches published essays from a Substack publication
 * Uses the public Substack API
 */
export async function getSubstackEssays(
  substackHandle: string,
  limit: number = 10,
  apiKey?: string
): Promise<SubstackEssay[]> {
  try {
    // Substack's public API endpoint
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
      console.error(`[substack] fetch failed: ${response.status}`, body.slice(0, 200));
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(`[substack] unexpected response shape`, JSON.stringify(data).slice(0, 200));
      return [];
    }

    // Extract essays from the Substack API response.
    // The public endpoint already filters to published posts; avoid strict
    // is_published === true which drops posts where the field is absent.
    const essays = data
      .filter((post: any) => post.is_published !== false)
      .map((post: any) => ({
        id: String(post.id),
        title: post.title || "",
        description:
          post.subtitle || post.body_preview?.substring(0, 150) || "",
        url:
          post.canonical_url ||
          `https://${substackHandle}.substack.com/p/${post.slug}`,
        published: new Date(post.post_date).getTime(),
        author: (post.author && post.author.name) || defaultAuthor,
        image: post.cover_image || undefined,
      })) as SubstackEssay[];

    console.error(`[substack] fetched ${essays.length} essays from ${substackHandle}`);
    return essays;
  } catch (err) {
    console.error(`[substack] fetch threw`, err);
    return [];
  }
}
