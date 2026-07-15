import { connectDB, dbReady } from "./mongo"
import { User, ApiKey, Settings } from "./models"
import { registryStats, docTree } from "./registry"

// Data untuk landing page (di-fetch di SERVER — bukan client).
export async function getPublicStats() {
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
    return {
        totalRequest,
        totalApi: eps.total,
        liveApi: eps.live,
        categories: eps.categories,
        activeUser,
        activeKeys,
        uptime: "99.99%",
        onlineServer: 1
    }
}

export function getDocTree() {
    return docTree()
}
