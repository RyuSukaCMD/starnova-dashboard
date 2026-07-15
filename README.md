# 🛰️ StarNova Dashboard

Dashboard frontend (statis, SPA) untuk **StarNova API** — tema Supernova/Space, glassmorphism, neon.

- **Domain:** `https://dash.starnova.my.id`
- **Backend:** `https://api.starnova.my.id` (repo `starnova-api`)

## Fitur
- Login / Register (JWT)
- **Dashboard**: Total Request, Sisa Limit, API Key, Expired, Recent Request, Top Endpoint, Chart Request
- **API Keys**: buat, hapus, enable/disable, regenerate, copy
- **Usage & Analytics**
- **Billing** (link ke pembelian di web)
- **Settings**
- **Admin panel** (tampil otomatis bila akun admin): manage user, ban/unban, announcement, maintenance mode

## Deploy ke Vercel
1. Push repo ke GitHub.
2. Import ke Vercel (framework: **Other**, output: `public`).
3. `vercel.json` sudah rewrite semua ke `index.html` (SPA).
4. Set domain `dash.starnova.my.id`.
5. Bila API di domain lain, ubah `public/config.js`:
   ```js
   window.STARNOVA_CONFIG = { API_BASE: "https://api.starnova.my.id" }
   ```

## Jalankan lokal
```bash
npx serve public
```

## Login Admin default
Setelah `npm run seed` di repo API: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (default `admin@starnova.my.id` / `starnova-admin`).

## Lisensi
MIT
