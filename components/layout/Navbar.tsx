"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import Button from "@/components/ui/Button"

const LINKS = [
    { href: "/", label: "Home" },
    { href: "/docs", label: "Docs" },
    { href: "/playground", label: "Playground" },
    { href: "/pricing", label: "Pricing" },
    { href: "/status", label: "Status" }
]

export default function Navbar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [hidden, setHidden] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        let last = 0
        const onScroll = () => {
            const y = window.scrollY
            setScrolled(y > 20)
            setHidden(y > last && y > 200) // hide saat scroll down
            last = y
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{ y: hidden ? -90 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-0 z-50"
        >
            <div className={`mx-auto mt-3 flex w-[min(1200px,94%)] items-center justify-between rounded-2xl border px-4 py-2.5 transition-all duration-300 ${scrolled ? "glass border-white/10" : "border-transparent bg-transparent"}`}>
                <Link href="/" className="flex items-center gap-2.5 font-bold">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#22D3EE,#8B5CF6)] shadow-[0_0_18px_rgba(139,92,246,.6)]">✦</span>
                    <span className="text-[1.05rem]">Star<span className="grad-text">Nova</span></span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${pathname === l.href ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    {session ? (
                        <>
                            <Link href="/dashboard" className="rounded-lg px-3.5 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5">Dashboard</Link>
                            <Button variant="ghost" className="!py-2" onClick={() => signOut({ callbackUrl: "/" })}>Logout</Button>
                        </>
                    ) : (
                        <Button href="/login" className="!py-2">Sign In</Button>
                    )}
                </div>

                <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
                    <div className="flex flex-col gap-1.5">
                        <span className="h-0.5 w-5 bg-white" /><span className="h-0.5 w-5 bg-white" /><span className="h-0.5 w-5 bg-white" />
                    </div>
                </button>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass mx-auto mt-2 flex w-[min(1200px,94%)] flex-col gap-1 rounded-2xl p-3 md:hidden"
                    >
                        {LINKS.map((l) => (
                            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5">{l.label}</Link>
                        ))}
                        {session ? (
                            <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-primary">Dashboard →</Link>
                        ) : (
                            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-primary">Sign In →</Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
