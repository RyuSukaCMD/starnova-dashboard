import { PageTransition, Reveal, Stagger, StaggerItem, TiltCard } from "@/components/ui/Motion"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

export const metadata = { title: "Pricing" }

const PLANS = [
    { id: "free", name: "Free", price: 0, daily: "100", monthly: "1.000", support: "Community", feats: ["Semua endpoint publik", "Rate limit 20/menit", "Community support"] },
    { id: "basic", name: "Basic", price: 25000, daily: "1.000", monthly: "20.000", support: "Email", feats: ["Semua endpoint", "Rate limit 60/menit", "IP whitelist", "Email support"] },
    { id: "premium", name: "Premium", price: 75000, daily: "10.000", monthly: "300.000", support: "Priority", featured: true, feats: ["Semua endpoint", "Rate limit 120/menit", "Analytics detail", "Priority support"] },
    { id: "enterprise", name: "Enterprise", price: 300000, daily: "100.000", monthly: "5.000.000", support: "Dedicated", feats: ["SLA 99.99%", "Rate limit 600/menit", "Custom endpoint", "Dedicated support"] }
]
const rp = (n: number) => (n === 0 ? "Gratis" : "Rp " + n.toLocaleString("id-ID"))

export default function PricingPage() {
    return (
        <PageTransition>
            <section className="px-4 pt-32 pb-20">
                <div className="mx-auto max-w-6xl">
                    <Reveal className="mb-12 text-center">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">Pricing</span>
                        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Pilih paket <span className="grad-text">yang pas</span></h1>
                        <p className="mt-2 text-slate-400">Mulai gratis, upgrade kapan saja. Tanpa biaya tersembunyi.</p>
                    </Reveal>
                    <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {PLANS.map((p) => (
                            <StaggerItem key={p.id}>
                                <TiltCard className={`glass noise relative h-full rounded-2xl p-6 ${p.featured ? "ring-1 ring-secondary/60 shadow-neon-purple" : ""}`}>
                                    {p.featured && <span className="absolute right-4 top-4 rounded-full bg-[linear-gradient(120deg,#22D3EE,#8B5CF6)] px-2.5 py-0.5 text-[0.6rem] font-bold">POPULER</span>}
                                    <div className="text-lg font-semibold">{p.name}</div>
                                    <div className="mt-2 font-mono text-3xl font-bold">{rp(p.price)}<span className="text-sm font-normal text-slate-500">{p.price ? " /bln" : ""}</span></div>
                                    <div className="mt-3 space-y-1 text-sm text-slate-400">
                                        <div className="flex items-center gap-2"><Icon name="target" size={15} className="text-accent" /> {p.daily} request/hari</div>
                                        <div className="flex items-center gap-2"><Icon name="chart" size={15} className="text-accent" /> {p.monthly} request/bulan</div>
                                    </div>
                                    <ul className="mt-4 space-y-2 text-sm text-slate-300">
                                        {p.feats.map((f) => <li key={f} className="flex items-start gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-accent" />{f}</li>)}
                                    </ul>
                                    <div className="mt-5">
                                        <Button href="/dashboard" variant={p.featured ? "primary" : "ghost"} className="w-full">{p.price ? "Buy Now" : "Mulai Gratis"}</Button>
                                    </div>
                                    <div className="mt-3 text-center text-xs text-slate-500">Support: {p.support}</div>
                                </TiltCard>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>
        </PageTransition>
    )
}
