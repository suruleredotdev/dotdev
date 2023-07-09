import Head from "next/head";
import * as React from "react";

import * as types from "lib/types";
import * as config from "lib/config";
import { getSocialImageUrl } from "lib/get-social-image-url";

export const PageHead: React.FC<
  types.PageProps & {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  }
> = ({ site, title, description, pageId, image, url }) => {
  const rssFeedUrl = `${config.host}/feed`;

  title = title ?? site?.name;
  description = description ?? site?.description;

  const socialImageUrl = getSocialImageUrl(pageId) || image;

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />

      <meta name="robots" content="index,follow" />
      <meta property="og:type" content="website" />

      {site && (
        <>
          <meta property="og:site_name" content={site.name} />
          <meta property="twitter:domain" content={site.domain} />
        </>
      )}

      {config.twitter && (
        <meta name="twitter:creator" content={`@${config.twitter}`} />
      )}

      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}

      {socialImageUrl ? (
        <>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={socialImageUrl} />
          <meta property="og:image" content={socialImageUrl} />
        </>
      ) : (
        <meta name="twitter:card" content="summary" />
      )}

      {url && (
        <>
          <link rel="canonical" href={url} />
          <meta property="og:url" content={url} />
          <meta property="twitter:url" content={url} />
        </>
      )}

      <link
        rel="alternate"
        type="application/rss+xml"
        href={rssFeedUrl}
        title={site?.name}
      />

      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <title>{title}</title>

      <meta
        property="og:image"
        content="/assets/img/suruleredotdev_dark_bg.svg"
      />
      <meta
        property="twitter:image"
        content="/assets/img/suruleredotdev_dark_bg.svg"
      />

      <link rel="icon" href="/assets/img/suruleredotdev_white_bg.svg" />

      <link
        rel="stylesheet"
        href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css"
      />
    </Head>
  );
  /*
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta property="og:image" content="/assets/img/suruleredotdev_dark_bg.svg">
  <meta property="twitter:image" content="/assets/img/suruleredotdev_dark_bg.svg">

  <link rel="icon" href="/assets/img/suruleredotdev_white_bg.svg">
  <link rel="stylesheet" href="/styles.css">

  <link rel="stylesheet" href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css"/>

  <script async defer data-domain="surulere.dev" src="https://plausible.io/js/plausible.js"></script>

  <!-- <script src="/scripts/custom-element.js" type="text/javascript"></script> -->
  
  <title>suruleredotdev</title>

  <script>
    function setMode(mode) {
      window.localStorage.setItem('mode', mode)
      if(mode === 'dark') {
        if (!document.querySelector('body').classList.contains('DARK')) document.querySelector('body').classList.add('DARK');
        document.getElementById("logo-dark").style.display = "block";
        document.getElementById("logo-light").style.display = "none";
        document.querySelector('body').classList.remove('LIGHT');
        if (typeof codemirror !== 'undefined') codemirror.setOption("theme", "material");
      } else if(mode === 'light') {
        if (!document.querySelector('body').classList.contains('LIGHT')) document.querySelector('body').classList.add('LIGHT');
        document.getElementById("logo-light").style.display = "block";
        document.getElementById("logo-dark").style.display = "none";
        document.querySelector('body').classList.remove('DARK');
        if (typeof codemirror !== 'undefined')  codemirror.setOption("theme", "neo");
      }
    }

    function getMode() {
      var hours = (new Date()).getHours();
      var timeOfDayMode = hours > 6 && hours < 20 ? "light" : "dark";
      let localStorageMode = window.localStorage.getItem("mode");
      return (!!localStorageMode) ? localStorageMode : timeOfDayMode;
    }

    window.addEventListener('DOMContentLoaded', function (e) {
      setMode(getMode());
    });
  </script>
  */
};
