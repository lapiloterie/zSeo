import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
const g = global as typeof globalThis & { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }
if (!g.mongoose) g.mongoose = { conn: null, promise: null }

export async function connectDB() {
  if (g.mongoose.conn) return g.mongoose.conn
  if (!g.mongoose.promise) {
    g.mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    })
  }
  g.mongoose.conn = await g.mongoose.promise
  return g.mongoose.conn
}

const AuditSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  status: { type: String, default: 'pending' },
  score: { type: Number, default: null },
  scoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: null },
  technicalData: { type: mongoose.Schema.Types.Mixed, default: null },
  onPageData: { type: mongoose.Schema.Types.Mixed, default: null },
  gscData: { type: mongoose.Schema.Types.Mixed, default: null },
  recommendations: { type: mongoose.Schema.Types.Mixed, default: null },
  checklist: { type: mongoose.Schema.Types.Mixed, default: null },
  competitorData: { type: mongoose.Schema.Types.Mixed, default: null },
  // New v3
  urlAnalysis: { type: mongoose.Schema.Types.Mixed, default: null },
  imagePerformance: { type: mongoose.Schema.Types.Mixed, default: null },
  techStack: { type: mongoose.Schema.Types.Mixed, default: null },
  eeatScore: { type: mongoose.Schema.Types.Mixed, default: null },
  keywordAnalysis: { type: mongoose.Schema.Types.Mixed, default: null },
  crawlResults: { type: mongoose.Schema.Types.Mixed, default: null },
  // Options
  targetKeyword: { type: String, default: null },
  targetLang: { type: String, default: 'fr' },
  device: { type: String, default: 'mobile' },
  crawlDepth: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
})

export const Audit = mongoose.models.Audit || mongoose.model('Audit', AuditSchema)
