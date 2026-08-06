/*
 - getSitePosts parses recordMap
*/
import { getBlockValue, getPageProperty } from "notion-utils";
import {
  Block,
  Collection,
  CollectionView,
  CollectionQueryResult,
  ExtendedRecordMap,
} from "notion-types";
import { getCanonicalPageId } from "./get-canonical-page-id";

import { log } from "./log";

/**
 * recordMap entries arrive in one of two shapes depending on the api/v3
 * response version: `{ role, value: T }` or `{ spaceId, value: { role, value: T } }`.
 * getBlockValue unwraps either — despite the name it works for collections and
 * collection views too, since it just recurses through `.value` until it finds
 * an object with an `id`.
 */
function recordValue<T>(entry: unknown): T {
  return getBlockValue(entry as any) as unknown as T;
}

const POSTS_COLLECTION_TITLE = "Posts";
export function getSitePosts(args: {
  recordMap: ExtendedRecordMap;
}): Array<object> {
  const { recordMap } = args;

  /*
    Get "Posts" collection, get page blocks of articles to render
   */
  const collection = recordValue<Collection>(
      Object.values(recordMap.collection)[0]
    ),
    collectionView = recordValue<CollectionView>(
      Object.values(recordMap.collection_view)[0]
    ),
    collectionQueryResult: CollectionQueryResult =
      recordMap.collection_query[collection?.id]?.[collectionView?.id];
  if (!collection) return [];

  const collectionId = collection.id,
    collectionTitle = collection.name?.[0]?.[0],
    collectionSchema = collection.schema;

  if (!collectionId || collectionTitle !== POSTS_COLLECTION_TITLE) {
    log("DEBUG", ">>> getSitePosts: no Posts collection", {
      collectionId,
      collectionTitle,
    });
    return [];
  }

  /*
    Get blocks for pages in "Posts" collection via query, page_sort, and parent_id
   */
  const postPageIds = new Set<string>();

  // Source 1: collection_query results
  const queryBlockIds =
    collectionQueryResult?.collection_group_results?.blockIds || [];
  queryBlockIds.forEach((id: string) => postPageIds.add(id));

  // Source 2: page_sort from collection views belonging to this collection
  Object.values(recordMap.collection_view).forEach((entry) => {
    const view = recordValue<CollectionView>(entry);
    if (
      (view as any)?.format?.collection_pointer?.id === collectionId &&
      (view as any)?.page_sort
    ) {
      (view as any).page_sort.forEach((id: string) => postPageIds.add(id));
    }
  });

  const postBlocks = Object.values(recordMap.block)
    .map((entry) => recordValue<Block>(entry))
    .filter(
      (block) =>
        block?.parent_id === collectionId || postPageIds.has(block?.id)
    );

  /*
    Construct posts pointer including { id, slug, title, [properties]... }
   */
  const posts = postBlocks.map((p: Block) => ({
    id: p?.id,
    slug: getCanonicalPageId(p?.id, recordMap),
    title: p?.properties?.title,
    ...Object.keys(p?.properties || {}).reduce((acc, propId) => {
      const schemaProp = collectionSchema[propId];
      if (!schemaProp) return acc;
      return {
        ...acc,
        [schemaProp.name?.toLowerCase()?.replace(/\s/g, "_")]: getPageProperty(
          schemaProp.name,
          p,
          recordMap
        ),
      };
    }, {}),
  }));

  log("DEBUG", ">>> getSitePosts", {
    posts: posts.length,
    postBlocks: postBlocks.length,
    queryBlockIds: queryBlockIds.length,
  });

  return posts;
}
