import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

const getSecret = () => {
  const config = useRuntimeConfig()
  return new TextEncoder().encode(config.jwtSecret)
}

export async function signAdminToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret())
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}

export async function getAdminFromEvent(event: H3Event) {
  const token = getCookie(event, 'admin_token')
  if (!token) return null
  return await verifyAdminToken(token)
}

export function setAdminCookie(event: H3Event, token: string) {
  const config = useRuntimeConfig()

  // Derive secure flag from APP_URL, NOT from NODE_ENV.
  // Vercel always sets NODE_ENV=production — even on preview deploys —
  // so NODE_ENV is useless here. Instead check if the actual app URL is HTTPS.
  const appUrl = config.appUrl || config.public?.appUrl || ''
  const isHttps = appUrl.startsWith('https://')

  setCookie(event, 'admin_token', token, {
    httpOnly: true,
    secure: isHttps,
    // 'none' required when secure=true and requests may be cross-origin (preview deploys).
    // 'lax' is fine for non-secure local dev.
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export function clearAdminCookie(event: H3Event) {
  deleteCookie(event, 'admin_token', { path: '/' })
}
