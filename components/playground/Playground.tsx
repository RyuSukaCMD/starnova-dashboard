"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import Button from "@/components/ui/Button"
import { hlJSON } from "@/lib/highlight"
import Icon from "@/components/ui/Icon"

export default function Playground({ endpoints }: { endpoints: any[] }) {
    const sp = useSearchParams()
    const { status: authStatus } = useSession()
    const [selected, setSelected] = useState(sp.get("ep") || endpoints[0]?.path)
    const [apiKey, setApiKey] = useState("")
    const [params, setParams] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [resp, setResp] = useState<string>("")
    const [code, setCode] = useState<number | null>(null)
    const [ms, setMs] = useState<number | null>(null)

    const ep = endpoints.find((e) => e.path === selected)

    // Ambil API key user (bila login) untuk auto-fill.
    useEffect(() => {
        if (authStatus === "authenticated") {
            fetch("/api/account/keys")
                .then((r) => r.json())
                .then((d) => {
                    const k = d.result?.find((x: any) => x.status === "active")
                    if (k) setApiKey(k.key)
                })
                .catch(() => {})
        }
    }, [authStatus])

    useEffect(() => setParams({}), [selected])

    async function run() {
        if (!ep) return
        setLoading(true)
        setResp("")
        setCode(null)
        setMs(null)
        const qs = new URLSearchParams(params).toString()
        const url = ep.path + (qs ? "?" + qs : "")
        const t0 = performance.now()
        try {
            const r = await fetch(url, { headers: apiKey ? { apikey: apiKey } : {} })
            const data = await r.json()
            setCode(r.status)
            setMs(Math.round(performance.now() - t0))
            setResp(hlJSON(data))
        } catch (e: any) {
            setCode(0)
            setResp(hlJSON({ status: false, message: e.message }))
        }
        setLoading(false)
    }

    return (
        <div className="grid gap-5 lg:grid-cols-2">
            {/* Panel input */}
            <div className="glass noise rounded-2xl p-6">
                <label className="mb-1.5 block text-sm text-slate-400">Endpoint</label>
                <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#070813] px-3 py-2.5 text-sm outline-none focus:border-primary">
                    {endpoints.map((e) => (
                        <option key={e.path} value={e.path}>[{e.method}] {e.path} — {e.name}</option>
                    ))}
                </select>

                <label className="mb-1.5 mt-4 block text-sm text-slate-400">API Key</label>
                <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="snv_xxxxxxxx" className="w-full rounded-xl border border-white/10 bg-[#070813] px-3 py-2.5 font-mono text-sm outline-none focus:border-primary" />
                {authStatus !== "authenticated" && (
                    <p className="mt-1.5 text-xs text-slate-500">
                        Butuh API Key? <Link href="/login" className="text-accent hover:underline">Login</Link> untuk generate otomatis.
                    </p>
                )}

                {ep?.params?.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {ep.params.map((p: any) => (
                            <div key={p.name}>
                                <label className="mb-1.5 block text-sm text-slate-400">
                                    {p.name} {p.required && <span className="text-pink-400">*</span>} <span className="text-slate-600">({p.type})</span>
                                </label>
                                <input
                                    value={params[p.name] || ""}
                                    onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
                                    placeholder={p.example ?? p.description}
                                    className="w-full rounded-xl border border-white/10 bg-[#070813] px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-5">
                    <Button onClick={run} className="w-full" disabled={loading}>{loading ? "Menjalankan…" : (<><Icon name="bolt" size={16} /> Execute</>)}</Button>
                </div>
            </div>

            {/* Panel response */}
            <div className="glass noise rounded-2xl p-6">
                <div className="mb-3 flex flex-wrap gap-3 text-sm">
                    <span className={`rounded-full border px-3 py-1 font-mono ${code === null ? "border-white/10 bg-white/5 text-slate-300" : code >= 200 && code < 300 ? "border-success/30 bg-success/10 text-emerald-300" : "border-danger/30 bg-danger/10 text-red-300"}`}>Status: {code === null ? "—" : code}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono">Time: {ms === null ? "—" : ms + "ms"}</span>
                </div>
                {loading ? (
                    <div className="grid min-h-[260px] place-items-center">
                        <motion.div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-accent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                    </div>
                ) : (
                    <pre className="min-h-[260px] overflow-auto rounded-xl border border-white/8 bg-[#070813] p-4 font-mono text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: resp || '<span style="color:#64748b">// Response akan muncul di sini</span>' }} />
                )}
            </div>
        </div>
    )
}
