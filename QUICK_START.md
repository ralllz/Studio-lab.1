# ⚡ QUICK START - 5 Minutes Setup

Jika Anda sudah punya Supabase project dengan tabel `settings`, ikuti 3 langkah ini:

## 1️⃣ Get Credentials (1 minute)

Buka: https://app.supabase.com → pilih project → Settings > API

Copy nilai:
- **Project URL** (contoh: `https://xyzabc123.supabase.co`)
- **anon public** key (contoh: `eyJhbGci...`)

## 2️⃣ Update Configuration (2 minutes)

Buka file: `src/hooks/useSupabaseTemplateSync.ts`

Cari bagian ini (baris ~17-21):
```typescript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI
```

Paste credentials Anda:
```typescript
const SUPABASE_URL = 'https://xyzabc123.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Itu saja!** Simpan file.

## 3️⃣ Test (2 minutes)

```bash
# Build & run
npm run build
npm run preview  # atau npm run dev

# Buka browser
open http://localhost:4173  # (atau 5173 untuk dev)

# Open console (F12)
# Akan ada log: "✅ [APP] Template sync initialized successfully"

# Test: pilih template → check Supabase tabel 'settings' → row id=1 updated ✓
```

---

## ✅ Selesai!

Sekarang:
- ✅ Template disimpan ke Supabase (id=1)
- ✅ Dibuka di device lain → template otomatis sync
- ✅ Realtime updates (no refresh needed)
- ✅ No localStorage (Supabase is source of truth)

---

## 🧪 Verify It Works

Open 2 tabs (or 2 devices):
```
Device A: http://localhost:4173
Device B: http://localhost:4173
```

1. Device A: Pilih template "Template A"
2. Supabase: Check tabel settings → row id=1 harus ada dengan template_name="Template A"
3. Device B: Harus auto-update ke "Template A" (dalam 1-2 detik)

Jika ya → **DONE!** 🎉

---

## 📝 Apa Yang Berubah?

**Dibuat baru:**
- `src/hooks/useSupabaseTemplateSync.ts` (hook untuk realtime sync)

**Diupdate:**
- `src/App.tsx` (menggunakan hook baru)

**Tetap sama:**
- Semua file lainnya (automatic!)

---

## 🆘 Masalah?

1. Build error?
   ```bash
   npm install @supabase/supabase-js
   npm run build
   ```

2. Credentials tidak correct?
   - Double-check di Supabase Settings > API
   - Copy-paste dengan hati-hati (no space, no quotes)

3. Realtime tidak bekerja?
   - F12 → Console → ada error message?
   - Cek Supabase RLS policy (harus allow public)
   - Run `window.debugSupabase()` di console

---

Untuk info lebih detail, baca: [SETUP_REALTIME_SYNC.md](./SETUP_REALTIME_SYNC.md)
