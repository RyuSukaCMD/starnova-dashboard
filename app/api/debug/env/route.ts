import { NextResponse } from "next/server"

// Diagnostik AMAN: cek apakah server BISA membaca env (tanpa membocorkan nilai).
// Buka: https://DOMAIN/api/debug/env
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
    const has = (v?: string) => !!(v && v.trim().length > 0)
    return NextResponse.json({
        status: true,
        note: "Menampilkan APAKAH env terbaca (bukan nilainya).",
        env: {
            GOOGLE_CLIENT_ID: has(process.env.GOOGLE_CLIENT_ID),
            GOOGLE_CLIENT_SECRET: has(process.env.GOOGLE_CLIENT_SECRET),
            NEXTAUTH_SECRET: has(process.env.NEXTAUTH_SECRET),
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
            MONGODB_URI: has(process.env.MONGODB_URI),
            ALLOW_DEMO_LOGIN: process.env.ALLOW_DEMO_LOGIN || null
        },
        // Panjang client id (untuk pastikan tidak kosong/terpotong)
        googleClientIdLength: (process.env.GOOGLE_CLIENT_ID || "").trim().length
    })
}
