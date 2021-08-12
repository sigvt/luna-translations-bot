import { ciEquals, debug, doNothing, match } from '../../helpers'
import { tryOrDefault } from '../../helpers/tryCatch'
import { frameEmitter } from '../holodex/frameEmitter'
import { DexFrame, isPublic, VideoId } from '../holodex/frames'
import { getChatProcess } from './chatProcesses'
import { Streamer, StreamerName, streamers } from '../../core/db/streamers'
import { emoji, findTextChannel, send } from '../../helpers/discord'
import { Message, Snowflake, TextChannel, ThreadChannel } from 'discord.js'
import { tl } from '../deepl'
import { addToBotRelayHistory, addToGuildRelayHistory, getSubbedGuilds, getRelayNotices, getSettings, getGuildData } from '../../core/db/functions'
import { isBlacklistedOrUnwanted, isHoloID, isStreamer, isTl } from './commentBooleans'
import { GuildSettings, WatchFeature, WatchFeatureSettings } from '../../core/db/models'
import { retryIfStillUpThenPostLog } from './closeHandler'
import { logCommentData } from './logging'
import { getRelayNotifyProps } from '../youtubeNotifier'
import { notifyOneGuild } from '../notify'

frameEmitter.on ('frame', (frame: DexFrame) => {
  if (isPublic (frame)) setupRelay (frame)
})

export function setupRelay (frame: DexFrame): void {
  const chat = getChatProcess (frame.id)

  chat.stdout.removeAllListeners ('data')
  chat.stdout.on ('data', data => processComments (frame, data))

  chat.removeAllListeners ('close')
  chat.on ('close', exitCode => retryIfStillUpThenPostLog (frame, exitCode))
}

export interface ChatComment {
  id:      string
  name:    string
  body:    string
  time:    number
  isMod:   boolean
  isOwner: boolean
}

///////////////////////////////////////////////////////////////////////////////

async function processComments (frame: DexFrame, data: string): Promise<void> {
  for (const cmt of extractComments (data)) { // sequential processing desired
    const features: WatchFeature[] = ['relay', 'cameos', 'gossip']
    const guilds     = await getSubbedGuilds (frame.channel.id, features)
    const streamer   = streamers.find (s => s.ytId === frame.channel.id)
    const author     = streamers.find (s => s.ytId === cmt.id)
    const isCameo    = isStreamer (cmt.id) && !cmt.isOwner
    const mustDeepL  = guilds.some (g => g.deepl)
                    && isStreamer (cmt.id) && !isHoloID (streamer)
    const deepLTl    = mustDeepL ? await tl (cmt.body) : undefined
    const mustShowTl = mustDeepL && deepLTl !== cmt.body
    const getWatched = (f: WatchFeature) => f === 'cameos' ? author : streamer

    logCommentData (cmt, frame, streamer)
    if (isTl (cmt.body)) saveComment (cmt, frame, 'bot')
    guilds.forEach (g => {
      features.forEach (f => {
        getRelayEntries (g, f, getWatched (f)?.name).forEach (e => {
          const mustRelayGossip = isStreamer (cmt.id) || isTl (cmt.body)
          const relayCmt        = match (f, {
            cameos: isCameo ? relayCameo  : doNothing,
            gossip: mustRelayGossip ? relayGossip : doNothing,
            relay:  relayTlOrStreamerComment
          })

          relayCmt ({
            e, cmt, frame, g,
            discordCh: findTextChannel (e.discordCh)!,
            deepLTl:   mustShowTl ? deepLTl : undefined,
            to:        streamer?.name ?? 'Discord',
          })
        })
      })
    })
  }
}

function relayCameo (
  { discordCh, to, cmt, deepLTl, frame }: RelayData, isGossip?: boolean
): void {
  const cleaned = cmt.body.replaceAll ('`', "'")
  const emj     = isGossip ? emoji.peek : emoji.holo
  const line1   = `${emj} **${cmt.name}** in **${to}**'s chat: \`${cleaned}\``
  const line2   = deepLTl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''
  const line3   = `\n<https://youtu.be/${frame.id}>`
  send (discordCh, line1 + line2 + line3)
}

function relayGossip (
  data: RelayData
): void {
  const stalked = streamers.find (s => s.name === data.e.streamer)
  if (isGossip (data.cmt.body, stalked!, data.frame)) relayCameo (data, true)
}

