/**
 * zSeo — Moteur d'analyse SEO v2
 * Analyse technique + on-page avancée
 */
import * as cheerio from 'cheerio'
import axios from 'axios'
import type {
  TechnicalAudit, OnPageAudit, Recommendation, ChecklistItem,
  KeywordData, ImageInfo, AnchorInfo, SchemaType, GSCOpportunity
} from '@/types'

const UA = 'Mozilla/5.0 (compatible; zSeoBot/2.0)'

// ─── ON-PAGE AVANCÉE ──────────────────────────────────────────────────────────

export async function analyzeOnPage(url: string): Promise<OnPageAudit> {
  const response = await axios.get(url, {
    timeout: 15000, headers: { 'User-Agent': UA }, maxRedirects: 5,
  })
  const html = response.data as string
  const $ = cheerio.load(html)

  // Basic
  const title = $('title').first().text().trim() || null
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null
  const h1: string[] = [], h2: string[] = [], h3: string[] = []
  $('h1').each((_, el) => h1.push($(el).text().trim()))
  $('h2').each((_, el) => h2.push($(el).text().trim()))
  $('h3').each((_, el) => h3.push($(el).text().trim()))
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || null

  // OG Tags
  const ogTags: { property: string; content: string }[] = []
  $('meta[property^="og:"], meta[name^="og:"]').each((_, el) => {
    ogTags.push({ property: $(el).attr('property') || $(el).attr('name') || '', content: $(el).attr('content') || '' })
  })

  // OG completeness
  const ogRequired = ['og:title', 'og:description', 'og:image', 'og:url']
  const ogPresent = ogTags.map(t => t.property)
  const ogMissing = ogRequired.filter(r => !ogPresent.includes(r))
  const ogComplete = ogMissing.length === 0

  // Schema.org
  const schemaTypes: SchemaType[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}')
      const items = Array.isArray(data) ? data : [data]
      items.forEach(item => {
        if (item['@type']) {
          schemaTypes.push({ type: item['@type'], valid: true, properties: Object.keys(item) })
        }
      })
    } catch {}
  })

  // Images avancées
  const images: ImageInfo[] = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || ''
    const alt = $(el).attr('alt') ?? null
    const loading = $(el).attr('loading')
    images.push({
      src,
      alt,
      isWebP: src.toLowerCase().endsWith('.webp'),
      hasLazyLoad: loading === 'lazy',
    })
  })
  const imagesWithoutAlt = images.filter(i => !i.alt || i.alt.trim() === '').length

  // Liens + ancres
  const urlHost = new URL(url).hostname
  const anchors: AnchorInfo[] = []
  let internalLinks = 0, externalLinks = 0
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    try {
      const linkUrl = new URL(href, url)
      const isInternal = linkUrl.hostname === urlHost
      if (isInternal) internalLinks++; else externalLinks++
      anchors.push({ text, href, isInternal })
    } catch {
      if (href.startsWith('/')) { internalLinks++; anchors.push({ text, href, isInternal: true }) }
    }
  })

  // Word count + readability
  $('script, style, nav, footer, header, aside').remove()
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const words = bodyText.split(' ').filter(w => w.length > 2)
  const wordCount = words.length

  // Keyword density (top 10 mots significatifs)
  const stopWords = new Set(['les','des','une','est','que','qui','dans','pour','sur','avec','par','mais','ou','et','donc','or','ni','car','ce','cet','cette','ces','mon','ton','son','notre','votre','leur','je','tu','il','elle','nous','vous','ils','elles','me','te','se','lui','leur','y','en','très','plus','bien','tout','même','aussi','comme','mais','si','car'])
  const wordFreq: Record<string, number> = {}
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-záàâéèêëîïôùûüç]/g, '')
    if (clean.length > 3 && !stopWords.has(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1
    }
  })
  const keywordDensity = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count, density: parseFloat(((count / wordCount) * 100).toFixed(2)) }))

  // Readability (Flesch-Kincaid simplifié)
  const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 20
  const avgSyllables = 1.5 // approximation
  const fleschScore = Math.max(0, Math.min(100,
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllables)
  ))
  const readabilityLevel =
    fleschScore >= 70 ? 'Facile' :
    fleschScore >= 50 ? 'Standard' :
    fleschScore >= 30 ? 'Difficile' : 'Très difficile'

  const htmlSize = Buffer.byteLength(html, 'utf8')
  const textSize = Buffer.byteLength(bodyText, 'utf8')
  const structuredData = schemaTypes.length > 0

  return {
    title, titleLength: title?.length ?? 0,
    metaDescription, metaDescriptionLength: metaDescription?.length ?? 0,
    h1, h2, h3, wordCount,
    imagesWithoutAlt, totalImages: images.length,
    internalLinks, externalLinks,
    canonicalUrl, ogTags, structuredData, htmlSize,
    keywordDensity, readabilityScore: Math.round(fleschScore),
    readabilityLevel, isThinContent: wordCount < 300,
    anchors, schemaTypes, images, ogComplete, ogMissing,
  }
}

