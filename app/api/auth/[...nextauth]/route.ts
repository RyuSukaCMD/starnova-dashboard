import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth"

// Bangun handler dengan opsi yang dibaca runtime (env selalu segar).
export const dynamic = "force-dynamic"
const handler = NextAuth(getAuthOptions())
export { handler as GET, handler as POST }
