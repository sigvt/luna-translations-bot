import { range } from 'ramda'
import { debug, getJson, Params, removeDupeObjects, sleep } from '../../helpers'
import { asyncTryOrLog } from '../../helpers/tryCatch'
const { max, ceil } = Math

export async function getFrameList () {
  const firstPg   = await getOneFramePage ()
  const total     = parseInt (firstPg?.total ?? '0')
  const remaining = max (0, ceil (total / 50) - 1)
  const otherPgs  = await getFramePages ({ offset: 1, limit: remaining })
  const frames    = otherPgs?.flatMap?. (pg => pg?.items)
  const hasFailed = !firstPg || !otherPgs
  return hasFailed ? [] : removeDupeObjects ([...firstPg!.items, ...frames!])
}

export function isPublic (frame: DexFrame): boolean {
  return frame.topic_id !== 'Membersonly'
}

export interface DexFrame {
  id:              VideoId
  title:           string
  type:            'stream' | 'clip'
  topic_id?:       string
  published_at:    DateTimeString
  available_at:    DateTimeString
  duration:        number
  status:          'new' | 'upcoming' | 'live' | 'past' | 'missing'
  start_scheduled: DateTimeString
  start_actual?:   DateTimeString
  description:     string
  channel:         DexChannel
}

export type VideoId = string
export type YouTubeChannelId = string

///////////////////////////////////////////////////////////////////////////////

const framesUrl = 'https://holodex.net/api/v2/live?'
const params = {
  include: 'description',
  limit: '50',
  paginated:'1',
  max_upcoming_hours: '0n'
}

async function getOneFramePage (): Promise<PaginatedResp | undefined> {
  const url = framesUrl + Params (params)
  return asyncTryOrLog (() => getJson (url))
}

async function getFramePages (
  { offset = 0, limit = 0 }
): Promise<PaginatedResp[] | undefined> {
  // Use an imperative loop to delay each call so as not to spam the API
  try {
    const pages = []
    for (const page of range (offset, limit)) {
      await sleep (1000)
      pages.push (await getJson (
        framesUrl + Params ({ ...params, offset: (50 * page).toString ()})
      ))
    }
    return pages
  } catch (e) {
    debug (e)
    return undefined
  }
}

interface PaginatedResp {
  total: string
  items: DexFrame[]
}

interface DexChannel {
  id:           YouTubeChannelId
  name:         string
  org:          string
  type:         'vtuber' | 'subber'
  photo:        string
  english_name: string
}

type DateTimeString = string
