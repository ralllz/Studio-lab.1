# 🔑 Where To Put Your Credentials - Visual Guide

## 📍 Location in Code

**File:** `src/hooks/useSupabaseTemplateSync.ts`

**Section:** Lines 17-21 (CONFIGURATION)

```
┌─ src/
│  └─ hooks/
│     └─ useSupabaseTemplateSync.ts ← Open this file
│        
│        Line 1:    /**
│        Line 2:     * SUPABASE REALTIME SYNC HOOK - Production Ready
│        ...
│        Line 17:   // ==================== CONFIGURATION ====================
│        Line 18:   // Get these from: https://app.supabase.com → Settings > API
│        Line 19:   const SUPABASE_URL = '...' ← GANTI SINI
│        Line 20:   const SUPABASE_ANON_KEY = '...' ← GANTI SINI
│        Line 21:   const SUPABASE_TABLE_NAME = 'settings';
│        Line 22:   const CONSISTENT_TEMPLATE_ID = 1;
```

---

## 🚀 Step-by-Step: Get Credentials

### Step 1: Open Supabase Dashboard
```
1. Buka: https://app.supabase.com
2. Login dengan akun Anda
3. Pilih project "Studio-lab" (atau nama project Anda)
```

### Step 2: Navigate ke API Settings
```
Project Name (top left) → Settings (bottom left) → API
```

Atau direct link:
```
https://app.supabase.com/project/[PROJECT_ID]/settings/api
```

### Step 3: Copy Project URL
```
┌─────────────────────────────────────────────────────┐
│ API SETTINGS                                        │
├─────────────────────────────────────────────────────┤
│ Project ID                                          │
│ xyzabc123                                           │
│                                                     │
│ Project URL                                         │
│ https://xyzabc123.supabase.co  ← COPY THIS         │
│                                    [Copy button] ✓  │
│                                                     │
│ This is your: SUPABASE_URL                          │
└─────────────────────────────────────────────────────┘
```

### Step 4: Copy Anon Public Key
```
Scroll down sampai menemukan section "KEYS", cari "anon public"

┌─────────────────────────────────────────────────────┐
│ KEYS                                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ anon (public)                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...            │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.             │
│ bGV1Y2...  ← COPY THIS                  [Copy] ✓  │
│                                                     │
│ This is your: SUPABASE_ANON_KEY                     │
│                                                     │
│ service_role (secret key)                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━────  │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...            │
│ [Don't use this one]                               │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Paste into Code

### Now Open Your Code

**File:** `src/hooks/useSupabaseTemplateSync.ts`

**Current state:**
```typescript
// ==================== CONFIGURATION ====================
// Get these from: https://app.supabase.com → Settings > API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← CHANGE
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← CHANGE
const SUPABASE_TABLE_NAME = 'settings';
const CONSISTENT_TEMPLATE_ID = 1;
```

### Replace with Your Values

**Example 1: Project ID = xyzabc123**

```typescript
// ==================== CONFIGURATION ====================
// Get these from: https://app.supabase.com → Settings > API
const SUPABASE_URL = 'https://xyzabc123.supabase.co'; // ✓ UPDATED
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhymzh1Ym'; // ✓ UPDATED
const SUPABASE_TABLE_NAME = 'settings';
const CONSISTENT_TEMPLATE_ID = 1;
```

**Important Notes:**
- ❌ Jangan hapus tanda kutip (`'...'`)
- ❌ Jangan tambah space di awal/akhir
- ✓ Copy-paste langsung dari Supabase
- ✓ Paste seluruh string (biasanya panjang, berakhir dengan `==` atau `.` )

---

## ✅ How to Verify Benar

Setelah paste, cek:

### 1. Format Correct?
```typescript
// BENAR ✓
const SUPABASE_URL = 'https://xyzabc123.supabase.co';

// SALAH ✗
const SUPABASE_URL = https://xyzabc123.supabase.co; // Missing quotes
const SUPABASE_URL = 'https://xyzabc123.supabase.co '; // Extra space at end
```

### 2. Build Pass?
```bash
npm run build

# Should output:
✓ built in 5.78s
# No TypeScript errors!
```

### 3. Test It
```bash
npm run dev  # or npm run preview

