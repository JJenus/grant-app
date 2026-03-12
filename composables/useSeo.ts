// Central SEO composable — call on every page instead of useHead directly.
// Generates title, description, canonical, Open Graph, and Twitter Card tags.
// All URL-based meta pulls APP_URL from public runtimeConfig so changing the
// domain in .env is the only thing needed.

interface SeoOptions {
  title: string           // Page-specific title (siteName is appended automatically)
  description?: string    // Falls back to site default if omitted
  path?: string           // e.g. '/about' — used to build canonical + og:url
  image?: string          // Absolute URL or path relative to APP_URL
  type?: 'website' | 'article'
  noIndex?: boolean       // true for admin pages
}

export function useSeo(opts: SeoOptions) {
  const config = useRuntimeConfig()
  const { appUrl, siteName, siteDescription } = config.public

  const base = appUrl.replace(/\/$/, '')
  const fullTitle = opts.title.includes(siteName)
    ? opts.title
    : `${opts.title} — ${siteName}`
  const description = opts.description || siteDescription
  const canonical = opts.path ? `${base}${opts.path}` : base
  const image = opts.image
    ? (opts.image.startsWith('http') ? opts.image : `${base}${opts.image}`)
    : `${base}/og-default.svg`
  const type = opts.type || 'website'

  useHead({
    title: fullTitle,
    meta: [
      // Core
      { name: 'description', content: description },
      ...(opts.noIndex ? [{ name: 'robots', content: 'noindex, nofollow' }] : [
        { name: 'robots', content: 'index, follow' },
      ]),

      // Open Graph
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteName },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:locale', content: 'en_US' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    link: [
      { rel: 'canonical', href: canonical },
    ],
  })
}
