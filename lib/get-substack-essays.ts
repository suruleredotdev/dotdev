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
      log("ERROR", `Failed to fetch Substack essays from ${substackHandle}`, {
        status: response.status,
        response: await response.text(),
      });
      return [];
    }

    const data = await response.json();

    // Extract essays from the Substack API response
    const essays = (data || [])
      .filter((post: any) => post.is_published === true) // Only published posts
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

    log("DEBUG", "Fetched Substack essays", {
      count: essays.length,
      substackHandle,
    });
    return essays;
  } catch (err) {
    log("ERROR", "Error fetching Substack essays", {
      error: err,
      substackHandle,
    });
    return [];
  }
}
