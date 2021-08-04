import { GuildSettings } from '../../core/db/models'
import { Streamer, streamers } from '../../core/db/streamers'

const tlPatterns = [
  /[\S]+ tl[:)\]\】\］]/i,                  // stuff like 'rough tl)'
  /([(\[/\［\【]|^)(tl|eng?)[\]):\】\］]/i, // (eng?/tl]:
  /^[\[(](eng?|tl)/i,                       // TLs who forget closing bracket
]

export function isTl (cmt: string, g?: GuildSettings): boolean {
  return tlPatterns.some (pattern => pattern.test (cmt))
      || (g !== undefined && isWanted (cmt, g))
}

export function isWanted (cmt: string, g: GuildSettings): boolean {
  return g.customWantedPatterns
    .some (pattern => cmt.toLowerCase ().startsWith (pattern.toLowerCase ()))
}

export function isUnwanted (cmt: string, g: GuildSettings): boolean {
  return g.customBannedPatterns
    .some (pattern => cmt.toLowerCase ().includes (pattern.toLowerCase ()))
}

export function isBlacklisted (ytId: string, g: GuildSettings): boolean {
  return g.blacklist.map (x => x.ytId).includes (ytId)
}

export function isHoloID (streamer?: Streamer): boolean {
  return <boolean> streamer?.groups.some (g => g.includes ('Indonesia'))
}

export function isStreamer (ytId: string): boolean {
  return streamers.some (s => s.ytId === ytId)
}
