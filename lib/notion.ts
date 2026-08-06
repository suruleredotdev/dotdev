import pMap from "p-map";
import pMemoize from "p-memoize";
import { ExtendedRecordMap, SearchParams, SearchResults } from "notion-types";
import { mergeRecordMaps, parsePageId, uuidToId } from "notion-utils";

import { notion } from "./notion-api";
import { contentSource, readNotionSnapshot } from "./content-snapshot";
import { getPreviewImageMap } from "./preview-images";
import {
  isPreviewImageSupportEnabled,
  navigationStyle,
  navigationLinks,
} from "./config";

const getNavigationLinkPages = pMemoize(
  async (): Promise<ExtendedRecordMap[]> => {
    const navigationLinkPageIds = (navigationLinks || [])
      .map((link) => link.pageId)
      .filter(Boolean);

    if (navigationStyle !== "default" && navigationLinkPageIds.length) {
      return pMap(
        navigationLinkPageIds,
        async (navigationLinkPageId) =>
          notion.getPage(navigationLinkPageId, {
            chunkLimit: 1,
            fetchMissingBlocks: false,
            fetchCollections: false,
            signFileUrls: false,
          }),
        {
          concurrency: 4,
        }
      );
    }

    return [];
  }
);

/**
 * Looks a page up in the committed snapshot. Callers hand us page ids in both
 * dashed-uuid and bare-hex form, while the snapshot is keyed by dashed uuid.
 */
function getSnapshotPage(pageId: string): ExtendedRecordMap | null {
  const pages = readNotionSnapshot()?.pages;
  if (!pages) return null;

  const candidates = [pageId, parsePageId(pageId, { uuid: true }), uuidToId(pageId)];

  for (const candidate of candidates) {
    if (candidate && pages[candidate]) return pages[candidate];
  }

  return null;
}

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  const snapshotPage = getSnapshotPage(pageId);
  if (snapshotPage) return snapshotPage;

  if (contentSource === "snapshot") {
    throw new Error(
      `Page "${pageId}" is missing from the content snapshot. Re-run ` +
        `\`npm run fetch-content\` and commit data/.`
    );
  }

  let recordMap = await notion.getPage(pageId, {
    chunkLimit: 100,
  });

  if (navigationStyle !== "default") {
    // ensure that any pages linked to in the custom navigation header have
    // their block info fully resolved in the page record map so we know
    // the page title, slug, etc.
    const navigationLinkRecordMaps = await getNavigationLinkPages();

    if (navigationLinkRecordMaps?.length) {
      recordMap = navigationLinkRecordMaps.reduce(
        (map, navigationLinkRecordMap) =>
          mergeRecordMaps(map, navigationLinkRecordMap),
        recordMap
      );
    }
  }

  if (isPreviewImageSupportEnabled) {
    const previewImageMap = await getPreviewImageMap(recordMap);
    (recordMap as any).preview_images = previewImageMap;
  }

  return recordMap;
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params);
}
