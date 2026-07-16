"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { codeSamples } from "@/lib/codeSamples"
import { hlJSON } from "@/lib/highlight"
import Icon from "@/components/ui/Icon"

const METHOD_COLORS: Record<string, string> = {
    GET: "bg-success/15 text-emerald-300",
    POST: "bg-primary/20 text-blue-200",
    PUT: "bg-yellow-500/20 text-yellow-200",
    DELETE: "bg-danger/20 text-red-200"
}

function copy(text: string, msg = "Disalin!") {
    navigator.clipboard?.writeText(text)
    const el = document.createElement("div")
    el.textContent = msg
    el.className = "fixed bottom-6 left-1/2 z-[999] -translate-x-1/2 rounded-xl border border-white/15 bg-[#0a0b1e]/95 px-4 py-2 text-sm backdrop-blur"
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 1800)
}

function EndpointCard({ ep }: { ep: any }) {
    const samples = useMemo(() => codeSamples(ep), [ep])
    const langs = Object.keys(samples)
    const [lang, setLang] = useState(langs[0])
    return (
        <motion.div
            id={ep.path.replace(/[^a-z0-9]+/gi, "-")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass noise scroll-mt-28 rounded-2xl p-5"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-1 font-mono text-[0.62rem] font-bold ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                <span className="break-all font-mono text-sm">{ep.path}</span>
                <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase ${ep.live ? "bg-success/15 text-emerald-300" : "bg-white/10 text-slate-300"}`}>{ep.live ? "Live" : "Sample"}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{ep.description}</p>

            {ep.params?.length > 0 && (
                <>
                    <div className="mt-4 text-[0.7rem] font-bold uppercase tracking-wider text-accent">Parameters</div>
                    <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[0.7rem] uppercase text-slate-500">
                                    <th className="py-1.5 pr-4">Name</th><th className="pr-4">Type</th><th className="pr-4">Required</th><th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ep.params.map((p: any) => (
                                    <tr key={p.name} className="border-t border-white/5">
                                        <td className="py-1.5 pr-4 font-mono text-accent">{p.name}</td>
                                        <td className="pr-4 text-slate-400">{p.type}</td>
                                        <td className="pr-4">{p.required ? <span className="text-pink-400">required</span> : <span className="text-slate-500">optional</span>}</td>
                                        <td className="text-slate-400">{p.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                    <div className="text-[0.7rem] font-bold uppercase tracking-wider text-accent">Response</div>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-xl border border-white/8 bg-[#070813] p-3 font-mono text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: hlJSON(ep.responseExample) }} />
                </div>
                <div>
                    <div className="text-[0.7rem] font-bold uppercase tracking-wider text-accent">Error</div>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-xl border border-white/8 bg-[#070813] p-3 font-mono text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: hlJSON(ep.errorExample) }} />
                </div>
            </div>

            <div className="mt-4 text-[0.7rem] font-bold uppercase tracking-wider text-accent">Code Example</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {langs.map((l) => (
                    <button key={l} onClick={() => setLang(l)} className={`rounded-lg px-2.5 py-1 text-xs transition ${lang === l ? "bg-[linear-gradient(120deg,#4F8CFF,#8B5CF6)] text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>{l}</button>
                ))}
            </div>
            <pre className="mt-2 overflow-auto rounded-xl border border-white/8 bg-[#070813] p-3 font-mono text-xs leading-relaxed text-[#c9d4ff]">{samples[lang]}</pre>

            <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => copy(ep.path)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:text-accent"><span className="inline-flex items-center gap-1"><Icon name="copy" size={13} /> Copy Endpoint</span></button>
                <button onClick={() => copy(JSON.stringify(ep.responseExample, null, 2))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:text-accent"><span className="inline-flex items-center gap-1"><Icon name="copy" size={13} /> Copy Response</span></button>
                <Link href={`/playground?ep=${encodeURIComponent(ep.path)}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-accent hover:bg-white/10"><span className="inline-flex items-center gap-1"><Icon name="bolt" size={13} /> Try API</span></Link>
            </div>
        </motion.div>
    )
}

export default function DocsViewer({ tree }: { tree: any[] }) {
    const [q, setQ] = useState("")
    const filtered = useMemo(() => {
        if (!q) return tree
        const s = q.toLowerCase()
        return tree
            .map((c) => ({ ...c, endpoints: c.endpoints.filter((e: any) => (e.name + e.path + e.description).toLowerCase().includes(s)) }))
            .filter((c) => c.endpoints.length)
    }, [q, tree])

    return (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside className="glass sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl p-4 lg:block">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari endpoint…" className="mb-3 w-full rounded-lg border border-white/10 bg-[#070813] px-3 py-2 text-sm outline-none focus:border-primary" />
                {filtered.map((c) => (
                    <div key={c.category} className="mb-2">
                        <div className="px-2 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-accent">{c.category} · {c.endpoints.length}</div>
                        {c.endpoints.map((e: any) => (
                            <a key={e.path} href={`#${e.path.replace(/[^a-z0-9]+/gi, "-")}`} className="flex items-center gap-2 truncate rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
                                <span className={`rounded px-1.5 py-0.5 font-mono text-[0.55rem] font-bold ${METHOD_COLORS[e.method]}`}>{e.method}</span>
                                <span className="truncate">{e.name}</span>
                            </a>
                        ))}
                    </div>
                ))}
            </aside>
            <div className="space-y-5">
                {filtered.map((c) => (
                    <div key={c.category}>
                        <h2 className="mb-3 mt-2 text-xl font-bold">{c.category} <span className="text-sm font-normal text-slate-500">({c.endpoints.length})</span></h2>
                        <div className="space-y-5">
                            {c.endpoints.map((e: any) => <EndpointCard key={e.path} ep={e} />)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
