import merge from 'ts-deepmerge'
import { client } from '../'
import {
  EmbedField,
  FileOptions,
  Message,
  MessageAttachment,
  MessageEmbed,
  MessageEmbedOptions,
  MessageEmbedAuthor,
  MessageEmbedFooter,
  MessageEmbedImage,
  MessageEmbedProvider,
  MessageEmbedThumbnail,
} from 'discord.js'

export function reply (
  msg: Message,
  embed: MessageEmbed
): Promise<(Message | Message[])> {
  return msg.reply ({ embed, failIfNotExists: false})
}

export function createEmbedMessage ({ body, fancy = false }: {
  body:   string,
  fancy?: boolean
}): MessageEmbed {
  return createEmbed ({
    author:      fancy ? getEmbedSelfAuthor () : undefined,
    thumbnail:   fancy ? getEmbedSelfThumbnail () : undefined,
    description: body
  })
}

export function createEmbed (options: EmbedOptions): MessageEmbed {
  const base: EmbedOptions = {
    author:    getEmbedSelfAuthor (),
    color:     '#8e4497',
    thumbnail: getEmbedSelfThumbnail ()
  }
  return merge (base, options) |> newMessageEmbed
}

export interface EmbedOptions {
  author?:      MessageEmbedAuthor,
  color?:       string | number,
  description?: string,
  fields?:      EmbedField[],
  files?:       Array<FileOptions|string|MessageAttachment>,
  footer?:      MessageEmbedFooter,
  image?:       MessageEmbedImage,
  provider?:    MessageEmbedProvider,
  thumbnail?:   MessageEmbedThumbnail,
  timestamp?:   number,
  title?:       string,
  url?:         string
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

/** Workaround for pipe operator PR not working with 'new' */
function newMessageEmbed (data?: MessageEmbed | MessageEmbedOptions) {
  return new MessageEmbed (data) as MessageEmbed
}
