# 🌌 StarNova

**Premium REST API Platform** — Next.js 14 (App Router, RSC/SSR), tema Space/Supernova/Cyberpunk, Framer Motion. Satu app untuk **landing + docs + playground + dashboard + API** dalam **satu domain**.

Login **default: Google OAuth**. API Key `snv_xxx` dibuat otomatis saat login pertama.

---

## 📑 Daftar Isi
1. [Prasyarat](#-1-prasyarat)
2. [Clone & Install](#-2-clone--install)
3. [Setup Environment Variable (dari awal sampai akhir)](#-3-setup-environment-variable)
    - 3.1 [NEXT_PUBLIC_SITE_URL & NEXTAUTH_URL](#31-domain--nextauth_url)
    - 3.2 [NEXTAUTH_SECRET](#32-nextauth_secret)
    - 3.3 [MONGODB_URI (MongoDB Atlas)](#33-mongodb_uri--mongodb-atlas)
    - 3.4 [GOOGLE_CLIENT_ID & SECRET (Google OAuth)](#34-google-oauth-login-default)
    - 3.5 [ADMIN_EMAILS](#35-admin)
    - 3.6 [ALLOW_DEMO_LOGIN](#36-demo-login-opsional)
4. [Jalankan Lokal](#-4-jalankan-lokal)
5. [Seed Database](#-5-seed-database)
6. [Deploy ke Vercel](#-6-deploy-ke-vercel)
7. [Pakai API](#-7-pakai-api)
8. [Troubleshooting](#-8-troubleshooting)

---

## ✅ 1. Prasyarat
- **Node.js ≥ 18.17** (`node -v`)
- Akun **GitHub**
- Akun **Vercel** (gratis) — untuk deploy
- Akun **MongoDB Atlas** (gratis) — database
- Akun **Google Cloud** (gratis) — untuk OAuth

---

## 📦 2. Clone & Install
```bash
git clone https://github.com/RyuSukaCMD/starnova-dashboard.git
cd starnova-dashboard
npm install
```

---

## 🔐 3. Setup Environment Variable

Buat file **`.env.local`** di root project (untuk lokal). Untuk produksi, isi nilai yang sama di **Vercel → Settings → Environment Variables**.

Template lengkap ada di **`.env.example`**. Berikut cara mendapatkan tiap nilai **dari awal sampai akhir**:

### 3.1 Domain & NEXTAUTH_URL
Satu domain dipakai untuk semuanya.

| Lokal | Produksi |
|-------|----------|
| `http://localhost:3000` | `https://domainmu.com` (mis. `https://starnova.my.id`) |

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```
> Saat deploy, ganti keduanya ke domain Vercel/custom kamu.

---

### 3.2 NEXTAUTH_SECRET
Kunci enkripsi sesi. Generate string acak:
```bash
openssl rand -base64 32
```
Salin hasilnya:
```env
NEXTAUTH_SECRET=hasil-random-panjang-di-sini
```
> Tanpa OpenSSL? Pakai: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

---

### 3.3 MONGODB_URI — MongoDB Atlas
1. Buka **https://cloud.mongodb.com** → daftar/masuk.
2. **Create** → pilih **M0 (Free)** → pilih region terdekat → **Create Deployment**.
3. Muncul **Security Quickstart**:
   - Buat **username** & **password** database (catat!).
   - **Add IP Address** → pilih **Allow Access from Anywhere** (`0.0.0.0/0`) — perlu agar Vercel bisa konek.
4. Klik **Connect** → **Drivers** → pilih **Node.js** → salin **connection string**, contoh:
   ```
   mongodb+srv://USER:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Ganti `<password>` dengan password kamu, dan tambahkan nama database `starnova` sebelum tanda `?`:
   ```env
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/starnova?retryWrites=true&w=majority
   ```
> Jika password mengandung karakter spesial (`@ : / #`), encode dulu (mis. `@` → `%40`).

---

### 3.4 Google OAuth (login default)
1. Buka **https://console.cloud.google.com** → buat **Project** baru (mis. "StarNova").
2. **APIs & Services → OAuth consent screen**:
   - User Type: **External** → **Create**.
   - Isi App name (StarNova), User support email, Developer email → **Save**.
   - (Testing) tambahkan email kamu di **Test users** bila app belum di-publish.
3. **APIs & Services → Credentials → + Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (lokal)
     - `https://domainmu.com` (produksi)
   - **Authorized redirect URIs** (WAJIB tepat):
     - `http://localhost:3000/api/auth/callback/google`
     - `https://domainmu.com/api/auth/callback/google`
   - **Create** → muncul **Client ID** & **Client Secret**.
4. Masukkan:
   ```env
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx
   ```
> ⚠️ Redirect URI harus **persis sama** (termasuk `https`/`http` dan tanpa trailing slash), kalau tidak login akan `redirect_uri_mismatch`.

---

### 3.5 Admin
Admin default **sudah di-set**: `starnovabusinessmail@gmail.com`. Login dengan Google memakai email itu → otomatis jadi **admin**.

Mau menambah admin lain? (opsional, comma-separated):
```env
ADMIN_EMAILS=teman@gmail.com,partner@gmail.com
```

---

### 3.6 Demo login (opsional)
Login tanpa Google — hanya untuk **testing lokal**. **Default: OFF**.
```env
ALLOW_DEMO_LOGIN=true   # aktifkan hanya bila perlu testing tanpa Google
```
> Di produksi biarkan `false` / kosong agar hanya Google yang aktif.

---

### 📄 Contoh `.env.local` lengkap (lokal)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=hasil-openssl-rand-base64-32
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/starnova?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx
ADMIN_EMAILS=
ALLOW_DEMO_LOGIN=false
```

---

## 🖥️ 4. Jalankan Lokal
```bash
npm run dev
```
Buka **http://localhost:3000**.

---

## 🌱 5. Seed Database
Isi paket harga & settings awal (jalankan sekali, pakai MONGODB_URI yang sama):
```bash
MONGODB_URI="mongodb+srv://..." npm run seed
```
Output: `✅ Seed selesai (plans + settings).`

> Admin **tidak** perlu di-seed — cukup login Google pakai `starnovabusinessmail@gmail.com`, otomatis jadi admin.

---

## 🚀 6. Deploy ke Vercel
1. Push project ke GitHub.
2. **https://vercel.com** → **Add New → Project** → import repo `starnova-dashboard`.
3. Framework otomatis terdeteksi: **Next.js** (biarkan default).
4. **Environment Variables** → tambahkan semua variabel dari `.env.local`, dengan **`NEXT_PUBLIC_SITE_URL` & `NEXTAUTH_URL` diganti ke domain Vercel/custom** (mis. `https://starnova.my.id`).
5. **Deploy**.
6. Setelah deploy, **tambahkan redirect URI produksi** di Google Cloud (lihat 3.4):
   `https://domainmu.com/api/auth/callback/google`
7. Set **custom domain** di Vercel → Settings → Domains (opsional).
8. Seed sekali (dari lokal, arah ke Atlas yang sama): `MONGODB_URI="..." npm run seed`.

Selesai! 🎉

---

## 🔑 7. Pakai API
Login → dashboard → salin API Key (`snv_...`), lalu:
```bash
curl "https://domainmu.com/api/v1/ai/chat?text=Halo" -H "apikey: snv_xxxx"
```
Response standar:
```json
{ "status": true, "creator": "StarNova API", "result": { "answer": "..." } }
```
Coba langsung tanpa kode di **/playground**, lihat semua endpoint di **/docs**.

---

## 🛠️ 8. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `redirect_uri_mismatch` saat login Google | Redirect URI di Google Cloud harus **persis** `https://DOMAIN/api/auth/callback/google` (cek http/https, tanpa `/` di akhir). |
| Login Google gagal / "belum dikonfigurasi" | Pastikan `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` terisi & di-redeploy. |
| Data tidak tersimpan / dashboard kosong | `MONGODB_URI` salah, atau IP Atlas belum `0.0.0.0/0`. |
| Sesi error / `NEXTAUTH_URL` warning | Set `NEXTAUTH_URL` = domain persis yang dipakai. |
| Bukan admin padahal harusnya admin | Login pakai email yang ada di admin default / `ADMIN_EMAILS`. |
| Build gagal di Vercel | Pastikan framework = Next.js (bukan static). Sudah diatur di `vercel.json`. |

---

## 🧩 Struktur singkat
```
app/          landing, docs, playground, pricing, status, login, dashboard, api/*
components/   space background, ui (motion/button), layout, docs, playground, status, dashboard, auth
lib/          config, mongo, models, registry(endpoint+docs), providers, apikey, auth, session, runner
```

## Lisensi
MIT
