import * as React from "react";
import Arena from "are.na";

import * as types from "lib/types";
import { getSitePosts } from "lib/get-site-posts";

import { globalClasses, layoutDefaultClasses, StyleClasses } from "./styles";

const classes: StyleClasses = {
    ...globalClasses,
    ...layoutDefaultClasses,
}

export const ArenaBlock = (props: {
  block: Arena.Block
}) => (
  <a href={`https://are.na/block/`+props.block?.id} target="_blank" rel="noreferrer">
    <div className={`pa3 pt2 b--dotted b-color overflow-hidden`} style={{ height: 250, width: 250 }}>
      <p className="f5 w5">{props.block?.title || props.block?.source?.url }</p>
      <img src={props.block?.image?.display?.url}
        alt={props.block?.description}
        style={{ height: 200, width: 200 }}/>
      <br/>
    </div>
  </a>
)

export const ArenaChannel = (props: {
  channel: Arena.Channel,
}) => {
  const [collapse, setCollapse] = React.useState(true)

  return (
    <div className={`pa1 flex flex-column w-100 mb1 mt1 pr4-l`} onClick={() => setCollapse(!collapse)}>
      <div className="flex flex-row">
        <div  className="pr3 pointer">{
          collapse?
          (<span className="o-20">&rarr;</span>)
          : (<>&darr;</>)
        }
        </div>
        <div className="f6 grey flex flex-row">
          <a className="link black w5 pa1" href={`https://are.na/${props.channel?.user?.slug}/${props.channel?.slug}`} target="_blank" rel="noreferrer">
            {props.channel?.title} <br/>
          </a>
          <span className="pa1">
            {props.channel?.metadata?.description}
          </span>
        </div>
      </div>
      {collapse ?
         (<></>)
      :
        (
        <ul className={`flex flex-row overflow-y-auto list horizontal-scroll-shadow`}>
          {props.channel.contents?.slice(0, 15).map((block, i) =>
            (<li key={i} className="w-100 collapse">
              {block.base_class == "Block" ?
                (<ArenaBlock block={block} size={null}/>)
               : (<></>)}
            </li>))}
        </ul>
      )}
    </div>
  )
}
    
const homePageText = [
  {
    tagline: "A space for critical thinking on African future",
    description: "Essays and visualizations to help us think critically about our ever-changing reality in the 2020s and build a better future for  ourselves."
  },
  {
    tagline: "",
    description: ""
  },
]
const textVersion = 0

export const HomePageContent: React.FC<types.PageProps> = ({
  site,
  recordMap,
  pageId,
  channels,
  siteMap,
}) => {
  // TODO: render from root page block
  const posts = getSitePosts({
    recordMap,
  });

  const idToPagePath = Object.keys(siteMap.canonicalPageMap).reduce((acc, pagePath) => ({
    ...acc, [siteMap.canonicalPageMap[pagePath]]: pagePath
  }), {})

  return (
    <div id="content" className={classes.content}>
      <div id="about pb5">
        <p className={classes.tagline}>
          {homePageText[textVersion].tagline}
        </p>

        <p className={classes.description}>
          {homePageText[textVersion].description}
        </p>
      </div>

      <b className={classes.postsTitle}>ESSAYS</b>
      <ul className={classes.postsList}>
        {posts?
          .sort((a,b) => b.published - a.published)
          .filter(post => post.public == true)
          .map((post, i) =>
            <p key={i}>
              <a className={classes.postLink} href={"/" + idToPagePath[post.id]}>
                {post.title}
              </a>
              <small className={classes.postDate}>
              &nbsp; &mdash; {new Date(post.published).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric'})}
              </small>
              {post.tags ? (
                <>
                  {/* TODO: implement tags
                  <br />
                  {post.tags?.map((tag, i) => (
                    <a
                      key={i}
                      className={classes.postTag}
                      href={"/blog/tag/" + tag}
                    >
                      <em>{tag}</em>
                    </a>
                  ))} */}
                </>
              ) : (
                <></>
              )}
            </p>
        )}
      </ul>
      <br />

      <b className={classes.postsTitle}>ARCHIVES</b>
      <ul className={"f5 pl2 flex flex-column"}>
        {channels.slice(0,10)?.filter(channel => !!channel ).map((channel, i) =>
          (
            <ArenaChannel channel={channel}/>
          )
        )}
      </ul>
    </div>
  );
};

