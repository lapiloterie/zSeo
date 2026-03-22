import type { CompetitorData, OnPageAudit, TechnicalAudit } from '@/types'

function CompareRow({ label, yours, theirs }: { label: string; yours: string; theirs: string; yoursBetter?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-center">{yours}</span>
      <span className="text-muted-foreground text-center">{theirs}</span>
    </div>
  )
}

export function CompetitorTab({ competitor, onPage, technical }: {
  competitor: CompetitorData | null
  onPage: OnPageAudit | null
  technical: TechnicalAudit | null
}) {
  if (!competitor) {
    return (
      <div className="glass rounded-xl p-10 text-center">
        <p className="text-4xl mb-4">⚔️</p>
        <h3 className="font-semibold text-lg mb-2">Analyse concurrentielle non disponible</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Relancez un audit et ajoutez l'URL d'un concurrent dans les "Options avancées" du formulaire.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-1">⚔️ Comparaison avec le concurrent</h3>
        <p className="text-sm text-muted-foreground mb-4">{competitor.url}</p>

        <div className="grid grid-cols-3 gap-4 mb-4 text-xs font-semibold">
          <span className="text-muted-foreground">Critère</span>
          <span className="text-center text-cyan-400">Votre site</span>
          <span className="text-center text-muted-foreground">Concurrent</span>
        </div>

        <CompareRow label="Title" yours={onPage?.title || '—'} theirs={competitor.title || '—'} />
        <CompareRow label="Longueur title" yours={`${onPage?.titleLength || 0} car.`} theirs={`${competitor.title?.length || 0} car.`} />
        <CompareRow label="Nombre de mots" yours={`${onPage?.wordCount || 0}`} theirs={`${competitor.wordCount}`} />
        <CompareRow label="H1" yours={onPage?.h1?.[0] || '—'} theirs={competitor.h1?.[0] || '—'} />
        <CompareRow label="HTTPS" yours={technical?.isHttps ? '✅ Oui' : '❌ Non'} theirs={competitor.isHttps ? '✅ Oui' : '❌ Non'} />
        <CompareRow label="Meta description" yours={onPage?.metaDescription ? `${onPage.metaDescriptionLength} car.` : '❌ Absente'} theirs={competitor.metaDescription ? `${competitor.metaDescription.length} car.` : '❌ Absente'} />
      </div>

      {/* Insights */}
      <div className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4">💡 Insights</h3>
        <div className="space-y-3">
          {(onPage?.wordCount || 0) < competitor.wordCount && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
              <span className="text-amber-400 font-medium">⚠ Contenu</span>
              <p className="text-muted-foreground mt-1">Votre concurrent a {competitor.wordCount - (onPage?.wordCount||0)} mots de plus. Enrichissez votre contenu.</p>
            </div>
          )}
          {(onPage?.wordCount || 0) > competitor.wordCount && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm">
              <span className="text-emerald-400 font-medium">✓ Contenu</span>
              <p className="text-muted-foreground mt-1">Votre contenu est plus riche ({(onPage?.wordCount||0) - competitor.wordCount} mots de plus).</p>
            </div>
          )}
          {!competitor.isHttps && technical?.isHttps && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm">
              <span className="text-emerald-400 font-medium">✓ Sécurité</span>
              <p className="text-muted-foreground mt-1">Vous êtes en HTTPS, votre concurrent non. Avantage SEO pour vous.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
