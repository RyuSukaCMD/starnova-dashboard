import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB, dbReady } from "@/lib/mongo"

// Diagnostik koneksi DB. Buka: https://DOMAIN/api/debug/db
// Menampilkan status koneksi + pesan error asli (tanpa membocorkan URI).
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function mask(uri: string) {
    // sembunyikan kredensial, tampilkan host + db saja untuk verifikasi
    try {
        const m = uri.match(/@([^/]+)\/([^?]*)/)
        return m ? `host=${m[1]} db=${m[2] || "(default)"}` : "(format tak dikenal)"
    } catch {
        return "(parse gagal)"
    }
}

export async function GET() {
    const uri = process.env.MONGODB_URI || ""
    const info: any = {
        uriPresent: !!uri,
        uriInfo: uri ? mask(uri) : null,
        startsWithSrv: uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://"),
        readyStateBefore: mongoose.connection?.readyState ?? -1
    }
    if (!uri) {
        return NextResponse.json({ status: false, ...info, error: "MONGODB_URI kosong." })
    }
    const t0 = Date.now()
    try {
        const conn = await connectDB()
        info.readyStateAfter = mongoose.connection?.readyState ?? -1
        info.connectMs = Date.now() - t0
        info.dbReady = dbReady()
        if (!conn || !dbReady()) {
            return NextResponse.json({
                status: false,
                ...info,
                error: "connectDB() tidak menghasilkan koneksi aktif. Cek Network Access (0.0.0.0/0), user/password, & nama database."
            })
        }
        // coba ping
        await mongoose.connection.db.admin().ping()
        return NextResponse.json({ status: true, ...info, ping: "ok" })
    } catch (e: any) {
        return NextResponse.json({
            status: false,
            ...info,
            connectMs: Date.now() - t0,
            error: e?.message || String(e),
            name: e?.name,
            code: e?.code
        })
    }
}
