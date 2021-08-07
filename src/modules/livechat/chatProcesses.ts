import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { debug } from '../../helpers'
import { VideoId } from '../holodex/frames'

/** Returns a singleton of the chat process for a given video ID */
export function getChatProcess (videoId: VideoId): ChatProcess {
  return chatProcesses[videoId] ??= spawnChatProcess (videoId)
}

export function deleteChatProcess (videoId: VideoId): void {
  delete chatProcesses[videoId]
}

///////////////////////////////////////////////////////////////////////////////

const chatProcesses: Record<VideoId, ChatProcess> = {}

type ChatProcess = ChildProcessWithoutNullStreams

function spawnChatProcess (liveId: VideoId): ChatProcess {
  // debug (`spawning ${liveId}`)
  return spawn ('python3', ['-u', './modules/livechat/chat_dl.py', liveId])
}
