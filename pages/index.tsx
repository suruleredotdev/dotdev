import * as React from "react";
import { NotionContextProvider } from "react-notion-x";

import * as types from "lib/types";
import { getSitePosts } from "lib/get-site-posts";
import * as config from "lib/config";
import { resolveNotionPage } from "lib/resolve-notion-page";
import { resolveArenaChannels } from "lib/resolve-arena-channels";
import { useDarkMode } from "lib/use-dark-mode";
import { mapPageUrl } from "lib/map-page-url";
import { getLayoutProps } from "lib/get-layout-props";
import { getSiteMap } from "lib/get-site-map";

import { LayoutDefault } from "components/LayoutDefault";
import { Footer } from "components/Footer";
import { ArenaChannel } from "components/Arena";
// NOTE: simple styling classlist strings w tachyons. may upgrade to be more configurable
import {
  globalClasses,
  layoutDefaultClasses,
  StyleClasses,
} from "components/styles";

const classes: StyleClasses = {
  ...globalClasses,
  ...layoutDefaultClasses,
};

// https://nextjs.org/docs/basic-features/data-fetching/get-static-props
export const getStaticProps = async () => {
  try {
    const notionProps = await resolveNotionPage(config.domain);
    const channels = await resolveArenaChannels();
    const siteMap = await getSiteMap();
    const props = {
      ...notionProps,
      channels,
      siteMap,
    };

    return { props, revalidate: 1 };
  } catch (err) {
    console.error("page error", config.domain, err);

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err;
  }
};

const homePageText = [
  {
    tagline: "A space for critical thinking on African future",
    description:
      "Essays and visualizations to help us think critically about our ever-changing reality in the 2020s and build a better future for  ourselves.",
  },
  {
    tagline: "",
    description: "",
  },
];
const textVersion = 0;

export const HomePageContent: React.FC<types.PageProps> = ({
  site,
  recordMap,
  pageId,
  channels,
  siteMap,
}) => {
  // TODO: render from root page block
  const posts = getSitePosts({
    recordMap,
  });

  const idToPagePath = Object.keys(siteMap.canonicalPageMap).reduce(
    (acc, pagePath) => ({
      ...acc,
      [siteMap.canonicalPageMap[pagePath]]: pagePath,
    }),
    {}
  );

  return (
    <div id="content" className={classes.content}>
      <div id="about pb5">
        <p className={classes.tagline}>{homePageText[textVersion].tagline}</p>

        <p className={classes.description}>
          {homePageText[textVersion].description}
        </p>
      </div>

      <b className={classes.postsTitle}>ESSAYS</b>
      {/* {JSON.stringify(posts.slice(0, 3), null, 2)} */}
      <ul className={classes.postsList}>
        {posts
          ?.sort((a, b) => b.published - a.published)
          .filter((post) => post.public == true)
          .map((post, i) => (
            <p key={i}>
              <a
                className={classes.postLink}
                href={"/" + idToPagePath[post.id]}
              >
                {post.title}
              </a>
              <span className={classes.postDescription}>
                {post.description?.length > 200
                  ? post.description?.substring(0, 197) + "..."
                  : post.description}
              </span>

              <small className={classes.postDate}>
                &nbsp; &mdash;{" "}
                {new Date(post.published).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </small>
              {post.tags ? (
                <>
                  {/* TODO: implement tags
                  <br />
                  {post.tags?.map((tag, i) => (
                    <a
                      key={i}
                      className={classes.postTag}
                      href={"/blog/tag/" + tag}
                    >
                      <em>{tag}</em>
                    </a>
                  ))} */}
                </>
              ) : (
                <></>
              )}
            </p>
          ))}
      </ul>
      <br />

      <b className={classes.postsTitle}>ARCHIVES</b>
      <ul className={"f5 pl2 flex flex-column gap-2"}>
        {/* {JSON.stringify((new Map(channels.map(channel => [channel.title, channel])).values().toArray())
          ?.slice(0, 10), null, 2) */}
        {[...new Map(channels.map(channel => [channel.title, channel])).values()]
          .slice(0, 10)
          ?.filter((channel) => 
            !!channel && 
            channel.contents?.some(block => block.base_class === "Block") /* &&
            (channel.user?.slug === "suruleredotdev" || 
             channel.collaborators?.some(collaborator => collaborator.slug === "suruleredotdev")) */
          )
          .map((channel, i) => (
            <ArenaChannel channel={channel} />
          ))}
      </ul>
    </div>
  );
};

const IndexPage: React.FC<any> = (props) => {
  const {
    site,
    recordMap,
    error,
    pageId,
    channels: arenaChannels,
    siteMap,
  } = props;

  const { isDarkMode } = useDarkMode();

  const {
    block,
    isBlogPost, // TODO: strip this out, in favor of [pageId]
    notionProps,
  } = getLayoutProps(props);

  const { components } = notionProps;

  return (
    <LayoutDefault {...props}>
      <NotionContextProvider
        components={components}
        recordMap={recordMap}
        mapPageUrl={mapPageUrl}
        darkMode={isDarkMode}
        previewImages={recordMap.preview_images}
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
          siteMap={siteMap}
          error={error}
          pageId={pageId}
          rootPageBlock={block}
          channels={arenaChannels}
        ></HomePageContent>
        <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
      </NotionContextProvider>
    </LayoutDefault>
  );
};
export default IndexPage;
