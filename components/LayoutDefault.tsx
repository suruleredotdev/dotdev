import * as React from 'react'


// import Link from 'next/link'
// import Image from 'next/image'
// import dynamic from 'next/dynamic'

import { useHover } from 'usehooks-ts'
import { useRouter } from 'next/router'
import { useSearchParam } from 'react-use'
import BodyClassName from 'react-body-classname'
import { Block, BlockMap, Collection, CollectionMap, CollectionView, CollectionViewMap, CollectionQueryResult } from 'notion-types'

import { useDarkMode } from 'lib/use-dark-mode'
import * as types from 'lib/types'
// jimport * as config from 'lib/config'

// components
// import { Loading } from './Loading'
// import { Page404 } from './Page404'
// import { PageHead } from './PageHead'
// import { PageAside } from './PageAside'
// import { Footer } from './Footer'
// import { NotionPageHeader } from './NotionPageHeader'

import styles from './styles.module.css'
import { getNotionProps } from './NotionComponents'
import { NotionRenderer, NotionContextProvider, NotionBlockRenderer } from 'react-notion-x'
import { getAllPagesInSpace } from 'notion-utils'
import { mapPageUrl } from 'lib/map-page-url'
import { site } from 'lib/config'
import * as config from 'lib/config'
import { getPage } from 'lib/notion'
import { globalClasses, StyleClasses } from './styles'

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

/* TODO: abstract tachyons styles
  - wrap with useTachyons hook
  - pull updated classes from UI
  - build dropdown/slider UI to toggle classes
*/

const classes: StyleClasses = {
  ...globalClasses,
  tagline: "f1 b gray o-90 ma0 w-70",
  description: "f5 gray o-90 pb4 lh-title",
  postsTitle: "f5 title",
  postsList: "f5 pl0 pl4-ns",
  postLink: "link dim",
  postDate: "f7",
  postTag: "tag f7 dim no-ul",
  footer: "ph3 dn db-ns bg-transparent flex flex-row fixed",
  socialBlock: "w-10 tl mv2 pointer flex flex-row",
  socialBlockAction: "pv2",
  shareBlock: "w-10 tl pointer flex flex-column absolute pv2",
  shareBlockAction: "link dim pv2 hide",
  shareBlockDropdown: "link dim pv2 underline" ,
  settingsBlock: "w-33-ns tr mv2 pointer flex flex-column absolute",
  settingsBlockAction: "link dim ph3 pv2 hide",
  settingsBlockDropdown: "link dim ph3 pv2 underline" ,
}

const HomePageContent: React.FC<types.PageProps> = ({
  site,
  recordMap,
  pageId,
}) => {
  // TODO: render from root page block
  const posts = getSitePosts({
    recordMap,
    pageId,
  })
  return (
    <div id="content" className={classes.content}>
      <div id="about pb5">
        <p className={classes.tagline}>
          Serious writing about Africa's future.
        </p>

        <p className={classes.description}>
          Essays and visualizations to help us think critically about our ever-changing reality in the 2020s and build a better future for ourselves.
        </p>
      </div>

      <b className={classes.postsTitle}>
        ESSAYS
      </b>
      <ul className={classes.postsList}>
        {posts?.map((post) => 
          post.draft != true ?
          <p>
            <a className={classes.postLink} href={ post.url }>{ post.title }</a>
            <small className={classes.postDate}>&mdash; { post.date.toString() }</small>
            post.tags ?
                <>
                  <br/>
                  {post.tags?.map((tag, i) => (
                    <a key={i} className={classes.postTag} href={"/blog/tag/"+tag}><em>{ tag }</em></a>
                  ))}
                </>
                : <></>
          </p>
          : <></>
        )}
      </ul>
      <br/>
    </div>
  )
}

