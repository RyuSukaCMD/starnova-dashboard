import { getPublicStats } from "@/lib/serverData"
import { PageTransition, Reveal } from "@/components/ui/Motion"
import StatusPanels from "@/components/status/StatusPanels"

export const metadata = { title: "System Status" }
export const dynamic = "force-dynamic"

export default async function StatusPage() {
    const stats = await getPublicStats() // SSR: initial data dari server
    return (
        <PageTransition>
            <section className="px-4 pt-32 pb-20">
                <div className="mx-auto max-w-6xl">
                    <Reveal className="mb-10 text-center">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                            <span className="h-2 w-2 rounded-full bg-success dot-live" /> Live · Satellite Control
                        </span>
                        <h1 className="mt-2 text-4xl font-bold">System <span className="grad-text">Status</span></h1>
                        <p className="mt-2 text-slate-400">Pusat kendali StarNova — health, latency, dan aktivitas real-time.</p>
                    </Reveal>
                    <StatusPanels initial={stats} />
                </div>
            </section>
        </PageTransition>
    )
}
