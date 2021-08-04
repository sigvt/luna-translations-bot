/** @file General helpers wrapping around ECMAScript itself */

import { equals, head, isEmpty, isNil, tail, zip } from "ramda"

/**
 * Match expression. Supply it a dictionary for patterns, or Map if you
 * need keys of other types than string.
 * Must return a function for lazy evaluation; you may call it
 * later or immediately, e.g. `match (scrutinee, patterns) ()`
 */
export function match (
  scrutinee: unknown,
  patterns: Map<any, Fn> | Record<string | symbol, Fn>
): Fn {
  return patterns instanceof Map
    ? patterns.get (scrutinee ?? 'default') ?? (() => undefined)
    : typeof scrutinee === 'string'
    ? (patterns[scrutinee] ?? 'default') ?? (() => undefined)
    : new TypeError ('Invalid scrutinee type. Try using a Map.') |> throwIt
}

export function sleep (ms: number): Promise<void> {
  return new Promise (resolve => setTimeout(resolve, ms))
}

/** Imperfect throw expression awaiting for the TC39 proposal to advance. */
export function throwIt (err: Error | string): never {
  throw (typeof err === 'string') ? new Error (err)
                                  : err
}

export async function asyncFind <T> (
  haystack: T[],
  predicate: (scrutinee: T) => Promise<boolean> | boolean,
): Promise<T | undefined> {
    const checkHead = () => predicate (head (haystack)!)
  return isEmpty (haystack) ? undefined
       : await checkHead () ? head (haystack)
                            : asyncFind (tail (haystack), predicate)
}

export function doNothing (): void {}

// export function iife (fn: Fn) {
  // return fn ()
// }

export function toTitleCase (str: string): string {
  return str.toLowerCase ().replace (/\b(\w)/g, c => c.toUpperCase ())
}

export function ciEquals (a: string, b: string) {
  return a.localeCompare (b, undefined, { sensitivity: 'accent' }) === 0
}

export function removeDupes <T> (array: T[]): T[] {
  return [...new Set (array)]
}

export function removeDupeObjects <T extends object> (array: T[]): T[] {
  return array.filter ((x, i) => i === array.findIndex (y => equals (x, y)))
}

export function isNotNil (scrutinee: unknown): boolean {
  return !isNil (scrutinee)
}

/**
 * Same as Map.prototype.set except it returns a new map (use with F# pipes)
 * Usage: oldMap |> setKey (key, value)
 * */
export function setKey (
  key: any, value: any
): <K, V> (m: Map<K, V>) => Map<K, V> {
  return <K, V> (oldMap: Map<K, V>) => {
    const newMap = new Map (oldMap)
    newMap.set (key, value)
    return newMap
  }
}

/** Conveys a function has side-effects. Not enforced by compiler. Optional. */
export type SideEffect = unknown

export type Fn = (...args: unknown[]) => unknown
