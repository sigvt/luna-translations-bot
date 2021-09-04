"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = exports.deleteKey = exports.setKey = void 0;
/**
 * Same as Map.prototype.set except it returns a new map (use with F# pipes)
 * Usage: const newMap = oldMap |> setKey (key, value)
 **/
function setKey(k, v) {
    return getFnCallingMethodOnMapCopy({ method: 'set', args: [k, v] });
}
exports.setKey = setKey;
/**
 * Same as Map.prototype.delete except it returns a new map (use with F# pipes)
 * Usage: const newMap = oldMap |> deleteKey (key)
 **/
function deleteKey(key) {
    return getFnCallingMethodOnMapCopy({ method: 'delete', args: [key] });
}
exports.deleteKey = deleteKey;
function filter(m, predicate) {
    return new Map([...m].filter(([k, v]) => predicate(v, k)));
}
exports.filter = filter;
function getFnCallingMethodOnMapCopy({ method, args }) {
    return (oldMap) => {
        const newMap = new Map(oldMap);
        newMap[method](args[0], args[1]);
        return newMap;
    };
}
//# sourceMappingURL=immutableES6MapFunctions.js.map