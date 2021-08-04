/** @file Functions accessing or interfacing with Guild settings */

import { Guild, GuildMember, Message, Snowflake } from 'discord.js'
import { isGuild, hasRole, getGuildId } from '../../../helpers/discord'
import { GuildSettings, GuildSettingsDb } from '../models'
import { config, PermLevel } from '../../../config'
import { asyncFind } from '../../../helpers'
import { UpdateQuery } from 'mongoose'
import { DocumentType } from '@typegoose/typegoose'
import { client } from '../../lunaBotClient'

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

export function getAllSettings (): Promise<GuildSettings[]> {
  return Promise.all (client.guilds.cache.map (getSettings))
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

export type PrivilegedRole = 'admins' | 'blacklisters'

export type NewSettings = UpdateQuery<DocumentType<GuildSettings>>

//// PRIVATE //////////////////////////////////////////////////////////////////

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

