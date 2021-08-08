import { Interaction, ButtonInteraction, Snowflake } from 'discord.js'
import { doNothing, match, isNotNil } from '../../helpers'
import { createEmbedMessage, findTextChannel } from '../../helpers/discord'
import { getNoticeFromMsgId, removeBlacklisted, excludeLine, getGuildRelayHistory } from '../db/functions'
import { BlacklistNotice } from '../db/models/GuildData'
import { oneLine } from 'common-tags'
import { last } from 'ramda'

export function interactionCreate (intr: Interaction): void {
  const processInteraction = intr.isButton () ? processButton
                                              : doNothing
  processInteraction (intr as any)
}

///////////////////////////////////////////////////////////////////////////////

async function processButton (btn: ButtonInteraction): Promise<void> {
  const notice     = await getNoticeFromMsgId (btn.guild!, btn.message.id)
  const btnHandler = notice ? match (btn.customId, {
    cancel:  cancelBlacklisting,
    cancel2: cancelBlacklistingAndExcludeLine,
    clear:   clearAuthorTls
  }): doNothing

  btnHandler (btn, notice)
}

async function cancelBlacklisting (
  btn: ButtonInteraction, notice: BlacklistNotice
): Promise<void> {
  removeBlacklisted (btn.guild!, notice.ytId)
  .then (success => btn.update ({ components: [], embeds: [
    createEmbedMessage (success
      ? `${notice?.ytId}'s blacklisting has been cancelled.`
      : `Something went wrong unblacklisting ${notice?.ytId}.`
    )
  ]}))
}

async function cancelBlacklistingAndExcludeLine (
  btn: ButtonInteraction, notice: BlacklistNotice
): Promise<void> {
  removeBlacklisted (btn.guild!, notice.ytId)
  excludeLine (btn.guild!, notice.videoId, notice.originalMsgId)
  btn.update ({ components: [], embeds: [createEmbedMessage (oneLine`
    ${notice?.ytId}'s blacklisting has been cancelled but the deleted message
    will not be in the final log.
  `)]})
}

async function clearAuthorTls (
  btn: ButtonInteraction, notice: BlacklistNotice
): Promise<void> {
  const vidLog = await getGuildRelayHistory (btn.guild!, notice.videoId)
  const cmts   = vidLog.filter (cmt => cmt.ytId === notice.ytId)
  const msgs   = <Snowflake[]> cmts.map (cmt => cmt.msgId).filter (isNotNil)
  const ch     = findTextChannel (last (cmts)?.discordCh ?? '')

  ch?.bulkDelete (msgs)
  .then (deleted => btn.update ({ components: [], embeds: [createEmbedMessage (
    `Deleted ${deleted.size} translations.`
  )]}))
  .catch (_ => btn.update ({ components: [], embeds: [createEmbedMessage (
    'I need Manage Messages permissions.'
  )]}))
}
