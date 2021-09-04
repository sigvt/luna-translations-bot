"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admins = void 0;
const common_tags_1 = require("common-tags");
const roles_1 = require("../db/functions/roles");
exports.admins = {
    config: {
        aliases: ['admins', 'admin', 'adminRole', 'a'],
        permLevel: 2
    },
    help: {
        category: 'General',
        usage: 'admins <add|remove> <role mention|ID>',
        description: (0, common_tags_1.oneLine) `
      Add or remove a role to the bot admin list.
      (People with kick permissions are automatically bot admin.)
    `,
    },
    callback: (msg, [verb, role]) => {
        (0, roles_1.validateInputAndModifyRoleList)({ type: 'admins', msg, verb, role });
    }
};
//# sourceMappingURL=admins.js.map