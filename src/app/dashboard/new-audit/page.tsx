import { NewAuditForm } from '@/components/audit/new-audit-form'

export default function NewAuditPage() {
  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-2" style={{fontFamily:'Space Grotesk'}}>Nouvel Audit SEO</h1>
      <p className="text-muted-foreground mb-8">Entrez une URL et optionnellement sélectionnez votre propriété Search Console.</p>
      <div className="glass rounded-2xl p-8">
        <NewAuditForm />
      </div>
    </div>
  )
}
