'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function NewAuditForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [gscSites, setGscSites] = useState<string[]>([])
  const [gscSiteUrl, setGscSiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/gsc').then(r => r.json()).then(d => { if (d.sites) setGscSites(d.sites) }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!url) { setError('Veuillez entrer une URL'); return }
    let finalUrl = url.trim().replace(/^(https?:\/\/)+/, 'https://')
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl
    setLoading(true)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,
          gscSiteUrl: gscSiteUrl || undefined,
          competitorUrl: competitorUrl || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      router.push(`/dashboard/audit/${data.auditId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du lancement')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* URL */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">URL à auditer</label>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://exemple.com"
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
      </div>

      {/* GSC */}
      {gscSites.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Site Search Console <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <select value={gscSiteUrl} onChange={e => setGscSiteUrl(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">— Sélectionner un site —</option>
            {gscSites.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-muted-foreground mt-1">Active les données réelles Google Search Console</p>
        </div>
      )}

      {/* Concurrent */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          URL concurrent <span className="text-muted-foreground font-normal">(optionnel)</span>
        </label>
        <input type="text" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)}
          placeholder="https://concurrent.com"
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
        <p className="text-xs text-muted-foreground mt-1">Compare votre site avec un concurrent</p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyse en cours...</>
        ) : (
          <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Lancer l'audit SEO</>
        )}
      </button>
    </form>
  )
}
