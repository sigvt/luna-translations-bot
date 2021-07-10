import { Command, createEmbedMessage, emoji, reply } from '../discordHelpers'
import { oneLine } from 'common-tags'
import { getSettings, updateSettings } from '../db'
import { Message, Snowflake } from 'discord.js'

export const deepl: Command = {
  config: {
    aliases:   [],
    permLevel: 2
  },
  help: {
    category: 'Relay',
    usage:    'deepl',
    description: oneLine`
      Toggles automatic DeepL translation for Hololive members' chat messages.
      (Also affects tl.holochats)
    `,
  },
  callback: async (msg: Message): Promise<void> => {
    const settings    = await getSettings (msg)
    const toggleDeepL = settings.deepl === true ? disableDeepL
                                                : enableDeepL
    toggleDeepL (msg)
  }
}

///////////////////////////////////////////////////////////////////////////////

function disableDeepL (msg: Message): void {
  updateSettings (msg, { deepl: false })
  reply (msg, createEmbedMessage ({ body: oneLine`
    ${emoji.deepl} I will no longer translate Hololive members' chats
    with DeepL.
  `}))
}

function enableDeepL (msg: Message): void {
  updateSettings (msg, { deepl: true })
  reply (msg, createEmbedMessage ({ body: `
    ${emoji.deepl} I will now translate Hololive members' chats with DeepL.
  `}))
}
