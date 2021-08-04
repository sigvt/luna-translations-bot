import { Guild, Snowflake } from 'discord.js'
import { isGuild } from '../../../helpers/discord'
import { VideoId } from '../../../modules/holodex/frames'
import { GuildData, GuildDataDb } from '../models/GuildData'
import { RelayedComment } from '../models/RelayedComment'

export async function getGuildRelayHistory (
  g: Guild | Snowflake, videoId: VideoId
): Promise<RelayedComment[]> {
  const data = await getGuildData (g)
  return data.relayHistory.get (videoId) ?? []
}

export async function addToGuildRelayHistory (
  videoId: VideoId, comment: RelayedComment, g: Guild | Snowflake
): Promise<void> {
  const _id      = isGuild (g) ? g.id : g
  const history  = (await getGuildData (g)).relayHistory
  const videoLog = history.get (videoId) ?? []
  const update   = { relayHistory: history }
  const query    = [{ _id }, update, { upsert: true, new: true }] as const
  history.set (videoId, [...videoLog, comment])
  await GuildDataDb.findOneAndUpdate (...query)
}

///////////////////////////////////////////////////////////////////////////////

async function getGuildData (g: Guild | Snowflake): Promise<GuildData> {
  const _id = isGuild (g) ? g.id : g
  const query = [{ _id }, { _id }, { upsert: true, new: true }] as const
  return GuildDataDb.findOneAndUpdate (...query)
}
