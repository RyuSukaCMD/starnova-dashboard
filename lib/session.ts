import { getServerSession } from "next-auth"
import { getAuthOptions } from "./auth"
import { connectDB, dbReady } from "./mongo"
import { User } from "./models"

// Ambil user DB dari sesi (server-side). Return null bila belum login / DB down.
// TIDAK PERNAH throw → mencegah "Application error" di halaman.
export async function currentUser() {
    try {
        const session = await getServerSession(getAuthOptions())
        if (!session?.user?.email) return null
        const db = await connectDB()
        if (!db || !dbReady()) return null
        return await User.findOne({ email: session.user.email.toLowerCase() })
    } catch (e) {
        console.error("currentUser error:", (e as any)?.message)
        return null
    }
}

// Cek apakah user sedang login (tanpa perlu DB) — untuk membedakan
// "belum login" vs "DB bermasalah".
export async function sessionEmail() {
    try {
        const session = await getServerSession(getAuthOptions())
        return session?.user?.email?.toLowerCase() || null
    } catch {
        return null
    }
}
