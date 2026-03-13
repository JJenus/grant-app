import { getAdminFromEvent } from '~/server/utils/auth'
import { setSetting } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const admin = await getAdminFromEvent(event)
  if (!admin) throw createError({ statusCode: 401 })
  const body = await readBody(event)
  const allowed = ['currency_symbol', 'currency_code', 'currency_name', 'min_location_distance']
  for (const key of allowed) {
    if (body[key] !== undefined) await setSetting(key, String(body[key]))
  }
  return { ok: true }
})

