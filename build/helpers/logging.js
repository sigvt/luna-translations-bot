"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = exports.warn = exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
const _1 = require("./");
const fs_1 = __importDefault(require("fs"));
/** Logs formatted message to console and log file. */
function log(data) {
    return logger('log', data);
}
exports.log = log;
/** Logs formatted warning to console and log file. */
function warn(data) {
    return logger('warn', data);
}
exports.warn = warn;
/** Logs formatted debug information to console and log file. */
function debug(data) {
    return logger('debug', data);
}
exports.debug = debug;
////////////////////////////////////////////////////////////////////////////////
function logger(category, data) {
    const logFile = fs_1.default.createWriteStream('debug3.log', { flags: 'a' });
    const colorString = (0, _1.match)(category, {
        log: chalk_1.default.bgBlack,
        warn: chalk_1.default.black.bgYellowBright,
        error: chalk_1.default.black.bgRedBright,
        debug: chalk_1.default.black.bgGreenBright,
    });
    const timeYYYYMMDD = new Date().toISOString().substr(0, 10);
    const timeHHMM = new Date().toISOString().substr(11, 5);
    const label = colorString(` ${category.toUpperCase()} `);
    console.log(`${timeHHMM} ${label} ${data}`);
    logFile.write(`${category} | ${timeYYYYMMDD} ${timeHHMM} | ${data}\n`);
    return data;
}
//# sourceMappingURL=logging.js.map