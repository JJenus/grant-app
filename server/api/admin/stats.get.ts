import { getAdminFromEvent } from '~/server/utils/auth'
import { getStats } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const admin = await getAdminFromEvent(event)
  if (!admin) throw createError({ statusCode: 401 })
  return await getStats()
})
