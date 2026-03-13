import { getAdminFromEvent } from '~/server/utils/auth'
import { listApplications } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const admin = await getAdminFromEvent(event)
  if (!admin) throw createError({ statusCode: 401 })
  const q = getQuery(event) as any
  const page = parseInt(q.page || '1')
  const limit = parseInt(q.limit || '20')
  const result = await listApplications({ status: q.status, search: q.search, page, limit })
  return { ...result, page, limit }
})

