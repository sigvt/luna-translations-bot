/**
 * @file This file manages addition and removals from WatchFeatureSettings
 * via Discord command.
 **/
import { createEmbed, createEmbedMessage, emoji, reply } from '../../helpers/discord'
import { getSettings, updateSettings } from '../db'
import { Message, Snowflake } from 'discord.js'
import { config } from '../../config'
import { findStreamer, showStreamerList, StreamerName } from '../db/streamers/'
import { WatchFeatureSettings, WatchFeature } from '../db/models'

export function validateInputAndModifyEntryList (
  { msg, verb, streamer, role, usage, feature, add, remove }: ValidateFnOptions
) {
  const isVerbValid       = validVerbs.includes (verb as any)
  const validatedVerb     = <ValidVerb> verb
  const validatedStreamer = <StreamerName> findStreamer (streamer)
  const modifyIfValid     = !isVerbValid ? showHelp
                          : !streamer    ? showStreamerList
                                         : modifyEntryList

  modifyIfValid ({ msg, usage, feature, role, add, remove,
    verb: validatedVerb,
    streamer: validatedStreamer,
  })
}

///////////////////////////////////////////////////////////////////////////////

const validVerbs = ['add', 'remove'] as const
type ValidVerb   = typeof validVerbs[number]

async function showHelp (
  { msg, feature, usage }: ValidatedOptions
): Promise<void> {
  const settings = await getSettings (msg.guild!)
  reply (msg, createEmbedMessage (`
    **Usage:** \`${config.prefix}${usage}\`
    **Currently relayed:**\n${getEntryList (settings[feature])}
  `))
}
async function modifyEntryList (opts: ValidatedOptions): Promise<void> {
  const applyModification = opts.verb === 'add' ? addEntry : removeEntry
  applyModification (opts)
}

async function addEntry (
  { feature, msg, streamer, role, add }: ValidatedOptions
): Promise<void> {
  const settings = await getSettings (msg)
  const isNew = settings[feature].every (
    r => r.discordChannel != msg.channel.id || r.streamer != streamer
  )
  if (isNew) {
    const newEntries = [...settings[feature], {
      streamer,
      discordChannel: msg.channel.id,
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
    }] : []), {
      name:   'Currently relayed',
      value:  getEntryList (newEntries),
      inline: false
    }]}, false))
  } else {
    reply (msg, createEmbed ({ fields: [{
      name:   add.failure,
      value:  getEntryList (settings[feature]),
      inline: false
    }]}, false))
  }
}

async function removeEntry (
  { feature, msg, streamer, remove }: ValidatedOptions
): Promise<void> {
  const settings = await getSettings (msg)
  const entry = settings[feature].find (
    r => r.discordChannel === msg.channel.id && r.streamer === streamer
  )
  if (entry !== undefined) {
    const newEntries = settings[feature].filter (
      r => r.discordChannel !== msg.channel.id || r.streamer !== streamer
    )
    updateSettings (msg, { [feature]: newEntries })
    reply (msg, createEmbed ({ fields: [{
      name:   remove.success,
      value:  streamer,
      inline: true
    }, {
      name:  `${emoji.discord} In channel`,
      value: `<#${msg.channel.id}>`,
      inline: true
    }, {
      name:   'Currently relayed',
      value:  getEntryList (newEntries),
      inline: false
    }]}, false))
  } else {
    reply (msg, createEmbed ({ fields: [{
      name:   remove.failure,
      value:  getEntryList (settings.relay),
      inline: false
    }]}, false))
  }
}

function getEntryList (entries: WatchFeatureSettings[]): string {
  return entries.map (x => x.roleToNotify
    ? `${x.streamer} in <#${x.discordChannel}> @mentioning <@&${x.roleToNotify}>`
    : `${x.streamer} in <#${x.discordChannel}>`
  ).join ('\n')
}

interface ValidateFnOptions {
  msg:      Message,
  verb:     string,
  streamer: string,
  role?:    Snowflake,
  usage:    string,
  feature:  WatchFeature,
  add:      AttemptResultMessages,
  remove:   AttemptResultMessages
}

export interface ValidatedOptions {
  msg:      Message,
  verb:     ValidVerb,
  streamer: StreamerName,
  role?:    Snowflake,
  usage:    string,
  feature:  WatchFeature,
  add:      AttemptResultMessages,
  remove:   AttemptResultMessages
}

interface AttemptResultMessages {
  success: string,
  failure: string
}
