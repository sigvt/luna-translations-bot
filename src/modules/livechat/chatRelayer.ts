import { debug } from '../../helpers'
import { tryOrDefault } from '../../helpers/tryCatch'
import { frameEmitter } from '../holodex/frameEmitter'
import { DexFrame, isPublic, VideoId } from '../holodex/frames'
import { getChatProcess } from './chatProcesses'
import { Streamer, StreamerName, streamers } from '../../core/db/streamers'
import { emoji, findTextChannel, send } from '../../helpers/discord'
import { Message, Snowflake, TextChannel, ThreadChannel } from 'discord.js'
import { tl } from '../deepl'
import { addToBotRelayHistory, addToGuildRelayHistory, getSubbedGuilds, getRelayNotices, getSettings, getGuildData } from '../../core/db/functions'
import { isBlacklisted, isHoloID, isStreamer, isTl } from './commentBooleans'
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
    const features: WatchFeature[] = ['relay', 'cameos', 'gossip']
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

          if (f === 'cameos' && isStreamer (cmt.id) && !cmt.isOwner)  {
            relayCameo ({ ...data, to: streamer!.name, content: cmt.body, })
          }
          if (f === 'gossip' && (isStreamer (cmt.id) || isTl (cmt.body))) {
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

function relayCameo (
  { discordCh, from, to, content, deepLTl, inStream }: CameoRelayData,
  isGossip?: boolean
): void {
  const cleaned = content.replaceAll ('`', "'")
  const emj     = isGossip ? emoji.peek : emoji.holo
  const line1   = `${emj} **${from}** in **${to}**'s chat: \`${cleaned}\``
  const line2   = deepLTl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''
  const line3   = `\n<https://youtu.be/${inStream}>`
  send (discordCh, line1 + line2 + line3)
}

function relayGossip (
  e: WatchFeatureSettings, frame: DexFrame, data: CameoRelayData
): void {
  const streamer = streamers.find (s => s.name === e.streamer)
  if (isGossip (data.content, streamer!, frame)) relayCameo (data, true)
}

async function relayTlOrStreamerComment (
  { discordCh, from, inStream, deepLTl, cmt, g, frame }: TlRelayData
): Promise<void> {
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
): Promise<void> {
  const notices  = await getRelayNotices (gid)
  const announce = notices.get (frame.id)
  const g        = await getSettings (gid)
  if (!announce && frame.status === 'live') await notifyOneGuild (g, {
    subbedGuilds: [g], ...getRelayNotifyProps (frame)
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
  discordCh: TextChannel | ThreadChannel
  from: string
  inStream: VideoId
  deepLTl?: string
}

interface CameoRelayData extends RelayData {
  to: StreamerName
  content: string
}

interface TlRelayData extends RelayData {
  cmt: ChatComment
  g: GuildSettings
  frame: DexFrame
}
