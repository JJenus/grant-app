import pg from 'pg'
import { createRequire } from 'module'

import bcrypt from 'bcryptjs'

const { Pool } = pg

let _pool: InstanceType<typeof Pool> | null = null

function getPool() {
  if (_pool) return _pool
  const config = useRuntimeConfig()
  if (!config.databaseUrl) throw new Error('DATABASE_URL is not set in .env')
  _pool = new Pool({ connectionString: config.databaseUrl })
  return _pool
}

async function query(sql: string, params: any[] = []) {
  const pool = getPool()
  const result = await pool.query(sql, params)
  return result.rows
}

async function queryOne(sql: string, params: any[] = []) {
  const rows = await query(sql, params)
  return rows[0] ?? null
}

// Runs once on first request — creates tables + default admin if they don't exist
export async function migrateAndSeed() {
  const pool = getPool()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id            TEXT PRIMARY KEY,
      token         TEXT UNIQUE NOT NULL,
      status        TEXT NOT NULL DEFAULT 'draft',
      email         TEXT NOT NULL DEFAULT '',
      first_name    TEXT NOT NULL DEFAULT '',
      last_name     TEXT NOT NULL DEFAULT '',
      phone         TEXT NOT NULL DEFAULT '',
      org_name      TEXT NOT NULL DEFAULT '',
      org_type      TEXT NOT NULL DEFAULT '',
      website       TEXT NOT NULL DEFAULT '',
      ein           TEXT NOT NULL DEFAULT '',
      grant_category TEXT NOT NULL DEFAULT '',
      project_title  TEXT NOT NULL DEFAULT '',
      description   TEXT NOT NULL DEFAULT '',
      goals         TEXT NOT NULL DEFAULT '',
      amount_requested NUMERIC,
      budget_breakdown TEXT NOT NULL DEFAULT '[]',
      other_funding TEXT NOT NULL DEFAULT '',
      latitude      NUMERIC,
      longitude     NUMERIC,
      admin_notes   TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      submitted_at  TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_app_email  ON applications(email);
    CREATE INDEX IF NOT EXISTS idx_app_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_app_token  ON applications(token);

    CREATE TABLE IF NOT EXISTS admin_users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    );
  `)

  // Seed default admin if none exists
  const existing = await queryOne('SELECT id FROM admin_users LIMIT 1')
  if (!existing) {
    const config = useRuntimeConfig()
    const defaultPassword = (config as any).adminPassword || 'admin123'
    const hash = await bcrypt.hash(defaultPassword, 12)
    const id = crypto.randomUUID()
    await query(
      'INSERT INTO admin_users (id, email, password_hash, name) VALUES ($1,$2,$3,$4)',
      [id, 'admin@example.com', hash, 'Admin']
    )
    console.log('[GrantPortal] Created default admin: admin@example.com / ' + defaultPassword)
    console.log('[GrantPortal] Set ADMIN_PASSWORD in .env to change the default password.')
  }
}

// ─── Application helpers ──────────────────────────────────────────────────────

export async function createApplication(data: Record<string, any>) {
  const id = crypto.randomUUID()
  const token = crypto.randomUUID()
  await query(`
    INSERT INTO applications (id, token, status, email, first_name, last_name, phone,
      org_name, org_type, website, ein, grant_category, project_title, description,
      goals, amount_requested, budget_breakdown, other_funding, latitude, longitude)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
    [id, token, 'draft',
      data.email || '', data.firstName || '', data.lastName || '', data.phone || '',
      data.orgName || '', data.orgType || '', data.website || '', data.ein || '',
      data.grantCategory || '', data.projectTitle || '', data.description || '',
      data.goals || '',
      data.amountRequested ? parseFloat(data.amountRequested) : null,
      JSON.stringify(data.budgetBreakdown || []),
      data.otherFunding || '',
      data.latitude ?? null, data.longitude ?? null
    ])
  return { id, token }
}

export async function updateApplication(token: string, data: Record<string, any>) {
  await query(`
    UPDATE applications SET
      email=$1, first_name=$2, last_name=$3, phone=$4,
      org_name=$5, org_type=$6, website=$7, ein=$8,
      grant_category=$9, project_title=$10, description=$11, goals=$12,
      amount_requested=$13, budget_breakdown=$14, other_funding=$15,
      latitude=$16, longitude=$17, updated_at=NOW()
    WHERE token=$18`,
    [(data.email || '').toLowerCase().trim(),
      data.firstName || '', data.lastName || '', data.phone || '',
      data.orgName || '', data.orgType || '', data.website || '', data.ein || '',
      data.grantCategory || '', data.projectTitle || '', data.description || '',
      data.goals || '',
      data.amountRequested ? parseFloat(data.amountRequested) : null,
      JSON.stringify(data.budgetBreakdown || []),
      data.otherFunding || '',
      data.latitude ?? null, data.longitude ?? null,
      token
    ])
}

export async function getApplicationByToken(token: string) {
  const r = await queryOne('SELECT * FROM applications WHERE token=$1', [token])
  return r ? rowToApp(r) : null
}

export async function getApplicationById(id: string) {
  const r = await queryOne('SELECT * FROM applications WHERE id=$1', [id])
  return r ? rowToApp(r) : null
}

