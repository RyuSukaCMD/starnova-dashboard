// Konfigurasi terpusat — dibaca dari environment (single domain, configurable).
export const config = {
    appName: "StarNova",
    creator: process.env.CREATOR || "StarNova API",
    // Satu domain untuk semuanya (landing + dashboard + api). Set di .env.
    siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXTAUTH_URL ||
        "https://starnova.my.id",
    mongoUri: process.env.MONGODB_URI || "",
    jwtSecret: process.env.NEXTAUTH_SECRET || "starnova-dev-secret",
    adminEmails: (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    },
    allowDemoLogin: process.env.ALLOW_DEMO_LOGIN !== "false"
}

export const API_KEY_PREFIX = "snv_"
export const STANDARD_CREATOR = config.creator
export default config
