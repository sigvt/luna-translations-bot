import EventEmitter from 'events'
import { isEmpty } from 'ramda'
import { DexFrame, getFrameList } from './frames'
import { isSupported } from '../../core/db/streamers'
import { removeDupeObjects } from '../../helpers'

export const frameEmitter =  FrameEmitter ()

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
  const newFrames = removeDupeObjects (
    allFrames?.filter (frame => isNew (frame, previousFrames)) ?? []
  )

  newFrames.forEach (frame => {
    if (isSupported (frame.channel.id)) {
      emitter.emit ('frame', frame)
    }
  })

  const currentFrames = isEmpty (allFrames) ? previousFrames : allFrames
  setTimeout (() => continuouslyEmitNewFrames (emitter, currentFrames), 30000)
}

function isNew (frame: DexFrame, previousFrames: DexFrame[]): boolean {
  return !Boolean (previousFrames.find (
    pf => pf.id === frame.id && pf.status === frame.status
  ))
}

