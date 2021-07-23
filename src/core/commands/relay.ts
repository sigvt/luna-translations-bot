import { Command, emoji } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/watchFeatures'

const usage = 'relay <add|remove> <streamer name>'

export const relay: Command = {
  config: {
    aliases:   ['subscribe', 'sub', 'r', 'watch'],
    permLevel: 2
  },
  help: {
    category: 'Relay',
    usage,
    description: oneLine`
      Start or stop relaying a streamer's translations (and owner/other
      streamer messages), in the current Discord channel.
    `,
  },
  callback: async (msg: Message, [verb, ...name]: string[]): Promise<void> => {
    const streamer = name.join (' ')
    validateInputAndModifyEntryList ({
      msg, verb, streamer, usage,
      feature: 'relay',
      add: {
        success: `:speech_balloon: Relaying TLs for`,
        failure: `
           :warning: ${streamer} is already being relayed in this channel
        `
      },
      remove: {
        success: `:speech_balloon: Stopped relaying TLs for`,
        failure: oneLine`
          :warning: ${streamer}'s translations weren't already being relayed
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
      },
    })
  }
}
