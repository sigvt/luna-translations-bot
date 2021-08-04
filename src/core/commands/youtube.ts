import { Command, emoji, validateRole } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/functions'
import { init, last } from 'ramda'

const usage = 'youtube <add|remove> <streamer name> <optional:roleID|mention>'

export const youtube: Command = {
  config: {
    aliases:   ['yt'],
    permLevel: 2
  },
  help: {
    category: 'Notifs',
    usage,
    description: oneLine`
      Starts or stops sending youtube livestream notifs
      in the current channel.
    `,
  },
  callback: async (msg: Message, [verb, ...name]: string[]): Promise<void> => {
    const role     = validateRole (msg.guild!, last (name))
    const streamer = role ? init (name).join (' ') : name.join (' ')
    validateInputAndModifyEntryList ({
      msg, verb, streamer, role, usage,
      feature: 'youtube',
      add: {
        success: `${emoji.yt} Notifying YouTube lives for`,
        failure: oneLine`
          :warning: ${streamer}'s YouTube lives are already being
          relayed in this channel.
        `
      },
      remove: {
        success: `${emoji.yt} Stopped notifying YouTube lives by`,
        failure: oneLine`
          :warning: ${streamer}'s YouTube lives weren't already being
          notified in <#${msg.channel.id}>. Are you in the right channel?
        `,
      },
    })
  }
}
