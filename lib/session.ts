import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { connectDB } from "./mongo"
import { User } from "./models"

// Ambil user DB dari sesi (server-side). Return null bila belum login.
export async function currentUser() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return null
    await connectDB()
    return User.findOne({ email: session.user.email.toLowerCase() })
}
