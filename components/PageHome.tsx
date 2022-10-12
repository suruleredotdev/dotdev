import * as React from "react";

import * as types from "lib/types";
import { getSitePosts } from "lib/get-site-posts";

import { globalClasses, layoutDefaultClasses, StyleClasses } from "./styles";

const classes: StyleClasses = {
    ...globalClasses,
    ...layoutDefaultClasses,
}

export const HomePageContent: React.FC<types.PageProps> = ({
  site,
  recordMap,
  pageId,
}) => {
  // TODO: render from root page block
  const posts = getSitePosts({
    recordMap,
    pageId,
  });
  return (
    <div id="content" className={classes.content}>
      <div id="about pb5">
        <p className={classes.tagline}>
          Serious writing about Africa's future.
        </p>

        <p className={classes.description}>
          Essays and visualizations to help us think critically about our
          ever-changing reality in the 2020s and build a better future for
          ourselves.
        </p>
      </div>

      <b className={classes.postsTitle}>ESSAYS</b>
      <ul className={classes.postsList}>
        {posts?.map((post, i) =>
          post.draft != true ? (
            <p key={i}>
              <a className={classes.postLink} href={"/" + post.slug}>
                {post.title}
              </a>
              <small className={classes.postDate}>
              &nbsp; &mdash; {new Date(post.published).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric'})}
              </small>
              {post.tags ? (
                <>
                  <br />
                  {post.tags?.map((tag, i) => (
                    <a
                      key={i}
                      className={classes.postTag}
                      href={"/blog/tag/" + tag}
                    >
                      <em>{tag}</em>
                    </a>
                  ))}
                </>
              ) : (
                <></>
              )}
            </p>
          ) : (
            <></>
          )
        )}
      </ul>
      <br />
    </div>
  );
};

