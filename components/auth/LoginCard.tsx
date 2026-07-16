"use client"
import { useEffect, useState } from "react"
import { signIn, getProviders } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

// hasGoogle/allowDemo dari server dipakai sebagai nilai AWAL, tapi sumber
// kebenaran sebenarnya = daftar provider dari NextAuth (/api/auth/providers).
// Ini mencegah pesan "belum dikonfigurasi" yang salah.
export default function LoginCard({ hasGoogle: initialGoogle, allowDemo: initialDemo }: { hasGoogle: boolean; allowDemo: boolean }) {
    const sp = useSearchParams()
    const callbackUrl = sp.get("callbackUrl") || "/dashboard"
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [hasGoogle, setHasGoogle] = useState(initialGoogle)
    const [allowDemo, setAllowDemo] = useState(initialDemo)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        getProviders()
            .then((p) => {
                if (p) {
                    setHasGoogle(!!p.google)
                    setAllowDemo(!!p.demo)
                }
            })
            .catch(() => {})
            .finally(() => setChecked(true))
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass noise w-full max-w-md rounded-2xl p-8"
        >
            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[linear-gradient(135deg,#22D3EE,#8B5CF6)] text-white shadow-[0_0_24px_rgba(139,92,246,.6)]"><Icon name="star" size={22} /></div>
                <h1 className="text-2xl font-bold">Masuk ke <span className="grad-text">StarNova</span></h1>
                <p className="mt-1 text-sm text-slate-400">Login untuk generate API Key otomatis & pakai fitur.</p>
            </div>

            {/* Google OAuth = metode login DEFAULT */}
            <Button
                onClick={() => signIn("google", { callbackUrl })}
                className="mb-2 w-full"
                disabled={!hasGoogle}
            >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" opacity=".85"/><path fill="#fff" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" opacity=".7"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" opacity=".55"/></svg>
                Lanjut dengan Google
            </Button>
            {checked && !hasGoogle && (
                <p className="mb-2 text-center text-xs text-amber-300/80">
                    Google OAuth belum aktif di server. Cek env <code className="font-mono">GOOGLE_CLIENT_ID</code> & <code className="font-mono">GOOGLE_CLIENT_SECRET</code> lalu redeploy. Diagnosa: <Link href="/api/debug/env" className="underline">/api/debug/env</Link>
                </p>
            )}

            {allowDemo && (
                <>
                    <div className="my-4 flex items-center gap-3 text-xs text-slate-500"><div className="hr-glow flex-1" />atau demo (testing)<div className="hr-glow flex-1" /></div>
                    <label className="mb-1.5 block text-sm text-slate-400">Email (demo)</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" className="mb-3 w-full rounded-xl border border-white/10 bg-[#070813] px-3 py-2.5 text-sm outline-none focus:border-primary" />
                    <Button
                        onClick={async () => {
                            setLoading(true)
                            await signIn("demo", { email: email || undefined, callbackUrl })
                        }}
                        variant="ghost"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Masuk…" : "Masuk (Demo)"}
                    </Button>
                </>
            )}

            <p className="mt-6 text-center text-xs text-slate-500">
                <Link href="/" className="hover:text-accent">Kembali ke beranda</Link>
            </p>
        </motion.div>
    )
}
