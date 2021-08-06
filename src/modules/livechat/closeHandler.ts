import { deleteRelayHistory, getAllRelayHistories, getSettings } from "../../core/db/functions"
import { RelayedComment } from "../../core/db/models/RelayedComment"
import { debug, isNotNil, log} from "../../helpers"
import { findTextChannel, send } from "../../helpers/discord"
import { DexFrame, getFrameList, VideoId, YouTubeChannelId } from "../holodex/frames"
import { deleteChatProcess } from "./chatProcesses"
import { setupRelay } from "./chatRelayer"

export async function retryIfStillUpThenPostLog (
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
    sendAndForgetHistory (frame.id)
  }
}

////////////////////////////////////////////////////////////////////////////////

const retries: Record<VideoId, number> = {}

async function sendAndForgetHistory (videoId: VideoId): Promise<void> {
  const relevantHistories = (await getAllRelayHistories ())
    .map (history => history.get (videoId))
    .filter (isNotNil)

  relevantHistories.forEach (async (history: RelayedComment[], gid) => {
    const g         = await getSettings (gid)
    const blacklist = g.blacklist.map (entry => entry.ytId)
    const unwanted  = g.customBannedPatterns
    const ch        = findTextChannel (history[0].discordCh!)
    const tlLog     = history
      .filter (cmt => isNotBanned (cmt, unwanted, blacklist))
      .map (cmt => `${cmt.timestamp} (${cmt.author}) ${cmt.body}`)
      .join ('\n')

    deleteRelayHistory (videoId, gid)
    if (ch) send (ch, {
      content: `Here is this stream's TL log. (${videoId})`,
      files:   [{ attachment: Buffer.from (tlLog), name: `${videoId}.txt` }]
    })
  })
}

function isNotBanned (
  cmt: RelayedComment, unwanted: string[], blacklist: YouTubeChannelId[]
): boolean {
  return blacklist.every (ytId => ytId !== cmt.ytId)
      && unwanted.every (
           p => !cmt.body.toLowerCase ().includes (p.toLowerCase ())
         )
}
