import { getAdminFromEvent } from '~/server/utils/auth'
import { getDeviceHistory } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const admin = await getAdminFromEvent(event)
  if (!admin) throw createError({ statusCode: 401 })

  const deviceId = getRouterParam(event, 'deviceId')!
  return await getDeviceHistory(deviceId)
})
