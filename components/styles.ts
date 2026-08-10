import "./styles.module.css";

// TODO: upgrade this
// create methods for manipulating individual classes in list of classes
type Classes = string;
export type StyleClasses = Record<string, Classes>;

export const globalClasses: StyleClasses = {
  content: "pa3 pa5-ns mt6-l mh7-l f4 h-100",
};

export const layoutDefaultClasses: StyleClasses = {
  ...globalClasses,
  tagline: "f1 b gray o-90 ma0 w-70",
  description: "f5 gray o-90 pb4 lh-title",
  postsTitle: "f5 title",
  postsList: "f5 pl0 pl4-ns",
  postLink: "link dim",
  postDate: "pv2",
  postTag: "tag f7 dim no-ul",
  footer: "ph3 dn db-ns bg-transparent flex flex-row fixed",
  socialBlock: "w-10 tl mv2 pointer flex flex-row",
  socialBlockAction: "pv2",
  shareBlock: "w-10 tl pointer flex flex-column absolute pv2",
  shareBlockAction: "link dim pv2 hide",
  shareBlockDropdown: "link dim pv2 underline",
  settingsBlock: "w-33-ns tr mv2 pointer flex flex-column absolute",
  settingsBlockAction: "link dim ph3 pv2 hide",
  settingsBlockDropdown: "link dim ph3 pv2 underline",
  postDescription: "f7 pv1 gray",

  // The intro promises "essays and visualizations", so on desktop the two sit
  // side by side and both land above the fold. Below -l they stack back into
  // source order: essays, then tools.
  splitSections: "flex-l flex-row-l items-start-l mb4",
  essaysSection: "w-100 w-60-l pr4-l",
  toolsSection: "w-100 w-40-l",
  toolsList: "f5 list pl2 pl0-l flex flex-row flex-wrap w-100",
  // full width inside the narrow desktop column, two-up on tablet
  toolCard: "pa1 flex flex-column w-100 w-50-ns w-100-l mb1 mt1",
  toolThumb: "tool-thumb",
};
