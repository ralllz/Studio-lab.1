import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://srmfpdxuqqrdhrnjarsj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybWZwZHh1cXFyZGhybmphcnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDU3NjUsImV4cCI6MjA4NjU4MTc2NX0.s5uQIm5Gdshe5P2M8AmJtVFk9RobaFtLITdtHJ_oD1M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper: convert File to base64 data URL
export async function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
