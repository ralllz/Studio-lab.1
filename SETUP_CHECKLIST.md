# ✅ QUICK ACTION CHECKLIST

## 🎯 TUJUAN
Template yang dipilih akan tersimpan di Supabase & tersinkronisasi otomatis di semua device.

---

## 📋 ACTIONS (Copy-paste ready)

### STEP 1: Buat Supabase Project (5 menit)

- [ ] Buka browser → https://app.supabase.com
- [ ] Click "New Project"
  - Name: Apa saja (misal: "studio-lab")
  - Password: Apa saja (save di tempat aman)
  - Region: Pilih terdekat dengan lokasi Anda
- [ ] Tunggu project selesai dibuat (2-3 menit)

---

### STEP 2: Buat Database Table (3 menit)

- [ ] Di Supabase dashboard, klik **"SQL Editor"** (menu kiri)
- [ ] Copy-paste script di bawah:

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

- [ ] Click **"RUN"** (tombol hijau)
- [ ] Tunggu "Success" message
- [ ] Verifikasi: Buka **"Tables"** di sidebar → harus ada `settings` table

---

### STEP 3: Ambil Credentials (2 menit)

- [ ] Klik **"Settings"** (roda gigi icon di sidebar kiri)
- [ ] Pilih **"API"** di submenu
- [ ] **Copy** 2 hal ini:
  
  **A. Project URL:**
  ```
  https://[something].supabase.co
  ```
  (Cari di section "Project URL")

  **B. Anon Key:**
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
  (Cari di section "Anon key" - copy seluruh string)

- [ ] Save di note temporary (jangan commit ke GitHub!)

---

### STEP 4: Update File (2 menit)

- [ ] Buka di VS Code: `src/lib/supabaseClient.ts`
- [ ] Cari baris 11-12:

**SEBELUM:**
```typescript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI
```

**SESUDAH (ganti dengan nilai Anda):**
```typescript
const SUPABASE_URL = 'https://vwxyza12345.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...';
```

**Petunjuk:**
- Hapus teks `YOUR_PROJECT_ID` → ganti `https://xxx.supabase.co`
- Hapus teks `YOUR_ANON_KEY_HERE` → ganti dengan anon key
- **PENTING:** Jangan hapus `https://` dan `.supabase.co`

- [ ] Save file (Ctrl+S)

---

### STEP 5: Test Locally (5 menit)

