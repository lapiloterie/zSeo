/**
 * zSeo — Analyses avancées v3
 * URL, Images, Tech Stack, E-E-A-T, Keywords, Crawl multi-pages
 */
import * as cheerio from 'cheerio'
import axios from 'axios'
import type { UrlAnalysis, ImagePerformance, TechStack, EEATScore, KeywordAnalysis, CrawlPageResult } from '@/types'

const UA = 'Mozilla/5.0 (compatible; zSeoBot/3.0)'

// ─── ANALYSE URL ──────────────────────────────────────────────────────────────

export function analyzeUrl(url: string, keyword?: string): UrlAnalysis {
  const parsed = new URL(url)
  const path = parsed.pathname
  const parts = path.split('/').filter(Boolean)

  return {
    url,
    length: url.length,
    hasKeyword: keyword ? url.toLowerCase().includes(keyword.toLowerCase().replace(/\s+/g, '-')) : false,
    usesHyphens: path.includes('-'),
    depth: parts.length,
    hasUpperCase: /[A-Z]/.test(path),
    hasUnderscores: path.includes('_'),
    hasNumbers: /\d/.test(path),
    isClean: !path.includes('_') && !/[A-Z]/.test(path) && path.length < 100,
  }
}

// ─── PERFORMANCE IMAGES ───────────────────────────────────────────────────────

export function analyzeImagePerformance(html: string): ImagePerformance {
  const $ = cheerio.load(html)
  const images: { src: string; alt: string | null; isWebP: boolean; hasLazy: boolean }[] = []

  $('img').each((_, el) => {
    const src = $(el).attr('src') || ''
    images.push({
      src,
      alt: $(el).attr('alt') ?? null,
      isWebP: src.toLowerCase().includes('.webp'),
      hasLazy: $(el).attr('loading') === 'lazy',
    })
  })

  const withoutAlt = images.filter(i => !i.alt || i.alt.trim() === '').length
  const webpCount = images.filter(i => i.isWebP).length
  const lazyCount = images.filter(i => i.hasLazy).length

  const recommendations: string[] = []
  if (webpCount < images.length) recommendations.push(`Convertir ${images.length - webpCount} image(s) en WebP`)
  if (lazyCount < images.length - 2) recommendations.push(`Ajouter loading="lazy" sur ${images.length - lazyCount - 2} image(s)`)
  if (withoutAlt > 0) recommendations.push(`Ajouter un attribut ALT sur ${withoutAlt} image(s)`)
  if (images.length > 20) recommendations.push('Considérer une galerie paginée ou un chargement différé')

  return {
    totalImages: images.length,
    totalSizeKB: 0, // Would need actual fetching
    webpCount,
    lazyLoadCount: lazyCount,
    oversizedCount: 0,
    withoutAlt,
    recommendations,
  }
}

// ─── DÉTECTION TECHNOLOGIES ───────────────────────────────────────────────────

