import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#4F8CFF",
                secondary: "#8B5CF6",
                accent: "#22D3EE",
                glow: "#5EEAD4",
                danger: "#EF4444",
                success: "#22C55E",
                bg: "#020617",
                panel: "rgba(255,255,255,0.05)",
                "panel-border": "rgba(255,255,255,0.08)"
            },
            fontFamily: {
                sans: ["var(--font-sans)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "ui-monospace", "monospace"]
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem"
            },
            boxShadow: {
                neon: "0 0 0 1px rgba(79,140,255,0.15), 0 8px 40px -12px rgba(79,140,255,0.5)",
                "neon-purple": "0 0 0 1px rgba(139,92,246,0.15), 0 8px 40px -12px rgba(139,92,246,0.5)",
                float: "0 24px 60px -18px rgba(0,0,0,0.7)"
            },
            backgroundImage: {
                "grad-primary": "linear-gradient(120deg, #22D3EE, #4F8CFF 45%, #8B5CF6)",
                "grad-mesh":
                    "radial-gradient(60% 60% at 80% -10%, rgba(139,92,246,0.25), transparent 60%), radial-gradient(50% 50% at 10% 20%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(60% 60% at 50% 120%, rgba(79,140,255,0.2), transparent 60%)"
            },
            keyframes: {
                float: {
                    "0%,100%": { transform: "translateY(0) rotate(-1deg)" },
                    "50%": { transform: "translateY(-14px) rotate(1deg)" }
                },
                drift: {
                    "0%,100%": { transform: "translate(0,0) scale(1)" },
                    "33%": { transform: "translate(50px,30px) scale(1.1)" },
                    "66%": { transform: "translate(-30px,20px) scale(0.95)" }
                },
                shimmer: {
                    "100%": { transform: "translateX(100%)" }
                },
                "pulse-glow": {
                    "0%,100%": { opacity: "1" },
                    "50%": { opacity: "0.4" }
                }
            },
            animation: {
                float: "float 8s cubic-bezier(0.22,1,0.36,1) infinite",
                drift: "drift 26s cubic-bezier(0.22,1,0.36,1) infinite",
                shimmer: "shimmer 1.6s infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite"
            }
        }
    },
    plugins: []
}
export default config
