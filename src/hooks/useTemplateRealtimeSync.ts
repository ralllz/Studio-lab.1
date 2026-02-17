/**
 * REACT HOOK - SUPABASE REALTIME TEMPLATE SYNC
 * =============================================
 * 
 * Gunakan hook ini di React component:
 * 
 * import { useTemplateRealtimeSync } from '@/hooks/useTemplateRealtimeSync';
 * 
 * function MyComponent() {
 *   const { template, setTemplate, isLoading } = useTemplateRealtimeSync();
 *   
 *   return (
 *     <div>
 *       <p>Current: {template}</p>
 *       <button onClick={() => setTemplate('Classic Frame')}>
 *         Select Template
 *       </button>
 *     </div>
 *   );
 * }
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Configuration
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← GANTI SINI
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← GANTI SINI
const CONSISTENT_TEMPLATE_ID = 1; // ID yang konsisten

interface UseTemplateSyncReturn {
  template: string | null;
  setTemplate: (name: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
}

export function useTemplateRealtimeSync(): UseTemplateSyncReturn {
  const [template, setTemplateState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const saveTemplate = useCallback(async (templateName: string): Promise<void> => {
    try {
      const timestamp = new Date().toISOString();
      const url = `${SUPABASE_URL}/rest/v1/settings`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates', // UPSERT
        },
        body: JSON.stringify({
          id: CONSISTENT_TEMPLATE_ID,
          template_name: templateName,
          updated_at: timestamp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      console.log('✅ Template saved to Supabase:', templateName);

      // Update local state
      setTemplateState(templateName);

      // Update localStorage backup
      localStorage.setItem('template_backup', templateName);
      localStorage.setItem('template_sync_time', timestamp);

      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('❌ Error saving template:', error);
      setError(error);
      throw error;
    }
  }, []);

  const loadTemplate = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading template from Supabase...');

      const url = `${SUPABASE_URL}/rest/v1/settings?id=eq.${CONSISTENT_TEMPLATE_ID}&select=template_name`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.length > 0) {
        const templateName = data[0].template_name;
        console.log('✅ Template loaded from Supabase:', templateName);
        setTemplateState(templateName);
        localStorage.setItem('template_backup', templateName);
        setError(null);
        return;
      }

      // Fallback ke localStorage
      const backup = localStorage.getItem('template_backup');
      if (backup) {
        console.log('💾 Using localStorage backup:', backup);
        setTemplateState(backup);
        setError(null);
        return;
      }

      console.log('ℹ️ No template found');
      setTemplateState(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('❌ Error loading template:', error);
      setError(error);

      // Fallback ke localStorage
      const backup = localStorage.getItem('template_backup');
      if (backup) {
        console.log('💾 Using localStorage backup:', backup);
        setTemplateState(backup);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupRealtime = useCallback((): void => {
    try {
      console.log('🔌 Setting up Realtime subscription...');

      // Convert https:// ke wss://
      const wsUrl = SUPABASE_URL
        .replace('https://', 'wss://')
        .replace('http://', 'ws://') + '/realtime/v1';

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ Connected to Realtime');
        setIsConnected(true);

        // Subscribe message
        const msg = {
          type: 'subscribe',
          event: '*',
          schema: 'public',
          table: 'settings',
          filter: `id=eq.${CONSISTENT_TEMPLATE_ID}`,
          access_token: SUPABASE_ANON_KEY,
        };

        ws.send(JSON.stringify(msg));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.event === 'UPDATE' || msg.event === 'INSERT') {
            if (msg.new && msg.new.template_name) {
              console.log('🔔 Realtime update received:', msg.new.template_name);
              setTemplateState(msg.new.template_name);
              localStorage.setItem('template_backup', msg.new.template_name);
            }
          }
        } catch (parseError) {
          console.error('Error parsing message:', parseError);
        }
      };

      ws.onerror = (wsError) => {
        console.error('❌ WebSocket error:', wsError);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('ℹ️ Disconnected from Realtime');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('❌ Realtime setup error:', error);
      setError(error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // Load template
        await loadTemplate();

        // Setup realtime
        setupRealtime();
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
        }
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [loadTemplate, setupRealtime]);

  return {
    template,
    setTemplate: saveTemplate,
    isLoading,
    error,
    isConnected,
  };
}

/**
 * Alternative: Hook dengan custom callback
 * Gunakan ini jika ingin handle perubahan dengan cara custom
 */
export function useTemplateRealtimeSyncWithCallback(
  onTemplateChange?: (template: string) => void
): UseTemplateSyncReturn {
  const { template, setTemplate, isLoading, error, isConnected } = useTemplateRealtimeSync();

  useEffect(() => {
    if (template && onTemplateChange) {
      onTemplateChange(template);
    }
  }, [template, onTemplateChange]);

  return { template, setTemplate, isLoading, error, isConnected };
}
