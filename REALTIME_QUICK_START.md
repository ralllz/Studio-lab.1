# 🎯 SUPABASE TEMPLATE SYNC v2 - QUICK START

**Masalah Lama:** Template tidak sinkron antar device
**Solusi Baru:** ✅ UPSERT + Realtime Subscription + Consistent ID

---

## 📁 FILES BARU (Pilih Satu Sesuai Project)

### ✅ **Option 1: HTML + Vanilla JS (Paling Mudah)**
**File:** `template-sync-example.html`

**Copy-Paste ke Browser:**
1. Download file `template-sync-example.html`
2. Edit line 104-105:
   ```javascript
   const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_KEY_HERE';
   ```
3. Buka di browser → langsung jalan! ✨

**Fitur:**
- ✅ Standalone HTML (no build needed)
- ✅ UI yang cantik (ada dark mode tema)
- ✅ Debug info live
- ✅ Realtime sync
- ✅ Works offline too

---

### ✅ **Option 2: React Hook (Untuk React Project)**
**File:** `src/hooks/useTemplateRealtimeSync.ts`

**Cara Pakai:**
```tsx
import { useTemplateRealtimeSync } from '@/hooks/useTemplateRealtimeSync';

function App() {
  const { template, setTemplate, isConnected } = useTemplateRealtimeSync();
  
  return (
    <div>
      <p>Current: {template}</p>
      <button onClick={() => setTemplate('Classic Frame')}>Select</button>
      <p>Connected: {isConnected ? '✅' : '❌'}</p>
    </div>
  );
}
```

**Keuntungan:**
- ✅ Native React integration
- ✅ TypeScript support
- ✅ Hooks pattern (modern)
- ✅ Automatic cleanup

---

### ✅ **Option 3: Pure JavaScript (Flexible)**
**File:** `src/lib/templateSync.js`

**Cara Pakai:**
```html
<!-- Di HTML -->
<script src="src/lib/templateSync.js"></script>

<button onclick="selectTemplate('Classic Frame')">Select</button>
<script>
  window.selectTemplate('Classic Frame'); // Set template
  window.debug(); // Show debug info
</script>
```

**Keuntungan:**
- ✅ Pure JS (no dependencies)
- ✅ Flexible integration
- ✅ Can use anywhere

---

## 🔧 UNIVERSAL SETUP (Ketiga File)

Semua file memiliki header yang sama. **Ganti 2 baris ini:**

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← SINI
const CONSISTENT_TEMPLATE_ID = 1; // ID yang konsisten
```

**Dapatkan credentials:**
1. Buka https://app.supabase.com
2. Settings > API
3. Copy Project URL + Anon Key
4. Paste ke file

---

## 🎯 FITUR YANG SUDAH FIXED

| Masalah | Solusi |
|---------|--------|
| ❌ Template tidak sinkron antar device | ✅ UPSERT + Realtime Subscription |
| ❌ Membuat row baru terus-menerus | ✅ Consistent ID (id=1) + UPSERT |
| ❌ Load dari localStorage dulu | ✅ Fetch dari Supabase terlebih dahulu |
| ❌ Realtime tidak ada | ✅ WebSocket Subscription included |
| ❌ Fallback yang tidak reliable | ✅ localStorage sebagai offline cache |

---

## 📊 QUICK COMPARISON

| Feature | HTML | React Hook | Pure JS |
|---------|------|-----------|---------|
| **Setup Time** | ⚡ 30 sec | ⏱️ 2 min | ⏱️ 1 min |
| **Learning Curve** | 🟢 Easy | 🟡 Medium | 🟡 Medium |
| **UI Beautiful** | ✅ Yes | 🟡 DIY | 🟡 DIY |
| **Realtime** | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| **UPSERT** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Best For** | Static Pages | React Apps | Custom Apps |

---

## 🚀 IMPLEMENTATION IN 3 STEPS

### Step 1: Choose Your File
- React project? → `src/hooks/useTemplateRealtimeSync.ts`
- HTML project? → `template-sync-example.html`
- Custom? → `src/lib/templateSync.js`

### Step 2: Update Credentials (2 lines only!)
```javascript
const SUPABASE_URL = 'https://vwxyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCA...';
```

### Step 3: Use It!

**HTML:**
```html
<button onclick="selectTemplate('Classic Frame')">Select</button>
```

**React:**
```tsx
await setTemplate('Classic Frame');
```

**JS:**
```javascript
await sync.save('Classic Frame');
```

---

## ✅ TEST CHECKLIST

```
□ Buka template-sync-example.html di Laptop
  └─ Console: "✅ Connected to Realtime"

□ Buka URL di HP (same WiFi)
  └─ Console: "✅ Connected to Realtime"

□ Klik button di Laptop
  └─ Laptop: "✅ Template saved"

□ Lihat HP tanpa klik
  └─ HP: "🔔 Realtime update" + UI berubah otomatis ✨

□ Refresh HP
  └─ Template tetap ada (dari Supabase)

□ Buka Supabase Dashboard
  └─ Table "settings" hanya ada 1 row (id=1)
  └─ Bukan terus-menerus bertambah ✓

✅ SEMUA BERHASIL = SYNC WORK PERFECTLY!
```

---

## 🔌 DATABASE REQUIREMENT

Pastikan tabel "settings" sudah ada dengan struktur:

```sql
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  template_name TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON settings
  FOR ALL USING (true) WITH CHECK (true);
```

---

## 📞 DEBUG

**Buka browser console (F12) dan paste:**

```javascript
window.debug()
```

**Output akan menunjukkan:**
- ✅ Supabase connection
- ✅ Current template
- ✅ localStorage backup
- ✅ Websocket status
- ✅ All data di database

---

## ❓ COMMON ISSUES

### ❌ "Unauthorized" Error
```javascript
// Check:
1. SUPABASE_URL has "https://" prefix
2. SUPABASE_ANON_KEY is correct (not SECRET_KEY)
3. RLS policy exists: "Allow public access"
```

### ❌ Realtime tidak bekerja
```javascript
// Check Network tab (DevTools):
// 1. Request to wss://... exists?
// 2. Status 101 (Switching Protocols)?
// 3. If not: firewall/ISP blocking WebSocket
```

### ❌ Always load dari localStorage
```javascript
// Fix:
1. Verify table "settings" exists
2. Verify record with id=1 exists
3. Check SUPABASE_URL & KEY benar
```

---

## 🎉 YOU'RE DONE!

Pilih file, update credentials, gunakan!

**Template sync dengan multi-device support = READY!** ✨

---

## 📚 DOKUMENTASI LENGKAP

Lihat file: `REALTIME_IMPLEMENTATION_GUIDE.md`
- Fitur detail
- Testing guide
- Production setup
- Troubleshooting mendalam

---

## 💡 NEXT STEPS

1. **Pilih file** yang sesuai project
2. **Update credentials** (2 baris)
3. **Test** dengan 2 device
4. **Syukuran** karena sudah work! 🎊

Happy coding! 🚀