async function relayTlOrStreamerComment (
  { discordCh, deepLTl, cmt, g, frame }: RelayData
): Promise<void> {
  const mustPost = cmt.isOwner
                || (isTl (cmt.body, g) && !isBlacklistedOrUnwanted (cmt, g))
                || isStreamer (cmt.id)
                || (cmt.isMod && g.modMessages && !isBlacklistedOrUnwanted (cmt, g))

  const premoji = isTl (cmt.body, g)  ? ':speech_balloon:'
                : isStreamer (cmt.id) ? emoji.holo
                                      : ':tools:'

  const url = frame.status === 'live' ? ''
            : deepLTl                 ? `\n<https://youtu.be/${frame.id}>`
                                      : ` | <https://youtu.be/${frame.id}>`

  const author = isTl (cmt.body, g) ? `||${cmt.name}:||` : `**${cmt.name}:**`
  const text   = cmt.body.replaceAll ('`', "''")
  const tl     = deepLTl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''

  if (mustPost) {
    await announceIfNotDone (frame, g._id)
    const thread = await findFrameThread (frame.id, g, discordCh)

    send (thread ?? discordCh, `${premoji} ${author} \`${text}\`${tl}${url}`)
    .then (msg => saveComment (cmt, frame, 'guild', g._id, msg))
    .catch (debug)
  }
}

export async function findFrameThread (
  videoId: VideoId, g: GuildSettings, channel?: TextChannel | ThreadChannel
): Promise<ThreadChannel | undefined> {
  const gdata  = await getGuildData (g._id)
  const notice = gdata.relayNotices.get (videoId)
  const validch = channel as TextChannel
  if (g.threads) return validch?.threads?.cache.find (thr => thr.id === notice)
}

async function announceIfNotDone (
  frame: DexFrame, gid: Snowflake
): Promise<void[]> {
  const notices    = await getRelayNotices (gid)
  const announce   = notices.get (frame.id)
  const g          = await getSettings (gid)
  const mustNotify = !announce && frame.status === 'live'

  return mustNotify ? notifyOneGuild (g, {
    subbedGuilds: [g], ...getRelayNotifyProps (frame)
  }) : []
}


function saveComment (
  cmt: ChatComment,
  frame: DexFrame,
  type: 'guild'|'bot',
  gid?: Snowflake,
  msg?: Message
): void {
  const addFn = type === 'guild' ? addToGuildRelayHistory : addToBotRelayHistory
  const startTime  = new Date (Date.parse (frame.start_actual ?? '')).valueOf ()
  const loggedTime = new Date (+cmt.time).valueOf ()
  const timestamp  = !frame.start_actual
                     ? 'prechat'
                     : new Date (loggedTime - startTime)
                       .toISOString ()
                       .substr (11, 8)
  addFn (frame.id, {
    msgId:        msg?.id,
    discordCh:    msg?.channel.id,
    body:         cmt.body,
    ytId:         cmt.id,
    author:       cmt.name,
    timestamp,
    stream:       frame.id,
    absoluteTime: cmt.time
  }, gid!)
}

function extractComments (jsonl: any): ChatComment[] {
  const cmts = String (jsonl)
    .split ('\n')
    .filter (x => x !== '')
  return tryOrDefault (() => cmts.map (cmt => JSON.parse (cmt)), [])
}

function getRelayEntries (
  g: GuildSettings, f: WatchFeature, streamer?: StreamerName
): WatchFeatureSettings[] {
  return f === 'gossip' ? g[f] : g[f]
    .filter (entry => entry.streamer === streamer || entry.streamer === 'all')
}

function isGossip (text: string, stalked: Streamer, frame: DexFrame): boolean {
  const isOwnChannel    = frame.channel.id === stalked.ytId
  const isCollab        = frame.description.includes (stalked.twitter)
  const mentionsWatched = text
    .split (' ')
    .some (w => stalked.aliases.some (a => ciEquals (a, w)))
  
  return !isOwnChannel && !isCollab && mentionsWatched
}


interface RelayData {
  discordCh: TextChannel | ThreadChannel
  deepLTl?:  string
  cmt:       ChatComment
  g:         GuildSettings
  frame:     DexFrame
  to:        StreamerName
  e:         WatchFeatureSettings
}
