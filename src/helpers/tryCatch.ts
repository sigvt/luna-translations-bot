import { Fn, throwIt } from './language'
import { debug } from './logging'

// TODO: This interface needs to be streamlined

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

export function tryOrLog <T> (tryFn: () => T): T | undefined {
  try {
    return tryFn ()
  } catch (e) {
    debug (e)
  }
}

export async function asyncTryOrLog <T> (
  fn: () => Promise<T>
): Promise<T | undefined> {
  try {
    const value = await fn ()
    return value
  } catch (e) {
    debug (e)
  }
}


export function tryOrDefault <T> (tryFn: () => T, defaultValue: T): T {
  try {
    return tryFn ()
  } catch (e) {
    debug (e)
    return defaultValue
  }
}
export async function asyncTryOrDefault <T> (
  tryFn: () => T | Promise<T>, defaultValue: T
): Promise<T> {
  try {
    const value = await tryFn ()
    return value
  } catch (e) {
    debug (e)
    return defaultValue
  }
}
