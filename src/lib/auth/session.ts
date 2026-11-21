import 'server-only';

import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { AuthSessionUser, AppRole, AppPermission } from './types';
import { hasPermission } from './permissions';

/**
 * Mendapatkan pengguna yang sedang login dari sesi cookie Supabase.
 * Mengembalikan null jika belum terautentikasi.
 */
export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Role default adalah 'peserta' sesuai Golden Rule #3
    const userRole = (user.user_metadata?.role as AppRole) || 'peserta';

    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Peserta',
      role: userRole,
      institution: user.user_metadata?.institution || '',
      phone: user.user_metadata?.phone || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      is_verified: Boolean(user.email_confirmed_at),
    };
  } catch (err) {
    // Graceful fallback saat koneksi Supabase belum aktif di environment
    return null;
  }
}

/**
 * Mengharuskan pengguna sudah login. Melempar error atau mengembalikan user.
 */
export async function requireUser(): Promise<AuthSessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED: Anda harus masuk terlebih dahulu.');
  }
  return user;
}

/**
 * Mengharuskan pengguna memiliki salah satu role yang diizinkan.
 */
export async function requireRole(allowedRoles: AppRole[]): Promise<AuthSessionUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`FORBIDDEN: Peran ${user.role} tidak memiliki hak akses ke halaman ini.`);
  }
  return user;
}

/**
 * Mengharuskan pengguna memiliki izin tertentu.
 */
export async function requirePermission(permission: AppPermission): Promise<AuthSessionUser> {
  const user = await requireUser();
  if (!hasPermission(user.role, permission)) {
    throw new Error(`FORBIDDEN: Anda tidak memiliki izin "${permission}".`);
  }
  return user;
}
