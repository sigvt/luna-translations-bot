import { Command, createEmbedMessage, reply } from '../../helpers/discord'
import { getSettings, updateSettings } from '../db/functions'
import { Message } from 'discord.js'

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
  callback: async (msg: Message): Promise<void> => {
    const settings   = await getSettings (msg)
    const toggleMods = settings.deepl === true ? disableMods
                                               : enableMods
    toggleMods (msg)
  }
}

///////////////////////////////////////////////////////////////////////////////

function disableMods (msg: Message): void {
  updateSettings (msg, { modMessages: false })
  reply (msg, createEmbedMessage (`
   :tools: I will no longer relay mod messages.
   (Channel owner and other Hololive members will still be relayed.)
  `))
}

function enableMods (msg: Message): void {
  updateSettings (msg, { modMessages: true })
  reply (msg, createEmbedMessage (`
    :tools: I will now relay mod messages.
  `))
}
