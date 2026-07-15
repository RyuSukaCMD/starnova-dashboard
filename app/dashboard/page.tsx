import { redirect } from "next/navigation"
import { currentUser } from "@/lib/session"
import { ApiKey, RequestLog } from "@/lib/models"
import { PageTransition } from "@/components/ui/Motion"
import DashboardClient from "@/components/dashboard/DashboardClient"

export const metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    // Auth + data DI SERVER (server-first, bukan useEffect di browser).
    const user = await currentUser()
    if (!user) redirect("/login?callbackUrl=/dashboard")

    const keys = await ApiKey.find({ user: user._id }).sort({ createdAt: -1 }).lean<any[]>()
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
        if (d in chart) chart[d] += 1
        top[l.endpoint] = (top[l.endpoint] || 0) + 1
    }
    const recent = await RequestLog.find({ user: user._id }).sort({ at: -1 }).limit(10).lean<any[]>()

    const initial = {
        user: { name: user.name, email: user.email, plan: user.plan, image: user.image || "", role: user.role },
        totalRequest,
        dailyUsed,
        dailyLimit,
        remaining: Math.max(0, dailyLimit - dailyUsed),
        keyCount: keys.length,
        expiredDate: nearest?.expiredAt ? new Date(nearest.expiredAt).toISOString() : null,
        chart: Object.entries(chart).map(([date, count]) => ({ date, count })),
        topEndpoint: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([endpoint, count]) => ({ endpoint, count })),
        recent: recent.map((r) => ({ endpoint: r.endpoint, method: r.method, status: r.status, responseTime: r.responseTime, at: new Date(r.at).toISOString() })),
        keys: keys.map((k) => ({
            key: k.key, name: k.name, plan: k.plan, status: k.status,
            usageDaily: k.usageDaily, dailyLimit: k.dailyLimit,
            usageMonthly: k.usageMonthly, monthlyLimit: k.monthlyLimit,
            usageTotal: k.usageTotal,
            expiredAt: k.expiredAt ? new Date(k.expiredAt).toISOString() : null,
            lastUsed: k.lastUsed ? new Date(k.lastUsed).toISOString() : null
        }))
    }

    return (
        <PageTransition>
            <DashboardClient initial={initial} />
        </PageTransition>
    )
}
