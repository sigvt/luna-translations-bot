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
  TextBasedChannels,
  EmojiIdentifierResolvable,
  MessageReaction,
  MessageButtonOptions,
  MessageButton,
  MessageActionRow,
} from 'discord.js'
import { warn } from '../logging'
import { canBot } from './general'
const { isArray } = Array

export async function reply (
  msg:    Message,
  embed?: MessageEmbed | MessageEmbed[],
  text?:  string,
  file?:  MessageAttachment,
): Promise<(Message | Message[] | undefined)> {
  return canBot ('SEND_MESSAGES', msg.channel)
    ? msg.reply ({
      ...(embed ? { embeds:  isArray (embed) ? embed : [embed] } : {}),
      ...(text  ? { content: text }    : {}),
      ...(file  ? { files:   [file] }  : {}),
      failIfNotExists: false
    }).catch (warn)
    : undefined
}

export async function send (
  channel: TextBasedChannels | undefined,
  content: string | MessageOptions | MessagePayload
): Promise<Message | undefined> {
  return canBot ('SEND_MESSAGES', channel)
    ? channel!.send (content).catch (e => warn (`${channel!.id} ${e}`))
    : undefined
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

export async function react (
  msg: Message | undefined, emj: EmojiIdentifierResolvable
): Promise<MessageReaction | undefined> {
  if (canBot ('ADD_REACTIONS', msg?.channel)) {
    return msg?.react (emj)
  }
}

export function ButtonRow (
  buttons: MessageButtonOptions[]
): MessageActionRow {
  return new MessageActionRow ({
    components: buttons.map (opts => new MessageButton (opts))
  })
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
