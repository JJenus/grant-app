import { getDraftByEmail } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const { email } = getQuery(event) as { email?: string }
  if (!email) return { hasDraft: false }
  const draft = await getDraftByEmail(email)
  return draft ? { hasDraft: true, token: draft.token } : { hasDraft: false }
})

