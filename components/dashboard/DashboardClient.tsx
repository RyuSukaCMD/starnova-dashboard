"use client"
import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Counter, Stagger, StaggerItem, TiltCard } from "@/components/ui/Motion"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

const rp = (n: number) => Number(n || 0).toLocaleString("id-ID")
const timeAgo = (iso: string | null) => {
    if (!iso) return "-"
    const s = Math.floor((Date.now() - +new Date(iso)) / 1000)
    if (s < 60) return "baru saja"
    if (s < 3600) return Math.floor(s / 60) + "m"
    if (s < 86400) return Math.floor(s / 3600) + "j"
    return Math.floor(s / 86400) + "h"
}

function toast(m: string) {
    const el = document.createElement("div")
    el.textContent = m
    el.className = "fixed bottom-6 left-1/2 z-[999] -translate-x-1/2 rounded-xl border border-white/15 bg-[#0a0b1e]/95 px-4 py-2 text-sm backdrop-blur"
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
}

export default function DashboardClient({ initial }: { initial: any }) {
    const [keys, setKeys] = useState<any[]>(initial.keys)
    const u = initial.user
    const chartMax = Math.max(1, ...initial.chart.map((c: any) => c.count))

    async function keyAction(key: string, action: string) {
        if (action === "delete") {
            if (!confirm("Hapus API Key ini?")) return
            await fetch(`/api/account/keys/${key}`, { method: "DELETE" })
            setKeys((k) => k.filter((x) => x.key !== key))
            toast("Key dihapus")
            return
        }
        const r = await fetch(`/api/account/keys/${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }).then((x) => x.json())
        if (r.status) {
            setKeys((k) => k.map((x) => (x.key === key ? r.result : x)))
            toast("Berhasil: " + action)
        }
    }
    async function newKey() {
        const r = await fetch("/api/account/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "My Key" }) }).then((x) => x.json())
        if (r.status) {
            setKeys((k) => [r.result, ...k])
            toast("Key baru dibuat")
        }
    }

    return (
        <section className="px-4 pt-28 pb-20">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {u.image ? (
                            <Image src={u.image} alt="" width={52} height={52} className="rounded-2xl ring-1 ring-white/10" />
                        ) : (
                            <div className="grid h-13 w-13 place-items-center rounded-2xl bg-[linear-gradient(135deg,#22D3EE,#8B5CF6)] p-3.5 text-lg font-bold">{(u.name || "S")[0].toUpperCase()}</div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold">Halo, {u.name || "User"}</h1>
                            <p className="text-sm text-slate-400">{u.email} · <span className="text-accent">{(u.plan || "free").toUpperCase()}</span></p>
                        </div>
                    </div>
                    <Button onClick={newKey}>+ API Key Baru</Button>
                </div>

                {/* KPIs */}
                <Stagger className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { l: "Total Request", v: initial.totalRequest, ic: "signal" as const },
                        { l: "Sisa Limit Harian", v: initial.remaining, ic: "target" as const },
                        { l: "API Keys", v: initial.keyCount, ic: "key" as const },
                        { l: "Expired Terdekat", txt: initial.expiredDate ? new Date(initial.expiredDate).toLocaleDateString("id-ID") : "∞", ic: "clock" as const }
                    ].map((k, i) => (
                        <StaggerItem key={i}>
                            <TiltCard className="glass noise rounded-2xl p-5">
                                <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-accent"><Icon name={k.ic} size={18} /></div>
                                <div className="mt-2 font-mono text-2xl font-bold">{k.txt ?? <Counter value={k.v} />}</div>
                                <div className="mt-0.5 text-xs text-slate-400">{k.l}</div>
                            </TiltCard>
                        </StaggerItem>
                    ))}
                </Stagger>

                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Chart */}
                    <TiltCard className="glass noise rounded-2xl p-6 lg:col-span-2">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="chart" size={18} className="text-accent" /> Request 7 Hari Terakhir</h3>
                        <div className="flex h-40 items-end gap-2">
                            {initial.chart.map((c: any, i: number) => (
                                <div key={i} className="group relative flex-1">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(c.count / chartMax) * 100}%` }}
                                        transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                        className="w-full rounded-t-lg bg-[linear-gradient(180deg,#22D3EE,#8B5CF6)]"
                                        style={{ minHeight: 4 }}
                                    />
                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] text-slate-500">{c.date.slice(5)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-xs text-slate-500">Total 7 hari: {initial.chart.reduce((s: number, c: any) => s + c.count, 0)} request</div>
                    </TiltCard>

                    {/* Top endpoint */}
                    <TiltCard className="glass noise rounded-2xl p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="fire" size={18} className="text-accent" /> Top Endpoint</h3>
                        {initial.topEndpoint.length ? (
                            <div className="space-y-2.5">
                                {initial.topEndpoint.map((t: any) => (
                                    <div key={t.endpoint} className="flex items-center justify-between text-sm">
                                        <span className="truncate font-mono text-slate-300">{t.endpoint.replace("/api/v1", "")}</span>
                                        <span className="ml-2 shrink-0 font-mono text-accent">{t.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Belum ada request.</p>
                        )}
                    </TiltCard>
                </div>

                {/* API Keys */}
                <TiltCard className="glass noise mt-5 rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="key" size={18} className="text-accent" /> API Keys</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[0.7rem] uppercase text-slate-500">
                                    <th className="py-2 pr-4">Key</th><th className="pr-4">Plan</th><th className="pr-4">Status</th><th className="pr-4">Usage</th><th className="pr-4">Expired</th><th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.length === 0 && <tr><td colSpan={6} className="py-4 text-slate-500">Belum ada key. Buat sekarang!</td></tr>}
                                {keys.map((k) => (
                                    <tr key={k.key} className="border-t border-white/5">
                                        <td className="py-2.5 pr-4">
                                            <button onClick={() => { navigator.clipboard?.writeText(k.key); toast("Key disalin") }} className="font-mono text-accent hover:underline">{k.key.slice(0, 18)}…</button>
                                        </td>
                                        <td className="pr-4">{k.plan}</td>
                                        <td className="pr-4"><span className={`rounded-full px-2 py-0.5 text-[0.65rem] ${k.status === "active" ? "bg-success/15 text-emerald-300" : "bg-white/10 text-slate-400"}`}>{k.status}</span></td>
                                        <td className="pr-4 font-mono text-slate-400">{k.usageDaily}/{k.dailyLimit}</td>
                                        <td className="pr-4 text-slate-500">{k.expiredAt ? new Date(k.expiredAt).toLocaleDateString("id-ID") : "∞"}</td>
                                        <td>
                                            <div className="flex flex-wrap gap-1.5">
                                                {k.status === "active"
                                                    ? <button onClick={() => keyAction(k.key, "disable")} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10">Disable</button>
                                                    : <button onClick={() => keyAction(k.key, "enable")} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10">Enable</button>}
                                                <button onClick={() => keyAction(k.key, "regenerate")} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10">Regen</button>
                                                <button onClick={() => keyAction(k.key, "delete")} className="rounded-lg border border-red-500/30 bg-red-500/15 px-2.5 py-1 text-xs text-red-200 hover:bg-red-500/25">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TiltCard>

                {/* Recent activity */}
                <TiltCard className="glass noise mt-5 rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="activity" size={18} className="text-accent" /> Recent Activity</h3>
                    {initial.recent.length ? (
                        <div className="space-y-2">
                            {initial.recent.map((r: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm">
                                    <span className={`rounded px-1.5 py-0.5 font-mono text-[0.6rem] font-bold ${r.status >= 200 && r.status < 300 ? "bg-success/15 text-emerald-300" : "bg-danger/15 text-red-300"}`}>{r.status}</span>
                                    <span className="truncate font-mono text-slate-300">{r.endpoint}</span>
                                    <span className="ml-auto shrink-0 text-slate-500">{r.responseTime}ms · {timeAgo(r.at)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Belum ada aktivitas. Coba <a href="/playground" className="text-accent">Playground</a>!</p>
                    )}
                </TiltCard>
            </div>
        </section>
    )
}
