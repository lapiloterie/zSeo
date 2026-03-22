import { auth } from '@/lib/auth'
import { connectDB, Audit } from '@/lib/db'
import Link from 'next/link'
import { getScoreColor } from '@/lib/utils'

export default async function HistoryPage() {
  const session = await auth()
  await connectDB()

  const audits = await Audit.find({ userId: session!.user!.id! })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6" style={{fontFamily:'Space Grotesk'}}>Historique des audits</h1>
      {audits.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-muted-foreground">Aucun audit réalisé pour l&apos;instant.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-primary hover:underline text-sm">
            Lancer mon premier audit →
          </Link>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left p-4">URL</th>
                <th className="text-center p-4">Score</th>
                <th className="text-center p-4">Statut</th>
                <th className="text-right p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a: any) => (
                <tr key={a._id.toString()} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 max-w-[240px] truncate font-mono text-xs">{a.url}</td>
                  <td className="p-4 text-center">
                    {a.score != null
                      ? <span className={`font-bold text-base ${getScoreColor(a.score)}`}>{a.score}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      a.status==='completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      a.status==='running'   ? 'bg-blue-500/20 text-blue-400' :
                      a.status==='failed'    ? 'bg-red-500/20 text-red-400' :
                                               'bg-yellow-500/20 text-yellow-400'
                    }`}>{a.status}</span>
                  </td>
                  <td className="p-4 text-right text-muted-foreground text-xs">
                    {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/audit/${a._id.toString()}`} className="text-primary text-xs hover:underline">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}