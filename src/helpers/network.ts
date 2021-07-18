import fetch from 'node-fetch'

export async function getJson (endpoint: string): Promise<any> {
  new URLSearchParams ()
  const resp = await fetch (endpoint)
  return resp.json ()
}

export function Params (params: UrlParams) {
  return new URLSearchParams (params)
}

///////////////////////////////////////////////////////////////////////////////

type UrlParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams
  | undefined
