import * as React from "react";
import { NotionContextProvider } from "react-notion-x";

import * as types from "lib/types";
import { getSitePosts } from "lib/get-site-posts";
import * as config from "lib/config";
import { resolveNotionPage } from "lib/resolve-notion-page";
import { resolveArenaChannels } from "lib/resolve-arena-channels";
import { getSubstackEssays, SubstackEssay } from "lib/get-substack-essays";
import { useDarkMode } from "lib/use-dark-mode";
import { mapPageUrl } from "lib/map-page-url";
import { getLayoutProps } from "lib/get-layout-props";
import { getSiteMap } from "lib/get-site-map";

import { LayoutDefault } from "components/LayoutDefault";
import { Footer } from "components/Footer";
import { ArenaChannel } from "components/Arena";
import { ExternalLinkIcon } from "components/ExternalLinkIcon";
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

    // Fetch Substack essays - public API works without a key; key is optional enhancement
    const substackHandle = process.env.SUBSTACK_HANDLE || "suruleredotdev";
    const substackApiKey = process.env.SUBSTACK_API_KEY;
    let substackEssays: SubstackEssay[] = [];
    if (substackHandle) {
      substackEssays = await getSubstackEssays(
        substackHandle,
        10,
        substackApiKey
      );
    }

    const props = {
      ...notionProps,
      channels,
      siteMap,
      substackEssays,
      substackHandle,
    };

    return { props, revalidate: 3600 }; // Revalidate every hour for fresh Substack content
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

interface HomePageContentProps extends types.PageProps {
  substackEssays?: SubstackEssay[];
  substackHandle?: string;
}

export const HomePageContent: React.FC<HomePageContentProps> = ({
  site,
  recordMap,
  pageId,
  channels,
  siteMap,
  substackEssays = [],
  substackHandle = "suruleredotdev",
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
      {(() => {
        const allItems = [
          ...posts
            ?.filter((post) => post.public == true)
            .map((post) => ({ ...post, isExternal: false, image: undefined as string | undefined })),
          ...substackEssays.map((essay) => ({
            ...essay,
            isExternal: true,
            id: `substack-${essay.id}`,
          })),
        ].sort((a, b) => b.published - a.published);

        if (allItems.length === 0) {
          // Fallback: Substack embed iframe when no essay data is available
          return (
            <div style={{ margin: "1rem 0" }}>
              <iframe
                src={`https://${substackHandle}.substack.com/embed`}
                width="100%"
                height="320"
                style={{
                  border: "1px solid #eee",
                  background: "white",
                  maxWidth: "480px",
                  display: "block",
                }}
                frameBorder="0"
                scrolling="no"
              />
            </div>
          );
        }

        return (
          <ul className={classes.postsList} style={{ listStyle: "none", padding: 0 }}>
            {allItems.map((item: any, i) => {
              const href = item.isExternal ? item.url : "/" + idToPagePath[item.id];
              const dateStr = new Date(item.published).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <li key={i} style={{ marginBottom: "1.5rem" }}>
                  <a
                    href={href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    style={{ textDecoration: "none", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        style={{
                          width: "72px",
                          height: "56px",
                          objectFit: "cover",
                          flexShrink: 0,
                          borderRadius: "2px",
                          marginTop: "2px",
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className={classes.postLink} style={{ display: "inline" }}>
                        {item.title}
                        {item.isExternal && <ExternalLinkIcon />}
                      </span>
                      <span className={classes.postDate} style={{ fontSize: ".60rem", marginLeft: "0.4rem" }}>
                        &mdash; {dateStr}
                      </span>
                      {item.isExternal && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.55rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            border: "1px solid currentColor",
                            borderRadius: "2px",
                            padding: "0 3px",
                            marginLeft: "0.4rem",
                            opacity: 0.5,
                            verticalAlign: "middle",
                          }}
                        >
                          Substack
                        </span>
                      )}
                      <br />
                      <span className={classes.postDescription}>
                        {item.description?.length > 200
                          ? item.description?.substring(0, 197) + "..."
                          : item.description}
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        );
      })()}
      <br />

      <b className={classes.postsTitle}>TOOLS</b>
      <ul className={"f5 pl2 flex flex-row gap-2 flex-wrap w-100"}>
        {[
          {
            title: "African Artifacts Index",
            url: "https://artifacts-index.surulere.dev",
            image: "/artifacts-index-preview.png",
            description: "Cross-cultural index of museum collections for discovery and comparative analysis",
          },
          {
            title: "Archive 3D",
            url: "https://archive-3d.surulere.dev",
            image: "/archive-3d-preview.jpeg",
            description: "Visualize and explore vector-similar archives in 3D",
          },
          {
            title: "Map Tool",
            url: "https://map-tool.surulere.dev",
            image: "/map-tool-preview.png",
            description: "Simple tool to view and share maps on the web.",
          },
        ].map((tool, i) => (
          <div
            key={i}
            className={`pa1 flex flex-column w-50-ns w-100 mb1 mt1 pr4-l`}
          >
            <a
              className={classes.postLink + " flex flex-column gap-2 pa1"}
              href={tool.url}
              target="_blank"
            >
              <div
                style={{ width: "100%", height: "175px", overflow: "hidden" }}
              >
                <img
                  src={tool.image}
                  alt={tool.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <span className={classes.postLink}>{tool.title}</span>
            </a>

            <span className={classes.postDescription}>
              {tool.description?.length > 200
                ? tool.description?.substring(0, 197) + "..."
                : tool.description}
            </span>
          </div>
        ))}
      </ul>
      <br />

      <b className={classes.postsTitle}>ARCHIVES</b>
      <p className={classes.postDescription}>
        Preview curated references on our research areas. Expand each section or
        click the link to view the full channel.
      </p>
      <ul className={"f5 pl2 flex flex-column gap-2"}>
        {/* {JSON.stringify((new Map(channels.map(channel => [channel.title, channel])).values().toArray())
          ?.slice(0, 10), null, 2) */}
        {[
          ...new Map(
            channels.map((channel) => [channel.title, channel])
          ).values(),
        ]
          .slice(0, 10)
          ?.filter(
            (channel) =>
              !!channel &&
              channel.contents?.some(
                (block) => block.base_class === "Block"
              ) /* &&
            (channel.user?.slug === "suruleredotdev" || 
             channel.collaborators?.some(collaborator => collaborator.slug === "suruleredotdev")) */
          )
          .map((channel, i) => (
            <ArenaChannel channel={channel} key={i} />
          ))}
      </ul>
    </div>
  );
};

interface IndexPageProps {
  site: any;
  recordMap: any;
  error?: any;
  pageId?: string;
  channels: any;
  siteMap: any;
  substackEssays?: SubstackEssay[];
  substackHandle?: string;
}

const IndexPage: React.FC<IndexPageProps> = (props) => {
  const {
    site,
    recordMap,
    error,
    pageId,
    channels: arenaChannels,
    siteMap,
    substackEssays,
    substackHandle,
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
          substackEssays={substackEssays}
          substackHandle={substackHandle}
        ></HomePageContent>
        <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
      </NotionContextProvider>
    </LayoutDefault>
  );
};
export default IndexPage;
