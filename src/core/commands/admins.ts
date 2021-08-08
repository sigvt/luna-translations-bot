import { Command } from '../../helpers/discord'
import { Message } from 'discord.js'
import { oneLine } from 'common-tags'
import { validateInputAndModifyRoleList } from '../db/functions/roles'

export const admins: Command = {
  config: {
    aliases:   ['admins', 'admin', 'adminRole', 'a'],
    permLevel: 2
  },
  help: {
    category: 'General',
    usage:    'admins <add|remove> <role mention|ID>',
    description: oneLine`
      Add or remove a role to the bot admin list.
      (People with kick permissions are automatically bot admin.)
    `,
  },
  callback: (msg: Message, [verb, role]: string[]): void => {
    validateInputAndModifyRoleList ({ type: 'admins', msg, verb, role })
  }
}
