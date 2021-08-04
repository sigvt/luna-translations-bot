import { debug } from '../../helpers'
import { tryOrDefault } from '../../helpers/tryCatch'
import { frameEmitter } from '../holodex/frameEmitter'
import { DexFrame, isPublic, VideoId } from '../holodex/frames'
import { getChatProcess } from './chatProcesses'
import { isSupported, StreamerName, streamers } from '../../core/db/streamers'
import { emoji, findTextChannel, send } from '../../helpers/discord'
import { Message, Snowflake, TextChannel } from 'discord.js'
import { tl } from '../deepl'
import { addToBotRelayHistory, addToGuildRelayHistory, getSubbedGuilds } from '../../core/db/functions'
import { oneLine } from 'common-tags'
import { isHoloID, isStreamer, isTl } from './commentBooleans'
import { GuildSettings, WatchFeature, WatchFeatureSettings } from '../../core/db/models'
import { retryFiveTimesThenPostLog } from './closeHandler'
import { logCommentData } from './logging'

frameEmitter.on ('frame', frame => {
  if (isPublic (frame) && isSupported (frame.channel.id)) setupRelay (frame)
})

export function setupRelay (frame: DexFrame): void {
  const chat = getChatProcess (frame.id)

  chat.stdout.on ('data', (data: string) => processComments (frame, data))
  chat.on ('close', exitCode => retryFiveTimesThenPostLog (frame, exitCode))
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
    const features: WatchFeature[] = ['relay', 'holochats']
    const guilds     = await getSubbedGuilds (frame.channel.id, features)
    const streamer   = streamers.find (s => s.ytId === frame.channel.id)
    const author     = streamers.find (s => s.ytId === cmt.id)?.name
    const mustDeepL  = guilds.some (g => g.deepl)
                    || isStreamer (cmt.id) && !isHoloID (streamer)
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
            from:      author!,
            inStream:  frame.id,
            deepLTl:   mustShowTl ? deepLTl : undefined,
          }

          if (discordCh === undefined) {
            debug (`Problem with watch entry ${g._id} / ${e.discordCh}`)
            return
          }
          if (isStreamer (cmt.id))  {
            relayHolochat ({ ...data, to: streamer!.name, content: cmt.body, })
          }
          if (isTl (cmt.body, g)) {
            relayTl ({...data, cmt, g, frame, })
          }
        })
      })
    })
  })
}

function relayHolochat (
  { discordCh, from, to, content, deepLTl, inStream }: HolochatRelayData
): void {
  send (discordCh, oneLine`
    ${emoji.holo} **${from}** in ${to}'s chat:
    \`${content.replaceAll ('`', "''")}\`
    ${deepLTl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''}
    \n<https://youtu.be/${inStream}>
  `)
}

function relayTl (
  { discordCh, from, inStream, deepLTl, cmt, g, frame }: TlRelayData
): void {
  const mustPost = cmt.isOwner
                || isTl (cmt.body, g)
                || isStreamer (cmt.id)
                || (cmt.isMod && g.modMessages)

  const premoji = isTl (cmt.body, g)  ? ':speech_balloon:'
                : isStreamer (cmt.id) ? emoji.holo
                                      : ':tools:'

  const url = frame.status === 'live' ? ''
            : deepLTl                 ? `| https://youtu.be/${inStream}`
                                      : `\nhttps://youtu.be/${inStream}`

  const author = isTl (cmt.body, g) ? `||${from}:||` : `**${from}:**`
  const text   = cmt.body.replaceAll ('`', "''")

  if (mustPost) {
    send (discordCh, `${premoji} ${author} \`${text}\`${url}`)
    .then (msg => saveComment (cmt, frame, 'guild', g._id, msg))
    .catch (debug)
  }
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
  return g[f].filter (entry => entry.streamer === streamer)
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
