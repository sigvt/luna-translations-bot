"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guildCreate = void 0;
const helpers_1 = require("../../helpers");
function guildCreate(guild) {
    (0, helpers_1.log)(`${guild.name} (${guild.id}) added the bot. (Owner: ${guild.ownerId})`);
}
exports.guildCreate = guildCreate;
//# sourceMappingURL=guildCreate.js.map