export const Footer: React.FC<any> = ({
  page,
  isBlogPost
}) => {
  const shareHoverRef = React.useRef(null)
  const shareIsHovered = useHover(shareHoverRef)
  const settingsHoverRef = React.useRef(null)
  const settingsIsHovered = useHover(settingsHoverRef)

  const { toggleDarkMode } = useDarkMode()

  return (
      <footer ref={shareHoverRef} id="footer" className={classes.footer}>
        <div id="social-block" className={classes.socialBlock}>
          <span id="twitter-link" className={classes.socialBlockAction}>
            <a className="link" href="https://twitter.com/suruleredotdev">@SURULEREDOTDEV</a>
          </span>
          { isBlogPost ?
            (<div id="share-block" className={classes.shareBlock} style={{ bottom:"0", left:"calc(2.6 * var(--bg-size))", }}>
            {shareIsHovered ?
              (<>
                <span className={classes.shareBlockAction}>
                  <a target="_blank" className="no-ul" 
                    href={"https://twitter.com/intent/tweet?text="+encodeURIComponent(`${page.title} https://surulere.dev ${page.url}`)} rel="noreferrer">
                    TWITTER
                  </a>
                </span>
                <span className={classes.shareBlockAction}>
                  <a target="_blank" className="no-ul"
                    href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(`${page.title} https://surulere.dev ${page.url}`)} rel="noreferrer">
                    FACEBOOK
                  </a>
                </span>
              </>)
              : <></>}
              <span className={classes.shareBlockDropdown}>
                <a href="#" className="no-ul">SHARE</a>
              </span>
            </div>) : (<></>)
          }
        </div>
        <div ref={settingsHoverRef} id="settings-block" className={classes.settingsBlock} style={{ bottom:"0", right:"0", }}>
          {settingsIsHovered ?
            (<>
              <span id="clear-local-storage" className={classes.settingsBlockAction} onClick={() =>{
                window.localStorage.clear();
                console.log("[suruleredotdev]: local storage cleared!");
              }}>
                CLEAR LOCAL STORAGE
              </span>
              <span id="dark-mode-toggle" className={classes.settingsBlockAction} onClick={toggleDarkMode}>
                TOGGLE DARK MODE
              </span>
            </>)
            : <></>}
          <script>
          </script>

          <span className={classes.settingsBlockDropdown}>
            <a href="#" className="no-ul">SETTINGS</a>
          </span>
        </div>
      </footer>
  )
}

interface Page {
  title: string
  url: string
  layout: 'post' | string
}

export const LayoutDefault: React.FC<types.PageProps> = ({
  site,
  recordMap,
  error,
  pageId,
  rootPageContent
}) => {
  // const router = useRouter()
  // const lite = useSearchParam('lite')

  // const isLiteMode = lite === 'true'

  const { isDarkMode } = useDarkMode()

  // const searchParams = new URLSearchParams('') // window.location.search
  // const siteMapPageUrl = React.useMemo(() => {
  //   const params: any = {}
  //   if (lite) params.lite = lite

  //   return mapPageUrl(site, recordMap, searchParams)
  // }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {})
  const block = recordMap?.block?.[keys[0]]?.value

  const isRootPage =
    parsePageId(block?.id) === parsePageId(site?.rootNotionPageId) ||
    window.location.href==='/'
  
  // TODO: to LayoutPost
  const isBlogPost =
    block?.type === 'page' && block?.parent_table === 'collection'

  const showTableOfContents = !!isBlogPost
  const minTableOfContentsItems = 3

  const notionProps = getNotionProps({
    site,
    recordMap,
    pageId: ''
  })
  const {
    components,
  } = notionProps

  const content = isRootPage ?
    (<HomePageContent 
      site={site}
      recordMap={recordMap}
      error={error}
      pageId={pageId}
      rootPageBlock={block}
    ></HomePageContent>)
    : blockToContent(block, recordMap, {
      notionProps,
      site,
      isRootPage,
      isBlogPost,
      showTableOfContents,
      minTableOfContentsItems 
    })

  return (
    <>
      {isDarkMode ? <BodyClassName className="sans-serif DARK animate-bg" />
        : <BodyClassName className="sans-serif LIGHT animate-bg" />}
      <a name="top"></a>
      <a id="logo" href="/" className="bn"> 
      {isDarkMode ? 
        <img id="logo-dark" src="/assets/img/suruleredotdev_green_bg_bold.svg"/>
        : <img id="logo-light" src="/assets/img/suruleredotdev_transparent_bg.svg"/>}
      </a>
      
      <NotionContextProvider
        components={components}
        recordMap={recordMap}
        mapPageUrl={mapPageUrl}
        darkMode={isDarkMode}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        showTableOfContents={false} //  config.defaultShowTableOfContents
        minTableOfContentsItems={false} //  config.defaultMinTableOfContentsItems
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        zoom={false}
      >
        {content}
      </NotionContextProvider>

      <Footer page={undefined} isBlogPost={isBlogPost}></Footer>
    </>
  )
}

