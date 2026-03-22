'use client'
import type { GSCData } from '@/types'
import { formatNumber, formatPercent } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function GSCTab({ data }: { data: GSCData | null }) {
  if (!data || !data.available) {
    return (
      <div className="glass rounded-xl p-10 text-center">
        <p className="text-4xl mb-4">📊</p>
        <h3 className="font-semibold text-lg mb-2">Données Search Console non disponibles</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Relancez un audit en sélectionnant un site Search Console dans le formulaire.
        </p>
      </div>
    )
  }

  const deltaColor = (n: number) => n > 0 ? 'text-emerald-400' : n < 0 ? 'text-red-400' : 'text-muted-foreground'
  const deltaPrefix = (n: number) => n > 0 ? '+' : ''

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Clics" value={formatNumber(data.totals.clicks)} sub="90 derniers jours" color="text-blue-400" />
        <KpiCard label="Impressions" value={formatNumber(data.totals.impressions)} sub="90 derniers jours" color="text-violet-400" />
        <KpiCard label="CTR moyen" value={formatPercent(data.totals.ctr)} sub="Taux de clic" color="text-emerald-400" />
        <KpiCard label="Position moy." value={data.totals.position.toFixed(1)} sub="Classement moyen" color="text-amber-400" />
      </div>

      {/* Comparison */}
      {data.comparison && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">📊 Comparaison période précédente (90j vs 90j)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Clics', delta: data.comparison.deltaClicks },
              { label: 'Impressions', delta: data.comparison.deltaImpressions },
              { label: 'CTR', delta: data.comparison.deltaCtr },
            ].map(item => (
              <div key={item.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-xl font-bold mt-1 ${deltaColor(item.delta)}`}>
                  {deltaPrefix(item.delta)}{item.delta}{item.label === 'CTR' ? 'pp' : '%'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {data.performanceOverTime.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">📈 Performance dans le temps (30 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.performanceOverTime.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 15%)" />
              <XAxis dataKey="date" tick={{fill:'hsl(215 20% 55%)',fontSize:11}} tickFormatter={d => d.slice(5)} />
              <YAxis yAxisId="left" tick={{fill:'hsl(215 20% 55%)',fontSize:11}} />
              <YAxis yAxisId="right" orientation="right" tick={{fill:'hsl(215 20% 55%)',fontSize:11}} />
              <Tooltip contentStyle={{background:'hsl(222 47% 7%)',border:'1px solid hsl(217 33% 15%)',borderRadius:8}} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} name="Clics" />
              <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Impressions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Opportunities */}
      {data.opportunities.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">🎯 Opportunités détectées</h3>
          <div className="space-y-3">
            {data.opportunities.map((opp, i) => (
              <div key={i} className={`rounded-lg p-4 border ${opp.type === 'low_ctr' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${opp.type === 'low_ctr' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {opp.type === 'low_ctr' ? 'CTR faible' : '⚡ Quick Win'}
                    </span>
                    <span className="font-semibold text-sm">"{opp.query}"</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">Pos. {opp.position.toFixed(0)}</span>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{formatNumber(opp.impressions)} impressions</span>
                  <span>{formatNumber(opp.clicks)} clics</span>
                  <span>CTR {formatPercent(opp.ctr)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">💡 {opp.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick wins */}
      {data.quickWins.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-1">⚡ Quick Wins — Positions 4 à 20</h3>
          <p className="text-xs text-muted-foreground mb-4">Ces mots-clés sont proches de la page 1 — un effort ciblé peut tout changer</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-2">Requête</th>
                  <th className="text-right pb-2">Pos.</th>
                  <th className="text-right pb-2">Clics</th>
                  <th className="text-right pb-2">Impr.</th>
                  <th className="text-right pb-2">CTR</th>
                </tr>
              </thead>
              <tbody>
                {data.quickWins.slice(0,10).map((kw,i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-2 font-medium">{kw.query}</td>
                    <td className="py-2 text-right">
                      <span className={`font-bold ${kw.position<=10?'text-amber-400':'text-orange-400'}`}>{kw.position.toFixed(0)}</span>
                    </td>
                    <td className="py-2 text-right text-blue-400">{formatNumber(kw.clicks)}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatNumber(kw.impressions)}</td>
                    <td className="py-2 text-right text-emerald-400">{formatPercent(kw.ctr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top keywords + pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">🔑 Top 25 Mots-clés</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-2">Requête</th>
                  <th className="text-right pb-2">Clics</th>
                  <th className="text-right pb-2">Impr.</th>
                  <th className="text-right pb-2">Pos.</th>
                </tr>
              </thead>
              <tbody>
                {data.topKeywords.slice(0,15).map((kw,i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-2 max-w-[150px] truncate">{kw.query}</td>
                    <td className="py-2 text-right font-medium text-blue-400">{formatNumber(kw.clicks)}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatNumber(kw.impressions)}</td>
                    <td className="py-2 text-right">
                      <span className={`font-medium ${kw.position<=3?'text-emerald-400':kw.position<=10?'text-amber-400':'text-red-400'}`}>{kw.position.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">📄 Top Pages</h3>
          <div className="space-y-2">
            {data.topPages.slice(0,10).map((pg,i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">/{pg.page.replace(/^https?:\/\/[^/]+\/?/,'')}</span>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-blue-400 font-medium">{formatNumber(pg.clicks)}</span>
                  <span className="text-emerald-400 text-xs">{formatPercent(pg.ctr)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, color }: any) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}
