import type { OnPageAudit } from '@/types'

export function OnPageTab({ data }: { data: OnPageAudit }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta */}
        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">📝 Balises Meta</h3>
          <MetaField label="Title" value={data.title} length={data.titleLength} minOk={50} maxOk={60} hint="Optimal : 50-60 caractères" />
          <MetaField label="Meta Description" value={data.metaDescription} length={data.metaDescriptionLength} minOk={120} maxOk={160} hint="Optimal : 120-160 caractères" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">URL Canonique</p>
            <p className="text-sm font-mono text-primary truncate">{data.canonicalUrl || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Données structurées</p>
            <p className="text-sm">{data.structuredData ? `✅ ${data.schemaTypes.map(s=>s.type).join(', ')}` : '❌ Absentes'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Open Graph</p>
            <div className="flex flex-wrap gap-1">
              {['og:title','og:description','og:image','og:url'].map(tag => (
                <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${data.ogTags.some(t=>t.property===tag) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {tag.replace('og:','')} {data.ogTags.some(t=>t.property===tag)?'✓':'✗'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Structure */}
        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">🏗️ Structure HTML</h3>
          <HeadingList label="H1" items={data.h1} expected={1} />
          <HeadingList label="H2" items={data.h2} />
          <HeadingList label="H3" items={data.h3} />
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <Metric label="Mots" value={data.wordCount.toString()} status={data.wordCount>=300?'ok':'warn'} />
            <Metric label="Lisibilité" value={`${data.readabilityScore}/100`} status={data.readabilityScore>=50?'ok':data.readabilityScore>=30?'warn':'error'} />
            <Metric label="Images sans ALT" value={`${data.imagesWithoutAlt}/${data.totalImages}`} status={data.imagesWithoutAlt===0?'ok':data.imagesWithoutAlt<5?'warn':'error'} />
            <Metric label="Liens internes" value={data.internalLinks.toString()} status="ok" />
            <Metric label="Images WebP" value={data.images.filter(i=>i.isWebP).length.toString()} status={data.images.some(i=>i.isWebP)?'ok':'warn'} />
            <Metric label="Lazy Load" value={data.images.filter(i=>i.hasLazyLoad).length.toString()} status={data.images.some(i=>i.hasLazyLoad)?'ok':'warn'} />
          </div>
        </div>
      </div>

      {/* Readability */}
      <div className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4">📖 Lisibilité & Contenu</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Score Flesch</p>
            <p className={`text-3xl font-bold ${data.readabilityScore>=70?'text-emerald-400':data.readabilityScore>=50?'text-amber-400':data.readabilityScore>=30?'text-orange-400':'text-red-400'}`}>{data.readabilityScore}</p>
            <p className="text-xs text-muted-foreground mt-1">{data.readabilityLevel}</p>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
              <div className={`h-1.5 rounded-full ${data.readabilityScore>=70?'bg-emerald-500':data.readabilityScore>=50?'bg-amber-500':'bg-red-500'}`} style={{width:`${data.readabilityScore}%`}} />
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Contenu</p>
            <p className="text-sm font-medium">{data.wordCount} mots</p>
            <p className={`text-xs mt-1 ${data.isThinContent?'text-red-400':'text-emerald-400'}`}>
              {data.isThinContent ? '⚠ Contenu mince' : '✓ Contenu suffisant'}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Taille HTML</p>
            <p className="text-sm font-medium">{(data.htmlSize/1024).toFixed(1)} KB</p>
            <p className={`text-xs mt-1 ${data.htmlSize<100000?'text-emerald-400':'text-amber-400'}`}>
              {data.htmlSize < 100000 ? '✓ Taille optimale' : '⚠ Taille importante'}
            </p>
          </div>
        </div>
      </div>

      {/* Keyword density */}
      {data.keywordDensity.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">🔍 Densité des mots-clés (Top 15)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.keywordDensity.slice(0,15).map((kw,i) => (
              <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium truncate">{kw.word}</span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{kw.count}×</span>
                  <span className={`text-xs font-bold ${kw.density > 3 ? 'text-red-400' : kw.density > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>{kw.density}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">⚠ Densité > 3% peut être considérée comme du keyword stuffing</p>
        </div>
      )}

      {/* Schema types */}
      {data.schemaTypes.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">🏷️ Données structurées détectées</h3>
          <div className="flex flex-wrap gap-2">
            {data.schemaTypes.map((s,i) => (
              <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-emerald-400">{s.type}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.properties.length} propriétés</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetaField({ label, value, length, minOk, maxOk, hint }: any) {
  const ok = length >= minOk && length <= maxOk
  const warn = length > 0 && !ok
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={`text-xs ${ok?'text-emerald-400':warn?'text-amber-400':'text-red-400'}`}>
          {length > 0 ? `${length} car.` : 'Absent'} {ok?'✓':warn?'⚠':'✗'}
        </span>
      </div>
      <p className="text-xs bg-secondary rounded px-3 py-2 font-mono truncate">{value || <span className="text-muted-foreground italic">Non défini</span>}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  )
}

function HeadingList({ label, items, expected }: any) {
  const ok = expected ? items.length === expected : items.length > 0
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <span className={`text-xs ${ok?'text-emerald-400':items.length===0?'text-red-400':'text-amber-400'}`}>({items.length}) {ok?'✓':items.length===0?'✗':'⚠'}</span>
      </div>
      {items.slice(0,2).map((h: string,i: number) => (
        <p key={i} className="text-xs text-muted-foreground truncate pl-2 border-l border-border">{h}</p>
      ))}
    </div>
  )
}

function Metric({ label, value, status }: any) {
  const colors: any = { ok:'text-emerald-400', warn:'text-amber-400', error:'text-red-400' }
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${colors[status]}`}>{value}</p>
    </div>
  )
}
