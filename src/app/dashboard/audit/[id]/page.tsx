import { auth } from '@/lib/auth'
import { connectDB, Audit } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { AuditResultClient } from '@/components/audit/audit-result-client'

export default async function AuditPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  await connectDB()

  const audit = await Audit.findOne({
    _id: params.id,
    userId: session.user.id
  }).lean()

  if (!audit) notFound()

  const a = audit as any
  return (
    <AuditResultClient audit={{
      ...a,
      id: a._id.toString(),
      createdAt: a.createdAt?.toISOString(),
      completedAt: a.completedAt?.toISOString() ?? null,
    }} />
  )
}