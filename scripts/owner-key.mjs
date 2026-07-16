// ═══════════════════════════════════════════════════════════
//  BUAT / TAMPILKAN OWNER API KEY (limit TAK TERBATAS)
//
//  Key ini dipakai oleh bot WhatsApp Chaeul (owner) agar bisa
//  memanggil endpoint StarNova tanpa batas harian/bulanan/rate.
//
//  Cara pakai:
//    MONGODB_URI="mongodb+srv://..." node scripts/owner-key.mjs
//
//  Opsional:
//    OWNER_KEY_NAME="Chaeul Bot Owner"   node scripts/owner-key.mjs
//    RESET=1   node scripts/owner-key.mjs   # buat key baru (key lama di-nonaktifkan)
//
//  Cara kerja "unlimited": runner menganggap limit bernilai 0 sebagai
//  TANPA BATAS (if (keyDoc.dailyLimit && ...)). Jadi owner key dibuat
//  dengan dailyLimit=0, monthlyLimit=0, rateLimitPerMin=0, plan="owner".
// ═══════════════════════════════════════════════════════════
import mongoose from "mongoose"
import { customAlphabet } from "nanoid"

const uri = process.env.MONGODB_URI
if (!uri) {
    console.error("❌ MONGODB_URI belum di-set.")
    process.exit(1)
}
const PREFIX = "snv_"
const genId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 25)
const NAME = process.env.OWNER_KEY_NAME || "Chaeul Bot Owner (Unlimited)"

await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })

const ApiKey = mongoose.model("ApiKey", new mongoose.Schema({}, { strict: false, timestamps: true }))
const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false, timestamps: true }))

// Pastikan plan "owner" ada (limit 0 = unlimited) untuk kerapihan dashboard.
await Plan.findOneAndUpdate(
    { id: "owner" },
    {
        id: "owner",
        name: "Owner (Unlimited)",
        price: 0,
        dailyLimit: 0,
        monthlyLimit: 0,
        rateLimitPerMin: 0,
        support: "Owner",
        features: ["Akses tak terbatas", "Semua endpoint", "Tanpa rate limit"],
        order: 99
    },
    { upsert: true }
)

// Cari owner key yang sudah ada & masih aktif.
let existing = await ApiKey.findOne({ plan: "owner", status: "active" }).sort({ createdAt: -1 })

if (existing && !process.env.RESET) {
    console.log("\n✅ Owner key SUDAH ada (pakai RESET=1 untuk buat baru):\n")
    console.log("   " + existing.key + "\n")
    console.log("   name        :", existing.name)
    console.log("   dailyLimit  :", existing.dailyLimit, "(0 = unlimited)")
    console.log("   monthlyLimit:", existing.monthlyLimit, "(0 = unlimited)")
    console.log("   usageTotal  :", existing.usageTotal || 0)
    printUsage(existing.key)
    process.exit(0)
}

if (existing && process.env.RESET) {
    existing.status = "disabled"
    await existing.save()
    console.log("♻️  Owner key lama di-nonaktifkan:", existing.key)
}

const key = PREFIX + genId()
const now = new Date()
await ApiKey.create({
    key,
    name: NAME,
    user: null,
    plan: "owner",
    status: "active",
    dailyLimit: 0, // 0 = TANPA BATAS
    monthlyLimit: 0, // 0 = TANPA BATAS
    rateLimitPerMin: 0, // 0 = TANPA BATAS
    usageDaily: 0,
    usageMonthly: 0,
    usageTotal: 0,
    whitelistIp: [],
    expiredAt: null,
    usageDayStamp: now.toISOString().slice(0, 10),
    usageMonthStamp: now.toISOString().slice(0, 7)
})

console.log("\n✅ Owner API key (UNLIMITED) berhasil dibuat:\n")
console.log("   " + key + "\n")
printUsage(key)
process.exit(0)

function printUsage(k) {
    console.log("── Cara pakai di web sewa bot (chaeul-web-vercel) ──")
    console.log("   Set env di Vercel:")
    console.log("     BOT_API_BASEURL = https://dash.starnova.my.id")
    console.log("     BOT_API_KEY     = " + k)
    console.log("   Lalu REDEPLOY. Bot berlisensi aktif otomatis menerima key ini.\n")
}
