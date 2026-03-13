import { upsertDeviceSession } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { deviceId, browser, os, screen, language, timezone } = body

  if (!deviceId) throw createError({ statusCode: 400, statusMessage: 'deviceId required' })

  // IP: try forwarded header (Vercel/proxies), fall back to direct connection
  const ip =
    getHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ||
    getHeader(event, 'x-real-ip') ||
    event.node.req.socket?.remoteAddress ||
    'unknown'

  const userAgent = getHeader(event, 'user-agent') || ''

  const sessionId = await upsertDeviceSession({
    deviceId,
    ip,
    userAgent,
    browser: browser || '',
    os: os || '',
    screen: screen || '',
    language: language || '',
    timezone: timezone || '',
  })

  return { sessionId }
})
