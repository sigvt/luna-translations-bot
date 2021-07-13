import merge from 'ts-deepmerge'
import { client } from '../../core/'
import {
  Message,
  MessageAttachment,
  MessageEmbed,
  MessageEmbedAuthor,
  MessageEmbedOptions,
  MessageEmbedThumbnail,
} from 'discord.js'

export function reply (
  msg:    Message,
  embed?: MessageEmbed,
  text?:  string,
  file?:  MessageAttachment,
): Promise<(Message | Message[])> {
  return msg.reply ({
    ...(embed ? { embeds:  [embed] } : {}),
    ...(text  ? { content: text }    : {}),
    ...(file  ? { files:   [file] }  : {}),
    failIfNotExists: false
  })
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
