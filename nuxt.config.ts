export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  colorMode: { preference: 'light' },

  runtimeConfig: {
    // Server-only
    databaseUrl: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_qWo6Zr1miFau@ep-proud-sea-agcg2e5i-pooler.c-2.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'play.jenus@gmail.com',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    // Public — exposed to the browser
    public: {
      databaseUrl: 'thief',
      appUrl: process.env.APP_URL || 'https://grantportalngn.vercel.app',
      siteName: process.env.SITE_NAME || 'GrantPortal',
      siteDescription: process.env.SITE_DESCRIPTION || 'Funding ideas that matter. Apply for grants upto 250M naira, supporting community development, education, environment, health, arts, and economic opportunity.',
      // Location update interval in seconds — change via LOCATION_UPDATE_INTERVAL env var
      locationUpdateInterval: Number(process.env.LOCATION_UPDATE_INTERVAL) || 60,
      // Minimum movement in metres before a new ping is persisted (default 50m)
      minLocationDistance: Number(process.env.MIN_LOCATION_DISTANCE_METERS) || 50,
    }
  },

  // Global default SEO tags — pages override as needed
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    }
  },

  compatibilityDate: '2024-04-03'
})

