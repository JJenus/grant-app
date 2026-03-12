import { getAdminFromEvent } from '~/server/utils/auth'
import { getAllApplicationsForExport } from '~/server/db/index'
export default defineEventHandler(async (event) => {
  const admin = await getAdminFromEvent(event)
  if (!admin) throw createError({ statusCode: 401 })
  const apps = await getAllApplicationsForExport()
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const headers = ['ID','Status','First Name','Last Name','Email','Phone','Org Name','Org Type',
    'Category','Project Title','Amount Requested','Latitude','Longitude','Submitted At','Admin Notes']
  const rows = apps.map((a: any) => [
    esc(a.id), esc(a.status), esc(a.firstName), esc(a.lastName), esc(a.email), esc(a.phone),
    esc(a.orgName), esc(a.orgType), esc(a.grantCategory), esc(a.projectTitle),
    esc(a.amountRequested), esc(a.latitude), esc(a.longitude), esc(a.submittedAt), esc(a.adminNotes),
  ].join(','))
  const csv = [headers.map(esc).join(','), ...rows].join('\n')
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="applications-${new Date().toISOString().slice(0,10)}.csv"`)
  return csv
})
