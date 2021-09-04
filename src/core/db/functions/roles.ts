import { createEmbedMessage, reply, validateRole } from '../../../helpers/discord'
import { getSettings, updateSettings } from './'
import { Message, Snowflake } from 'discord.js'
import { config } from '../../../config'
import { GuildSettings, RoleSetting } from '../models'
import { match } from '../../../helpers'

export function validateInputAndModifyRoleList (opts: RoleModifyOptions): void {
  const isVerbValid   = validVerbs.includes (opts.verb as any)
  const validatedRole = validateRole (opts.msg.guild!, opts.role)
  const isValid       = isVerbValid && validatedRole !== undefined
  const modifyIfValid = isValid ? modifyRoleList : showHelp
  const g             = getSettings (opts.msg)

  modifyIfValid ({ ...opts, role: validatedRole, g } as ValidatedOptions)
}

///////////////////////////////////////////////////////////////////////////////

const validVerbs = ['add', 'remove'] as const
type ValidVerb   = typeof validVerbs[number]

interface RoleModifyOptions {
  type: RoleSetting
  msg:  Message
  verb: string
  role: string
}

interface ValidatedOptions extends RoleModifyOptions {
  verb: ValidVerb
  role: Snowflake
  g:    GuildSettings
}

function showHelp (opts: ValidatedOptions): void {
  reply (opts.msg, createEmbedMessage (`
    **Usage:** \`${config.prefix}${opts.type} <add|remove> <role ID|mention>\`
    ${getRoleList (opts.g[opts.type])}
  `))
}

function modifyRoleList (opts: ValidatedOptions): void {
  const isNew  = ! opts.g[opts.type].includes (opts.role)
  const modify = match (opts.verb, {
    add:    isNew  ? addRole    : notifyNotNew,
    remove: !isNew ? removeRole : notifyNotFound
  })

  modify (opts)
}

function addRole (opts: ValidatedOptions): void {
  const newRoles = [...opts.g[opts.type], opts.role]
  updateSettings (opts.msg, { [opts.type]: newRoles })
  reply (opts.msg, createEmbedMessage (`
    :white_check_mark: <@&${opts.role}> was added to the ${opts.type} list.
    ${getRoleList (newRoles)}
  `))
}

async function removeRole (opts: ValidatedOptions): Promise<void> {
  const newRoles = opts.g[opts.type].filter (id => id !== opts.role)
  updateSettings (opts.msg, { [opts.type]: newRoles })
  reply (opts.msg, createEmbedMessage (`
    :white_check_mark: <@&${opts.role}> was removed from the ${opts.type} list.
    ${getRoleList (newRoles)}
  `))
}

function notifyNotNew (opts: ValidatedOptions): void {
  reply (opts.msg, createEmbedMessage (`
    :warning: <@&${opts.role}> already in the ${opts.type} list.
    ${getRoleList (opts.g[opts.type])}
  `))
}

function notifyNotFound (opts: ValidatedOptions): void {
  reply (opts.msg, createEmbedMessage (`
    :warning: <@&${opts.role}> not found in the current ${opts.type} list.
    ${getRoleList (opts.g[opts.type])}
  `))
}

function getRoleList (roles: Snowflake[]) {
  return `**Current**: ${roles.map (id => '<@&' + id + '>').join (' ')}`
}
