import { Message, Snowflake, TextChannel } from 'discord.js'
import { client } from '../lunaBotClient'
import { addBlacklisted, getFlatGuildRelayHistory, getSettings } from '../db/functions'
import { RelayedComment } from '../db/models/RelayedComment'
import { YouTubeChannelId } from '../../modules/holodex/frames'
import { createEmbed, send } from '../../helpers/discord'

export async function messageDelete (msg: Message): Promise<void> {
  const isFromBot = msg.author.id === client.user!.id
  const culprit   = isFromBot ? await findCulprit (msg) : undefined
  const isNew     = ! await isBlacklisted (culprit?.ytId, msg.guild!.id)
  const reason    = 'Deleted by mod.'
  const entry     = { ytId: culprit!.ytId, name: culprit!.author, reason }

  if (culprit && isNew) {
    addBlacklisted (msg.guild!, entry)
    send (<TextChannel> msg.channel, { embeds: [createEmbed ({ fields: [{
      'name':   ':no_entry: Blacklisted channel',
      'value':  culprit.ytId,
      'inline': true,
    }, {
      'name':   ':clown: Current name',
      'value':  culprit.author,
      'inline': true,
    }, {
      'name':   ':bookmark_tabs: Reason',
      'value':  reason,
      'inline': true,
    }]})]})
  }
}

async function isBlacklisted (
  ytId: YouTubeChannelId | undefined, gid: Snowflake
): Promise<boolean> {
  const settings  = await getSettings (gid)
  const blacklist = settings.blacklist
  return blacklist.some (entry => entry.ytId === ytId)
}

async function findCulprit (
  deletedMsg: Message
): Promise<RelayedComment | undefined> {
  const history = await getFlatGuildRelayHistory (deletedMsg.guild!)
  return history.find (tl => tl.msgId === deletedMsg.id)
}
