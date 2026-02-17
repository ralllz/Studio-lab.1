/**
 * SUPABASE REALTIME TEMPLATE SYNC - v2 (Improved)
 * =================================================
 * 
 * Features:
 * - UPSERT (tidak membuat row baru terus-menerus)
 * - Consistent ID untuk multi-device sync
 * - Fetch dari Supabase terlebih dahulu (bukan localStorage)
 * - Realtime Subscription (instant sync antar device)
 * - Wajib simpan ke Supabase (tidak fallback ke localStorage)
 * 
 * SETUP:
 * 1. Ganti SUPABASE_URL dan SUPABASE_ANON_KEY di bawah
 * 2. Pastikan tabel "settings" sudah dibuat dengan struktur yang benar
 * 3. Include file ini di <script> tag atau import di main.tsx
 */

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI

/**
 * ID yang konsisten untuk testing
 * Semua perangkat akan membaca/menulis data dengan ID ini
 * Ganti nomor ini jika ingin membuat session baru
 */
const CONSISTENT_ID = 1; // ← ID yang sama di semua device

class SupabaseTemplateRealtimeSync {
  private supabaseUrl: string;
  private supabaseKey: string;
  private tableName = 'settings';
  private consistentId: number;
  private subscribers: Set<(templateName: string) => void> = new Set();
  private realtimeChannel: any = null;

  constructor(url: string, key: string, consistentId: number = 1) {
    this.supabaseUrl = url;
    this.supabaseKey = key;
    this.consistentId = consistentId;
  }

  /**
   * UPSERT: Simpan ke Supabase dengan ID yang konsisten
   * Jika ID sudah ada → UPDATE
   * Jika ID baru → INSERT
   * @param templateName - Nama template yang dipilih
   */
  async saveTemplate(templateName: string): Promise<boolean> {
    try {
      const timestamp = new Date().toISOString();
      const url = `${this.supabaseUrl}/rest/v1/${this.tableName}`;

      // Gunakan UPSERT via REST API
      // Pada_conflict menunjukkan kolom yang digunakan sebagai unique identifier
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates', // UPSERT behavior
        },
        body: JSON.stringify({
          id: this.consistentId, // ID yang sama untuk semua device
          template_name: templateName,
          updated_at: timestamp,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Gagal menyimpan ke Supabase:', error);
        throw new Error(`HTTP ${response.status}: ${error.message}`);
      }

      console.log('✅ Template berhasil di-UPSERT ke Supabase:', templateName);

      // Simpan ke localStorage sebagai cache lokal (untuk offline)
      localStorage.setItem('last_selected_template', templateName);
      localStorage.setItem('template_sync_time', timestamp);

      return true;
    } catch (error) {
      console.error('❌ Error saving template:', error);
      throw error; // Jangan fallback - harus success!
    }
  }

  /**
   * LOAD: Fetch template langsung dari Supabase
   * Jika ada, gunakan data dari Supabase
   * localStorage hanya untuk offline fallback
   * @returns Nama template atau null
   */
  async loadTemplate(): Promise<string | null> {
    try {
      const url = `${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${this.consistentId}&select=template_name`;

      console.log('🔄 Fetching template dari Supabase...');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Jika ada data dari Supabase
      if (data.length > 0) {
        const templateName = data[0].template_name;
        console.log('✅ Template dimuat dari Supabase:', templateName);

        // Update localStorage cache
        localStorage.setItem('last_selected_template', templateName);

        return templateName;
      }

      // Jika tidak ada di Supabase, cek localStorage (offline fallback)
      const cachedTemplate = localStorage.getItem('last_selected_template');
      if (cachedTemplate) {
        console.log('💾 Template dimuat dari localStorage (offline cache):', cachedTemplate);
        return cachedTemplate;
      }

      console.log('ℹ️ Tidak ada template yang tersimpan');
      return null;
    } catch (error) {
      console.error('❌ Error loading template:', error);

      // Fallback ke localStorage hanya jika network error
      const cachedTemplate = localStorage.getItem('last_selected_template');
      if (cachedTemplate) {
        console.log('💾 Network error, menggunakan localStorage:', cachedTemplate);
        return cachedTemplate;
      }

      return null;
    }
  }

  /**
   * Subscribe ke perubahan Realtime
   * Callback akan dipanggil setiap kali ada perubahan di Supabase
   * @param callback - Function yang dipanggil saat ada perubahan
   */
  onTemplateChange(callback: (templateName: string) => void): void {
    this.subscribers.add(callback);
    console.log('📡 Realtime subscriber ditambahkan');
  }