- [ ] Open terminal di VS Code (Ctrl+`)
- [ ] Jalankan:
  ```bash
  npm run dev
  ```
- [ ] Tunggu "Local: http://localhost:5173" muncul
- [ ] Buka browser → http://localhost:5173
- [ ] Buka DevTools: F12 → **Console** tab
- [ ] **Pilih template** dari UI
- [ ] Cek console:
  ```
  ✅ Template berhasil disimpan ke Supabase: [nama template]
  ```
- [ ] **Reload halaman:** F5
- [ ] Cek console:
  ```
  ✅ Template dimuat dari Supabase: [nama template]
  ```
- [ ] ✅ **SUCCESS!** Template persisten setelah reload

**Jika error:** Lihat console error → cek SUPABASE_URL & SUPABASE_KEY

---

### STEP 6: Deploy ke Vercel (2 menit)

- [ ] Terminal → commit & push:
  ```bash
  git add .
  git commit -m "Add Supabase template sync"
  git push origin main
  ```

- [ ] Vercel auto-deploys (jika sudah connected)
- [ ] Tunggu sampai status: **"Ready ✓"** (di Vercel dashboard)
- [ ] Buka production URL:
  ```
  https://your-domain.vercel.app
  ```

- [ ] **Test production:**
  - [ ] Buka halaman
  - [ ] Pilih template
  - [ ] Reload: F5
  - [ ] ✅ Template persisten
  - [ ] Buka di device lain
  - [ ] ✅ Template sinkron

---

## 🆘 TROUBLESHOOTING QUICK FIX

### ❌ "Unauthorized" Error

```
✅ FIX 1: Pastikan URL format benar:
   SEBELUM: 'YOUR_PROJECT_ID.supabase.co'
   SESUDAH: 'https://vwxyza12345.supabase.co' ← ada "https://"

✅ FIX 2: Pastikan menggunakan Anon Key (bukan Secret Key):
   WRONG: sbp_... (ini Secret Key)
   RIGHT: eyJ... (ini Anon Key)

✅ FIX 3: Test Supabase connection:
   Buka browser console, paste:
   
   fetch('https://vwxyza12345.supabase.co/rest/v1/', {
     headers: { 'apikey': 'eyJ...' }
   }).then(r => r.ok ? console.log('✅ OK') : console.log('❌ FAILED'))
```

### ❌ Template tidak tersimpan

```
✅ FIX 1: Buka browser DevTools (F12) → Network tab:
   - Lihat request ke "supabase.co"
   - Check status code (200 = OK, 401 = auth error)

✅ FIX 2: Pastikan tabel "settings" sudah dibuat:
   - Buka Supabase dashboard
   - Klik "Tables" di sidebar
   - Seharusnya ada tabel "settings"
   - Jika tidak ada: jalankan lagi SQL script dari STEP 2

✅ FIX 3: Cek RLS Policy:
   - Buka tabel "settings"
   - Klik "RLS Policies" (di atas)
   - Seharusnya ada policy "Allow public access"
```

### ❌ Selalu load dari localStorage (bukan Supabase)

```
✅ Ini NORMAL = fallback sedang bekerja ✓
   Console message: "⚠️ Error loading from Supabase, using localStorage"

   Solusi:
   1. Cek console error detail
   2. Verifikasi SUPABASE_URL benar (di supabaseClient.ts)
   3. Verifikasi SUPABASE_KEY benar
   4. Cek internet connection stabil
   5. Restart dev server: Ctrl+C → npm run dev
```

---

## 🚀 AFTER VERIFICATION

Setelah semua test berhasil:

- [ ] Upload/push ke GitHub
- [ ] Production live ✨
- [ ] Template sync siap untuk semua user

---

## 📞 DOKUMENTASI LENGKAP

| Untuk | Baca File |
|-------|-----------|
| Setup detail | `SUPABASE_SETUP.md` |
| Quick reference | `TEMPLATE_SYNC_QUICK_START.md` |
| Visual guide | `BEFORE_AFTER_GUIDE.md` |
| Summary | `IMPLEMENTATION_SUMMARY.md` |
| Code example | `SUPABASE_IMPLEMENTATION.html` |

---

## 💾 FILES YANG DIBUAT

```
✅ src/lib/supabaseClient.ts          ← Ganti SUPABASE_URL & KEY sini
✅ src/hooks/useTemplateSync.ts       ← Sudah terintegrasi (no action)
✅ src/App.tsx                        ← Sudah updated (no action)
✅ SUPABASE_SETUP.md                  ← Backup docs
✅ TEMPLATE_SYNC_QUICK_START.md       ← Reference
✅ BEFORE_AFTER_GUIDE.md              ← Visual guide
✅ IMPLEMENTATION_SUMMARY.md          ← Ringkasan
✅ SUPABASE_IMPLEMENTATION.html       ← Code reference
✅ SETUP_CHECKLIST.md                 ← File ini
```

---

## ⏱️ ESTIMATED TIME

| Step | Time |
|------|------|
| 1. Create Supabase Project | 5 min |
| 2. Create table SQL | 3 min |
| 3. Copy credentials | 2 min |
| 4. Update src/lib/supabaseClient.ts | 2 min |
| 5. Test locally | 5 min |
| 6. Deploy to Vercel | 2 min |
| **TOTAL** | **~19 minutes** ⏰ |

---

## ✨ DONE?

**Jika semua di-check:** Congratulations! 🎉

Template sync dengan Supabase sudah LIVE!

🚀 Users sekarang bisa:
- ✅ Pilih template sekali
- ✅ Template tersimpan permanent
- ✅ Reload halaman → template tetap
- ✅ Buka di device lain → template sinkron

---

**Questions?** Lihat FAQ di `SUPABASE_SETUP.md` (section terakhir)
