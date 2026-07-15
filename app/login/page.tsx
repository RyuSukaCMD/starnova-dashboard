import { Suspense } from "react"
import { PageTransition } from "@/components/ui/Motion"
import LoginCard from "@/components/auth/LoginCard"
import config from "@/lib/config"

export const metadata = { title: "Sign In" }
export const dynamic = "force-dynamic"

export default function LoginPage() {
    const hasGoogle = !!config.google.clientId
    return (
        <PageTransition>
            <section className="grid min-h-screen place-items-center px-4 py-24">
                <Suspense fallback={<div className="glass h-96 w-full max-w-md rounded-2xl" />}>
                    <LoginCard hasGoogle={hasGoogle} allowDemo={config.allowDemoLogin} />
                </Suspense>
            </section>
        </PageTransition>
    )
}
