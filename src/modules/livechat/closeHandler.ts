import { getGuildRelayHistory, getSubbedGuilds } from "../../core/db/functions"
import { debug, log } from "../../helpers"
import { findTextChannel } from "../../helpers/discord"
import { DexFrame, getFrameList, VideoId } from "../holodex/frames"
import { deleteChatProcess } from "./chatProcesses"
import { setupRelay } from "./chatRelayer"

export async function retryFiveTimesThenPostLog (
  frame: DexFrame, exitCode: number | null
): Promise<void> {
  const allFrames = await getFrameList ()
  const isStillOn = <boolean> allFrames?.some (frame_ => frame_.id === frame.id)

  deleteChatProcess (frame.id)
  retries[frame.id] = (retries[frame.id] ?? 0) + 1
  if (isStillOn && retries[frame.id] <= 5) {
    debug (`Pytchat crashed on ${frame.id}, trying to reconnect in 5s`)
    setTimeout (() => setupRelay (frame), 5000)
  } else {
    log (`${frame.status} ${frame.id} closed with exit code ${exitCode}`)
    delete retries[frame.id]
    
    const guilds = await getSubbedGuilds (frame.channel.id, 'relay')
    guilds.forEach (async g => {
      // TODO: get each entries eiether with getRelayEntries or check if history
      // for this frame exists, but then what channel??
      const blacklist   = g.blacklist.map (entry => entry.ytId)
      const unwanted    = g.customBannedPatterns
      const history     = await getGuildRelayHistory (g._id, frame.id)
      const filteredLog = history
        .filter (cmt => !blacklist.some (ytId => ytId === cmt.ytId))
        .filter (cmt => !unwanted.some (pattern => cmt.body.includes (pattern)))
        .map (cmt => `${cmt.timestamp} (${cmt.author}) ${cmt.body}`)
        .join ('\n')
      const ch = findTextChannel(g.)
    })
  }
}

////////////////////////////////////////////////////////////////////////////////

const retries: Record<VideoId, number> = {}
