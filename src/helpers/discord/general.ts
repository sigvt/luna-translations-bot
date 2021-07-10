/** @file Generic Discord.js helper functions applicable to any bot. */
import { config } from '../../config'
import { Guild, GuildMember, Message, Snowflake, } from 'discord.js'
import { client } from '../../core'

export function isGuild (scrutinee: any): scrutinee is Guild {
  return scrutinee instanceof Guild
}

export function isMessage (scrutinee: any): scrutinee is Message {
  return scrutinee instanceof Message
}

export function isDm (msg: Message): boolean {
  return msg.guild === undefined
}

export function hasRole (x: Message | GuildMember, role: Snowflake): boolean {
  const user = isMessage (x) ? x.member
                             : x
  return <boolean> user?.roles.cache.has (role)
}

export function isGuildOwner (scrutinee: Message | GuildMember): boolean {
  return getUserId (scrutinee) === scrutinee.guild?.ownerID
}

export function isBotOwner (scrutinee: Message | GuildMember): boolean {
  return getUserId (scrutinee) === config.ownerId
}

export function getUserId (subject: Message | GuildMember): Snowflake {
  return isMessage (subject) ? subject.author.id
                             : subject.id
}

export function hasKickPerms (subject: Message | GuildMember): boolean {
  const author = isMessage (subject)
    ? subject.member
    : subject

  return <boolean> author?.permissions.has ('KICK_MEMBERS')
}

export function getGuildId (
  subject: Message | Guild | GuildMember
): Snowflake | undefined {
  const isADm = isMessage (subject) && isDm (subject)
  return isADm               ? undefined
       : isMessage (subject) ? subject.guild!.id
       : isGuild (subject)   ? subject.id
                             : subject.guild!.id
}

export function mentionsMe (msg: Message): boolean {
  const mentionRegex = new RegExp (`^<@!?${client.user!.id}>`)
  return msg.content.match (mentionRegex) |> Boolean
}

export function isBot (msg: Message): boolean {
  return msg.author?.bot |> Boolean
}
