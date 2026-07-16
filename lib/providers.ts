// Provider eksternal GRATIS untuk endpoint LIVE (semua dengan fallback).
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
async function getText(url: string, timeout = 30000) {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), timeout)
    try {
        const r = await fetch(url, { headers: { "User-Agent": UA }, signal: c.signal })
        return await r.text()
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

// ─── AI (pollinations, gratis) ───
export async function aiChat(prompt: string, system = "") {
    const messages: any[] = []
    if (system) messages.push({ role: "system", content: system })
    messages.push({ role: "user", content: String(prompt) })
    try {
        const data = await postJSON("https://text.pollinations.ai/", { messages, model: "openai", private: true })
        const out = typeof data === "string" ? data : data?.choices?.[0]?.message?.content
        if (out) return out
        throw new Error("empty")
    } catch {
        const enc = encodeURIComponent((system ? system + "\n\n" : "") + prompt)
        return (await getText(`https://text.pollinations.ai/${enc}`)) || "AI sedang sibuk, coba lagi."
    }
}
export function aiImage(prompt: string, w = 1024, h = 1024) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&model=flux&nologo=true`
}

// ─── Downloader ───
export async function tiktok(url: string) {
    const data = await getJSON(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`)
    if (!data || data.code !== 0) throw { code: 502, message: data?.msg || "Gagal ambil TikTok" }
    const d = data.data
    return { title: d.title, author: d.author?.nickname, cover: d.cover, video: d.hdplay || d.play, music: d.music, images: d.images || null }
}
export async function ytmp3(url: string) {
    const d = await getJSON(`${DAVID}/download/ytmp3?url=${encodeURIComponent(url)}`)
    return { title: d?.result?.title, thumbnail: d?.result?.thumbnail, url: d?.result?.download_url || d?.url }
}
export async function ytmp4(url: string) {
    const d = await getJSON(`${DAVID}/download/ytmp4?url=${encodeURIComponent(url)}`)
    return { title: d?.result?.title, thumbnail: d?.result?.thumbnail, url: d?.result?.download_url || d?.url }
}
export async function ytsearch(q: string) {
    const d = await getJSON(`${DAVID}/youtube/search?query=${encodeURIComponent(q)}`)
    return d?.results || d?.result || []
}
// Downloader umum via davidcyriltech (banyak platform didukung endpoint /download/*)
export async function davidDownload(kind: string, url: string) {
    const d = await getJSON(`${DAVID}/${kind}?url=${encodeURIComponent(url)}`)
    if (d && (d.status === true || d.success || d.result || d.url || d.data)) return d.result || d.data || d
    throw { code: 502, message: d?.message || "Sumber tidak dapat diproses saat ini." }
}
export async function facebook(url: string) {
    const d = await getJSON(`${DAVID}/facebook?url=${encodeURIComponent(url)}`)
    return d?.result || d
}
export async function instagram(url: string) {
    const d = await getJSON(`${DAVID}/instagram?url=${encodeURIComponent(url)}`)
    return d?.result || d
}
export async function twitter(url: string) {
    const d = await getJSON(`${DAVID}/twitter?url=${encodeURIComponent(url)}`)
    return d?.result || d
}
export async function mediafire(url: string) {
    const d = await getJSON(`${DAVID}/mediafire?url=${encodeURIComponent(url)}`)
    return d?.result || d
}
export async function pinterestDl(url: string) {
    const d = await getJSON(`${DAVID}/pinterestdl?url=${encodeURIComponent(url)}`)
    return d?.result || d
}
export async function spotifyDl(url: string) {
    const d = await getJSON(`${DAVID}/spotifydl?url=${encodeURIComponent(url)}`)
    return d?.result || d
}
export async function gdrive(url: string) {
    const d = await getJSON(`${DAVID}/gdrivedl?url=${encodeURIComponent(url)}`)
    return d?.result || d
}

