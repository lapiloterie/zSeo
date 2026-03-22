import { auth } from '@/lib/auth'
import { connectDB, Audit } from '@/lib/db'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const session = await auth()
  await connectDB()

  const audits = await Audit.find({ userId: session!.user!.id! })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  const recentAudits = audits.map((a: any) => ({
    id: a._id.toString(),
    url: a.url,
    status: a.status,
    score: a.score ?? null,
    createdAt: a.createdAt,
    completedAt: a.completedAt ?? null,
  }))

  return (
    <DashboardClient
      recentAudits={recentAudits}
      userName={session?.user?.name || 'Utilisateur'}
    />
  )
}