"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEven = exports.isNotNil = exports.removeDupeObjects = exports.removeDupes = exports.ciEquals = exports.toTitleCase = exports.doNothing = exports.asyncFind = exports.throwIt = exports.sleep = exports.match = void 0;
/** @file General helpers wrapping around ECMAScript itself */
const ramda_1 = require("ramda");
/**
 * Match expression. Supply it a dictionary for patterns, or Map if you
 * need keys of other types than string.
 * Must return a function for lazy evaluation; you may call it
 * later or immediately, e.g. `match (scrutinee, patterns) ()`
 */
function match(scrutinee, patterns) {
    return patterns instanceof Map
        ? patterns.get(scrutinee ?? 'default') ?? doNothing
        : typeof scrutinee === 'string'
            ? (patterns[scrutinee] ?? 'default') ?? doNothing
            : throwIt(new TypeError('Invalid scrutinee type. Try using a Map.'));
}
exports.match = match;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/** Imperfect throw expression awaiting for the TC39 proposal to advance. */
function throwIt(err) {
    throw (typeof err === 'string') ? new Error(err)
        : err;
}
exports.throwIt = throwIt;
async function asyncFind(haystack, predicate) {
    const checkHead = () => predicate((0, ramda_1.head)(haystack));
    return (0, ramda_1.isEmpty)(haystack) ? undefined
        : await checkHead() ? (0, ramda_1.head)(haystack)
            : asyncFind((0, ramda_1.tail)(haystack), predicate);
}
exports.asyncFind = asyncFind;
function doNothing() { }
exports.doNothing = doNothing;
function toTitleCase(str) {
    return str.toLowerCase().replace(/\b(\w)/g, c => c.toUpperCase());
}
exports.toTitleCase = toTitleCase;
function ciEquals(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
}
exports.ciEquals = ciEquals;
function removeDupes(array) {
    return [...new Set(array)];
}
exports.removeDupes = removeDupes;
function removeDupeObjects(array) {
    return array.filter((x, i) => i === array.findIndex(y => (0, ramda_1.equals)(x, y)));
}
exports.removeDupeObjects = removeDupeObjects;
function isNotNil(scrutinee) {
    return !(0, ramda_1.isNil)(scrutinee);
}
exports.isNotNil = isNotNil;
function isEven(n) {
    return n % 2 === 0;
}
exports.isEven = isEven;
//# sourceMappingURL=language.js.map