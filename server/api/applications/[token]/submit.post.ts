import { getApplicationByToken, submitApplication, getSettings } from '~/server/db/index'
import { sendSubmissionConfirmation } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')!
  const app = await getApplicationByToken(token)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (app.status === 'submitted') return { ok: true }

  await submitApplication(token)

  // Format amount with the stored currency symbol before passing to email
  const settings = await getSettings()
  const symbol = settings.currency_symbol || '₦'
  const amountFormatted = app.amountRequested
    ? symbol + Number(app.amountRequested).toLocaleString()
    : '—'

  sendSubmissionConfirmation(app.email, {
    firstName: app.firstName || '',
    lastName: app.lastName || '',
    projectTitle: app.projectTitle || '',
    grantCategory: app.grantCategory || '',
    amountRequested: amountFormatted,
  }).catch(console.error)

  return { ok: true }
})
