'use client'
import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    name: 'Gratuit',
    price: { monthly: 0, annual: 0 },
    description: 'Pour découvrir et tester',
    cta: 'Commencer gratuitement',
    ctaHref: '/auth/signin',
    highlight: false,
    badge: null,
    color: 'border-white/8',
    features: [
      { label: 'Audits SEO / mois', value: '3' },
      { label: 'Analyse technique', value: '✓' },
      { label: 'Analyse on-page', value: '✓' },
      { label: 'Score SEO /100', value: '✓' },
      { label: 'Core Web Vitals', value: '✓' },
      { label: 'Search Console', value: '✗' },
      { label: 'Recommandations', value: '5 max' },
      { label: 'Historique', value: '7 jours' },
      { label: 'Export PDF', value: '✗' },
      { label: 'Support', value: 'Email' },
    ],
  },
  {
    name: 'Starter',
    price: { monthly: 19, annual: 15 },
    description: 'Pour les indépendants et freelances',
    cta: 'Choisir Starter',
    ctaHref: '/auth/signin',
    highlight: true,
    badge: 'Populaire',
    color: 'border-cyan-500/50',
    features: [
      { label: 'Audits SEO / mois', value: '30' },
      { label: 'Analyse technique', value: '✓' },
      { label: 'Analyse on-page', value: '✓' },
      { label: 'Score SEO /100', value: '✓' },
      { label: 'Core Web Vitals', value: '✓' },
      { label: 'Search Console', value: '✓' },
      { label: 'Recommandations', value: 'Illimitées' },
      { label: 'Historique', value: '90 jours' },
      { label: 'Export PDF', value: '✓' },
      { label: 'Support', value: 'Prioritaire' },
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 49, annual: 39 },
    description: 'Pour les agences et équipes',
    cta: 'Choisir Pro',
    ctaHref: '/auth/signin',
    highlight: false,
    badge: null,
    color: 'border-white/8',
    features: [
      { label: 'Audits SEO / mois', value: 'Illimités' },
      { label: 'Analyse technique', value: '✓' },
      { label: 'Analyse on-page', value: '✓' },
      { label: 'Score SEO /100', value: '✓' },
      { label: 'Core Web Vitals', value: '✓' },
      { label: 'Search Console', value: '✓' },
      { label: 'Recommandations', value: 'Illimitées' },
      { label: 'Historique', value: 'Illimité' },
      { label: 'Export PDF', value: '✓' },
      { label: 'Support', value: 'Dédié 24/7' },
    ],
  },
]

const tableFeatures = [
  { label: 'Audits / mois', values: ['3', '30', 'Illimités'] },
  { label: 'Analyse technique', values: ['✓', '✓', '✓'] },
  { label: 'Analyse on-page', values: ['✓', '✓', '✓'] },
  { label: 'Score SEO /100', values: ['✓', '✓', '✓'] },
  { label: 'Core Web Vitals', values: ['✓', '✓', '✓'] },
  { label: 'Google Search Console', values: ['✗', '✓', '✓'] },
  { label: 'Top mots-clés & pages', values: ['✗', '✓', '✓'] },
  { label: 'Graphique de performance', values: ['✗', '✓', '✓'] },
  { label: 'Recommandations priorisées', values: ['5 max', 'Illimitées', 'Illimitées'] },
  { label: 'Historique des audits', values: ['7 jours', '90 jours', 'Illimité'] },
  { label: 'Export PDF', values: ['✗', '✓', '✓'] },
  { label: 'Multi-sites', values: ['1', '5', 'Illimités'] },
  { label: 'Support', values: ['Email', 'Prioritaire', 'Dédié 24/7'] },
]

