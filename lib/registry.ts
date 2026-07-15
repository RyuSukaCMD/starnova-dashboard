import * as P from "./providers"
import { STANDARD_CREATOR } from "./config"

export type Param = {
    name: string
    type: string
    required: boolean
    description?: string
    example?: string
}
export type Endpoint = {
    category: string
    method: string
    path: string
    name: string
    description: string
    params: Param[]
    responseExample: any
    errorExample: any
    live: boolean
    handler: (params: Record<string, any>) => Promise<any>
}

const endpoints: Endpoint[] = []
const byKey = new Map<string, Endpoint>()

function reg(def: Partial<Endpoint>) {
    const ep: Endpoint = {
        category: def.category || "General",
        method: (def.method || "GET").toUpperCase(),
        path: def.path!,
        name: def.name || def.path!,
        description: def.description || "",
        params: def.params || [],
        responseExample: def.responseExample ?? { status: true },
        errorExample: def.errorExample ?? { status: false, message: "Invalid API Key" },
        live: !!def.live,
        handler: def.handler || (async () => ({ message: "ok" }))
    }
    endpoints.push(ep)
    byKey.set(ep.path, ep)
    return ep
}
const ok = (result: any) => ({ status: true, creator: STANDARD_CREATOR, result })

// ── Stub builder ──
function stub(o: {
    category: string
    path: string
    name: string
    description: string
    params?: Param[]
    sample?: any
}) {
    reg({
        category: o.category,
        path: o.path,
        name: o.name,
        description: o.description,
        params: o.params || [],
        responseExample: ok(o.sample ?? { message: `${o.name} contoh.` }),
        live: false,
        handler: async (p) => ({
            message: `Endpoint '${o.name}' aktif (mode contoh — sambungkan provider).`,
            params: p,
            sample: o.sample ?? null
        })
    })
}

const AI_PERSONA = "You are StarNova AI, helpful & concise. Reply in the user's language."

// ── AI ──
reg({
    category: "AI",
    path: "/api/v1/ai/chat",
    name: "AI Chat",
    description: "Chat AI serba guna (gratis, pollinations).",
    params: [{ name: "text", type: "string", required: true, description: "Prompt", example: "Halo!" }],
    responseExample: ok({ answer: "Halo! Ada yang bisa kubantu?" }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        return { answer: await P.aiChat(p.text, AI_PERSONA) }
    }
})
reg({
    category: "AI",
    path: "/api/v1/ai/image",
    name: "AI Image Generator",
    description: "Generate gambar dari teks.",
    params: [
        { name: "prompt", type: "string", required: true, description: "Deskripsi", example: "nebula galaxy" },
        { name: "ratio", type: "string", required: false, description: "1:1|16:9|9:16", example: "16:9" }
    ],
    responseExample: ok({ url: "https://image.pollinations.ai/..." }),
    live: true,
    handler: async (p) => {
        if (!p.prompt) throw { code: 400, message: "Parameter 'prompt' wajib." }
        const dims: any = { "1:1": [1024, 1024], "16:9": [1280, 720], "9:16": [720, 1280] }
        const [w, h] = dims[p.ratio] || dims["1:1"]
        return { url: P.aiImage(p.prompt, w, h), prompt: p.prompt }
    }
})
const AI_TASKS: [string, string, string, string][] = [
    ["gpt4", "GPT-4", "Model GPT-4 style.", "You are GPT-4, highly capable."],
    ["gpt5", "GPT-5 Ready", "Slot GPT-5.", "You are an advanced next-gen assistant."],
    ["deepseek", "DeepSeek", "Reasoning & code.", "You are DeepSeek."],
    ["gemini", "Gemini", "Gemini style.", "You are Gemini by Google."],
    ["claude", "Claude", "Thoughtful assistant.", "You are Claude, thoughtful & safe."],
    ["llama", "Llama", "Meta Llama.", "You are Llama."],
    ["qwen", "Qwen", "Multilingual.", "You are Qwen."],
    ["translate", "AI Translate", "Terjemahkan.", "Translate the text. Reply ONLY the translation."],
    ["summarize", "AI Summarize", "Ringkas.", "Summarize concisely."],
    ["rewrite", "AI Rewrite", "Tulis ulang.", "Rewrite clearly."],
    ["code", "AI Code", "Buat kode.", "Senior engineer. Clean code + brief comments."],
    ["fixcode", "AI Fix Code", "Perbaiki bug.", "Find & fix bugs. Return code + note."],
    ["sql", "AI SQL", "Buat query SQL.", "Generate correct SQL."],
    ["regex", "AI Regex", "Buat regex.", "Generate regex + explain."],
    ["story", "AI Story", "Buat cerita.", "Write an engaging short story."],
    ["email", "AI Email", "Buat email.", "Write a professional email."],
    ["caption", "AI Caption", "Caption medsos.", "Catchy caption + emojis."],
    ["hashtag", "AI Hashtag", "Hashtag.", "Generate 15 relevant hashtags."],
    ["grammar", "AI Grammar", "Perbaiki grammar.", "Fix grammar. Return corrected text."],
    ["explain", "AI Explain", "Jelaskan.", "Explain simply with examples."]
]
for (const [slug, name, desc, sys] of AI_TASKS) {
    reg({
        category: "AI",
        path: `/api/v1/ai/${slug}`,
        name,
        description: desc,
        params: [{ name: "text", type: "string", required: true, description: "Input", example: "Contoh" }],
        responseExample: ok({ answer: "..." }),
        live: true,
        handler: async (p) => {
            if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
            return { answer: await P.aiChat(p.text, sys) }
        }
    })
}
for (const [slug, name, desc] of [
    ["upscale", "AI Upscale", "Perbesar resolusi."],
    ["removebg", "AI Remove BG", "Hapus background."],
    ["anime", "AI Anime", "Foto → anime."],
    ["ocr", "AI OCR", "Gambar → teks."],
    ["tts", "AI Text To Speech", "Teks → suara."],
    ["music", "AI Music", "Generate musik."],
    ["vision", "AI Vision", "Analisa gambar."]
] as [string, string, string][]) {
    stub({
        category: "AI",
        path: `/api/v1/ai/${slug}`,
        name,
        description: desc,
        params: [{ name: "url", type: "string", required: true, description: "URL input", example: "https://..." }],
        sample: { output: `${name} contoh` }
    })
}