// ═══════════════════════════════════════════════════════════
//  TERABOX DOWNLOADER (self-hosted di StarNova)
//  Mendukung SEMUA tipe file & share multi-file / folder.
//  Terabox WAJIB cookie akun (ndus) → set env TERABOX_COOKIE.
//  Alur: shorturlinfo (list file) → download API (dlink per file).
//  Bila cookie tak ada / gagal → fallback ke beberapa API publik.
//  Return: { shareId, title, files: [{ name, size, sizeBytes, type, download, thumbnail, isDir }] }
// ═══════════════════════════════════════════════════════════
const TERA_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"

/** Ambil "surl" dari berbagai bentuk link Terabox (1024tera, terabox.app, /s/1xxx, ?surl=xxx). */
export function teraboxSurl(url: string): string {
    const u = String(url).trim()
    const q = u.match(/[?&]surl=([A-Za-z0-9_-]+)/)
    if (q) return q[1].replace(/^1/, "") // buang prefix '1' bila ada
    const s = u.match(/\/s\/1?([A-Za-z0-9_-]+)/)
    if (s) return s[1]
    const bare = u.match(/([A-Za-z0-9_-]{15,})/)
    return bare ? bare[1] : ""
}

function fileType(name = ""): string {
    const ext = (name.split(".").pop() || "").toLowerCase()
    if (["mp4", "mkv", "mov", "avi", "webm", "m4v", "flv", "3gp", "ts"].includes(ext)) return "video"
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic"].includes(ext)) return "image"
    if (["mp3", "m4a", "wav", "ogg", "flac", "aac", "opus"].includes(ext)) return "audio"
    if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(ext))
        return "document"
    if (["zip", "rar", "7z", "tar", "gz", "apk"].includes(ext)) return "archive"
    return "file"
}
function humanSize(bytes: number): string {
    const b = Number(bytes) || 0
    if (!b) return "-"
    const u = ["B", "KB", "MB", "GB", "TB"]
    let i = 0,
        n = b
    while (n >= 1024 && i < u.length - 1) {
        n /= 1024
        i++
    }
    return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${u[i]}`
}

/** Terabox via API resmi (butuh cookie ndus). Mengembalikan daftar file (folder didukung). */
async function teraboxOfficial(surl: string) {
    const cookie = process.env.TERABOX_COOKIE || ""
    if (!cookie) throw { code: 424, message: "Cookie Terabox belum di-set (TERABOX_COOKIE)." }
    const H: any = {
        "User-Agent": TERA_UA,
        Cookie: cookie,
        Referer: "https://www.terabox.com/"
    }
    // 1) Info share + daftar file root
    const infoUrl = `https://www.terabox.com/api/shorturlinfo?app_id=250528&web=1&channel=dubox&clienttype=0&shorturl=1${encodeURIComponent(
        surl
    )}&root=1`
    const info = await fetch(infoUrl, { headers: H }).then((r) => r.json())
    if (info?.errno !== 0) throw { code: 502, message: `Terabox errno ${info?.errno} (${info?.errmsg || "gagal"})` }
    const shareid = info.shareid
    const uk = info.uk
    const sign = info.sign
    const timestamp = info.timestamp
    const rootList: any[] = info.list || []

    // Kumpulkan semua file (rekursif ke dalam folder, maks kedalaman aman)
    const allFiles: any[] = []
    async function walk(list: any[], depth: number) {
        for (const it of list) {
            if (String(it.isdir) === "1" && depth < 3) {
                const dirUrl = `https://www.terabox.com/share/list?app_id=250528&web=1&channel=dubox&clienttype=0&shorturl=1${encodeURIComponent(
                    surl
                )}&root=0&dir=${encodeURIComponent(it.path)}&order=name`
                try {
                    const d = await fetch(dirUrl, { headers: H }).then((r) => r.json())
                    if (d?.errno === 0 && Array.isArray(d.list)) await walk(d.list, depth + 1)
                } catch {}
            } else if (String(it.isdir) !== "1") {
                allFiles.push(it)
            }
        }
    }
    await walk(rootList, 0)

    // 2) Ambil dlink per file
    const files = []
    for (const f of allFiles) {
        let dlink = f.dlink || ""
        if (!dlink && f.fs_id) {
            try {
                const dl = await fetch(
                    `https://www.terabox.com/api/download?app_id=250528&web=1&channel=dubox&clienttype=0&shareid=${shareid}&uk=${uk}&sign=${encodeURIComponent(
                        sign
                    )}&timestamp=${timestamp}&fid_list=%5B${f.fs_id}%5D`,
                    { headers: H }
                ).then((r) => r.json())
                dlink = dl?.dlink?.[0]?.dlink || dl?.list?.[0]?.dlink || ""
            } catch {}
        }
        files.push({
            name: f.server_filename || f.filename || "file",
            size: humanSize(f.size),
            sizeBytes: Number(f.size) || 0,
            type: fileType(f.server_filename || f.filename),
            download: dlink,
            thumbnail: f.thumbs?.url3 || f.thumbs?.url2 || f.thumbs?.url1 || "",
            isDir: false
        })
    }
    if (!files.length) throw { code: 404, message: "Tidak ada file pada share Terabox ini." }
    return { shareId: surl, title: info?.title || files[0]?.name || "Terabox", files }
}

/** Fallback: beberapa API publik (bisa mati sewaktu-waktu). Normalisasi ke bentuk sama. */
async function teraboxPublic(url: string) {
    const attempts: (() => Promise<any>)[] = [
        // wdzone
        async () => {
            const d = await getJSON(
                `https://wdzone-terabox-api.vercel.app/api?url=${encodeURIComponent(url)}`
            )
            const info = d?.["📜 Extracted Info"] || d?.["Extracted Info"] || d?.list
            if (!info) throw new Error("kosong")
            const arr = Array.isArray(info) ? info : [info]
            const files = arr.map((x: any) => ({
                name: x?.["📂 Title"] || x?.title || x?.name || "file",
                size: x?.["📏 Size"] || x?.size || "-",
                sizeBytes: 0,
                type: fileType(x?.["📂 Title"] || x?.title || x?.name),
                download:
                    x?.["🔽 Direct Download Link"] ||
                    x?.["⚡ Direct Download Link"] ||
                    x?.direct_link ||
                    x?.download ||
                    "",
                thumbnail: x?.["🖼️ Thumbnails"]?.["360x270"] || x?.thumb || "",
                isDir: false
            }))
            if (!files.some((f: any) => f.download)) throw new Error("no link")
            return { shareId: teraboxSurl(url), title: files[0]?.name || "Terabox", files }
        },
        // teraboxdl worker
        async () => {
            const d = await getJSON(
                `https://teraboxdl.qtcloud.workers.dev/?url=${encodeURIComponent(url)}`
            )
            const list = d?.list || d?.files || d?.data
            if (!Array.isArray(list) || !list.length) throw new Error("kosong")
            const files = list.map((x: any) => ({
                name: x.filename || x.name || "file",
                size: humanSize(x.size),
                sizeBytes: Number(x.size) || 0,
                type: fileType(x.filename || x.name),
                download: x.download_link || x.dlink || x.url || "",
                thumbnail: x.thumb || "",
                isDir: false
            }))
            if (!files.some((f: any) => f.download)) throw new Error("no link")
            return { shareId: teraboxSurl(url), title: files[0]?.name || "Terabox", files }
        }
    ]
    let lastErr: any = null
    for (const a of attempts) {
        try {
            return await a()
        } catch (e) {
            lastErr = e
        }
    }
    throw {
        code: 502,
        message:
            "Semua sumber Terabox gagal (API publik down). Set TERABOX_COOKIE di StarNova untuk hasil stabil." +
            (lastErr?.message ? ` [${lastErr.message}]` : "")
    }
}

