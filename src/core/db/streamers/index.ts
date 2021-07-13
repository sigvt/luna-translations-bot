import { Message } from 'discord.js'
import { ciEquals } from '../../../helpers'
import { createEmbed, reply } from '../../../helpers/discord'
import { ValidatedOptions } from '../watchFeatures'
import { hololive } from './hololive'

export const streamers = StreamerArray([
  ...hololive
] as const)

export const names = streamers.map (x => x.name)

export type StreamerName = typeof names[number]

export function getStreamerList (): string {
  return streamers.map (streamer => streamer.name).join (', ')
}

export function findStreamer (name: string): StreamerName | undefined {
  const bySubname = streamers.find (s => s.name.split (' ').some (
    word => ciEquals (word, name)
  ))
  const byFullName = streamers.find (s => s.name === name)
  const byAlias = streamers.find (s => s.aliases?.some (
    a => typeof a === 'string' ? ciEquals (a, name) : name.match (a)
  ))
  const streamer = bySubname ?? byFullName ?? byAlias

  return streamer?.name
}

export function showStreamerList (x: Message | ValidatedOptions): void {
  const msg = x instanceof Message ? x : x.msg
  reply (msg, createEmbed ({
    title: 'Supported channels',
    description: getStreamerList ()
  }))
}

export type Streamer = Readonly<{
  aliases: readonly stringOrRegex[],
  groups: readonly string[],
  name: string,
  picture: string,
  twitter: string,
  ytId: string,
}>

/**
 * This constrained identity function validates array without typing it
 * so that we may use 'as const' on the array
 **/
export function StreamerArray <T extends readonly Streamer[]> (arr: T) {
  return arr
}

type stringOrRegex = string | RegExp
