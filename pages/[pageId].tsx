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
import { LayoutDefault } from 'components/LayoutDefault'
import { LayoutPost } from 'components/LayoutPost'
import { getLayoutProps } from 'pages'
import { Footer } from 'components/Footer';
import { mapPageUrl } from 'lib/map-page-url';
import { useSearchParam } from 'react-use';

export const getStaticProps: GetStaticProps<PageProps, Params> = async (context) => {
  const rawPageId = context.params.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

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

export default function DynamicPostPage(props) {
  const {
    site,
    recordMap,
    error,
    pageId,
  } = props

  console.log("DynamicPostPage", { props })

  const {
    isBlogPost,
    notionProps,
  } = getLayoutProps(props)

  const { isDarkMode } = useDarkMode();

  const {
    components,
  } = notionProps;

  const lite = useSearchParam('lite')

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {}
    if (lite) params.lite = lite

    const searchParams = new URLSearchParams(params)
    return mapPageUrl(site, recordMap, searchParams)
  }, [site, recordMap, lite])

  return <LayoutDefault {...props} >
      <LayoutPost
        site={site}
        recordMap={recordMap}
        error={error}
        pageId={pageId}
      >

        <NotionRenderer
          bodyClassName={
            "" // (styles.notion, pageId === site.rootNotionPageId && "index-page")
          }
          darkMode={isDarkMode}
          components={components}
          recordMap={recordMap}
          rootPageId={site?.rootNotionPageId}
          rootDomain={site?.domain}
          fullPage={false}
          previewImages={!!recordMap?.preview_images}
          showCollectionViewDropdown={false}
          showTableOfContents={false} //  config.defaultShowTableOfContents
          minTableOfContentsItems={false} //  config.defaultMinTableOfContentsItems
          defaultPageIcon={config.defaultPageIcon}
          defaultPageCover={config.defaultPageCover}
          defaultPageCoverPosition={config.defaultPageCoverPosition}
          mapPageUrl={siteMapPageUrl}
          mapImageUrl={mapImageUrl}
          // searchNotion={config.isSearchEnabled ? searchNotion : null}
        />

      </LayoutPost>

      <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
  </LayoutDefault>
}