export async function getDraftByEmail(email: string) {
  return await queryOne(
    "SELECT token FROM applications WHERE email=$1 AND status='draft' ORDER BY updated_at DESC LIMIT 1",
    [email.toLowerCase().trim()]
  ) as { token: string } | null
}

export async function submitApplication(token: string) {
  await query(
    "UPDATE applications SET status='submitted', submitted_at=NOW(), updated_at=NOW() WHERE token=$1",
    [token]
  )
}

export async function listApplications(opts: { status?: string; search?: string; page: number; limit: number }) {
  const conditions = ["status != 'draft'"]
  const params: any[] = []
  let i = 1

  if (opts.status && opts.status !== 'all') {
    conditions.push(`status=$${i++}`)
    params.push(opts.status)
  }
  if (opts.search) {
    const s = '%' + opts.search + '%'
    conditions.push(`(email ILIKE $${i} OR first_name ILIKE $${i+1} OR last_name ILIKE $${i+2} OR project_title ILIKE $${i+3} OR org_name ILIKE $${i+4})`)
    params.push(s, s, s, s, s)
    i += 5
  }

  const where = 'WHERE ' + conditions.join(' AND ')
  const totalRow = await queryOne(`SELECT COUNT(*) as n FROM applications ${where}`, params)
  const total = parseInt(totalRow?.n ?? '0')
  const offset = (opts.page - 1) * opts.limit
  const rows = await query(
    `SELECT * FROM applications ${where} ORDER BY submitted_at DESC NULLS LAST LIMIT $${i} OFFSET $${i+1}`,
    [...params, opts.limit, offset]
  )
  return { applications: rows.map(rowToApp), total }
}

export async function updateApplicationAdmin(id: string, data: { status?: string; adminNotes?: string }) {
  await query(
    "UPDATE applications SET status=COALESCE($1,status), admin_notes=COALESCE($2,admin_notes), updated_at=NOW() WHERE id=$3",
    [data.status ?? null, data.adminNotes ?? null, id]
  )
}

export async function getStats() {
  const counts = await query("SELECT status, COUNT(*) as n FROM applications WHERE status != 'draft' GROUP BY status")
  const map = Object.fromEntries(counts.map((r: any) => [r.status, parseInt(r.n)]))
  const totalRow = await queryOne("SELECT COUNT(*) as n FROM applications WHERE status != 'draft'")
  const sumRow = await queryOne("SELECT COALESCE(SUM(amount_requested),0) as s FROM applications WHERE status != 'draft'")
  return {
    total: parseInt(totalRow?.n ?? '0'),
    submitted: map['submitted'] || 0,
    reviewing: map['reviewing'] || 0,
    approved: map['approved'] || 0,
    rejected: map['rejected'] || 0,
    totalRequested: parseFloat(sumRow?.s ?? '0'),
  }
}

export async function getAllApplicationsForExport() {
  const rows = await query("SELECT * FROM applications WHERE status != 'draft' ORDER BY submitted_at DESC NULLS LAST")
  return rows.map(rowToApp)
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export async function getAdminByEmail(email: string) {
  return await queryOne('SELECT * FROM admin_users WHERE email=$1', [email.toLowerCase()])
}

export async function updateAdminLastLogin(id: string) {
  await query('UPDATE admin_users SET last_login_at=NOW() WHERE id=$1', [id])
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToApp(r: any) {
  return {
    id: r.id, token: r.token, status: r.status,
    email: r.email, firstName: r.first_name, lastName: r.last_name, phone: r.phone,
    orgName: r.org_name, orgType: r.org_type, website: r.website, ein: r.ein,
    grantCategory: r.grant_category, projectTitle: r.project_title,
    description: r.description, goals: r.goals,
    amountRequested: r.amount_requested ? parseFloat(r.amount_requested) : null,
    budgetBreakdown: (() => { try { return JSON.parse(r.budget_breakdown) } catch { return [] } })(),
    otherFunding: r.other_funding,
    latitude: r.latitude ? parseFloat(r.latitude) : null,
    longitude: r.longitude ? parseFloat(r.longitude) : null,
    adminNotes: r.admin_notes,
    createdAt: r.created_at, updatedAt: r.updated_at, submittedAt: r.submitted_at,
  }
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

export async function migrateSettings() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    INSERT INTO settings (key, value) VALUES ('currency_symbol', '₦')
      ON CONFLICT (key) DO NOTHING;
    INSERT INTO settings (key, value) VALUES ('currency_code', 'NGN')
      ON CONFLICT (key) DO NOTHING;
    INSERT INTO settings (key, value) VALUES ('currency_name', 'Nigerian Naira')
      ON CONFLICT (key) DO NOTHING;
  `)
}

export async function getSetting(key: string): Promise<string | null> {
  const r = await queryOne('SELECT value FROM settings WHERE key=$1', [key])
  return r?.value ?? null
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await query('SELECT key, value FROM settings')
  return Object.fromEntries(rows.map((r: any) => [r.key, r.value]))
}

export async function setSetting(key: string, value: string) {
  await query(
    'INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',
    [key, value]
  )
}
