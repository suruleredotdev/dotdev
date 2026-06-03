/*
 - getSitePosts parses recordMap 
*/
import { getPageProperty } from "notion-utils";
import {
  Block,
  Collection,
  CollectionMap,
  CollectionView,
  CollectionViewMap,
  CollectionQueryResult,
  BlockMap,
  ExtendedRecordMap,
  Role,
} from "notion-types";
import { getCanonicalPageId } from "./get-canonical-page-id";

import { log } from "./log";

const POSTS_COLLECTION_TITLE = "Posts";
export function getSitePosts(args: {
  recordMap: ExtendedRecordMap;
}): Array<object> {
  const { recordMap } = args;

  const allCollections = Object.values(recordMap.collection ?? {});
  console.error(`[getSitePosts] collections found: ${allCollections.length}`, allCollections.map(c => c?.value?.name?.[0]?.[0]));

  if (!allCollections.length) return [];

  // Find the "Posts" collection by name; fall back to the first collection
  const targetEntry =
    allCollections.find(c => c?.value?.name?.[0]?.[0] === POSTS_COLLECTION_TITLE) ??
    allCollections[0];

  const collection: Collection = (targetEntry as CollectionMap[string])?.value;
  if (!collection) return [];

  const collectionView: CollectionView = (
    Object.values(recordMap.collection_view ?? {})[0] as CollectionViewMap[string]
  )?.value;

  const collectionQueryResult: CollectionQueryResult =
    recordMap.collection_query?.[collection?.id]?.[collectionView?.id];

  const collectionId = collection.id;
  const collectionTitle = collection.name?.[0]?.[0];
  const collectionSchema = collection.schema;

  console.error(`[getSitePosts] using collection: "${collectionTitle}" (id: ${collectionId})`);

  /*
    Get blocks for pages in "Posts" collection via query
   */
  const pageIdsMatchingQuery =
    collectionQueryResult?.collection_group_results?.blockIds || [];

  const postBlocks = Object.values(recordMap.block)
    .filter((block: { role: Role; value: Block }) => {
      return (
        block.value?.parent_id === collectionId ||
        pageIdsMatchingQuery.includes(block.value?.id)
      );
    })
    .map((b: BlockMap[string]) => b.value);

  console.error(`[getSitePosts] post blocks found: ${postBlocks.length}`);

  /*
    Construct posts pointer including { id, slug, title, [properties]... }
   */
  const posts = postBlocks.map((p: Block) => ({
    id: p?.id,
    slug: getCanonicalPageId(p?.id, recordMap),
    title: p?.properties?.title,
    ...Object.keys(p?.properties ?? {})?.reduce(
      (acc, propId) => ({
        ...acc,
        [collectionSchema[propId]?.name?.toLowerCase()?.replace(/\s/g, "_")]:
          getPageProperty(collectionSchema[propId]?.name, p, recordMap),
      }),
      {}
    ),
  }));

  console.error(`[getSitePosts] posts: ${posts.length}`, posts.map((p: any) => ({ title: p.title, public: p.public, published: p.published })));

  return posts;
}
