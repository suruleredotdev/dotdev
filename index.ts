/*
Jake Teton‑Landis
Perfection enthusiast and byte craftsman in Miami, FL.

Interested in human productivity, big levers, and design.

Github • Twitter • LinkedIn

NOTES
Show total prices on Airbnb
macOS Text Substitution
Observing NextJS in Production
Cozy Server
goto
PROJECTS
@jitl/notion-api
quickjs-emscripten
Teeveed
Grooveshark Desktop
WORK
Notion Labs, Inc
Airbnb
Residential Computing at UC Berkeley
Resume
AtOnce Sales Software

@jitl/notion-api
Github | Full API Documentation | NPM Package

February 2022

Github • Full API Documentation • NPM

@jitl/notion-api is the missing companion library for the official Notion public API. I wrote this library to power my website, https://jake.tl, and decided to share it with the world.

Use Notion as a headless content management system, a la Contentful or Sanity.

Recursively fetch page content while building backlinks.

Convenient types like Page, Block ..., plus helpers for tasks like iterating paginated API results.

Image, emoji, and content caching specifically designed for NextJS and incremental static regeneration, so your static site builds stay fast even as you add pages.

Note that this is not an official Notion product. The library is currently unstable as I iterate on it. Use a fully specified version number or pin with yarn.lock, package-lock.json, to avoid unexpected changes.

Even if you’re not a Notion public API user (or you don’t want to commit to a hobby library), the source code offers interesting examples of advanced Typescript types.

Learn more about the project from the README.

Backstory
Okay, so we know Notion is great for writing. Right? Or at least, we can agree that it’s easier to write in Notion than in a plain-text markdown editor. And it’s easier to just write into a Notion doc than to write that markdown page, commit it to git, push it up to Github dot com, etc etc etc. Right?

Right.

So, I want to write more. I want to make it easy for myself to write. So, like any other red-blooded software engineer, I set out to port my website writing experience to Notion’s API.

Why is building a website on Notion so hard?
There’s two big issues with building a website on Notion’s public API:

The API only works on the server, and is optimized for incrementally retrieving content.

There’s no way to say “give me the whole page as a single chunk”. You need to load the page’s children incrementally in pages, and work your way bread-first down the tree of blocks. Doing all that loading at render time would be slow, and if you were doing it from a front-end component that fetches while rendering, your users could be waiting a looong time for the whole page to show up.

Links to images stored by Notion are only valid for 1 hour.

There’s a good reason for this — Notion is trying to balance API usability with protecting whatever private images you might read with the API. But, it does throw a 200lb wrench into any plan to cache blocks returned from the Notion public API, if you still wanna render those images.

It’s not too troublesome to overcome these issues for a completely static site, with an up-front build. But how do we work around these issues if we also want to support incremental static regeneration on Vercel serverless hosting?

Solving page data loading
The solution to our first problem is pretty straight forward. We’ll fetch and cache all the blocks in each page once, at build-time, so our website can render instantly. We’ll also transform the block data for React-friendly recursive rendering.

When you fetch a page at build time through @jitl/notion-api’s content APIs, its content is written to disk as a single JSON file. If you fetch the same page again - during the same build or later at runtime - we’ll check its last_edited_time timestamp against the Notion API, and only re-download its content blocks if the page has changed.

This caching technique works equally well for local development and incremental static regeneration.

Solving image hosting
@Cory Etzkorn wrote a great, in-depth blog post about rebuilding his site with Notion, and he covers dealing with the image hosting problem:

There are essentially three options:

Use getServerSideProps instead of getStaticProps to ensure a new and valid image URL is returned on each page visit.

Write a script that crawls all posts for image blocks, downloads the images, and places them in the /public directory.

Use getStaticProps and incremental static regeneration to crawl an individual post’s blocks at request and upload the image assets to your own S3 bucket.

[...] I ended up going with option #3, but it was a lot of work to implement. Unless you want to burn 8 hours, I’d recommend going with getServerSideProps for now.

I’ve come up with a new approach that performs really well without any complicated build steps. All you need is a single API route, and a CDN that uses cache-control headers. If you host your site on Vercel, you already have everything you need — no AWS account required 😜. Here’s how it works:

Instead of downloading or uploading images manually, we’ll implement a custom API route called /api/notion-asset. This API's parameters are a pointer to an asset somewhere in Notion, like “get the icon of page ID XXXX” or “get the image of block ID YYYY”. For example, the cover of this page is /api/notion-asset/page/e4190820-9977-480d-8a60-1f51858ac6c4/cover?last_edited_time=2022-04-10T18%3A59%3A00.000Z.

On each request, the API fetches the relevant content from the Notion API to get a fresh asset URL. Then the API downloads the asset and returns it directly as the response, while adding a cache-control header so that the CDN will change the image forever. If we know the page’s last_edited_time timestamp, we can add that to any of our requests to “bust” the cache when the page changes. This technique also works well with NextJS’s built-in image optimization which adds another layer of caching and performance to your Notion-hosted images.

The /api/notion-assets handler doesn’t come pre-assembled in @jitl/notion-api yet, but it’s easy to implement it yourself. You’ll find my version below.

Putting it together with NextJS
To build a NextJS website (like this one) on top of @jitl/notion-api is a three-part process.

Set up the CMS API
First we need to set up our data access and caching layer. We’ll use a CMS instance to pull down content from the Notion API at build time, and on the server.

Make a new file that will only be used on the server. I put mine in lib/notion.ts. In this file, set up your Notion API client using a server-side environment variable.

*/

