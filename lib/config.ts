// Konfigurasi terpusat — dibaca LAZY dari environment.
// PENTING: nilai env non-NEXT_PUBLIC hanya tersedia di runtime server. Karena
// itu semua dibaca lewat GETTER (bukan const literal) agar tidak "beku" kosong
// saat build. Ini yang memperbaiki bug "GOOGLE_CLIENT_ID ga kebaca".
export const config = {
    appName: "StarNova",
    get creator() {
        return process.env.CREATOR || "StarNova API"
    },
    get siteUrl() {
        return (
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXTAUTH_URL ||
            "https://dash.starnova.my.id"
        )
    },
    get mongoUri() {
        return process.env.MONGODB_URI || ""
    },
    get jwtSecret() {
        return process.env.NEXTAUTH_SECRET || "starnova-dev-secret"
    },
    // Admin default: starnovabusinessmail@gmail.com (bisa ditambah lewat ADMIN_EMAILS).
    get adminEmails() {
        return [
            "starnovabusinessmail@gmail.com",
            ...(process.env.ADMIN_EMAILS || "")
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean)
        ]
    },
    get google() {
        return {
            clientId: (process.env.GOOGLE_CLIENT_ID || "").trim(),
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim()
        }
    },
    // Login default = Google OAuth. Demo login OFF kecuali di-set true.
    get allowDemoLogin() {
        return process.env.ALLOW_DEMO_LOGIN === "true"
    }
}

export const API_KEY_PREFIX = "snv_"
export function creatorName() {
    return config.creator
}
export const STANDARD_CREATOR = "StarNova API"
export default config
