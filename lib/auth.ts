import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "./mongo"
import { User } from "./models"
import { ensureUserKey } from "./apikey"
import config from "./config"

const providers: any[] = []

// Google OAuth (aktif bila credential di-set).
if (config.google.clientId && config.google.clientSecret) {
    providers.push(
        GoogleProvider({
            clientId: config.google.clientId,
            clientSecret: config.google.clientSecret
        })
    )
}

// Demo login (untuk testing tanpa akun Google). Nonaktifkan via ALLOW_DEMO_LOGIN=false.
if (config.allowDemoLogin) {
    providers.push(
        CredentialsProvider({
            id: "demo",
            name: "Demo",
            credentials: { email: { label: "Email", type: "email" } },
            async authorize(cred) {
                const email = (cred?.email || `demo${Date.now()}@starnova.local`).toLowerCase()
                return { id: email, email, name: "Demo Explorer", image: "" }
            }
        })
    )
}

export const authOptions: NextAuthOptions = {
    providers,
    secret: config.jwtSecret,
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    callbacks: {
        async signIn({ user }) {
            // Buat/relasikan user + auto-generate API key saat login pertama.
            try {
                const db = await connectDB()
                if (!db || !user?.email) return true // tanpa DB, tetap izinkan (mode terbatas)
                const email = user.email.toLowerCase()
                let dbUser = await User.findOne({ email })
                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name || email.split("@")[0],
                        email,
                        image: (user as any).image || "",
                        role: config.adminEmails.includes(email) ? "admin" : "user",
                        plan: "free"
                    })
                }
                await ensureUserKey(dbUser._id, dbUser.plan)
            } catch (e) {
                console.error("signIn hook:", (e as any).message)
            }
            return true
        },
        async jwt({ token, user }) {
            if (user?.email) token.email = user.email.toLowerCase()
            return token
        },
        async session({ session }) {
            // Sisipkan role/plan dari DB.
            try {
                const db = await connectDB()
                if (db && session.user?.email) {
                    const u = await User.findOne({ email: session.user.email.toLowerCase() }).lean<any>()
                    if (u) {
                        ;(session.user as any).role = u.role
                        ;(session.user as any).plan = u.plan
                        ;(session.user as any).id = u._id.toString()
                    }
                }
            } catch {}
            return session
        }
    }
}
