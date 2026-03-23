import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, Audit } from '@/lib/db'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const { url, gscSiteUrl, competitorUrl } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  await connectDB()
  const audit = await Audit.create({ userId: session.user.id, url, status: 'pending', competitorUrl })
  runAudit(audit._id.toString(), url, session.user.id, gscSiteUrl, competitorUrl).catch(console.error)
  return NextResponse.json({ auditId: audit._id.toString() })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  await connectDB()
  const audits = await Audit.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(20).lean()
  return NextResponse.json({ audits: audits.map((a: any) => ({ ...a, id: a._id.toString() })) })
}

async function runAudit(auditId: string, url: string, userId: string, gscSiteUrl?: string, competitorUrl?: string) {
  await connectDB()
  await Audit.findByIdAndUpdate(auditId, { status: 'running' })
  try {
    const { analyzeOnPage, analyzeTechnical, calculateScores, generateRecommendations, generateChecklist, analyzeCompetitor } =
      await import('@/lib/seo-analyzer')
    const { fetchGSCData } = await import('@/lib/gsc')

    // Analyses de base en parallèle
    const [technical, onPage] = await Promise.all([
      analyzeTechnical(url),
      analyzeOnPage(url),
    ])

    // GSC + concurrent en parallèle
    const [gscData, competitorData] = await Promise.all([
      gscSiteUrl ? fetchGSCData(userId, gscSiteUrl).catch(() => null) : Promise.resolve(null),
      competitorUrl ? analyzeCompetitor(competitorUrl).catch(() => null) : Promise.resolve(null),
    ])

    const scoreBreakdown = calculateScores(technical, onPage, !!gscData?.available)
    const recommendations = generateRecommendations(technical, onPage, gscData)
    const checklist = generateChecklist(technical, onPage)

    await Audit.findByIdAndUpdate(auditId, {
      status: 'completed',
      score: scoreBreakdown.total,
      scoreBreakdown,
      technicalData: technical,
      onPageData: onPage,
      gscData,
      recommendations,
      checklist,
      competitorData,
      completedAt: new Date(),
    })
  } catch (err) {
    console.error('Audit failed:', err)
    await Audit.findByIdAndUpdate(auditId, { status: 'failed' })
  }
}
