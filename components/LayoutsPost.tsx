import * as React from 'react'

import * as types from 'lib/types'

// import styles from './styles.module.css'
// import { getNotionProps } from './NotionComponents'
// import { NotionRenderer, NotionContextProvider, NotionBlockRenderer } from 'react-notion-x'
// import { getAllPagesInSpace } from 'notion-utils'
// import { mapPageUrl } from 'lib/map-page-url'
// import { site } from 'lib/config'
// import * as config from 'lib/config'
import { getPage } from 'lib/notion'
import { PageBlock } from 'lib/types'
/*
---
layout: default
---

{% include chart.html %}
{% include annotations.html %}
{% include quotebacks.html %}
*/

export const LayoutPost: React.FC<types.PageProps> = async ({
  site,
  recordMap,
  error,
  pageId
}) => {

  const pageRecordMap = await getPage(pageId)
  const page = getPageFromRecords(pageRecordMap)
  const content = renderPageContent(page)

  return (
    <>
      <div id="content" className="post pa3 pa5-ns mt6-l mh7-l f5">
        <a href="/">&larr;</a>

        <h1 className="gray o-90 mb0">{ page.title }</h1>
        <p className="gray o-90 mt0 pb4 ttu f7">{ page.date.toString() } - 
          {page?.author ?
            <a href={page.author.link} className="title">{ page.author }</a>
          : page.authors ?
            page.authors.map((author, i) => (
              <a key={i} href={author.link} className="title">{ author.name }</a>
            ))
          : <></>}
        </p>

        { content }

        <a href="#top">&uarr;</a>
      </div>
    </>
  )
}

function getPageFromRecords(pageRecordMap: ExtendedRecordMap): PageBlock {
  return {
      type: 'page',
      /// BasePageBlock 
      // id: ID;
      // type: BlockType;
      // properties?: any;
      // format?: any;
      // content?: ID[];
      // space_id?: ID;
      // parent_id: ID;
      // parent_table: string | 'space' | 'block' | 'table';
      // version: number;
      // created_time: number;
      // last_edited_time: number;
      // alive: boolean;
      // created_by_table: string;
      // created_by_id: ID;
      // last_edited_by_table: string;
      // last_edited_by_id: ID;
    } as PageBlock
  // throw new Error('Function not implemented.')
}
function renderPageContent(page: void) {
  return <></>
  // throw new Error('Function not implemented.')
}

