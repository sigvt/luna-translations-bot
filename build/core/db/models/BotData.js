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
exports.BotDataDb = exports.BotData = void 0;
/** @file Persistent data not specific to any server */
const typegoose_1 = require("@typegoose/typegoose");
const constants_1 = require("@typegoose/typegoose/lib/internal/constants");
const RelayedComment_1 = require("./RelayedComment");
class BotData {
    notifiedYtLives;
    lastCommunityPosts;
    relayHistory;
}
__decorate([
    (0, typegoose_1.prop)({ type: () => [String], default: [] }),
    __metadata("design:type", Array)
], BotData.prototype, "notifiedYtLives", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, default: () => new Map() }, constants_1.WhatIsIt.MAP),
    __metadata("design:type", Map)
], BotData.prototype, "lastCommunityPosts", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [RelayedComment_1.RelayedComment], default: () => new Map() }, constants_1.WhatIsIt.MAP),
    __metadata("design:type", Map)
], BotData.prototype, "relayHistory", void 0);
exports.BotData = BotData;
exports.BotDataDb = (0, typegoose_1.getModelForClass)(BotData);
//# sourceMappingURL=BotData.js.map