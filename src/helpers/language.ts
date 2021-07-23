/** @file General helpers wrapping around ECMAScript itself */

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

export function isEven (x: number) {
  return x % 2 === 0
}

export function isOdd (x: number) {
  return x % 2 === 1
}

export function getEvenElements (arr: any[]) {
  return arr.filter ((_, i) => isEven (i))
}

export function getOddElements (arr: any[]) {
  return arr.filter ((_, i) => isOdd (i))
}

export function zip <T, U> (arr1: T[], arr2: U[]): Array<[T, U]> {
  return arr1.map ((x, i) => [x, arr2[i]])
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
  const doesHeadQualify = await predicate (head (haystack))
  return empty (haystack) ? undefined
       : doesHeadQualify  ? head (haystack)
                          : asyncFind (tail (haystack), predicate)
}

export function doNothing (): void {}

export function tryOrDie <T> (
  tryFn: () => T,
  catchFn: (e: any) => never = throwIt
): T {
  try {
    return tryFn ()
  } catch (e) {
    catchFn (e)
  }
}

export function tryOrDo <T> (tryFn: () => T, catchFn: Fn): T | undefined {
  try {
    return tryFn ()
  } catch (e) {
    catchFn (e)
  }
}

export function head <T> (arr: T[]): T {
  return arr[0]
}

export function tail <T> (arr: T[]): T[] {
  return arr.slice (1)
}

export function init <T> (arr: T[]): T[] {
  return arr.slice (0, -1)
}

export function last <T> (arr: T[]): T {
  return arr[arr.length-1]
}

export function empty (arr: any[]): boolean {
  return arr.length === 0
}

export function iife (fn: Fn) {
  return fn ()
}

export function toTitleCase (str: string): string {
  return str.toLowerCase ().replace (/\b(\w)/g, c => c.toUpperCase ())
}

export function ciEquals (a: string, b: string) {
  return a.localeCompare (b, undefined, { sensitivity: 'accent' }) === 0
}

export function removeDupes <T> (array: T[]): T[] {
  return [...new Set (array)]
}

/** Conveys a function has side-effects. Not enforced by compiler. Optional. */
export type SideEffect = unknown

export type Fn = (...args: unknown[]) => unknown
