import { getPageProperty } from 'notion-utils'
import { Block, Collection, CollectionMap, CollectionView, CollectionViewMap, CollectionQueryResult, BlockMap } from "notion-types";
import { getCanonicalPageId } from "./get-canonical-page-id";

const POSTS_COLLECTION_TITLE = "Posts";
export function getSitePosts(args: { recordMap; pageId }): Array<object> {
  const { recordMap } = args;

  console.log(">>> getSitePosts 0", {
    recordMap,
    blocks: Object.values(recordMap.block).map((i) => {
      let v: Block = i?.value;
      return !!v ? { props: v.properties, type: v.type } : null;
    }),
  });

  const collection: Collection = (
      Object.values(recordMap.collection)[0] as CollectionMap[string]
    )?.value,
    collectionView: CollectionView = (
      Object.values(recordMap.collection_view)[0] as CollectionViewMap[string]
    )?.value,
    collectionQueryResult: CollectionQueryResult =
      recordMap.collection_query[collection.id][collectionView.id];
  if (!collection) return [];

  const collectionId = collection.id,
    collectionTitle = collection.name[0][0],
    collectionSchema = collection.schema;

  console.log(">>> getSitePosts 1", {
    collectionId,
    collectionView,
    collection,
    collectionTitle,
    collectionQueryResult,
  });

  if (!collectionId || collectionTitle !== POSTS_COLLECTION_TITLE) return [];

  const pageIdsMatchingQuery =
    collectionQueryResult?.collection_group_results?.blockIds || [];

  const postBlocks = Object.values(recordMap.block).filter(
    (block: BlockMap) => {
      return (
        block.value?.parent_id === collectionId ||
        pageIdsMatchingQuery.includes(block.value?.id)
      );
    }
  ).map((b: BlockMap[string]) => b.value);
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
    postBlocks,
    posts,
    pageIdsMatchingQuery,
    1: getPageProperty("Author", postBlocks[0], recordMap),
    published: new Date(getPageProperty("Published", postBlocks[0], recordMap))
  });

  posts.sort(function(a, b){return (new Date(a["published"])).getTime() - (new Date(b["published"])).getTime()})
  return posts; // TODO
}
