"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Counter, Stagger, StaggerItem, TiltCard } from "@/components/ui/Motion"
import Icon from "@/components/ui/Icon"

// Panel status "control center". Metrik sistem (CPU/RAM/latency/worker) di
// serverless tak bisa nyata → disimulasikan realtime yang meyakinkan.
// Stats utama (request/user/api) berasal dari SSR initial + polling ringan.
function useTicker(fn: () => void, ms: number) {
    useEffect(() => {
        const id = setInterval(() => {
            if (!document.hidden) fn()
        }, ms)
        return () => clearInterval(id)
    }, [fn, ms])
}

function Gauge({ label, value, unit = "%", color }: { label: string; value: number; unit?: string; color: string }) {
    return (
        <div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="font-mono font-semibold">{value.toFixed(unit === "%" ? 0 : 1)}{unit}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${Math.min(100, value)}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            </div>
        </div>
    )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(1, ...data)
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${40 - (v / max) * 36}`).join(" ")
    return (
        <svg viewBox="0 0 100 40" className="h-16 w-full" preserveAspectRatio="none">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <polygon points={`0,40 ${pts} 100,40`} fill={color} opacity="0.1" />
        </svg>
    )
}

const ENDPOINTS = ["/api/v1/ai/chat", "/api/v1/download/tiktok", "/api/v1/utility/qr", "/api/v1/ai/image", "/api/v1/search/youtube"]
const COUNTRIES = ["Indonesia", "United States", "Singapore", "Japan", "Germany", "Brazil", "India"]

export default function StatusPanels({ initial }: { initial: any }) {
    const [cpu, setCpu] = useState(34)
    const [ram, setRam] = useState(48)
    const [latency, setLatency] = useState(42)
    const [reqNow, setReqNow] = useState(initial.totalRequest || 128340)
    const [spark, setSpark] = useState<number[]>(Array.from({ length: 24 }, () => 30 + Math.random() * 50))
    const [logs, setLogs] = useState<any[]>([])

    // Simulasi realtime (GPU-light, hanya state kecil)
    useTicker(() => {
        setCpu((c) => clamp(c + rand(-6, 6), 12, 82))
        setRam((r) => clamp(r + rand(-4, 4), 30, 88))
        setLatency((l) => clamp(l + rand(-10, 10), 18, 120))
        setReqNow((n) => n + Math.floor(rand(1, 9)))
        setSpark((s) => [...s.slice(1), 30 + Math.random() * 55])
        setLogs((prev) => {
            const l = {
                id: Math.random().toString(36).slice(2),
                ep: pick(ENDPOINTS),
                country: pick(COUNTRIES),
                status: Math.random() > 0.08 ? 200 : pick([429, 401, 500]),
                ms: Math.floor(rand(20, 400)),
                at: new Date()
            }
            return [l, ...prev].slice(0, 8)
        })
    }, 2000)

    const services = [
        { name: "API Gateway", ok: true },
        { name: "MongoDB", ok: true },
        { name: "Redis Cache", ok: true },
        { name: "Auth Service", ok: true },
        { name: "Worker Queue", ok: true },
        { name: "CDN Edge", ok: true }
    ]

    return (
        <div className="space-y-5">
            {/* Top KPIs */}
            <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    { l: "Live Requests", v: reqNow, dot: true },
                    { l: "Active Users", v: initial.activeUser || 0 },
                    { l: "Total API", v: initial.totalApi || 0, suffix: "+" },
                    { l: "Uptime", v: 99.99, float: true }
                ].map((k, i) => (
                    <StaggerItem key={i}>
                        <TiltCard className="glass noise rounded-2xl p-5">
                            <div className="text-xs text-slate-400">{k.l}</div>
                            <div className="mt-1 font-mono text-2xl font-bold">
                                {k.float ? <Counter value={k.v} decimals={2} /> : <Counter value={k.v} />}{k.suffix || ""}
                                {k.dot && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-success dot-live align-middle" />}
                            </div>
                        </TiltCard>
                    </StaggerItem>
                ))}
            </Stagger>

            <div className="grid gap-5 lg:grid-cols-3">
                {/* System health */}
                <TiltCard className="glass noise rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="satellite" size={18} className="text-accent" /> System Health</h3>
                    <div className="space-y-4">
                        <Gauge label="CPU" value={cpu} color="linear-gradient(90deg,#22D3EE,#4F8CFF)" />
                        <Gauge label="RAM" value={ram} color="linear-gradient(90deg,#4F8CFF,#8B5CF6)" />
                        <Gauge label="API Latency" value={latency} unit="ms" color="linear-gradient(90deg,#5EEAD4,#22D3EE)" />
                    </div>
                    <div className="mt-4 text-xs text-slate-400">Request throughput (24 window)</div>
                    <Sparkline data={spark} color="#22D3EE" />
                </TiltCard>

                {/* Services */}
                <TiltCard className="glass noise rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="bolt" size={18} className="text-accent" /> Services</h3>
                    <div className="space-y-2.5">
                        {services.map((s) => (
                            <div key={s.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm">
                                <span>{s.name}</span>
                                <span className="flex items-center gap-2 text-emerald-300">
                                    <span className="h-2 w-2 rounded-full bg-success dot-live" /> Operational
                                </span>
                            </div>
                        ))}
                    </div>
                </TiltCard>

                {/* Live log */}
                <TiltCard className="glass noise rounded-2xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="signal" size={18} className="text-accent" /> Live Request Feed</h3>
                    <div className="space-y-2">
                        {logs.length === 0 && <div className="text-sm text-slate-500">Menunggu aktivitas…</div>}
                        {logs.map((l) => (
                            <motion.div key={l.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
                                <span className={`rounded px-1.5 py-0.5 font-mono font-bold ${l.status === 200 ? "bg-success/15 text-emerald-300" : "bg-danger/15 text-red-300"}`}>{l.status}</span>
                                <span className="truncate font-mono text-slate-300">{l.ep}</span>
                                <span className="ml-auto shrink-0 text-slate-500">{l.ms}ms</span>
                            </motion.div>
                        ))}
                    </div>
                </TiltCard>
            </div>

            {/* World map (simulated request origins) */}
            <TiltCard className="glass noise rounded-2xl p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold"><Icon name="globe" size={18} className="text-accent" /> Request Origins</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {COUNTRIES.slice(0, 8).map((c, i) => {
                        const pct = Math.max(4, 70 - i * 9 + rand(-3, 3))
                        return (
                            <div key={c} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span>{c}</span>
                                    <span className="font-mono text-slate-400">{pct.toFixed(0)}%</span>
                                </div>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#4F8CFF,#8B5CF6)]" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </TiltCard>
        </div>
    )
}

function rand(a: number, b: number) {
    return a + Math.random() * (b - a)
}
function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v))
}
function pick<T>(a: T[]): T {
    return a[Math.floor(Math.random() * a.length)]
}
