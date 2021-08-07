import { debug } from '../../helpers'
import { tryOrDefault } from '../../helpers/tryCatch'
import { frameEmitter } from '../holodex/frameEmitter'
import { DexFrame, isPublic, VideoId } from '../holodex/frames'
import { getChatProcess } from './chatProcesses'
import { isSupported, Streamer, StreamerName, streamers } from '../../core/db/streamers'
import { emoji, findTextChannel, notifyOneGuild, send } from '../../helpers/discord'
import { Message, Snowflake, TextChannel, ThreadChannel } from 'discord.js'
import { tl } from '../deepl'
import { addToBotRelayHistory, addToGuildRelayHistory, getSubbedGuilds, getRelayNotices, getSettings } from '../../core/db/functions'
import { isBlacklisted, isHoloID, isStreamer, isTl } from './commentBooleans'
import { GuildSettings, WatchFeature, WatchFeatureSettings } from '../../core/db/models'
import { retryIfStillUpThenPostLog } from './closeHandler'
import { logCommentData } from './logging'

frameEmitter.on ('frame', (frame: DexFrame) => {
  if (isPublic (frame)) setupRelay (frame)
})

export function setupRelay (frame: DexFrame): void {
  const chat = getChatProcess (frame.id)

  chat.stdout.removeAllListeners ('data')
  chat.stdout.on ('data', (data: string) => processComments (frame, data))

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

function processComments (frame: DexFrame, data: string): void {
  extractComments (data).forEach (async cmt => {
    const features: WatchFeature[] = ['relay', 'holochats', 'gossip']
    const guilds     = await getSubbedGuilds (frame.channel.id, features)
    const streamer   = streamers.find (s => s.ytId === frame.channel.id)
    const mustDeepL  = guilds.some (g => g.deepl)
                    && isStreamer (cmt.id) && !isHoloID (streamer)
    const deepLTl    = mustDeepL ? await tl (cmt.body) : undefined
    const mustShowTl = mustDeepL && deepLTl !== cmt.body

    logCommentData (cmt, frame, streamer)
    if (isTl (cmt.body)) saveComment (cmt, frame, 'bot')
    guilds.forEach (g => {
      features.forEach (f => {
        getRelayEntries (g, f, streamer?.name).forEach (e => {
          const discordCh = findTextChannel (e.discordCh)
          const data: RelayData = {
            discordCh: discordCh!,
            from:      cmt.name,
            inStream:  frame.id,
            deepLTl:   mustShowTl ? deepLTl : undefined,
          }

          if (f === 'holochats' && isStreamer (cmt.id) && !cmt.isOwner)  {
            relayHolochat ({ ...data, to: streamer!.name, content: cmt.body, })
          }
          if (f === 'gossip' && isStreamer (cmt.id)) {
            relayGossip (e, frame, {
              ...data, to: streamer!.name, content: cmt.body
            })
          }
          if (f === 'relay') {
            relayTlOrStreamerComment ({...data, cmt, g, frame, })
          }
        })
      })
    })
  })
}

function relayHolochat (
  { discordCh, from, to, content, deepLTl, inStream }: HolochatRelayData,
  isGossip?: boolean
): void {
  const cleaned = content.replaceAll ('`', "'")
  const emj   = isGossip ? emoji.peek : emoji.holo
  const line1 = `${emj} **${from}** in **${to}**'s chat: \`${cleaned}\``
  const line2 = deepLTl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''
  const line3 = `\n<https://youtu.be/${inStream}>`
  send (discordCh, line1 + line2 + line3)
}

function relayGossip (
  e: WatchFeatureSettings, frame: DexFrame, data: HolochatRelayData
): void {
  const streamer = streamers.find (s => s.name === e.streamer)
  if (isGossip (data.content, streamer!, frame)) relayHolochat (data, true)
}

function relayTlOrStreamerComment (
  { discordCh, from, inStream, deepLTl, cmt, g, frame }: TlRelayData
): void {
  const mustPost = cmt.isOwner
                || (isTl (cmt.body, g) && !isBlacklisted (cmt.id, g))
                || isStreamer (cmt.id)
                || (cmt.isMod && g.modMessages && !isBlacklisted (cmt.id, g))

  const premoji = isTl (cmt.body, g)  ? ':speech_balloon:'
                : isStreamer (cmt.id) ? emoji.holo
                                      : ':tools:'

  const url = frame.status === 'live' ? ''
            : deepLTl                 ? `\n<https://youtu.be/${inStream}>`
                                      : ` | <https://youtu.be/${inStream}>`

  const author = isTl (cmt.body, g) ? `||${from}:||` : `**${from}:**`
  const text   = cmt.body.replaceAll ('`', "''")
  const tl     = deepLTl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''

  if (mustPost) {
    announceIfNotDone (frame, g._id)
    const thread = g.threads ? findFrameThread (frame.id, discordCh) : undefined
    send (thread ?? discordCh, `${premoji} ${author} \`${text}\`${tl}${url}`)
    .then (msg => saveComment (cmt, frame, 'guild', g._id, msg))
    .catch (debug)
  }
}

export function findFrameThread (
  videoId: VideoId, channel?: TextChannel
): ThreadChannel | undefined {
  return channel?.threads.cache
    .find (thr => thr.name === `Translation relay ${videoId}`)
}

async function announceIfNotDone (
  frame: DexFrame, gid: Snowflake
): Promise<void> {
  const notices  = await getRelayNotices (gid)
  const announce = notices.get (frame.id)
  const g        = await getSettings (gid)
  if (!announce && frame.status === 'live') notifyOneGuild (g, {
    subbedGuilds: [g],
    feature: 'relay',
    streamer: streamers.find (s => s.ytId === frame.channel.id)!,
    embedBody: `
      I will now relay translations from live translators.
      https://youtu.be/${frame.id}
    `,
    emoji: emoji.holo,
    videoId: frame.id
  })
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
    msgId: msg?.id,
    discordCh: msg?.channel.id,
    body: cmt.body,
    ytId: cmt.id,
    author: cmt.name,
    timestamp,
    stream: frame.id,
    absoluteTime: cmt.time
  }, gid!)
}

function extractComments (jsonl: string): ChatComment[] {
  const cmts = jsonl
    .toString ()
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

function isGossip (text: string, streamer: Streamer, frame: DexFrame): boolean {
  const isOwnChannel    = frame.channel.id === streamer.ytId
  const isCollab        = frame.description.includes (streamer.twitter)
  const mentionsWatched = text
    .toLowerCase ()
    .split (' ')
    .some (w => streamer.aliases.some (a => a === w))
  
  return !isOwnChannel && !isCollab && mentionsWatched
}


interface RelayData {
  discordCh: TextChannel
  from: string
  inStream: VideoId
  deepLTl?: string
}

interface HolochatRelayData extends RelayData {
  to: StreamerName
  content: string
}

interface TlRelayData extends RelayData {
  cmt: ChatComment
  g: GuildSettings
  frame: DexFrame
}
