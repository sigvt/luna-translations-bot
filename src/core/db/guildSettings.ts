/** @file Functions accessing or interfacing with Guild settings */

import { Guild, GuildMember, Message, Snowflake } from 'discord.js'
import { isGuild, hasRole, getGuildId } from '../../helpers/discord'
import { GuildSettings, GuildSettingsDb } from './models'
import { config, PermLevel } from '../../config'
import { asyncFind } from '../../helpers'
import { UpdateQuery } from 'mongoose'
import { DocumentType } from '@typegoose/typegoose'

/**
 * Returns guild settings from the DB or creates them if they don't exist.
 * Returns default settings for DMs. (guildId 0)
 */
export function getSettings (
  x: Message | Guild | GuildMember
): Promise<GuildSettings> {
  return getGuildSettings (getGuildId (x) ?? '0')
}

export async function updateSettings (
  x: Message | Guild | GuildMember, update: NewSettings
): Promise<GuildSettings> {
  const _id = getGuildId (x) ?? '0'
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

//// PRIVATE //////////////////////////////////////////////////////////////////

async function getGuildSettings (g: Guild | Snowflake): Promise<GuildSettings> {
  const guildId = isGuild (g) ? g.id
                              : g

  return GuildSettingsDb.findOneAndUpdate (
    { _id: guildId }, { _id: guildId }, { upsert: true, new: true }
  )
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

type NewSettings = UpdateQuery<DocumentType<GuildSettings>>
