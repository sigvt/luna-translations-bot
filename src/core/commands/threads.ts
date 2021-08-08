import { toggleSetting } from '../db/functions'
import { Message } from 'discord.js'
import { Command } from '../../helpers/discord'
import { oneLine } from 'common-tags'

export const threads: Command = {
  config: {
    aliases:   ['togglethreads', 'thread', 'togglethread'],
    permLevel: 2
  },
  help: {
    category: 'Relay',
    usage:    'threads',
    description: oneLine`
      Toggles the posting of translations in threads.
      Requires Public Threads permissions.
    `
  },
  callback: (msg: Message): void => {
    toggleSetting ({
      msg, setting: 'threads',
      enable: `
        :hash: I will now relay translations in a thread.
        This requires "Public Threads" permissions.
        If given "Manage Messages" permissions, I will pin each thread for 24h.
      `,
      disable: ':hash: I will no longer relay translations in a thread.'
    })
  }
}
