import { clearAdminCookie } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  clearAdminCookie(event)
  return { ok: true }
})

