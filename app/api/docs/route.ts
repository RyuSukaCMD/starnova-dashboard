import { NextResponse } from "next/server"
import { docTree } from "@/lib/registry"
import { STANDARD_CREATOR } from "@/lib/config"

export const revalidate = 3600 // ISR-friendly: docs semi-statis

export async function GET() {
    return NextResponse.json({ status: true, creator: STANDARD_CREATOR, result: docTree() })
}
