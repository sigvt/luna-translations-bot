import {
  Command, createEmbed, createEmbedMessage, createTxtEmbed, reply
} from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { getFlatGuildRelayHistory, addBlacklisted, getSettings } from '../db/functions'
import { Message } from 'discord.js'
import { isBlacklisted } from '../../modules/livechat/commentBooleans'
import { RelayedComment } from '../db/models/RelayedComment'

export const blacklist: Command = {
  config: {
    aliases:   ['bl', 'block'],
    permLevel: 1
  },
  help: {
    category: 'Relay',
    usage:    'blacklist <optional reason> (as reply)',
    description: oneLine`
      Shows blacklist, or blacklists the YouTube channel
      of the translation that this command is in reply to.
    `,
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    const reason     = args.join (' ').trim () || 'No reason provided.'
    const isReply    = msg.reference != null
    const processMsg = isReply ? blacklistTl : showHelp

    processMsg (msg, reason)
  }
}

//////////////////////////////////////////////////////////////////////////////

function blacklistTl (msg: Message, reason: string): void {
  const settings  = getSettings (msg.guild!)
  const refId     = msg.reference!.messageId
  const history   = getFlatGuildRelayHistory (msg.guild!)
  const culprit   = history.find (cmt => cmt.msgId === refId)
  const duplicate = culprit && isBlacklisted (culprit.ytId, settings)
  const callback  = duplicate ? notifyDuplicate
                  : culprit   ? addBlacklistedAndConfirm
                              : notifyTranslatorNotFound

  callback (msg, culprit!, reason)
}

function showHelp (msg: Message): void {
  const g       = getSettings (msg)
  const header  = 'Channel ID               | Name (Reason)\n'
  const entries = g.blacklist.map (e => `${e.ytId} | ${e.name} (${e.reason})`)
                             .join ('\n')
  const list    = header + entries

  reply (msg, createEmbed ({ fields: [{
    name: ':no_entry: Blacklisting someone',
    value: 'Run this command as a Discord reply to the target translation.',
    inline: false
  }, {
    name: ':white_check_mark: Unblacklisting someone',
    value: oneLine`
      Run \`tl.unblacklist\` to unblacklist the last item,
      or \`tl.unblacklist <channel ID>\` to unblacklist a
      specific YouTube channel.
    `,
    inline: false
  }]}), '', createTxtEmbed ('blacklist.txt', list))
}

function notifyDuplicate (msg: Message): void {
  reply (msg, createEmbedMessage (':warning: Already blacklisted'))
}

function addBlacklistedAndConfirm (
  msg: Message, { ytId, author }: RelayedComment, reason: string
): void {
  addBlacklisted (msg.guild!, { ytId: ytId, name: author, reason })
  reply (msg, createEmbed ({ fields: [{
    name:  ':no_entry: Blacklister',
    value: msg.author.toString (),
    inline: true,
  }, {
    name:  ':clown: Blacklisted channel',
    value: author,
    inline: true,
  }, {
    name:  ':bookmark_tabs: Reason',
    value: reason,
    inline: true,
  }]}))
}

function notifyTranslatorNotFound (msg: Message): void {
  reply (msg, createEmbedMessage (':warning: Translator data not found.'))
}
