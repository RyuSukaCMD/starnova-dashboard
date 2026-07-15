"use client"
import { useRef, type ReactNode } from "react"
import clsx from "clsx"

type Props = {
    children: ReactNode
    onClick?: () => void
    href?: string
    variant?: "primary" | "ghost" | "danger"
    className?: string
    type?: "button" | "submit"
    disabled?: boolean
}

// Button dengan ripple + glow (GPU transform).
export default function Button({ children, onClick, href, variant = "primary", className, type = "button", disabled }: Props) {
    const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
    const base =
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] disabled:opacity-50"
    const variants = {
        primary:
            "text-white bg-[linear-gradient(120deg,#4F8CFF,#8B5CF6)] shadow-[0_10px_36px_-10px_rgba(120,90,255,.7)] hover:shadow-[0_14px_44px_-8px_rgba(120,90,255,.9),0_0_28px_rgba(34,211,238,.35)] hover:-translate-y-0.5",
        ghost: "text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
        danger: "text-red-200 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25"
    }
    function ripple(e: React.MouseEvent) {
        const el = ref.current!
        const r = el.getBoundingClientRect()
        const span = document.createElement("span")
        const size = Math.max(r.width, r.height)
        span.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;background:rgba(255,255,255,.35);width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px;transform:scale(0);opacity:.6;transition:transform .6s cubic-bezier(.22,1,.36,1),opacity .6s`
        el.appendChild(span)
        requestAnimationFrame(() => {
            span.style.transform = "scale(2.2)"
            span.style.opacity = "0"
        })
        setTimeout(() => span.remove(), 620)
    }
    const cls = clsx(base, variants[variant], className)
    if (href)
        return (
            <a ref={ref as any} href={href} className={cls} onMouseDown={ripple as any}>
                {children}
            </a>
        )
    return (
        <button ref={ref as any} type={type} disabled={disabled} className={cls} onMouseDown={ripple} onClick={onClick}>
            {children}
        </button>
    )
}
