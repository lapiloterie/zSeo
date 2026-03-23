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
  const [showAdvanced, setShowAdvanced] = useState(false)
  // New options
  const [crawlDepth, setCrawlDepth] = useState<number>(1)
  const [targetLang, setTargetLang] = useState('fr')
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile')
  const [targetKeyword, setTargetKeyword] = useState('')

  useEffect(() => {
    fetch('/api/gsc').then(r => r.json()).then(d => { if (d.sites) setGscSites(d.sites) }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!url) { setError('Veuillez entrer une URL'); return }
    let finalUrl = url
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
          crawlDepth,
          targetLang,
          device,
          targetKeyword: targetKeyword || undefined,
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

      {/* Mot-clé cible */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Mot-clé cible <span className="text-muted-foreground font-normal">(optionnel)</span>
        </label>
        <input type="text" value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)}
          placeholder="ex: audit seo automatique"
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
        <p className="text-xs text-muted-foreground mt-1">Analyse la densité, position dans title/H1/URL</p>
      </div>

      {/* Device + Langue */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Device prioritaire</label>
          <div className="flex gap-2">
            {(['mobile', 'desktop'] as const).map(d => (
              <button key={d} type="button" onClick={() => setDevice(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${device === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {d === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Langue cible</label>
          <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="it">🇮🇹 Italiano</option>
            <option value="pt">🇵🇹 Português</option>
          </select>
        </div>
      </div>

      {/* Profondeur de crawl */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Profondeur d'analyse
          <span className="ml-2 text-muted-foreground font-normal">({crawlDepth} page{crawlDepth > 1 ? 's' : ''})</span>
        </label>
        <div className="flex gap-2">
          {[1, 3, 5].map(d => (
            <button key={d} type="button" onClick={() => setCrawlDepth(d)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${crawlDepth === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {d === 1 ? '1 page' : `${d} pages`}
            </button>
          ))}
        </div>
        {crawlDepth > 1 && (
          <p className="text-xs text-amber-400 mt-1">⚠ L'analyse multi-pages peut prendre 1-3 minutes</p>
        )}
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
        </div>
      )}

      {/* Options avancées */}
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
        <span>{showAdvanced ? '▼' : '▶'}</span> Options avancées
      </button>

      {showAdvanced && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            URL concurrent <span className="text-muted-foreground font-normal">(optionnel)</span>
          </label>
          <input type="text" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)}
            placeholder="https://concurrent.com"
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
        </div>
      )}

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
