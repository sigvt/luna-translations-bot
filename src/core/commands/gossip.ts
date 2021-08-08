import { Command, emoji } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/functions'

const usage = 'gossip <add|remove> <streamer name>'

export const gossip: Command = {
  config: {
    aliases:   [],
    permLevel: 2
  },
  help: {
    category: 'Notifs',
    usage,
    description: oneLine`
      Start or stop relaying a streamer's mentions in other
      streamers' livechat (includes translations and streamer comments).
    `,
  },
  callback: (msg: Message, [verb, ...name]: string[]): void => {
    const streamer = name.join (' ')
    validateInputAndModifyEntryList ({
      msg, verb, streamer, usage,
      feature: 'gossip',
      add: {
        success: `${emoji.peek} Relaying gossip other chats`,
        failure: oneLine`
          :warning: Gossip about ${streamer} in other chats already being
          relayed in this channel.
        `
      },
      remove: {
        success: `${emoji.holo} Stopped relaying gossip`,
        failure: oneLine`
          :warning: Gossip about ${streamer} wasn't already being relayed
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
      },
    })
  }
}
