# 🔧 PANDUAN SETUP SUPABASE UNTUK TEMPLATE SYNC

## 📋 Daftar Checklist Setup

### 1️⃣ Buat Supabase Project
- [ ] Buka https://app.supabase.com
- [ ] Klik "New Project" atau gunakan project yang sudah ada
- [ ] Catat **Project URL** dan **Anon Key** (langkah 3)

### 2️⃣ Buat Tabel Database `settings`

Di Supabase dashboard, buka **SQL Editor** dan jalankan query berikut:

```sql
-- Buat tabel settings untuk menyimpan pilihan template user
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktifkan Row Level Security (opsional, untuk public access)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk public read/write (untuk demo)
CREATE POLICY "Allow public access" ON settings
  FOR ALL USING (true) WITH CHECK (true);
```

**Pastikan:** Setelah menjalankan query, tabel `settings` muncul di sidebar **Tables**

---

### 3️⃣ Ambil Credentials Supabase

📍 Lokasi: **Supabase Dashboard → Your Project → Settings → API**

Cari informasi berikut:
- **Project URL**: Bentuknya `https://[project-id].supabase.co`
- **Anon Key** (public)

**⚠️ JANGAN GUNAKAN SECRET KEY** - Gunakan Anon Key yang public-safe

---

### 4️⃣ Konfigurasi File `src/lib/supabaseClient.ts`

Buka file `src/lib/supabaseClient.ts` dan ganti kedua baris ini:

```typescript
// ❌ SEBELUM (jangan gunakan ini)
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

```typescript
// ✅ SESUDAH (ganti dengan nilai Anda)
const SUPABASE_URL = 'https://abc123xyz.supabase.co'; // Contoh
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Contoh
```

**Contoh konkret:**
```typescript
const SUPABASE_URL = 'https://vwxyza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eHl6YWduaHJrc3doaeNTVwNm';
```

---

### 5️⃣ Integrasi Hook ke `src/App.tsx`

Buka `src/App.tsx` dan tambahkan import + hook:

```typescript
// Tambahkan import di paling atas
import { useTemplateSync } from '@/hooks/useTemplateSync';

function App() {
  const { currentStep, isDarkMode } = useStore();
  
  // ✨ Tambahkan baris ini untuk sinkronisasi template
  useTemplateSync();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* ... rest of component ... */}
    </div>
  );
}

export default App;
```

---

## 🎯 Cara Kerja Sistem

### Flow Sinkronisasi

```
┌─────────────────────────────────────────────────┐
│ User membuka website                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ useTemplateSync()  │
        │ dijalankan         │
        └────────┬───────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
       ▼                    ▼
   ┌─────────┐         ┌──────────────┐
   │Supabase │         │Local Storage │
   │ Query   │ Fail    │ (Fallback)   │
   └────┬────┘─────────┼──────────────┘
        │              │
        └──────┬───────┘
               ▼
    Template dimuat & ditampilkan
               │
               ▼
    User pilih template baru
               │
               ▼
        saveTemplate() dipanggil
               │
       ┌───────┴──────────┐
       ▼                  ▼
   ┌─────────┐      ┌──────────────┐
   │Supabase │      │Local Storage │
   │  UPSERT │      │   SAVE       │
   └─────────┘      └──────────────┘
```

---

## 📝 Fungsi-Fungsi yang Tersedia

### 1. `templateClient.saveTemplate(templateName)`
**Mengirim pilihan template ke Supabase**
```typescript
import { templateClient } from '@/lib/supabaseClient';

