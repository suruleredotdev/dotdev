import pMemoize from "p-memoize";
import { getAllPagesInSpace, uuidToId } from "notion-utils";

import { includeNotionIdInUrls } from "./config";
import { notion } from "./notion-api";
import { readNotionSnapshot } from "./content-snapshot";
import { getCanonicalPageId } from "./get-canonical-page-id";
import * as config from "./config";
import * as types from "./types";

import { log } from "./log";

const uuid = !!includeNotionIdInUrls;

export async function getSiteMap(): Promise<types.SiteMap> {
  const partialSiteMap = await getAllPages(
    config.rootNotionPageId,
    config.rootNotionSpaceId
  );

  return {
    site: config.site,
    ...partialSiteMap,
  } as types.SiteMap;
}

const getAllPages = config.usePMemo
  ? pMemoize(getAllPagesImpl, {
      cacheKey: (...args) => JSON.stringify(args),
    })
  : getAllPagesImpl;

/**
 * Walks every page reachable from the root page and returns their recordMaps.
 *
 * This hits Notion directly, so it only runs on a developer machine — see
 * scripts/fetch-content.ts. Builds read the committed snapshot instead.
 */
export async function crawlNotionSpace(
  rootNotionPageId: string,
  rootNotionSpaceId: string | null
): Promise<types.PageMap> {
  const getPage = async (pageId: string, ...args) => {
    try {
      log("DEBUG", "\nnotion.getPage", uuidToId(pageId));
      return await notion.getPage(pageId, ...args);
    } catch (e) {
      log("ERROR", "\ncaught error on notion.getPage", e);
      log("DEBUG", "\n...skipping page", pageId);
    }
  };

  return getAllPagesInSpace(rootNotionPageId, rootNotionSpaceId, getPage, {
    concurrency: 2,
  });
}

async function getPageMap(
  rootNotionPageId: string,
  rootNotionSpaceId: string
): Promise<types.PageMap> {
  const snapshot = readNotionSnapshot();

  if (snapshot?.pages) {
    log(
      "INFO",
      `[snapshot] site map from ${
        Object.keys(snapshot.pages).length
      } pages (fetched ${snapshot.fetchedAt})`
    );
    return snapshot.pages;
  }

  return crawlNotionSpace(rootNotionPageId, rootNotionSpaceId);
}

async function getAllPagesImpl(
  rootNotionPageId: string,
  rootNotionSpaceId: string
): Promise<Partial<types.SiteMap>> {
  const pageMap = await getPageMap(rootNotionPageId, rootNotionSpaceId);

  const canonicalPageMap = Object.keys(pageMap).reduce(
    (map, pageId: string) => {
      const recordMap = pageMap[pageId];
      if (!recordMap) {
        console.warn(`Skipping page "${pageId}" — failed to load`);
        return map;
      }

      const canonicalPageId = getCanonicalPageId(pageId, recordMap, {
        uuid,
      });

      if (map[canonicalPageId]) {
        // you can have multiple pages in different collections that have the same id
        // TODO: we may want to error if neither entry is a collection page
        console.warn("error duplicate canonical page id", {
          canonicalPageId,
          pageId,
          existingPageId: map[canonicalPageId],
        });

        return map;
      } else {
        return {
          ...map,
          [canonicalPageId]: pageId,
        };
      }
    },
    {}
  );

  return {
    pageMap,
    canonicalPageMap,
  };
}
