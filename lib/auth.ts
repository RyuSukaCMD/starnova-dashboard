import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "./mongo"
import { User } from "./models"
import { ensureUserKey } from "./apikey"
import config from "./config"

// Bangun opsi NextAuth SECARA LAZY tiap dipakai → env dibaca runtime,
// bukan beku saat build (perbaikan bug env Google tak terbaca).
export function getAuthOptions(): NextAuthOptions {
    const providers: any[] = []

    if (config.google.clientId && config.google.clientSecret) {
        providers.push(
            GoogleProvider({
                clientId: config.google.clientId,
                clientSecret: config.google.clientSecret
            })
        )
    }

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

    return {
        providers,
        secret: config.jwtSecret,
        session: { strategy: "jwt" },
        pages: { signIn: "/login" },
        callbacks: {
            async signIn({ user }) {
                try {
                    const db = await connectDB()
                    if (!db || !user?.email) return true
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
                    } else if (config.adminEmails.includes(email) && dbUser.role !== "admin") {
                        dbUser.role = "admin"
                        await dbUser.save()
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
}

// Kompatibilitas: `authOptions` tetap tersedia (getServerSession(authOptions)).
export const authOptions: NextAuthOptions = getAuthOptions()
