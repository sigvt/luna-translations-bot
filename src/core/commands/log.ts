import { Message } from 'discord.js'
import { head } from 'ramda'
import { config } from '../../config'
import { Command, createEmbedMessage, reply, send } from '../../helpers/discord'
import { getRelayHistory, filterAndStringifyHistory } from '../db/functions'

export const log: Command = {
  config: {
    aliases:   ['history', 'tlLog', 'relayLog'],
    permLevel: 1
  },
  help: {
    category:    'Relay',
    usage:       'log <video ID>',
    description: 'Posts the archived relay log for a given video ID.'
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    const videoId = head (args)
    const history = await getRelayHistory (videoId)

    if (args.length === 0){
      reply (msg, createEmbedMessage (`
        **Usage:** \`${config.prefix}${log.help.usage}\`
      `))
    } else if (!history) {
      reply (msg, createEmbedMessage (`Log not found for ${videoId}`))
    } else {
      const tlLog = await filterAndStringifyHistory (msg, history)
      send (msg.channel, {
        content: `Here is the TL log for <https://youtu.be/${videoId}>`,
        files:   [{ attachment: Buffer.from (tlLog), name: `${videoId}.txt` }]
      })
    }
  }
}
