// ─── TYPES COMPLETS zSeo v2 ───────────────────────────────────────────────────

export interface CoreWebVitals {
  lcp: number; fid: number; cls: number; fcp: number; ttfb: number
}

export interface RedirectInfo { from: string; to: string; statusCode: number }
export interface BrokenLink { url: string; statusCode: number; foundOn: string }
export interface HreflangTag { lang: string; url: string }
export interface ImageInfo { src: string; alt: string | null; size?: number; isWebP: boolean; hasLazyLoad: boolean }
export interface AnchorInfo { text: string; href: string; isInternal: boolean }
export interface SchemaType { type: string; valid: boolean; properties: string[] }

export interface TechnicalAudit {
  // Basic
  loadTime: number
  performanceScore: number
  mobileScore: number
  isHttps: boolean
  hasSitemap: boolean
  hasRobotsTxt: boolean
  sitemapUrl: string | null
  robotsTxtUrl: string | null
  coreWebVitals: CoreWebVitals
  // Advanced
  redirects: RedirectInfo[]
  brokenLinks: BrokenLink[]
  hreflangTags: HreflangTag[]
  hasPagination: boolean
  paginationUrls: string[]
  canonicalUrl: string | null
  textToHtmlRatio: number
  crawlDepth: number
}

export interface OnPageAudit {
  // Basic
  title: string | null
  titleLength: number
  metaDescription: string | null
  metaDescriptionLength: number
  h1: string[]
  h2: string[]
  h3: string[]
  wordCount: number
  imagesWithoutAlt: number
  totalImages: number
  internalLinks: number
  externalLinks: number
  canonicalUrl: string | null
  ogTags: { property: string; content: string }[]
  structuredData: boolean
  htmlSize: number
  // Advanced
  keywordDensity: { word: string; count: number; density: number }[]
  readabilityScore: number
  readabilityLevel: string
  isThinContent: boolean
  anchors: AnchorInfo[]
  schemaTypes: SchemaType[]
  images: ImageInfo[]
  ogComplete: boolean
  ogMissing: string[]
}

export interface GSCOpportunity {
  type: 'low_ctr' | 'quick_win' | 'cannibalization'
  query: string
  page?: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  recommendation: string
}

export interface GSCPeriodComparison {
  current: { clicks: number; impressions: number; ctr: number; position: number }
  previous: { clicks: number; impressions: number; ctr: number; position: number }
  deltaClicks: number
  deltaImpressions: number
  deltaCtr: number
  deltaPosition: number
}

export interface GSCData {
  available: boolean
  dateRange: { start: string; end: string }
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  topKeywords: KeywordData[]
  topPages: PageData[]
  performanceOverTime: PerformancePoint[]
  // Advanced
  opportunities: GSCOpportunity[]
  quickWins: KeywordData[]
  comparison: GSCPeriodComparison | null
  indexCoverage: { indexed: number; total: number } | null
}

export interface KeywordData {
  query: string; clicks: number; impressions: number; ctr: number; position: number
}
export interface PageData {
  page: string; clicks: number; impressions: number; ctr: number; position: number
}
export interface PerformancePoint {
  date: string; clicks: number; impressions: number
}

export interface Recommendation {
  id: string
  category: 'technical' | 'onpage' | 'performance' | 'content' | 'gsc' | 'advanced'
  priority: 'high' | 'medium' | 'low'
  title: string
  problem: string
  solution: string
  impact: string
}

export interface ScoreBreakdown {
  technical: number; onPage: number; performance: number; gsc: number; total: number
}

export interface ChecklistItem {
  id: string; label: string; passed: boolean; category: string; priority: 'high'|'medium'|'low'
}

export interface CompetitorData {
  url: string
  title: string | null
  metaDescription: string | null
  wordCount: number
  h1: string[]
  score: number
  loadTime: number
  isHttps: boolean
}

export interface AuditResult {
  id: string
  url: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  score: number | null
  scoreBreakdown: ScoreBreakdown | null
  technicalData: TechnicalAudit | null
  onPageData: OnPageAudit | null
  gscData: GSCData | null
  recommendations: Recommendation[] | null
  checklist: ChecklistItem[] | null
  competitorData: CompetitorData | null
  createdAt: string
  completedAt: string | null
}
