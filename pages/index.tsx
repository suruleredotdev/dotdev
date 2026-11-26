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
import { getHomeConfig, HomeConfig } from "lib/home-config";
import { buildResearchAreas, ResearchArea } from "lib/research-areas";

import { LayoutDefault } from "components/LayoutDefault";
import { Footer } from "components/Footer";
import {
  ArchivesSection,
  EssaysSection,
  HomeEssay,
  SectionLinks,
  ToolsSection,
} from "components/HomeSections";
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
    const home = getHomeConfig();

    const substackHandle = process.env.SUBSTACK_HANDLE || "suruleredotdev";
    const substackApiKey = process.env.SUBSTACK_API_KEY;
    const substackEssays = await getSubstackEssays(substackHandle, 10, substackApiKey);

    const props = {
      ...notionProps,
      siteMap,
      substackHandle,
      substackEssays,
      home,
      areas: await buildResearchAreas(channels, home.archives),
    };

    return { props, revalidate: 3600 }; // Revalidate every hour for fresh Substack content
  } catch (err) {
    console.error("page error", config.domain, err);

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err;
  }
};

interface HomePageContentProps extends types.PageProps {
  substackHandle?: string;
  substackEssays?: SubstackEssay[];
  home: HomeConfig;
  areas: ResearchArea[];
}

export const HomePageContent: React.FC<HomePageContentProps> = ({
  recordMap,
  siteMap,
  substackHandle = "suruleredotdev",
  substackEssays = [],
  home,
  areas,
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

  const essays: HomeEssay[] = [
    ...(posts ?? [])
      .filter((post: any) => post.public == true)
      .map((post: any) => ({
        title: post.title,
        description: post.description,
        published: post.published,
        href: "/" + idToPagePath[post.id],
        isExternal: false,
      })),
    ...substackEssays.map((essay) => ({
      title: essay.title,
      description: essay.description,
      published: essay.published,
      href: essay.url,
      isExternal: true,
    })),
  ].sort((a, b) => b.published - a.published);

  const substackUrl = `https://${substackHandle}.substack.com/`;

  return (
    <div id="content" className={classes.content}>
      <div id="about" className="home-hero">
        <p className={classes.tagline}>{home.hero.tagline}</p>
        <p className={classes.description}>{home.hero.description}</p>
        <SectionLinks
          links={[
            { id: "essays", label: home.essays.title },
            { id: "tools", label: home.tools.title },
            { id: "archives", label: home.archives.title },
          ]}
        />
      </div>

      {essays.length > 0 ? (
        <EssaysSection essays={essays} config={home.essays} substackUrl={substackUrl} />
      ) : (
        <iframe
          src={`https://${substackHandle}.substack.com/embed`}
          width="100%"
          height="320"
          style={{
            border: "1px solid #eee",
            background: "white",
            maxWidth: "480px",
            display: "block",
            margin: "1rem 0",
          }}
          frameBorder="0"
          scrolling="no"
        />
      )}

      <ToolsSection config={home.tools} />

      <ArchivesSection areas={areas} config={home.archives} />
    </div>
  );
};

interface IndexPageProps {
  site: any;
  recordMap: any;
  error?: any;
  pageId?: string;
  siteMap: any;
  substackHandle?: string;
  substackEssays?: SubstackEssay[];
  home: HomeConfig;
  areas: ResearchArea[];
}

const IndexPage: React.FC<IndexPageProps> = (props) => {
  const {
    site,
    recordMap,
    error,
    pageId,
    siteMap,
    substackHandle,
    substackEssays,
    home,
    areas,
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
          substackHandle={substackHandle}
          substackEssays={substackEssays}
          home={home}
          areas={areas}
        ></HomePageContent>
        <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
      </NotionContextProvider>
    </LayoutDefault>
  );
};
export default IndexPage;
