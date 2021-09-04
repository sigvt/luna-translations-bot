"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklisters = void 0;
const common_tags_1 = require("common-tags");
const roles_1 = require("../db/functions/roles");
exports.blacklisters = {
    config: {
        aliases: [],
        permLevel: 2
    },
    help: {
        category: 'General',
        usage: 'blacklisters <add|remove> <role mention|ID>',
        description: (0, common_tags_1.oneLine) `
      Add or remove a role to the bot blacklister list.
      (Admins and people with kick permissions are automatically blacklisters.)
    `,
    },
    callback: (msg, [verb, role]) => {
        (0, roles_1.validateInputAndModifyRoleList)({ type: 'blacklisters', msg, verb, role });
    }
};
//# sourceMappingURL=blacklisters.js.map