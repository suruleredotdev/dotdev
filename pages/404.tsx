import { getLayoutProps } from "lib/get-layout-props";

import { LayoutDefault } from "components/LayoutDefault";
import { Footer } from "components/Footer";
import {
  globalClasses,
  layoutDefaultClasses,
  StyleClasses,
} from "components/styles";

const classes: StyleClasses = {
  ...globalClasses,
  ...layoutDefaultClasses,
};

const Page404: React.FC<any> = (props) => {
  const {
    isBlogPost, // TODO: strip this out, in favor of [pageId]
  } = getLayoutProps(props);

  return (
    <LayoutDefault {...props}>
      <div id="content" className={classes.content}>
        <div id="about pb5">
          <p className={classes.tagline}>{"NOT FOUND"}</p>
          <p className={classes.description}>{"404"}</p>
        </div>
      </div>
      <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
    </LayoutDefault>
  );
};

export default Page404;
