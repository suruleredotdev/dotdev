/**
 * React wrappers for surulere.dev UI v1 (public/ui/v1).
 *
 * They render the same `su-*` class names as the hand-built HTML, so the CSS
 * is the single source of truth and these stay thin: markup, ARIA and the
 * little behaviour React owns (opening a <dialog>). Load the stylesheets
 * once per page, e.g. with <SuStyles /> in a Next <Head> or two <link> tags
 * in index.html for an esbuild app.
 *
 * Copy this folder into a React repo as-is; it has no imports beyond React.
 */
export { SuStyles, SU_UI_VERSION, suUiHref } from "./SuStyles";
export { TopBar } from "./TopBar";
export type { TopBarItem, TopBarProps } from "./TopBar";
export { MediaCard, MediaCards } from "./MediaCard";
export type { MediaCardProps } from "./MediaCard";
export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";
export { Page, Window, Cover, Container, Footer, Panel, Label } from "./Page";
