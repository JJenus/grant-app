import { getAdminFromEvent } from '~/server/utils/auth'
import { listDeviceSessions } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const admin = await getAdminFromEvent(event)
  if (!admin) throw createError({ statusCode: 401 })

  const q = getQuery(event)
  const page = Math.max(1, parseInt(String(q.page || 1)))
  const limit = Math.min(50, parseInt(String(q.limit || 20)))

  return await listDeviceSessions({
    search: String(q.search || ''),
    page,
    limit,
  })
})