const pageIdRe = /\b([a-f0-9]{32})\b/
const pageId2Re = /\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/

/**
 * Robustly extracts the notion page ID from a notion URL or pathname suffix.
 *
 * Defaults to returning a UUID (with dashes).
 */
export const parsePageId = (
  id: string | null = '',
  { uuid = true }: { uuid?: boolean } = {}
) => {
  if (!id) {
    return null
  }

  id = id.split('?')[0]
  const match = id.match(pageIdRe)

  if (match) {
    return uuid ? idToUuid(match[1]) : match[1]
  }

  const match2 = id.match(pageId2Re)
  if (match2) {
    return uuid ? match2[1] : match2[1].replace(/-/g, '')
  }

  return null
}

export const idToUuid = (id: string = '') =>
  `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(
    16,
    4
  )}-${id.substr(20)}`

const POSTS_COLLECTION_TITLE = "Posts"
function getSitePosts(args: { recordMap, pageId }) {
  const { recordMap } = args

  console.log(">>> getSitePosts 0", {
    recordMap,
    blocks: Object.values(recordMap.block).map(i => { let v: Block = i?.value; return !!v ? { props: v.properties, type: v.type } : null; })
  })

  const collection: Collection = (Object.values(recordMap.collection)[0] as CollectionMap[string])?.value,
    collectionView: CollectionView = (Object.values(recordMap.collection_view)[0] as CollectionViewMap[string])?.value,
    collectionQueryResult: CollectionQueryResult = recordMap.collection_query[collection.id][collectionView.id]
  if (!collection) return []

  const 
    collectionId = collection.id,
    collectionTitle = collection.name[0][0],
    collectionSchema = collection.schema

  console.log(">>> getSitePosts 1", {
    collectionId,
    collectionView,
    collection,
    collectionTitle,
    collectionQueryResult
  })

  if (!collectionId || collectionTitle !== POSTS_COLLECTION_TITLE) return []

  const pageIdsMatchingQuery = collectionQueryResult?.collection_group_results?.blockIds || []

  const posts = Object.values(recordMap.block).filter((block: BlockMap) => {
    return block.value?.parent_id === collectionId || pageIdsMatchingQuery.includes(block.value?.id)
  }).map((p: BlockMap[string]) => ({
    title: p?.value?.properties?.title,
    ...(Object.keys(p?.value?.properties)?.reduce((acc, propId) => ({ ...acc, [collectionSchema[propId].name]: p?.value?.properties[propId]}), {}))
  }))

  console.log(">>> getSitePosts 2", {
    posts,
    pageIdsMatchingQuery
  })

  return [] // TODO
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function blockToContent(block: any, recordMap, args: { notionProps: any; site:  types.Site; isRootPage: any; isBlogPost: boolean; showTableOfContents: boolean; minTableOfContentsItems: number }) {
  const {
    pageId,
    isDarkMode ,
    socialImage,
    socialDescription,
    darkMode,
    components,
    fullPage,
    mapPageUrl:  siteMapPageUrl,
    mapImageUrl,
    searchNotion,
    pageAside,
    footer,
  } = args.notionProps
  return (
    <NotionRenderer
      bodyClassName={(
        styles.notion,
        pageId === site.rootNotionPageId && 'index-page'
      )}
      darkMode={isDarkMode}
      components={components}
      recordMap={recordMap}
      rootPageId={site.rootNotionPageId}
      rootDomain={site.domain}
      fullPage={false}
      previewImages={!!recordMap.preview_images}
      showCollectionViewDropdown={false}
      showTableOfContents={false} //  config.defaultShowTableOfContents
      minTableOfContentsItems={false} //  config.defaultMinTableOfContentsItems
      defaultPageIcon={config.defaultPageIcon}
      defaultPageCover={config.defaultPageCover}
      defaultPageCoverPosition={config.defaultPageCoverPosition}
      mapPageUrl={siteMapPageUrl}
      mapImageUrl={mapImageUrl}
      searchNotion={config.isSearchEnabled ? searchNotion : null}
      pageAside={pageAside}
      footer={footer}
    />
  )
}