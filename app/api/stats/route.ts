import { NextResponse } from "next/server"
import { connectDB, dbReady } from "@/lib/mongo"
import { User, ApiKey, Settings } from "@/lib/models"
import { registryStats } from "@/lib/registry"
import { STANDARD_CREATOR } from "@/lib/config"

export const dynamic = "force-dynamic"

export async function GET() {
    const eps = registryStats()
    let totalRequest = 0,
        activeUser = 0,
        activeKeys = 0
    await connectDB().catch(() => {})
    if (dbReady()) {
        try {
            const s = await Settings.findOne({ key: "global" }).lean<any>()
            totalRequest = s?.totalRequestCounter || 0
            activeUser = await User.countDocuments({ banned: false })
            activeKeys = await ApiKey.countDocuments({ status: "active" })
        } catch {}
    }
    return NextResponse.json({
        status: true,
        creator: STANDARD_CREATOR,
        result: {
            totalRequest,
            totalApi: eps.total,
            liveApi: eps.live,
            categories: eps.categories,
            activeUser,
            activeKeys,
            uptime: "99.99%",
            onlineServer: 1
        }
    })
}
