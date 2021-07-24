import { debug, getJson, Params } from '../../helpers'

export async function getFrameList () {
  const firstPg   = await getJson (framesUrl + Params (params)) as PaginatedResp
  const total     = parseInt (firstPg.total)
  const remaining = max (0, ceil (total / 50) - 1)
  const otherPgs  = await getFramePages ({ offset: 1, limit: remaining })
  return [
    ...firstPg.items,
    ...otherPgs.flatMap?. (pg => pg.items)
  ]
}

export interface DexFrame {
  id:              string
  title:           string
  type:            'stream' | 'clip'
  published_at:    DateTimeString
  available_at:    DateTimeString
  duration:        number
  status:          'new' | 'upcoming' | 'live' | 'past' | 'missing'
  start_scheduled: DateTimeString
  start_actual?:   DateTimeString
  description:     string
  channel:         DexChannel
}

///////////////////////////////////////////////////////////////////////////////

const { max, ceil } = Math
const framesUrl = 'https://holodex.net/api/v2/live?'
const params = {
  include: 'description',
  limit: '50',
  paginated:'1',
  max_upcoming_hours: '0n'
}

function getFramePages ({ offset = 0, limit = 0 }): Promise<PaginatedResp[]> {
  const emptyArr = [...Array (limit)]
  const getPage  = (page: number) => getJson (framesUrl + Params ({
                     ...params,
                     offset: (50 * page).toString ()
                   }))
 return Promise.all (emptyArr.map ((_, i) => getPage (i + offset)))
               .catch (e => debug (e))
}

interface PaginatedResp {
  total: string
  items: DexFrame[]
}

interface DexChannel {
  id:           string
  name:         string
  org:          string
  type:         'vtuber' | 'subber'
  photo:        string
  english_name: string
}

type DateTimeString = string
