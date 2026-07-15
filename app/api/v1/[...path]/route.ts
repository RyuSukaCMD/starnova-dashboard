import { NextRequest, NextResponse } from "next/server"
import { runApiRequest } from "@/lib/runner"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function ctxFrom(req: NextRequest) {
    return {
        apiKey:
            req.headers.get("apikey") ||
            req.headers.get("x-api-key") ||
            req.nextUrl.searchParams.get("apikey") ||
            undefined,
        ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined,
        userAgent: req.headers.get("user-agent") || undefined
    }
}

async function handle(req: NextRequest, path: string, extra: Record<string, any> = {}) {
    const fullPath = "/api/v1/" + path
    const params: Record<string, any> = { ...extra }
    req.nextUrl.searchParams.forEach((v, k) => {
        if (k !== "apikey") params[k] = v
    })
    const ctx = ctxFrom(req)
    const { status, body } = await runApiRequest(fullPath, params, ctx)
    return NextResponse.json(body, { status })
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    return handle(req, params.path.join("/"))
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
    let body: any = {}
    try {
        body = await req.json()
    } catch {}
    return handle(req, params.path.join("/"), body)
}
