import * as React from "react";
import { ExtendedRecordMap } from "notion-types";

import { NotionRenderer, NotionComponents } from "react-notion-x";

import * as types from "lib/types";

export const Annotation: React.FC<{
  block: types.CollectionViewPageBlock | types.PageBlock;
  recordMap: ExtendedRecordMap;
  components: Partial<NotionComponents>;
}> = ({ block, recordMap, components }) => {
  console.log("ANNOTATION", block);
  const title = block.properties.title[0];
  const content = block.properties.title[1];
  return (
    <div className="annotation f6 pb0">
      <div className="annotation-body pl3">
        {title}
        {content}
      </div>
    </div>
  );
};
