// ═══════════════════════════════════════════════════════════
//  SELF-HOSTED PROVIDERS
//  Semua fungsi di sini berjalan 100% DI SERVER StarNova sendiri.
//  TIDAK memanggil API pihak ketiga mana pun.
//  Image ops pakai `sharp` (native), sisanya Node stdlib.
// ═══════════════════════════════════════════════════════════
import crypto from "crypto"

// Ambil buffer gambar dari URL (untuk diproses lokal oleh sharp).
// Catatan: fetch gambar dari URL yang DIBERIKAN USER bukan "bergantung API",
// itu input user. Pemrosesannya 100% lokal.
async function fetchImage(url: string): Promise<Buffer> {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 20000)
    try {
        const r = await fetch(url, { signal: c.signal })
        if (!r.ok) throw { code: 400, message: "Gagal mengambil gambar (HTTP " + r.status + ")." }
        const ab = await r.arrayBuffer()
        return Buffer.from(ab)
    } finally {
        clearTimeout(t)
    }
}

async function getSharp() {
    const mod = await import("sharp")
    return (mod as any).default || mod
}

// ─── IMAGE (sharp, diproses di server) ───
export async function imgResize(url: string, w?: number, h?: number) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    const out = await sharp(buf)
        .resize(w || 512, h || null, { fit: "cover" })
        .png()
        .toBuffer()
    return out
}
export async function imgCrop(url: string, w: number, h: number, left = 0, top = 0) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    return sharp(buf).extract({ left, top, width: w, height: h }).png().toBuffer()
}
export async function imgBlur(url: string, sigma = 8) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    return sharp(buf).blur(Math.min(60, Math.max(0.3, sigma))).png().toBuffer()
}
export async function imgSharpen(url: string) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    return sharp(buf).sharpen({ sigma: 2 }).png().toBuffer()
}
export async function imgGrayscale(url: string) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    return sharp(buf).grayscale().png().toBuffer()
}
export async function imgNegate(url: string) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    return sharp(buf).negate().png().toBuffer()
}
export async function imgTint(url: string, hex: string) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    const c = hexToRgb(hex) || { r: 79, g: 140, b: 255 }
    return sharp(buf).tint(c).png().toBuffer()
}
export async function imgRotate(url: string, deg = 90) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    return sharp(buf).rotate(deg).png().toBuffer()
}
export async function imgFlip(url: string, dir = "v") {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    const img = sharp(buf)
    return (dir === "h" ? img.flop() : img.flip()).png().toBuffer()
}
export async function imgCompress(url: string, quality = 40) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    return sharp(buf).jpeg({ quality: Math.min(100, Math.max(1, quality)) }).toBuffer()
}
export async function imgConvert(url: string, format = "webp") {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    const f = ["png", "jpeg", "webp", "avif"].includes(format) ? format : "webp"
    return { buffer: await (sharp(buf) as any)[f]().toBuffer(), format: f }
}
export async function imgPixelate(url: string, pixels = 16) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    const meta = await sharp(buf).metadata()
    const w = meta.width || 512
    const small = Math.max(4, Math.min(64, pixels))
    return sharp(buf)
        .resize(small, small, { fit: "fill" })
        .resize(w, meta.height || w, { kernel: "nearest" })
        .png()
        .toBuffer()
}
export async function imgMeta(url: string) {
    const sharp = await getSharp()
    const buf = await fetchImage(url)
    const m = await sharp(buf).metadata()
    return { format: m.format, width: m.width, height: m.height, size: buf.length, hasAlpha: m.hasAlpha, channels: m.channels }
}

// ─── GENERATOR (dibuat dari nol di server) ───
export async function genQR(text: string, size = 400) {
    const QR = (await import("qrcode")).default
    return QR.toBuffer(text, { width: size, margin: 1, errorCorrectionLevel: "M" })
}
export async function genPlaceholder(w = 600, h = 400, text = "", bg = "#0b1020", fg = "#4F8CFF") {
    const sharp = await getSharp()
    const label = text || `${w}x${h}`
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="100%" height="100%" fill="${bg}"/>
      <text x="50%" y="50%" font-family="monospace" font-size="${Math.floor(Math.min(w, h) / 8)}" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
    </svg>`
    return sharp(Buffer.from(svg)).png().toBuffer()
}
export async function genGradient(w = 600, h = 400, c1 = "#22D3EE", c2 = "#8B5CF6") {
    const sharp = await getSharp()
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/></svg>`
    return sharp(Buffer.from(svg)).png().toBuffer()
}
export async function genColor(hex: string, size = 300) {
    const sharp = await getSharp()
    const c = hexToRgb(hex) || { r: 0, g: 0, b: 0 }
    return sharp({ create: { width: size, height: size, channels: 3, background: c } }).png().toBuffer()
}

