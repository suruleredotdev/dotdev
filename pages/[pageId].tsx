import * as React from 'react'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { ExtendedRecordMap } from 'notion-types'

import {
  NotionRenderer,
  useNotionContext,
  Text as NotionText
} from "react-notion-x";

import * as config from "lib/config";
import { isDev, domain } from 'lib/config'
import { getSiteMap } from 'lib/get-site-map'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { PageProps, Params } from 'lib/types'
import { useDarkMode } from "lib/use-dark-mode";
import { mapImageUrl } from 'lib/map-image-url'
import { NotionPage } from 'components'
import { LayoutDefault, parsePageId } from 'components/LayoutDefault'
import { LayoutPost } from 'components/LayoutPost'
import { Footer } from 'components/Footer';
import { mapPageUrl } from 'lib/map-page-url';
import { useSearchParam } from 'react-use';
import { getLayoutProps } from 'lib/get-layout-props';
import { getSitePosts } from 'lib/get-site-posts';

export default function DynamicPostPage(props) {
  const {
    site,
    recordMap,
    error,
    pageId: postPageId,
    posts
  } = props

  console.log("DynamicPostPage", { props })

  const {
    block,
    isBlogPost,
    notionProps,
  } = getLayoutProps(props)

  const { isDarkMode } = useDarkMode();

  const {
    components,
  } = notionProps;

  console.log("[pageId] POST", {
    rootPageId: site?.rootNotionPageId,
    rootPage: !recordMap || recordMap.block[site?.rootNotionPageId],
    postPageId,
    page: !recordMap || recordMap.block[postPageId],
    block,
    title: block.properties.title,
  })

  // TODO: customize post header component
  const header = (<>
      
  </>)

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
}> = ({ level = 0, blockId, recordMap, ...props }) => {
  const id = blockId || Object.keys(recordMap.block)[0]
  const block = recordMap.block[id]?.value

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
    content: block?.content.map(id => recordMap.block[id].value)
  })

  return (
    <div key={id}>
      {block?.content?.map((contentBlockId) => (
        <div className="pv2">
          <NotionText
            key={contentBlockId}
            value={recordMap.block[contentBlockId].value?.properties?.title}
            block={recordMap.block[contentBlockId].value}
            {...props}
          />
          <br/>
        </div>
      ))}
    </div>
  )
}

// used to render page at build time
// https://nextjs.org/docs/basic-features/data-fetching/get-static-props
export const getStaticProps: GetStaticProps<PageProps, Params> = async ({ params }) => {
  const pageId = parsePageId(params.pageId, { uuid: true }) as string

  try {
    const props = await resolveNotionPage(config.domain) //, rawPageId)
    console.log("STATIC PROPS: pageId", { pageId, domain:config.domain, props })

    const posts = getSitePosts({ recordMap: props?.recordMap, pageId })

    return { props: { ...props, pageId, posts }, revalidate: 10 }
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

  const staticPaths = {
    paths: Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
      params: {
        pageId
      }
    })),
    // paths: [],
    fallback: true
  }

  console.log("STATIC PATHS", staticPaths.paths)
  return staticPaths
}