// ─── TECHNIQUE AVANCÉE ────────────────────────────────────────────────────────

export async function analyzeTechnical(url: string): Promise<TechnicalAudit> {
  const parsedUrl = new URL(url)
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`
  const isHttps = parsedUrl.protocol === 'https:'

  // Sitemap
  let hasSitemap = false, sitemapUrl: string | null = null
  for (const p of ['/sitemap.xml', '/sitemap_index.xml', '/sitemap/sitemap.xml']) {
    try {
      const r = await axios.head(`${baseUrl}${p}`, { timeout: 5000 })
      if (r.status === 200) { hasSitemap = true; sitemapUrl = `${baseUrl}${p}`; break }
    } catch {}
  }

  // Robots.txt
  let hasRobotsTxt = false, robotsTxtUrl: string | null = null
  try {
    const r = await axios.get(`${baseUrl}/robots.txt`, { timeout: 5000 })
    if (r.status === 200) { hasRobotsTxt = true; robotsTxtUrl = `${baseUrl}/robots.txt` }
  } catch {}

  // PageSpeed
  const pagespeedData = await fetchPageSpeed(url)

  // Fetch main page for advanced analysis
  let redirects: { from: string; to: string; statusCode: number }[] = []
  let brokenLinks: { url: string; statusCode: number; foundOn: string }[] = []
  let hreflangTags: { lang: string; url: string }[] = []
  let hasPagination = false
  let paginationUrls: string[] = []
  let canonicalUrl: string | null = null
  let textToHtmlRatio = 0
  let crawlDepth = 1

  try {
    const response = await axios.get(url, {
      timeout: 15000, headers: { 'User-Agent': UA }, maxRedirects: 0,
      validateStatus: s => s < 400,
    })

    // Check redirect
    if ([301, 302, 307, 308].includes(response.status)) {
      redirects.push({ from: url, to: response.headers.location || '', statusCode: response.status })
    }

    const $ = cheerio.load(response.data)
    const urlHost = new URL(url).hostname

    // Canonical
    canonicalUrl = $('link[rel="canonical"]').attr('href') || null

    // Hreflang
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      hreflangTags.push({ lang: $(el).attr('hreflang') || '', url: $(el).attr('href') || '' })
    })

    // Pagination
    const prevLink = $('link[rel="prev"]').attr('href')
    const nextLink = $('link[rel="next"]').attr('href')
    if (prevLink || nextLink) {
      hasPagination = true
      if (prevLink) paginationUrls.push(prevLink)
      if (nextLink) paginationUrls.push(nextLink)
    }

    // Text/HTML ratio
    $('script, style').remove()
    const textContent = $('body').text().replace(/\s+/g, ' ').trim()
    const htmlSize = Buffer.byteLength(response.data, 'utf8')
    const textSize = Buffer.byteLength(textContent, 'utf8')
    textToHtmlRatio = parseFloat(((textSize / htmlSize) * 100).toFixed(1))

    // Check internal links for broken (sample 5)
    const internalHrefs: string[] = []
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || ''
      try {
        const linkUrl = new URL(href, url)
        if (linkUrl.hostname === urlHost && internalHrefs.length < 5) {
          internalHrefs.push(linkUrl.href)
        }
      } catch {}
    })

    // Check a few links in parallel
    const linkChecks = await Promise.allSettled(
      internalHrefs.slice(0, 5).map(async (href) => {
        try {
          const r = await axios.head(href, { timeout: 5000, maxRedirects: 3, validateStatus: () => true })
          return { url: href, statusCode: r.status, foundOn: url }
        } catch {
          return { url: href, statusCode: 0, foundOn: url }
        }
      })
    )
    brokenLinks = linkChecks
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value)
      .filter(r => r.statusCode === 404 || r.statusCode === 0)

  } catch {}

  return {
    loadTime: pagespeedData.loadTime,
    performanceScore: pagespeedData.performanceScore,
    mobileScore: pagespeedData.mobileScore,
    isHttps, hasSitemap, hasRobotsTxt, sitemapUrl, robotsTxtUrl,
    coreWebVitals: pagespeedData.coreWebVitals,
    redirects, brokenLinks, hreflangTags,
    hasPagination, paginationUrls,
    canonicalUrl, textToHtmlRatio, crawlDepth,
  }
}

// ─── PAGESPEED ────────────────────────────────────────────────────────────────

async function fetchPageSpeed(url: string) {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
  const base = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
  const def = { loadTime: 0, performanceScore: 50, mobileScore: 50,
    coreWebVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 } }
  if (!apiKey) return def
  try {
    const [dr, mr] = await Promise.all([
      axios.get(`${base}?url=${encodeURIComponent(url)}&strategy=desktop&key=${apiKey}`, { timeout: 30000 }),
      axios.get(`${base}?url=${encodeURIComponent(url)}&strategy=mobile&key=${apiKey}`, { timeout: 30000 }),
    ])
    const a = dr.data?.lighthouseResult?.audits || {}
    const c = dr.data?.lighthouseResult?.categories || {}
    return {
      loadTime: Math.round(a['speed-index']?.numericValue || 0),
      performanceScore: Math.round((c?.performance?.score || 0.5) * 100),
      mobileScore: Math.round((mr.data?.lighthouseResult?.categories?.performance?.score || 0.5) * 100),
      coreWebVitals: {
        lcp: Math.round(a['largest-contentful-paint']?.numericValue || 0),
        fid: Math.round(a['max-potential-fid']?.numericValue || 0),
        cls: parseFloat((a['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
        fcp: Math.round(a['first-contentful-paint']?.numericValue || 0),
        ttfb: Math.round(a['server-response-time']?.numericValue || 0),
      },
    }
  } catch { return def }
}

// ─── SCORE ────────────────────────────────────────────────────────────────────

export function calculateScores(technical: TechnicalAudit, onPage: OnPageAudit, gscAvailable: boolean) {
  let tech = 100
  if (!technical.isHttps) tech -= 20
  if (!technical.hasSitemap) tech -= 10
  if (!technical.hasRobotsTxt) tech -= 5
  if (technical.loadTime > 3000) tech -= 15
  if (technical.loadTime > 5000) tech -= 10
  if (technical.brokenLinks.length > 0) tech -= Math.min(technical.brokenLinks.length * 5, 20)
  if (technical.redirects.length > 3) tech -= 5
  if (technical.textToHtmlRatio < 10) tech -= 5
  tech = Math.max(0, tech)

  let page = 100
  if (!onPage.title) page -= 20
  else if (onPage.titleLength < 30 || onPage.titleLength > 60) page -= 10
  if (!onPage.metaDescription) page -= 15
  else if (onPage.metaDescriptionLength < 120 || onPage.metaDescriptionLength > 160) page -= 5
  if (onPage.h1.length === 0) page -= 15
  if (onPage.h1.length > 1) page -= 5
  if (onPage.wordCount < 300) page -= 10
  if (onPage.imagesWithoutAlt > 0) page -= Math.min(onPage.imagesWithoutAlt * 3, 15)
  if (!onPage.structuredData) page -= 5
  if (!onPage.ogComplete) page -= 5
  if (onPage.readabilityScore < 30) page -= 5
  page = Math.max(0, page)

  const perf = Math.round((technical.performanceScore + technical.mobileScore) / 2)
  const gsc = gscAvailable ? 75 : 50
  const total = Math.min(100, Math.round(tech * 0.3 + page * 0.3 + perf * 0.3 + gsc * 0.1))

  return { technical: tech, onPage: page, performance: perf, gsc, total }
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

export function generateChecklist(technical: TechnicalAudit, onPage: OnPageAudit) {
  return [
    { id: 'https', label: 'Site sécurisé HTTPS', passed: technical.isHttps, category: 'Technique', priority: 'high' },
    { id: 'sitemap', label: 'Sitemap.xml présent', passed: technical.hasSitemap, category: 'Technique', priority: 'medium' },
    { id: 'robots', label: 'Robots.txt configuré', passed: technical.hasRobotsTxt, category: 'Technique', priority: 'medium' },
    { id: 'no-broken', label: 'Aucun lien brisé (404)', passed: technical.brokenLinks.length === 0, category: 'Technique', priority: 'high' },
    { id: 'canonical', label: 'URL canonique définie', passed: !!technical.canonicalUrl || !!onPage.canonicalUrl, category: 'Technique', priority: 'medium' },
    { id: 'txt-ratio', label: 'Ratio texte/HTML > 10%', passed: technical.textToHtmlRatio > 10, category: 'Technique', priority: 'low' },
    { id: 'title', label: 'Balise Title présente', passed: !!onPage.title, category: 'On-Page', priority: 'high' },
    { id: 'title-len', label: 'Title entre 50-60 caractères', passed: onPage.titleLength >= 50 && onPage.titleLength <= 60, category: 'On-Page', priority: 'medium' },
    { id: 'meta-desc', label: 'Meta description présente', passed: !!onPage.metaDescription, category: 'On-Page', priority: 'high' },
    { id: 'meta-len', label: 'Meta description 120-160 car.', passed: onPage.metaDescriptionLength >= 120 && onPage.metaDescriptionLength <= 160, category: 'On-Page', priority: 'medium' },
    { id: 'h1', label: 'Exactement 1 balise H1', passed: onPage.h1.length === 1, category: 'On-Page', priority: 'high' },
    { id: 'h2', label: 'Balises H2 présentes', passed: onPage.h2.length > 0, category: 'On-Page', priority: 'medium' },
    { id: 'word-count', label: 'Contenu > 300 mots', passed: onPage.wordCount >= 300, category: 'Contenu', priority: 'medium' },
    { id: 'thin', label: 'Pas de contenu mince', passed: !onPage.isThinContent, category: 'Contenu', priority: 'medium' },
    { id: 'alt-tags', label: 'Toutes les images ont un ALT', passed: onPage.imagesWithoutAlt === 0, category: 'On-Page', priority: 'medium' },
    { id: 'schema', label: 'Données structurées (JSON-LD)', passed: onPage.structuredData, category: 'Avancé', priority: 'medium' },
    { id: 'og-title', label: 'og:title défini', passed: onPage.ogTags.some(t => t.property === 'og:title'), category: 'Social', priority: 'low' },
    { id: 'og-desc', label: 'og:description défini', passed: onPage.ogTags.some(t => t.property === 'og:description'), category: 'Social', priority: 'low' },
    { id: 'og-image', label: 'og:image défini', passed: onPage.ogTags.some(t => t.property === 'og:image'), category: 'Social', priority: 'low' },
    { id: 'readability', label: 'Score de lisibilité acceptable', passed: onPage.readabilityScore >= 30, category: 'Contenu', priority: 'low' },
    { id: 'mobile', label: 'Score mobile > 70', passed: technical.mobileScore >= 70, category: 'Performance', priority: 'high' },
    { id: 'perf', label: 'Score performance > 70', passed: technical.performanceScore >= 70, category: 'Performance', priority: 'high' },
    { id: 'lcp', label: 'LCP < 2.5s', passed: technical.coreWebVitals.lcp > 0 && technical.coreWebVitals.lcp < 2500, category: 'Performance', priority: 'high' },
    { id: 'cls', label: 'CLS < 0.1', passed: technical.coreWebVitals.cls < 0.1, category: 'Performance', priority: 'medium' },
    { id: 'webp', label: 'Images en format WebP', passed: onPage.images.some(i => i.isWebP), category: 'Performance', priority: 'low' },
    { id: 'lazy', label: 'Lazy loading des images', passed: onPage.images.some(i => i.hasLazyLoad), category: 'Performance', priority: 'low' },
  ] as import('@/types').ChecklistItem[]
}

// ─── RECOMMANDATIONS ──────────────────────────────────────────────────────────

export function generateRecommendations(
  technical: TechnicalAudit,
  onPage: OnPageAudit,
  gscData: { topKeywords: KeywordData[]; opportunities?: GSCOpportunity[] } | null
) {
  const recs: any[] = []

  if (!technical.isHttps) recs.push({ id:'https', category:'technical', priority:'high',
    title:'Passer en HTTPS', problem:'Site non sécurisé HTTP. Google pénalise ces sites.',
    solution:'Installez un certificat SSL gratuit (Let\'s Encrypt). Redirigez HTTP → HTTPS.',
    impact:'Amélioration du classement + confiance utilisateur.' })

  if (!technical.hasSitemap) recs.push({ id:'sitemap', category:'technical', priority:'medium',
    title:'Créer un sitemap.xml', problem:'Aucun sitemap trouvé. Google indexe moins efficacement.',
    solution:'Créez /sitemap.xml et soumettez-le dans Search Console.',
    impact:'Meilleure indexation de vos pages.' })

  if (technical.brokenLinks.length > 0) recs.push({ id:'broken-links', category:'technical', priority:'high',
    title:`${technical.brokenLinks.length} lien(s) brisé(s) détecté(s)`,
    problem:`Liens 404 trouvés : ${technical.brokenLinks.slice(0,3).map(l=>l.url).join(', ')}`,
    solution:'Corrigez ou supprimez ces liens. Utilisez des redirections 301 si les pages ont bougé.',
    impact:'Expérience utilisateur + budget crawl préservé.' })

  if (technical.redirects.length > 3) recs.push({ id:'redirects', category:'technical', priority:'medium',
    title:'Trop de redirections', problem:`${technical.redirects.length} redirections détectées.`,
    solution:'Utilisez des liens directs. Évitez les chaînes de redirections.',
    impact:'Amélioration de la vitesse et du crawl budget.' })

  if (technical.textToHtmlRatio < 10) recs.push({ id:'text-ratio', category:'technical', priority:'low',
    title:`Ratio texte/HTML faible (${technical.textToHtmlRatio}%)`,
    problem:'Trop de code HTML par rapport au contenu texte.',
    solution:'Réduisez le code inline, externalisez CSS/JS, enrichissez le contenu textuel.',
    impact:'Meilleure compréhension du contenu par Google.' })

  if (technical.hreflangTags.length === 0 && !technical.hasPagination) {
    // no hreflang warning only if no other language indicators
  }

  if (!onPage.title) recs.push({ id:'title', category:'onpage', priority:'high',
    title:'Ajouter une balise Title', problem:'Aucune balise <title> trouvée.',
    solution:'Ajoutez un title unique de 50-60 caractères avec votre mot-clé principal.',
    impact:'Impact majeur sur le CTR dans Google.' })
  else if (onPage.titleLength < 30 || onPage.titleLength > 60) recs.push({ id:'title-len', category:'onpage', priority:'medium',
    title:`Optimiser la longueur du Title (${onPage.titleLength} car.)`,
    problem:`Titre ${onPage.titleLength < 30 ? 'trop court' : 'trop long'} (optimal : 50-60).`,
    solution:`${onPage.titleLength < 30 ? 'Enrichissez' : 'Raccourcissez'} votre title.`,
    impact:'Meilleure visibilité dans les SERPs.' })

  if (!onPage.metaDescription) recs.push({ id:'meta', category:'onpage', priority:'high',
    title:'Ajouter une meta description', problem:'Meta description absente.',
    solution:'Rédigez une description de 120-160 caractères avec appel à l\'action.',
    impact:'Augmente le CTR depuis Google.' })

  if (onPage.h1.length === 0) recs.push({ id:'h1', category:'onpage', priority:'high',
    title:'Ajouter une balise H1', problem:'Aucun H1 trouvé.',
    solution:'Ajoutez exactement un H1 par page avec votre mot-clé principal.',
    impact:'Signal fort pour Google sur le sujet de la page.' })

  if (onPage.h1.length > 1) recs.push({ id:'h1-multi', category:'onpage', priority:'medium',
    title:`${onPage.h1.length} balises H1 détectées`, problem:'Une seule H1 est recommandée par page.',
    solution:'Gardez un seul H1 et utilisez H2/H3 pour les sous-sections.',
    impact:'Structure plus claire pour Google.' })

  if (onPage.isThinContent) recs.push({ id:'thin', category:'content', priority:'medium',
    title:'Contenu mince détecté', problem:`Seulement ${onPage.wordCount} mots. Google préfère les pages riches.`,
    solution:'Enrichissez le contenu : répondez aux questions, ajoutez des exemples, FAQ.',
    impact:'Meilleur positionnement sur les mots-clés cibles.' })

  if (onPage.imagesWithoutAlt > 0) recs.push({ id:'alt', category:'onpage', priority:'medium',
    title:`${onPage.imagesWithoutAlt} image(s) sans attribut ALT`,
    problem:`${onPage.imagesWithoutAlt}/${onPage.totalImages} images n'ont pas de texte alternatif.`,
    solution:'Ajoutez un ALT descriptif et pertinent à chaque image.',
    impact:'Accessibilité + référencement Google Images.' })

  if (!onPage.structuredData) recs.push({ id:'schema', category:'advanced', priority:'medium',
    title:'Ajouter des données structurées', problem:'Aucun schéma JSON-LD détecté.',
    solution:'Ajoutez un schéma approprié (Article, Product, FAQPage, LocalBusiness...).',
    impact:'Rich snippets dans Google → meilleur CTR.' })

  if (!onPage.ogComplete) recs.push({ id:'og', category:'advanced', priority:'low',
    title:`Open Graph incomplet (manque : ${onPage.ogMissing.join(', ')})`,
    problem:'Balises OG manquantes. Partage social peu optimisé.',
    solution:`Ajoutez : ${onPage.ogMissing.join(', ')} dans le <head>.`,
    impact:'Meilleur affichage sur LinkedIn, Facebook, Twitter.' })

  if (onPage.readabilityScore < 30) recs.push({ id:'readability', category:'content', priority:'low',
    title:'Contenu difficile à lire', problem:`Score de lisibilité : ${onPage.readabilityScore}/100 (${onPage.readabilityLevel}).`,
    solution:'Réduisez la longueur des phrases, utilisez des listes, des sous-titres fréquents.',
    impact:'Meilleur engagement utilisateur = meilleur SEO.' })

  if (!onPage.images.some(i => i.isWebP)) recs.push({ id:'webp', category:'performance', priority:'low',
    title:'Convertir les images en WebP', problem:'Aucune image WebP détectée.',
    solution:'Convertissez vos images JPG/PNG en WebP (30-50% plus légers).',
    impact:'Vitesse de chargement améliorée.' })

  if (!onPage.images.some(i => i.hasLazyLoad) && onPage.totalImages > 2) recs.push({ id:'lazy', category:'performance', priority:'low',
    title:'Activer le lazy loading des images', problem:'Aucune image avec loading="lazy" détectée.',
    solution:'Ajoutez loading="lazy" sur toutes les images en dehors du viewport.',
    impact:'Chargement initial plus rapide.' })

  if (technical.loadTime > 3000) recs.push({ id:'speed', category:'performance', priority:'high',
    title:`Vitesse de chargement lente (${(technical.loadTime/1000).toFixed(1)}s)`,
    problem:'Temps de chargement > 3s. Google privilégie les sites rapides.',
    solution:'Compressez images, activez cache, utilisez CDN, minifiez CSS/JS.',
    impact:'Impact direct sur classement et taux de rebond.' })

  // GSC opportunities
  if (gscData?.opportunities) {
    gscData.opportunities.forEach(opp => {
      if (opp.type === 'low_ctr') recs.push({ id:`gsc-ctr-${opp.query}`, category:'gsc', priority:'high',
        title:`"${opp.query}" — CTR faible (${(opp.ctr*100).toFixed(1)}%)`,
        problem:`${opp.impressions} impressions mais seulement ${opp.clicks} clics. Position ${opp.position.toFixed(0)}.`,
        solution:'Optimisez le title et la meta description pour ce mot-clé. Rendez-le plus attractif.',
        impact:'Augmentation du trafic sans améliorer le classement.' })
      if (opp.type === 'quick_win') recs.push({ id:`gsc-qw-${opp.query}`, category:'gsc', priority:'high',
        title:`Quick Win : "${opp.query}" en position ${opp.position.toFixed(0)}`,
        problem:`Ce mot-clé est en position ${opp.position.toFixed(0)} — un push en page 1 est possible.`,
        solution:'Enrichissez le contenu, améliorez les liens internes vers cette page, obtenez des backlinks.',
        impact:'Passage en page 1 = multiplication du trafic par 5 à 10.' })
    })
  }

  return recs
}

// ─── ANALYSE CONCURRENT ───────────────────────────────────────────────────────

export async function analyzeCompetitor(url: string) {
  try {
    const response = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': UA } })
    const $ = cheerio.load(response.data)
    $('script, style, nav, footer').remove()
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
    const wordCount = bodyText.split(' ').filter(Boolean).length
    const h1: string[] = []
    $('h1').each((_, el) => h1.push($(el).text().trim()))
    const isHttps = url.startsWith('https')
    return {
      url,
      title: $('title').first().text().trim() || null,
      metaDescription: $('meta[name="description"]').attr('content')?.trim() || null,
      wordCount, h1, score: 0, loadTime: 0, isHttps,
    }
  } catch { return null }
}
