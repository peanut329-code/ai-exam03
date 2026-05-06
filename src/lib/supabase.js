import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () =>
  !!(url && key && url !== 'your_supabase_project_url')

export const supabase = isSupabaseConfigured() ? createClient(url, key) : null
