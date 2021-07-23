import { Command, createEmbedMessage, reply } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { getSettings, updateSettings } from '../db'
import { Message } from 'discord.js'
import { isEmpty } from 'ramda'
import { head, init, last } from '../../helpers'

export const unblacklist: Command = {
  config: {
    aliases:   ['ub', 'unb', 'unbl'],
    permLevel: 1
  },
  help: {
    category: 'Relay',
    usage:    'unblacklist <optional channel ID>',
    description: oneLine`
      Unblacklists the specified channel ID.
      If none specified, unblacklists last item.
    `,
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    if (isEmpty (args)) unblacklistLastItem (msg)
    else unblacklistItem (msg, head (args))
  }
}

///////////////////////////////////////////////////////////////////////////////

async function unblacklistLastItem (msg: Message): Promise<void> {
  const { blacklist }   = await getSettings (msg)
  const lastBlacklisted = last (blacklist)
  const replyContent    = lastBlacklisted
    ? oneLine`
      :white_check_mark: Successfully unblacklisted channel
      ${lastBlacklisted.ytId} (${lastBlacklisted.name}).
    `
    : ':warning: No items in blacklist.'
  updateSettings (msg, { blacklist: init (blacklist) })
  reply (msg, createEmbedMessage (replyContent))
}

async function unblacklistItem (msg: Message, ytId: string): Promise<void> {
  const { blacklist } = await getSettings (msg)
  const target       = blacklist.find (entry => entry.ytId === ytId)
  const newBlacklist = blacklist.filter (entry => entry.ytId !== ytId)
  const replyContent = target
    ? `:white_check_mark: Successfully unblacklisted ${ytId}.`
    : `:warning: YouTube channel ID ${ytId} was not found.`
  updateSettings (msg, { blacklist: newBlacklist })
  reply (msg, createEmbedMessage (replyContent))
}
