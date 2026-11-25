import * as React from "react";
import Head from "next/head";
import BodyClassName from "react-body-classname";

import { getSitePosts } from "lib/get-site-posts";
import * as config from "lib/config";
import { resolveNotionPage } from "lib/resolve-notion-page";
import { resolveArenaChannels } from "lib/resolve-arena-channels";
import { resolveResearchAreas, AreaChannel } from "lib/resolve-research-areas";
import { getSubstackEssays } from "lib/get-substack-essays";
import { getSiteMap } from "lib/get-site-map";
import { useDarkMode } from "lib/use-dark-mode";
import { essayAreas, hero, AreaKey } from "lib/home-content";

import { Page, suUiHref } from "components/su";
import { HomeTopBar, HomeHero, ResearchAreas, Essays, Tools, HomeFooter, HomeEssay } from "components/home/Home";
import styles from "components/home/home.module.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

// https://nextjs.org/docs/basic-features/data-fetching/get-static-props
export const getStaticProps = async () => {
  try {
    const notionProps = await resolveNotionPage(config.domain);
    const channels = await resolveArenaChannels();
    const siteMap = await getSiteMap();

    const substackHandle = process.env.SUBSTACK_HANDLE || "suruleredotdev";
    const substackApiKey = process.env.SUBSTACK_API_KEY;
    const substackEssays = await getSubstackEssays(substackHandle, 10, substackApiKey);

    // Public Notion posts live on this site; Substack essays link out.
    const pathForId = Object.fromEntries(
      Object.entries(siteMap.canonicalPageMap).map(([path, id]) => [id as string, path])
    );
    const notionPosts: HomeEssay[] = (getSitePosts({ recordMap: (notionProps as any).recordMap }) || [])
      .filter((post: any) => post.public == true && pathForId[post.id])
      .map((post: any) => {
        // Paths can carry the page id ("nigeria-agriculture-3996a2a9…"); the
        // mapping uses the readable part.
        const area = essayAreas[pathForId[post.id].replace(/-[0-9a-f]{32}$/, "")];
        return {
          id: post.id,
          // Notion titles are rich text: [["Title", …decorations]]
          title: Array.isArray(post.title) ? post.title.map((part: any) => part[0]).join("") : String(post.title || ""),
          href: `${base}/${pathForId[post.id]}`,
          external: false,
          published: post.published,
          ...(area ? { area } : {}),
        };
      });
    const substack: HomeEssay[] = substackEssays.map((e) => {
      const slug = e.url.split("/p/")[1]?.replace(/[/?#].*$/, "") || "";
      const area = essayAreas[slug];
      return {
        id: `substack-${e.id}`,
        title: e.title,
        href: e.url,
        external: true,
        published: e.published,
        ...(area ? { area } : {}),
      };
    });
    const essays = [...notionPosts, ...substack].sort((a, b) => b.published - a.published);

    const props: HomePageProps = {
      essays,
      areaChannels: resolveResearchAreas(channels),
    };
    return { props, revalidate: 3600 };
  } catch (err) {
    console.error("page error", config.domain, err);
    // Don't publish an error version of the homepage.
    throw err;
  }
};

interface HomePageProps {
  essays: HomeEssay[];
  areaChannels: Partial<Record<AreaKey, AreaChannel | null>>;
}

const IndexPage: React.FC<HomePageProps> = ({ essays, areaChannels }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  // Until hydration the page follows the OS theme (no data-theme), so the
  // server and first client render match; then the stored choice applies.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const theme = mounted ? (isDarkMode ? "dark" : "light") : undefined;

  return (
    <>
      <Head>
        <title>surulere.dev</title>
        <meta name="description" content={hero.description} />
        {/* next/head keeps only its direct children on the client, so the links are written out. */}
        <link rel="stylesheet" href={suUiHref("su-tokens.css", base)} />
        <link rel="stylesheet" href={suUiHref("su-components.css", base)} />
      </Head>
      {/* The theme sits on the page wrapper, not on <body> as .LIGHT/.DARK:
          the site's older global link colours key off those classes. */}
      <BodyClassName className="sans-serif" />
      <Page className={styles.home} data-theme={theme}>
        <HomeTopBar isDark={theme === "dark"} onToggleTheme={toggleDarkMode} />
        <HomeHero latest={essays[0]} />
        <main>
          <ResearchAreas essays={essays} channels={areaChannels} />
          <Essays essays={essays} />
          <Tools />
        </main>
        <HomeFooter />
      </Page>
    </>
  );
};

export default IndexPage;
