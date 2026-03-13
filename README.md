# GrantPortal — Nuxt 3 Grant Application Platform

Stack: Nuxt 3 · better-sqlite3 · JWT auth · Tailwind/NuxtUI

## Quick Start

```bash
cp .env.example .env        # optional: add SMTP for emails
npm install
npm run db:seed             # creates admin@example.com / admin123
npm run dev
```

- Public site:  http://localhost:3000
- Admin panel:  http://localhost:3000/admin/login
- Credentials:  admin@example.com / admin123

## No setup required
The SQLite database is created automatically at `data/grant.db` on first run.
No migration commands needed.

## Email
SMTP is optional. If not configured, resume links are logged to console instead.
Use https://mailtrap.io (free) for development.

## Production
```bash
npm run build
node .output/server/index.mjs
```

