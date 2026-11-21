import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email wajib diisi')
    .email('Format alamat email tidak valid'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi')
    .min(6, 'Kata sandi minimal 6 karakter'),
});

export const RegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Nama lengkap minimal 2 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'Email wajib diisi')
      .email('Format alamat email tidak valid'),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter')
      .regex(/[A-Za-z]/, 'Kata sandi harus mengandung huruf')
      .regex(/[0-9]/, 'Kata sandi harus mengandung angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
    institution: z.string().trim().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+-\s]*$/, 'Format nomor telepon tidak valid')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  });

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email wajib diisi')
    .email('Format alamat email tidak valid'),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Kata sandi baru minimal 8 karakter')
      .regex(/[A-Za-z]/, 'Kata sandi harus mengandung huruf')
      .regex(/[0-9]/, 'Kata sandi harus mengandung angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi baru tidak cocok',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
