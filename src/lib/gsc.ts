import { google } from 'googleapis'
import mongoose from 'mongoose'
import { connectDB } from './db'
import type { GSCData, KeywordData, PageData, PerformancePoint, GSCOpportunity, GSCPeriodComparison } from '@/types'

const webmasters = google.searchconsole('v1')

async function getOAuthClient(userId: string) {
  await connectDB()
  const db = mongoose.connection.db!
  let account = await db.collection('accounts').findOne({ userId, provider: 'google' })
  if (!account) {
    try { account = await db.collection('accounts').findOne({ userId: new mongoose.Types.ObjectId(userId), provider: 'google' }) } catch {}
  }
  if (!account?.access_token) throw new Error('Pas de compte Google connecté')
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  })
  return oauth2Client
}

export async function listGSCSites(userId: string): Promise<string[]> {
  try {
    const auth = await getOAuthClient(userId)
    const response = await webmasters.sites.list({ auth })
    return (response.data.siteEntry || []).map(s => s.siteUrl || '').filter(Boolean)
  } catch (err) { console.error('GSC list sites error:', err); return [] }
}

export async function fetchGSCData(userId: string, siteUrl: string): Promise<GSCData> {
  const noData: GSCData = {
    available: false, dateRange: { start: '', end: '' },
    totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    topKeywords: [], topPages: [], performanceOverTime: [],
    opportunities: [], quickWins: [], comparison: null, indexCoverage: null,
  }
  try {
    const auth = await getOAuthClient(userId)
    const endDate = new Date()
    const startDate = new Date(); startDate.setDate(startDate.getDate() - 90)
    const prevEndDate = new Date(startDate); prevEndDate.setDate(prevEndDate.getDate() - 1)
    const prevStartDate = new Date(prevEndDate); prevStartDate.setDate(prevStartDate.getDate() - 90)
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    const dateRange = { startDate: fmt(startDate), endDate: fmt(endDate) }
    const prevDateRange = { startDate: fmt(prevStartDate), endDate: fmt(prevEndDate) }

    const [kwRes, pagesRes, timelineRes, prevRes] = await Promise.all([
      webmasters.searchanalytics.query({ auth, siteUrl, requestBody: { ...dateRange, dimensions: ['query'], rowLimit: 50 } }),
      webmasters.searchanalytics.query({ auth, siteUrl, requestBody: { ...dateRange, dimensions: ['page'], rowLimit: 10 } }),
      webmasters.searchanalytics.query({ auth, siteUrl, requestBody: { ...dateRange, dimensions: ['date'], rowLimit: 90 } }),
      webmasters.searchanalytics.query({ auth, siteUrl, requestBody: { ...prevDateRange, dimensions: ['date'], rowLimit: 90 } }),
    ])

    const topKeywords: KeywordData[] = (kwRes.data.rows || []).map(r => ({
      query: r.keys?.[0] || '', clicks: r.clicks || 0, impressions: r.impressions || 0,
      ctr: r.ctr || 0, position: r.position || 0,
    }))
    const topPages: PageData[] = (pagesRes.data.rows || []).map(r => ({
      page: r.keys?.[0] || '', clicks: r.clicks || 0, impressions: r.impressions || 0,
      ctr: r.ctr || 0, position: r.position || 0,
    }))
    const performanceOverTime: PerformancePoint[] = (timelineRes.data.rows || []).map(r => ({
      date: r.keys?.[0] || '', clicks: r.clicks || 0, impressions: r.impressions || 0,
    }))

    // Totals current
    const totalClicks = performanceOverTime.reduce((a, p) => a + p.clicks, 0)
    const totalImpressions = performanceOverTime.reduce((a, p) => a + p.impressions, 0)
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
    const avgPos = topKeywords.length > 0 ? topKeywords.reduce((a, k) => a + k.position, 0) / topKeywords.length : 0

    // Totals previous
    const prevRows = prevRes.data.rows || []
    const prevClicks = prevRows.reduce((a, r) => a + (r.clicks || 0), 0)
    const prevImpressions = prevRows.reduce((a, r) => a + (r.impressions || 0), 0)
    const prevCtr = prevImpressions > 0 ? prevClicks / prevImpressions : 0

    const comparison: GSCPeriodComparison = {
      current: { clicks: totalClicks, impressions: totalImpressions, ctr: avgCtr, position: avgPos },
      previous: { clicks: prevClicks, impressions: prevImpressions, ctr: prevCtr, position: 0 },
      deltaClicks: prevClicks > 0 ? Math.round(((totalClicks - prevClicks) / prevClicks) * 100) : 0,
      deltaImpressions: prevImpressions > 0 ? Math.round(((totalImpressions - prevImpressions) / prevImpressions) * 100) : 0,
      deltaCtr: parseFloat(((avgCtr - prevCtr) * 100).toFixed(2)),
      deltaPosition: 0,
    }

    // Opportunities
    const opportunities: GSCOpportunity[] = []

    // Low CTR (impressions élevées, CTR < 3%)
    topKeywords
      .filter(k => k.impressions > 100 && k.ctr < 0.03)
      .slice(0, 5)
      .forEach(k => opportunities.push({
        type: 'low_ctr', query: k.query, impressions: k.impressions,
        clicks: k.clicks, ctr: k.ctr, position: k.position,
        recommendation: `Optimisez le title et meta pour "${k.query}"`,
      }))

    // Quick wins (position 4-20, impressions > 50)
    const quickWins = topKeywords.filter(k => k.position >= 4 && k.position <= 20 && k.impressions > 50)
    quickWins.slice(0, 5).forEach(k => opportunities.push({
      type: 'quick_win', query: k.query, impressions: k.impressions,
      clicks: k.clicks, ctr: k.ctr, position: k.position,
      recommendation: `Position ${k.position.toFixed(0)} → push vers top 3 possible`,
    }))

    return {
      available: true,
      dateRange: { start: dateRange.startDate, end: dateRange.endDate },
      totals: { clicks: totalClicks, impressions: totalImpressions, ctr: avgCtr, position: avgPos },
      topKeywords, topPages, performanceOverTime,
      opportunities, quickWins, comparison, indexCoverage: null,
    }
  } catch (err) { console.error('GSC fetch error:', err); return noData }
}
