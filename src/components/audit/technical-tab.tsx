import type { TechnicalAudit } from '@/types'

function Row({ label, value, status }: { label: string; value: string; status: 'ok'|'warn'|'error' }) {
  const icons = { ok:'✅', warn:'⚠️', error:'❌' }
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-right max-w-[200px] truncate">{value}</span>
        <span>{icons[status]}</span>
      </div>
    </div>
  )
}

export function TechnicalTab({ data }: { data: TechnicalAudit }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sécurité */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">🔒 Sécurité & Configuration</h3>
          <Row label="HTTPS" value={data.isHttps ? 'Activé' : 'Non activé'} status={data.isHttps ? 'ok' : 'error'} />
          <Row label="Sitemap.xml" value={data.hasSitemap ? (data.sitemapUrl || 'Trouvé') : 'Introuvable'} status={data.hasSitemap ? 'ok' : 'warn'} />
          <Row label="Robots.txt" value={data.hasRobotsTxt ? 'Présent' : 'Absent'} status={data.hasRobotsTxt ? 'ok' : 'warn'} />
          <Row label="URL Canonique" value={data.canonicalUrl || 'Non définie'} status={data.canonicalUrl ? 'ok' : 'warn'} />
          <Row label="Ratio Texte/HTML" value={data.textToHtmlRatio > 0 ? `${data.textToHtmlRatio}%` : 'N/A'} status={data.textToHtmlRatio > 10 ? 'ok' : data.textToHtmlRatio > 5 ? 'warn' : 'error'} />
          <Row label="Score Performance" value={`${data.performanceScore}/100`} status={data.performanceScore>=80?'ok':data.performanceScore>=60?'warn':'error'} />
          <Row label="Score Mobile" value={`${data.mobileScore}/100`} status={data.mobileScore>=80?'ok':data.mobileScore>=60?'warn':'error'} />
        </div>

        {/* Core Web Vitals */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">⚡ Core Web Vitals</h3>
          <Row label="LCP" value={data.coreWebVitals.lcp > 0 ? `${(data.coreWebVitals.lcp/1000).toFixed(2)}s` : 'N/A'} status={data.coreWebVitals.lcp<2500?'ok':data.coreWebVitals.lcp<4000?'warn':'error'} />
          <Row label="FCP" value={data.coreWebVitals.fcp > 0 ? `${(data.coreWebVitals.fcp/1000).toFixed(2)}s` : 'N/A'} status={data.coreWebVitals.fcp<1800?'ok':data.coreWebVitals.fcp<3000?'warn':'error'} />
          <Row label="CLS" value={data.coreWebVitals.cls > 0 ? data.coreWebVitals.cls.toFixed(3) : 'N/A'} status={data.coreWebVitals.cls<0.1?'ok':data.coreWebVitals.cls<0.25?'warn':'error'} />
          <Row label="TTFB" value={data.coreWebVitals.ttfb > 0 ? `${data.coreWebVitals.ttfb}ms` : 'N/A'} status={data.coreWebVitals.ttfb<600?'ok':data.coreWebVitals.ttfb<1500?'warn':'error'} />
          <Row label="Temps chargement" value={data.loadTime > 0 ? `${(data.loadTime/1000).toFixed(1)}s` : 'N/A'} status={data.loadTime<3000?'ok':data.loadTime<5000?'warn':'error'} />
        </div>
      </div>

      {/* Liens & Redirections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">🔗 Liens & Redirections</h3>
          <Row label="Redirections détectées" value={data.redirects.length.toString()} status={data.redirects.length===0?'ok':data.redirects.length<3?'warn':'error'} />
          <Row label="Liens brisés (404)" value={data.brokenLinks.length.toString()} status={data.brokenLinks.length===0?'ok':'error'} />
          <Row label="Pagination (rel=prev/next)" value={data.hasPagination ? `${data.paginationUrls.length} URL(s)` : 'Non détectée'} status={data.hasPagination ? 'ok' : 'warn'} />
          {data.brokenLinks.length > 0 && (
            <div className="mt-3 space-y-1">
              {data.brokenLinks.slice(0,3).map((l,i) => (
                <div key={i} className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1 truncate">
                  404: {l.url}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">🌍 Internationalisation</h3>
          <Row label="Balises Hreflang" value={data.hreflangTags.length > 0 ? `${data.hreflangTags.length} langue(s)` : 'Absentes'} status={data.hreflangTags.length > 0 ? 'ok' : 'warn'} />
          {data.hreflangTags.length > 0 && (
            <div className="mt-3 space-y-1">
              {data.hreflangTags.slice(0,5).map((t,i) => (
                <div key={i} className="text-xs text-muted-foreground flex justify-between">
                  <span className="font-medium text-foreground">{t.lang}</span>
                  <span className="truncate ml-2 max-w-[200px]">{t.url}</span>
                </div>
              ))}
            </div>
          )}
          {data.redirects.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium mb-2">Redirections :</p>
              {data.redirects.slice(0,3).map((r,i) => (
                <div key={i} className="text-xs text-amber-400 bg-amber-500/10 rounded px-2 py-1 mb-1">
                  {r.statusCode} → {r.to.slice(0,50)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
