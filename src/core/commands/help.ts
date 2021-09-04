import { commands } from '../lunaBotClient'
import { getPermLevel, getSettings } from '../db/functions'
import { EmbedField, Message } from 'discord.js'
import { Map, Set } from 'immutable'
import { GuildSettings, WatchFeatureSettings, WatchFeature } from '../db/models'
import { toTitleCase } from '../../helpers'
import { head, isEmpty } from 'ramda'
import { Command, createEmbed, emoji, reply } from '../../helpers/discord'
import { oneLine, stripIndents } from 'common-tags'
import { config } from '../../config'

export const help: Command = {
  config: {
    aliases:   ['h', 'halp'],
    permLevel: 0
  },
  help: {
    category: 'General',
    usage:    'help <category>',
    description: oneLine`
      Displays available commands for your permission level
      in the requested category.
    `
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    const askedCategory = toTitleCase (head (args) ?? '')
    const commands      = await getCommandsAtUserLevel (msg)
    const categories    = getCategoriesOfCommands (commands)
    const helpToShow    = categories.includes (askedCategory)
                          ? getCategoryHelp (askedCategory)
                          : getMainHelp (categories, getSettings (msg))

    reply (msg, helpToShow)
  }
}

///////////////////////////////////////////////////////////////////////////////

async function getCommandsAtUserLevel (msg: Message) {
  const authorLevel = await getPermLevel (msg)
  return commands.filter (x => x.config.permLevel <= authorLevel.level)
}

function getCategoriesOfCommands (commands: Map<string, Command>): Set<string> {
  return commands.map (cmd => cmd.help.category)
                 .toSet ()
                 .filter (cat => cat !== 'System')
}

function getCategoryHelp (category: string) {
  const fields = commands
    .filter (cmd => cmd.help.category === category)
    .map (cmd => ({
      name:   config.prefix + cmd.help.usage,
      value:  cmd.help.description,
      inline: false
    }))
    .toList () // discards keys
    .toArray ()
    .sort ((fa, fb) => fa.name.localeCompare (fb.name))

  return createEmbed ({ fields })
}

function getMainHelp (categories: Set<string>, settings: GuildSettings) {
  return createEmbed ({
    description:
      ':candy: I am the Cutest Genius Sexy Beautiful Professor! :candy:',
    fields: [
      ...getCategoryFields (categories),
      getSettingsField (settings),
      getBotManagerField (settings)
    ]
  }, true)
}

function getCategoryFields (categories: Set<string>): Set<EmbedField> {
  return categories.map (category => ({
    name: category,
    value: `${config.prefix}help ${category.toLowerCase ()}`,
    inline: true
  }))
}

function getSettingsField (
  { relay, gossip, cameos, community, youtube, twitcasting }: GuildSettings
): EmbedField {
  return {
    name: 'Current settings', inline: false,
    value: stripIndents`
      :speech_balloon: **Translation relay:** ${getWatchList ('relay', relay)}
      ${emoji.holo} **Live chat cameos:** ${getWatchList ('cameos', cameos)}
      ${emoji.peek} **Gossip:** ${getWatchList ('gossip', gossip)}
      :family_mmbb: **Community posts:** ${getWatchList ('community', community)}
      ${emoji.yt} **YouTube lives:** ${getWatchList ('youtube', youtube)}
      ${emoji.tc} **TwitCasting lives:** ${getWatchList ('twitcasting', twitcasting)}
    `
  }
}

function getBotManagerField (settings: GuildSettings): EmbedField {
  return {
    name: 'Bot managers', inline: false,
    value: `
      :tools: **Admins:** ${getRoleList ('admins', settings)}
      :no_entry: **Blacklisters:** ${getRoleList ('blacklisters', settings)}
    `,
  }
}

function getWatchList (
  feature: WatchFeature, entries: WatchFeatureSettings[]
): string {
  const first = head (entries)
  const firstMention = first?.roleToNotify
                         ? `mentioning <@&${first.roleToNotify}>`
                         : ''
  const templates = {
    empty: `None. Run \`${config.prefix}${feature}\``,
    one: `${first?.streamer} in <#${first?.discordCh}> ${firstMention}`,
    many: `Multiple. Run \`${config.prefix}${feature}\``
  }

  return isEmpty (entries)    ? templates.empty
       : entries.length === 1 ? templates.one
                              : templates.many
}

function getRoleList (
  type: 'admins' | 'blacklisters', settings: GuildSettings
): string {
  return settings[type].map (id => `<@&${id}>`).join ('')
      || `None yet. run ${config.prefix}${type}`
}
