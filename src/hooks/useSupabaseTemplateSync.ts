/**
 * SUPABASE REALTIME SYNC HOOK - Production Ready
 * =============================================
 * 
 * Features:
 * - UPSERT to id: 1 (consistent across all devices)
 * - Fetch from Supabase on load (not localStorage)
 * - Realtime subscription via supabase.channel
 * - No localStorage dependency
 * - Automatic sync between devices
 * 
 * Setup:
 * 1. npm install @supabase/supabase-js
 * 2. Update SUPABASE_URL and SUPABASE_ANON_KEY below
 * 3. Import in App.tsx and use the hook
 */

import { useEffect, useRef, useState } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { useStore } from '@/store/useStore';

// ==================== CONFIGURATION ====================
// Get these from: https://app.supabase.com → Settings > API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI
const SUPABASE_TABLE_NAME = 'settings'; // Table name in Supabase
const CONSISTENT_TEMPLATE_ID = 1; // All devices use this ID

// ==================== SUPABASE CLIENT INITIALIZATION ====================
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * UPSERT template to Supabase
 * If id=1 exists → UPDATE
 * If id=1 doesn't exist → INSERT
 */
async function upsertTemplate(templateName: string): Promise<boolean> {
  try {
    console.log('💾 [SUPABASE] Upserting template:', templateName);

    const { error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .upsert(
        {
          id: CONSISTENT_TEMPLATE_ID,
          template_name: templateName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' } // UPSERT on id column
      );

    if (error) {
      console.error('❌ [SUPABASE] Upsert error:', error.message);
      throw error;
    }

    console.log('✅ [SUPABASE] Template upserted successfully:', templateName);
    return true;
  } catch (error) {
    console.error('❌ [SUPABASE] Error upserting template:', error);
    throw error;
  }
}

/**
 * FETCH template from Supabase
 * Gets the latest template_name for id=1
 */
async function fetchTemplateFromSupabase(): Promise<string | null> {
  try {
    console.log('🔄 [SUPABASE] Fetching template from Supabase...');

    const { data, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select('template_name')
      .eq('id', CONSISTENT_TEMPLATE_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected on first load)
      console.error('❌ [SUPABASE] Fetch error:', error.message);
      throw error;
    }

    const templateName = data?.template_name || null;
    console.log('✅ [SUPABASE] Template fetched:', templateName || 'None (first load)');

    return templateName;
  } catch (error) {
    console.error('❌ [SUPABASE] Error fetching template:', error);
    throw error;
  }
}

/**
 * SETUP REALTIME SUBSCRIPTION
 * Listens for changes to id=1 in settings table
 * Callback is triggered when data changes
 */
function setupRealtimeSubscription(
  onTemplateChange: (templateName: string) => void
): RealtimeChannel {
  console.log('🔌 [SUPABASE] Setting up realtime subscription...');

  const channel = supabase
    .channel(`public:${SUPABASE_TABLE_NAME}:id=eq.${CONSISTENT_TEMPLATE_ID}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: SUPABASE_TABLE_NAME,
        filter: `id=eq.${CONSISTENT_TEMPLATE_ID}`,
      },
      (payload: any) => {
        const newTemplateName = payload.new?.template_name;
        if (newTemplateName) {
          console.log('🔔 [REALTIME] Template changed:', newTemplateName);
          onTemplateChange(newTemplateName);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ [REALTIME] Subscription active');
      } else if (status === 'CLOSED') {
        console.log('ℹ️ [REALTIME] Subscription closed');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ [REALTIME] Subscription error');
      }
    });

  return channel;
}

/**
 * REACT HOOK: useSupabaseTemplateSync
 * 
 * This hook handles:
 * 1. Loading template from Supabase on mount
 * 2. Syncing selectedTemplate changes to Supabase
 * 3. Setting up realtime subscription for auto-updates
 * 4. Managing Supabase connection lifecycle
 */
export function useSupabaseTemplateSync() {
  const { selectedTemplate, setSelectedTemplate } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ==================== LOAD TEMPLATE ON MOUNT ====================
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        console.log('🚀 [APP] Initializing template sync...');

        // Step 1: Fetch template from Supabase
        const templateName = await fetchTemplateFromSupabase();

        if (!isMounted) return;

        // Step 2: If template found, set it in store
        if (templateName) {
          const allTemplates = [
            ...useStore.getState().customTemplates || []
          ];
          
          // Try to find in custom templates first
          let foundTemplate = allTemplates.find(t => t.name === templateName);
          
          if (foundTemplate) {
            setSelectedTemplate(foundTemplate);
            console.log('✅ [APP] Template loaded and set:', templateName);
          } else {
            console.log('ℹ️ [APP] Template name found but template object not in store:', templateName);
          }
        }

        // Step 3: Setup realtime subscription
        const channel = setupRealtimeSubscription((newTemplateName) => {
          // When realtime update received, find and set the template
          const allTemplates = [
            ...useStore.getState().customTemplates || []
          ];
          
          const foundTemplate = allTemplates.find(t => t.name === newTemplateName);
          if (foundTemplate) {
            setSelectedTemplate(foundTemplate);
            console.log('✅ [APP] Realtime update applied:', newTemplateName);
          }
        });

        if (isMounted) {
          channelRef.current = channel;
        }

        setError(null);
        console.log('✅ [APP] Template sync initialized successfully');
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error('❌ [APP] Initialization error:', error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []); // Only run on mount

  // ==================== SYNC TEMPLATE CHANGES ====================
  useEffect(() => {
    if (!selectedTemplate) return;

    (async () => {
      try {
        console.log('📢 [STORE] Selected template changed:', selectedTemplate.name);

        // Upsert to Supabase (id=1)
        await upsertTemplate(selectedTemplate.name);

        // No need to update store again - it's already updated
        console.log('✅ [SYNC] Template synced to Supabase:', selectedTemplate.name);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('❌ [SYNC] Failed to sync template:', error.message);
        
        // Still allow user to use the template even if sync fails
        // (add retry logic if needed)
      }
    })();
  }, [selectedTemplate?.id]); // Trigger when selected template ID changes

  // ==================== CLEANUP ON UNMOUNT ====================
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log('🧹 [CLEANUP] Unsubscribing from realtime channel...');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return { isLoading, error };
}

/**
 * DEBUG HELPER
 * 
 * Call this in browser console: window.debugSupabase()
 */
(window as any).debugSupabase = async () => {
  console.log('=== SUPABASE DEBUG INFO ===');
  console.log('URL:', SUPABASE_URL);
  console.log('Table:', SUPABASE_TABLE_NAME);
  console.log('Template ID:', CONSISTENT_TEMPLATE_ID);
  console.log('Selected template:', useStore.getState().selectedTemplate?.name || 'None');

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select('*')
      .eq('id', CONSISTENT_TEMPLATE_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Fetch error:', error);
    } else {
      console.log('📊 Data in Supabase:', data || 'None (first load)');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('Realtime channel status:', (window as any).__supabaseChannel?.status || 'Not setup');
};

console.log('✅ Supabase Template Sync Hook loaded. Call window.debugSupabase() for info.');
