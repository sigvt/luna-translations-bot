import EventEmitter from 'events'
import { isNil } from 'ramda'
import { debug, tryOrDo } from '../../helpers'
import { DexFrame, getFrameList } from './frames'

export const frameEmitter = FrameEmitter ()

///////////////////////////////////////////////////////////////////////////////

function FrameEmitter (): EventEmitter {
  const emitter = new EventEmitter ()
  watchForAndEmitNewFrames (emitter)
  return emitter
}

async function watchForAndEmitNewFrames (
  emitter: EventEmitter,
  previousFrames: DexFrame[] = []
): Promise<void> {
  const allFrames = await tryOrDo (getFrameList, () => debug ('holodex fail'))
  const newFrames = allFrames
    ?.filter (frame => hasStart (frame) && isNew (frame, previousFrames))
    ?? []

  newFrames.forEach (frame => emitter.emit ('frame', frame))

  setTimeout (() => watchForAndEmitNewFrames (emitter, allFrames ?? previousFrames), 15000)
}

function hasStart (frame: DexFrame): boolean {
  return !isNil (frame.start_actual)
}

function isNew (frame: DexFrame, previousFrames: DexFrame[]): boolean {
  return !Boolean (previousFrames.find (pf => pf.id     === frame.id
                                           && pf.status === frame.status
                                           && pf.status !== 'live'
                                           || hasStart (pf) ))
}
