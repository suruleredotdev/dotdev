import { parsePageId } from "components/LayoutDefault";
import { getComponents } from "components/NotionComponents";

export function getLayoutProps({ site, recordMap, pageId }) {
  const keys = Object.keys(recordMap?.block || {});
  const block = recordMap?.block?.[pageId || keys[0]]?.value;

  const isRootPage =
    parsePageId(block?.id) === parsePageId(site?.rootNotionPageId); // ||
  // window.location.href === "/";

  // TODO: use recordMap?.block[block?.parent_id].title == "Posts"
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
      components: getComponents(),
    },
  };
}
