import { Message, MessageActionRow, MessageButton, Snowflake, TextChannel } from 'discord.js'
import { client } from '../lunaBotClient'
import { addBlacklisted, getFlatGuildRelayHistory, getSettings, addBlacklistNotice, findVidIdAndCulpritByMsgId } from '../db/functions'
import { RelayedComment } from '../db/models/RelayedComment'
import { YouTubeChannelId } from '../../modules/holodex/frames'
import { createEmbed, send, react, ButtonRow } from '../../helpers/discord'
import { log } from '../../helpers'
import { oneLine } from 'common-tags'

export async function messageDelete (msg: Message): Promise<void> {
  const [vidId, culprit] = await findVidIdAndCulpritByMsgId (msg.guild, msg.id)
  const isNew            = ! await isBlacklisted (culprit?.ytId, msg.guild!.id)
  const reason           = 'Deleted by mod.'

  if (culprit && isNew) {
    log (oneLine`
      A moderator blacklisted ${culprit.ytId} by deleting their TL
      in server ${msg.guild!.name} (${msg.guild!.id})
    `)
    addBlacklisted (
      msg.guild!, { ytId: culprit!.ytId, name: culprit!.author, reason }
    )
    send (<TextChannel> msg.channel, {
      embeds: [createEmbed ({
        fields: [{
          name:   ':no_entry: Blacklisted channel',
          value:  culprit.ytId,
          inline: true,
        }, {
          name:   ':clown: Current name',
          value:  culprit.author,
          inline: true,
        }, {
          name:   ':bookmark_tabs: Reason',
          value:  reason,
          inline: true,
        }]
      })],
      components: [ButtonRow ([
        { label: 'Cancel', customId: 'cancel', style: 2 },
        { label: "Cancel but don't log line", customId: 'cancel2', style: 2 },
        { label: "Clear author's TLs", customId: 'clear', style: 4 },
      ])]
    })
    .then (msg => addBlacklistNotice ({
      g:             msg?.guild!,
      msgId:         msg?.id ?? '0',
      ytId:          culprit!.ytId,
      videoId:       vidId!,
      originalMsgId: culprit!.msgId!
    }))
  }
}

async function isBlacklisted (
  ytId: YouTubeChannelId | undefined, gid: Snowflake
): Promise<boolean> {
  const settings  = await getSettings (gid)
  const blacklist = settings.blacklist
  return blacklist.some (entry => entry.ytId === ytId)
}