const notion = new NotionClient({
  logLevel: LogLevel.DEBUG,
  logger: NotionClientDebugLogger,
  auth: process.env.NOTION_SECRET,
})

/*
Create and export one more more CMS instances, one for each Notion database that contains pages you want to publish on your website.

Specify the schema option to make accessing page properties easier.

Set slug to a page property that has a unique URL suffix for each page in the DB.

Set up cache so the CMS caches Notion page data on disk. I suggest .next/cache/notion, so page data caching works across builds on Vercel.

Set up assets so the CMS can download assets during build. Put these in ./public so you can serve the ones that were pre-fetched at build time.

Here’s the full source code for the CMS instance that powers this site:
*/

export const NotionPages = new CMS({
  database_id: process.env.NOTION_DATABASE,
  notion, // API client we set up before
  schema: inferDatabaseSchema({
    // inferDatabaseSchema adds "name" where unspecified.
    Slug: { type: "rich_text" },
    Publish: { type: "checkbox" },
    Timeframe: { type: "rich_text" },
    Section: { type: "select" },
    MetaTitle: {
      name: "Meta Title",
      type: "rich_text",
    },
    MetaDescription: {
      name: "Meta Description",
      type: "rich_text",
    },
    MenuOrder: {
      name: "Menu Order",
      type: "number",
    },
  }),
  slug: "Slug",
  visible: "Publish",
  getFrontmatter: ({ page, properties, defaultFrontmatter: { slug } }) => {
    // Transform your DB properties to a format convinient to use in your
    // renderers. I convert Notion's rich text to plain text a lot.
    const props = {
      icon: page.icon
        ? getAssetRequestPath(
            {
              object: "page",
              id: page.id,
              field: "icon",
            },
            page.last_edited_time
          )
        : undefined,
      cover: page.cover
        ? getAssetRequestPath(
            {
              object: "page",
              id: page.id,
              field: "cover",
            },
            page.last_edited_time
          )
        : undefined,
      timeframe: richTextAsPlainText(properties.Timeframe),
      meta_title: richTextAsPlainText(properties.MetaTitle),
      meta_description: richTextAsPlainText(properties.MetaDescription),
      menu_order: properties.MenuOrder || undefined,
      section: properties.Section?.name.toLocaleLowerCase() || "notes",
    };

    return {
      ...props,
      httpRoute: `/${props.section}/${slug}`,
    };
  },
  cache: {
    directory: path.resolve(".next/notion-cache"),
  },
  assets: {
    directory: path.resolve("public/notion-assets"),
    downloadExternalAssets: true,
  },
});