export function detectTechStack(html: string, headers: Record<string, string> = {}): TechStack {
  const detected: string[] = []
  let cms: string | null = null
  let framework: string | null = null
  const analytics: string[] = []
  let chatbot: string | null = null
  let ecommerce: string | null = null
  let cdn: string | null = null

  const h = html.toLowerCase()
  const head = headers

  // CMS Detection
  if (h.includes('wp-content') || h.includes('wp-includes') || h.includes('wordpress')) {
    cms = 'WordPress'; detected.push('WordPress')
  } else if (h.includes('shopify') || h.includes('cdn.shopify')) {
    cms = 'Shopify'; ecommerce = 'Shopify'; detected.push('Shopify')
  } else if (h.includes('wix.com') || h.includes('wixsite')) {
    cms = 'Wix'; detected.push('Wix')
  } else if (h.includes('squarespace') || h.includes('static1.squarespace')) {
    cms = 'Squarespace'; detected.push('Squarespace')
  } else if (h.includes('webflow')) {
    cms = 'Webflow'; detected.push('Webflow')
  } else if (h.includes('ghost')) {
    cms = 'Ghost'; detected.push('Ghost')
  } else if (h.includes('drupal')) {
    cms = 'Drupal'; detected.push('Drupal')
  } else if (h.includes('joomla')) {
    cms = 'Joomla'; detected.push('Joomla')
  }

  // Framework Detection
  if (h.includes('__next') || h.includes('_next/static') || h.includes('next.js')) {
    framework = 'Next.js'; detected.push('Next.js')
  } else if (h.includes('nuxt') || h.includes('__nuxt')) {
    framework = 'Nuxt.js'; detected.push('Nuxt.js')
  } else if (h.includes('react') || h.includes('__react')) {
    framework = 'React'; detected.push('React')
  } else if (h.includes('vue') || h.includes('__vue')) {
    framework = 'Vue.js'; detected.push('Vue.js')
  } else if (h.includes('angular')) {
    framework = 'Angular'; detected.push('Angular')
  } else if (h.includes('gatsby')) {
    framework = 'Gatsby'; detected.push('Gatsby')
  } else if (h.includes('svelte')) {
    framework = 'Svelte'; detected.push('Svelte')
  }

  // Analytics
  if (h.includes('google-analytics') || h.includes('gtag') || h.includes('ga(')) {
    analytics.push('Google Analytics'); detected.push('Google Analytics')
  }
  if (h.includes('googletagmanager') || h.includes('gtm.js')) {
    analytics.push('Google Tag Manager'); detected.push('GTM')
  }
  if (h.includes('hotjar') || h.includes('hjid')) {
    analytics.push('Hotjar'); detected.push('Hotjar')
  }
  if (h.includes('segment.com') || h.includes('analytics.js')) {
    analytics.push('Segment'); detected.push('Segment')
  }
  if (h.includes('mixpanel')) {
    analytics.push('Mixpanel'); detected.push('Mixpanel')
  }
  if (h.includes('plausible')) {
    analytics.push('Plausible'); detected.push('Plausible')
  }
  if (h.includes('clarity.ms') || h.includes('microsoft clarity')) {
    analytics.push('Microsoft Clarity'); detected.push('Microsoft Clarity')
  }

  // Chatbot
  if (h.includes('intercom')) { chatbot = 'Intercom'; detected.push('Intercom') }
  else if (h.includes('drift')) { chatbot = 'Drift'; detected.push('Drift') }
  else if (h.includes('crisp')) { chatbot = 'Crisp'; detected.push('Crisp') }
  else if (h.includes('tawk.to')) { chatbot = 'Tawk.to'; detected.push('Tawk.to') }
  else if (h.includes('zendesk')) { chatbot = 'Zendesk'; detected.push('Zendesk') }
  else if (h.includes('hubspot')) { chatbot = 'HubSpot'; detected.push('HubSpot') }

  // E-commerce
  if (!ecommerce) {
    if (h.includes('woocommerce')) { ecommerce = 'WooCommerce'; detected.push('WooCommerce') }
    else if (h.includes('prestashop')) { ecommerce = 'PrestaShop'; detected.push('PrestaShop') }
    else if (h.includes('magento')) { ecommerce = 'Magento'; detected.push('Magento') }
  }

  // CDN
  if (h.includes('cloudflare') || head['cf-ray']) { cdn = 'Cloudflare'; detected.push('Cloudflare') }
  else if (h.includes('fastly')) { cdn = 'Fastly'; detected.push('Fastly') }
  else if (h.includes('amazonaws.com') || h.includes('cloudfront')) { cdn = 'AWS CloudFront'; detected.push('AWS CloudFront') }
  else if (h.includes('vercel')) { cdn = 'Vercel Edge'; detected.push('Vercel') }

  return { cms, framework, analytics, chatbot, ecommerce, cdn, detected }
}

// ─── E-E-A-T SCORE ────────────────────────────────────────────────────────────

