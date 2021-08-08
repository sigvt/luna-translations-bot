/** @file Exports main streamer list and streamer-related utility functions */
import { Message } from 'discord.js'
import { ciEquals } from '../../../helpers'
import { createEmbed, reply } from '../../../helpers/discord'
import { ValidatedOptions } from '../functions'
import { hololive } from './hololive'
import { indies } from './indies'
import { nijisanji } from './nijisanji'

export const streamers = StreamerArray([
  ...hololive,
  ...nijisanji,
  ...indies
] as const)

export const names          = streamers.map (x => x.name)
export const twitters       = streamers.map (x => x.twitter)
export type StreamerName    = typeof names[number] | 'all'
export type StreamerTwitter = typeof twitters[number]

export function getStreamerList (): string {
  return streamers.map (streamer => streamer.name).join (', ')
}

export function findStreamerName (name: string): StreamerName | undefined {
  const bySubname = streamers.find (s => s.name.split (' ').some (
    word => ciEquals (word, name)
  ))
  const byFullName = streamers.find (s => s.name === name)
  const byAlias = streamers.find (s => s.aliases?.some (
    a => typeof a === 'string' ? ciEquals (a, name) : name.match (a)
  ))
  const streamer = bySubname ?? byFullName ?? byAlias

  return name === 'all' ? 'all' : streamer?.name
}

export function getTwitterUsername (streamer: StreamerName): StreamerTwitter {
  return streamers.find (x => x.name === streamer)?.twitter ?? 'discord'
}

export function replyStreamerList (x: Message | ValidatedOptions): void {
  const msg = x instanceof Message ? x : x.msg
  reply (msg, createEmbed ({
    title: 'Supported channels',
    description: getStreamerList ()
  }))
}

export function isSupported (ytId: string): boolean {
  return streamers.some (streamer => streamer.ytId === ytId)
}

export type Streamer = Readonly<{
  aliases: readonly string[]
  groups:  readonly string[]
  name:    string
  picture: string
  twitter: string
  ytId:    string
}>

//////////////////////////////////////////////////////////////////////////////

/**
 * This constrained identity function validates array without typing it
 * so that we may use 'as const' on the array
 **/
function StreamerArray <T extends readonly Streamer[]> (arr: T) {
  return arr
}

// type stringOrRegex = string | RegExp
