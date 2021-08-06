import chalk from 'chalk'
import { match, SideEffect } from './'
import fs from 'fs'
import { config } from '../config'

/** Logs formatted message to console and log file. */
export function log (data: any) {
  return logger ('log', data)
}

/** Logs formatted warning to console and log file. */
export function warn (data: any) {
  return logger ('warn', data)
}

/** Logs formatted error to console and log file. */
export function error (data: any) {
  return logger ('error', data)
}

/** Logs formatted error information to console and log file. */
export function debug (data: any) {
  return logger ('debug', data)
}

////////////////////////////////////////////////////////////////////////////////

function logger <T> (category: string, data: T): T & SideEffect {
  const logFile = fs.createWriteStream (config.logFile, { flags: 'a' })
  const colorString = match (category, {
    log:   chalk.bgBlack,
    warn:  chalk.black.bgYellowBright,
    error: chalk.black.bgRedBright,
    debug: chalk.black.bgGreenBright,
  })

  const timeYYYYMMDD = new Date ().toISOString ().substr (0, 10)
  const timeHHMM     = new Date ().toISOString ().substr (11, 5)

  const label = ` ${category.toUpperCase ()} ` |> colorString

  console.log   (`${timeHHMM} ${label} ${data}`)
  logFile.write (`${category} | ${timeYYYYMMDD} ${timeHHMM} | ${data}\n`)

  return data
}
