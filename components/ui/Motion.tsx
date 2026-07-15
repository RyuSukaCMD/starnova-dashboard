"use client"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef, useState, type ReactNode } from "react"

const EASE = [0.22, 1, 0.36, 1] as const

// Page transition wrapper (fade + slide + blur)
export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: EASE }}
        >
            {children}
        </motion.div>
    )
}

// Scroll reveal (stagger-friendly)
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-60px" })
    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay }}
        >
            {children}
        </motion.div>
    )
}

export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
            {children}
        </motion.div>
    )
}
export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div className={className} variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}>
            {children}
        </motion.div>
    )
}

// Animated number counter. `decimals` menghindari passing fungsi dari server component.
export function Counter({ value, className = "", decimals = 0, suffix = "" }: { value: number; className?: string; decimals?: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true })
    const mv = useMotionValue(0)
    const spring = useSpring(mv, { duration: 1.2, bounce: 0 })
    const [txt, setTxt] = useState("0")
    useEffect(() => {
        if (inView) mv.set(value)
    }, [inView, value, mv])
    useEffect(
        () =>
            spring.on("change", (v) => {
                const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("id-ID")
                setTxt(n + suffix)
            }),
        [spring, decimals, suffix]
    )
    return (
        <span ref={ref} className={className}>
            {txt}
        </span>
    )
}

// 3D tilt + glow card
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
    const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
    function onMove(e: React.MouseEvent) {
        const el = ref.current!
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry.set(px * 8)
        rx.set(-py * 8)
        el.style.setProperty("--mx", `${e.clientX - r.left}px`)
        el.style.setProperty("--my", `${e.clientY - r.top}px`)
    }
    function reset() {
        rx.set(0)
        ry.set(0)
    }
    return (
        <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={reset}
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={`group relative ${className}`}
        >
            {/* spotlight follow */}
            <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(280px circle at var(--mx,50%) var(--my,50%), rgba(79,140,255,.12), transparent 60%)" }}
            />
            {children}
        </motion.div>
    )
}
