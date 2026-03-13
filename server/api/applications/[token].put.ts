import { getApplicationByToken, updateApplication } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')!
  const existing = await getApplicationByToken(token)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (existing.status === 'submitted') throw createError({ statusCode: 400, statusMessage: 'Cannot edit a submitted application' })
  const body = await readBody(event)
  await updateApplication(token, body)
  return { ok: true, token }
})

