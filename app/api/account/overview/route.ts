import { NextResponse } from "next/server"
import { currentUser } from "@/lib/session"
import { ApiKey, RequestLog } from "@/lib/models"

export const dynamic = "force-dynamic"

export async function GET() {
    const user = await currentUser()
    if (!user) return NextResponse.json({ status: false, message: "Belum login." }, { status: 401 })

    const keys = await ApiKey.find({ user: user._id }).lean<any[]>()
    const totalRequest = keys.reduce((s, k) => s + (k.usageTotal || 0), 0)
    const dailyUsed = keys.reduce((s, k) => s + (k.usageDaily || 0), 0)
    const dailyLimit = keys.reduce((s, k) => s + (k.dailyLimit || 0), 0)
    const nearest = keys.filter((k) => k.expiredAt).sort((a, b) => +new Date(a.expiredAt) - +new Date(b.expiredAt))[0]

    const since = new Date(Date.now() - 7 * 86400000)
    const logs = await RequestLog.find({ user: user._id, at: { $gte: since } }).lean<any[]>()
    const chart: Record<string, number> = {}
    const top: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) chart[new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)] = 0
    for (const l of logs) {
        const d = new Date(l.at).toISOString().slice(0, 10)
        chart[d] = (chart[d] || 0) + 1
        top[l.endpoint] = (top[l.endpoint] || 0) + 1
    }
    const recent = await RequestLog.find({ user: user._id }).sort({ at: -1 }).limit(12).lean<any[]>()

    return NextResponse.json({
        status: true,
        result: {
            user: { name: user.name, email: user.email, plan: user.plan, image: user.image, role: user.role },
            totalRequest,
            dailyUsed,
            dailyLimit,
            remaining: Math.max(0, dailyLimit - dailyUsed),
            keys: keys.length,
            expiredDate: nearest?.expiredAt || null,
            chart: Object.entries(chart).map(([date, count]) => ({ date, count })),
            topEndpoint: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([endpoint, count]) => ({ endpoint, count })),
            recent: recent.map((r) => ({ endpoint: r.endpoint, method: r.method, status: r.status, responseTime: r.responseTime, at: r.at }))
        }
    })
}
