/**
 * GET /api/gsc — List user's GSC sites
 */
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listGSCSites } from '@/lib/gsc'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const sites = await listGSCSites(session.user.id)
  return NextResponse.json({ sites })
}
