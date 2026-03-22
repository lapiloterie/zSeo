import type { Recommendation } from '@/types'
import { getPriorityColor } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, string> = {
  technical: '⚙️',
  onpage: '📝',
  performance: '⚡',
  content: '✍️',
  gsc: '📊',
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

export function RecommendationsTab({ recs }: { recs: Recommendation[] }) {
  const sorted = [...recs].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const high = sorted.filter(r => r.priority === 'high')
  const medium = sorted.filter(r => r.priority === 'medium')
  const low = sorted.filter(r => r.priority === 'low')

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Haute priorité" count={high.length} color="text-red-400 bg-red-400/10 border-red-400/20" />
        <SummaryCard label="Priorité moyenne" count={medium.length} color="text-amber-400 bg-amber-400/10 border-amber-400/20" />
        <SummaryCard label="Faible priorité" count={low.length} color="text-blue-400 bg-blue-400/10 border-blue-400/20" />
      </div>

      {/* Recs */}
      <div className="space-y-3">
        {sorted.map(rec => <RecCard key={rec.id} rec={rec} />)}
        {sorted.length === 0 && (
          <div className="glass rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-semibold">Excellent ! Aucune recommandation majeure.</p>
            <p className="text-sm text-muted-foreground mt-2">Votre site est bien optimisé pour le SEO.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 border text-center ${color}`}>
      <p className="text-3xl font-bold" style={{fontFamily:'Space Grotesk'}}>{count}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  )
}

function RecCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{CATEGORY_ICONS[rec.category] || '💡'}</span>
          <h4 className="font-semibold">{rec.title}</h4>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${getPriorityColor(rec.priority)}`}>
          {rec.priority === 'high' ? 'Haute' : rec.priority === 'medium' ? 'Moyenne' : 'Faible'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
          <p className="text-xs font-medium text-red-400 mb-1">⚠ Problème</p>
          <p className="text-muted-foreground text-xs">{rec.problem}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
          <p className="text-xs font-medium text-emerald-400 mb-1">✅ Solution</p>
          <p className="text-muted-foreground text-xs">{rec.solution}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-400 mb-1">📈 Impact</p>
          <p className="text-muted-foreground text-xs">{rec.impact}</p>
        </div>
      </div>
    </div>
  )
}
