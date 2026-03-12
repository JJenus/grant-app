import { createRequire } from 'module'
import bcrypt from 'bcryptjs'
import { getAdminByEmail, updateAdminLastLogin } from '~/server/db/index'
import { signAdminToken, setAdminCookie } from '~/server/utils/auth'
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Email and password required' })
  const admin = await getAdminByEmail(email)
  if (!admin) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  const valid = await bcrypt.compare(password, admin.password_hash)
  if (!valid) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  await updateAdminLastLogin(admin.id)
  const token = await signAdminToken({ adminId: admin.id, email: admin.email, name: admin.name })
  setAdminCookie(event, token)
  return { ok: true, name: admin.name }
})
