// Provider eksternal gratis untuk endpoint LIVE (dengan fallback).
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
const DAVID = "https://apis.davidcyriltech.my.id"

async function getJSON(url: string, timeout = 30000) {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), timeout)
    try {
        const r = await fetch(url, { headers: { "User-Agent": UA }, signal: c.signal })
        return await r.json()
    } finally {
        clearTimeout(t)
    }
}
async function postJSON(url: string, body: any, timeout = 45000) {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), timeout)
    try {
        const r = await fetch(url, {
            method: "POST",
            headers: { "User-Agent": UA, "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: c.signal
        })
        return await r.json()
    } finally {
        clearTimeout(t)
    }
}

export async function aiChat(prompt: string, system = "") {
    const messages: any[] = []
    if (system) messages.push({ role: "system", content: system })
    messages.push({ role: "user", content: String(prompt) })
    try {
        const data = await postJSON("https://text.pollinations.ai/", {
            messages,
            model: "openai",
            private: true
        })
        return typeof data === "string" ? data : data?.choices?.[0]?.message?.content || String(data)
    } catch {
        const d = await getJSON(`${DAVID}/ai/gpt3?text=${encodeURIComponent(prompt)}`)
        return d?.result || d?.message || "AI sedang sibuk, coba lagi."
    }
}
export function aiImage(prompt: string, w = 1024, h = 1024) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&model=flux&nologo=true`
}
export async function tiktok(url: string) {
    const data = await getJSON(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`)
    if (!data || data.code !== 0) throw new Error(data?.msg || "Gagal ambil TikTok")
    const d = data.data
    return { title: d.title, author: d.author?.nickname, cover: d.cover, video: d.hdplay || d.play, music: d.music }
}
export async function ytmp3(url: string) {
    const d = await getJSON(`${DAVID}/download/ytmp3?url=${encodeURIComponent(url)}`)
    return { title: d?.result?.title, url: d?.result?.download_url || d?.url }
}
export async function ytmp4(url: string) {
    const d = await getJSON(`${DAVID}/download/ytmp4?url=${encodeURIComponent(url)}`)
    return { title: d?.result?.title, url: d?.result?.download_url || d?.url }
}
export async function ytsearch(q: string) {
    const d = await getJSON(`${DAVID}/youtube/search?query=${encodeURIComponent(q)}`)
    return d?.results || d?.result || []
}
export async function lyrics(artist: string, title: string) {
    const d = await getJSON(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    )
    return d?.lyrics || ""
}
export async function ipLookup(ip: string) {
    return getJSON(`http://ip-api.com/json/${encodeURIComponent(ip || "")}`)
}
export async function weather(city: string) {
    const d = await getJSON(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
    const cur = d?.current_condition?.[0] || {}
    return { city, tempC: cur.temp_C, desc: cur.weatherDesc?.[0]?.value, humidity: cur.humidity, wind: cur.windspeedKmph }
}
export function qrGenerate(text: string, size = 300) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}
export async function ddgSearch(q: string) {
    const d = await getJSON(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`)
    return {
        heading: d?.Heading,
        abstract: d?.AbstractText,
        url: d?.AbstractURL,
        related: (d?.RelatedTopics || []).slice(0, 8).map((t: any) => t.Text).filter(Boolean)
    }
}
export async function randomAdvice() {
    return (await getJSON("https://api.adviceslip.com/advice"))?.slip?.advice || ""
}
export async function randomCat() {
    return (await getJSON("https://api.thecatapi.com/v1/images/search"))?.[0]?.url || ""
}
export async function randomDog() {
    return (await getJSON("https://dog.ceo/api/breeds/image/random"))?.message || ""
}
