import EventEmitter from 'events'
import { getAllSettings } from '../../core/db/functions'
import { doNothing, removeDupes, sleep } from '../../helpers'
import { CommunityPost, getLatestPost } from './getLatestPost'
import { streamers } from '../../core/db/streamers/'
import { getBotData, updateBotData } from '../../core/db/functions'
import { asyncTryOrLog } from '../../helpers/tryCatch'
import { setKey } from '../../helpers/immutableES6MapFunctions'

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
  const newPosts  = lastPosts |> setKey (ytId, post?.url)
  const mustEmit  = post && post.url !== recorded && post.isToday
  const callback  = mustEmit ? saveAndEmit : doNothing
  callback (newPosts, emitter, post!)
}

function saveAndEmit (
  newCommunityPostMap: Map<string, string>,
  emitter: EventEmitter,
  post: CommunityPost
): void {
  updateBotData ({ lastCommunityPosts: newCommunityPostMap })
  emitter.emit ('post', post)
}
