import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#080C14] text-white overflow-x-hidden" style={{fontFamily:"'DM Sans', sans-serif"}}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-xl bg-[#080C14]/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#080C14]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <span className="font-bold text-lg tracking-tight">zSEO <span className="text-cyan-400">Pro</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/signin" className="text-sm text-white/60 hover:text-white transition-colors">Connexion</Link>
          <Link href="/auth/signin" className="text-sm bg-cyan-500 text-[#080C14] font-semibold px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors">
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-600/6 rounded-full blur-[80px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
            Données Google Search Console en temps réel
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            Auditez votre SEO<br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">avec les vraies données</span>
            </span><br />
            Google
          </h1>

          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connectez Search Console et obtenez en 60 secondes un audit complet : score SEO, Core Web Vitals, opportunités de mots-clés et recommandations priorisées.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signin"
              className="group inline-flex items-center gap-3 bg-cyan-500 text-[#080C14] px-8 py-4 rounded-xl font-bold text-base hover:bg-cyan-400 transition-all hover:scale-[1.02] active:scale-95">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Commencer gratuitement
            </Link>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 border border-white/10 text-white/70 px-8 py-4 rounded-xl font-semibold text-base hover:border-white/20 hover:text-white transition-all">
              Voir les tarifs →
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[['500+','Sites audités'],['98%','Satisfaction'],['60s','Temps d\'analyse'],['100%','Données réelles']].map(([n,l]) => (
              <div key={l}>
                <div className="text-2xl font-black text-cyan-400">{n}</div>
                <div className="text-xs text-white/40 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard */}
        <div className="relative z-10 mt-20 w-full max-w-5xl mx-auto">
          <div className="bg-[#0D1421] border border-white/8 rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-xs text-white/30">https://votresite.com — Audit SEO</div>
            </div>
            <div className="p-6 grid grid-cols-5 gap-4">
              <div className="col-span-1 flex flex-col items-center justify-center bg-white/3 rounded-xl p-4">
                <svg viewBox="0 0 96 96" width="80" height="80" className="-rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#06b6d4" strokeWidth="8" strokeDasharray="251" strokeDashoffset="45" strokeLinecap="round"/>
                </svg>
                <span className="text-3xl font-black text-cyan-400 -mt-12 relative z-10">82</span>
                <span className="text-xs text-white/40 mt-8">Score Global</span>
              </div>
              {[['Technique','100','#10b981'],['On-Page','80','#06b6d4'],['Performance','75','#f59e0b'],['Search Console','85','#8b5cf6']].map(([l,s,c]) => (
                <div key={l} className="bg-white/3 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{color:c}}>{s}</span>
                  <span className="text-xs text-white/40 mt-1 text-center">{l}</span>
                  <div className="w-full bg-white/5 rounded-full h-1 mt-2">
                    <div className="h-1 rounded-full" style={{width:`${s}%`,background:c}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-4 relative">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <p className="text-cyan-400 text-sm font-medium mb-4 tracking-widest uppercase">Fonctionnalités</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Tout ce dont vous avez besoin<br /><span className="text-white/30">pour dominer Google</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:'⚡',title:'Analyse Technique',desc:'HTTPS, sitemap, robots.txt, Core Web Vitals, PageSpeed Score desktop et mobile.',color:'from-cyan-500/20 to-transparent'},
              {icon:'📝',title:'SEO On-Page',desc:'Title, meta description, structure H1-H3, mots, images sans ALT, données structurées.',color:'from-blue-500/20 to-transparent'},
              {icon:'📊',title:'Search Console Réelle',desc:'Clics, impressions, CTR, positions moyennes, top mots-clés et pages directement depuis Google.',color:'from-violet-500/20 to-transparent'},
              {icon:'🎯',title:'Score sur 100',desc:'Score global pondéré basé sur 4 dimensions : technique, on-page, performance et GSC.',color:'from-amber-500/20 to-transparent'},
              {icon:'💡',title:'Recommandations IA',desc:'Pour chaque problème détecté : explication simple, solution concrète et niveau de priorité.',color:'from-emerald-500/20 to-transparent'},
              {icon:'📈',title:'Historique & Suivi',desc:'Conservez tous vos audits, suivez l\'évolution de votre score dans le temps.',color:'from-pink-500/20 to-transparent'},
            ].map(f => (
              <div key={f.title} className="group relative bg-white/2 border border-white/6 rounded-2xl p-6 hover:border-white/15 transition-all hover:-translate-y-1">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`}/>
                <div className="relative z-10">
                  <span className="text-3xl mb-4 block">{f.icon}</span>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-4 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-white/30 text-sm mb-10 uppercase tracking-widest">Ils nous font confiance</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {name:'Marie D.', role:'Responsable SEO', text:'Les recommandations basées sur les données GSC réelles ont transformé notre stratégie. +40% de trafic en 3 mois.'},
              {name:'Thomas R.', role:'Fondateur, Agence Web', text:'Je l\'utilise pour tous mes clients. Le score /100 et les priorités hautes sont parfaits pour convaincre les décideurs.'},
              {name:'Sarah L.', role:'E-commerce Manager', text:'Enfin un outil qui connecte vraiment Search Console. On voit exactement quels mots-clés optimiser en priorité.'},
            ].map(t => (
              <div key={t.name} className="bg-white/2 border border-white/6 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PRICING */}
      <section className="py-32 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/6 rounded-full blur-[100px]"/>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Prêt à booster votre SEO ?</h2>
          <p className="text-white/40 text-lg mb-10">Commencez gratuitement. Aucune carte bancaire requise.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin"
              className="inline-flex items-center gap-2 bg-cyan-500 text-[#080C14] px-8 py-4 rounded-xl font-bold hover:bg-cyan-400 transition-all hover:scale-[1.02]">
              Commencer gratuitement →
            </Link>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 border border-white/10 px-8 py-4 rounded-xl font-semibold text-white/70 hover:text-white hover:border-white/20 transition-all">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-8 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#080C14]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <span className="font-bold text-sm">zSEO<span className="text-cyan-400">Pro</span></span>
          </div>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="/auth/signin" className="hover:text-white transition-colors">Connexion</Link>
            <Link href="#" className="hover:text-white transition-colors">CGU</Link>
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
          </div>
          <p className="text-white/20 text-sm">© 2026 zSEO Pro</p>
        </div>
      </footer>

    </div>
  )
}
