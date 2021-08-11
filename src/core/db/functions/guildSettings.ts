/** @file Functions accessing or interfacing with Guild settings */

import { Guild, GuildMember, Message, Snowflake } from 'discord.js'
import { isGuild, hasRole, getGuildId } from '../../../helpers/discord'
import { GuildSettings, GuildSettingsDb, BlacklistItem } from '../models'
import { config, PermLevel } from '../../../config'
import { asyncFind, debug } from '../../../helpers'
import { UpdateQuery } from 'mongoose'
import { DocumentType } from '@typegoose/typegoose'
import { client } from '../../lunaBotClient'
import { YouTubeChannelId } from '../../../modules/holodex/frames'
import { RelayedComment } from '../models/RelayedComment'

/**
 * Returns guild settings from the DB or creates them if they don't exist.
 * Returns default settings for DMs. (guildId 0)
 */
export function getSettings (
  x: Message | Guild | GuildMember | Snowflake
): Promise<GuildSettings> {
  const id = (typeof x === 'string') ? x : getGuildId (x)
  return getGuildSettings (id ?? '0')
}

export async function getAllSettings () {
  cachedSettings ??= await getAllSettingsRefreshed ()
  return cachedSettings
}

export async function addBlacklisted (
  g: Guild | Snowflake, item: BlacklistItem
): Promise<void> {
  const settings  = await getSettings (g)
  updateSettings (g, { blacklist: [...settings.blacklist, item] })
}

export async function removeBlacklisted (
  g: Guild | Snowflake, ytId?: YouTubeChannelId
): Promise<boolean> {
  const { blacklist } = await getSettings (g)
  const isValid       = blacklist.some (entry => entry.ytId === ytId)
  const newBlacklist  = blacklist.filter (entry => entry.ytId !== ytId)

  if (isValid) updateSettings (g, { blacklist: newBlacklist })
  return isValid
}

export async function isBlacklisted (
  ytId: YouTubeChannelId | undefined, gid: Snowflake
): Promise<boolean> {
  const settings  = await getSettings (gid)
  const blacklist = settings.blacklist
  return blacklist.some (entry => entry.ytId === ytId)
}

export async function updateSettings (
  x: Message | Guild | GuildMember | Snowflake, update: NewSettings
): Promise<GuildSettings> {
  // TODO: make this more straightforward?
  const isObject = x instanceof Message
                || x instanceof Guild
                || x instanceof GuildMember
  const _id = isObject ? (getGuildId (x as any) ?? '0') : x as any
  return GuildSettingsDb.findOneAndUpdate (
    { _id }, { ...update, _id }, { upsert: true, new: true }
  )
}

export function isAdmin (x: Message | GuildMember): Promise<boolean> {
  return hasPerms (x, 'admins')
}

export function isBlacklister (x: Message | GuildMember): Promise<boolean> {
  return hasPerms (x, 'blacklisters')
}

export async function getPermLevel (x: Message | GuildMember): Promise<PermLevel> {
  const perms = getPermLevels ()
  const userPerm = await asyncFind (perms, level => level.check (x))
  return userPerm!
}

export async function filterAndStringifyHistory (
  guild: Message | Guild | GuildMember | Snowflake,
  history: RelayedComment[]
): Promise<string> {
  const g         = await getSettings (guild)
  const blacklist = g.blacklist.map (entry => entry.ytId)
  const unwanted  = g.customBannedPatterns
  return history
    .filter (cmt => isNotBanned (cmt, unwanted, blacklist))
    .map (cmt => `${cmt.timestamp} (${cmt.author}) ${cmt.body}`)
    .join ('\n')
}

export type PrivilegedRole = 'admins' | 'blacklisters'

export type NewSettings = UpdateQuery<DocumentType<GuildSettings>>

//// PRIVATE //////////////////////////////////////////////////////////////////

let cachedSettings: GuildSettings[] | undefined
setInterval (() => cachedSettings = undefined, 5000)

async function getAllSettingsRefreshed (): Promise<GuildSettings[]> {
  const guildIds = client.guilds.cache.map (g => g.id)
  await GuildSettingsDb.bulkWrite(guildIds.map (_id => ({
    updateOne: { filter: { _id }, update: { _id }, upsert: true }
  })))
  return GuildSettingsDb.find ()
}

async function getGuildSettings (g: Guild | Snowflake): Promise<GuildSettings> {
  const _id = isGuild (g) ? g.id : g
  const query = [{ _id }, { _id }, { upsert: true, new: true }] as const
  return GuildSettingsDb.findOneAndUpdate (...query)
}

/** Returns perm levels in descending order (Bot Owner -> User) */
function getPermLevels (): PermLevel[] {
  return [...config.permLevels].sort ((a, b) => b.level - a.level)
}

async function hasPerms (
  x: Message | GuildMember, roleType: PrivilegedRole
): Promise<boolean> {
  const settings = await getSettings (x)
  const roles = settings[roleType]

  return <boolean> roles!.some (role => hasRole (x, role))
}

function isNotBanned (
  cmt: RelayedComment, unwanted: string[], blacklist: YouTubeChannelId[]
): boolean {
  return blacklist.every (ytId => ytId !== cmt.ytId)
  && unwanted.every (p => !cmt.body.toLowerCase ().includes (p.toLowerCase ()))
}
