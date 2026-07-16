import { redirect } from "next/navigation"
import Link from "next/link"
import { currentUser, sessionEmail } from "@/lib/session"
import { ApiKey, RequestLog } from "@/lib/models"
import { ensureUserKey } from "@/lib/apikey"
import { PageTransition } from "@/components/ui/Motion"
import DashboardClient from "@/components/dashboard/DashboardClient"

export const metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    // 1) Belum login → ke halaman login.
    const email = await sessionEmail()
    if (!email) redirect("/login?callbackUrl=/dashboard")

    // 2) Sudah login tapi DB bermasalah → tampilkan pesan ramah (bukan crash).
    let user: any = null
    try {
        user = await currentUser()
    } catch {
        user = null
    }
    if (!user) {
        return (
            <PageTransition>
                <section className="grid min-h-screen place-items-center px-4">
                    <div className="glass noise max-w-md rounded-2xl p-8 text-center">
                        <h1 className="text-xl font-bold">Dashboard belum siap</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Kamu login sebagai <span className="text-accent">{email}</span>, tapi server belum bisa
                            memuat akun dari database.
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                            Diagnosa koneksi: <Link href="/api/debug/db" className="underline">/api/debug/db</Link>
                        </p>
                        <div className="mt-5 flex justify-center gap-3">
                            <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Coba lagi</Link>
                            <Link href="/" className="rounded-xl px-4 py-2 text-sm text-accent hover:underline">Beranda</Link>
                        </div>
                    </div>
                </section>
            </PageTransition>
        )
    }

    // 3) Ambil data dashboard (semua dibungkus try/catch → tak pernah crash).
    let keys: any[] = []
    let logs: any[] = []
    let recent: any[] = []
    try {
        // pastikan minimal 1 key ada
        if ((await ApiKey.countDocuments({ user: user._id })) === 0) {
            await ensureUserKey(user._id, user.plan || "free")
        }
        keys = await ApiKey.find({ user: user._id }).sort({ createdAt: -1 }).lean<any[]>()
        const since = new Date(Date.now() - 7 * 86400000)
        logs = await RequestLog.find({ user: user._id, at: { $gte: since } }).lean<any[]>()
        recent = await RequestLog.find({ user: user._id }).sort({ at: -1 }).limit(10).lean<any[]>()
    } catch (e) {
        console.error("dashboard data:", (e as any)?.message)
    }

    const totalRequest = keys.reduce((s, k) => s + (k.usageTotal || 0), 0)
    const dailyUsed = keys.reduce((s, k) => s + (k.usageDaily || 0), 0)
    const dailyLimit = keys.reduce((s, k) => s + (k.dailyLimit || 0), 0)
    const nearest = keys.filter((k) => k.expiredAt).sort((a, b) => +new Date(a.expiredAt) - +new Date(b.expiredAt))[0]

    const chart: Record<string, number> = {}
    const top: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) chart[new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)] = 0
    for (const l of logs) {
        const d = new Date(l.at).toISOString().slice(0, 10)
        if (d in chart) chart[d] += 1
        top[l.endpoint] = (top[l.endpoint] || 0) + 1
    }

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
