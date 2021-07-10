import { Command, createEmbed, reply } from '../discordHelpers'
import { commands } from '../lunaBotClient'
import { getPermLevel, getSettings } from '../db'
import { Message } from 'discord.js'
import { Map, Set } from 'immutable'
import { GuildSettings } from '../db/models'
import { head, log, toTitleCase } from '../../helpers'
import { oneLine } from 'common-tags'


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
                          : getMainHelp (categories, await getSettings (msg))

    reply (msg, helpToShow)
    log (await getSettings (msg))
  }
}

//// PRIVATE //////////////////////////////////////////////////////////////////

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
      name:   cmd.help.usage,
      value:  cmd.help.description,
      inline: false
    }))
    .toList () // discards keys
    .toArray ()

  return createEmbed ({ fields })
}

function getMainHelp (categories: Set<string>, settings?: GuildSettings) {
  log ('not implemented')
  return createEmbed ({  })
}

// exports.run = (client, message, args, level) => {

  // const showMainHelp = (categories) => {
    // const sets = message.settings
    // const hasRelay = sets.streamer && sets.streamChannel
    // const hasYT = sets.youtubeStreamer && sets.youtubeChannel
    // const hasTC = sets.twitcastingStreamer && sets.twitcastingChannel
    // const hasStalk = sets.stalkStreamer && sets.stalkChannel
    // const hasCommunity = sets.communityStreamer && sets.communityChannel
    // const ytRoleObj = sets.youtubeRole
    // const ytRole = ytRoleObj ? `<@&${ytRoleObj.id}>` : 'no one'
    // const tcRoleObj = sets.twitcastingRole
    // const tcRole = tcRoleObj ? `<@&${tcRoleObj.id}>` : 'no one'
    // const communityRoleObj = sets.communityRole
    // const communityRole = communityRoleObj ? `<@&${communityRoleObj.id}>` : 'no one'

    // const relayCurrent =
      // ':speech_balloon: **Translation relay:** '
      // + (hasRelay
        // ? `${sets.streamer} in ${sets.streamChannel}`
        // : 'No one yet. Run `tl.relay`')
    // const stalkCurrent =
      // '\n<:Hololive:832638929919803422> **Live chat cameos:** '
      // + (hasStalk
        // ? `${sets.stalkStreamer} in ${sets.stalkChannel}`
        // : 'No one yet. Run `tl.holochats`')
    // const communityCurrent =
      // '\n :family_mmbb: **Community posts:** '
      // + (hasCommunity
        // ? `${sets.communityStreamer} in ${sets.communityChannel} @mentioning ${communityRole}.`
        // : 'No one yet. Run `tl.community`')
    // const ytCurrent =
      // '\n <:YouTube:832638929802493962> **YouTube lives:** '
      // + (hasYT
        // ? `${sets.youtubeStreamer} in ${sets.youtubeChannel} @mentioning ${ytRole}.`
        // : 'No one yet. Run `tl.youtube`')
    // const tcCurrent =
      // '\n<:TwitCasting:832638929608900689> **TwitCasting lives:** '
      // + (hasTC
        // ? `${sets.twitcastingStreamer} in ${sets.twitcastingChannel} @mentioning ${tcRole}.`
        // : 'No one yet. Run `tl.twitcast`')

    // const currentSettings =
      // relayCurrent + stalkCurrent + communityCurrent + ytCurrent + tcCurrent

    // const hasAdminRole = sets.adminRole
    // const hasModRole = sets.modRole
    // const botManagers =
      // `:tools: **Admins:**`
      // + (hasAdminRole ? `<@&${sets.adminRole.id}>`
                      // : 'none yet. run `tl.admins` as server owner')
      // +'\n:no_entry: **Blacklisters: **'
      // + (hasModRole ? `<@&${sets.modRole.id}>`
                    // : 'none yet. run `tl.blacklisters`')

    // const embed = client.makeEmbed({
      // 'description':
        // ':candy: I am the Cutest Genius Sexy Beautiful Professor! :candy: ',
      // 'fields': [
        // ...categories.map(cat => ({
          // 'name': cat,
          // 'value': `\`tl.help ${cat.toLowerCase()}\``,
          // 'inline': true,
        // })),
        // {
          // 'name': 'Current settings',
          // 'value': currentSettings
        // },
        // {
          // 'name': 'Bot managers',
          // 'value': botManagers
        // },
      // ]
    // })

    // return message.reply({embed})
  // }

  // const showCategoryHelp = (commands, category) => {
    // const fields = commands.reduce((helpFields, cmd) => {
      // const cmdCat = cmd.help.category.toLowerCase()
      // if (cmdCat !== category) return helpFields
      // return [
        // ...helpFields,
        // {
          // 'name': cmd.help.usage,
          // 'value': cmd.help.description,
        // }
      // ]
    // }, [])

    // const embed = client.makeEmbed({
      // "fields": fields
    // })

    // return message.reply({embed})
  // }

  // main()
// }
