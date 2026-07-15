# 🌌 StarNova

**Premium REST API Platform** — Next.js 14 (App Router, RSC/SSR), tema Space/Supernova/Cyberpunk, Framer Motion, single-domain (landing + docs + playground + dashboard + API dalam satu app).

Deploy target: **Vercel**. Domain tunggal (dikonfigurasi via env), mis. `https://starnova.my.id`.

---

## ✨ Highlights

- **Dashboard-first**: jelajahi bebas, login hanya saat pakai fitur (Try API, akun).
- **Google OAuth** (NextAuth) + auto-generate API Key `snv_xxx` saat login pertama. Ada demo login untuk testing.
- **Server-first**: data dashboard/landing di-fetch di **Server Components / route SSR**, bukan `useEffect` di browser. React Query/SWR tak dipakai untuk initial render.
- **UI premium** setara Vercel/Linear/Supabase: animated starfield + shooting stars + moving nebula + aurora + floating planet + mouse light + glass cards (border-gradient, noise, glow, tilt) + page transitions + number counters — semua GPU-friendly (transform/opacity).
- **91+ endpoint** (AI, Downloader, Search, Utility, Image, Text, Brat) dengan dokumentasi otomatis (11 bahasa contoh kode) + Playground live.
- **Status page** "satellite control center": system health (CPU/RAM/latency), services, live request feed, request origins.

## 🎨 Palet
`#4F8CFF` primary · `#8B5CF6` secondary · `#22D3EE` accent · `#5EEAD4` glow · `#EF4444` danger · `#22C55E` success · `#020617` bg · panel `rgba(255,255,255,.05)` · border `rgba(255,255,255,.08)`.

## 🗂️ Struktur

```
app/
  page.tsx              landing (SSR + stats server-first)
  docs/                 dokumentasi (ISR)
  playground/           try API (client, Suspense)
  pricing/  status/     pricing & control center
  login/  dashboard/    auth + dashboard (server-guarded)
  api/
    auth/[...nextauth]  NextAuth (Google + demo)
    v1/[...path]        runner semua endpoint API
    docs, stats         meta
    account/*           keys & overview (session-guarded)
components/
  space/SpaceBackground background interaktif (canvas)
  ui/Motion, Button     primitives (framer-motion, GPU)
  layout, docs, playground, status, dashboard, auth
lib/
  config, mongo, models, registry (endpoint+docs),
  providers, apikey, auth, session, runner, codeSamples, highlight
```

## 🚀 Deploy ke Vercel

1. Push repo → Import ke Vercel (framework **Next.js** otomatis).
2. Set **Environment Variables** (lihat `.env.example`):
   - `MONGODB_URI` (MongoDB Atlas, wajib)
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL` (= domainmu)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (redirect: `https://DOMAIN/api/auth/callback/google`)
   - `ADMIN_EMAILS` (email admin)
3. Deploy → set domain.
4. Seed plan sekali: `MONGODB_URI="..." npm run seed`.

## 🔑 Contoh Pakai API

```bash
curl "https://starnova.my.id/api/v1/ai/chat?text=Halo" -H "apikey: snv_xxx"
```
Response: `{ "status": true, "creator": "StarNova API", "result": {...} }`

## 🛠️ Lokal
```bash
npm install
cp .env.example .env   # isi
npm run dev
```

## Performa
Server-first + streaming + code splitting + font optimization (`next/font`) + animasi GPU. Bundle First-Load ~87 kB shared.

## Lisensi
MIT
