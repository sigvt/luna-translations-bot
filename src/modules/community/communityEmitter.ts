import EventEmitter from 'events'
import { getAllSettings } from '../../core/db'
import { debug, log, removeDupes, sleep, tryOrDo } from '../../helpers'
import { getLatestPost } from './getLatestPost'
import { streamers } from '../../core/db/streamers/'
import { getBotwideData, updateBotwideData } from '../../core/db/botwideData'

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
    await tryOrDo (
      () => checkChannel (ytId, emitter),
      (e: any) => debug (`community post fail ytId ${ytId}: ${e}`)
    )
  }

  setTimeout (() => continuouslyEmitNewPosts (emitter), 2000)
}

async function checkChannel (
  ytId: string, emitter: EventEmitter
): Promise<void> {
  const botData   = await getBotwideData ()
  const lastPosts = botData.lastCommunityPosts
  const post      = await getLatestPost (ytId)
  const recorded  = lastPosts.get (ytId)

  if (!post || post.url === recorded || !post.isToday) return

  lastPosts.set (ytId, post.url)
  updateBotwideData ({ lastCommunityPosts: lastPosts })

  emitter.emit ('post', post)
}
