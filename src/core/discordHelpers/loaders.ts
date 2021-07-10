import { readdirSync } from 'fs'
import { log } from '../../helpers'
import { Message } from 'discord.js'
import { filter, map } from 'ramda'
import { Map } from 'immutable'
import path from 'path'
import { throwIt, tryOrDie } from '../../helpers/language'

export function loadCommand (cmdFile: string): Command {
  return loadModule ('commands', cmdFile)
}

export function loadEvent (evtFile: string): BotEvent {
  return loadModule ('events', evtFile)
}

export function loadAllCommands (): Map<CommandName, Command> {
  return loadAll ('commands')
}

export function loadAllEvents (): Map<EventName, BotEvent> {
  return loadAll ('events')
}

export type BotEvent = (data?: unknown) => void

export interface Command {
  config: {
    aliases: string[],
    permLevel: number
  },
  help: {
    category: string,
    description: string,
    usage: string
  }
  callback: (msg: Message, args: string[]) => void | Promise<void>
}

//// PRIVATE //////////////////////////////////////////////////////////////////

type Module = Command & BotEvent

type EventName = string

type CommandName = string

function loadModule (dir: string, moduleFile: string): Module {
  const exportName = path.basename (moduleFile, '.js')
  const moduleObj  = tryOrDie (
    ()  => require (`../${dir}/${moduleFile}`)[exportName] as Module,
    err => throwIt (`Failed to load ${dir}/${moduleFile}: ${err}`)
  )

  log (`Loaded ${dir}/${moduleFile}`)

  return moduleObj
}

function loadAll (type: string): Map<string, Module> {
  const modules = resolveRelativePath (`../${type}`)
    |> readdirSync
    |> filter (isNotSourceMapFile)
    |> map ((f: string) => [path.basename(f, '.js'), loadModule (type, f)])
    |> Map
    |> filterUndefinedModules

  log(`Loaded ${modules.size} ${type}.`)

  return modules as Map<string, Module>
}

function isNotSourceMapFile (file: string) {
  return !file.endsWith ('.map')
}

function resolveRelativePath (target: string) {
  return path.resolve(__dirname, target)
}

function filterUndefinedModules (m: Map<string, Module>): Map<string, Module> {
  return m.filter (module => module !== undefined)
}
