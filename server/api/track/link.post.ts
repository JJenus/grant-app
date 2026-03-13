import { linkSessionToApplication } from '~/server/db/index'

export default defineEventHandler(async (event) => {
  const { deviceId, applicationId } = await readBody(event)
  if (!deviceId || !applicationId) {
    throw createError({ statusCode: 400, statusMessage: 'deviceId and applicationId required' })
  }
  await linkSessionToApplication(deviceId, applicationId)
  return { ok: true }
})
