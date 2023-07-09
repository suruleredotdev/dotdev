// global styles shared across the entire site
import "styles/global.css";

// custom styles from original site
import "styles/styles.css";

// tachyons styling system
import "styles/tachyons.css";

// core styles shared by all of react-notion-x (required)
import "react-notion-x/src/styles.css";

// used for rendering equations (optional)
import "katex/dist/katex.min.css";

// used for code syntax highlighting (optional)
import "prismjs/themes/prism-coy.css";

// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'

// global style overrides for notion
import "styles/notion.css";

// global style overrides for prism theme (optional)
import "styles/prism-theme.css";

import * as React from "react";
import * as Fathom from "fathom-client";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import posthog from "posthog-js";

import { bootstrap } from "lib/bootstrap-client";
import {
  isServer,
  fathomId,
  fathomConfig,
  posthogId,
  posthogConfig,
} from "lib/config";

if (!isServer) {
  bootstrap();
}

// NOTE: https://github.com/vercel/next-plugins/issues/282#issuecomment-432127816
// ALT: https://stackoverflow.com/questions/51932288/next-js-stylesheet-is-not-loaded
// import Router from 'next/router';
//
// Router.events.on('routeChangeComplete', () => {
//   if (process.env.NODE_ENV !== 'production') {
//     const els = document.querySelectorAll('link[href*="/_next/static/css/styles.chunk.css"]');
//     const timestamp = new Date().valueOf();
//     els[0].href = '/_next/static/css/styles.chunk.css?v=' + timestamp;
//   }
// })

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  React.useEffect(() => {
    function onRouteChangeComplete() {
      if (fathomId) {
        Fathom.trackPageview();
      }

      if (posthogId) {
        posthog.capture("$pageview");
      }
    }

    if (fathomId) {
      Fathom.load(fathomId, fathomConfig);
    }

    if (posthogId) {
      posthog.init(posthogId, posthogConfig);
    }

    router.events.on("routeChangeComplete", onRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>
          surulere.dev - A space for critical thinking on African future
        </title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
