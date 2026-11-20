import { z } from 'zod';

export const STORAGE_BUCKETS = [
  'payment-proofs',
  'submissions',
  'identity-docs',
  'public-assets',
] as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export interface BucketRule {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  isPublic: boolean;
  description: string;
}

export const BUCKET_RULES: Record<StorageBucket, BucketRule> = {
  'payment-proofs': {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    isPublic: false,
    description: 'Bukti transfer pembayaran tiket lomba peserta',
  },
  submissions: {
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
    ],
    allowedExtensions: ['.pdf', '.docx', '.zip'],
    isPublic: false,
    description: 'Dokumen proposal atau berkas karya lomba akademik',
  },
  'identity-docs': {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    isPublic: false,
    description: 'Kartu Tanda Mahasiswa (KTM) atau KTP peserta',
  },
  'public-assets': {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp',
    ],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.svg', '.webp'],
    isPublic: true,
    description: 'Aset publik event seperti buku panduan (guidebook) dan banner',
  },
};

/**
 * Sanitasi nama berkas untuk mencegah Directory Traversal (LFI/RFI)
 * Mengubah spasi menjadi dash, hanya mengizinkan karakter alfanumerik, titik, underscore, dan dash.
 */
export function sanitizeFilename(rawFilename: string): string {
  const base = rawFilename.split(/[/\\]/).pop() || 'file';
  return base
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
    .toLowerCase();
}

/**
 * Validasi kecocokan ekstensi dengan MIME type
 */
export function isExtensionMimeMatching(extension: string, mimeType: string): boolean {
  const ext = extension.toLowerCase();
  const mime = mimeType.toLowerCase();

  const map: Record<string, string[]> = {
    '.pdf': ['application/pdf'],
    '.jpg': ['image/jpeg', 'image/jpg'],
    '.jpeg': ['image/jpeg', 'image/jpg'],
    '.png': ['image/png'],
    '.webp': ['image/webp'],
    '.svg': ['image/svg+xml'],
    '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    '.zip': ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'],
  };

  const allowedMimes = map[ext];
  if (!allowedMimes) return false;
  return allowedMimes.includes(mime);
}

// ------------------------------------------------------------------------------
// SKEMA VALIDASI ZOD
// ------------------------------------------------------------------------------

export const SignedUploadUrlSchema = z
  .object({
    bucket: z.enum(STORAGE_BUCKETS, {
      message: 'Bucket penyimpanan tidak valid.',
    }),
    filename: z
      .string()
      .min(3, 'Nama berkas minimal 3 karakter')
      .max(255, 'Nama berkas terlalu panjang (maksimal 255 karakter)')
      .refine((name) => !name.includes('..') && !/[/\\]/.test(name), {
        message: 'Nama berkas tidak boleh mengandung karakter path traversal (.. atau / atau \\)',
      }),
    fileSizeBytes: z
      .number()
      .int()
      .positive('Ukuran berkas harus lebih besar dari 0 bytes'),
    mimeType: z
      .string()
      .min(3, 'Tipe MIME wajib diisi'),
    registrationId: z.string().optional(),
    stageId: z.string().optional(),
    competitionId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const rule = BUCKET_RULES[data.bucket];

    // 1. Validasi Batas Ukuran
    if (data.fileSizeBytes > rule.maxSizeBytes) {
      const maxMb = Math.round(rule.maxSizeBytes / (1024 * 1024));
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fileSizeBytes'],
        message: `Ukuran berkas melebihi batas maksimal untuk ${data.bucket} (Maksimal ${maxMb} MB).`,
      });
    }

    // 2. Validasi MIME Type
    if (!rule.allowedMimeTypes.includes(data.mimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mimeType'],
        message: `Tipe file "${data.mimeType}" tidak diizinkan. Tipe yang diperbolehkan: ${rule.allowedExtensions.join(', ')}`,
      });
    }

    // 3. Validasi Ekstensi Berkas
    const ext = '.' + (data.filename.split('.').pop() || '').toLowerCase();
    if (!rule.allowedExtensions.includes(ext)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['filename'],
        message: `Ekstensi berkas "${ext}" tidak sesuai. Gunakan: ${rule.allowedExtensions.join(', ')}`,
      });
    }

    // 4. Validasi Keselarasan Ekstensi dan MIME
    if (!isExtensionMimeMatching(ext, data.mimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mimeType'],
        message: `Ekstensi "${ext}" tidak cocok dengan tipe konten MIME "${data.mimeType}".`,
      });
    }

    // 5. Validasi Atribut Khusus Bucket
    if (data.bucket === 'payment-proofs' && !data.registrationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['registrationId'],
        message: 'ID Pendaftaran (registrationId) wajib disertakan untuk mengunggah bukti bayar.',
      });
    }

    if (data.bucket === 'submissions') {
      if (!data.registrationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['registrationId'],
          message: 'ID Pendaftaran (registrationId) wajib disertakan untuk mengunggah submission karya.',
        });
      }
      if (!data.competitionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['competitionId'],
          message: 'ID Kompetisi (competitionId) wajib disertakan untuk submission karya.',
        });
      }
    }
  });

export type SignedUploadUrlInput = z.infer<typeof SignedUploadUrlSchema>;

export const SignedDownloadUrlSchema = z.object({
  bucket: z.enum(STORAGE_BUCKETS, {
    message: 'Bucket penyimpanan tidak valid.',
  }),
  path: z
    .string()
    .min(3, 'Path berkas tidak boleh kosong')
    .refine((p) => !p.includes('..'), {
      message: 'Path berkas tidak boleh mengandung karakter directory traversal (..)',
    }),
  expiresInSeconds: z
    .number()
    .int()
    .min(60, 'Masa berlaku minimal 60 detik (1 menit)')
    .max(3600, 'Masa berlaku maksimal 3600 detik (1 jam)')
    .default(900), // Default 15 menit
  isDownload: z.boolean().default(false), // true: attachment download, false: inline preview
});

export type SignedDownloadUrlInput = z.infer<typeof SignedDownloadUrlSchema>;

export const ConfirmUploadSchema = z.object({
  bucket: z.enum(STORAGE_BUCKETS),
  storagePath: z.string().min(1, 'Path penyimpanan wajib ada'),
  originalFilename: z.string().min(1, 'Nama file asli wajib ada'),
  fileSizeBytes: z.number().int().positive(),
  mimeType: z.string().min(1),
  registrationId: z.string().optional(),
  stageId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type ConfirmUploadInput = z.infer<typeof ConfirmUploadSchema>;
