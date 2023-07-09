import * as React from "react";
import Arena from "are.na";

export const ArenaBlock = (props: { block: Arena.Block }) => (
  <a
    href={`https://are.na/block/` + props.block?.id}
    target="_blank"
    rel="noreferrer"
  >
    <div
      className={`pa3 pt2 b--dotted b-color overflow-hidden`}
      style={{ height: 250, width: 250 }}
    >
      <p className="f5 w5">{props.block?.title || props.block?.source?.url}</p>
      <img
        src={props.block?.image?.display?.url}
        alt={props.block?.description}
        style={{ height: 200, width: 200 }}
      />
      <br />
    </div>
  </a>
);

export const ArenaChannel = (props: { channel: Arena.Channel }) => {
  const [collapse, setCollapse] = React.useState(true);

  return (
    <div
      className={`pa1 flex flex-column w-100 mb1 mt1 pr4-l`}
      onClick={() => setCollapse(!collapse)}
    >
      <div className="flex flex-row">
        <div className="pr3 pointer">
          {collapse ? <span className="o-20">&rarr;</span> : <>&darr;</>}
        </div>
        <div className="f5 grey flex flex-row-ns flex-column">
          <a
            className="link black w5 pa1"
            href={`https://are.na/${props.channel?.user?.slug}/${props.channel?.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            {props.channel?.title} <br />
            <span
              className="f6 pa1 overflow-x-hidden"
              style={{ lineBreak: "anywhere" }}
            >
              {props.channel?.metadata?.description}
            </span>
          </a>
        </div>
      </div>
      {collapse ? (
        <></>
      ) : (
        <ul
          className={`flex flex-row overflow-y-auto list horizontal-scroll-shadow`}
        >
          {props.channel.contents?.slice(0, 15).map((block, i) => (
            <li key={i} className="w-100 collapse">
              {block.base_class == "Block" ? (
                <ArenaBlock block={block} size={null} />
              ) : (
                <></>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
