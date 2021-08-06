import { Command, createEmbed, createEmbedMessage, createTxtEmbed, reply } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { getFlatGuildRelayHistory, addBlacklisted, getSettings } from '../db/functions'
import { Message } from 'discord.js'
import { isBlacklisted } from '../../modules/livechat/commentBooleans'

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
    const reason  = args.join (' ').trim () || 'No reason provided.'
    const isReply = msg.reference != null

    if (isReply) blacklistTl (msg, reason)
    else showHelp (msg)
  }
}

async function blacklistTl (msg: Message, reason: string): Promise<void> {
  const settings = await getSettings (msg.guild!)
  const refId    = msg.reference!.messageId
  const history  = await getFlatGuildRelayHistory (msg.guild!)
  const culprit  = history.find (cmt => cmt.msgId === refId)

  if (culprit && isBlacklisted (culprit.ytId, settings)) {
    reply (msg, createEmbedMessage (':warning: Already blacklisted'))
  } else if (culprit) {
    addBlacklisted (
      msg.guild!, { ytId: culprit.ytId, name: culprit.author, reason }
    )
    reply (msg, createEmbed ({ fields: [{
      'name':  ':no_entry: Blacklister',
      'value': msg.author.toString (),
      'inline': true,
    }, {
      'name':  ':clown: Blacklisted channel',
      'value': culprit.author,
      'inline': true,
    }, {
      'name':  ':bookmark_tabs: Reason',
      'value': reason,
      'inline': true,
    }]}))
  } else {
    reply (msg, createEmbedMessage (':warning: Translator data not found.'))
  }
}

async function showHelp (msg: Message): Promise<void> {
  const settings = await getSettings (msg)
  const list = 'Channel ID               | Name (Reason)\n'
    + settings.blacklist.map (el => `${el.ytId} | ${el.name} (${el.reason})`)
                        .join ('\n')

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

  // const guildLog = client.tlLog.get(message.guild.id)
  // const culprit = Object.values(guildLog).flat().find(el => el.msgId == reference.messageID)

  // if (!culprit) {
    // const embed = client.makeEmbed({
      // 'description': ':warning: Information about this translator not found.'
    // }, false, false)
    // return message.reply({embed})
  // }

  // if (previousBlacklist.find(x => x.channel === culprit.channel)) {
    // const embed = client.makeEmbed({
      // 'description': ':warning: Already in blacklist.'
    // }, false, false)
    // return message.reply({embed})
  // }

  // client.settings.set(message.guild.id, [...previousBlacklist, {
    // channel: culprit.channel,
    // name: culprit.name,
    // reason: reason
  // }], 'blacklist');

    // const embed = client.makeEmbed({
      // 'fields': [
        // {
          // 'name':  ':no_entry: Blacklister',
          // 'value': message.author.toString(),
          // 'inline': true,
        // },
        // {
          // 'name':  ':clown: Blacklisted channel',
          // 'value': culprit.name,
          // 'inline': true,
        // },
        // {
          // 'name':  ':bookmark_tabs: Reason',
          // 'value': reason,
          // 'inline': true,
        // },
      // ]
    // }, false, false)

  // return message.channel.send({embed})
// }
