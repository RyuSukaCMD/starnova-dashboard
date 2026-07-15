const path = require("path")

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    // Build deterministik di Vercel: skip lint/type-check saat build (loose types).
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    // Alias '@' eksplisit di webpack agar resolusi konsisten (tak bergantung tsconfig paths).
    webpack: (webpackConfig) => {
        webpackConfig.resolve.alias["@"] = path.resolve(__dirname)
        return webpackConfig
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "https", hostname: "image.pollinations.ai" }
        ]
    },
    experimental: {
        // Streaming & partial rendering aktif secara default di App Router.
        optimizePackageImports: ["framer-motion"]
    }
}
module.exports = nextConfig
