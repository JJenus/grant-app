import { getAdminFromEvent } from '~/server/utils/auth'
import { getApplicationById, updateApplicationAdmin } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const admin = await getAdminFromEvent(event)
  if (!admin) throw createError({ statusCode: 401 })
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)
  if (method === 'GET') {
    const app = await getApplicationById(id)
    if (!app) throw createError({ statusCode: 404, statusMessage: 'Not found' })
    return app
  }
  if (method === 'PATCH') {
    const body = await readBody(event)
    const allowed = ['submitted', 'reviewing', 'approved', 'rejected']
    if (body.status && !allowed.includes(body.status)) throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
    await updateApplicationAdmin(id, { status: body.status, adminNotes: body.adminNotes })
    return { ok: true }
  }
  throw createError({ statusCode: 405 })
})
