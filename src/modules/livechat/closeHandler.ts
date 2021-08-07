import { deleteRelayHistory, filterAndStringifyHistory, getAllRelayHistories, getSettings } from "../../core/db/functions"
import { RelayedComment } from "../../core/db/models/RelayedComment"
import { debug, isNotNil, log} from "../../helpers"
import { findTextChannel, send } from "../../helpers/discord"
import { DexFrame, getFrameList, VideoId } from "../holodex/frames"
import { deleteChatProcess } from "./chatProcesses"
import { findFrameThread, setupRelay } from "./chatRelayer"

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
    const g      = await getSettings (gid)
    const ch     = findTextChannel (history[0].discordCh!)
    const thread = g.threads ? findFrameThread (videoId, ch) : undefined
    const tlLog  = await filterAndStringifyHistory (gid, history)

    deleteRelayHistory (videoId, gid)
    send (thread ?? ch, {
      content: `Here is this stream's TL log. <https://youtu.be/${videoId}>`,
      files:   [{ attachment: Buffer.from (tlLog), name: `${videoId}.txt` }]
    })
  })
}
