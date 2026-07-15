import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@/lib/session"
import { ApiKey } from "@/lib/models"
import { createApiKey } from "@/lib/apikey"

export const dynamic = "force-dynamic"
const bad = (c: number, m: string) => NextResponse.json({ status: false, message: m }, { status: c })

export async function GET() {
    const user = await currentUser()
    if (!user) return bad(401, "Belum login.")
    // Auto-generate API key pertama bila belum punya (fallback signIn hook).
    const count = await ApiKey.countDocuments({ user: user._id })
    if (count === 0) await createApiKey({ userId: user._id, plan: user.plan || "free", name: "Default Key" })
    const keys = await ApiKey.find({ user: user._id }).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ status: true, result: keys })
}

export async function POST(req: NextRequest) {
    const user = await currentUser()
    if (!user) return bad(401, "Belum login.")
    let body: any = {}
    try {
        body = await req.json()
    } catch {}
    const doc = await createApiKey({ userId: user._id, plan: user.plan || "free", name: body.name || "My Key" })
    return NextResponse.json({ status: true, result: doc })
}
