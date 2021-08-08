/**
 * Same as Map.prototype.set except it returns a new map (use with F# pipes)
 * Usage: const newMap = oldMap |> setKey (key, value)
 **/
export function setKey (k: any, v: any): <K, V> (m: Map<K, V>) => Map<K, V> {
  return getFnCallingMethodOnMapCopy ({ method: 'set', args: [k, v] })
}

/**
 * Same as Map.prototype.delete except it returns a new map (use with F# pipes)
 * Usage: const newMap = oldMap |> deleteKey (key)
 **/
export function deleteKey (key: any): <K, V> (m: Map<K, V>) => Map<K, V> {
  return getFnCallingMethodOnMapCopy ({ method: 'delete', args: [key] })
}

///////////////////////////////////////////////////////////////////////////////

type MapMethods = 'clear' | 'delete' | 'set'

// I regret doing currying in this way...
function getFnCallingMethodOnMapCopy (
  { method, args }: { method: MapMethods, args: any[] }
): <K, V> (m: Map<K, V>) => Map<K, V> {
  return <K, V> (oldMap: Map<K, V>) => {
    const newMap = new Map (oldMap)
    newMap[method] (args[0], args[1])
    return newMap
  }
}
