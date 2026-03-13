import { recordDeviceLocation } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { deviceId, sessionId, latitude, longitude, accuracy } = body

  if (!deviceId || !sessionId || latitude == null || longitude == null) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const ip =
    getHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ||
    getHeader(event, 'x-real-ip') ||
    event.node.req.socket?.remoteAddress ||
    'unknown'

  const result = await recordDeviceLocation({ deviceId, sessionId, latitude, longitude, accuracy, ip })

  return { ok: true, result } // 'saved' or 'skipped'
})
