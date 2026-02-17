# 🚀 SETUP GUIDE: SUPABASE REALTIME TEMPLATE SYNC

Panduan lengkap untuk mengintegrasikan Supabase realtime sync ke aplikasi Anda dengan fitur:
- ✅ UPSERT terpusat ke id=1
- ✅ Fetch dari Supabase saat startup
- ✅ Realtime subscription untuk sync otomatis
- ✅ No localStorage dependency

---

## 📋 Prerequisites

Pastikan Anda sudah memiliki:
- [ ] Supabase project (https://app.supabase.com)
- [ ] Tabel `settings` dengan kolom:
  - `id` (INTEGER PRIMARY KEY)
  - `template_name` (TEXT)
  - `updated_at` (TIMESTAMP)
- [ ] RLS Policy: Allow public access (atau sesuaikan dengan kebutuhan)
- [ ] @supabase/supabase-js sudah diinstall (`npm install @supabase/supabase-js`)

---

## 🔑 STEP 1: Dapatkan Credentials dari Supabase

1. Buka https://app.supabase.com
2. Pilih project Anda
3. Klik **Settings** > **API**
4. Copy nilai dari:
   - **Project URL** → ini adalah `SUPABASE_URL`
   - **anon public** key → ini adalah `SUPABASE_ANON_KEY`

**Contoh:**
```
SUPABASE_URL   = https://xyzabc123.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛠️ STEP 2: Update File `/src/hooks/useSupabaseTemplateSync.ts`

File ini sudah dibuat untuk Anda. Yang perlu Anda lakukan:

**Buka file:** `src/hooks/useSupabaseTemplateSync.ts`

**Temukan bagian CONFIGURATION (baris ~17-21):**

```typescript
// ==================== CONFIGURATION ====================
// Get these from: https://app.supabase.com → Settings > API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI
const SUPABASE_TABLE_NAME = 'settings'; // Table name in Supabase
const CONSISTENT_TEMPLATE_ID = 1; // All devices use this ID
```

**Ganti dengan nilai yang Anda copy dari Supabase:**

```typescript
const SUPABASE_URL = 'https://xyzabc123.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const SUPABASE_TABLE_NAME = 'settings';
const CONSISTENT_TEMPLATE_ID = 1;
```

✅ **Selesai!** File sudah update, tidak perlu file lainnya.

---

## ✨ STEP 3: Cara Kerja (Otomatis - Anda Tidak Perlu Do Anything!)

Hook `useSupabaseTemplateSync` sudah diintegrasikan di `src/App.tsx` dan akan otomatis:

### 🔄 Saat App Pertama Kali Dibuka:
1. Hook mount dan load template dari Supabase id=1
2. Jika ada data→ set sebagai selectedTemplate
3. Setup realtime subscription ke database
4. Console log: `✅ [APP] Template sync initialized successfully`

### 📝 Saat User Pilih Template:
1. User klik template di TemplateSection
2. `setSelectedTemplate()` di-trigger (dari Zustand store)
3. Hook mendeteksi perubahan → UPSERT ke Supabase id=1
4. Console log: `💾 [SUPABASE] Upserting template: [nama template]`
5. Selesai!

### 🔔 Saat Device Lain Ubah Template:
1. Realtime subscription mendengar perubahan di database
2. Hook automatically set selectedTemplate ke value terbaru
3. UI update otomatis (realtime)
4. Console log: `🔔 [REALTIME] Template changed: [nama template]`

---

## 🧪 TESTING: Verifikasi Realtime Sync Bekerja

### Test 1: Buka 2 Tab Browser
```
Tab A: http://localhost:5173
Tab B: http://localhost:5173
```

1. Di Tab A: Pilih sebuah template
2. Lihat di Supabase: Cek tabel `settings` → row dengan id=1 harus terisi
3. Di Tab B: Template harus berubah otomatis (dalam 1-2 detik)

### Test 2: Check Console Logs
Di console browser (F12 → Console), Anda akan lihat:

**Pada startup:**
```
🚀 [APP] Initializing template sync...
🔄 [SUPABASE] Fetching template from Supabase...
✅ [SUPABASE] Template fetched: template_name
🔌 [SUPABASE] Setting up realtime subscription...
✅ [REALTIME] Subscription active
✅ [APP] Template sync initialized successfully
```

**Saat pilih template:**
```
📢 [STORE] Selected template changed: template_name
💾 [SUPABASE] Upserting template: template_name
✅ [SUPABASE] Template upserted successfully: template_name
✅ [SYNC] Template synced to Supabase: template_name
```

**Saat device lain ubah:**
```
🔔 [REALTIME] Template changed: template_name
✅ [APP] Realtime update applied: template_name
```

### Test 3: Gunakan Debug Helper (Optional)
Di browser console, ketik:
```javascript
window.debugSupabase()
```

Output akan menunjukkan:
```
=== SUPABASE DEBUG INFO ===
URL: https://xyzabc123.supabase.co
Table: settings
Template ID: 1
Selected template: [nama template atau None]
📊 Data in Supabase: { id: 1, template_name: 'xxx', updated_at: '2024-...' }
```

---

## 🧠 Penjelasan Teknis (Optional)

### 1. Setup Realtime Subscription
```typescript
const channel = supabase
  .channel(`public:${SUPABASE_TABLE_NAME}:id=eq.${CONSISTENT_TEMPLATE_ID}`)
  .on('postgres_changes', { ... })
  .subscribe();
```

- Listens untuk changes pada `settings` table
- Filter: hanya id=1
- Event: INSERT, UPDATE, DELETE

### 2. UPSERT Logic
```typescript
const { error } = await supabase
  .from(SUPABASE_TABLE_NAME)
  .upsert({
    id: CONSISTENT_TEMPLATE_ID,
    template_name: templateName,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
```

- Jika id=1 sudah ada: UPDATE template_name
- Jika id=1 belum ada: INSERT row baru dengan id=1
- Hasil: SELALU hanya 1 row di database (bukan multiple rows per device)

### 3. Fetch Priority
```typescript
// Saat app start, fetch dari Supabase (bukan localStorage)
const templateName = await fetchTemplateFromSupabase();
```

- NO localStorage dependency
- Source of truth: Supabase database
- Lebih secure, tidak tied to device storage

---

## ⚠️ Troubleshooting

### Problem: Data tidak sync antar device

**Solusi:**
1. Cek credentials di `useSupabaseTemplateSync.ts` → pastikan benar
2. Cek Supabase RLS policy → pastikan allow public access
3. Cek console logs → ada error messages?
4. Run `window.debugSupabase()` untuk check status

### Problem: "Fetch error: 401 Unauthorized"

**Solusi:**
- Credentials salah
- SUPABASE_ANON_KEY tidak valid
- Double-check credentials dari Supabase Settings > API

### Problem: "No rows found" (saat pertama kali)

**Ini normal!** Saat pertama kali buka app, database kosong:
1. User pilih template → INSERT row baru
2. Next time app dibuka → fetch sudah ada data

### Problem: Realtime subscription tidak connect

**Solusi:**
1. Pastikan Supabase Realtime sudah enabled (Settings > Replication)
2. Cek network: ada internet connection?
3. Check console untuk error messages

---

## 🎯 File yang Di-Update

✅ **Dibuat baru:**
- `src/hooks/useSupabaseTemplateSync.ts` (Production-ready hook)

✅ **Di-update:**
- `src/App.tsx` (Replace `useTemplateSync()` dengan `useSupabaseTemplateSync()`)

❌ **TIDAK dirubah:**
- `src/main.tsx` (Tetap sama, entry point only)
- `src/store/useStore.ts` (Hook otomatis sync dengan store)
- `src/sections/TemplateSection.tsx` (Otomatis trigger sync via store)

---

## 📱 Multi-Device Sync Flow

```
Device A (Laptop)          Database (Supabase)      Device B (Phone)
─────────────────          ──────────────────      ─────────────────

User clicks template
         ↓
UPSERT id=1 → ────────────→ id=1: template_name
                             ↑
                         Realtime channel
                             ↓
                    ←───────────────── Subscription active
                             ↓
                    setSelectedTemplate executed
                             ↓
                         UI updates ✨
```

---

## 🚀 Production Deployment (Vercel)

1. Buka Vercel dashboard
2. Buka project settings
3. Klik **Environment Variables**
4. Tambahkan (OPTIONAL, jika ingin hide credentials):
   ```
   VITE_SUPABASE_URL = https://xyzabc123.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
   ```
5. Update `useSupabaseTemplateSync.ts`:
   ```typescript
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
   const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

Tapi saat ini, hardcoded credentials sudah OK untuk development.

---

## ✅ Checklist Selesai

- [ ] Install @supabase/supabase-js
- [ ] Copy SUPABASE_URL dari Supabase
- [ ] Copy SUPABASE_ANON_KEY dari Supabase
- [ ] Update `useSupabaseTemplateSync.ts` dengan credentials
- [ ] Run `npm run build` → OK (no errors)
- [ ] Test: Open 2 tabs → select template → verify sync
- [ ] Check console logs → lihat messages
- [ ] Run `window.debugSupabase()` → confirm data in Supabase

Jika semua ✅ → **Selesai!** Realtime sync sudah berjalan 🎉

---

## 📞 Need Help?

Jika ada masalah:
1. Cek tab **Console** (F12) → lihat error messages
2. Copy error message
3. Check connection ke Supabase (ping supabase)
4. Verify credentials (SUPABASE_URL dan SUPABASE_ANON_KEY)

**Debug mode ON:**
```javascript
// Di console browser:
window.debugSupabase()
```

Ini akan display semua info: credentials, database status, current template, etc.

---

Good luck! 🚀 Realtime sync template sudah ready-to-use!
