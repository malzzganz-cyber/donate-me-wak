# Malzz Store – Platform Donasi Ultra Premium 🚀

Platform donasi multi-creator dengan desain glassmorphism + neon glow, realtime Firebase, overlay OBS, dan payment QRIS via Pakasir.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Fill in your credentials (see setup below)

# 4. Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🔧 Setup

### 1. Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru
3. Enable **Authentication** → Google + Email/Password
4. Enable **Firestore Database**
5. Salin config ke `.env.local`
6. Deploy Firestore rules: `firebase deploy --only firestore:rules`
7. Deploy indexes: `firebase deploy --only firestore:indexes`

### 2. Pakasir (Payment Gateway)

1. Daftar di [pakasir.com](https://pakasir.com)
2. Buat project dan dapatkan slug + API key
3. Set redirect URL ke: `https://yourdomain.com/success?order_id={order_id}`

### 3. Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

PAKASIR_SLUG=your_slug
PAKASIR_API_KEY=your_api_key
NEXT_PUBLIC_PAKASIR_SLUG=your_slug

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PLATFORM_FEE=0.05
```

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Login / Register
│   ├── [username]/page.tsx   # Halaman donasi publik
│   ├── success/page.tsx      # Halaman sukses + konfetti
│   ├── overlay/
│   │   └── [username]/page.tsx  # Overlay OBS transparan
│   ├── dashboard/
│   │   ├── layout.tsx        # Layout sidebar dashboard
│   │   ├── page.tsx          # Dashboard utama + chart
│   │   ├── notifications/    # Notification center
│   │   └── withdraw/         # Sistem withdraw manual
│   └── api/
│       └── check-status/     # Verifikasi Pakasir
├── hooks/
│   ├── useAuth.tsx           # Auth context + provider
│   └── useRealtime.ts        # Firestore realtime hooks
├── lib/
│   ├── firebase.ts           # Firebase config
│   └── utils.ts              # Helper functions
└── types/
    └── index.ts              # TypeScript types
```

---

## 🎯 Fitur

- ✅ Auth: Google + Email/Password
- ✅ Halaman donasi publik per creator
- ✅ Payment QRIS via Pakasir
- ✅ Auto-verify polling (5 detik)
- ✅ Fee platform 5% otomatis
- ✅ Realtime dashboard (Firestore onSnapshot)
- ✅ Chart pemasukan 7 hari
- ✅ Leaderboard top donatur
- ✅ Notification center realtime
- ✅ Overlay transparan untuk OBS
- ✅ Withdraw manual + riwayat
- ✅ Success page dengan konfetti
- ✅ Glassmorphism + neon glow design
- ✅ Framer Motion animations

---

## 🎥 Overlay OBS

URL Overlay: `https://yourdomain.com/overlay/{username}`

Di OBS:
1. Tambah source → Browser
2. URL: link overlay di atas
3. Width: 1920, Height: 1080
4. Centang "Shutdown source when not visible"
5. Background: `chroma key` atau biarkan transparan

---

## 💰 Alur Donasi

1. Donatur buka `/{username}`
2. Isi nama, pesan, nominal
3. Sistem hitung fee 5% → redirect QRIS Pakasir
4. Setelah bayar → redirect ke `/success?order_id=...`
5. Frontend polling `/api/check-status` setiap 5 detik
6. Jika confirmed:
   - Update status donation → `completed`
   - Tambah balance creator
   - Buat notifikasi
   - Trigger overlay realtime
   - Tampilkan konfetti

---

## 🏗️ Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel dashboard
```

---

Made with ❤️ by **Malzz Store** — Platform Donasi Level Startup Global 🚀