// ── Downloader ──
reg({
    category: "Downloader",
    path: "/api/v1/download/tiktok",
    name: "TikTok Downloader",
    description: "Unduh TikTok tanpa watermark.",
    params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://vt.tiktok.com/x" }],
    responseExample: ok({ title: "...", video: "https://..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        return P.tiktok(p.url)
    }
})
reg({
    category: "Downloader",
    path: "/api/v1/download/ytmp3",
    name: "YouTube MP3",
    description: "Unduh audio YouTube.",
    params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://youtu.be/x" }],
    responseExample: ok({ title: "...", url: "https://...mp3" }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        return P.ytmp3(p.url)
    }
})
reg({
    category: "Downloader",
    path: "/api/v1/download/ytmp4",
    name: "YouTube MP4",
    description: "Unduh video YouTube.",
    params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://youtu.be/x" }],
    responseExample: ok({ title: "...", url: "https://...mp4" }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        return P.ytmp4(p.url)
    }
})
for (const [slug, name] of [
    ["instagram", "Instagram"],
    ["facebook", "Facebook"],
    ["twitter", "Twitter/X"],
    ["threads", "Threads"],
    ["pinterest", "Pinterest"],
    ["spotify", "Spotify"],
    ["soundcloud", "SoundCloud"],
    ["mediafire", "Mediafire"],
    ["gdrive", "Google Drive"],
    ["terabox", "Terabox"],
    ["capcut", "CapCut"],
    ["snackvideo", "SnackVideo"],
    ["likee", "Likee"],
    ["reddit", "Reddit Video"]
] as [string, string][]) {
    stub({
        category: "Downloader",
        path: `/api/v1/download/${slug}`,
        name: `${name} Downloader`,
        description: `Unduh media dari ${name}.`,
        params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }],
        sample: { title: "Contoh", url: "https://cdn.example/media.mp4" }
    })
}