/*
Put together an asset strategy
You’ll need some special logic to transform any asset references like images blocks, icons, page covers, etc, that link to Notion’s S3 storage to URLs that you own — since the Notion URL will only work for one hour!

This task breaks down into two parts:

Write a function like getAssetPath(...) that takes a notion asset, and returns a suitable URL for that asset on your website.

Put together the machinery that makes those asset paths work.

Static site only (next export)
We need to make sure all the assets end up inside ./public. You should already have configured your CMS to download assets into the public folder by setting assets.directory to a path inside public. During your build, you need to call cms.downloadAssets(page) on each page.

Then in getProps, generate links to each asset using a function like this:
*/

export function getAssetPath(cms: CMS<unknown>, assetRequest: AssetRequest) {
  const assets = cms.assets
  if (!assets) throw new Error("Assets not configured")
  const filename = asset.fromCache(assetRequest)
  if (!filename) return undefined
  return `/notion-assets/${filename}`
}

/*
Incremental static generation
For sites that support an API route, I recommend the technique described above in “Solving image hosting.” This is the strategy I use.

We’ll need to build a custom API route to serve the assets into your Content Delivery Network for fast caching. Then we’ll generate links to that API route instead of linking directly to any URL returned from the Notion API.

For my NextJS site, I made a directory called notion-asset inside pages/api, and named my API file [...asset_request].ts. Here’s my API handler, verbatim:
*/

import * as https from "https";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import send from "send";

import { parseAssetRequestQuery, ParsedAssetRequest } from "@jitl/notion-api";
import { assertDefined, unreachable } from "@jitl/util";

import { notion, NotionPages } from "../../../lib/notion";

const IMMUTABLE = "public, max-age=31536000, immutable";
const REVALIDATE = "public, s-maxage=59, stale-while-revalidate";

const getNotionAsset: NextApiHandler = async (req, res) => {
  const assetRequest = parseAssetRequestQuery(req.query as any);
  const isVercel = Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL_ANALYTICS_ID
  );
  const isCI = Boolean(process.env.CI);
  console.log("Asset request handler", assetRequest, "meta:", {
    isVercel,
    isCI,
  });
  if (isVercel && !isCI) {
    // On Vercel, filesystem is read-only.
    await getNotionAssetUsingNetwork(req, res, assetRequest);
  } else {
    await getNotionAssetUsingDisk(req, res, assetRequest);
  }
};

async function getNotionAssetUsingDisk(
  req: NextApiRequest,
  res: NextApiResponse,
  parsedAssetRequest: ParsedAssetRequest
) {
  const { assetRequest } = parsedAssetRequest;
  const { assets } = NotionPages;
  assertDefined(assets);

  const relativePath = await assets.downloadAssetRequest({
    request: assetRequest,
    cache: NotionPages.notionObjects,
    notion,
  });

  if (!relativePath) {
    console.log("Not found:", assetRequest);
    res.writeHead(404, "Asset not found")
		res.end()
    return;
  }

  const stream = send(req, relativePath, {
    cacheControl: false,
    index: false,
    root: assets.config.directory,
  });

  res.setHeader(
    "Cache-Control",
    getSuccessCacheControlHeader(parsedAssetRequest)
  );

  return new Promise((resolve) => {
    stream.pipe(res).on("finish", resolve);
  });
}

