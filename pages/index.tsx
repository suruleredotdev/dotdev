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
import { LayoutPost } from 'components/LayoutPost'

export function getLayoutProps({
    site,
    recordMap,
    error,
    pageId,
  }) {
  // const isLiteMode = lite === 'true'

  // const searchParams = new URLSearchParams('') // window.location.search
  // const siteMapPageUrl = React.useMemo(() => {
  //   const params: any = {}
  //   if (lite) params.lite = lite

  //   return mapPageUrl(site, recordMap, searchParams)
  // }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {});
  const block = recordMap?.block?.[keys[0]]?.value;

  const isRootPage =
    parsePageId(block?.id) === parsePageId(site?.rootNotionPageId) ||
    window.location.href === "/";

  // TODO: to LayoutPost
  const isBlogPost =
    block?.type === "page" && block?.parent_table === "collection";

  const showTableOfContents = !!isBlogPost;
  const minTableOfContentsItems = 3;

  return {
    block,
    isRootPage,
    isBlogPost,
    showTableOfContents,
    minTableOfContentsItems,
    notionProps: {
      components: getComponents()
    },
  }
}

const IndexPage: React.FC<any> = (props) => {
  const {
    site,
    recordMap,
    error,
    pageId,
  } = props
  // const router = useRouter()
  // const lite = useSearchParam('lite')

  const { isDarkMode } = useDarkMode();
  // const isLiteMode = lite === 'true'

  // const searchParams = new URLSearchParams('') // window.location.search
  // const siteMapPageUrl = React.useMemo(() => {
  //   const params: any = {}
  //   if (lite) params.lite = lite

  //   return mapPageUrl(site, recordMap, searchParams)
  // }, [site, recordMap, lite])

  const {
    block,
    isRootPage,
    isBlogPost,
    showTableOfContents,
    minTableOfContentsItems,
    notionProps,
  } = getLayoutProps(props)

  const { components } = notionProps;
  
  console.log({ isBlogPost })

  const content = isRootPage ? (
    <HomePageContent
      site={site}
      recordMap={recordMap}
      error={error}
      pageId={pageId}
      rootPageBlock={block}
    ></HomePageContent>
  ) : isBlogPost ? (
    <LayoutPost
      site={site}
      recordMap={recordMap}
      error={error}
      pageId={pageId}
    />
  )
  : (
    blockToContent(block, recordMap, {
      notionProps,
      site,
      isRootPage,
      isBlogPost,
      showTableOfContents,
      minTableOfContentsItems,
    })
  );

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
        {content}

        <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
      </NotionContextProvider>
  </LayoutDefault>
}
export default IndexPage

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(config.domain)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', config.domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function blockToContent(
  block: any,
  recordMap,
  args: {
    notionProps: any;
    site: types.Site;
    isRootPage: any;
    isBlogPost: boolean;
    showTableOfContents: boolean;
    minTableOfContentsItems: number;
  }
) {
  const {
    pageId,
    isDarkMode,
    socialImage,
    socialDescription,
    darkMode,
    components,
    fullPage,
    mapPageUrl: siteMapPageUrl,
    mapImageUrl,
    searchNotion,
    pageAside,
    footer,
  } = args.notionProps;
  return (
    <NotionRenderer
      bodyClassName={
        (styles.notion, pageId === site.rootNotionPageId && "index-page")
      }
      darkMode={isDarkMode}
      components={components}
      recordMap={recordMap}
      rootPageId={site.rootNotionPageId}
      rootDomain={site.domain}
      fullPage={false}
      previewImages={!!recordMap.preview_images}
      showCollectionViewDropdown={false}
      showTableOfContents={false} //  config.defaultShowTableOfContents
      minTableOfContentsItems={false} //  config.defaultMinTableOfContentsItems
      defaultPageIcon={config.defaultPageIcon}
      defaultPageCover={config.defaultPageCover}
      defaultPageCoverPosition={config.defaultPageCoverPosition}
      mapPageUrl={siteMapPageUrl}
      mapImageUrl={mapImageUrl}
      searchNotion={config.isSearchEnabled ? searchNotion : null}
      pageAside={pageAside}
      footer={footer}
    />
  );
}