const faqs = [
  { q: 'Est-ce que les données Search Console sont vraiment en temps réel ?', a: 'Oui. Nous connectons directement votre compte Google via OAuth2 et interrogeons l\'API Search Console officielle. Vous voyez vos vraies données : clics, impressions, CTR et positions moyennes des 90 derniers jours.' },
  { q: 'Puis-je auditer n\'importe quel site ?', a: 'Vous pouvez auditer n\'importe quelle URL publiquement accessible. Pour les données Search Console, le site doit être vérifié dans votre compte Google Search Console.' },
  { q: 'Comment fonctionne l\'essai gratuit ?', a: 'Le plan gratuit est permanent, pas un essai limité dans le temps. Vous avez 3 audits par mois sans jamais entrer de carte bancaire.' },
  { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader à tout moment. La facturation est calculée au prorata.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Absolument. Nous utilisons OAuth2 Google (lecture seule) et ne stockons jamais vos mots de passe. Toutes les données sont chiffrées en transit et au repos.' },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)

  return (
    <div className="min-h-screen bg-[#080C14] text-white" style={{fontFamily:"'DM Sans', sans-serif"}}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-xl bg-[#080C14]/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#080C14]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <span className="font-bold text-lg tracking-tight">SEOAudit<span className="text-cyan-400">Pro</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="/#features" className="hover:text-white transition-colors">Fonctionnalités</Link>
          <Link href="/pricing" className="text-white">Tarifs</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/signin" className="text-sm text-white/60 hover:text-white transition-colors">Connexion</Link>
          <Link href="/auth/signin" className="text-sm bg-cyan-500 text-[#080C14] font-semibold px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors">
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="relative pt-36 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/6 rounded-full blur-[100px]"/>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"/>
        <div className="relative z-10">
          <p className="text-cyan-400 text-sm font-medium mb-4 tracking-widest uppercase">Tarifs</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Un plan pour<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">chaque ambition</span>
          </h1>
          <p className="text-white/40 text-lg mb-10">Commencez gratuitement. Aucune carte bancaire requise.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/8 rounded-full p-1">
            <button onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-white text-[#080C14]' : 'text-white/50 hover:text-white'}`}>
              Mensuel
            </button>
            <button onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-white text-[#080C14]' : 'text-white/50 hover:text-white'}`}>
              Annuel
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${annual ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/50'}`}>-20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={plan.name}
              className={`relative bg-white/2 border-2 ${plan.color} rounded-2xl p-8 flex flex-col ${plan.highlight ? 'shadow-[0_0_40px_rgba(6,182,212,0.15)]' : ''}`}
              style={{animationDelay:`${i*0.1}s`}}>

              {plan.highlight && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"/>
              )}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-[#080C14] text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="relative z-10">
                <p className="text-white/50 text-sm font-medium mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black">
                    {plan.price[annual ? 'annual' : 'monthly'] === 0 ? 'Gratuit' : `${plan.price[annual ? 'annual' : 'monthly']}€`}
                  </span>
                  {plan.price[annual ? 'annual' : 'monthly'] > 0 && (
                    <span className="text-white/30 mb-2">/mois</span>
                  )}
                </div>
                {annual && plan.price.annual > 0 && (
                  <p className="text-white/30 text-xs mb-1">Facturé {plan.price.annual * 12}€/an</p>
                )}
                <p className="text-white/40 text-sm mb-8">{plan.description}</p>

                <Link href={plan.ctaHref}
                  className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] mb-8 ${
                    plan.highlight
                      ? 'bg-cyan-500 text-[#080C14] hover:bg-cyan-400'
                      : 'bg-white/8 text-white hover:bg-white/15 border border-white/10'
                  }`}>
                  {plan.cta}
                </Link>

                <div className="space-y-3">
                  {plan.features.map(f => (
                    <div key={f.label} className="flex items-center justify-between text-sm">
                      <span className="text-white/50">{f.label}</span>
                      <span className={`font-medium ${f.value === '✓' ? 'text-emerald-400' : f.value === '✗' ? 'text-white/20' : 'text-white'}`}>
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Comparaison détaillée</h2>
          <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left p-5 text-white/40 font-medium w-1/2">Fonctionnalité</th>
                  {['Gratuit','Starter','Pro'].map((p, i) => (
                    <th key={p} className={`p-5 text-center font-bold ${i===1?'text-cyan-400':''}`}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableFeatures.map((f, i) => (
                  <tr key={f.label} className={`border-b border-white/4 last:border-0 ${i%2===0?'':'bg-white/1'}`}>
                    <td className="p-5 text-white/60">{f.label}</td>
                    {f.values.map((v, j) => (
                      <td key={j} className={`p-5 text-center font-medium ${v==='✓'?'text-emerald-400':v==='✗'?'text-white/15':j===1?'text-white':'text-white/70'}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-white/30 text-sm mt-6">
            Besoin de plus ? <Link href="#" className="text-cyan-400 hover:underline">Contactez-nous pour un plan sur mesure.</Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 pb-32">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="px-4 pb-32">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl p-16">
          <h2 className="text-4xl font-black mb-4">Commencez aujourd'hui</h2>
          <p className="text-white/40 mb-8">3 audits gratuits. Aucune carte bancaire.</p>
          <Link href="/auth/signin"
            className="inline-flex items-center gap-2 bg-cyan-500 text-[#080C14] px-10 py-4 rounded-xl font-bold hover:bg-cyan-400 transition-all hover:scale-[1.02]">
            Démarrer gratuitement →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-8 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#080C14]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <span className="font-bold text-sm">SEOAudit<span className="text-cyan-400">Pro</span></span>
          </div>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="/auth/signin" className="hover:text-white transition-colors">Connexion</Link>
          </div>
          <p className="text-white/20 text-sm">© 2026 SEOAudit Pro</p>
        </div>
      </footer>

    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white/2 border border-white/6 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors">
        <span className="font-semibold text-sm pr-4">{q}</span>
        <span className={`text-cyan-400 text-xl flex-shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}
