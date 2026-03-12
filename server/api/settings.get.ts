import { getSettings } from '~/server/db/index'
export default defineEventHandler(async () => {
  return await getSettings()
})
