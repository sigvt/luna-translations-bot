import { Command, emoji, validateRole } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/functions'
import { init, last } from 'ramda'

const usage = 'twitcast <add|remove> <streamer name> <optional:roleID|mention>'

export const twitcast: Command = {
  config: {
    aliases:   ['tc', 'twitcasting'],
    permLevel: 2
  },
  help: {
    category: 'Notifs',
    usage,
    description: oneLine`
      Starts or stops sending twitcasting livestream notifs
      in the current channel.
    `,
  },
  callback: async (msg: Message, [verb, ...name]: string[]): Promise<void> => {
    const role     = validateRole (msg.guild!, last (name))
    const streamer = role ? init (name).join (' ') : name.join (' ')

    validateInputAndModifyEntryList ({
      msg, verb, streamer, role, usage,
      feature: 'twitcasting',
      add: {
        success: `${emoji.tc} Notifying twitcasting lives for`,
        failure: oneLine`
          :warning: ${streamer}'s twitcasting lives are already being
          relayed in this channel.
        `
      },
      remove: {
        success: `${emoji.tc} Stopped notifying twitcasting lives by`,
        failure: oneLine`
          :warning: ${streamer}'s twitcasting lives weren't already being
          notified in <#${msg.channel.id}>. Are you in the right channel?
        `,
      },
    })
  }
}
