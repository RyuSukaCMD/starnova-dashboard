// Seed plans + set admin. Jalankan: MONGODB_URI="..." node scripts/seed.mjs
import mongoose from "mongoose"

const uri = process.env.MONGODB_URI
if (!uri) {
    console.error("❌ MONGODB_URI belum di-set.")
    process.exit(1)
}
await mongoose.connect(uri)
const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false, timestamps: true }))
const Settings = mongoose.model("Settings", new mongoose.Schema({}, { strict: false, timestamps: true }))

const PLANS = [
    { id: "free", name: "Free", price: 0, dailyLimit: 100, monthlyLimit: 1000, rateLimitPerMin: 20, support: "Community", order: 1 },
    { id: "basic", name: "Basic", price: 25000, dailyLimit: 1000, monthlyLimit: 20000, rateLimitPerMin: 60, support: "Email", order: 2 },
    { id: "premium", name: "Premium", price: 75000, dailyLimit: 10000, monthlyLimit: 300000, rateLimitPerMin: 120, support: "Priority", order: 3 },
    { id: "enterprise", name: "Enterprise", price: 300000, dailyLimit: 100000, monthlyLimit: 5000000, rateLimitPerMin: 600, support: "Dedicated", order: 4 }
]
for (const p of PLANS) await Plan.findOneAndUpdate({ id: p.id }, p, { upsert: true })
await Settings.findOneAndUpdate({ key: "global" }, { key: "global" }, { upsert: true })
console.log("✅ Seed selesai (plans + settings).")
console.log("ℹ️  Admin ditentukan lewat env ADMIN_EMAILS (comma-separated) — user jadi admin otomatis saat login.")
process.exit(0)
