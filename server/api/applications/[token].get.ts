import { getApplicationByToken } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')!
  const app = await getApplicationByToken(token)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return app
})
