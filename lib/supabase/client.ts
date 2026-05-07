import { createClient } from '@supabase/supabase-js'

// Client exposé pour le browser/client-side, utilisant la clé anonyme (ANON KEY)
export const createBrowserSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
