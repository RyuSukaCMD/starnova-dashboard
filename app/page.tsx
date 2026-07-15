import Link from "next/link"
import { getPublicStats } from "@/lib/serverData"
import { registryStats } from "@/lib/registry"
import { PageTransition, Reveal, Stagger, StaggerItem, Counter, TiltCard } from "@/components/ui/Motion"
import Button from "@/components/ui/Button"

export const dynamic = "force-dynamic"

const CATS = [
    { icon: "🤖", name: "AI", desc: "GPT, image gen, translate, code & 20+ tugas AI." },
    { icon: "📥", name: "Downloader", desc: "TikTok, YouTube, IG, FB, Spotify & lainnya." },
    { icon: "🔍", name: "Search", desc: "YouTube, web, lyrics, github, npm, anime." },
    { icon: "🛠️", name: "Utility", desc: "QR, IP, weather, base64, password, hash." },
    { icon: "🖼️", name: "Image", desc: "Remove bg, upscale, resize, meme maker." },
    { icon: "📝", name: "Text", desc: "OCR, summarize, grammar, TTS, rewrite." }
]

export default async function HomePage() {
    const stats = await getPublicStats()
    const eps = registryStats()

    return (
        <PageTransition>
            {/* HERO */}
            <section className="relative px-4 pt-36 pb-20 text-center">
                <div className="mx-auto max-w-4xl">
                    <Reveal>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300 backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-success dot-live" /> High Performance REST API Platform
                        </span>
                    </Reveal>
                    <Reveal delay={0.05}>
                        <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                            Star<span className="grad-text">Nova</span> API
                        </h1>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
                            {eps.total}+ endpoint siap pakai — AI, Downloader, Search & Utility. Cepat, aman,
                            terdokumentasi otomatis, dan bertema alam semesta. 🌌
                        </p>
                    </Reveal>
                    <Reveal delay={0.15}>
                        <div className="mt-9 flex flex-wrap justify-center gap-3">
                            <Button href="/dashboard">Get Started →</Button>
                            <Button href="/pricing" variant="ghost">Lihat Pricing</Button>
                            <Button href="/docs" variant="ghost">Documentation</Button>
                        </div>
                    </Reveal>
                </div>

                {/* Live stats — SSR (data server-first, animasi counter di client) */}
                <Stagger className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-5">
                    {[
                        { n: stats.totalRequest, l: "Total Request" },
                        { n: stats.totalApi, l: "Total API", suffix: "+" },
                        { n: stats.activeUser, l: "Active User" },
                        { n: 99.99, l: "Uptime %", isFloat: true },
                        { n: stats.onlineServer, l: "Online Server", dot: true }
                    ].map((s, i) => (
                        <StaggerItem key={i}>
                            <TiltCard className="glass noise rounded-2xl p-5">
                                <div className="font-mono text-2xl font-bold md:text-3xl">
                                    {s.isFloat ? (
                                        <Counter value={s.n} decimals={2} />
                                    ) : (
                                        <Counter value={s.n} />
                                    )}
                                    {s.suffix || ""}
                                    {s.dot && <span className="ml-1 inline-block h-2.5 w-2.5 rounded-full bg-success dot-live align-middle" />}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">{s.l}</div>
                            </TiltCard>
                        </StaggerItem>
                    ))}
                </Stagger>
            </section>

            {/* CATEGORIES */}
            <section className="px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    <Reveal className="mb-12 text-center">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">Categories</span>
                        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Semua dalam <span className="grad-text">satu galaksi</span></h2>
                        <p className="mt-2 text-slate-400">Endpoint terorganisir rapi & terdokumentasi otomatis.</p>
                    </Reveal>
                    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {CATS.map((c) => (
                            <StaggerItem key={c.name}>
                                <TiltCard className="glass noise h-full rounded-2xl p-6">
                                    <div className="text-3xl">{c.icon}</div>
                                    <h3 className="mt-3 text-lg font-semibold">{c.name}</h3>
                                    <p className="mt-1.5 text-sm text-slate-400">{c.desc}</p>
                                    <Link href="/docs" className="mt-4 inline-block text-sm text-accent hover:underline">Explore →</Link>
                                </TiltCard>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-16">
                <Reveal className="mx-auto max-w-4xl">
                    <div className="glass noise relative overflow-hidden rounded-[1.75rem] p-10 text-center md:p-14">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
                        <h2 className="text-3xl font-bold md:text-4xl">Siap menjelajah <span className="grad-text">kosmos API?</span></h2>
                        <p className="mx-auto mt-3 max-w-lg text-slate-300">Login sekali, dapatkan API Key otomatis, langsung pakai ratusan endpoint.</p>
                        <div className="mt-7 flex justify-center gap-3">
                            <Button href="/dashboard">Buka Dashboard</Button>
                            <Button href="/playground" variant="ghost">Coba Playground</Button>
                        </div>
                    </div>
                </Reveal>
            </section>
        </PageTransition>
    )
}
