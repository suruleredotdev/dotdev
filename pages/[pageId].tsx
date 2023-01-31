import * as React from 'react'
import { GetStaticProps } from 'next'
import { ExtendedRecordMap } from 'notion-types'

import {
  NotionRenderer,
  NotionComponents,
} from "react-notion-x";

import * as config from "lib/config";
import { domain } from 'lib/config'
import { getSiteMap } from 'lib/get-site-map'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { PageProps, Params } from 'lib/types'
import { LayoutDefault, parsePageId } from 'components/LayoutDefault'
import { LayoutPost } from 'components/LayoutPost'
import { Footer } from 'components/Footer';
import { getLayoutProps } from 'lib/get-layout-props';

export default function DynamicPostPage(props: PageProps) {
  const {
    site,
    recordMap,
    error,
    pageId: postPageId,
  } = props

  console.log("DynamicPostPage", { props })

  const {
    block,
    isBlogPost,
    notionProps,
  } = getLayoutProps(props)

  const {
    components,
  } = notionProps;

  return <LayoutDefault {...props} >
      <LayoutPost
        site={site}
        recordMap={recordMap}
        error={error}
        pageId={postPageId}
        rootPageBlock={block}
      >

        <PostRenderer
          bodyClassName={
            "" // (styles.notion, pageId === site.rootNotionPageId && "index-page")
          }
          blockId={postPageId}
          disableHeader={true}
          className="pa0 o-80"
          recordMap={recordMap}
          components={components}
        />

      </LayoutPost>

      <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
  </LayoutDefault>
}

// based on NotionBlockRenderer
export const PostRenderer: React.FC<{
  className?: string
  bodyClassName?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  disableHeader?: boolean
  blockId?: string
  hideBlockId?: boolean
  level?: number
  recordMap: ExtendedRecordMap
  components: Partial<NotionComponents>
}> = ({ level = 0, blockId, recordMap, components, ...props }) => {
  const id = blockId || Object.keys(recordMap?.block || {})[0]
  const block = recordMap?.block[id]?.value

  console.log("PostRenderer 0", {
    id, block, recordMap
  })

  if (!block) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('missing block', blockId)
    }

    return null
  }

  console.log("PostRenderer", {
    content: block?.content?.map(contentId => {
      return recordMap?.block[contentId ]?.value //{ id, parent_id, type }
    })
  })

  /*
 TODO:
 - [x] handle regular text blocks
 - [x] handle images and other block types
   - Handled via NotionRenderer
   - [x] Classes: Headers, Sub-headers, Italics
   - [x] Containers: Callouts, Toggle lists, 
   - [ ] Custom Containers:
    - [ ] article references (Quote + Ref)

  BUGS:
  - [x] Missing blocks in recordMap => resolved by tweaking API calls, updating pkg
   */
  return (
    <span key={id}>
      {block?.content?.map((contentBlockId) => (
        <NotionRenderer key={contentBlockId} recordMap={recordMap}
          fullPage={false} darkMode={false} blockId={contentBlockId} components={components}/>
      ))}
    </span>
  )
}

// used to render page at build time
// https://nextjs.org/docs/basic-features/data-fetching/get-static-props
export const getStaticProps: GetStaticProps<PageProps, Params> = async ({ params }) => {
  const siteMap = await getSiteMap()

  // if param.pageId might be slug excluding ID, use canonicalPageMap to convert to UUID
  const rawPageId = siteMap.canonicalPageMap[params.pageId] || params.pageId

  const pageId: string = parsePageId(rawPageId, { uuid: true }) as string

  try {
    const props: PageProps = await resolveNotionPage(config.domain, pageId)

    return { props: { ...props, pageId, siteMap }, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, pageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

// https://nextjs.org/docs/basic-features/data-fetching/get-static-paths
export async function getStaticPaths() {
  // if (isDev) {
  //   return {
  //     paths: [],
  //     fallback: true
  //   }
  // }

  const siteMap = await getSiteMap()

  console.log("pages/pageId: SITEMAP", siteMap)

  const staticPaths = {
    paths: Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
      params: {
        pageId
      }
    })),
    // paths: [],
    fallback: true
  }

  return staticPaths
}
