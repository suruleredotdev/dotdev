/*
---
layout: tool
title: Slides Tool
tool_name: SLIDE EDITOR
---
*/

import * as React from "react";
import { Block, ExtendedRecordMap } from "notion-types";

// import { PageActions } from './PageActions'
// import { PageSocial } from './PageSocial'
//
// import { getPageTweet } from 'lib/get-page-tweet'

export const Slides: React.FC<{
  block: Block;
  recordMap: ExtendedRecordMap;
  isBlogPost: boolean;
}> = (args) => {
  console.log(`Slides`, { args });
  let iframe;

  useEffect(() => {
    hideError();

    iframe = new I("iframe-setting");

    iframe.update = function (val) {
      document.getElementById("slides-embed").src = val;
    };

    if (pageIsEmbed()) renderAsEmbed("slides");
  });

  //<style>
  // // eslint-disable-next-line
  const style = `
      .SLIDES.tool-container {
          display: flex;
          flex-direction: row;
          width: fit-content;
          left: calc(-5 * var(--bg-size));
      }

      .SLIDES.tool-container > div{
          height: calc(12 * var(--bg-size));
          width: 70%;
          min-width: 850px;
      }

      .LIGHT .SLIDES {
          background-color: var(--bg-color-light);
          color: var(--txt-color-light);
          border: 1px solid var(--border-color-light); 
      }
      .DARK .SLIDES {
          background-color: var(--bg-color-dark);
          color: rgba(var(--txt-color-dark), 0.8);
          border: 0.5px solid var(--border-color);
      }

      iframe#slides-embed {
        width: 100%; height: 100%;
      }
  `;
  //</style>

  return (
    <>
      <div className="SLIDES tool-container flex flex-row">
        <div id="slides" className="SLIDES">
          <iframe id="slides-embed"> </iframe>
        </div>
      </div>

      <div id="slides-settings" className="settings ml3">
        <div
          className="f7 o-40 fw5 bb pa1 pb0 pt2"
          style={{ width: "fit-content" }}
        >
          <span style={{ width: "fit-content" }}>SETTINGS</span>
        </div>

        <div className="setting flex flex-row h1 ma1">
          <label htmlFor="iframe-setting" className="fw5 f6 w-40 dib">
            IFRAME URL:
          </label>

          <input
            id="iframe-setting"
            name="iframe"
            placeholder=""
            onMouseDown={(event) => {
              if (!event.target.value) iframe.set(event.target.placeholder);
            }}
            onMouseUp={(event) => {
              event.target.select();
            }}
            onChange={(event) => {
              iframe.set(event.target.value);
            }}
            type="text"
            className="setting bg-transparent w-70 pa0 dib"
          />
          <br />
        </div>

        <div
          id="settings-error"
          className="red f7 o-40 fw5 pa1 pt2 flex flex-row"
          style={{ width: fit - content }}
        >
          <span className="b" style={{ width: "fit-content" }}>
            ERROR:{" "}
          </span>
          <br />
          <div id="settings-error-msg"></div>
          <br />
          <a className="black pointer" onClick={hideError}>
            <small>CLEAR</small>
          </a>
        </div>

        <p className="f7 gray pa2">
          Paste in a link to any embeddable web page (really any webpage at
          all), and the slides tool will load it into the iFrame. <br /> <br />
          Clicking NEXT and PREVIOUS will scroll the frame down/up by a full
          page height.
        </p>
      </div>
    </>
  );
};
