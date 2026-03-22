# 🔍 SEOAudit Pro — SaaS d'Audit SEO Automatisé

Application web complète d'audit SEO avec intégration Google Search Console.

## 🛠️ Stack Technique
- **Frontend** : Next.js 14 (App Router, React 18)
- **Backend** : API Routes Next.js (Node.js)
- **Base de données** : PostgreSQL + Prisma ORM
- **Auth** : NextAuth v5 (Google OAuth2)
- **Scraping/Analyse** : Cheerio + Axios
- **APIs** : Google Search Console, Google PageSpeed Insights
- **UI** : Tailwind CSS + Recharts

## 🚀 Installation & Lancement

### 1. Prérequis
- Node.js >= 18
- PostgreSQL (local ou cloud, ex: Supabase / Railway)

### 2. Cloner & installer
```bash
cd seo-audit-saas
npm install
```

### 3. Variables d'environnement
```bash
cp .env.example .env
```
Remplissez `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/seo_audit_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générez avec: openssl rand -base64 32"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_PAGESPEED_API_KEY="..."
```

### 4. Configurer Google Cloud Console
1. Allez sur https://console.cloud.google.com
2. Créez un projet
3. Activez ces APIs :
   - **Google Search Console API**
   - **PageSpeed Insights API**
4. Créez des identifiants OAuth2 (Application Web)
5. Ajoutez l'URI de redirection : `http://localhost:3000/api/auth/callback/google`
6. Copiez Client ID et Client Secret dans `.env`

### 5. Base de données
```bash
# Créer la base de données PostgreSQL
createdb seo_audit_db

# Appliquer le schéma Prisma
npm run db:push

# (Optionnel) Interface graphique Prisma
npm run db:studio
```

### 6. Lancer en développement
```bash
npm run dev
```
Ouvrez http://localhost:3000

## 📁 Structure du projet
```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── audit/               # POST créer, GET lister
│   │   │   └── [id]/            # GET résultat par ID
│   │   └── gsc/                 # GET sites Search Console
│   ├── auth/signin/             # Page connexion Google
│   ├── dashboard/
│   │   ├── audit/[id]/          # Page résultat audit
│   │   ├── history/             # Historique audits
│   │   └── new-audit/           # Formulaire nouvel audit
│   ├── layout.tsx
│   └── page.tsx                 # Landing page
├── components/
│   ├── audit/                   # Composants résultat
│   │   ├── audit-result-client.tsx
│   │   ├── gsc-tab.tsx
│   │   ├── new-audit-form.tsx
│   │   ├── onpage-tab.tsx
│   │   ├── recommendations-tab.tsx
│   │   ├── score-gauge.tsx
│   │   └── technical-tab.tsx
│   ├── dashboard/               # Layout dashboard
│   │   ├── dashboard-client.tsx
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   └── providers/
│       └── session-provider.tsx
├── lib/
│   ├── auth.ts                  # Config NextAuth
│   ├── db.ts                    # Client Prisma
│   ├── gsc.ts                   # Google Search Console API
│   ├── seo-analyzer.ts          # Moteur d'analyse SEO
│   └── utils.ts                 # Utilitaires
├── types/
│   └── index.ts                 # Types TypeScript
└── prisma/
    └── schema.prisma            # Schéma base de données
```

## ⚙️ Fonctionnalités

### Analyse Technique
- Vérification HTTPS
- Détection sitemap.xml & robots.txt
- Score PageSpeed (Desktop + Mobile)
- Core Web Vitals (LCP, FCP, CLS, TTFB)

### Analyse On-Page
- Balise Title (longueur + contenu)
- Meta Description
- Structure H1/H2/H3
- Comptage mots
- Images sans attribut ALT
- Liens internes/externes
- Données structurées JSON-LD
- Open Graph tags

### Google Search Console (données réelles)
- Clics, impressions, CTR, position moyenne
- Top 25 mots-clés
- Top 10 pages
- Graphique performance 30 jours

### Score & Recommandations
- Score global sur 100 (pondéré)
- Recommandations priorisées (haute/moyenne/faible)
- Suggestions basées sur données GSC réelles
- Opportunités CTR et positions

## 🔄 Flux de l'audit
1. Utilisateur soumet URL → POST /api/audit
2. Record créé en DB (status: pending)
3. Analyse asynchrone lancée :
   - analyzeOnPage() → Cheerio scraping
   - analyzeTechnical() → PageSpeed API + vérifications
   - fetchGSCData() → Search Console API
4. Scores calculés, recommandations générées
5. DB mise à jour (status: completed)
6. Frontend poll toutes les 3s jusqu'à completion

## 🚀 Déploiement Production
```bash
# Build
npm run build

# Variables env production
NEXTAUTH_URL=https://votre-domaine.com
DATABASE_URL=postgresql://...  # Supabase, Railway, Neon...

# Start
npm start
```

Hébergement recommandé : **Vercel** (Next.js natif) + **Supabase** (PostgreSQL gratuit)
