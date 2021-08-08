import { Message } from 'discord.js'
import { head, isEmpty } from 'ramda'
import { config } from '../../config'
import { Command, createEmbedMessage, reply, send } from '../../helpers/discord'
import { VideoId } from '../../modules/holodex/frames'
import { getRelayHistory, filterAndStringifyHistory } from '../db/functions'
import { RelayedComment } from '../db/models/RelayedComment'

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
    const videoId    = head (args)
    const history    = await getRelayHistory (videoId)
    const processMsg = isEmpty (args) ? showHelp
                     : !history       ? notifyLogNotFound
                                      : sendLog

    processMsg (msg, videoId!, history!)
  }
}

function showHelp (msg: Message): void {
  reply (msg, createEmbedMessage (`
    **Usage:** \`${config.prefix}${log.help.usage}\`
  `))
}

function notifyLogNotFound (msg: Message, videoId: VideoId): void {
  reply (msg, createEmbedMessage (`Log not found for ${videoId}`))
}

async function sendLog (
  msg: Message, videoId: VideoId, history: RelayedComment[]
): Promise<void> {
  const tlLog = await filterAndStringifyHistory (msg, history)
  send (msg.channel, {
    content: `Here is the TL log for <https://youtu.be/${videoId}>`,
    files:   [{ attachment: Buffer.from (tlLog), name: `${videoId}.txt` }]
  })
}
