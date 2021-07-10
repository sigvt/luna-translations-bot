import { client } from '../'
import { config } from '../../config'
import { log } from '../../helpers'

export function ready () {
  log (`${client.user!.tag} serving ${client.guilds.cache.size} servers.`)

  client.user!.setActivity (`${config.prefix}help`, { type: 'PLAYING' })
}
