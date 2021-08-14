import { DocumentType } from '@typegoose/typegoose'
import { Guild, Snowflake } from 'discord.js'
import { Map as ImmutableMap } from 'immutable'
import { UpdateQuery } from 'mongoose'
import { zip } from 'ramda'
import { isGuild } from '../../../helpers/discord'
import { debug } from '../../../helpers'
import { deleteKey, setKey } from '../../../helpers/immutableES6MapFunctions'
import { VideoId } from '../../../modules/holodex/frames'
import { client } from '../../lunaBotClient'
import { RelayedComment } from '../models/RelayedComment'
import { GuildData, BlacklistNotice, GuildDataDb } from '../models/GuildData'
import { YouTubeChannelId } from '../../../modules/holodex/frames'
import Enmap from 'enmap'

export const guildDataEnmap: Enmap<Snowflake, GuildData> =
  new Enmap ({ name: 'guildData' })

export type ImmutableRelayHistory = ImmutableMap<VideoId, RelayedComment[]>

export async function getAllRelayHistories ()
: Promise<ImmutableMap<Snowflake, ImmutableRelayHistory>> {
  const datas      = client.guilds.cache.map (getGuildData)
  const snowflakes = datas.map (g => g._id)
  const histories  = datas.map (g => ImmutableMap (g.relayHistory))
  return ImmutableMap (zip (snowflakes, histories))
}

export function getGuildRelayHistory (
  g: Guild | Snowflake, videoId: VideoId
): RelayedComment[]
export function getGuildRelayHistory (
  g: Guild | Snowflake
): ImmutableRelayHistory
export function getGuildRelayHistory (
  g: Guild | Snowflake, videoId?: VideoId
): RelayedComment[] | ImmutableRelayHistory {
  const data = getGuildData (g)
  return videoId ? data.relayHistory.get (videoId) ?? []
                 : ImmutableMap (data.relayHistory)
}

export function getRelayNotices (
  g: Guild | Snowflake
): ImmutableMap<VideoId, Snowflake> {
  return ImmutableMap (getGuildData (g).relayNotices)
}

export function addRelayNotice (
  g: Guild | Snowflake, videoId: VideoId, msgId: Snowflake
): void {
  const data = getGuildData (g)
  const newNotices = data.relayNotices |> setKey (videoId, msgId)
  updateGuildData (g, { relayNotices: newNotices })
}

export function findVidIdAndCulpritByMsgId (
  g: Guild | Snowflake | null, msgId: Snowflake
): [VideoId | undefined, RelayedComment | undefined] {
  const histories = g ? getGuildRelayHistory (g) : undefined
  const predicate = (cs: RelayedComment[]) => cs.some (c => c.msgId === msgId)
  const vidId     = histories?.findKey (predicate)
  const history   = histories?.find (predicate)
  const culprit   = history?.find (c => c.msgId === msgId)
  return [vidId, culprit]
}

export function getFlatGuildRelayHistory (
  g: Guild | Snowflake
): RelayedComment[] {
  const histories = getGuildRelayHistory (g)
  return histories.toList ().toArray ().flat ()
}

export function addToGuildRelayHistory (
  videoId: VideoId, cmt: RelayedComment, g: Guild | Snowflake
): void {
  const history    = getGuildData (g).relayHistory
  const cmts       = history.get (videoId) ?? []
  const newHistory = history |> setKey (videoId, [...cmts, cmt])
  updateGuildData (g, { relayHistory: newHistory })
}

export function deleteRelayHistory (
  videoId: VideoId, g: Guild | Snowflake
): void {
  const history = getGuildData (g).relayHistory
  updateGuildData (g, { relayHistory: (history |> deleteKey (videoId)) })
}

export function addBlacklistNotice (
  { g, msgId, ytId, videoId, originalMsgId }: NewBlacklistNoticeProps
): void {
  const notices = getGuildData (g).blacklistNotices
  updateGuildData (g, { blacklistNotices: (notices |> setKey (msgId, {
    ytId, videoId, originalMsgId
  }))})
}

export function getNoticeFromMsgId (
  g: Guild | Snowflake, msgId: Snowflake
): BlacklistNotice | undefined {
  return getGuildData (g).blacklistNotices.get (msgId)
}

export function excludeLine (
  g: Guild | Snowflake, videoId: VideoId, msgId: Snowflake
): void {
  const history = getGuildData (g).relayHistory
  const vidLog  = history.get (videoId)
  const culprit = vidLog?.findIndex (cmt => cmt.msgId === msgId)
  if (vidLog) updateGuildData (g, { relayHistory: (history |> setKey (videoId, [
    ...vidLog.slice (0, culprit), ...vidLog.slice (culprit)
  ]))})
}

export type NewData = UpdateQuery<DocumentType<GuildData>>

export function updateGuildData (
  g: Guild | Snowflake, update: NewData
): void {
  const _id     = isGuild (g) ? g.id : g
  const current = getGuildData (g)
  const newData = { ...current, ...update }
  guildDataEnmap.set (_id, newData)
}

export function getGuildData (g: Guild | Snowflake): GuildData {
  const _id = isGuild (g) ? g.id : g
  const defaults: GuildData = {
    _id,
    relayNotices: new Map (),
    relayHistory: new Map (),
    blacklistNotices: new Map ()
  }
  return guildDataEnmap.ensure (_id, defaults) as GuildData
}

///////////////////////////////////////////////////////////////////////////////

interface NewBlacklistNoticeProps {
  g: Guild | Snowflake,
  msgId: Snowflake | undefined,
  ytId: YouTubeChannelId,
  videoId: VideoId,
  originalMsgId: Snowflake,
}

