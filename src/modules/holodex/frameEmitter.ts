import EventEmitter from 'events'
import { isEmpty, isNil } from 'ramda'
import { DexFrame, getFrameList } from './frames'
import { isSupported } from '../../core/db/streamers'

export const frameEmitter = FrameEmitter ()

///////////////////////////////////////////////////////////////////////////////

function FrameEmitter (): EventEmitter {
  const emitter = new EventEmitter ()
  continuouslyEmitNewFrames (emitter)
  return emitter
}

async function continuouslyEmitNewFrames (
  emitter: EventEmitter,
  previousFrames: DexFrame[] = []
): Promise<void> {
  const allFrames = await getFrameList ()
  const newFrames = allFrames
    ?.filter (frame => isNew (frame, previousFrames))
    ?? []

    newFrames.forEach (frame => {
      if (isSupported (frame.channel.id)) emitter.emit ('frame', frame)
    })

  const currentFrames = isEmpty (allFrames) ? previousFrames : allFrames
  setTimeout (() => continuouslyEmitNewFrames (emitter, currentFrames), 30000)
}

function isNew (frame: DexFrame, previousFrames: DexFrame[]): boolean {
  const isLive    = frame.status === 'live'
  const hasStart  = !isNil (frame.start_actual)
  const isEmitted = Boolean (previousFrames.find (pf => {
    const isSame           = pf.id === frame.id && pf.status === frame.status
    const previousHasStart = !isNil (pf.start_actual)
    return isLive ? (isSame && previousHasStart) : isSame
  }))
  return isLive ? (!isEmitted && hasStart) : !isEmitted
}
