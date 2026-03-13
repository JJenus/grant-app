import { sendResumeEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const { email, token } = await readBody(event)
  if (!email || !token) throw createError({ statusCode: 400, statusMessage: 'Missing email or token' })

  const config = useRuntimeConfig()
  const resumeUrl = `${config.appUrl}/apply?token=${token}`
  await sendResumeEmail(email, resumeUrl)

  return { ok: true }
})

