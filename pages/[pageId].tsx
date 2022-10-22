import * as React from 'react'
import { GetStaticProps } from 'next'
import {
  NotionContextProvider, NotionRenderer,
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
    pageId,
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
    pageId,
    page: !recordMap || recordMap.block[pageId]
  })

  const header = (<>
      
  </>)

  return <LayoutDefault {...props} >
      <LayoutPost
        site={site}
        recordMap={recordMap}
        error={error}
        pageId={pageId}
        rootPageBlock={block}
      >
        <NotionRenderer
          bodyClassName={
            "" // (styles.notion, pageId === site.rootNotionPageId && "index-page")
          }
          darkMode={isDarkMode}
          components={components}
          recordMap={recordMap}
          rootPageId={site?.rootNotionPageId}
          blockId={pageId}
          rootDomain={site?.domain}
          fullPage={false}
          previewImages={!!recordMap?.preview_images}
          showCollectionViewDropdown={false}
          showTableOfContents={false} //  config.defaultShowTableOfContents
          minTableOfContentsItems={false} //  config.defaultMinTableOfContentsItems
          defaultPageIcon={config.defaultPageIcon}
          defaultPageCover={config.defaultPageCover}
          defaultPageCoverPosition={config.defaultPageCoverPosition}
          mapImageUrl={mapImageUrl}
          disableHeader={true}
          className="pa0 o-80"
          // searchNotion={config.isSearchEnabled ? searchNotion : null}
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
}> = ({ level = 0, blockId, ...props }) => {
  const { recordMap } = useNotionContext()
  const id = blockId || Object.keys(recordMap.block)[0]
  const block = recordMap.block[id]?.value

  if (!block) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('missing block', blockId)
    }

    return null
  }

  return (
    <Block key={id} level={level} block={block} {...props}>
      {block?.content?.map((contentBlockId) => (
        <NotionBlockRenderer
          key={contentBlockId}
          blockId={contentBlockId}
          level={level + 1}
          {...props}
        />
      ))}
    </Block>
  )
}

// used to render page at build time
// https://nextjs.org/docs/basic-features/data-fetching/get-static-props
export const getStaticProps: GetStaticProps<PageProps, Params> = async ({ params }) => {
  const pageId = parsePageId(params.pageId, { uuid: true }) as string

  try {
    const props = await resolveNotionPage(config.domain) //, rawPageId)
    console.log("STATIC PROPS: pageId", { domain:config.domain, props })

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
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

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