async function getNotionAssetUsingNetwork(
  req: NextApiRequest,
  res: NextApiResponse,
  parsedAssetRequest: ParsedAssetRequest
) {
  const { assetRequest } = parsedAssetRequest;
  const { assets } = NotionPages;
  assertDefined(assets);

  const asset = await assets.performAssetRequest({
    cache: NotionPages.notionObjects,
    notion,
    request: assetRequest,
  });

  if (!asset) {
    console.log("Not found:", assetRequest);
    res.writeHead(404, "Asset not found").end();
    return;
  }

  let url: string | undefined;
  switch (asset.type) {
    case "emoji": {
      console.log("Cannot serve emoji:", asset);
      res.writeHead(404, "Emoji not found")
			res.end()
      return;
    }
    case "external":
      url = asset.external.url;
      break;
    case "file":
      url = asset.file.url;
      break;
    default:
      unreachable(asset);
  }

  return new Promise<void>((resolve, reject) => {
    if (!url) {
      console.log("URL somehow undefined:", asset);
      res.writeHead(404, "Asset not found")
			res.end()
      reject();
      return;
    }

    https.get(url, (getResponse) => {
      const proxyHeader = (header: string) => {
        const value =
          getResponse.headers[header] ||
          getResponse.headers[header.toLowerCase()];
        if (value) {
          res.setHeader(header, value);
        }
      };

      proxyHeader("Content-Type");
      proxyHeader("Content-Length");

      if (getResponse.statusCode === 200) {
        res.setHeader(
          "Cache-Control",
          getSuccessCacheControlHeader(parsedAssetRequest)
        );
        res.writeHead(200, "OK");
      } else {
        res.status(getResponse.statusCode || 500);
      }

      getResponse
        .pipe(res)
        .on("end", () => {
          res.end();
          resolve();
        })
        .on("error", (err) => {
          console.log("Pipe error", err);
          res.writeHead(500, err.toString());
					res.end()
          reject(err);
        });
    });
  });
}

function getSuccessCacheControlHeader(assetRequest: ParsedAssetRequest) {
  if (assetRequest.last_edited_time) {
    return IMMUTABLE;
  } else {
    return REVALIDATE;
  }
}

export default getNotionAsset;

/*()
Use the CMS to render pages
Once your CMS is configured, you can use it to get Notion data to render your pages.

Create a new NextJS page file to render your content, like pages/notion/[slug].tsx.

In getStaticPaths, query the CMS instance for all the pages you want to display. Return the slug of each page. You can also download all the page’s assets here, since it will only run during build time.
*/
type PageParams = { slug: string }
export const getStaticPaths: GetStaticPaths<PageParams> = async () => {
  const params: Array<{ params: PageParams }> = []
	for await (const page of NotionPages.query({
    sorts: [
      NotionPages.sort.Section.ascending,
      NotionPages.sort.MenuOrder.ascending,
      NotionPages.sort.created_time.descending,
      NotionPages.sort.Slug.descending,
    ],
  })) {
    await NotionPages.downloadAssets(page);
    params.push({
      params: {
        slug: page.frontmatter.slug,
      },
    });
  }}
  return { paths: params, fallback: false }
}
/*
In getStaticProps, load the page from the CMS based on the slug. Transform the page’s Notion data into something your React components can understand. For my website, I transform the page contents into Markdown using mdast. This lets me re-use the same page rendering logic for both Notion and markdown page types.

Two things to pay attention to here are:

You’ll need some special logic to transform any asset references like images blocks, icons, page covers, etc, that link to Notion’s S3 storage either into a URL to an asset in your ./public folder (if you don’t need incremental regeneration), or to a URL to a NextJS API to serve asset data live (if you want incremental regeneration).

I do this re-mapping of assets during my Notion → Markdown transform process.

If you link between Notion pages, be sure to map those Notion mentions or links to page URLs on your own website.

My process is complex and a little ugly. Here’s a simplified sketch of how this works:
*/

export const getStaticProps: GetStaticProps<
  PageProps,
  PageParams
> = async (context) => {
  const { slug } = context?.params || {}
  if (!slug) { throw new Error('slug mising')
  
  const notionPage = NotionPages.loadPageBySlug(slug)
  if (!notionPage) {
    return { notFound: true }
  }

  return { props: await getPropsFromNotionPage(notionPage) }
}
/*
Ready to ship?
If you’ve made it this far, you’re ready to publish Notion pages to your NextJS site. Your builds will automatically cache both Notion page blocks and any images you need. You can also link to page icons, render image blocks, and more without worrying about broken images or image upload scripts.

As for me, I’m very excited to have a frictionless writing experience for my website for the first time. I’ll continue to update @jitl/notion-api with more features as they stabilize on my site.

Happy building! Let me know via Github issue or on Twitter if this library brings you joy, grief, or any other emotion.


*/