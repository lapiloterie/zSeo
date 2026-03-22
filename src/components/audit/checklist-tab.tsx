'use client'
import { useState } from 'react'
import type { ChecklistItem } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'Technique': '⚙️', 'On-Page': '📝', 'Contenu': '✍️',
  'Performance': '⚡', 'Social': '📱', 'Avancé': '🚀',
}

export function ChecklistTab({ items }: { items: ChecklistItem[] }) {
  const [filter, setFilter] = useState<string>('all')
  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)
  const passed = items.filter(i => i.passed).length
  const score = Math.round((passed / items.length) * 100)

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Checklist SEO — {passed}/{items.length} points validés</h3>
          <span className={`text-2xl font-black ${score>=80?'text-emerald-400':score>=60?'text-amber-400':'text-red-400'}`}>{score}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div className={`h-3 rounded-full transition-all ${score>=80?'bg-emerald-500':score>=60?'bg-amber-500':'bg-red-500'}`} style={{width:`${score}%`}} />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="text-emerald-400">✓ {passed} validés</span>
          <span className="text-red-400">✗ {items.length - passed} à corriger</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter===cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {cat === 'all' ? '🔍 Tout' : `${CATEGORY_ICONS[cat]||'•'} ${cat}`}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${item.passed ? 'bg-emerald-500/3 border-emerald-500/15' : 'bg-red-500/3 border-red-500/15'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {item.passed ? '✓' : '✗'}
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{CATEGORY_ICONS[item.category]||''} {item.category}</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full border flex-shrink-0 ml-3 ${
              item.priority==='high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              item.priority==='medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {item.priority==='high'?'Haute':item.priority==='medium'?'Moyenne':'Faible'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
