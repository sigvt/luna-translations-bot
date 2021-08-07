import { Message } from 'discord.js'
import { head } from 'ramda'
import { Command, createEmbedMessage, reply, send } from '../../helpers/discord'
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

    if (args.length === 0) {
      updateSettings (msg, { logChannel: undefined })
      reply (msg, createEmbedMessage (
        `Tl logs will be posted in the relay channel.`
      ))
    } else if (!channelObj) {
      reply (msg, createEmbedMessage (`${channelMention} is invalid.`))
    } else {
      updateSettings (msg, { logChannel: channelId })
      reply (msg, createEmbedMessage (
        `TL logs will be posted in <#${channelId}>.`
      ))
    }
  }
}
