'use client'
import { useState, useEffect, useCallback } from 'react'
import type { AuditResult } from '@/types'
import { ScoreGauge } from './score-gauge'
import { TechnicalTab } from './technical-tab'
import { OnPageTab } from './onpage-tab'
import { GSCTab } from './gsc-tab'
import { RecommendationsTab } from './recommendations-tab'
import { ChecklistTab } from './checklist-tab'
import { CompetitorTab } from './competitor-tab'
import { cn, getScoreColor } from '@/lib/utils'

const TABS = [
  { id:'overview', label:'Vue d\'ensemble' },
  { id:'technical', label:'Technique' },
  { id:'onpage', label:'On-Page' },
  { id:'gsc', label:'Search Console' },
  { id:'recommendations', label:'Recommandations' },
  { id:'checklist', label:'Checklist' },
  { id:'competitor', label:'Concurrent' },
]

export function AuditResultClient({ audit: initialAudit }: { audit: AuditResult }) {
  const [audit, setAudit] = useState<AuditResult>(initialAudit)
  const [activeTab, setActiveTab] = useState('overview')

  const poll = useCallback(async () => {
    const res = await fetch(`/api/audit/${initialAudit.id}`)
    const data = await res.json()
    if (data.audit) setAudit(data.audit)
  }, [initialAudit.id])

  useEffect(() => {
    if (audit.status === 'pending' || audit.status === 'running') {
      const interval = setInterval(poll, 3000)
      return () => clearInterval(interval)
    }
  }, [audit.status, poll])

  const isLoading = audit.status === 'pending' || audit.status === 'running'
  const a = audit as any

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold truncate">{audit.url.replace(/^https?:\/\//, '')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{new Date(audit.createdAt).toLocaleDateString('fr-FR', { dateStyle:'long' })}</p>
        </div>
        <StatusBadge status={audit.status} />
      </div>

      {isLoading && <LoadingCard />}

      {audit.status === 'failed' && (
        <div className="glass rounded-xl p-6 border border-red-500/20 text-center">
          <p className="text-red-400 font-medium">❌ L'audit a échoué</p>
          <p className="text-muted-foreground text-sm mt-2">Vérifiez que l'URL est accessible et relancez.</p>
        </div>
      )}

      {audit.status === 'completed' && audit.scoreBreakdown && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 glass rounded-2xl p-6 flex flex-col items-center justify-center">
              <ScoreGauge score={audit.score!} />
              <p className="text-xs text-muted-foreground mt-2">Score Global</p>
            </div>
            {[
              { label:'Technique', score:audit.scoreBreakdown.technical },
              { label:'On-Page', score:audit.scoreBreakdown.onPage },
              { label:'Performance', score:audit.scoreBreakdown.performance },
              { label:'Search Console', score:audit.scoreBreakdown.gsc },
            ].map(item => (
              <div key={item.label} className="glass rounded-2xl p-5 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">{item.label}</span>
                <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                  <div className={`h-1.5 rounded-full ${item.score>=80?'bg-emerald-500':item.score>=60?'bg-amber-500':'bg-red-500'}`} style={{width:`${item.score}%`}} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                )}>
                {tab.label}
                {tab.id === 'recommendations' && audit.recommendations && (
                  <span className="ml-1.5 bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">
                    {(audit.recommendations as any[]).filter(r => r.priority==='high').length}
                  </span>
                )}
                {tab.id === 'checklist' && audit.checklist && (
                  <span className="ml-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-1.5 py-0.5 rounded-full">
                    {(audit.checklist as any[]).filter((c:any) => c.passed).length}/{(audit.checklist as any[]).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'overview' && <OverviewTab audit={audit} />}
            {activeTab === 'technical' && audit.technicalData && <TechnicalTab data={audit.technicalData} />}
            {activeTab === 'onpage' && audit.onPageData && <OnPageTab data={audit.onPageData} />}
            {activeTab === 'gsc' && <GSCTab data={audit.gscData} />}
            {activeTab === 'recommendations' && audit.recommendations && <RecommendationsTab recs={audit.recommendations as any} />}
            {activeTab === 'checklist' && audit.checklist && <ChecklistTab items={audit.checklist as any} />}
            {activeTab === 'competitor' && <CompetitorTab competitor={a.competitorData} onPage={audit.onPageData} technical={audit.technicalData} />}
          </div>
        </>
      )}
    </div>
  )
}

function OverviewTab({ audit }: { audit: AuditResult }) {
  const highPrio = (audit.recommendations as any[] || []).filter(r => r.priority === 'high')
  const checklistPassed = (audit.checklist as any[] || []).filter((c:any) => c.passed).length
  const checklistTotal = (audit.checklist as any[] || []).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass rounded-xl p-5 space-y-2">
        <h3 className="font-semibold mb-3">✅ Points positifs</h3>
        {audit.technicalData?.isHttps && <Check text="Site sécurisé HTTPS" />}
        {audit.technicalData?.hasSitemap && <Check text="Sitemap.xml présent" />}
        {audit.technicalData?.hasRobotsTxt && <Check text="Robots.txt configuré" />}
        {audit.onPageData?.title && <Check text="Balise Title définie" />}
        {audit.onPageData?.metaDescription && <Check text="Meta description présente" />}
        {audit.onPageData?.structuredData && <Check text="Données structurées JSON-LD" />}
        {(audit.onPageData as any)?.ogComplete && <Check text="Open Graph complet" />}
        {audit.technicalData?.brokenLinks?.length === 0 && <Check text="Aucun lien brisé" />}
        {checklistTotal > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm font-medium">Checklist : {checklistPassed}/{checklistTotal}</p>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-1.5">
              <div className="h-1.5 rounded-full bg-emerald-500" style={{width:`${(checklistPassed/checklistTotal)*100}%`}} />
            </div>
          </div>
        )}
      </div>
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-semibold">🔴 Priorités hautes ({highPrio.length})</h3>
        {highPrio.length === 0 && <p className="text-sm text-muted-foreground">Aucun problème critique 🎉</p>}
        {highPrio.slice(0,6).map((r: any) => (
          <div key={r.id} className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
            <div>
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.problem}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Check({ text }: { text: string }) {
  return <div className="flex items-center gap-2 text-sm"><span className="text-emerald-400">✓</span><span>{text}</span></div>
}

function LoadingCard() {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
      <p className="font-semibold">Analyse SEO en cours...</p>
      <p className="text-sm text-muted-foreground mt-2">Technique · On-Page · Core Web Vitals · Search Console</p>
      <div className="flex justify-center flex-wrap gap-2 mt-6">
        {['HTTPS','Sitemap','Liens','Title','Meta','H1','Images','GSC'].map(s => (
          <span key={s} className="glass text-xs px-3 py-1 rounded-full text-muted-foreground animate-pulse">{s}</span>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label:'✓ Terminé', cls:'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    running: { label:'⟳ En cours', cls:'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    pending: { label:'○ En attente', cls:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    failed: { label:'✗ Échec', cls:'bg-red-500/20 text-red-400 border-red-500/30' },
  }
  const s = map[status] || map.pending
  return <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${s.cls}`}>{s.label}</span>
}
