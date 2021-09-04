"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllEvents = exports.loadAllCommands = exports.loadEvent = exports.loadCommand = void 0;
const fs_1 = require("fs");
const helpers_1 = require("../../helpers");
const immutable_1 = require("immutable");
const path_1 = __importDefault(require("path"));
const language_1 = require("../language");
function loadCommand(cmdFile) {
    return loadModule('commands', cmdFile);
}
exports.loadCommand = loadCommand;
function loadEvent(evtFile) {
    return loadModule('events', evtFile);
}
exports.loadEvent = loadEvent;
function loadAllCommands() {
    return loadAll('commands');
}
exports.loadAllCommands = loadAllCommands;
function loadAllEvents() {
    return loadAll('events');
}
exports.loadAllEvents = loadAllEvents;
function loadModule(dir, moduleFile) {
    const exportName = path_1.default.basename(moduleFile, '.js');
    const modulePath = `../../core/${dir}/${moduleFile}`;
    const moduleObj = require(modulePath)[exportName];
    (0, helpers_1.log)(`Loaded ${dir}/${moduleFile}`);
    return moduleObj;
}
function loadAll(type) {
    const files = (0, fs_1.readdirSync)(resolveRelativePath(`../../core/${type}`));
    const modules = (filterUndefinedModules((0, immutable_1.Map)(files
        .filter(isNotSourceMapFile)
        .map((f) => [path_1.default.basename(f, '.js'), loadModule(type, f)])
        .filter(language_1.isNotNil))));
    (0, helpers_1.log)(`Loaded ${modules.size} ${type}.`);
    return modules;
}
function isNotSourceMapFile(file) {
    return !file.endsWith('.map');
}
function resolveRelativePath(target) {
    return path_1.default.resolve(__dirname, target);
}
function filterUndefinedModules(m) {
    return m.filter(module => module !== undefined);
}
//# sourceMappingURL=loaders.js.map