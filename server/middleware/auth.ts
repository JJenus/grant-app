import { getAdminFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/admin')) return
  if (path === '/api/admin/login') return

  const admin = await getAdminFromEvent(event)
  if (!admin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})

