import merge from 'ts-deepmerge'
import { client } from '../../core/'
import {
  DMChannel,
  PartialDMChannel,
  Message,
  MessageAttachment,
  MessageEmbed,
  MessageEmbedAuthor,
  MessageEmbedOptions,
  MessageEmbedThumbnail,
  MessageOptions,
  MessagePayload,
  NewsChannel,
  TextBasedChannels,
  TextChannel,
  ThreadChannel,
} from 'discord.js'
import { GuildSettings, WatchFeature } from '../../core/db/models'
import { Streamer } from '../../core/db/streamers'
import { warn } from '../logging'
import { getSubbedGuilds } from '../../core/db/functions'
const { isArray } = Array

export async function reply (
  msg:    Message,
  embed?: MessageEmbed | MessageEmbed[],
  text?:  string,
  file?:  MessageAttachment,
): Promise<(Message | Message[] | undefined)> {
  if (canBotPost (msg.channel)) {
    return msg.reply ({
      ...(embed ? { embeds:  isArray (embed) ? embed : [embed] } : {}),
      ...(text  ? { content: text }    : {}),
      ...(file  ? { files:   [file] }  : {}),
      failIfNotExists: false
    }).catch (warn)
  } else {
    warn (`Missing posting perms in ${msg.guild?.id}/${msg.channel?.id}`)
  }
}

export function createEmbedMessage (
  body: string, fancy: boolean = false
): MessageEmbed {
  return createEmbed ({
    author:      fancy ? getEmbedSelfAuthor ()    : undefined,
    thumbnail:   fancy ? getEmbedSelfThumbnail () : undefined,
    description: body
  })
}

export function createEmbed (
  options: Partial<MessageEmbedOptions>, fancy: boolean = false
): MessageEmbed {
  const base: Partial<MessageEmbedOptions> = {
    author:    fancy ? getEmbedSelfAuthor () : undefined,
    color:     '#8e4497',
    thumbnail: fancy ? getEmbedSelfThumbnail () : undefined
  }
  return new MessageEmbed (merge (base, options))
}

export function createTxtEmbed (
  title: string, content: string
): MessageAttachment {
  return new MessageAttachment (Buffer.from (content, 'utf-8'), title)
}

export async function notifyDiscord (opts: NotifyOptions): Promise<void> {
  const { streamer, subbedGuilds, feature, embedBody, emoji } = opts

  const guilds = subbedGuilds ?? await getSubbedGuilds (streamer?.name, feature)

  guilds.forEach (g => {
    const entries  = g[feature].filter (ent => ent.streamer == streamer!.name)
    const guildObj = client.guilds.cache.find (guild => guild.id === g._id)
    entries.forEach (({ discordCh, roleToNotify }) => {
      const ch = <TextChannel> guildObj?.channels.cache
                    .find (ch => ch.id === discordCh)
      if (ch) send (ch, {
        content: `${roleToNotify ? emoji + ' <@&'+roleToNotify+'>' : ''} `,
        embeds: [createEmbed ({
          author: { name: streamer!.name, iconURL: streamer!.picture },
          thumbnail: { url: streamer!.picture },
          description: embedBody
        })]
      })
    })
  })
}

export async function send (
  channel: TextChannel, content: string | MessageOptions | MessagePayload
): Promise<Message | undefined> {
  if (canBotPost (channel)) {
    return channel.send (content)
                  .catch (e => warn (`${channel.guild.id}/${channel.id} ${e}`))
  } else {
    warn (`Missing posting perms in channel ${channel.guild.id}/${channel.id}`)
  }
}

//// PRIVATE //////////////////////////////////////////////////////////////////

function canBotPost (
  channel: TextBasedChannels
): boolean {
  const unsupported = [NewsChannel, DMChannel]
  if (unsupported.some (type => channel instanceof type)) {
    warn ('Tried to post in unsupported channel type.')
    return false
  }
  const validated = <TextChannel | ThreadChannel> channel
  return !!validated.guild.me
      && validated.permissionsFor (validated.guild.me!).has ('SEND_MESSAGES')
}

function getEmbedSelfAuthor (): MessageEmbedAuthor {
  return {
    name: client.user!.username,
    iconURL: client.user!.displayAvatarURL (),
  }
}

function getEmbedSelfThumbnail (): MessageEmbedThumbnail {
  return { url: client.user!.displayAvatarURL () }
}

interface NotifyOptions {
  subbedGuilds?: GuildSettings[]
  feature:       WatchFeature
  streamer:      Streamer
  embedBody:     string
  emoji:         string
}
