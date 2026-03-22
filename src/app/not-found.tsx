import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl font-bold text-primary mb-4" style={{fontFamily:'Space Grotesk'}}>404</p>
        <p className="text-xl font-semibold mb-2">Page introuvable</p>
        <p className="text-muted-foreground mb-8">Cette page n'existe pas ou a été déplacée.</p>
        <Link href="/dashboard" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Retour au dashboard
        </Link>
      </div>
    </div>
  )
}
