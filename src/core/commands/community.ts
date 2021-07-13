import { Command, emoji, validateRole } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/watchFeatures'
import { init, last } from '../../helpers'

const usage = 'community <add|remove> <streamer name> <optional:roleID|mention>'

export const community: Command = {
  config: {
    aliases:   ['comm'],
    permLevel: 2
  },
  help: {
    category: 'Notifs',
    usage,
    description: `
      Starts or stops sending community post notifs in the current channel.
    `,
  },
  callback: async (msg: Message, [verb, ...name]: string[]): Promise<void> => {
    const role     = validateRole (msg.guild!, last (name))
    const streamer = role ? init (name).join (' ') : name.join (' ')
    validateInputAndModifyEntryList ({
      msg, verb, streamer, role, usage,
      feature: 'community',
      add: {
        success: `:family_mmbb: Notifying community posts by ${emoji.nbsp}`,
        failure: oneLine`
          :warning: ${streamer}'s community posts are already being
          relayed in this channel.
        `
      },
      remove: {
        success: `:family_mmbb: Stopped notifying community posts by ${emoji.nbsp}`,
        failure: oneLine`
          :warning: ${streamer}'s community posts weren't already being notified
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
      },
    })
  }
}