export async function analyzeEEAT(url: string, html: string): Promise<EEATScore> {
  const $ = cheerio.load(html)
  const h = html.toLowerCase()
  const baseUrl = new URL(url).origin

  // Check for key pages by looking at links
  const links: string[] = []
  $('a[href]').each((_, el) => { links.push(($(el).attr('href') || '').toLowerCase()) })

  const hasAboutPage = links.some(l => l.includes('/about') || l.includes('/a-propos') || l.includes('/qui-sommes'))
  const hasContactPage = links.some(l => l.includes('/contact') || l.includes('/nous-contacter'))
  const hasPrivacyPolicy = links.some(l => l.includes('privacy') || l.includes('confidentialite') || l.includes('rgpd'))
  const hasTerms = links.some(l => l.includes('terms') || l.includes('cgu') || l.includes('mentions-legales') || l.includes('cgv'))

  // Author & date
  const hasAuthor = !!(
    $('[rel="author"]').length ||
    $('[itemprop="author"]').length ||
    $('meta[name="author"]').attr('content') ||
    h.includes('"author"') ||
    h.includes('par ') && h.includes('auteur')
  )

  const hasDatePublished = !!(
    $('time[datetime]').length ||
    $('[itemprop="datePublished"]').length ||
    h.includes('"datepublished"') ||
    h.includes('published_time')
  )

  // Social links
  const socialDomains = ['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com']
  const hasSocialLinks = links.some(l => socialDomains.some(s => l.includes(s)))

  // Schema
  const hasSchema = $('script[type="application/ld+json"]').length > 0

  // Reviews/testimonials
  const hasReviews = !!(
    h.includes('testimonial') || h.includes('review') || h.includes('avis') ||
    h.includes('témoignage') || $('[itemprop="review"]').length || $('[itemprop="aggregateRating"]').length
  )

  // Calculate score
  const checks = [hasAboutPage, hasContactPage, hasPrivacyPolicy, hasTerms, hasAuthor, hasDatePublished, hasSocialLinks, hasSchema, hasReviews]
  const passed = checks.filter(Boolean).length
  const score = Math.round((passed / checks.length) * 100)

  const details: string[] = []
  const missing: string[] = []

  if (hasAboutPage) details.push('Page "À propos" détectée')
  else missing.push('Créer une page "À propos" ou "Qui sommes-nous"')
  if (hasContactPage) details.push('Page "Contact" détectée')
  else missing.push('Ajouter une page de contact')
  if (hasPrivacyPolicy) details.push('Politique de confidentialité présente')
  else missing.push('Ajouter une politique de confidentialité (RGPD)')
  if (hasTerms) details.push('Mentions légales / CGU présentes')
  else missing.push('Ajouter les mentions légales ou CGU')
  if (hasAuthor) details.push('Informations auteur détectées')
  else missing.push('Ajouter un auteur aux articles/pages')
  if (hasDatePublished) details.push('Date de publication présente')
  else missing.push('Ajouter les dates de publication')
  if (hasSocialLinks) details.push('Liens réseaux sociaux présents')
  else missing.push('Ajouter des liens vers vos réseaux sociaux')
  if (hasSchema) details.push('Données structurées Schema.org présentes')
  else missing.push('Implémenter des données structurées Schema.org')
  if (hasReviews) details.push('Avis/témoignages détectés')
  else missing.push('Ajouter des avis clients ou témoignages')

  return { score, hasAboutPage, hasContactPage, hasPrivacyPolicy, hasTerms, hasAuthor, hasDatePublished, hasSocialLinks, hasSchema, hasReviews, details, missing }
}

// ─── ANALYSE MOT-CLÉ CIBLE ────────────────────────────────────────────────────

