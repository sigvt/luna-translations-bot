import { Command } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyRoleList } from '../db/functions/roles'

export const blacklisters: Command = {
  config: {
    aliases:   [],
    permLevel: 2
  },
  help: {
    category: 'General',
    usage:    'blacklisters <add|remove> <role mention|ID>',
    description: oneLine`
      Add or remove a role to the bot blacklister list.
      (Admins and people with kick permissions are automatically blacklisters.)
    `,
  },
  callback: (msg: Message, [verb, role]: string[]): void => {
    validateInputAndModifyRoleList ({ type: 'blacklisters', msg, verb, role })
  }
}