// Contoh penggunaan
await templateClient.saveTemplate('Classic Frame');
// ✅ Menyimpan ke Supabase + Local Storage
```

### 2. `templateClient.loadTemplate()`
**Mengambil template terakhir dari Supabase / Local Storage**
```typescript
const lastTemplate = await templateClient.loadTemplate();
// Jika ada: "Classic Frame"
// Jika tidak: null
```

### 3. `templateClient.testConnection()`
**Tes koneksi ke Supabase**
```typescript
const isConnected = await templateClient.testConnection();
// Mengembalikan: true / false
```

---

## 🔒 Keamanan & Best Practice

### ✅ Yang Sudah Diimplementasikan:
- ✔️ User ID unik per device (disimpan di localStorage)
- ✔️ Fallback ke Local Storage jika Supabase tidak tersedia
- ✔️ Graceful error handling
- ✔️ Tidak perlu authentication (cocok untuk public apps)

### ⚠️ Untuk Production:
Jika ingin keamanan lebih tinggi:
1. Ganti Anon Key dengan policy RLS yang lebih ketat
2. Tambahkan authentication (Google, GitHub, dll)
3. Edit policy untuk hanya allow user sendiri
4. Gunakan environment variables (`.env`)

**Contoh policy lebih aman:**
```sql
CREATE POLICY "Allow user to access own settings" ON settings
  FOR ALL USING (
    auth.uid()::text = user_id
  ) WITH CHECK (
    auth.uid()::text = user_id
  );
```

---

## 🧪 Testing & Debugging

### Terminal Output yang Diharapkan

Saat pertama kali membuka app:
```
✅ Template dimuat dari Supabase: Classic Frame
```

Saat memilih template baru:
```
✅ Template berhasil disimpan ke Supabase: Triple Strip
```

Jika Supabase error (masih aman):
```
⚠️ Gagal menyimpan ke Supabase, menggunakan Local Storage
✅ Template berhasil disimpan ke Supabase: Classic Frame
```

### Cek Data di Supabase

1. Buka **Supabase Dashboard**
2. Pilih tabel `settings`
3. Lihat data yang tersimpan
4. Verifikasi `template_name` dan `updated_at`

---

## 🚀 Deployment ke Vercel

### Environment Variables di Vercel (Opsional)

Jika ingin lebih aman, gunakan env variables:

1. Buka Vercel project Anda
2. **Settings → Environment Variables**
3. Tambahkan:
   ```
   REACT_APP_SUPABASE_URL = https://xxx.supabase.co
   REACT_APP_SUPABASE_KEY = eyJ...
   ```

4. Update `src/lib/supabaseClient.ts`:
   ```typescript
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fallback.supabase.co';
   const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY || '';
   ```

---

## ❓ Troubleshooting

### Problem: Template tidak tersimpan
✅ **Solusi:**
- Cek browser console (F12) → Console tab
- Pastikan SUPABASE_URL benar (harus `https://`)
- Cek network tab → lihat request ke supabase.co
- Verifikasi SUPABASE_KEY tidak expired

### Problem: Template tidak dimuat saat reload
✅ **Solusi:**
- Buka DevTools → Application → Local Storage
- Cek apakah `last_selected_template` tersimpan
- Jika ada, Local Storage fallback sedang bekerja
- Jika tidak ada, user belum memilih template sebelumnya

### Problem: Error "Unauthorized" 
✅ **Solusi:**
- Pastikan menggunakan **Anon Key** bukan Secret Key
- Cek RLS policy sudah diaktifkan dengan `"Allow public access"`
- Restart Supabase: Settings → Restart Project

### Problem: CORS Error
✅ **Solusi:**
- Ini normal jika Supabase menggunakan CORS headers yang ketat
- Gunakan proxy atau serverless function sebagai middleware
- Atau aktifkan RLS policy yang lebih permissive

---

## 📚 File-File Penting

| File | Deskripsi |
|------|-----------|
| `src/lib/supabaseClient.ts` | Client utama Supabase (ganti credentials sini) |
| `src/hooks/useTemplateSync.ts` | React hook untuk sinkronisasi |
| `src/App.tsx` | Tempat mengaktifkan hook |

---

## 💡 Tips & Trik

1. **User ID**: Secara otomatis dibuat per device, disimpan di localStorage
2. **Offline Mode**: Semua tetap bekerja tanpa internet (fallback Local Storage)
3. **Real-time**: Untuk fitur real-time antar devices, gunakan Supabase Realtime
4. **Custom User ID**: Ganti method `getUserId()` jika ingin tracking user spesifik

---

## 📞 Need Help?

- Dokumentasi Supabase: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Buat issue di repository Anda

Happy coding! 🎉
