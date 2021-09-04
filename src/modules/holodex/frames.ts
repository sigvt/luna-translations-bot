import { range } from 'ramda'
import {config} from '../../config'
import { debug, getJson, isEven, Params, removeDupeObjects, sleep } from '../../helpers'
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
  return frame.topic_id !== 'membersonly'
}

export async function getStartTime (
  videoId: VideoId
): Promise<DateTimeString|undefined> {
  // TODO: clean this up
  let attempts = 0
  let data
  while (attempts < 5) {
    const status = isEven (attempts) ? 'live' : 'past'
    data = await asyncTryOrLog (() => getJson (
      `https://holodex.net/api/v2/videos?status=${status}&include=live_info&type=stream&order=desc&id=${videoId}`,
      { headers: { 'X-APIKEY': config.holodexKey! } }
    ))
    if (data?.[0]?.start_actual == undefined) attempts += 1
    else break
  }
  return data?.[0]?.start_actual
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
  max_upcoming_hours: '999999'
}

function getOneFramePage (): Promise<PaginatedResp | undefined> {
  const url = framesUrl + Params (params)
  return asyncTryOrLog (() => getJson (url, { headers: {
    'X-APIKEY': config.holodexKey!
  }}))
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
        framesUrl + Params ({ ...params, offset: (50 * page).toString ()}),
        { headers: { 'X-APIKEY': config.holodexKey! } }
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
