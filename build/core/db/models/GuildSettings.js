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
exports.GuildSettingsDb = exports.GuildSettings = exports.BlacklistItem = exports.WatchFeatureSettings = void 0;
/**
 * @file MongoDB model for guild settings. Using MongoDB over a simple
 * Enmap as settings also need to be accessed from the web dashboard.
 */
const typegoose_1 = require("@typegoose/typegoose");
class WatchFeatureSettings {
    streamer;
    discordCh;
    roleToNotify;
}
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], WatchFeatureSettings.prototype, "streamer", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], WatchFeatureSettings.prototype, "discordCh", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], WatchFeatureSettings.prototype, "roleToNotify", void 0);
exports.WatchFeatureSettings = WatchFeatureSettings;
class BlacklistItem {
    ytId;
    name;
    reason;
}
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], BlacklistItem.prototype, "ytId", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], BlacklistItem.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], BlacklistItem.prototype, "reason", void 0);
exports.BlacklistItem = BlacklistItem;
class GuildSettings {
    _id;
    admins;
    blacklist;
    blacklisters;
    cameos;
    community;
    customWantedPatterns;
    customBannedPatterns;
    deepl;
    logChannel;
    gossip;
    modMessages;
    relay;
    threads;
    twitcasting;
    youtube;
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], GuildSettings.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [String], default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "admins", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => BlacklistItem, default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "blacklist", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [String], default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "blacklisters", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => WatchFeatureSettings, default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "cameos", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => WatchFeatureSettings, default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "community", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [String], default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "customWantedPatterns", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [String], default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "customBannedPatterns", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: true }),
    __metadata("design:type", Boolean)
], GuildSettings.prototype, "deepl", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], GuildSettings.prototype, "logChannel", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => WatchFeatureSettings, default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "gossip", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: true }),
    __metadata("design:type", Boolean)
], GuildSettings.prototype, "modMessages", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => WatchFeatureSettings, default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "relay", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], GuildSettings.prototype, "threads", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => WatchFeatureSettings, default: [] }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "twitcasting", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => WatchFeatureSettings }),
    __metadata("design:type", Array)
], GuildSettings.prototype, "youtube", void 0);
exports.GuildSettings = GuildSettings;
exports.GuildSettingsDb = (0, typegoose_1.getModelForClass)(GuildSettings);
//# sourceMappingURL=GuildSettings.js.map