# 🎯 TEMPLATE SYNC SETUP - 3 LANGKAH CEPAT

## ✅ Yang Sudah Dibuat

File-file baru telah ditambahkan ke project Anda:

```
src/lib/supabaseClient.ts          ← Client Supabase (ganti credentials sini)
src/hooks/useTemplateSync.ts       ← React hook untuk auto-sync
src/App.tsx                        ← Sudah terintegrasi hook
SUPABASE_SETUP.md                  ← Dokumentasi lengkap
SUPABASE_IMPLEMENTATION.html       ← Contoh code & pure JS
```

---

## 🚀 LANGKAH 1: Setup Supabase Project (5 menit)

### 1.1 Buat Project Supabase

1. Buka https://app.supabase.com
2. Klik **"New Project"** (atau gunakan yang existing)
3. Tunggu project selesai dibuat (2-3 menit)

### 1.2 Buat Tabel Database

1. Di dashboard Supabase, buka **SQL Editor**
2. Paste dan jalankan script berikut:

```sql
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON settings
  FOR ALL USING (true) WITH CHECK (true);
```

3. Pastikan tabel `settings` muncul di sidebar kiri

---

## 🔑 LANGKAH 2: Ambil Credentials (2 menit)

1. **Buka menu Settings** → **API**
2. **Copy** 2 informasi penting:
   - **Project URL** (bentuknya: `https://[project-id].supabase.co`)
   - **Anon Key** (satu string panjang `eyJ...`)

**⚠️ PENTING:** 
- Gunakan **Anon Key** (public), bukan Secret Key
- Jangan pernah share Secret Key

---

## ⚙️ LANGKAH 3: Update Credentials (2 menit)

### Buka file: `src/lib/supabaseClient.ts`

Cari 2 baris ini (di bagian paling atas):

```typescript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI
```

### Ganti dengan credentials Anda:

**SEBELUM:**
```typescript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

**SESUDAH (Contoh):**
```typescript
const SUPABASE_URL = 'https://vwxyza12345.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IgF2d3h5emExMjM0NSJ9.aBc123XyZ';
```

✅ **SELESAI!** Hook sudah terintegrasi ke `App.tsx` secara otomatis.

---

## 🧪 Testing

### 1. Buka browser console (F12)

Saat page load, Anda akan melihat:
```
✅ Template dimuat dari Supabase: Classic Frame
// atau
💾 Template dimuat dari Local Storage: Triple Strip
```

### 2. Pilih template & verifikasi di Supabase

- Pilih template di UI Anda
- Buka Supabase dashboard
- Lihat tabel `settings` 
- Seharusnya ada data baru dengan `template_name` yang dipilih

---

## 🎯 Cara Kerja (Ringkas)

1. **Page Load** → `loadTemplate()` dipanggil
   - Ambil dari Supabase (sync dengan device lain)
   - Fallback ke localStorage jika Supabase down

2. **User Pilih Template** → `saveTemplate()` dipanggil
   - Simpan ke Supabase (sync ke semua device)
   - Simpan juga ke localStorage (instant)

3. **Device Lain** → Buka halaman
   - Akan load template terakhir dari Supabase
   - ✅ Template sudah sinkron!

---

## 📝 Fungsi-Fungsi Tersedia (Opsional)

Jika ingin mengakses langsung:

```typescript
import { templateClient } from '@/lib/supabaseClient';

// Simpan template
await templateClient.saveTemplate('Classic Frame');

// Muat template
const lastTemplate = await templateClient.loadTemplate();

// Test koneksi
const isConnected = await templateClient.testConnection();
```

---

## ⚠️ Troubleshooting

### Template tidak tersimpan
- ✅ Cek console (F12) → untuk error message
- ✅ Pastikan SUPABASE_URL benar (ada `https://`)
- ✅ Pastikan SUPABASE_KEY tidak expired
- ✅ Verifikasi tabel `settings` exists di Supabase

### Selalu load dari localStorage (bukan Supabase)
- Ini AMAN - fallback sedang bekerja
- Pastikan Supabase URL & Key benar
- Cek network tab di DevTools → pastikan request ke supabase.co

### Error "Unauthorized"
- ✅ Gunakan **Anon Key** (bukan Secret Key)
- ✅ Verifikasi RLS policy sudah ada
- ✅ Restart Supabase dari Settings → Restart Project

---

## 📖 Dokumentasi Lengkap

Lihat file **SUPABASE_SETUP.md** untuk:
- Setup detail step-by-step
- Database queries lengkap
- Keamanan (RLS policies)
- Production setup
- Troubleshooting mendalam

---

## ✨ Fitur Bonus

Sistem ini sudah mendukung:
- ✅ Sync otomatis antar device
- ✅ Offline mode (localStorage fallback)
- ✅ Unique user ID per device
- ✅ Auto-generated timestamps
- ✅ Clean error handling
- ✅ No npm dependencies (langsung pakai)

---

## 🚀 Deployment ke Vercel

Setup sekarang sudah siap deploy:

1. **Push kode ke GitHub** (dengan credentials sudah di-set)
2. **Vercel akan auto-deploy**
3. **Template sync akan langsung work** di production ✅

---

## 💬 Pertanyaan?

- Dokumentasi Supabase: https://supabase.com/docs
- Lihat console browser (F12) untuk error details
- Cek file `SUPABASE_SETUP.md` untuk Q&A lebih banyak

Happy coding! 🎉
