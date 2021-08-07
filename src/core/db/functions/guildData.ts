import { DocumentType } from '@typegoose/typegoose'
import { Guild, Snowflake } from 'discord.js'
import { Map as ImmutableMap } from 'immutable'
import { UpdateQuery } from 'mongoose'
import { zip } from 'ramda'
import { isGuild } from '../../../helpers/discord'
import { deleteKey, setKey } from '../../../helpers/immutableES6MapFunctions'
import { VideoId } from '../../../modules/holodex/frames'
import { client } from '../../lunaBotClient'
import { RelayedComment } from '../models/RelayedComment'
import { GuildData, Notice, GuildDataDb } from '../models/GuildData'
import { YouTubeChannelId } from '../../../modules/holodex/frames'

export type ImmutableRelayHistory = ImmutableMap<VideoId, RelayedComment[]>

export async function getAllRelayHistories ()
: Promise<ImmutableMap<Snowflake, ImmutableRelayHistory>> {
  const datas      = await Promise.all (client.guilds.cache.map (getGuildData))
  const snowflakes = datas.map (g => g._id)
  const histories  = datas.map (g => ImmutableMap (g.relayHistory))
  return ImmutableMap (zip (snowflakes, histories))
}

export async function getGuildRelayHistory (
  g: Guild | Snowflake, videoId: VideoId
): Promise<RelayedComment[]>
export async function getGuildRelayHistory (
  g: Guild | Snowflake
): Promise<ImmutableRelayHistory>
export async function getGuildRelayHistory (
  g: Guild | Snowflake, videoId?: VideoId
): Promise<RelayedComment[] | ImmutableRelayHistory> {
  const data = await getGuildData (g)
  return videoId ? data.relayHistory.get (videoId) ?? []
                 : ImmutableMap (data.relayHistory)
}

export async function findVidIdAndCulpritByMsgId (
  g: Guild | Snowflake | null, msgId: Snowflake
): Promise<[VideoId | undefined, RelayedComment | undefined]> {
  const histories = g ? await getGuildRelayHistory (g) : undefined
  const predicate = (cs: RelayedComment[]) => cs.some (c => c.msgId === msgId)
  const vidId     = histories?.findKey (predicate)
  const history   = histories?.find (predicate)
  const culprit   = history?.find (c => c.msgId === msgId)
  return [vidId, culprit]
}

export async function getFlatGuildRelayHistory (
  g: Guild | Snowflake
): Promise<RelayedComment[]> {
  const histories = await getGuildRelayHistory (g)
  return histories.toList ().toArray ().flat ()
}

export async function addToGuildRelayHistory (
  videoId: VideoId, cmt: RelayedComment, g: Guild | Snowflake
): Promise<void> {
  const history    = (await getGuildData (g)).relayHistory
  const cmts       = history.get (videoId) ?? []
  const newHistory = history |> setKey (videoId, [...cmts, cmt])
  updateGuildData (g, { relayHistory: newHistory })
}

export async function deleteRelayHistory (
  videoId: VideoId, g: Guild | Snowflake
): Promise<void> {
  const history = (await getGuildData (g)).relayHistory
  updateGuildData (g, { relayHistory: (history |> deleteKey (videoId)) })
}

export async function addBlacklistNotice (
  { g, msgId, ytId, videoId, originalMsgId }: NewBlacklistNoticeProps
): Promise<void> {
  const notices = (await getGuildData (g)).blacklistNotices
  updateGuildData (g, { blacklistNotices: (notices |> setKey (msgId, {
    ytId, videoId, originalMsgId
  }))})
}

export async function getNoticeFromMsgId (
  g: Guild | Snowflake, msgId: Snowflake
): Promise<Notice | undefined> {
  return (await getGuildData (g)).blacklistNotices.get (msgId)
}

export async function excludeLine (
  g: Guild | Snowflake, videoId: VideoId, msgId: Snowflake
): Promise<void> {
  const history = (await getGuildData (g)).relayHistory
  const vidLog  = history.get (videoId)
  const culprit = vidLog?.findIndex (cmt => cmt.msgId === msgId)
  if (vidLog) updateGuildData (g, { relayHistory: (history |> setKey (videoId, [
    ...vidLog.slice (0, culprit), ...vidLog.slice (culprit)
  ]))})
}

export type NewData = UpdateQuery<DocumentType<GuildData>>

export async function updateGuildData (
  g: Guild | Snowflake, update: NewData
): Promise<DocumentType<GuildData>> {
  const _id = isGuild (g) ? g.id : g
  return GuildDataDb
    .findOneAndUpdate ({ _id }, update, {upsert: true, new: true })
}

export async function getGuildData (g: Guild | Snowflake): Promise<GuildData> {
  const _id = isGuild (g) ? g.id : g
  const query = [{ _id }, { _id }, { upsert: true, new: true }] as const
  return GuildDataDb.findOneAndUpdate (...query)
}

///////////////////////////////////////////////////////////////////////////////

interface NewBlacklistNoticeProps {
  g: Guild | Snowflake,
  msgId: Snowflake | undefined,
  ytId: YouTubeChannelId,
  videoId: VideoId,
  originalMsgId: Snowflake,
}

