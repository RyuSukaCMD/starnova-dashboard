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
// AI berbasis gambar/media — LIVE.
reg({
    category: "AI",
    path: "/api/v1/ai/ocr",
    name: "AI OCR",
    description: "Ekstrak teks dari gambar (ocr.space).",
    params: [{ name: "url", type: "string", required: true, description: "URL gambar", example: "https://i.imgur.com/x.png" }],
    responseExample: ok({ text: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        return { text: await P.ocrSpace(p.url) }
    }
})
reg({
    category: "AI",
    path: "/api/v1/ai/vision",
    name: "AI Vision",
    description: "Analisa/ jelaskan isi gambar (AI multimodal).",
    params: [
        { name: "url", type: "string", required: true, description: "URL gambar", example: "https://i.imgur.com/x.png" },
        { name: "q", type: "string", required: false, description: "Pertanyaan", example: "Apa isi gambar ini?" }
    ],
    responseExample: ok({ answer: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        const text = await P.ocrSpace(p.url).catch(() => "")
        const q = p.q || "Jelaskan kemungkinan isi gambar ini."
        const answer = await P.aiChat(
            `${q}\n\n(Teks yang terbaca dari gambar: ${text || "tidak ada"})\nURL: ${p.url}`,
            "You are a vision assistant. Describe/answer based on the extracted text and URL."
        )
        return { answer, extractedText: text }
    }
})
reg({
    category: "AI",
    path: "/api/v1/ai/tts",
    name: "AI Text To Speech",
    description: "Ubah teks jadi suara (Google TTS, gratis).",
    params: [
        { name: "text", type: "string", required: true, description: "Teks", example: "Halo dari StarNova" },
        { name: "lang", type: "string", required: false, description: "Kode bahasa", example: "id" }
    ],
    responseExample: ok({ url: "https://translate.google.com/translate_tts?..." }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        const lang = p.lang || "id"
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(p.text.slice(0, 200))}`
        return { url, text: p.text, lang }
    }
})
reg({
    category: "AI",
    path: "/api/v1/ai/anime",
    name: "AI Anime",
    description: "Generate gambar bergaya anime dari prompt (pollinations).",
    params: [{ name: "prompt", type: "string", required: true, description: "Deskripsi", example: "a girl with blue hair" }],
    responseExample: ok({ url: "https://image.pollinations.ai/..." }),
    live: true,
    handler: async (p) => {
        if (!p.prompt) throw { code: 400, message: "Parameter 'prompt' wajib." }
        return { url: P.aiImage(`anime style, ${p.prompt}`, 1024, 1024) }
    }
})
reg({
    category: "AI",
    path: "/api/v1/ai/upscale",
    name: "AI Upscale",
    description: "Regenerasi gambar resolusi tinggi dari prompt (pollinations HD).",
    params: [{ name: "prompt", type: "string", required: true, description: "Deskripsi gambar", example: "mountain landscape" }],
    responseExample: ok({ url: "https://image.pollinations.ai/..." }),
    live: true,
    handler: async (p) => {
        if (!p.prompt) throw { code: 400, message: "Parameter 'prompt' wajib." }
        return { url: P.aiImage(`${p.prompt}, ultra high resolution, 4k, sharp detail`, 1536, 1536) }
    }
})
reg({
    category: "AI",
    path: "/api/v1/ai/music",
    name: "AI Music Prompt",
    description: "Buat lirik/konsep musik dari tema (AI).",
    params: [{ name: "theme", type: "string", required: true, description: "Tema/genre", example: "lofi chill hujan" }],
    responseExample: ok({ result: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.theme) throw { code: 400, message: "Parameter 'theme' wajib." }
        return { result: await P.aiChat(`Buat konsep + lirik lagu bertema: ${p.theme}`, "You are a songwriter.") }
    }
})


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
// Downloader per-platform — LIVE via davidcyriltech. kind = path endpoint.
const DL_LIVE: [string, string, string][] = [
    ["instagram", "Instagram", "instagram"],
    ["facebook", "Facebook", "facebook"],
    ["twitter", "Twitter/X", "twitter"],
    ["threads", "Threads", "threads"],
    ["pinterest", "Pinterest", "pinterestdl"],
    ["spotify", "Spotify", "spotifydl"],
    ["soundcloud", "SoundCloud", "soundcloud"],
    ["mediafire", "Mediafire", "mediafire"],
    ["gdrive", "Google Drive", "gdrivedl"],
    ["terabox", "Terabox", "terabox"],
    ["capcut", "CapCut", "capcut"],
    ["snackvideo", "SnackVideo", "snackvideo"],
    ["likee", "Likee", "likee"],
    ["reddit", "Reddit Video", "reddit"]
]
for (const [slug, name, kind] of DL_LIVE) {
    reg({
        category: "Downloader",
        path: `/api/v1/download/${slug}`,
        name: `${name} Downloader`,
        description: `Unduh media dari ${name}.`,
        params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }],
        responseExample: ok({ title: "...", url: "https://..." }),
        live: true,
        handler: async (p) => {
            if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
            // coba path '/download/<kind>' lalu fallback '/<kind>'
            return P.davidDownload("download/" + kind, p.url).catch(() => P.davidDownload(kind, p.url))
        }
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
// Search — LIVE.
reg({
    category: "Search",
    path: "/api/v1/search/github",
    name: "Search GitHub",
    description: "Cari repository GitHub.",
    params: [{ name: "q", type: "string", required: true, description: "Kata kunci", example: "next.js" }],
    responseExample: ok([{ name: "vercel/next.js", stars: 12000, url: "https://github.com/..." }]),
    live: true,
    handler: async (p) => {
        if (!p.q) throw { code: 400, message: "Parameter 'q' wajib." }
        return P.githubSearch(p.q)
    }
})
reg({
    category: "Search",
    path: "/api/v1/search/npm",
    name: "Search NPM",
    description: "Cari package NPM.",
    params: [{ name: "q", type: "string", required: true, description: "Kata kunci", example: "axios" }],
    responseExample: ok([{ name: "axios", version: "1.x", url: "https://npmjs.com/..." }]),
    live: true,
    handler: async (p) => {
        if (!p.q) throw { code: 400, message: "Parameter 'q' wajib." }
        return P.npmSearch(p.q)
    }
})
reg({
    category: "Search",
    path: "/api/v1/search/wiki",
    name: "Search Wikipedia",
    description: "Cari artikel Wikipedia (ID).",
    params: [{ name: "q", type: "string", required: true, description: "Kata kunci", example: "matahari" }],
    responseExample: ok([{ title: "...", snippet: "...", url: "https://..." }]),
    live: true,
    handler: async (p) => {
        if (!p.q) throw { code: 400, message: "Parameter 'q' wajib." }
        return P.wikiSearch(p.q)
    }
})
// Kategori pencarian lain diarahkan ke YouTube search (video nyata) sebagai sumber live.
for (const [slug, label, prefix] of [
    ["spotify", "Spotify", ""],
    ["tiktok", "TikTok", "tiktok "],
    ["instagram", "Instagram", "instagram "],
    ["pinterest", "Pinterest", ""],
    ["anime", "Anime", "anime "],
    ["manga", "Manga", "manga "],
    ["movie", "Movie", "movie trailer "],
    ["game", "Game", "game "],
    ["wallpaper", "Wallpaper", "wallpaper "]
] as [string, string, string][]) {
    reg({
        category: "Search",
        path: `/api/v1/search/${slug}`,
        name: `Search ${label}`,
        description: `Cari ${label} (hasil video/relevan dari YouTube).`,
        params: [{ name: "q", type: "string", required: true, description: "Kata kunci", example: "contoh" }],
        responseExample: ok([{ title: "...", url: "https://youtu.be/..." }]),
        live: true,
        handler: async (p) => {
            if (!p.q) throw { code: 400, message: "Parameter 'q' wajib." }
            return P.ytsearch(prefix + p.q)
        }
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
// Utility tambahan — LIVE.
reg({
    category: "Utility",
    path: "/api/v1/utility/shorturl",
    name: "Short URL",
    description: "Perpendek URL (is.gd).",
    params: [{ name: "url", type: "string", required: true, description: "URL panjang", example: "https://example.com/very/long" }],
    responseExample: ok({ short: "https://is.gd/xxxx" }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        const short = await P.shortUrl(p.url)
        if (!short) throw { code: 502, message: "Gagal memperpendek URL." }
        return { original: p.url, short }
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/hash",
    name: "Hash Generator",
    description: "Hash teks (md5/sha1/sha256/sha512).",
    params: [
        { name: "text", type: "string", required: true, description: "Teks", example: "hello" },
        { name: "algo", type: "string", required: false, description: "md5|sha1|sha256|sha512", example: "sha256" }
    ],
    responseExample: ok({ algo: "sha256", hash: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        const algo = ["md5", "sha1", "sha256", "sha512"].includes(p.algo) ? p.algo : "sha256"
        const crypto = await import("crypto")
        return { algo, hash: crypto.createHash(algo).update(String(p.text)).digest("hex") }
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/screenshot",
    name: "Screenshot Website",
    description: "Ambil screenshot halaman web (thum.io, gratis).",
    params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://vercel.com" }],
    responseExample: ok({ url: "https://image.thum.io/get/..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        const u = /^https?:\/\//.test(p.url) ? p.url : "https://" + p.url
        return { url: `https://image.thum.io/get/width/1280/crop/800/${u}` }
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/translate",
    name: "Translate",
    description: "Terjemahkan teks (Google, gratis).",
    params: [
        { name: "text", type: "string", required: true, description: "Teks", example: "hello world" },
        { name: "to", type: "string", required: false, description: "Kode bahasa target", example: "id" }
    ],
    responseExample: ok({ translated: "halo dunia" }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        const to = p.to || "id"
        try {
            const r = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(p.text)}`,
                { headers: { "User-Agent": "Mozilla/5.0" } }
            )
            const d = await r.json()
            const translated = (d?.[0] || []).map((x: any) => x[0]).join("")
            return { translated, to, source: d?.[2] || "auto" }
        } catch {
            // fallback via AI
            return { translated: await P.aiChat(`Translate to ${to}: ${p.text}`, "Reply ONLY the translation."), to }
        }
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/currency",
    name: "Currency Convert",
    description: "Konversi mata uang (kurs real-time).",
    params: [
        { name: "from", type: "string", required: true, description: "Dari", example: "USD" },
        { name: "to", type: "string", required: true, description: "Ke", example: "IDR" },
        { name: "amount", type: "number", required: false, description: "Jumlah", example: "10" }
    ],
    responseExample: ok({ result: 155000 }),
    live: true,
    handler: async (p) => {
        if (!p.from || !p.to) throw { code: 400, message: "Parameter 'from' & 'to' wajib." }
        return P.currency(p.from, p.to, p.amount || 1)
    }
})
reg({
    category: "Utility",
    path: "/api/v1/utility/qrread",
    name: "QR Reader",
    description: "Baca isi QR code dari gambar.",
    params: [{ name: "url", type: "string", required: true, description: "URL gambar QR", example: "https://..." }],
    responseExample: ok({ data: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        const data = await P.qrRead(p.url)
        if (!data) throw { code: 502, message: "QR tidak terbaca." }
        return { data }
    }
})

// ── Brat / Image / Text ──
// Brat — LIVE (brat generator gratis).
reg({
    category: "Brat",
    path: "/api/v1/brat/image",
    name: "Brat Image",
    description: "Generate gambar teks bergaya brat.",
    params: [{ name: "text", type: "string", required: true, description: "Teks", example: "starnova" }],
    responseExample: ok({ url: "https://..." }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        return { url: `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(p.text)}` }
    }
})
reg({
    category: "Brat",
    path: "/api/v1/brat/video",
    name: "Brat Video",
    description: "Generate video teks bergaya brat (animasi).",
    params: [{ name: "text", type: "string", required: true, description: "Teks", example: "starnova" }],
    responseExample: ok({ url: "https://..." }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        return { url: `https://brat.caliphdev.com/api/brat/animate?text=${encodeURIComponent(p.text)}` }
    }
})
reg({
    category: "Brat",
    path: "/api/v1/brat/hd",
    name: "Brat HD",
    description: "Generate gambar brat resolusi tinggi.",
    params: [{ name: "text", type: "string", required: true, description: "Teks", example: "starnova" }],
    responseExample: ok({ url: "https://..." }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        return { url: `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(p.text)}&hd=true` }
    }
})

// Image — LIVE (generator prompt-based & tool gratis).
reg({
    category: "Image",
    path: "/api/v1/image/removebg",
    name: "Remove Background",
    description: "Hapus background gambar (proxy gratis).",
    params: [{ name: "url", type: "string", required: true, description: "URL gambar", example: "https://..." }],
    responseExample: ok({ url: "https://..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        // layanan gratis tanpa key: hapus bg via weserv + fallback info
        return { url: `https://api.davidcyriltech.my.id/removebg?url=${encodeURIComponent(p.url)}`, note: "Bila kosong, gambar tak didukung." }
    }
})
for (const [slug, name, wsx] of [
    ["resize", "Resize", "w=512&h=512&fit=cover"],
    ["compress", "Compress", "q=40"],
    ["blur", "Blur", "blur=8"],
    ["grayscale", "Grayscale", "filt=greyscale"]
] as [string, string, string][]) {
    reg({
        category: "Image",
        path: `/api/v1/image/${slug}`,
        name,
        description: `${name} gambar (images.weserv.nl, gratis).`,
        params: [{ name: "url", type: "string", required: true, description: "URL gambar", example: "https://..." }],
        responseExample: ok({ url: "https://images.weserv.nl/..." }),
        live: true,
        handler: async (p) => {
            if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
            const clean = p.url.replace(/^https?:\/\//, "")
            return { url: `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&${wsx}` }
        }
    })
}
reg({
    category: "Image",
    path: "/api/v1/image/upscale",
    name: "Upscale",
    description: "Perbesar gambar 2x (images.weserv.nl).",
    params: [{ name: "url", type: "string", required: true, description: "URL gambar", example: "https://..." }],
    responseExample: ok({ url: "https://images.weserv.nl/..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        const clean = p.url.replace(/^https?:\/\//, "")
        return { url: `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=2000&il` }
    }
})
reg({
    category: "Image",
    path: "/api/v1/image/meme",
    name: "Meme Generator",
    description: "Buat meme (top/bottom text).",
    params: [
        { name: "url", type: "string", required: true, description: "URL gambar", example: "https://..." },
        { name: "top", type: "string", required: false, description: "Teks atas", example: "WHEN CODE" },
        { name: "bottom", type: "string", required: false, description: "Teks bawah", example: "WORKS" }
    ],
    responseExample: ok({ url: "https://api.memegen.link/..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        const enc = (s: string) => encodeURIComponent(String(s || "_").replace(/ /g, "_")) || "_"
        return { url: `https://api.memegen.link/images/custom/${enc(p.top)}/${enc(p.bottom)}.png?background=${encodeURIComponent(p.url)}` }
    }
})

// Text — LIVE (AI-based & OCR).
const TEXT_LIVE: [string, string, string][] = [
    ["summarize", "Summarize", "Summarize the user's text concisely in the same language."],
    ["grammar", "Grammar Fix", "Fix grammar. Reply ONLY corrected text."],
    ["rewrite", "Rewrite", "Rewrite clearly, keep meaning. Reply only the rewrite."],
    ["humanize", "Humanize", "Rewrite to sound natural & human. Reply only result."],
    ["paraphrase", "Paraphrase", "Paraphrase the text. Reply only the paraphrase."]
]
for (const [slug, name, sys] of TEXT_LIVE) {
    reg({
        category: "Text",
        path: `/api/v1/text/${slug}`,
        name,
        description: `${name} teks (AI).`,
        params: [{ name: "text", type: "string", required: true, description: "Teks", example: "hello world" }],
        responseExample: ok({ result: "..." }),
        live: true,
        handler: async (p) => {
            if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
            return { result: await P.aiChat(p.text, sys) }
        }
    })
}
reg({
    category: "Text",
    path: "/api/v1/text/ocr",
    name: "OCR",
    description: "Ekstrak teks dari gambar (ocr.space).",
    params: [{ name: "url", type: "string", required: true, description: "URL gambar", example: "https://..." }],
    responseExample: ok({ text: "..." }),
    live: true,
    handler: async (p) => {
        if (!p.url) throw { code: 400, message: "Parameter 'url' wajib." }
        return { text: await P.ocrSpace(p.url) }
    }
})
reg({
    category: "Text",
    path: "/api/v1/text/tts",
    name: "Text To Speech",
    description: "Teks jadi audio (Google TTS).",
    params: [
        { name: "text", type: "string", required: true, description: "Teks", example: "halo" },
        { name: "lang", type: "string", required: false, description: "Bahasa", example: "id" }
    ],
    responseExample: ok({ url: "https://translate.google.com/translate_tts?..." }),
    live: true,
    handler: async (p) => {
        if (!p.text) throw { code: 400, message: "Parameter 'text' wajib." }
        const lang = p.lang || "id"
        return { url: `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(p.text.slice(0, 200))}`, lang }
    }
})

// ── Public API ──
// ═══════════════════════════════════════════════════════════
//  SELF-HOSTED ENDPOINTS — 100% jalan di server StarNova (tanpa API lain).
//  Kategori: "Self-Host" (data/util) & "Image" (pemrosesan gambar via sharp).
// ═══════════════════════════════════════════════════════════
import * as S from "./selfhost"

const img = (buffer: any, ct = "image/png") => ({ __binary: buffer, contentType: ct })

// ── Data / Text / Crypto (JSON, murni server) ──
reg({ category: "Self-Host", path: "/api/v1/tools/hash", name: "Hash", description: "Hash teks (md5/sha1/sha256/sha512) — diproses di server.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "hello" }, { name: "algo", type: "string", required: false, description: "algoritma", example: "sha256" }], responseExample: ok({ algo: "sha256", hash: "..." }), live: true, handler: async (p) => { if (!p.text) throw { code: 400, message: "'text' wajib." }; return S.hash(p.text, p.algo) } })
reg({ category: "Self-Host", path: "/api/v1/tools/hmac", name: "HMAC", description: "HMAC teks dengan secret key.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "data" }, { name: "key", type: "string", required: true, description: "Secret", example: "s3cret" }, { name: "algo", type: "string", required: false, description: "algoritma", example: "sha256" }], responseExample: ok({ hmac: "..." }), live: true, handler: async (p) => { if (!p.text || !p.key) throw { code: 400, message: "'text' & 'key' wajib." }; return S.hmac(p.text, p.key, p.algo) } })
reg({ category: "Self-Host", path: "/api/v1/tools/base64", name: "Base64", description: "Encode/decode Base64.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "hello" }, { name: "mode", type: "string", required: false, description: "encode|decode", example: "encode" }], responseExample: ok({ result: "aGVsbG8=" }), live: true, handler: async (p) => { if (p.text == null) throw { code: 400, message: "'text' wajib." }; return { result: S.base64(p.text, p.mode) } } })
reg({ category: "Self-Host", path: "/api/v1/tools/hex", name: "Hex Encode/Decode", description: "Encode/decode Hex.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "hello" }, { name: "mode", type: "string", required: false, description: "encode|decode", example: "encode" }], responseExample: ok({ result: "68656c6c6f" }), live: true, handler: async (p) => { if (p.text == null) throw { code: 400, message: "'text' wajib." }; return { result: S.hexEncode(p.text, p.mode) } } })
reg({ category: "Self-Host", path: "/api/v1/tools/url", name: "URL Encode/Decode", description: "Encode/decode URL component.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "a b&c" }, { name: "mode", type: "string", required: false, description: "encode|decode", example: "encode" }], responseExample: ok({ result: "a%20b%26c" }), live: true, handler: async (p) => { if (p.text == null) throw { code: 400, message: "'text' wajib." }; return { result: S.urlCodec(p.text, p.mode) } } })
reg({ category: "Self-Host", path: "/api/v1/tools/uuid", name: "UUID", description: "Generate UUID v4.", params: [], responseExample: ok({ uuid: "..." }), live: true, handler: async () => ({ uuid: S.uuid() }) })
reg({ category: "Self-Host", path: "/api/v1/tools/password", name: "Password Generator", description: "Password acak kuat.", params: [{ name: "length", type: "number", required: false, description: "Panjang", example: "20" }, { name: "symbols", type: "boolean", required: false, description: "Pakai simbol", example: "true" }], responseExample: ok({ password: "..." }), live: true, handler: async (p) => ({ password: S.password(Number(p.length) || 16, p.symbols !== "false") }) })
reg({ category: "Self-Host", path: "/api/v1/tools/textstats", name: "Text Statistics", description: "Hitung karakter, kata, kalimat, waktu baca.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "Halo dunia" }], responseExample: ok({ words: 2 }), live: true, handler: async (p) => { if (!p.text) throw { code: 400, message: "'text' wajib." }; return S.textStats(p.text) } })
reg({ category: "Self-Host", path: "/api/v1/tools/case", name: "Text Case", description: "Ubah case: upper/lower/title/sentence/reverse/camel/snake/kebab.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "hello world" }, { name: "type", type: "string", required: false, description: "tipe case", example: "title" }], responseExample: ok({ result: "Hello World" }), live: true, handler: async (p) => { if (!p.text) throw { code: 400, message: "'text' wajib." }; return { result: S.textCase(p.text, p.type) } } })
reg({ category: "Self-Host", path: "/api/v1/tools/json", name: "JSON Format/Validate", description: "Rapikan atau minify JSON + validasi.", params: [{ name: "json", type: "string", required: true, description: "String JSON", example: "{\"a\":1}" }, { name: "minify", type: "boolean", required: false, description: "Minify", example: "false" }], responseExample: ok({ valid: true, output: "{}" }), live: true, handler: async (p) => { try { return S.jsonFormat(p.json, p.minify === "true") } catch (e: any) { return { valid: false, error: e.message } } } })
reg({ category: "Self-Host", path: "/api/v1/tools/slug", name: "Slugify", description: "Ubah teks jadi slug URL.", params: [{ name: "text", type: "string", required: true, description: "Teks", example: "Halo Dunia!" }], responseExample: ok({ slug: "halo-dunia" }), live: true, handler: async (p) => { if (!p.text) throw { code: 400, message: "'text' wajib." }; return { slug: S.slugify(p.text) } } })
reg({ category: "Self-Host", path: "/api/v1/tools/lorem", name: "Lorem Ipsum", description: "Generate teks lorem ipsum.", params: [{ name: "paragraphs", type: "number", required: false, description: "Jumlah paragraf", example: "3" }], responseExample: ok({ text: "Lorem ipsum..." }), live: true, handler: async (p) => ({ text: S.loremIpsum(Number(p.paragraphs) || 3) }) })
reg({ category: "Self-Host", path: "/api/v1/tools/color", name: "Color Info", description: "Info warna: hex, rgb, hsl.", params: [{ name: "hex", type: "string", required: true, description: "Kode hex", example: "#4F8CFF" }], responseExample: ok({ rgb: "rgb(79, 140, 255)" }), live: true, handler: async (p) => { if (!p.hex) throw { code: 400, message: "'hex' wajib." }; return S.colorInfo(p.hex) } })
reg({ category: "Self-Host", path: "/api/v1/tools/randomcolor", name: "Random Color", description: "Warna acak (hex/rgb/hsl).", params: [], responseExample: ok({ hex: "#..." }), live: true, handler: async () => S.randomColor() })
reg({ category: "Self-Host", path: "/api/v1/tools/timestamp", name: "Timestamp Now", description: "Waktu sekarang (unix/iso/utc).", params: [], responseExample: ok({ unix: 0 }), live: true, handler: async () => S.timestamp() })
reg({ category: "Self-Host", path: "/api/v1/tools/unixtime", name: "Unix → Date", description: "Konversi unix timestamp ke tanggal.", params: [{ name: "unix", type: "number", required: true, description: "Unix time", example: "1700000000" }], responseExample: ok({ iso: "..." }), live: true, handler: async (p) => { if (!p.unix) throw { code: 400, message: "'unix' wajib." }; return S.unixToDate(Number(p.unix)) } })
reg({ category: "Self-Host", path: "/api/v1/tools/dice", name: "Dice Roll", description: "Lempar dadu.", params: [{ name: "sides", type: "number", required: false, description: "Sisi dadu", example: "6" }, { name: "count", type: "number", required: false, description: "Jumlah", example: "2" }], responseExample: ok({ total: 7 }), live: true, handler: async (p) => S.diceRoll(Number(p.sides) || 6, Number(p.count) || 1) })
reg({ category: "Self-Host", path: "/api/v1/tools/math", name: "Math Eval", description: "Hitung ekspresi matematika (aman).", params: [{ name: "expr", type: "string", required: true, description: "Ekspresi", example: "2*(3+4)" }], responseExample: ok({ result: 14 }), live: true, handler: async (p) => { if (!p.expr) throw { code: 400, message: "'expr' wajib." }; return S.mathEval(p.expr) } })
reg({ category: "Self-Host", path: "/api/v1/tools/jwtdecode", name: "JWT Decode", description: "Decode header & payload JWT (tanpa verifikasi).", params: [{ name: "token", type: "string", required: true, description: "JWT", example: "eyJ..." }], responseExample: ok({ payload: {} }), live: true, handler: async (p) => { if (!p.token) throw { code: 400, message: "'token' wajib." }; return S.jwtDecode(p.token) } })
reg({ category: "Self-Host", path: "/api/v1/tools/morse", name: "Morse Code", description: "Encode/decode kode morse.", params: [{ name: "text", type: "string", required: true, description: "Teks/morse", example: "sos" }, { name: "mode", type: "string", required: false, description: "encode|decode", example: "encode" }], responseExample: ok({ result: "... --- ..." }), live: true, handler: async (p) => { if (!p.text) throw { code: 400, message: "'text' wajib." }; return { result: S.morse(p.text, p.mode) } } })
reg({ category: "Self-Host", path: "/api/v1/tools/binary", name: "Text ↔ Binary", description: "Encode/decode teks ke binary.", params: [{ name: "text", type: "string", required: true, description: "Teks/binary", example: "Hi" }, { name: "mode", type: "string", required: false, description: "encode|decode", example: "encode" }], responseExample: ok({ result: "01001000 01101001" }), live: true, handler: async (p) => { if (!p.text) throw { code: 400, message: "'text' wajib." }; return { result: S.binaryText(p.text, p.mode) } } })
reg({ category: "Self-Host", path: "/api/v1/tools/age", name: "Age Calculator", description: "Hitung umur dari tanggal lahir.", params: [{ name: "dob", type: "string", required: true, description: "YYYY-MM-DD", example: "2000-01-15" }], responseExample: ok({ years: 25 }), live: true, handler: async (p) => { if (!p.dob) throw { code: 400, message: "'dob' wajib." }; return S.agePlus(p.dob) } })

// ── Image processing (sharp, PNG/JPEG binary — diproses di server) ──
reg({ category: "Image", path: "/api/v1/img/resize", name: "Resize (self-host)", description: "Resize gambar di server (sharp). Balas PNG.", params: [{ name: "url", type: "string", required: true, description: "URL gambar", example: "https://i.imgur.com/x.png" }, { name: "w", type: "number", required: false, description: "Lebar", example: "512" }, { name: "h", type: "number", required: false, description: "Tinggi", example: "512" }], responseExample: ok({ note: "mengembalikan image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgResize(p.url, Number(p.w) || undefined, Number(p.h) || undefined)) } })
reg({ category: "Image", path: "/api/v1/img/crop", name: "Crop (self-host)", description: "Crop gambar (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "w", type: "number", required: true, description: "Lebar", example: "300" }, { name: "h", type: "number", required: true, description: "Tinggi", example: "300" }, { name: "left", type: "number", required: false, description: "X", example: "0" }, { name: "top", type: "number", required: false, description: "Y", example: "0" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgCrop(p.url, Number(p.w), Number(p.h), Number(p.left) || 0, Number(p.top) || 0)) } })
reg({ category: "Image", path: "/api/v1/img/blur", name: "Blur (self-host)", description: "Blur gambar (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "sigma", type: "number", required: false, description: "Kekuatan", example: "8" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgBlur(p.url, Number(p.sigma) || 8)) } })
reg({ category: "Image", path: "/api/v1/img/sharpen", name: "Sharpen (self-host)", description: "Pertajam gambar (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgSharpen(p.url)) } })
reg({ category: "Image", path: "/api/v1/img/grayscale", name: "Grayscale (self-host)", description: "Hitam-putih (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgGrayscale(p.url)) } })
reg({ category: "Image", path: "/api/v1/img/negate", name: "Invert (self-host)", description: "Balik warna (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgNegate(p.url)) } })
reg({ category: "Image", path: "/api/v1/img/tint", name: "Tint (self-host)", description: "Beri warna (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "hex", type: "string", required: false, description: "Warna", example: "#4F8CFF" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgTint(p.url, p.hex || "#4F8CFF")) } })
reg({ category: "Image", path: "/api/v1/img/rotate", name: "Rotate (self-host)", description: "Putar gambar (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "deg", type: "number", required: false, description: "Derajat", example: "90" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgRotate(p.url, Number(p.deg) || 90)) } })
reg({ category: "Image", path: "/api/v1/img/flip", name: "Flip (self-host)", description: "Cermin gambar (sharp). dir: v|h.", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "dir", type: "string", required: false, description: "v|h", example: "h" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgFlip(p.url, p.dir || "v")) } })
reg({ category: "Image", path: "/api/v1/img/compress", name: "Compress (self-host)", description: "Kompres gambar JPEG (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "quality", type: "number", required: false, description: "1-100", example: "40" }], responseExample: ok({ note: "image/jpeg" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgCompress(p.url, Number(p.quality) || 40), "image/jpeg") } })
reg({ category: "Image", path: "/api/v1/img/pixelate", name: "Pixelate (self-host)", description: "Efek pixelate (sharp).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "pixels", type: "number", required: false, description: "Ukuran blok", example: "16" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return img(await S.imgPixelate(p.url, Number(p.pixels) || 16)) } })
reg({ category: "Image", path: "/api/v1/img/convert", name: "Convert Format (self-host)", description: "Ubah format gambar (png/jpeg/webp/avif).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }, { name: "format", type: "string", required: false, description: "format", example: "webp" }], responseExample: ok({ note: "image/<format>" }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; const r = await S.imgConvert(p.url, p.format || "webp"); return img(r.buffer, "image/" + r.format) } })
reg({ category: "Image", path: "/api/v1/img/meta", name: "Image Metadata (self-host)", description: "Info dimensi & format gambar (JSON).", params: [{ name: "url", type: "string", required: true, description: "URL", example: "https://..." }], responseExample: ok({ width: 512, height: 512 }), live: true, handler: async (p) => { if (!p.url) throw { code: 400, message: "'url' wajib." }; return S.imgMeta(p.url) } })

// ── Generator (dibuat dari nol di server, balas gambar) ──
reg({ category: "Image", path: "/api/v1/gen/qr", name: "QR Generator (self-host)", description: "Buat QR code di server (qrcode). Balas PNG.", params: [{ name: "text", type: "string", required: true, description: "Isi QR", example: "https://starnova.my.id" }, { name: "size", type: "number", required: false, description: "Ukuran px", example: "400" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.text) throw { code: 400, message: "'text' wajib." }; return img(await S.genQR(p.text, Number(p.size) || 400)) } })
reg({ category: "Image", path: "/api/v1/gen/placeholder", name: "Placeholder Image (self-host)", description: "Buat gambar placeholder.", params: [{ name: "w", type: "number", required: false, description: "Lebar", example: "600" }, { name: "h", type: "number", required: false, description: "Tinggi", example: "400" }, { name: "text", type: "string", required: false, description: "Teks", example: "StarNova" }, { name: "bg", type: "string", required: false, description: "Warna bg", example: "#0b1020" }, { name: "fg", type: "string", required: false, description: "Warna teks", example: "#4F8CFF" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => img(await S.genPlaceholder(Number(p.w) || 600, Number(p.h) || 400, p.text || "", p.bg || "#0b1020", p.fg || "#4F8CFF")) })
reg({ category: "Image", path: "/api/v1/gen/gradient", name: "Gradient Image (self-host)", description: "Buat gambar gradient.", params: [{ name: "w", type: "number", required: false, description: "Lebar", example: "600" }, { name: "h", type: "number", required: false, description: "Tinggi", example: "400" }, { name: "c1", type: "string", required: false, description: "Warna 1", example: "#22D3EE" }, { name: "c2", type: "string", required: false, description: "Warna 2", example: "#8B5CF6" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => img(await S.genGradient(Number(p.w) || 600, Number(p.h) || 400, p.c1 || "#22D3EE", p.c2 || "#8B5CF6")) })
reg({ category: "Image", path: "/api/v1/gen/color", name: "Color Swatch (self-host)", description: "Buat kotak warna solid.", params: [{ name: "hex", type: "string", required: true, description: "Kode hex", example: "#4F8CFF" }, { name: "size", type: "number", required: false, description: "Ukuran", example: "300" }], responseExample: ok({ note: "image/png" }), live: true, handler: async (p) => { if (!p.hex) throw { code: 400, message: "'hex' wajib." }; return img(await S.genColor(p.hex, Number(p.size) || 300)) } })

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
