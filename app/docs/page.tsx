import { getDocTree } from "@/lib/serverData"
import { PageTransition } from "@/components/ui/Motion"
import DocsViewer from "@/components/docs/DocsViewer"

export const metadata = { title: "Documentation" }
export const revalidate = 3600 // docs semi-statis (ISR)

export default function DocsPage() {
    const tree = getDocTree() // di-generate di SERVER
    return (
        <PageTransition>
            <section className="px-4 pt-32 pb-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-10 text-center">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">Documentation</span>
                        <h1 className="mt-2 text-4xl font-bold">API <span className="grad-text">Reference</span></h1>
                        <p className="mt-2 text-slate-400">Dokumentasi otomatis · contoh kode 11 bahasa · Try API.</p>
                    </div>
                    <DocsViewer tree={tree} />
                </div>
            </section>
        </PageTransition>
    )
}
