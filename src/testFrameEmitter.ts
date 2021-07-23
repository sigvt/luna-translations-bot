import { frameEmitter } from './modules/holodex'

frameEmitter.on ('frame', frame => {
  // console.log(frame.channel.name + ' ' + frame.id + ' ' + frame.status)
  // frame.description = ''
  // console.log(frame)
})
