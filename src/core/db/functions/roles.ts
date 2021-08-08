import { createEmbedMessage, reply, validateRole } from '../../../helpers/discord'
import { getSettings, updateSettings } from './'
import { Message, Snowflake } from 'discord.js'
import { config } from '../../../config'
import { RoleSetting } from '../models'
import { match } from '../../../helpers'

interface RoleModifyOptions {
  type: RoleSetting
  msg: Message
  verb: string
  role: string
}

interface RoleModifyValidatedOptions extends RoleModifyOptions {
  verb: ValidVerb
  role: Snowflake
}

export function validateInputAndModifyRoleList (opts: RoleModifyOptions): void {
  const isVerbValid   = validVerbs.includes (opts.verb as any)
  const validatedRole = validateRole (opts.msg.guild!, opts.role)
  const isValid       = isVerbValid && validatedRole !== undefined
  const modifyIfValid = isValid ? modifyRoleList : showHelp

  modifyIfValid (opts as RoleModifyValidatedOptions)
}

///////////////////////////////////////////////////////////////////////////////

const validVerbs = ['add', 'remove'] as const
type ValidVerb   = typeof validVerbs[number]

async function showHelp (opts: RoleModifyValidatedOptions) {
  const settings = await getSettings (opts.msg.guild!)
  reply (opts.msg, createEmbedMessage (`
    **Usage:** \`${config.prefix}${opts.type} <add|remove> <role ID|mention>\`
    ${getRoleList (settings[opts.type])}
  `))
}

async function modifyRoleList (opts: RoleModifyValidatedOptions): Promise<void> {
  const applyModification = match (opts.verb, {
    add:    addRole,
    remove: removeRole
  })
  applyModification (opts)
}

async function addRole (opts: RoleModifyValidatedOptions): Promise<void> {
  const g = await getSettings (opts.msg)
  if (g[opts.type].includes (opts.role)) {
    reply (opts.msg, createEmbedMessage (`
      :warning: <@&${opts.role}> already in the ${opts.type} list.
      ${getRoleList (g[opts.type])}
    `))
  } else {
    const newRoles = [...g[opts.type], opts.role]
    updateSettings (opts.msg, { [opts.type]: newRoles })
    reply (opts.msg, createEmbedMessage (`
      :white_check_mark: <@&${opts.role}> was added to the ${opts.type} list.
      ${getRoleList (newRoles)}
    `))
  }
}

async function removeRole (opts: RoleModifyValidatedOptions): Promise<void> {
  const g = await getSettings (opts.msg)
  if (g[opts.type].includes (opts.role)) {
    const newRoles = g[opts.type].filter (id => id !== opts.role)
    updateSettings (opts.msg, { [opts.role]: newRoles })
    reply (opts.msg, createEmbedMessage (`
      :white_check_mark: <@&${opts.role}> was removed from the ${opts.type} list.
      ${getRoleList (newRoles)}
    `))
  } else {
    reply (opts.msg, createEmbedMessage (`
      :warning: <@&${opts.role}> not found in the current ${opts.type} list.
      ${getRoleList (g[opts.type])}
    `))
  }
}

function getRoleList (roles: Snowflake[]) {
  return `**Current**: ${roles.map (id => '<@&' + id + '>').join (' ')}`
}
