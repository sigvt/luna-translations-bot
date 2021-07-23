import EventEmitter from 'events'
import { isNil } from 'ramda'
import { getBotwideData, updateBotwideData } from '../../core/db/botwideData'
import { BotwideData } from '../../core/db/models'
import { debug, removeDupes, tryOrDo } from '../../helpers'
import { DexFrame, getFrameList } from './frames'

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
  const allFrames   = await tryOrDo (getFrameList, () => debug ('holodex fail'))
  const botwideData = await getBotwideData ()
  const newFrames = allFrames
    ?.filter (frame => isNew (frame, previousFrames, botwideData))
    ?? []

  newFrames.forEach (frame => emitter.emit ('frame', frame))

  updateBotwideData ({ notifiedYtLives: [
    ...botwideData.notifiedYtLives,
    ...newFrames.map (f => f.id)
  ]})

  const nextArgs = [emitter, allFrames ?? previousFrames] as const
  setTimeout (() => continuouslyEmitNewFrames (...nextArgs), 5000)
}

function isOld (
  frame: DexFrame, previousFrames: DexFrame[], botwideData: BotwideData
): boolean {
  const isRecorded    = botwideData.notifiedYtLives.includes (frame.id)
  const isLive        = frame.status === 'live'
  const previousFrame = previousFrames.find (pf => {
    const isSame           = pf.id === frame.id && pf.status === frame.status
    const previousHasStart = !isNil (pf.start_actual)
    return isLive ? (isSame && previousHasStart) : isSame
  })
  return isRecorded || previousFrame !== undefined
}

function isNew (
  frame: DexFrame, previousFrames: DexFrame[], botwideData: BotwideData
): boolean {
  return !isOld (frame, previousFrames, botwideData)
}
