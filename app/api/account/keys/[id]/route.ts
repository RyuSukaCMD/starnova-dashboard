import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@/lib/session"
import { ApiKey } from "@/lib/models"

export const dynamic = "force-dynamic"
const bad = (c: number, m: string) => NextResponse.json({ status: false, message: m }, { status: c })

async function own(key: string) {
    const user = await currentUser()
    if (!user) return { user: null, doc: null }
    const doc = await ApiKey.findOne({ key })
    if (!doc || String(doc.user) !== String(user._id)) return { user, doc: null }
    return { user, doc }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const { user, doc } = await own(params.id)
    if (!user) return bad(401, "Belum login.")
    if (!doc) return bad(404, "Key tidak ditemukan.")
    await ApiKey.deleteOne({ key: params.id })
    return NextResponse.json({ status: true, result: { deleted: true } })
}

// aksi: enable | disable | regenerate  (body { action })
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { user, doc } = await own(params.id)
    if (!user) return bad(401, "Belum login.")
    if (!doc) return bad(404, "Key tidak ditemukan.")
    let action = ""
    try {
        action = (await req.json()).action
    } catch {}
    if (action === "enable") doc.status = "active"
    else if (action === "disable") doc.status = "disabled"
    else if (action === "regenerate") {
        const { generateKey } = await import("@/lib/apikey")
        doc.key = generateKey()
    } else return bad(400, "Aksi tidak valid.")
    await doc.save()
    return NextResponse.json({ status: true, result: doc })
}