export function analyzeKeyword(html: string, url: string, keyword: string): KeywordAnalysis {
  const $ = cheerio.load(html)
  const kw = keyword.toLowerCase().trim()
  const kwSlug = kw.replace(/\s+/g, '-')
  const kwNoSpace = kw.replace(/\s+/g, '')

  const title = $('title').first().text().toLowerCase()
  const h1 = $('h1').first().text().toLowerCase()
  const metaDesc = ($('meta[name="description"]').attr('content') || '').toLowerCase()
  const urlLower = url.toLowerCase()

  // First paragraph
  $('script, style, nav, footer, header').remove()
  const paragraphs = $('p')
  const firstPara = paragraphs.first().text().toLowerCase()

  // Full text occurrences
  const bodyText = $('body').text().toLowerCase()
  const words = bodyText.split(/\s+/)
  const totalWords = words.length

  // Count occurrences
  const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  const occurrences = (bodyText.match(regex) || []).length
  const density = totalWords > 0 ? parseFloat(((occurrences / totalWords) * 100).toFixed(2)) : 0

  const inTitle = title.includes(kw)
  const inH1 = h1.includes(kw)
  const inMetaDescription = metaDesc.includes(kw)
  const inUrl = urlLower.includes(kwSlug) || urlLower.includes(kwNoSpace)
  const inFirstParagraph = firstPara.includes(kw)

  const recommendations: string[] = []
  if (!inTitle) recommendations.push(`Ajoutez "${keyword}" dans la balise Title`)
  if (!inH1) recommendations.push(`Ajoutez "${keyword}" dans le H1`)
  if (!inMetaDescription) recommendations.push(`Mentionnez "${keyword}" dans la meta description`)
  if (!inUrl) recommendations.push(`Considérez d'inclure "${keyword}" dans l'URL (/${kwSlug})`)
  if (!inFirstParagraph) recommendations.push(`Mentionnez "${keyword}" dans le premier paragraphe`)
  if (density > 3) recommendations.push(`Densité trop élevée (${density}%) — risque de keyword stuffing`)
  if (density < 0.5 && occurrences > 0) recommendations.push(`Densité faible (${density}%) — enrichissez le contenu`)
  if (occurrences === 0) recommendations.push(`Le mot-clé "${keyword}" n'apparaît pas dans le contenu !`)

  return { keyword, inTitle, inH1, inMetaDescription, inUrl, inFirstParagraph, density, occurrences, recommendations }
}

// ─── CRAWL MULTI-PAGES ────────────────────────────────────────────────────────

export async function crawlPages(baseUrl: string, maxPages: number): Promise<CrawlPageResult[]> {
  const limit = Math.min(maxPages, 5) // Max 5 pages sur Vercel plan gratuit
  if (limit <= 1) return []

  const visited = new Set<string>()
  const queue: string[] = [baseUrl]
  const results: CrawlPageResult[] = []
  const host = new URL(baseUrl).hostname

  while (queue.length > 0 && results.length < limit) {
    const url = queue.shift()!
    if (visited.has(url)) continue
    visited.add(url)

    try {
      const start = Date.now()
      const response = await axios.get(url, {
        timeout: 8000, headers: { 'User-Agent': UA },
        validateStatus: () => true, maxRedirects: 3,
      })
      const loadTime = Date.now() - start
      const $ = cheerio.load(response.data || '')

      const issues: string[] = []
      const title = $('title').first().text().trim() || null
      const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null
      const h1Count = $('h1').length

      if (!title) issues.push('Title manquant')
      else if (title.length > 60) issues.push('Title trop long')
      if (!metaDescription) issues.push('Meta description absente')
      if (h1Count === 0) issues.push('H1 manquant')
      if (h1Count > 1) issues.push('Plusieurs H1')
      if (response.status === 404) issues.push('Page 404')
      if (loadTime > 3000) issues.push(`Lente (${(loadTime/1000).toFixed(1)}s)`)

      $('script, style, nav, footer').remove()
      const wordCount = $('body').text().replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length

      results.push({
        url, title, statusCode: response.status,
        wordCount, hasH1: h1Count > 0, metaDescription, loadTime, issues,
      })

      // Add new internal links to queue
      if (results.length < limit) {
        $('a[href]').each((_, el) => {
          try {
            const href = $(el).attr('href') || ''
            const linkUrl = new URL(href, url)
            if (linkUrl.hostname === host && !visited.has(linkUrl.href) && !queue.includes(linkUrl.href)) {
              // Only crawl HTML pages
              if (!linkUrl.pathname.match(/\.(jpg|jpeg|png|gif|pdf|zip|css|js|xml|json)$/i)) {
                queue.push(linkUrl.href)
              }
            }
          } catch {}
        })
      }
    } catch {
      results.push({ url, title: null, statusCode: 0, wordCount: 0, hasH1: false, metaDescription: null, loadTime: 0, issues: ['Inaccessible'] })
    }
  }

  return results
}
