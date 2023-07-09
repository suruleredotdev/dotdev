import * as React from "react";
import { GetStaticProps } from "next";
import { ExtendedRecordMap } from "notion-types";
import NextHead from "next/head";
import { getPageProperty } from "notion-utils";

import { NotionRenderer, NotionComponents } from "react-notion-x";

import * as config from "lib/config";
import { domain } from "lib/config";
import { getSiteMap } from "lib/get-site-map";
import { resolveNotionPage } from "lib/resolve-notion-page";
import { PageProps, Params } from "lib/types";
import { LayoutDefault, parsePageId } from "components/LayoutDefault";
import { LayoutPost } from "components/LayoutPost";
import { Footer } from "components/Footer";
import { getLayoutProps } from "lib/get-layout-props";

import { log } from "lib/log";

export default function DynamicPostPage(props: PageProps) {
  const { recordMap, pageId: postPageId } = props;

  const { block, isBlogPost, notionProps } = getLayoutProps(props);

  log("DEBUG", "DynamicPostPage", { props, block_id: block?.id, isBlogPost });

  const { components } = notionProps;

  const title = block?.properties?.title;
  const description = getPageProperty(
    "description",
    block,
    recordMap
  ) as string;
  return (
    <LayoutDefault {...props}>
      <NextHead>
        <title>{title} - surulere.dev</title>
        <meta property="og:url" content="http://surulere.dev/" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={"/favicon.png"} />
      </NextHead>

      <LayoutPost
        recordMap={recordMap}
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
  );
}

// based on NotionBlockRenderer
export const PostRenderer: React.FC<{
  className?: string;
  bodyClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  disableHeader?: boolean;
  blockId?: string;
  hideBlockId?: boolean;
  level?: number;
  recordMap: ExtendedRecordMap;
  components: Partial<NotionComponents>;
}> = ({ level = 0, blockId, recordMap, components }) => {
  const id = blockId || Object.keys(recordMap?.block || {})[0];
  const block = recordMap?.block[id]?.value;

  log("DEBUG", "PostRenderer 0", {
    id,
    block,
    recordMap,
    level,
  });

  if (!block) {
    if (process.env.NODE_ENV !== "production") {
      log("DEBUG", "missing block", blockId);
    }

    return null;
  }

  log("DEBUG", "PostRenderer", {
    content: block?.content?.map((contentId) => {
      return recordMap?.block[contentId]?.value; //{ id, parent_id, type }
    }),
  });

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
        <NotionRenderer
          key={contentBlockId}
          recordMap={recordMap}
          fullPage={false}
          darkMode={false}
          blockId={contentBlockId}
          components={components}
        />
      ))}
    </span>
  );
};

// used to render page at build time
// https://nextjs.org/docs/basic-features/data-fetching/get-static-props
export const getStaticProps: GetStaticProps<PageProps, Params> = async ({
  params,
}) => {
  const siteMap = await getSiteMap();

  // if param.pageId might be slug excluding ID, use canonicalPageMap to convert to UUID
  const rawPageId = siteMap.canonicalPageMap[params.pageId] || params.pageId;

  const pageId: string = parsePageId(rawPageId, { uuid: true }) as string;

  try {
    const props: PageProps = await resolveNotionPage(config.domain, pageId);

    return { props: { ...props, pageId }, revalidate: 10 };
  } catch (err) {
    console.error("page error", domain, pageId, err);

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err;
  }
};

// https://nextjs.org/docs/basic-features/data-fetching/get-static-paths
export async function getStaticPaths() {
  // if (isDev) {
  //   return {
  //     paths: [],
  //     fallback: true
  //   }
  // }

  const siteMap = await getSiteMap();

  log("DEBUG", "pages/pageId: SITEMAP", siteMap);

  const staticPaths = {
    paths: Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
      params: {
        pageId,
      },
    })),
    // paths: [],
    fallback: true,
  };

  return staticPaths;
}
