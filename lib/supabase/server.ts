import { createClient } from '@supabase/supabase-js'

// Client exposé pour le serveur (Next.js server-side), utilisant la Service Role Key 
// qui permet d'outrepasser les Row Level Security (RLS) pour nos manipulations administratives internes.
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
