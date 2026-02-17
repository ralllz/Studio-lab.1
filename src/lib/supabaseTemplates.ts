import { createClient } from '@supabase/supabase-js';
import type { Template } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchTemplatesFromSupabase(): Promise<Template[]> {
  try {
    const { data, error } = await supabase.from('templates').select('*');
    if (error) throw error;
    if (!data) return [];
    // normalize field names
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      thumbnailUrl: row.thumbnail_url,
      overlayImageUrl: row.overlay_url,
      framesCount: row.frames_count,
      frames: row.frames || [],
      aspectRatio: row.aspect_ratio || '3:4',
    } as Template));
  } catch (err) {
    console.error('fetchTemplatesFromSupabase error', err);
    return [];
  }
}

export async function upsertTemplateToSupabase(t: Template) {
  try {
    const payload = {
      id: t.id,
      name: t.name,
      thumbnail_url: t.thumbnailUrl,
      overlay_url: t.overlayImageUrl,
      frames_count: t.framesCount,
      frames: t.frames,
      aspect_ratio: t.aspectRatio,
    };
    const { error } = await supabase.from('templates').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('upsertTemplateToSupabase error', err);
    return false;
  }
}

export async function deleteTemplateFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteTemplateFromSupabase error', err);
    return false;
  }
}

export function subscribeTemplatesRealtime(onChange: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:templates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'templates' },
        (payload) => onChange(payload)
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.error('subscribeTemplatesRealtime error', err);
    return null;
  }
}
