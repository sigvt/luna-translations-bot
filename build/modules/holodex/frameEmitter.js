"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.frameEmitter = void 0;
const events_1 = __importDefault(require("events"));
const ramda_1 = require("ramda");
const frames_1 = require("./frames");
const streamers_1 = require("../../core/db/streamers");
const helpers_1 = require("../../helpers");
exports.frameEmitter = FrameEmitter();
///////////////////////////////////////////////////////////////////////////////
function FrameEmitter() {
    const emitter = new events_1.default();
    continuouslyEmitNewFrames(emitter);
    return emitter;
}
async function continuouslyEmitNewFrames(emitter, previousFrames = []) {
    const allFrames = await (0, frames_1.getFrameList)();
    const newFrames = (0, helpers_1.removeDupeObjects)(allFrames?.filter(frame => isNew(frame, previousFrames)) ?? []);
    newFrames.forEach(frame => {
        if ((0, streamers_1.isSupported)(frame.channel.id)) {
            emitter.emit('frame', frame);
        }
    });
    const currentFrames = (0, ramda_1.isEmpty)(allFrames) ? previousFrames : allFrames;
    setTimeout(() => continuouslyEmitNewFrames(emitter, currentFrames), 30000);
}
function isNew(frame, previousFrames) {
    return !Boolean(previousFrames.find(pf => pf.id === frame.id && pf.status === frame.status));
}
//# sourceMappingURL=frameEmitter.js.map