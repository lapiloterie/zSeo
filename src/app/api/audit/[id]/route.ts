import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, Audit } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  await connectDB()

  const audit = await Audit.findOne({
    _id: params.id,
    userId: session.user.id,
  }).lean()

  if (!audit) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  }

  const a = audit as any
  return NextResponse.json({
    audit: {
      ...a,
      id: a._id.toString(),
      createdAt: a.createdAt?.toISOString(),
      completedAt: a.completedAt?.toISOString() ?? null,
    }
  })
}