import fetch, { RequestInit } from 'node-fetch'

export async function getJson (
  endpoint: string,
  options?: RequestInit
): Promise<any> {
  const resp = await fetch (endpoint, options)
  return resp.json ()
}

export async function getText (
  endpoint: string,
  options?: RequestInit
): Promise<string> {
  const resp = await fetch (endpoint, options)
  return resp.text ()
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
