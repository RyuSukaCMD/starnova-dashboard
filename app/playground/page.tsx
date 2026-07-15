import { Suspense } from "react"
import { getDocTree } from "@/lib/serverData"
import { PageTransition } from "@/components/ui/Motion"
import Playground from "@/components/playground/Playground"

export const metadata = { title: "Playground" }
export const dynamic = "force-dynamic"

export default function PlaygroundPage() {
    const tree = getDocTree()
    const flat = tree.flatMap((c) => c.endpoints)
    return (
        <PageTransition>
            <section className="px-4 pt-32 pb-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 text-center">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">Playground</span>
                        <h1 className="mt-2 text-4xl font-bold">Try <span className="grad-text">API</span></h1>
                        <p className="mt-2 text-slate-400">Eksekusi endpoint langsung & lihat response real-time.</p>
                    </div>
                    <Suspense fallback={<div className="glass h-96 rounded-2xl" />}>
                        <Playground endpoints={flat} />
                    </Suspense>
                </div>
            </section>
        </PageTransition>
    )
}