// ── Search ──
reg({
    category: "Search",
    path: "/api/v1/search/youtube",
    name: "Search YouTube",
    description: "Cari video YouTube.",
    params: [{ name: "q", type: "string", required: true, description: "Kata kunci", example: "lofi" }],
    responseExample: ok([{ title: "...", url: "https://youtu.be/..." }]),
    live: true,
    handler: async (p) => {
        if (!p.q) throw { code: 400, message: "Parameter 'q' wajib." }
        return P.ytsearch(p.q)
    }
})
reg({
    category: "Search",
    path: "/api/v1/search/web",
    name: "Search Web",
    description: "Pencarian web instan.",
    params: [{ name: "q", type: "string", required: true, description: "Kata kunci", example: "starnova" }],
    responseExample: ok({ heading: "...", abstract: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.q) throw { code: 400, message: "Parameter 'q' wajib." }
        return P.ddgSearch(p.q)
    }
})
reg({
    category: "Search",
    path: "/api/v1/search/lyrics",
    name: "Search Lyrics",
    description: "Cari lirik lagu.",
    params: [
        { name: "artist", type: "string", required: true, description: "Artis", example: "Coldplay" },
        { name: "title", type: "string", required: true, description: "Judul", example: "Yellow" }
    ],
    responseExample: ok({ lyrics: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.artist || !p.title) throw { code: 400, message: "'artist' & 'title' wajib." }
        return { lyrics: await P.lyrics(p.artist, p.title) }
    }
})
for (const s of ["spotify", "tiktok", "instagram", "pinterest", "wallpaper", "anime", "manga", "movie", "github", "npm", "game", "sticker"]) {
    stub({
        category: "Search",
        path: `/api/v1/search/${s}`,
        name: `Search ${s[0].toUpperCase() + s.slice(1)}`,
        description: `Cari ${s}.`,
        params: [{ name: "q", type: "string", required: true, description: "Kata kunci", example: "contoh" }],
        sample: [{ title: `Hasil ${s} 1`, url: "https://example.com/1" }]
    })
}