/** Terabox downloader utama: coba API resmi (cookie) → fallback publik. */
export async function terabox(url: string) {
    const surl = teraboxSurl(url)
    if (!surl) throw { code: 400, message: "Link Terabox tidak valid." }
    try {
        return await teraboxOfficial(surl)
    } catch (e: any) {
        // Bila hanya karena cookie kosong / official gagal → coba publik.
        try {
            return await teraboxPublic(url)
        } catch (pubErr: any) {
            throw {
                code: e?.code || pubErr?.code || 502,
                message: e?.code === 424 ? pubErr?.message || e.message : e?.message || pubErr?.message
            }
        }
    }
}

// ─── Lyrics ───
export async function lyrics(artist: string, title: string) {
    const d = await getJSON(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
    return d?.lyrics || ""
}

// ─── Utility ───
export async function ipLookup(ip: string) {
    return getJSON(`http://ip-api.com/json/${encodeURIComponent(ip || "")}`)
}
export async function weather(city: string) {
    const d = await getJSON(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
    const cur = d?.current_condition?.[0] || {}
    const area = d?.nearest_area?.[0] || {}
    return {
        city: area?.areaName?.[0]?.value || city,
        country: area?.country?.[0]?.value,
        tempC: cur.temp_C,
        feelsLikeC: cur.FeelsLikeC,
        desc: cur.weatherDesc?.[0]?.value,
        humidity: cur.humidity,
        windKmph: cur.windspeedKmph
    }
}
export function qrGenerate(text: string, size = 300) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}
export async function qrRead(imageUrl: string) {
    const d = await getJSON(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(imageUrl)}`)
    return d?.[0]?.symbol?.[0]?.data || null
}
export async function shortUrl(url: string) {
    // is.gd — gratis, tanpa key
    const d = await getText(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`)
    return d?.startsWith("http") ? d.trim() : null
}
export async function currency(from: string, to: string, amount = 1) {
    const d = await getJSON(`https://open.er-api.com/v6/latest/${encodeURIComponent(from.toUpperCase())}`)
    const rate = d?.rates?.[to.toUpperCase()]
    if (rate == null) throw { code: 400, message: "Kode mata uang tidak valid." }
    return { from: from.toUpperCase(), to: to.toUpperCase(), rate, amount: Number(amount), result: Number(amount) * rate }
}
export async function ddgSearch(q: string) {
    const d = await getJSON(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`)
    return {
        heading: d?.Heading,
        abstract: d?.AbstractText,
        url: d?.AbstractURL,
        related: (d?.RelatedTopics || []).slice(0, 10).map((t: any) => (t.Text ? { text: t.Text, url: t.FirstURL } : null)).filter(Boolean)
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

// ─── Search via DuckDuckGo/Wikipedia + platform khusus ───
export async function wikiSearch(q: string) {
    const d = await getJSON(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=8`)
    return (d?.query?.search || []).map((s: any) => ({
        title: s.title,
        snippet: String(s.snippet || "").replace(/<[^>]+>/g, ""),
        url: `https://id.wikipedia.org/wiki/${encodeURIComponent(s.title)}`
    }))
}
export async function githubSearch(q: string) {
    const d = await getJSON(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=8`)
    return (d?.items || []).map((r: any) => ({ name: r.full_name, stars: r.stargazers_count, desc: r.description, url: r.html_url }))
}
export async function npmSearch(q: string) {
    const d = await getJSON(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=8`)
    return (d?.objects || []).map((o: any) => ({ name: o.package.name, version: o.package.version, desc: o.package.description, url: o.package.links?.npm }))
}

// ─── Text/AI helpers dipakai kategori Text ───
export async function ocrSpace(imageUrl: string) {
    // ocr.space free key 'helloworld'
    const d = await getJSON(`https://api.ocr.space/parse/imageurl?apikey=helloworld&url=${encodeURIComponent(imageUrl)}`)
    return d?.ParsedResults?.[0]?.ParsedText?.trim() || ""
}
