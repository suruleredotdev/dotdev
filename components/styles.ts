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
  postDate: "f7 pv2",
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
};