// ─── TEXT & DATA UTIL (murni Node, tanpa network) ───
export function hash(text: string, algo = "sha256") {
    const a = ["md5", "sha1", "sha256", "sha512"].includes(algo) ? algo : "sha256"
    return { algo: a, hash: crypto.createHash(a).update(String(text)).digest("hex") }
}
export function hmac(text: string, key: string, algo = "sha256") {
    const a = ["sha1", "sha256", "sha512"].includes(algo) ? algo : "sha256"
    return { algo: a, hmac: crypto.createHmac(a, String(key)).update(String(text)).digest("hex") }
}
export function base64(text: string, mode = "encode") {
    return mode === "decode"
        ? Buffer.from(String(text), "base64").toString("utf8")
        : Buffer.from(String(text)).toString("base64")
}
export function hexEncode(text: string, mode = "encode") {
    return mode === "decode" ? Buffer.from(String(text), "hex").toString("utf8") : Buffer.from(String(text)).toString("hex")
}
export function urlCodec(text: string, mode = "encode") {
    return mode === "decode" ? decodeURIComponent(String(text)) : encodeURIComponent(String(text))
}
export function uuid() {
    return crypto.randomUUID()
}
export function password(length = 16, symbols = true) {
    const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const chars = symbols ? base + "!@#$%^&*()-_=+[]{}" : base
    const len = Math.min(256, Math.max(4, length))
    const bytes = crypto.randomBytes(len)
    let out = ""
    for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length]
    return out
}
export function textStats(text: string) {
    const t = String(text)
    const words = t.trim() ? t.trim().split(/\s+/).length : 0
    return {
        characters: t.length,
        charactersNoSpaces: t.replace(/\s/g, "").length,
        words,
        lines: t.split(/\n/).length,
        sentences: (t.match(/[.!?]+/g) || []).length,
        readingTimeSec: Math.round((words / 200) * 60)
    }
}
export function textCase(text: string, type = "upper") {
    const t = String(text)
    switch (type) {
        case "lower": return t.toLowerCase()
        case "upper": return t.toUpperCase()
        case "title": return t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        case "sentence": return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
        case "reverse": return t.split("").reverse().join("")
        case "camel": return t.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase())
        case "snake": return t.trim().toLowerCase().replace(/\s+/g, "_")
        case "kebab": return t.trim().toLowerCase().replace(/\s+/g, "-")
        default: return t
    }
}
export function jsonFormat(json: string, minify = false) {
    const parsed = JSON.parse(json)
    return { valid: true, output: JSON.stringify(parsed, null, minify ? 0 : 2) }
}
export function slugify(text: string) {
    return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}
export function loremIpsum(paragraphs = 3) {
    const src =
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(" ")
    const p = () => {
        const n = 30 + Math.floor(Math.random() * 25)
        const s = Array.from({ length: n }, () => src[Math.floor(Math.random() * src.length)]).join(" ")
        return s.charAt(0).toUpperCase() + s.slice(1) + "."
    }
    return Array.from({ length: Math.min(10, Math.max(1, paragraphs)) }, p).join("\n\n")
}
export function colorInfo(hex: string) {
    const c = hexToRgb(hex)
    if (!c) throw { code: 400, message: "Format hex tidak valid (contoh: #4F8CFF)." }
    const { r, g, b } = c
    const [h, s, l] = rgbToHsl(r, g, b)
    return { hex: "#" + rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${h}, ${s}%, ${l}%)`, r, g, b }
}
export function randomColor() {
    const r = () => Math.floor(Math.random() * 256)
    const [R, G, B] = [r(), r(), r()]
    return colorInfo("#" + rgbToHex(R, G, B))
}
export function timestamp() {
    const now = Date.now()
    return { unix: Math.floor(now / 1000), unixMs: now, iso: new Date(now).toISOString(), utc: new Date(now).toUTCString() }
}
export function unixToDate(unix: number) {
    const ms = unix > 1e12 ? unix : unix * 1000
    return { input: unix, iso: new Date(ms).toISOString(), utc: new Date(ms).toUTCString(), locale: new Date(ms).toLocaleString("id-ID") }
}
export function diceRoll(sides = 6, count = 1) {
    const rolls = Array.from({ length: Math.min(100, Math.max(1, count)) }, () => 1 + Math.floor(Math.random() * Math.max(2, sides)))
    return { sides, count: rolls.length, rolls, total: rolls.reduce((a, b) => a + b, 0) }
}
export function mathEval(expr: string) {
    // Evaluator aman: hanya angka & operator dasar.
    const clean = String(expr).replace(/[^0-9+\-*/().%\s]/g, "")
    if (!clean.trim()) throw { code: 400, message: "Ekspresi kosong/tidak valid." }
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict";return (${clean})`)()
    if (typeof result !== "number" || !isFinite(result)) throw { code: 400, message: "Hasil tidak valid." }
    return { expression: clean.trim(), result }
}
export function jwtDecode(token: string) {
    const parts = String(token).split(".")
    if (parts.length < 2) throw { code: 400, message: "Token JWT tidak valid." }
    const dec = (s: string) => JSON.parse(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"))
    return { header: dec(parts[0]), payload: dec(parts[1]) }
}
export function morse(text: string, mode = "encode") {
    const M: Record<string, string> = { a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----." }
    if (mode === "decode") {
        const R = Object.fromEntries(Object.entries(M).map(([k, v]) => [v, k]))
        return String(text).trim().split(/\s+/).map((c) => R[c] || "").join("")
    }
    return String(text).toLowerCase().split("").map((c) => (c === " " ? "/" : M[c] || "")).join(" ").trim()
}
export function binaryText(text: string, mode = "encode") {
    if (mode === "decode") {
        return String(text).trim().split(/\s+/).map((b) => String.fromCharCode(parseInt(b, 2))).join("")
    }
    return String(text).split("").map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ")
}
export function agePlus(dob: string) {
    const d = new Date(dob)
    if (isNaN(+d)) throw { code: 400, message: "Tanggal tidak valid (YYYY-MM-DD)." }
    const diff = Date.now() - +d
    const years = Math.floor(diff / (365.25 * 86400000))
    const days = Math.floor(diff / 86400000)
    return { dob, years, months: Math.floor(diff / (30.44 * 86400000)), days, hours: Math.floor(diff / 3600000) }
}

// ─── helpers ───
function hexToRgb(hex: string) {
    const m = String(hex).replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i)
    if (!m) return null
    let h = m[1]
    if (h.length === 3) h = h.split("").map((c) => c + c).join("")
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}
function rgbToHex(r: number, g: number, b: number) {
    return [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
}
function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h /= 6
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}
function escapeXml(s: string) {
    return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string))
}
