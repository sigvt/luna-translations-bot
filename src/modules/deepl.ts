import fetch from 'node-fetch'
import { config } from '../config'

export async function tl (text: string): Promise<string> {
  const resp = await fetch ('https://api-free.deepl.com/v2/translate', {
    body: `auth_key=${config.deeplKey}&text=${text}&target_lang=EN`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  })
  const respText = await resp.text ()
  const tlObject = JSON.parse (respText)
  const wasEng   = tlObject.translations[0].detected_source_language === 'EN'

  return wasEng ? text : tlObject.translations[0].text
}
