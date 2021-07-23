import { getText } from '../../helpers'

export async function getLatestPost (
  channelId: string
): Promise<CommunityPost | undefined> {
  const channelUrl = `https://www.youtube.com/channel/${channelId}/community`
  const headers    = { 'Accept-Language': 'en' }
  const page       = await getText (channelUrl, { headers })
  const dataRegex  = /(?<=var ytInitialData = )(.*?)(?=;<\/script>)/
  const data       = JSON.parse (page.match (dataRegex)?.[0] ?? '')
  return extractYtData (data, channelId)
}

export interface CommunityPost {
  ytId:    string
  author:  string
  avatar:  string
  url:     string
  content: string
  isToday: boolean
}

///////////////////////////////////////////////////////////////////////////////

function extractYtData (ytData: any, ytId: string): CommunityPost | undefined {
  const latestPost = ytData.contents
                           ?.twoColumnBrowseResultsRenderer
                           .tabs[3]
                           .tabRenderer
                           .content
                           .sectionListRenderer
                           .contents[0]
                           .itemSectionRenderer
                           .contents[0]
                           .backstagePostThreadRenderer
                           ?.post
                           .backstagePostRenderer
  const textEls    = latestPost?.contentText.runs as any[]
  const postText   = textEls?.map (el => el.text).join (' ')
  const truncated  = postText?.length < 2000 ? postText
                                             : postText?.substr (0, 1999) + '…'
  const date       = latestPost?.publishedTimeText.runs[0].text
  return latestPost ? {
    ytId,
    author:  latestPost.authorText.runs[0].text,
    avatar:  `https:${latestPost.authorThumbnail.thumbnails[2].url}`,
    url:     `https://youtube.com/post/${latestPost.postId}`,
    content: truncated,
    isToday: ['day','week','month','year'].every (unit => !date.includes (unit))
  } : undefined
}
