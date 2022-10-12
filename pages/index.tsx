import * as React from 'react'
import * as config from "lib/config";
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { useDarkMode } from "lib/use-dark-mode";
import { mapPageUrl } from "lib/map-page-url";
import { LayoutDefault, parsePageId } from 'components/LayoutDefault'
import { Footer } from 'components/Footer'
import { getComponents, getNotionProps } from 'components/NotionComponents'
import {
  NotionContextProvider,
} from "react-notion-x";
import { HomePageContent } from 'components/PageHome'
import { getLayoutProps } from 'lib/get-layout-props';

// https://nextjs.org/docs/basic-features/data-fetching/get-static-props
export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(config.domain)
    console.log("STATIC PROPS: index", { domain:config.domain, props })

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', config.domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

const IndexPage: React.FC<any> = (props) => {
  const {
    site,
    recordMap,
    error,
    pageId,
  } = props

  console.log("IndexPage", { props })

  const { isDarkMode } = useDarkMode();

  const {
    block,
    isRootPage,
    isBlogPost, // TODO: strip this out, in favor of [pageId]
    showTableOfContents,
    minTableOfContentsItems,
    notionProps,
  } = getLayoutProps(props)

  const { components } = notionProps;
  
  console.log({ isBlogPost })

  return <LayoutDefault {...props} >
      <NotionContextProvider
        components={components}
        recordMap={recordMap}
        mapPageUrl={mapPageUrl}
        darkMode={isDarkMode}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        showTableOfContents={false} //  config.defaultShowTableOfContents
        minTableOfContentsItems={false} //  config.defaultMinTableOfContentsItems
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        zoom={false}
      >
      <HomePageContent
        site={site}
        recordMap={recordMap}
        error={error}
        pageId={pageId}
        rootPageBlock={block}
      ></HomePageContent>

        <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
      </NotionContextProvider>
  </LayoutDefault>
}
export default IndexPage