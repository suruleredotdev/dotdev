import * as React from "react";

// import Link from 'next/link'
// import Image from 'next/image'
// import dynamic from 'next/dynamic'

import {
  Block,
  BlockMap,
  Collection,
  CollectionMap,
  CollectionView,
  CollectionViewMap,
  CollectionQueryResult,
} from "notion-types";

import * as types from "lib/types";

import { globalClasses, layoutDefaultClasses, StyleClasses } from "./styles";
import { getPageProperty } from "notion-utils";
import { getCanonicalPageId } from "lib/get-canonical-page-id";

const classes: StyleClasses = {
    ...globalClasses,
    ...layoutDefaultClasses,
}

export const HomePageContent: React.FC<types.PageProps> = ({
  site,
  recordMap,
  pageId,
}) => {
  // TODO: render from root page block
  const posts = getSitePosts({
    recordMap,
    pageId,
  });
  return (
    <div id="content" className={classes.content}>
      <div id="about pb5">
        <p className={classes.tagline}>
          Serious writing about Africa's future.
        </p>

        <p className={classes.description}>
          Essays and visualizations to help us think critically about our
          ever-changing reality in the 2020s and build a better future for
          ourselves.
        </p>
      </div>

      <b className={classes.postsTitle}>ESSAYS</b>
      <ul className={classes.postsList}>
        {posts?.map((post, i) =>
          post.draft != true ? (
            <p key={i}>
              <a className={classes.postLink} href={"/" + post.slug}>
                {post.title}
              </a>
              <small className={classes.postDate}>
              &nbsp; &mdash; {new Date(post.published).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric'})}
              </small>
              {post.tags ? (
                <>
                  <br />
                  {post.tags?.map((tag, i) => (
                    <a
                      key={i}
                      className={classes.postTag}
                      href={"/blog/tag/" + tag}
                    >
                      <em>{tag}</em>
                    </a>
                  ))}
                </>
              ) : (
                <></>
              )}
            </p>
          ) : (
            <></>
          )
        )}
      </ul>
      <br />
    </div>
  );
};

const POSTS_COLLECTION_TITLE = "Posts";
function getSitePosts(args: { recordMap; pageId }): Array<object> {
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
