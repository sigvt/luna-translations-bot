import { DocumentType } from '@typegoose/typegoose'
import { Guild, Snowflake } from 'discord.js'
import { Map as ImmutableMap } from 'immutable'
import { UpdateQuery } from 'mongoose'
import { head, zip } from 'ramda'
import { snowflakeToUnix, isGuild } from '../../../helpers/discord'
import { deleteKey, filter, setKey } from '../../../helpers/immutableES6MapFunctions'
import { VideoId } from '../../../modules/holodex/frames'
import { client } from '../../lunaBotClient'
import { RelayedComment } from '../models/RelayedComment'
import { GuildData, BlacklistNotice } from '../models/GuildData'
import { YouTubeChannelId } from '../../../modules/holodex/frames'
import Enmap from 'enmap'

export const guildDataEnmap: Enmap<Snowflake, GuildData> =
  new Enmap ({ name: 'guildData' })

export type ImmutableRelayHistory = ImmutableMap<VideoId, RelayedComment[]>

export function getAllRelayHistories ()
: ImmutableMap<Snowflake, ImmutableRelayHistory> {
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
  const newNotices = setKey (videoId, msgId) (data.relayNotices)
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
  const newHistory = setKey (videoId, [...cmts, cmt]) (history)
  updateGuildData (g, { relayHistory: newHistory })
}

export function deleteRelayHistory (
  videoId: VideoId, g: Guild | Snowflake
): void {
  const history = getGuildData (g).relayHistory
  updateGuildData (g, { relayHistory: (deleteKey (videoId) (history)) })
}

export function addBlacklistNotice (
  { g, msgId, ytId, videoId, originalMsgId }: NewBlacklistNoticeProps
): void {
  const notices   = getGuildData (g).blacklistNotices
  const newNotice = { ytId, videoId, originalMsgId }
  updateGuildData (g, { blacklistNotices: (setKey (msgId, newNotice) (notices))})
}

export function getNoticeFromMsgId (
  g: Guild | Snowflake, msgId: Snowflake
): BlacklistNotice | undefined {
  return getGuildData (g).blacklistNotices.get (msgId)
}

export function excludeLine (
  g: Guild | Snowflake, videoId: VideoId, msgId: Snowflake
): void {
  const history      = getGuildData (g).relayHistory
  const vidLog       = history.get (videoId) ?? []
  const culprit      = vidLog.findIndex (cmt => cmt.msgId === msgId)
  const vidHistory   = [...vidLog.slice (0, culprit), ...vidLog.slice (culprit)]
  const relayHistory = setKey (videoId, vidHistory) (history)
  if (vidLog.length > 0) updateGuildData (g, { relayHistory })
}

export type NewData = UpdateQuery<DocumentType<GuildData>>

export function updateGuildData (
  g: Guild | Snowflake, update: NewData
): void {
  const _id     = (isGuild (g) ? g.id : g) ?? '0'
  const current = getGuildData (g)
  const newData = { ...current, ...update }
  guildDataEnmap.set (_id, newData)
}

export function getGuildData (g: Guild | Snowflake): GuildData {
  const _id = (isGuild (g) ? g.id : g) ?? '0'
  const defaults: GuildData = {
    _id,
    relayNotices: new Map (),
    relayHistory: new Map (),
    blacklistNotices: new Map ()
  }
  return guildDataEnmap.ensure (_id, defaults) as GuildData
}

export function clearOldData (): void {
  const now  = new Date ().getTime ()
  const WEEK = 7*24*60*60*1000
  const isRecentHist = (v: RelayedComment[]) =>
    !!head (v)?.msgId && (snowflakeToUnix (head (v)!.msgId!) - now) < WEEK
  const isRecentK = (_: BlacklistNotice, k: Snowflake) =>
    (snowflakeToUnix (k) - now) < WEEK
  const isRecentV = (v: Snowflake) => (snowflakeToUnix (v) - now) < WEEK

  client.guilds.cache.forEach (g => {
    const guildData           = getGuildData (g)
    const newRelayNotices     = filter (guildData.relayNotices, isRecentV)
    const newBlacklistNotices = filter (guildData.blacklistNotices, isRecentK)
    const newRelayHistory     = filter (guildData.relayHistory, isRecentHist)

    updateGuildData (guildData._id, { relayNotices: newRelayNotices })
    updateGuildData (guildData._id, { relayHistory: newRelayHistory })
    updateGuildData (guildData._id, { blacklistNotices: newBlacklistNotices })
  })
}

export function deleteGuildData (g: Snowflake): void {
  if (guildDataEnmap.has (g)) guildDataEnmap.delete (g)
}

///////////////////////////////////////////////////////////////////////////////

interface NewBlacklistNoticeProps {
  g: Guild | Snowflake,
  msgId: Snowflake | undefined,
  ytId: YouTubeChannelId,
  videoId: VideoId,
  originalMsgId: Snowflake,
}