  /**
   * Setup Realtime Subscription menggunakan Supabase Websocket
   * Fitur ini otomatis mendeteksi perubahan di database
   */
  async setupRealtimeSubscription(): Promise<void> {
    try {
      console.log('🔌 Connecting to Supabase Realtime...');

      // Buat URL untuk WebSocket connection
      const wsUrl = this.supabaseUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://') + '/realtime/v1';

      // Buat WebSocket connection
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ Connected to Supabase Realtime');

        // Subscribe ke perubahan pada tabel "settings"
        const subscriptionMessage = {
          type: 'subscribe',
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `id=eq.${this.consistentId}`,
          access_token: this.supabaseKey,
        };

        ws.send(JSON.stringify(subscriptionMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Deteksi event type
          if (message.event === 'UPDATE' || message.event === 'INSERT') {
            const newData = message.new;
            if (newData && newData.template_name) {
              console.log('🔔 Realtime update received:', newData.template_name);

              // Trigger semua subscribers
              this.subscribers.forEach((callback) => {
                callback(newData.template_name);
              });

              // Update localStorage
              localStorage.setItem('last_selected_template', newData.template_name);
            }
          }
        } catch (error) {
          console.error('Error processing realtime message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('ℹ️ Disconnected from Supabase Realtime');
      };

      this.realtimeChannel = ws;
    } catch (error) {
      console.error('❌ Error setup realtime subscription:', error);
    }
  }

  /**
   * Alternative: Setup Realtime menggunakan Supabase JS Client
   * (Lebih reliable jika sudah install @supabase/supabase-js package)
   * Uncomment kode di bawah jika ingin menggunakan ini
   */
  async setupRealtimeSubscriptionV2(): Promise<void> {
    // Ini memerlukan @supabase/supabase-js package
    // npm install @supabase/supabase-js
    // Jika sudah install, uncomment kode ini:

    /*
    import { createClient } from '@supabase/supabase-js';
    
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);

    console.log('🔌 Setting up Realtime subscription (v2)...');

    const subscription = supabase
      .channel('public:settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `id=eq.${this.consistentId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.template_name) {
            console.log('🔔 Realtime update (v2):', payload.new.template_name);
            this.subscribers.forEach((callback) => {
              callback(payload.new.template_name);
            });
            localStorage.setItem('last_selected_template', payload.new.template_name);
          }
        }
      )
      .subscribe();

    console.log('✅ Realtime subscription v2 ready');
    */
  }

  /**
   * Disconnect dari Realtime
   */
  disconnect(): void {
    if (this.realtimeChannel) {
      this.realtimeChannel.close();
      console.log('Disconnected from Realtime');
    }
  }

  /**
   * Test koneksi ke Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get all settings dari Supabase (untuk debugging)
   */
  async getAllSettings(): Promise<any[]> {
    try {
      const url = `${this.supabaseUrl}/rest/v1/${this.tableName}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log('📊 All settings:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching all settings:', error);
      return [];
    }
  }
}

// Export untuk digunakan di JavaScript atau React
const templateSync = new SupabaseTemplateRealtimeSync(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  CONSISTENT_ID
);

// Auto-initialize saat script dimuat
(async () => {
  try {
    // Test koneksi terlebih dahulu
    const isConnected = await templateSync.testConnection();
    if (!isConnected) {
      console.warn('⚠️ Tidak dapat terhubung ke Supabase');
      return;
    }

    // Load template dari Supabase
    const lastTemplate = await templateSync.loadTemplate();
    console.log('📦 Initial template loaded:', lastTemplate);

    // Setup Realtime Subscription
    await templateSync.setupRealtimeSubscription();

    // Subscribe untuk perubahan
    templateSync.onTemplateChange((templateName) => {
      console.log('🎨 Template changed to:', templateName);
      // Trigger UI update di sini (lihat contoh di bawah)
      updateUITemplate(templateName);
    });
  } catch (error) {
    console.error('Error initializing template sync:', error);
  }
})();

// ==================== CONTOH IMPLEMENTASI DI UI ====================

/**
 * Contoh fungsi untuk mengubah UI berdasarkan pilihan template
 * Sesuaikan dengan struktur HTML Anda
 */
function updateUITemplate(templateName: string) {
  console.log('Updating UI with template:', templateName);

  // Contoh 1: Update class pada body
  document.body.className = `template-${templateName.toLowerCase().replace(/\s+/g, '-')}`;

  // Contoh 2: Update active button
  document.querySelectorAll('[data-template]').forEach((btn) => {
    if (btn.getAttribute('data-template') === templateName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Contoh 3: Update display text
  const templateDisplay = document.getElementById('current-template');
  if (templateDisplay) {
    templateDisplay.textContent = `Current: ${templateName}`;
  }
}

/**
 * Type declarations untuk window properties
 */
declare global {
  interface Window {
    selectTemplate: (templateName: string) => Promise<void>;
    debugSettings: () => Promise<void>;
  }
}

/**
 * Contoh event listener untuk template buttons
 * Tambahkan ke HTML: <button onclick="selectTemplate('Template Name')">
 */
(window as any).selectTemplate = async (templateName: string) => {
  try {
    console.log('🎨 Selecting template:', templateName);
    await templateSync.saveTemplate(templateName);

    // Update UI lokal (tidak perlu tunggu realtime)
    updateUITemplate(templateName);
  } catch (error) {
    console.error('Error selecting template:', error);
    alert('Gagal menyimpan template ke Supabase. Cek console untuk detail.');
  }
};

/**
 * Contoh: Debug function
 * Panggil di console: window.debugSettings()
 */
(window as any).debugSettings = async () => {
  console.log('=== DEBUG INFO ===');
  await templateSync.getAllSettings();
  console.log('localStorage:', localStorage.getItem('last_selected_template'));
  console.log('persistentId:', CONSISTENT_ID);
};

// Export untuk React atau modul lainnya
export { templateSync, SupabaseTemplateRealtimeSync, updateUITemplate };
