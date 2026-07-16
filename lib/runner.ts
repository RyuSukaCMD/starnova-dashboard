import { connectDB, dbReady } from "./mongo"
import { ApiKey, RequestLog, Settings } from "./models"
import { getEndpoint } from "./registry"
import { STANDARD_CREATOR } from "./config"

const today = () => new Date().toISOString().slice(0, 10)
const month = () => new Date().toISOString().slice(0, 7)

export type RunResult = { status: number; body: any }

/**
 * Validasi API key + jalankan endpoint. Dipakai oleh route /api/v1/[...].
 * Mengembalikan { status, body } dengan format standar.
 */
export async function runApiRequest(
    path: string,
    params: Record<string, any>,
    ctx: { apiKey?: string; ip?: string; userAgent?: string }
): Promise<RunResult> {
    const started = Date.now()
    const err = (code: number, message: string): RunResult => ({
        status: code,
        body: { status: false, message, creator: STANDARD_CREATOR }
    })

    const ep = getEndpoint(path)
    if (!ep) return err(404, "Endpoint tidak ditemukan.")

    // Tunggu koneksi DB benar-benar siap. Andalkan hasil connectDB() (bukan
    // hanya dbReady() yang bisa race), lalu cek juga readyState.
    let conn: any = null
    let dbError = ""
    try {
        conn = await connectDB()
    } catch (e: any) {
        dbError = e?.message || String(e)
    }
    const dbUp = !!conn && dbReady()

    if (dbUp) {
        try {
            const s = await Settings.findOne({ key: "global" }).lean<any>()
            if (s?.maintenance) return err(503, "StarNova sedang dalam pemeliharaan.")
        } catch {}
    }

    if (!ctx.apiKey) return err(401, "API Key diperlukan (header 'apikey' atau ?apikey=).")
    if (!dbUp) {
        if (!process.env.MONGODB_URI) return err(503, "Database tidak aktif. Set MONGODB_URI di environment.")
        return err(503, "Gagal terhubung ke database" + (dbError ? ": " + dbError : ". Cek /api/debug/db"))
    }

    const keyDoc = await ApiKey.findOne({ key: ctx.apiKey })
    if (!keyDoc) return err(401, "Invalid API Key")
    if (keyDoc.status !== "active") return err(403, "API Key dinonaktifkan.")
    if (keyDoc.expiredAt && Date.now() > new Date(keyDoc.expiredAt).getTime())
        return err(403, "API Key kadaluarsa.")
    if (keyDoc.whitelistIp?.length && ctx.ip && !keyDoc.whitelistIp.includes(ctx.ip))
        return err(403, "IP tidak diizinkan.")

    // Reset kuota harian/bulanan
    const d = today(),
        m = month()
    if (keyDoc.usageDayStamp !== d) {
        keyDoc.usageDaily = 0
        keyDoc.usageDayStamp = d
    }
    if (keyDoc.usageMonthStamp !== m) {
        keyDoc.usageMonthly = 0
        keyDoc.usageMonthStamp = m
    }
    if (keyDoc.dailyLimit && keyDoc.usageDaily >= keyDoc.dailyLimit)
        return err(429, "Limit harian tercapai.")
    if (keyDoc.monthlyLimit && keyDoc.usageMonthly >= keyDoc.monthlyLimit)
        return err(429, "Limit bulanan tercapai.")

    // Jalankan handler
    let result: any
    let status = 200
    let outBody: any
    try {
        result = await ep.handler(params)
        outBody = { status: true, creator: STANDARD_CREATOR, result }
    } catch (e: any) {
        status = e?.code && Number.isInteger(e.code) ? e.code : 500
        outBody = { status: false, message: e?.message || "Terjadi kesalahan.", creator: STANDARD_CREATOR }
    }

    // Catat pemakaian + log (fire-and-forget)
    keyDoc.usageDaily += 1
    keyDoc.usageMonthly += 1
    keyDoc.usageTotal += 1
    keyDoc.lastUsed = new Date()
    keyDoc.lastIp = ctx.ip || ""
    keyDoc.save().catch(() => {})
    RequestLog.create({
        apiKey: ctx.apiKey,
        user: keyDoc.user,
        endpoint: path,
        method: ep.method,
        status,
        responseTime: Date.now() - started,
        ip: ctx.ip,
        userAgent: ctx.userAgent
    }).catch(() => {})
    Settings.updateOne({ key: "global" }, { $inc: { totalRequestCounter: 1 } }, { upsert: true }).catch(() => {})

    return { status, body: outBody }
}
