"use client"
import { useEffect, useRef } from "react"

// Background interaktif: starfield + shooting stars + mouse light.
// Semua via canvas (GPU-friendly) — hanya 1 client component ringan.
export default function SpaceBackground() {
    const starsRef = useRef<HTMLCanvasElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const canvas = starsRef.current!
        const ctx = canvas.getContext("2d")!
        let W = 0,
            H = 0,
            raf = 0
        let stars: any[] = []
        let meteors: any[] = []

        function resize() {
            W = canvas.width = window.innerWidth
            H = canvas.height = window.innerHeight
            const count = Math.min(200, Math.floor((W * H) / 10000))
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.3 + 0.3,
                a: Math.random(),
                s: Math.random() * 0.02 + 0.003,
                z: Math.random() * 0.6 + 0.4 // parallax depth
            }))
        }
        function spawn() {
            if (Math.random() < 0.025 && meteors.length < 2) {
                meteors.push({ x: Math.random() * W, y: -20, len: Math.random() * 150 + 90, sp: Math.random() * 6 + 6, a: 1 })
            }
        }
        function frame() {
            ctx.clearRect(0, 0, W, H)
            for (const st of stars) {
                st.a += st.s
                ctx.globalAlpha = 0.4 + Math.abs(Math.sin(st.a)) * 0.6
                ctx.fillStyle = st.z > 0.8 ? "#dfe9ff" : "#8ea6ff"
                ctx.beginPath()
                ctx.arc(st.x, st.y, st.r * st.z, 0, 7)
                ctx.fill()
            }
            ctx.globalAlpha = 1
            spawn()
            for (const m of meteors) {
                m.x += m.sp
                m.y += m.sp
                m.a -= 0.008
                const g = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len)
                g.addColorStop(0, `rgba(180,214,255,${Math.max(0, m.a)})`)
                g.addColorStop(1, "rgba(180,214,255,0)")
                ctx.strokeStyle = g
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(m.x, m.y)
                ctx.lineTo(m.x - m.len, m.y - m.len)
                ctx.stroke()
            }
            meteors = meteors.filter((m) => m.a > 0 && m.y < H + 60)
            raf = requestAnimationFrame(frame)
        }
        resize()
        window.addEventListener("resize", resize)
        frame()

        // Mouse light (transform/opacity only → GPU)
        const glow = glowRef.current!
        let tx = 0,
            ty = 0,
            cx = 0,
            cy = 0
        function onMove(e: MouseEvent) {
            tx = e.clientX
            ty = e.clientY
            glow.style.opacity = "1"
        }
        function follow() {
            cx += (tx - cx) * 0.12
            cy += (ty - cy) * 0.12
            glow.style.transform = `translate(${cx}px, ${cy}px)`
            requestAnimationFrame(follow)
        }
        window.addEventListener("mousemove", onMove)
        follow()

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("resize", resize)
            window.removeEventListener("mousemove", onMove)
        }
    }, [])

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {/* Gradient mesh base */}
            <div className="absolute inset-0 bg-grad-mesh" />
            <div className="absolute inset-0 bg-[#020617]/40" />
            {/* Aurora ribbon */}
            <div
                className="absolute -top-1/4 -left-1/4 h-2/3 w-[150%] blur-[70px] opacity-60"
                style={{
                    background:
                        "linear-gradient(100deg, transparent, rgba(34,211,238,.12), rgba(139,92,246,.14), transparent)",
                    animation: "float 14s ease-in-out infinite"
                }}
            />
            {/* Nebula blobs (GPU drift) */}
            <span className="absolute -left-24 -top-24 h-[460px] w-[460px] rounded-full opacity-50 blur-[90px] animate-drift" style={{ background: "radial-gradient(circle,#6d28d9,transparent 70%)" }} />
            <span className="absolute -bottom-32 -right-28 h-[520px] w-[520px] rounded-full opacity-50 blur-[90px] animate-drift" style={{ background: "radial-gradient(circle,#0891b2,transparent 70%)", animationDelay: "-9s" }} />
            <span className="absolute left-1/2 top-1/3 h-[380px] w-[380px] rounded-full opacity-30 blur-[90px] animate-drift" style={{ background: "radial-gradient(circle,#db2777,transparent 70%)", animationDelay: "-16s" }} />
            {/* Floating planet */}
            <div
                className="absolute right-[6%] top-[16%] h-28 w-28 rounded-full animate-float"
                style={{
                    background: "radial-gradient(circle at 30% 30%, #a855f7, #4c1d95 60%, #1e1b4b)",
                    boxShadow: "0 0 60px rgba(168,85,247,.5), inset -10px -10px 30px rgba(0,0,0,.5)"
                }}
            >
                <span className="absolute -inset-4 -inset-x-10 rounded-full border-2 border-secondary/40" style={{ transform: "rotate(28deg)" }} />
            </div>
            {/* Starfield canvas */}
            <canvas ref={starsRef} className="absolute inset-0" />
            {/* Mouse light */}
            <div
                ref={glowRef}
                className="absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle, rgba(79,140,255,.10), transparent 65%)", left: 0, top: 0, marginLeft: "-250px", marginTop: "-250px" }}
            />
        </div>
    )
}
