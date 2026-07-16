import { getServerSession } from "next-auth"
import { getAuthOptions } from "./auth"
import { connectDB, dbReady } from "./mongo"
import { User } from "./models"
import { ensureUserKey } from "./apikey"
import config from "./config"

// Ambil (atau BUAT) user DB dari sesi. Return null hanya bila belum login /
// DB benar-benar down. TIDAK PERNAH throw.
export async function currentUser() {
    try {
        const session = await getServerSession(getAuthOptions())
        const email = session?.user?.email?.toLowerCase()
        if (!email) return null

        const db = await connectDB()
        if (!db || !dbReady()) return null

        let user = await User.findOne({ email })
        // Fallback: kalau user belum ada (mis. login pertama saat DB belum siap),
        // buat sekarang + auto-generate API key. Ini memperbaiki dashboard yang
        // "belum siap" padahal DB sudah konek.
        if (!user) {
            user = await User.create({
                name: session!.user!.name || email.split("@")[0],
                email,
                image: (session!.user as any)?.image || "",
                role: config.adminEmails.includes(email) ? "admin" : "user",
                plan: "free"
            })
            await ensureUserKey(user._id, user.plan).catch(() => {})
        } else if (config.adminEmails.includes(email) && user.role !== "admin") {
            user.role = "admin"
            await user.save().catch(() => {})
        }
        return user
    } catch (e) {
        console.error("currentUser error:", (e as any)?.message)
        return null
    }
}

export async function sessionEmail() {
    try {
        const session = await getServerSession(getAuthOptions())
        return session?.user?.email?.toLowerCase() || null
    } catch {
        return null
    }
}
