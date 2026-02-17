import { useEffect } from 'react';
import { templateClient } from '@/lib/supabaseClient';
import { useStore } from '@/store/useStore';
import { defaultTemplates } from '@/store/useStore';

/**
 * Hook untuk sinkronisasi template dengan Supabase
 * Dijalankan saat app pertama kali dimuat
 */
export function useTemplateSync() {
  const { selectedTemplate, setSelectedTemplate } = useStore();

  // Load template saat component mount
  useEffect(() => {
    const initializeTemplate = async () => {
      try {
        // Test koneksi Supabase
        const isConnected = await templateClient.testConnection();
        if (!isConnected) {
          console.warn('⚠️ Tidak dapat terhubung ke Supabase, menggunakan mode offline');
        }

        // Ambil template terakhir
        const lastTemplateName = await templateClient.loadTemplate();

        if (lastTemplateName) {
          // Cari template berdasarkan nama
          const allTemplates = [
            ...defaultTemplates,
            // Tambahkan custom templates dari store jika ada
            ...(useStore.getState().customTemplates || []),
          ];

          const foundTemplate = allTemplates.find(
            (t) => t.name === lastTemplateName
          );

          if (foundTemplate) {
            setSelectedTemplate(foundTemplate);
            console.log('✅ Template berhasil di-load:', lastTemplateName);
          }
        }
      } catch (error) {
        console.error('Error initializing template:', error);
      }
    };

    initializeTemplate();
  }, []); // Hanya dijalankan sekali saat mount

  // Simpan template saat ada perubahan pilihan
  useEffect(() => {
    if (selectedTemplate) {
      templateClient.saveTemplate(selectedTemplate.name).catch((error) => {
        console.error('Error saving template:', error);
      });
    }
  }, [selectedTemplate?.id]); // Trigger saat template berubah

  return null;
}
