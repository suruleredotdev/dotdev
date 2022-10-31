import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import cs from 'classnames'
import { useRouter } from 'next/router'
import { useSearchParam } from 'react-use'
import BodyClassName from 'react-body-classname'
import { PageBlock } from 'notion-types'

import TweetEmbed from 'react-tweet-embed'

// core notion renderer
import { NotionRenderer } from 'react-notion-x'

// utils
import { getBlockTitle, getPageProperty, formatDate } from 'notion-utils'
import { mapPageUrl, getCanonicalPageUrl } from 'lib/map-page-url'
import { mapImageUrl } from 'lib/map-image-url'
import { searchNotion } from 'lib/search-notion'
import { useDarkMode } from 'lib/use-dark-mode'
import * as types from 'lib/types'
import * as config from 'lib/config'

// components
import { Loading } from './Loading'
import { Page404 } from './Page404'
import { PageHead } from './PageHead'
import { PageAside } from './PageAside'
import { Footer } from './Footer'
import { NotionPageHeader } from './NotionPageHeader'

import styles from './styles.module.css'

import {
      Code,
      Collection,
      Equation,
      Pdf,
      Modal,
      Tweet,
      propertyLastEditedTimeValue,
      propertyTextValue,
      propertyDateValue
} from "./Blocks"

const defaultComponents = {
    nextImage: Image,
    nextLink: Link,
    Code,
    Collection,
    Equation,
    Pdf,
    Modal,
    Tweet,
    Header: NotionPageHeader,
    propertyLastEditedTimeValue,
    propertyTextValue,
    propertyDateValue
}

type Components = typeof defaultComponents

export const getComponents = 
  (customComponents: Partial<Components> = {}) => ({
      ...defaultComponents,
      ...customComponents
    })

export const getNotionProps = ({
  site,
  recordMap,
  pageId
}): any => {
  const router = useRouter()
  const lite = useSearchParam('lite')

  const components = React.useMemo(
    getComponents,
    []
  )

  // lite mode is for oembed
  const isLiteMode = lite === 'true'

  const { isDarkMode } = useDarkMode()

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {}
    if (lite) params.lite = lite

    const searchParams = new URLSearchParams(params)
    return mapPageUrl(site, recordMap, searchParams)
  }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {})
  const block = recordMap?.block?.[keys[0]]?.value
  console.log({ keys, block })

  // const isRootPage =
  //   parsePageId(block?.id) === parsePageId(site?.rootNotionPageId)
  const isBlogPost =
    block?.type === 'page' && block?.parent_table === 'collection'

  const showTableOfContents = !!isBlogPost
  const minTableOfContentsItems = 3

  const pageAside = React.useMemo(
    () => (
      <PageAside block={block} recordMap={recordMap} isBlogPost={isBlogPost} />
    ),
    [block, recordMap, isBlogPost]
  )

  const footer = React.useMemo(() => <Footer />, [])

  const title = block ? getBlockTitle(block, recordMap) : site?.name

  console.log('notion page', {
    isDev: config.isDev,
    title,
    pageId,
    rootNotionPageId: site?.rootNotionPageId,
    recordMap
  })

  if (!config.isServer) {
    // add important objects to the window global for easy debugging
    const g = window as any
    g.pageId = pageId
    g.recordMap = recordMap
    g.block = block
  }

  const canonicalPageUrl =
    !config.isDev && getCanonicalPageUrl(site, recordMap)(pageId)

  const socialImage = mapImageUrl(
    block ? getPageProperty<string>('Social Image', block, recordMap) :
      // (block as PageBlock)?.format?.page_cover ||
      config.defaultPageCover,
    block
  )

  const socialDescription =
    getPageProperty<string>('Description', block, recordMap) ||
    config.description

  return {
    block,
    isDarkMode ,
    socialImage,
    socialDescription,
    components,
    darkMode: isDarkMode,
    recordMap,
    rootPageId: pageId,
    rootDomain: "surulere.dev",
    fullPage: false,
    previewImages: !!recordMap.preview_images,
    showCollectionViewDropdown:false,
    showTableOfContents,
    minTableOfContentsItems,
    defaultPageIcon: config.defaultPageIcon,
    defaultPageCover: config.defaultPageCover,
    defaultPageCoverPosition: config.defaultPageCoverPosition,
    mapPageUrl:  siteMapPageUrl,
    mapImageUrl,
    searchNotion:(config.isSearchEnabled ? searchNotion : null),
    pageAside,
    footer,
  }
}
