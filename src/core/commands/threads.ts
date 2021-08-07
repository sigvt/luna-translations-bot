import { Command, createEmbedMessage, reply } from '../../helpers/discord'
import { getSettings, updateSettings } from '../db/functions'
import { Message } from 'discord.js'
import { oneLine } from 'common-tags'

export const threads: Command = {
  config: {
    aliases:   ['togglethreads'],
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
  callback: async (msg: Message): Promise<void> => {
    const settings      = await getSettings (msg)
    const toggleThreads = settings.threads === true ? disableThreads
                                                    : enableThreads
    toggleThreads (msg)
  }
}

///////////////////////////////////////////////////////////////////////////////

function disableThreads (msg: Message): void {
  updateSettings (msg, { threads: false })
  reply (msg, createEmbedMessage (`
   :hash: I will no longer relay translations in a thread.
  `))
}

function enableThreads (msg: Message): void {
  updateSettings (msg, { threads: true })
  reply (msg, createEmbedMessage (`
    :hash: I will now relay translations in a thread.
    This requires "Public Threads" permissions.
    If given "Manage Messages" permissions, I will pin each thread for a day.
  `))
}
