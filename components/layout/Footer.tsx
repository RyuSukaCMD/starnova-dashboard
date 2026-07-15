import Link from "next/link"

export default function Footer() {
    return (
        <footer className="relative z-10 mt-24 border-t border-white/8">
            <div className="mx-auto flex w-[min(1200px,94%)] flex-col items-center justify-between gap-4 py-8 text-sm text-slate-400 md:flex-row">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(135deg,#22D3EE,#8B5CF6)]">✦</span>
                    StarNova
                </div>
                <p>© {new Date().getFullYear()} StarNova · High Performance REST API</p>
                <div className="flex gap-4">
                    <Link href="/docs" className="hover:text-accent">Docs</Link>
                    <Link href="/pricing" className="hover:text-accent">Pricing</Link>
                    <Link href="/status" className="hover:text-accent">Status</Link>
                </div>
            </div>
        </footer>
    )
}
