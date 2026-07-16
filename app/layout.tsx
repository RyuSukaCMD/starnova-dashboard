import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import SpaceBackground from "@/components/space/SpaceBackground"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Providers from "@/components/Providers"
import config from "@/lib/config"

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" })

export const metadata: Metadata = {
    metadataBase: new URL(config.siteUrl),
    title: {
        default: "StarNova — High Performance REST API Platform",
        template: "%s · StarNova"
    },
    description:
        "StarNova — platform REST API berperforma tinggi. AI, Downloader, Search, Utility, dan ratusan endpoint siap pakai dengan dashboard modern.",
    keywords: ["rest api", "starnova", "ai api", "downloader api", "api platform"],
    openGraph: {
        title: "StarNova API",
        description: "High Performance REST API Platform.",
        url: config.siteUrl,
        siteName: "StarNova",
        type: "website"
    },
    robots: { index: true, follow: true }
}

export const viewport: Viewport = {
    themeColor: "#020617",
    width: "device-width",
    initialScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id" className={`${sans.variable} ${mono.variable}`}>
            <body className="font-sans antialiased">
                <Providers>
                    <SpaceBackground />
                    <Navbar />
                    <main className="relative z-10 min-h-screen">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}
