import { customAlphabet } from "nanoid"
import { ApiKey, Plan } from "./models"
import { API_KEY_PREFIX } from "./config"

const genId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 25)
export const generateKey = () => API_KEY_PREFIX + genId()

async function planDefaults(planId: string) {
    const p = await Plan.findOne({ id: planId }).lean<any>()
    if (p) return { dailyLimit: p.dailyLimit, monthlyLimit: p.monthlyLimit, rateLimitPerMin: p.rateLimitPerMin }
    const fb: any = {
        free: { dailyLimit: 100, monthlyLimit: 1000, rateLimitPerMin: 20 },
        basic: { dailyLimit: 1000, monthlyLimit: 20000, rateLimitPerMin: 60 },
        premium: { dailyLimit: 10000, monthlyLimit: 300000, rateLimitPerMin: 120 },
        enterprise: { dailyLimit: 100000, monthlyLimit: 5000000, rateLimitPerMin: 600 }
    }
    return fb[planId] || fb.free
}

export async function createApiKey(opts: any = {}) {
    const plan = opts.plan || "free"
    const d = await planDefaults(plan)
    return ApiKey.create({
        key: generateKey(),
        name: opts.name || `${plan} key`,
        user: opts.userId || null,
        plan,
        dailyLimit: opts.dailyLimit ?? d.dailyLimit,
        monthlyLimit: opts.monthlyLimit ?? d.monthlyLimit,
        rateLimitPerMin: opts.rateLimitPerMin ?? d.rateLimitPerMin,
        whitelistIp: opts.whitelistIp || [],
        expiredAt: opts.days ? new Date(Date.now() + opts.days * 86400000) : null,
        usageDayStamp: new Date().toISOString().slice(0, 10),
        usageMonthStamp: new Date().toISOString().slice(0, 7)
    })
}

/** Pastikan user punya minimal 1 key (auto-generate saat login pertama). */
export async function ensureUserKey(userId: any, plan = "free") {
    const existing = await ApiKey.findOne({ user: userId })
    if (existing) return existing
    return createApiKey({ userId, plan, name: "Default Key" })
}
