import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClientInstance: SupabaseClient | null = null;

/**
 * Supabase Admin Client dengan wewenang Service Role (Bypass RLS).
 * HANYA boleh dipanggil di lingkungan server (Server Actions, Route Handlers, SSR).
 * JANGAN PERNAH mengekspos client ini atau kuncinya ke browser/client-side!
 */
export function createAdminClient(): SupabaseClient {
  if (adminClientInstance) {
    return adminClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Konfigurasi NEXT_PUBLIC_SUPABASE_URL belum terpasang di file environment (.env.local).'
    );
  }

  if (!serviceRoleKey) {
    // Mode demo / fallback jika service role belum diisi di .env.local
    console.warn(
      '[Supabase Admin] Peringatan: SUPABASE_SERVICE_ROLE_KEY belum disetel di .env.local. Fitur signed storage URL akan berjalan dalam mode simulasi.'
    );
  }

  adminClientInstance = createClient(
    supabaseUrl,
    serviceRoleKey || 'placeholder-service-role-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClientInstance;
}
