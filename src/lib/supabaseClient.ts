/**
 * SUPABASE CONFIGURATION
 * =======================
 * Ganti kedua nilai di bawah ini dengan credentials Supabase Anda:
 * 1. SUPABASE_URL: https://[project-id].supabase.co
 * 2. SUPABASE_ANON_KEY: dari Settings > API > anon public
 * 
 * Ambil dari: https://app.supabase.com/project/[project-id]/settings/api
 */

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI

class SupabaseTemplateClient {
  private supabaseUrl: string;
  private supabaseKey: string;
  private tableName = 'settings';

  constructor(url: string, key: string) {
    this.supabaseUrl = url;
    this.supabaseKey = key;
  }

  /**
   * Dapatkan User ID unik (untuk non-authenticated users)
   * Menyimpan di localStorage dan reuse jika sudah ada
   */
  private getUserId(): string {
    let userId = localStorage.getItem('app_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('app_user_id', userId);
    }
    return userId;
  }

  /**
   * Simpan pilihan template ke Supabase + Local Storage
   * @param templateName - Nama template yang dipilih
   */
  async saveTemplate(templateName: string): Promise<boolean> {
    try {
      const userId = this.getUserId();
      const timestamp = new Date().toISOString();

      // 1. Simpan ke Local Storage terlebih dahulu (fallback)
      localStorage.setItem('last_selected_template', templateName);
      localStorage.setItem('template_sync_time', timestamp);

      // 2. Kirim ke Supabase
      const url = `${this.supabaseUrl}/rest/v1/${this.tableName}`;
      
      // Cek apakah user_id sudah ada di database
      const existingResponse = await fetch(
        `${url}?user_id=eq.${userId}&select=id`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'apikey': this.supabaseKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const existingData = await existingResponse.json();

      let response;
      if (existingData.length > 0) {
        // UPDATE jika user_id sudah ada
        response = await fetch(
          `${url}?user_id=eq.${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              template_name: templateName,
              updated_at: timestamp,
            }),
          }
        );
      } else {
        // INSERT jika user_id baru
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'apikey': this.supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id: userId,
            template_name: templateName,
            created_at: timestamp,
            updated_at: timestamp,
          }),
        });
      }

      if (!response.ok) {
        console.warn('⚠️ Gagal menyimpan ke Supabase, menggunakan Local Storage');
        return true; // Return true karena sudah tersimpan di localStorage
      }

      console.log('✅ Template berhasil disimpan ke Supabase:', templateName);
      return true;
    } catch (error) {
      console.warn('⚠️ Error Supabase, fallback ke Local Storage:', error);
      return true; // Masih success karena sudah tersimpan di localStorage
    }
  }

  /**
   * Muat pilihan template terakhir dari Supabase / Local Storage
   * @returns Nama template atau null jika tidak ada
   */
  async loadTemplate(): Promise<string | null> {
    try {
      const userId = this.getUserId();
      const url = `${this.supabaseUrl}/rest/v1/${this.tableName}?user_id=eq.${userId}&select=template_name&order=updated_at.desc&limit=1`;

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

      if (data.length > 0) {
        const templateName = data[0].template_name;
        console.log('✅ Template dimuat dari Supabase:', templateName);
        // Update localStorage sebagai cache
        localStorage.setItem('last_selected_template', templateName);
        return templateName;
      }

      // Fallback ke Local Storage jika tidak ada di Supabase
      const cachedTemplate = localStorage.getItem('last_selected_template');
      if (cachedTemplate) {
        console.log('💾 Template dimuat dari Local Storage:', cachedTemplate);
        return cachedTemplate;
      }

      console.log('ℹ️ Tidak ada template yang tersimpan');
      return null;
    } catch (error) {
      console.warn('⚠️ Error mengambil dari Supabase, fallback ke Local Storage:', error);
      const cachedTemplate = localStorage.getItem('last_selected_template');
      return cachedTemplate || null;
    }
  }

  /**
   * Verifikasi koneksi ke Supabase
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
      console.error('❌ Koneksi Supabase gagal:', error);
      return false;
    }
  }
}

// Export instance yang siap digunakan
export const templateClient = new SupabaseTemplateClient(SUPABASE_URL, SUPABASE_ANON_KEY);