// ── Utility (banyak LIVE) ──
reg({
    category: "Utility",
    path: "/api/v1/utility/qr",
    name: "QR Generator",
    description: "Buat QR code.",
    params: [{ name: "text", type: "string", required: true, description: "Isi QR", example: "https://starnova.my.id" }],
    responseExample: ok({ url: "https://api.qrserver.com/..." }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        return { url: P.qrGenerate(p.text) }
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/ip",
    name: "IP Lookup / GeoIP",
    description: "Info lokasi & ISP.",
    params: [{ name: "ip", type: "string", required: false, description: "IP", example: "8.8.8.8" }],
    responseExample: ok({ query: "8.8.8.8", country: "United States" }),
    live: true,
    handler: async (p) => P.ipLookup(p.ip || "")
})
reg({
    category: "Utility",
    path: "/api/v1/utility/weather",
    name: "Weather",
    description: "Cuaca terkini.",
    params: [{ name: "city", type: "string", required: true, description: "Kota", example: "Jakarta" }],
    responseExample: ok({ city: "Jakarta", tempC: "30" }),
    live: true,
    handler: async (p) => {
        if (!p.city) throw { code: 400, message: "Parameter 'city' wajib." }
        return P.weather(p.city)
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/base64",
    name: "Base64 Encode/Decode",
    description: "Encode/decode Base64.",
    params: [
        { name: "text", type: "string", required: true, description: "Teks", example: "hello" },
        { name: "mode", type: "string", required: false, description: "encode|decode", example: "encode" }
    ],
    responseExample: ok({ result: "aGVsbG8=" }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        return p.mode === "decode"
            ? { result: Buffer.from(String(p.text), "base64").toString("utf8") }
            : { result: Buffer.from(String(p.text)).toString("base64") }
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/uuid",
    name: "UUID Generator",
    description: "Generate UUID v4.",
    params: [],
    responseExample: ok({ uuid: "xxxx-xxxx" }),
    live: true,
    handler: async () => ({ uuid: crypto.randomUUID() })
})
reg({
    category: "Utility",
    path: "/api/v1/utility/password",
    name: "Password Generator",
    description: "Password acak kuat.",
    params: [{ name: "length", type: "number", required: false, description: "Panjang", example: "20" }],
    responseExample: ok({ password: "aB3!xY" }),
    live: true,
    handler: async (p) => {
        const len = Math.min(128, Math.max(6, Number(p.length) || 16))
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        const b = crypto.getRandomValues(new Uint32Array(len))
        let pw = ""
        for (let i = 0; i < len; i++) pw += chars[b[i] % chars.length]
        return { password: pw }
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/randomquote",
    name: "Random Quote",
    description: "Kutipan acak.",
    params: [],
    responseExample: ok({ quote: "..." }),
    live: true,
    handler: async () => ({ quote: await P.randomAdvice() })
})
reg({
    category: "Utility",
    path: "/api/v1/utility/randomcat",
    name: "Random Cat",
    description: "Gambar kucing acak.",
    params: [],
    responseExample: ok({ url: "https://..." }),
    live: true,
    handler: async () => ({ url: await P.randomCat() })
})
reg({
    category: "Utility",
    path: "/api/v1/utility/randomdog",
    name: "Random Dog",
    description: "Gambar anjing acak.",
    params: [],
    responseExample: ok({ url: "https://..." }),
    live: true,
    handler: async () => ({ url: await P.randomDog() })
})
for (const [slug, name, params] of [
    ["shorturl", "Short URL", [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }]],
    ["hash", "Hash Generator", [{ name: "text", type: "string", required: true, description: "Teks", example: "hello" }]],
    ["screenshot", "Screenshot Website", [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }]],
    ["translate", "Translate", [{ name: "text", type: "string", required: true, description: "Teks", example: "hello" }]],
    ["currency", "Currency Convert", [{ name: "from", type: "string", required: true, description: "Dari", example: "USD" }, { name: "to", type: "string", required: true, description: "Ke", example: "IDR" }]]
] as [string, string, Param[]][]) {
    stub({ category: "Utility", path: `/api/v1/utility/${slug}`, name, description: name + ".", params, sample: { output: `${name} contoh` } })
}

// ── Brat / Image / Text ──
for (const [slug, name] of [["image", "Brat Image"], ["video", "Brat Video"], ["hd", "Brat HD"]] as [string, string][]) {
    stub({
        category: "Brat",
        path: `/api/v1/brat/${slug}`,
        name,
        description: `${name} generator.`,
        params: [{ name: "text", type: "string", required: true, description: "Teks", example: "starnova" }],
        sample: { url: "https://cdn.example/brat.png" }
    })
}
for (const s of ["removebg", "upscale", "resize", "compress", "blur", "grayscale", "meme"]) {
    stub({
        category: "Image",
        path: `/api/v1/image/${s}`,
        name: s[0].toUpperCase() + s.slice(1),
        description: `${s} untuk gambar.`,
        params: [{ name: "url", type: "string", required: true, description: "URL gambar", example: "https://..." }],
        sample: { url: "https://cdn.example/out.png" }
    })
}
for (const s of ["ocr", "summarize", "grammar", "rewrite", "humanize", "tts"]) {
    stub({
        category: "Text",
        path: `/api/v1/text/${s}`,
        name: s[0].toUpperCase() + s.slice(1),
        description: `${s} untuk teks.`,
        params: [{ name: "text", type: "string", required: true, description: "Teks", example: "hello" }],
        sample: { output: `${s} contoh` }
    })
}

// ── Public API ──
export function allEndpoints() {
    return endpoints
}
export function getEndpoint(path: string) {
    return byKey.get(path) || null
}
export function docTree() {
    const map: Record<string, any[]> = {}
    for (const ep of endpoints) {
        ;(map[ep.category] ||= []).push({
            method: ep.method,
            path: ep.path,
            name: ep.name,
            description: ep.description,
            params: ep.params,
            responseExample: ep.responseExample,
            errorExample: ep.errorExample,
            live: ep.live
        })
    }
    return Object.keys(map)
        .sort()
        .map((c) => ({ category: c, count: map[c].length, endpoints: map[c].sort((a, b) => a.path.localeCompare(b.path)) }))
}
export function registryStats() {
    return {
        total: endpoints.length,
        live: endpoints.filter((e) => e.live).length,
        categories: new Set(endpoints.map((e) => e.category)).size
    }
}
