import { Command, validateRole } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/functions'
import { init, last } from 'ramda'

const usage = 'relay <add|remove|clear> <streamer name> <optional:roleID|mention>'

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
  callback: (msg: Message, [verb, ...name]: string[]): void => {
    const role     = validateRole (msg.guild!, last (name))
    const streamer = role ? init (name).join (' ') : name.join (' ')

    validateInputAndModifyEntryList ({
      msg, verb, streamer, role, usage,
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
