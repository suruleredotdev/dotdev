import * as React from "react";

import * as types from "lib/types";

import { Block, BlockMap, PageBlock, ExtendedRecordMap } from "lib/types";
import { getPageProperty } from "notion-utils";

import { log } from "lib/log";
/*
---
layout: default
---

{% include chart.html %}
{% include annotations.html %}
{% include quotebacks.html %}
*/

export const LayoutPost: React.FC<
  types.PageProps & { children: React.ReactNode }
> = ({ recordMap, pageId, children }) => {
  const { rootBlock: page, contentBlocks } = getPageFromRecords({
    recordMap,
    pageId,
  });
  log("DEBUG", "LayoutPost", {
    pageFromRecordsRootBlock: page,
    pageFromRecordMap: recordMap?.[pageId],
    contentBlockIds: contentBlocks?.map((x) => x.id),
  });

  return (
    <div id="content" className="post pa3 pa5-ns mt6-l mh7-l f5">
      <a href="/">&larr;</a>

      <h1 className="gray o-90 mb0">{page.title}</h1>
      <p className="gray o-90 mt0 pb4 ttu f7">
        {new Date(page.date)?.toLocaleDateString()} -
        {page?.author ? (
          <a href={page.author?.link} className="title">
            {page.author.name}
          </a>
        ) : page.authors ? (
          page.authors?.map((author, i) => (
            <a key={i} href={author.link} className="title">
              {author.name}
            </a>
          ))
        ) : (
          <></>
        )}
      </p>

      {children}

      <a href="#top">&uarr;</a>
    </div>
  );
};

// (WIP) Post Content Rendering flow
// TODO:
// - [ ] properly utilize getStaticProps to pre-render content
// - [ ] split NotionRenderer to use custom Article components
// - [ ] incorporate getSitePosts (?)

export function pageFromBlock(args: {
  recordMap: ExtendedRecordMap;
  block: PageBlock;
}) {
  return {
    author: getPageProperty("Author", args.block, args.recordMap),
    title: getPageProperty("Name", args.block, args.recordMap),
    date: getPageProperty("Published", args.block, args.recordMap),
  };
}

function getPageFromRecords(args: {
  recordMap: ExtendedRecordMap;
  pageId: string;
}): {
  rootBlock: any | PageBlock;
  contentBlocks: Array<Block>;
} {
  const { recordMap, pageId } = args;

  const defaultRootBlock = {
    title: "",
    date: "",
    author: { link: "", name: "" },
    authors: [{ link: "", name: "" }],
  };
  if (!recordMap?.block) {
    return {
      rootBlock: defaultRootBlock as any,
      contentBlocks: [],
    };
  }

  const postRootBlock = (
    Object.values(recordMap?.block).find((block: BlockMap[string]) => {
      return block?.value?.id === pageId;
    }) as BlockMap[string]
  )?.value as PageBlock;
  const postContentBlocks = Object.values(recordMap?.block)
    .filter((block: BlockMap[string]) => {
      return block?.value?.parent_id === pageId;
    })
    .map((b: BlockMap[string]) => b?.value) as Array<Block>;

  const page = pageFromBlock({ recordMap, block: postRootBlock });
  return {
    rootBlock: page,
    contentBlocks: postContentBlocks,
  };
}
