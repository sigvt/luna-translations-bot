"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildDataDb = exports.BlacklistNotice = exports.GuildData = void 0;
/**
 * @file Per-guild persistent data (not settings)
 */
const typegoose_1 = require("@typegoose/typegoose");
const constants_1 = require("@typegoose/typegoose/lib/internal/constants");
const RelayedComment_1 = require("./RelayedComment");
class GuildData {
    _id;
    relayNotices;
    relayHistory;
    blacklistNotices;
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], GuildData.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: () => new Map() }, constants_1.WhatIsIt.MAP),
    __metadata("design:type", Map)
], GuildData.prototype, "relayNotices", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [RelayedComment_1.RelayedComment], default: () => new Map() }, constants_1.WhatIsIt.MAP),
    __metadata("design:type", Map)
], GuildData.prototype, "relayHistory", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => BlacklistNotice, default: () => new Map() }, constants_1.WhatIsIt.MAP),
    __metadata("design:type", Map)
], GuildData.prototype, "blacklistNotices", void 0);
exports.GuildData = GuildData;
class BlacklistNotice {
    ytId;
    videoId;
    originalMsgId;
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], BlacklistNotice.prototype, "ytId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], BlacklistNotice.prototype, "videoId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], BlacklistNotice.prototype, "originalMsgId", void 0);
exports.BlacklistNotice = BlacklistNotice;
exports.GuildDataDb = (0, typegoose_1.getModelForClass)(GuildData);
//# sourceMappingURL=GuildData.js.map