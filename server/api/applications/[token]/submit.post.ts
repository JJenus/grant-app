import { getApplicationByToken, submitApplication } from '~/server/db/index'
import { sendSubmissionConfirmation } from '~/server/utils/email'
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')!
  const app = await getApplicationByToken(token)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (app.status === 'submitted') return { ok: true }
  await submitApplication(token)
  sendSubmissionConfirmation(app.email, app.firstName).catch(console.error)
  return { ok: true }
})
