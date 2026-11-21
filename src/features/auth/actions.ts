'use server';

import { redirect } from 'next/navigation';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schema';

export interface AuthActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server Action: Masuk Akun (Login)
 */
export async function loginAction(
  rawInput: LoginInput
): Promise<AuthActionResult<{ role: string; redirectUrl: string }>> {
  try {
    const parsed = LoginSchema.safeParse(rawInput);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      return {
        success: false,
        message: Object.values(flattened.fieldErrors)[0]?.[0] || 'Validasi login gagal',
        fieldErrors: flattened.fieldErrors,
      };
    }

    const { email, password } = parsed.data;
    const supabase = await createServerSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Periksa bila dalam mode demo/placeholder Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder.supabase.co')
      ) {
        // Mode simulasi fallback
        return {
          success: true,
          message: 'Berhasil masuk (mode simulasi demo)',
          data: {
            role: 'peserta',
            redirectUrl: '/dashboard/peserta',
          },
        };
      }

      return {
        success: false,
        message: 'Alamat email atau kata sandi tidak sesuai. Silakan periksa kembali.',
      };
    }

    const userRole = (data.user?.user_metadata?.role as string) || 'peserta';
    const redirectUrl =
      userRole === 'super_admin' || userRole === 'panitia'
        ? '/dashboard/admin'
        : userRole === 'juri'
        ? '/dashboard/juri'
        : '/dashboard/peserta';

    return {
      success: true,
      message: 'Berhasil masuk ke akun Permifest x Deforkafest',
      data: {
        role: userRole,
        redirectUrl,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mencoba masuk.';
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Server Action: Pendaftaran Akun Peserta Baru (Register)
 * Golden Rule #3: Registrasi publik SELALU menghasilkan role 'peserta'.
 */
export async function registerAction(
  rawInput: RegisterInput
): Promise<AuthActionResult<{ email: string; requiresVerification: boolean }>> {
  try {
    const parsed = RegisterSchema.safeParse(rawInput);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      return {
        success: false,
        message: Object.values(flattened.fieldErrors)[0]?.[0] || 'Validasi pendaftaran gagal',
        fieldErrors: flattened.fieldErrors,
      };
    }

    const { email, password, fullName, institution, phone } = parsed.data;
    const supabase = await createServerSupabase();

    // Golden Rule #3: Peran ditetapkan di server secara statis sebagai 'peserta'
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          institution: institution || '',
          phone: phone || '',
          role: 'peserta', // MUTLAK: Selalu peserta
        },
      },
    });

    if (error) {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder.supabase.co')
      ) {
        // Fallback demo simulator
        return {
          success: true,
          message: 'Pendaftaran akun berhasil dibuat (mode simulasi demo)',
          data: {
            email,
            requiresVerification: false,
          },
        };
      }

      return {
        success: false,
        message: error.message || 'Gagal mendaftarkan akun. Silakan coba lagi.',
      };
    }

    const requiresVerification = !data.session;

    return {
      success: true,
      message: requiresVerification
        ? 'Pendaftaran berhasil! Tautan verifikasi telah dikirimkan ke alamat email Anda.'
        : 'Pendaftaran berhasil! Akun Anda telah siap digunakan.',
      data: {
        email,
        requiresVerification,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat pendaftaran akun.';
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Server Action: Lupa Kata Sandi
 */
export async function forgotPasswordAction(
  rawInput: ForgotPasswordInput
): Promise<AuthActionResult> {
  try {
    const parsed = ForgotPasswordSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Format email tidak valid',
      };
    }

    const { email } = parsed.data;
    const supabase = await createServerSupabase();

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    // Respons netral untuk mencegah user enumeration / account leakage
    return {
      success: true,
      message: 'Instruksi pemulihan kata sandi telah dikirimkan jika alamat email terdaftar di sistem.',
    };
  } catch {
    return {
      success: true,
      message: 'Instruksi pemulihan kata sandi telah dikirimkan jika alamat email terdaftar di sistem.',
    };
  }
}

/**
 * Server Action: Pembaruan Kata Sandi Baru (Reset Password)
 */
export async function updatePasswordAction(
  rawInput: ResetPasswordInput
): Promise<AuthActionResult> {
  try {
    const parsed = ResetPasswordSchema.safeParse(rawInput);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      return {
        success: false,
        message: Object.values(flattened.fieldErrors)[0]?.[0] || 'Validasi kata sandi gagal',
        fieldErrors: flattened.fieldErrors,
      };
    }

    const { password } = parsed.data;
    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return {
        success: false,
        message: error.message || 'Gagal memperbarui kata sandi.',
      };
    }

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Terjadi kegagalan saat memperbarui kata sandi.';
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Server Action: Keluar Akun (Logout)
 */
export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika sudah tidak ada sesi aktif
  }
  redirect('/login');
}
