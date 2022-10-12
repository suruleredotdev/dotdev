import { parsePageId } from "components/LayoutDefault";
import { getComponents } from "components/NotionComponents";

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