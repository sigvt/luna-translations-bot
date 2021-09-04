"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guildDelete = void 0;
const helpers_1 = require("../../helpers");
const functions_1 = require("../db/functions");
function guildDelete(guild) {
    (0, helpers_1.log)(`${guild.name} (${guild.id}) left. Data and settings cleared.)`);
    (0, functions_1.deleteGuildData)(guild.id);
    (0, functions_1.deleteGuildSettings)(guild.id);
}
exports.guildDelete = guildDelete;
//# sourceMappingURL=guildDelete.js.map