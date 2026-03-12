import { migrateAndSeed, migrateSettings } from '~/server/db/index'

export default defineNitroPlugin(async () => {
  try {
    await migrateAndSeed()
    await migrateSettings()
    console.log('[GrantPortal] Database ready.')
  } catch (err) {
    console.error('[GrantPortal] Database setup failed:', err)
    console.error('[GrantPortal] Check DATABASE_URL in your .env file.')
  }
})
