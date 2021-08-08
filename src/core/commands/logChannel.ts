import { Message, Snowflake } from 'discord.js'
import { head, isEmpty, isNil } from 'ramda'
import { Command, createEmbedMessage, reply } from '../../helpers/discord'
import { updateSettings } from '../db/functions'
import { client } from '../lunaBotClient'

export const logChannel: Command = {
  config: {
    aliases:   ['logchannel', 'logch', 'logCh'],
    permLevel: 2
  },
  help: {
    category:    'Relay',
    usage:       'logChannel <optional: channel>',
    description: 'Redirect TL logs to specified channel, or clear the setting.'
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    const channelMention = head (args)
    const channelId      = channelMention?.match(/<#(.*?)>/)?.[1]
    const channelObj     = client.channels.cache.find (c => c.id === channelId)
    const processMsg     = isEmpty (args)     ? clearSetting
                         : isNil (channelObj) ? respondInvalid
                                              : setLogChannel
    processMsg (msg, channelId!)
  }
}

function clearSetting (msg: Message): void {
  updateSettings (msg, { logChannel: undefined })
  reply (msg, createEmbedMessage ('Logs will be posted in the relay channel.'))
}

function respondInvalid (msg: Message): void {
  reply (msg, createEmbedMessage (`Invalid channel supplied.`))
}

function setLogChannel (msg: Message, channelId: Snowflake): void {
  updateSettings (msg, { logChannel: channelId })
  reply (msg, createEmbedMessage (`Logs will be posted in <#${channelId}>.`))
}
