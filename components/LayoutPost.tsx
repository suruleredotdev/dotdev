import * as React from 'react'

import * as types from 'lib/types'

import { getPage } from 'lib/notion'
import { Block, BlockMap, PageBlock, RecordMap } from 'lib/types'
import { getPageProperty } from 'notion-utils'
/*
---
layout: default
---

{% include chart.html %}
{% include annotations.html %}
{% include quotebacks.html %}
*/

export const LayoutPost: React.FC<types.PageProps & { children: React.ReactNode }> = ({
  site,
  recordMap,
  error,
  pageId,
  children 
}) => {

  const { rootBlock: page, contentBlocks } = getPageFromRecords({recordMap, pageId})
  console.log("LayoutPost", { rootBlock: page, pageId: recordMap?.[pageId], contentBlocks })

  return (
    <div id="content" className="post pa3 pa5-ns mt6-l mh7-l f5">
      <a href="/">&larr;</a>

      <h1 className="gray o-90 mb0">{ page.title }</h1>
      <p className="gray o-90 mt0 pb4 ttu f7">{ page.date?.toString() } - 
        {page?.author ?
          <a href={page.author?.link} className="title">{ page.author.name }</a>
        : (page.authors ?
          page.authors?.map((author, i) => (
            <a key={i} href={author.link} className="title">{ author.name }</a>
          ))
        : <></>)}
      </p>

      { children }

      <a href="#top">&uarr;</a>
    </div>
  )
}

// (WIP) Post Content Rendering flow
// TODO: 
// - [ ] properly utilize getStaticProps to pre-render content
// - [ ] split NotionRenderer to use custom Article components
// - [ ] incorporate getSitePosts (?)

export function pageFromBlock(args: { recordMap: RecordMap, block: PageBlock }) {
  return {
    author: getPageProperty("Author", args.block, args.recordMap),
    title: getPageProperty("Title", args.block, args.recordMap),
    date: getPageProperty("Date", args.block, args.recordMap),
  }
}

function getPageFromRecords(args: { recordMap; pageId }): {
  rootBlock: any | PageBlock,
  contentBlocks: Array<Block>,
} {
  const { recordMap, pageId } = args;

  const defaultRootBlock = {
    title: "",
    date: "",
    author: { link: "", name: "" },
    authors: [{ link: "", name: "" }],
  }
  if (!recordMap?.block) {
    return {
      rootBlock: defaultRootBlock as any,
      contentBlocks: []
    }
  }

  const postRootBlock = Object.values(recordMap?.block).find(
    (block: BlockMap) => {
      return (
        block?.value?.id === pageId
      )
    }
  )?.value as PageBlock
  const postContentBlocks = Object.values(recordMap?.block).filter(
    (block: BlockMap) => {
      return (
        block?.value?.parent_id === pageId
      )
    }
  ).map((b: BlockMap[string]) => b?.value) as Array<Block>;

  const page = pageFromBlock({ recordMap, page: postRootBlock })
  console.log("getPageFromRecords", { record: postRootBlock, page })
  return {
    rootBlock: page,
    contentBlocks: postContentBlocks
  }
}

function renderPageContent(args: { recordMap: RecordMap, contentBlocks: Array<Block> }) {
  return <></>
}

// {
//     type: 'page',
//     /// BasePageBlock 
//     // id: ID;
//     // type: BlockType;
//     // properties?: any;
//     // format?: any;
//     // content?: ID[];
//     // space_id?: ID;
//     // parent_id: ID;
//     // parent_table: string | 'space' | 'block' | 'table';
//     // version: number;
//     // created_time: number;
//     // last_edited_time: number;
//     // alive: boolean;
//     // created_by_table: string;
//     // created_by_id: ID;
//     // last_edited_by_table: string;
//     // last_edited_by_id: ID;
//   } as PageBlock
