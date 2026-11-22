import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('permifest_demo_role');
    cookieStore.delete('permifest_demo_email');

    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan error jika sudah tidak ada sesi aktif
  }

  return NextResponse.json({ success: true, message: 'Berhasil keluar akun' });
}
