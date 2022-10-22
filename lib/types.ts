import { Block, ExtendedRecordMap, PageMap } from 'notion-types'
import { ParsedUrlQuery } from 'querystring'

export * from 'notion-types'

import Arena from 'are.na'

export type NavigationStyle = 'default' | 'custom'

export interface PageError {
  message?: string
  statusCode: number
}

export interface PageProps {
  site?: Site
  recordMap?: ExtendedRecordMap
  pageId?: string
  error?: PageError
  rootPageBlock?: Block
  channels: Array<Arena.Channel>
}

export interface Params extends ParsedUrlQuery {
  pageId: string
}

export interface Site {
  name: string
  domain: string

  rootNotionPageId: string
  rootNotionSpaceId: string

  // settings
  html?: string
  fontFamily?: string
  darkMode?: boolean
  previewImages?: boolean

  // opengraph metadata
  description?: string
  image?: string

  posts: Array<Post>
}

export interface Post {
  props: PageProps
  draft: boolean,
  tags: Array<string>
}

export interface SiteMap {
  site: Site
  pageMap: PageMap
  canonicalPageMap: CanonicalPageMap
}

export interface CanonicalPageMap {
  [canonicalPageId: string]: string
}

export interface PageUrlOverridesMap {
  // maps from a URL path to the notion page id the page should be resolved to
  // (this overrides the built-in URL path generation for these pages)
  [pagePath: string]: string
}

export interface PageUrlOverridesInverseMap {
  // maps from a notion page id to the URL path the page should be resolved to
  // (this overrides the built-in URL path generation for these pages)
  [pageId: string]: string
}

/*
export interface ArenaChannel {
  id: number // (Integer)	// The internal ID of the channel
  title:	string //	The title of the channel
  created_at: number // Timestamp when the channel was created
  updated_at: number	Timestamp when the channel was last updated
  published	(Boolean)	If channel is visible to all members of arena or not
  open	(Boolean)	If channel is open to other members of arena for adding blocks
  collaboration	(Boolean)	If the channel has collaborators or not
  slug	(String)	The slug of the channel used in the url (e.g. http://are.na/arena-influences)
  length: number // 	(Integer)	The number of items in a channel (blocks and other channels)
  kind:	"default" | "profile" //: string //	Can be either "default" (a standard channel) or "profile" the default channel of a user
  status	(String)	Can be "private" (only open for reading and adding to the channel by channel author and collaborators), "closed" (open for reading by everyone, only channel author and collaborators can add) or "public" (everyone can read and add to the channel)
  user_id	(Integer)	Internal ID of the channel author
  class	(String)	Will always be "Channel"
  base_class	(String)	Will always be "Channel"
  user	(Hash)	More information on the channel author. Contains id, slug, first_name, last_name, full_name, avatar, email, channel_count, following_count, follower_count, and profile_id
  total_pages	(Integer)	If pagination is used, how many total pages there are in your request
  current_page	(Integer)	If pagination is used, page requested
  per	(Integer)	If pagination is used, items per page requested
  follower_count	(Integer)	Number of followers the channel has
  contents	(Array, can be null)	Array of blocks and other channels in the channel. Note: If the request is authenticated, this will include any private channels included in the requested channel that you have access to. If not, only public channels included in the requested channel will be shown.
  collaborators	(Array, can be null)	Collaborators on the channel
}
*/
