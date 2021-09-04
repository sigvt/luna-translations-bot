/**
 * @file This file manages addition and removals from WatchFeatureSettings
 * via Discord command.
 **/
import {
  createEmbed, createEmbedMessage, emoji, reply
} from '../../../helpers/discord'
import { match } from '../../../helpers/language'
import { getSettings, updateSettings } from './'
import { EmbedFieldData, Message, Snowflake } from 'discord.js'
import { config } from '../../../config'
import {
  findStreamerName, replyStreamerList, StreamerName, streamers
} from '../../db/streamers/'
import {
  WatchFeatureSettings, WatchFeature, GuildSettings
} from '../../db/models'
import { getAllSettings } from './guildSettings'
import { isEmpty, splitEvery } from 'ramda'
const { isArray } = Array

export function validateInputAndModifyEntryList ({
  msg, verb, streamer, role, usage, feature, add, remove
}: WatchFeatureModifyOptions): void {
  const isVerbValid       = validVerbs.includes (verb as any)
  const validatedVerb     = <ValidVerb> verb
  const validatedStreamer = <StreamerName> findStreamerName (streamer)
  const mustShowList      = verb !== 'clear' && !validatedStreamer
  const g                 = getSettings (msg.guild!)
  const modifyIfValid     = !isVerbValid ? showHelp
                          : mustShowList ? replyStreamerList
                                         : modifyEntryList
                                         
  modifyIfValid ({ g, msg, usage, feature, role, add, remove,
    verb: validatedVerb,
    streamer: validatedStreamer,
  })
}

export function getSubbedGuilds (
  nameOrChannelId: string,
  features: WatchFeature | WatchFeature[],
): GuildSettings[] {
  const guilds   = getAllSettings ()
  const streamer = streamers.find (s => s.ytId === nameOrChannelId)?.name
                ?? streamers.find (s => s.name === nameOrChannelId)?.name as any
  const feats    = isArray (features) ? features : [features]

  return guilds.filter (
    g => getSubs (g, feats).some (sub => [streamer, 'all'].includes (sub))
  )
}

///////////////////////////////////////////////////////////////////////////////

const validVerbs = ['add', 'remove', 'clear'] as const
type ValidVerb   = typeof validVerbs[number]

function showHelp (
  { msg, feature, usage }: ValidatedOptions
): void {
  const settings = getSettings (msg.guild!)
  const list     = getEntryList (settings[feature], 60)
  const embeds   = (isEmpty (list) ? [''] : list)
    .map ((list, i) => createEmbedMessage (
      i > 0 ? '.' : `**Usage:** \`${config.prefix}${usage}\n\n\``
      + `**Currently relayed:**\n${list}`
    ))

  reply (msg, embeds)
}

function modifyEntryList (opts: ValidatedOptions): void {
  const g     = getSettings (opts.msg)
  const isNew = g[opts.feature].every (
    r => r.discordCh != opts.msg.channel.id || r.streamer != opts.streamer
  )
  const applyModification = match (opts.verb, {
    add:    isNew  ? addEntry    : notifyNotNew,
    remove: !isNew ? removeEntry : notifyNotFound,
    clear:  clearEntries
  })

  applyModification (opts)
}

function addEntry (
  { g, feature, msg, streamer, role, add }: ValidatedOptions
): void {
  const newEntries = [...g[feature], {
    streamer,
    discordCh: msg.channel.id,
    ...(role ? { roleToNotify: role } : {})
  }]

  updateSettings (msg, { [feature]: newEntries })
  reply (msg, createEmbed ({ fields: [{
    name:   add.success,
    value:  streamer,
    inline: true
  }, {
    name:  `${emoji.discord} In channel`,
    value: `<#${msg.channel.id}>`,
    inline: true
  }, ...( role ? [{
    name:  `${emoji.ping} @mentioning`,
    value: `<@&${role}>`,
    inline: true
  }] : []),
    ...getEntryFields (newEntries)
  ]}, false))
}

function removeEntry (
  { feature, msg, streamer, remove, g }: ValidatedOptions
): void {
  const newEntries = g[feature]
    .filter (r => r.discordCh !== msg.channel.id || r.streamer !== streamer)

  updateSettings (msg, { [feature]: newEntries })
  reply (msg, createEmbed ({ fields: [
    {
      name:   remove.success,
      value:  streamer,
      inline: true
    },
    {
      name:  `${emoji.discord} In channel`,
      value: `<#${msg.channel.id}>`,
      inline: true
    },
    ...getEntryFields (newEntries)
  ]}, false))
}

function notifyNotNew ({ msg, add, g, feature }: ValidatedOptions): void {
  reply (msg, createEmbed ({
    description: add.failure, fields: getEntryFields (g[feature])
  }, false))
}


function notifyNotFound ({msg, remove, g, feature}: ValidatedOptions): void {
  reply (msg, createEmbed ({ fields: [
    {
      name:   'Error',
      value:  remove.failure,
      inline: false
    },
    ...getEntryFields (g[feature])
  ]}, false))
}

async function clearEntries (
  { feature, msg }: ValidatedOptions
): Promise<void> {
  updateSettings (msg, { [feature]: [] })
  reply (msg, createEmbedMessage (`Cleared all entries for ${feature}.`))
}

function getEntryFields (entries: WatchFeatureSettings[]): EmbedFieldData[] {
  return getEntryList (entries)
  .map (list => ({
    name: 'Currently relayed',
    value: list || 'No one',
    inline: false
  }))
}

/** Returns an array of embed-sized strings */
function getEntryList (
  entries: WatchFeatureSettings[], linesPerChunk: number = 20
): string[] {
  const lines = entries.map (x => x.roleToNotify
    ? `${x.streamer} in <#${x.discordCh}> @mentioning <@&${x.roleToNotify}>`
    : `${x.streamer} in <#${x.discordCh}>`
  )
  const chunks = splitEvery (linesPerChunk) (lines)

  return chunks.map (chunk => chunk.join ('\n'))
}

function getSubs (g: GuildSettings, fs: WatchFeature[]): StreamerName[] {
  return fs.flatMap (f => g[f].map (entry => entry.streamer))
}

interface WatchFeatureModifyOptions {
  msg:      Message,
  verb:     string
  streamer: string
  role?:    Snowflake
  usage:    string
  feature:  WatchFeature
  add:      AttemptResultMessages
  remove:   AttemptResultMessages
}

export interface ValidatedOptions extends WatchFeatureModifyOptions {
  g:        GuildSettings
  verb:     ValidVerb
  streamer: StreamerName
}

interface AttemptResultMessages {
  success: string
  failure: string
}
