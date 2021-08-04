import EventEmitter from 'events'
import { getAllSettings } from '../../core/db/functions'
import { removeDupes, sleep } from '../../helpers'
import { getLatestPost } from './getLatestPost'
import { streamers } from '../../core/db/streamers/'
import { getBotData, updateBotData } from '../../core/db/functions'
import { asyncTryOrLog } from '../../helpers/tryCatch'

export const communityEmitter = CommunityEmitter ()

///////////////////////////////////////////////////////////////////////////////

function CommunityEmitter (): EventEmitter {
  const emitter = new EventEmitter ()
  continuouslyEmitNewPosts (emitter)
  return emitter
}

async function continuouslyEmitNewPosts (emitter: EventEmitter): Promise<void> {
  const allSettings = await getAllSettings ()
  const subs = allSettings
    .flatMap (settings => settings.community)
    .map (({streamer}) => streamers?.find (s => s.name === streamer)!.ytId)
    |> removeDupes

  for (const ytId of subs) {
    await sleep (2000)
    await asyncTryOrLog (() => checkChannel (ytId, emitter))
  }

  setTimeout (() => continuouslyEmitNewPosts (emitter), 2000)
}

async function checkChannel (
  ytId: string, emitter: EventEmitter
): Promise<void> {
  const botData   = await getBotData ()
  const lastPosts = botData.lastCommunityPosts
  const post      = await getLatestPost (ytId)
  const recorded  = lastPosts.get (ytId)

  if (!post || post.url === recorded || !post.isToday) return

  lastPosts.set (ytId, post.url)
  updateBotData ({ lastCommunityPosts: lastPosts })
  emitter.emit ('post', post)
}
