/**
 * PURE JAVASCRIPT - SUPABASE REALTIME TEMPLATE SYNC
 * ==================================================
 * 
 * SIAP PAKAI untuk HTML atau Vanilla JS project
 * Tidak memerlukan React atau TypeScript
 * 
 * COPY-PASTE kode ini langsung ke:
 * 1. <script> tag di HTML
 * 2. File main.js / main.ts Anda
 * 3. Sebelum kode UI Anda
 * 
 * SETUP:
 * 1. Ganti SUPABASE_URL dan SUPABASE_ANON_KEY
 * 2. Pastikan tabel "settings" sudah ada dengan struktur:
 *    - id (integer, primary key)
 *    - template_name (text)
 *    - updated_at (timestamp)
 */

// ==================== CONFIGURATION ====================
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI
const CONSISTENT_TEMPLATE_ID = 1; // ID yang konsisten untuk semua device

// ==================== SIMPLE IMPLEMENTATION ====================

class TemplateSync {
  constructor(url, key, id = 1) {
    this.url = url;
    this.key = key;
    this.id = id;
    this.table = 'settings';
    this.subscribers = new Set();
  }

  /**
   * UPSERT: Simpan template ke Supabase
   * Jika ID sudah ada → UPDATE
   * Jika ID baru → INSERT
   */
  async save(templateName) {
    try {
      const timestamp = new Date().toISOString();
      const restUrl = `${this.url}/rest/v1/${this.table}`;

      console.log('💾 Saving template to Supabase:', templateName);

      const response = await fetch(restUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.key}`,
          'apikey': this.key,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates', // UPSERT
        },
        body: JSON.stringify({
          id: this.id,
          template_name: templateName,
          updated_at: timestamp,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      console.log('✅ Template saved to Supabase:', templateName);

      // Update localStorage sebagai backup
      localStorage.setItem('template_backup', templateName);

      // Notify subscribers
      this.notifySubscribers(templateName);

      return true;
    } catch (error) {
      console.error('❌ Error saving template:', error);
      throw error;
    }
  }

  /**
   * LOAD: Fetch template dari Supabase
   * Priority: Supabase > localStorage
   */
  async load() {
    try {
      console.log('🔄 Loading template from Supabase...');

      const url = `${this.url}/rest/v1/${this.table}?id=eq.${this.id}&select=template_name`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.key}`,
          'apikey': this.key,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.length > 0) {
        const templateName = data[0].template_name;
        console.log('✅ Template loaded from Supabase:', templateName);
        localStorage.setItem('template_backup', templateName);
        return templateName;
      }

      // Fallback ke localStorage
      const backup = localStorage.getItem('template_backup');
      if (backup) {
        console.log('💾 Using localStorage backup:', backup);
        return backup;
      }

      console.log('ℹ️ No template found');
      return null;
    } catch (error) {
      console.error('❌ Error loading template:', error);
      const backup = localStorage.getItem('template_backup');
      return backup || null;
    }
  }

  /**
   * Subscribe ke perubahan template
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    console.log('📡 Subscriber added');
  }

  /**
   * Notify semua subscribers
   */
  notifySubscribers(templateName) {
    this.subscribers.forEach((cb) => cb(templateName));
  }

  /**
   * Setup Realtime Subscription
   */
  async setupRealtime() {
    try {
      console.log('🔌 Setting up Realtime...');

      // Convert https:// ke wss://
      const wsUrl = this.url
        .replace('https://', 'wss://')
        .replace('http://', 'ws://') + '/realtime/v1';

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ Realtime connected');

        // Subscribe message
        const msg = {
          type: 'subscribe',
          event: '*',
          schema: 'public',
          table: this.table,
          filter: `id=eq.${this.id}`,
          access_token: this.key,
        };

        ws.send(JSON.stringify(msg));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.event === 'UPDATE' || msg.event === 'INSERT') {
            if (msg.new && msg.new.template_name) {
              console.log('🔔 Realtime update:', msg.new.template_name);
              this.notifySubscribers(msg.new.template_name);
              localStorage.setItem('template_backup', msg.new.template_name);
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Realtime error:', error);
      };

      this.ws = ws;
    } catch (error) {
      console.error('❌ Realtime setup error:', error);
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.url}/rest/v1/`, {
        headers: { 'apikey': this.key },
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

// ==================== INITIALIZE ====================

// Create instance
const sync = new TemplateSync(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  CONSISTENT_TEMPLATE_ID
);

// Initialize on page load
(async () => {
  try {
    // Test connection
    const connected = await sync.testConnection();
    if (!connected) {
      console.warn('⚠️ Cannot connect to Supabase');
      return;
    }

    console.log('🚀 Initializing Template Sync...');

    // Load template
    const template = await sync.load();
    console.log('📦 Current template:', template);

    // Setup realtime
    await sync.setupRealtime();

    // Listen for changes
    sync.subscribe((templateName) => {
      console.log('🎨 Template changed:', templateName);
      // Update UI here
      updateUIWithTemplate(templateName);
    });

    // Update UI dengan template yang dimuat
    if (template) {
      updateUIWithTemplate(template);
    }
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
})();

// ==================== UI FUNCTIONS ====================

/**
 * Update UI saat template berubah
 * Sesuaikan dengan struktur HTML Anda
 */
function updateUIWithTemplate(templateName) {
  console.log('🎨 Updating UI:', templateName);

  // Update class pada body
  document.body.className = `template-${templateName.toLowerCase().replace(/\s+/g, '-')}`;

  // Update active button di template selector
  document.querySelectorAll('[data-template]').forEach((btn) => {
    const isActive = btn.dataset.template === templateName;
    isActive ? btn.classList.add('active') : btn.classList.remove('active');
  });

  // Update display text
  const display = document.getElementById('template-display');
  if (display) {
    display.textContent = `📦 ${templateName}`;
  }

  // Trigger custom event (jika ada)
  window.dispatchEvent(
    new CustomEvent('template-changed', { detail: { template: templateName } })
  );
}

/**
 * Function untuk memilih template
 * Panggil dari HTML: onclick="selectTemplate('Template Name')"
 */
window.selectTemplate = async (templateName) => {
  try {
    console.log('🎨 Selecting template:', templateName);
    await sync.save(templateName);
    updateUIWithTemplate(templateName);
  } catch (error) {
    console.error('❌ Error:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * Debug function - panggil di console: window.debug()
 */
window.debug = async () => {
  console.log('=== DEBUG INFO ===');
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Template ID:', CONSISTENT_TEMPLATE_ID);
  console.log('localStorage backup:', localStorage.getItem('template_backup'));
  console.log('Websocket connected:', sync.ws?.readyState === WebSocket.OPEN);

  // Fetch all settings
  try {
    const url = `${SUPABASE_URL}/rest/v1/settings`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    const data = await response.json();
    console.log('📊 All settings in database:', data);
  } catch (error) {
    console.error('Error fetching:', error);
  }
};

console.log('✅ Template Sync ready! Use selectTemplate(name) to select template');
console.log('   Or call window.debug() to see debug info');