# Open http://localhost:5173
# Press F12 → Console
# Should see: ✅ [APP] Template sync initialized successfully
```

### 4. Debug Check
```javascript
// In browser console, type:
window.debugSupabase()

// Should show:
=== SUPABASE DEBUG INFO ===
URL: https://xyzabc123.supabase.co
Table: settings
Template ID: 1
Selected template: None
📊 Data in Supabase: (error atau actual data)
```

---

## 🛡️ Security Tips

### ❌ DO NOT
- ❌ Hardcode in production (use env vars instead)
- ❌ Commit credentials to Git
- ❌ Share credentials with anyone
- ❌ Use the `service_role` key (only use `anon public`)

### ✅ DO
- ✓ Use anon public key (it's designed for public use)
- ✓ Add `.env.local` to `.gitignore`
- ✓ Use environment variables in production (Vercel)
- ✓ Monitor Supabase logs for suspicious activity

---

## 🔄 Environment Variables (Optional but Recommended)

For production, use environment files:

### Step 1: Create `.env.local`
```
# .env.local (don't commit this!)

VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Update `.gitignore`
```
# .gitignore

node_modules/
dist/
.env.local ← Add this line
```

### Step 3: Update Hook Code
```typescript
// src/hooks/useSupabaseTemplateSync.ts

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const SUPABASE_TABLE_NAME = 'settings';
const CONSISTENT_TEMPLATE_ID = 1;
```

### Step 4: For Vercel Deployment
1. Buka Vercel dashboard
2. Project Settings → Environment Variables
3. Add:
   - Name: `VITE_SUPABASE_URL`, Value: `https://xyzabc123.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: `eyJhbGciOi...`
4. Deploy

---

## 🧪 Verify Final Setup

After updating credentials, run:

```bash
# 1. Build check
npm run build

# 2. Run dev server
npm run dev

# 3. Open http://localhost:5173

# 4. Open console (F12 → Console)

# 5. Should see ONE of:
# ✅ [APP] Template sync initialized successfully
#    → Everything OK!
#
# ❌ [SUPABASE] Fetch error: 401 Unauthorized
#    → Credentials wrong, double-check!
#
# ❌ [REALTIME] Subscription error
#    → Network issue or Supabase Realtime not enabled
```

---

## 📋 Copy-Paste Checklist

- [ ] Open Supabase dashboard (app.supabase.com)
- [ ] Go to Settings > API
- [ ] Copy Project URL (https://...)
- [ ] Copy anon public key (long string starting with eyJ...)
- [ ] Open `src/hooks/useSupabaseTemplateSync.ts`
- [ ] Paste URL into SUPABASE_URL (line 19)
- [ ] Paste key into SUPABASE_ANON_KEY (line 20)
- [ ] Save file
- [ ] Run `npm run build` (verify no errors)
- [ ] Run `npm run dev`
- [ ] Open console (F12 → Console)
- [ ] See "✅ [APP] Template sync initialized successfully"
- [ ] Done! ✅

---

## 🆘 Still Confused?

```
Visual Layout:

┌─ YOUR BROWSER ─────────────────────┐
│ https://app.supabase.com           │
│                                    │
│ [My Project]                       │
│   ├─ Editor                        │
│   ├─ Settings ← Click here         │
│   │  └─ API                        │
│   │     ├─ Project URL             │
│   │     │  └─ Copy this ✓          │
│   │     └─ Keys                    │
│   │        ├─ anon (public)        │
│   │        │  └─ Copy this ✓       │
│   │        └─ service_role         │
│   │           (Don't use)          │
│   └─ Other settings                │
└────────────────────────────────────┘
         ↓
         Paste into:
         ↓
┌─ YOUR CODE ────────────────────────┐
│ src/hooks/                         │
│  useSupabaseTemplateSync.ts        │
│                                    │
│ Line 19:                           │
│ const SUPABASE_URL = '...paste...' │
│                                    │
│ Line 20:                           │
│ const SUPABASE_ANON_KEY = '...' [  │
│                                    │
│ Save file → npm run build → Done!  │
└────────────────────────────────────┘
```

---

Butuh bantuan lebih? Message: tahap mana yang stuck? 🙋
