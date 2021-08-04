import { DocumentType } from '@typegoose/typegoose'
import { Guild, Snowflake } from 'discord.js'
import { Map as ImmutableMap } from 'immutable'
import { UpdateQuery } from 'mongoose'
import { zip } from 'ramda'
import { isGuild } from '../../../helpers/discord'
import { deleteKey, setKey } from '../../../helpers/immutableES6MapFunctions'
import { VideoId } from '../../../modules/holodex/frames'
import { client } from '../../lunaBotClient'
import { GuildData, GuildDataDb } from '../models/GuildData'
import { RelayedComment } from '../models/RelayedComment'

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
): Promise<RelayedComment[]> {
  const data = await getGuildData (g)
  return data.relayHistory.get (videoId) ?? []
}

export async function addToGuildRelayHistory (
  videoId: VideoId, cmt: RelayedComment, g: Guild | Snowflake
): Promise<void> {
  const _id        = isGuild (g) ? g.id : g
  const history    = (await getGuildData (g)).relayHistory
  const cmts       = history.get (videoId) ?? []
  const newHistory = history |> setKey (videoId, [...cmts, cmt])
  const update     = { relayHistory: newHistory }
  const query      = [{ _id }, update, { upsert: true, new: true }] as const
  await GuildDataDb.findOneAndUpdate (...query)
}

export async function deleteRelayHistory (
  videoId: VideoId, g: Guild | Snowflake
): Promise<void> {
  const _id = isGuild (g) ? g.id : g
  const history = (await getGuildData (g)).relayHistory
  updateGuildData (_id, { relayHistory: (history |> deleteKey (videoId)) })
}

///////////////////////////////////////////////////////////////////////////////
//
export type NewData = UpdateQuery<DocumentType<GuildData>>

async function updateGuildData (
  _id: Snowflake, update: NewData
): Promise<DocumentType<GuildData>> {
  return GuildDataDb
    .findOneAndUpdate ({ _id }, update, {upsert: true, new: true })
}

async function getGuildData (g: Guild | Snowflake): Promise<GuildData> {
  const _id = isGuild (g) ? g.id : g
  const query = [{ _id }, { _id }, { upsert: true, new: true }] as const
  return GuildDataDb.findOneAndUpdate (...query)
}
