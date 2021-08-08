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

export function validateInputAndModifyEntryList (
  { msg, verb, streamer, role, usage, feature, add, remove }: ValidateFnOptions
) {
  const isVerbValid       = validVerbs.includes (verb as any)
  const validatedVerb     = <ValidVerb> verb
  const validatedStreamer = <StreamerName> findStreamerName (streamer)
  const mustShowList      = verb !== 'clear' && !validatedStreamer
  const modifyIfValid     = !isVerbValid ? showHelp
                          : mustShowList ? replyStreamerList
                                         : modifyEntryList
                                         
  modifyIfValid ({ msg, usage, feature, role, add, remove,
    verb: validatedVerb,
    streamer: validatedStreamer,
  })
}

export async function getSubbedGuilds (
  nameOrChannelId: string, features: WatchFeature | WatchFeature[]
): Promise<GuildSettings[]> {
  const guilds   = await getAllSettings ()
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

async function showHelp (
  { msg, feature, usage }: ValidatedOptions
): Promise<void> {
  const settings = await getSettings (msg.guild!)
  const list     = getEntryList (settings[feature], 60)
  const embeds   = (isEmpty (list) ? [''] : list)
    .map ((list, i) => createEmbedMessage (
      i > 0 ? '' : `**Usage:** \`${config.prefix}${usage}\n\n\``
      + `**Currently relayed:**\n${list}`
    ))

  reply (msg, embeds)
}


async function modifyEntryList (opts: ValidatedOptions): Promise<void> {
  const applyModification = match (opts.verb, {
    add:    addEntry,
    remove: removeEntry,
    clear:  clearEntries
  })

  applyModification (opts)
}

async function addEntry (
  { feature, msg, streamer, role, add }: ValidatedOptions
): Promise<void> {
  const settings = await getSettings (msg)
  const isNew = settings[feature].every (
    r => r.discordCh != msg.channel.id || r.streamer != streamer
  )
  if (isNew) {
    const newEntries = [...settings[feature], {
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
  } else {
    reply (msg, createEmbed ( {
      description: add.failure,
      fields: getEntryFields (settings[feature])
    }, false))
  }
}

async function removeEntry (
  { feature, msg, streamer, remove }: ValidatedOptions
): Promise<void> {
  const settings = await getSettings (msg)
  const entry = settings[feature].find (
    r => r.discordCh === msg.channel.id && r.streamer === streamer
  )
  if (entry !== undefined) {
    const newEntries = settings[feature].filter (
      r => r.discordCh !== msg.channel.id || r.streamer !== streamer
    )
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
  } else {
    reply (msg, createEmbed ({ fields: [
      {
        name:   'Error',
        value:  remove.failure,
        inline: false
      },
      ...getEntryFields (settings[feature])
    ]}, false))
  }
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
  const chunks = lines |> splitEvery (linesPerChunk)

  return chunks.map (chunk => chunk.join ('\n'))
}

function getSubs (g: GuildSettings, fs: WatchFeature[]): StreamerName[] {
  return fs.flatMap (f => g[f].map (entry => entry.streamer))
}

interface ValidateFnOptions {
  msg:      Message,
  verb:     string
  streamer: string
  role?:    Snowflake
  usage:    string
  feature:  WatchFeature
  add:      AttemptResultMessages
  remove:   AttemptResultMessages
}

export interface ValidatedOptions {
  msg:      Message,
  verb:     ValidVerb
  streamer: StreamerName
  role?:    Snowflake
  usage:    string
  feature:  WatchFeature
  add:      AttemptResultMessages
  remove:   AttemptResultMessages
}

interface AttemptResultMessages {
  success: string
  failure: string
}
