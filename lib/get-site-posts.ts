/*
 - getSitePosts parses recordMap 
*/
import { getPageProperty } from 'notion-utils'
import { 
  Block, Collection, CollectionMap, CollectionView,
  CollectionViewMap, CollectionQueryResult, BlockMap,
  ExtendedRecordMap, Role
} from "notion-types";
import { getCanonicalPageId } from "./get-canonical-page-id";

const POSTS_COLLECTION_TITLE = "Posts";
export function getSitePosts(args: { recordMap: ExtendedRecordMap }): Array<object> {
  const { recordMap } = args;

  console.log(">>> getSitePosts 0", {
    recordMap,
    blocks: Object.values(recordMap.block).map((i) => {
      const v: Block = i?.value;
      return v ? { props: v.properties, type: v.type } : null;
    }),
  });

  /*
    Get "Posts" collection, get page blocks of articles to render
   */
  const collection: Collection = (
      Object.values(recordMap.collection)[0] as CollectionMap[string]
    )?.value,
    collectionView: CollectionView = (
      Object.values(recordMap.collection_view)[0] as CollectionViewMap[string]
    )?.value,
    // _ = console.log("log", {collection, collectionView, query: Object.keys(recordMap)}),
    collectionQueryResult: CollectionQueryResult =
      recordMap.collection_query[collection?.id]?.[collectionView?.id];
  if (!collection) return [];

  const collectionId = collection.id,
    collectionTitle = collection.name[0][0],
    collectionSchema = collection.schema;

  if (!collectionId || collectionTitle !== POSTS_COLLECTION_TITLE) return [];

  /*
    Get blocks for pages in "Posts" collection via query
   */
  const pageIdsMatchingQuery =
    collectionQueryResult?.collection_group_results?.blockIds || [];

  const postBlocks = Object.values(recordMap.block).filter(
    (block: { role: Role; value: Block; }) => {
      return (
        block.value?.parent_id === collectionId ||
        pageIdsMatchingQuery.includes(block.value?.id)
      );
    }
  ).map((b: BlockMap[string]) => b.value);

  /*
    Construct posts pointer including { id, slug, title, [properties]... }
   */
  const posts = postBlocks.map((p: Block) => ({
    id: p?.id,
    slug: getCanonicalPageId(p?.id, recordMap),
    title: p?.properties?.title,
    ...Object.keys(p?.properties)?.reduce(
      (acc, propId) => ({
        ...acc,
        [collectionSchema[propId].name?.toLowerCase()?.replace(/\s/g, "_")]:
          getPageProperty(collectionSchema[propId].name, p, recordMap)
      }),
      {}
    ),
  }));

  console.log(">>> getSitePosts 2", {
    posts,
  });

  return posts;
}
