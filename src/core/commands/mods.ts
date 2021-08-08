import { toggleSetting } from '../db/functions'
import { Message } from 'discord.js'
import { Command } from '../../helpers/discord'

export const mods: Command = {
  config: {
    aliases:   ['togglemods'],
    permLevel: 2
  },
  help: {
    category: 'Relay',
    usage:    'mods',
    description: 'Toggles the relaying of mod messages serverwide.'
  },
  callback: (msg: Message): void => {
    toggleSetting ({
      msg, setting: 'modMessages',
      enable: `:tools: I will now relay mod messages.`,
      disable: `
        :tools: I will no longer relay mod messages.
        (Channel owner and other Hololive members will still be relayed.)
      `
    })
  }
}
