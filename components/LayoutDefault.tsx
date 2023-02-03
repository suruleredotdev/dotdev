import * as React from "react";

import BodyClassName from "react-body-classname";

import { useDarkMode } from "lib/use-dark-mode";
import * as types from "lib/types";

import { layoutDefaultClasses } from "./styles";

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

/* 
TODO: 
- ? use footer component inside layoutdefault
- abstract tachyons styles
  - wrap with useTachyons hook
  - build dropdown/slider UI to toggle classes
  - pull updated classes from UI
*/

export const LayoutDefault: React.FC<types.PageProps & { children: React.ReactNode }> = ({
  children,
  ...props
}) => {

  const { isDarkMode } = useDarkMode();

  const isLoading = !props.recordMap;
  const loadingAnimation = isLoading?"animate-bg-infinite":"animate-bg"

  return (
    <>
      {isDarkMode ? (
        <BodyClassName className={`sans-serif DARK ${loadingAnimation}`} />
      ) : (
        <BodyClassName className={`sans-serif LIGHT ${loadingAnimation}`} />
      )}
      <a href="top"></a>
      <a id="logo" href="/" className="bn">
        {isDarkMode ? (
          <img
            id="logo-dark"
            src="/assets/img/suruleredotdev_green_bg_bold.svg"
          />
        ) : (
          <img
            id="logo-light"
            src="/assets/img/suruleredotdev_transparent_bg.svg"
          />
        )}
      </a>

      {children}
    </>
  );
};

const pageIdRe = /\b([a-f0-9]{32})\b/;
const pageId2Re =
  /\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/;

/**
 * Robustly extracts the notion page ID from a notion URL or pathname suffix.
 *
 * Defaults to returning a UUID (with dashes).
 */
export const parsePageId = (
  id: string | null = "",
  { uuid = true }: { uuid?: boolean } = {}
) => {
  if (!id) {
    return null;
  }

  id = id.split("?")[0];
  const match = id.match(pageIdRe);

  if (match) {
    return uuid ? idToUuid(match[1]) : match[1];
  }

  const match2 = id.match(pageId2Re);
  if (match2) {
    return uuid ? match2[1] : match2[1].replace(/-/g, "");
  }

  return null;
};

export const idToUuid = (id = "") =>
  `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(
    16,
    4
  )}-${id.substr(20)}`;
