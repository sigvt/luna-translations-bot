import merge from 'ts-deepmerge'
import { client } from '../../core/'
import {
  Message,
  MessageAttachment,
  MessageEmbed,
  MessageEmbedAuthor,
  MessageEmbedOptions,
  MessageEmbedThumbnail,
  MessageOptions,
  MessagePayload,
  TextChannel,
} from 'discord.js'
import { GuildSettings, WatchFeature } from '../../core/db/models'
import { Streamer } from '../../core/db/streamers'
import { debug } from '../logging'
import { getSubbedGuilds } from '../../core/db/functions'

export async function reply (
  msg:    Message,
  embed?: MessageEmbed | MessageEmbed[],
  text?:  string,
  file?:  MessageAttachment,
): Promise<(Message | Message[])> {
  return msg.reply ({
    ...(embed ? { embeds:  Array.isArray (embed) ? embed : [embed] } : {}),
    ...(text  ? { content: text }    : {}),
    ...(file  ? { files:   [file] }  : {}),
    failIfNotExists: false
  }).catch (debug)
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
): Promise<Message> {
  return channel.send (content)
                .catch (debug)
}

//// PRIVATE //////////////////////////////////////////////////////////////////

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
