import {
  StorageBucket,
  BUCKET_RULES,
  isExtensionMimeMatching,
} from '@/features/storage/schema';
import {
  getSignedUploadUrlAction,
  getSignedDownloadUrlAction,
  verifyAndConfirmUploadAction,
} from '@/features/storage/actions';

export interface DirectUploadOptions {
  bucket: StorageBucket;
  registrationId?: string;
  stageId?: string;
  competitionId?: string;
  notes?: string;
  onProgress?: (percent: number) => void;
}

export interface DirectUploadResult {
  success: boolean;
  storagePath?: string;
  originalFilename?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  error?: string;
}

/**
 * Helper Client-Side: Mengunggah berkas langsung ke Supabase Storage via Signed URL.
 * Memvalidasi ukuran dan ekstensi di browser terlebih dahulu sebelum mengirim request jaringan.
 */
export async function uploadFileDirectly(
  file: File,
  options: DirectUploadOptions
): Promise<DirectUploadResult> {
  const { bucket, registrationId, stageId, competitionId, notes, onProgress } = options;
  const rule = BUCKET_RULES[bucket];

  // 1. Validasi Client-side: Ukuran Berkas
  if (file.size > rule.maxSizeBytes) {
    const maxMb = Math.round(rule.maxSizeBytes / (1024 * 1024));
    return {
      success: false,
      error: `Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimal adalah ${maxMb} MB.`,
    };
  }

  // 2. Validasi Client-side: Tipe MIME & Ekstensi
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  if (!rule.allowedExtensions.includes(ext)) {
    return {
      success: false,
      error: `Format file "${ext}" tidak didukung. Harap gunakan format: ${rule.allowedExtensions.join(', ')}`,
    };
  }

  if (!isExtensionMimeMatching(ext, file.type) && file.type !== '') {
    return {
      success: false,
      error: `Tipe file tidak sesuai dengan ekstensinya.`,
    };
  }

  onProgress?.(10);

  try {
    // 3. Minta Signed Upload URL ke Server Action
    const signResult = await getSignedUploadUrlAction({
      bucket,
      filename: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      registrationId,
      stageId,
      competitionId,
    });

    if (!signResult.success || !signResult.data) {
      return {
        success: false,
        error: signResult.error || 'Gagal mendapatkan otorisasi unggah dari server.',
      };
    }

    const { signedUrl, path } = signResult.data;

    onProgress?.(30);

    // 4. Unggah Langsung Berkas Binary ke Supabase Storage (PUT request)
    // Jika dalam mode mock/demo (URL lokal atau token mock), simulasikan upload
    if (signedUrl.includes('placeholder.supabase.co') || signedUrl.includes('mock-token')) {
      // Mode simulasi demo
      await new Promise((resolve) => setTimeout(resolve, 600));
      onProgress?.(100);

      return {
        success: true,
        storagePath: path,
        originalFilename: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
      };
    }

    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      return {
        success: false,
        error: `Gagal mengunggah berkas ke storage (${uploadResponse.status}): ${errText || uploadResponse.statusText}`,
      };
    }

    onProgress?.(80);

    // 5. Konfirmasi ke Server Action
    const confirmResult = await verifyAndConfirmUploadAction({
      bucket,
      storagePath: path,
      originalFilename: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      registrationId,
      stageId,
      notes,
    });

    if (!confirmResult.success) {
      return {
        success: false,
        error: confirmResult.error || 'Gagal memvalidasi integritas berkas di server.',
      };
    }

    onProgress?.(100);

    return {
      success: true,
      storagePath: path,
      originalFilename: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kegagalan jaringan saat mengunggah berkas.';
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Helper Client-Side: Mengambil URL sementara (Signed Download URL) untuk membaca/mengunduh berkas privat
 */
export async function getFileDownloadUrl(
  bucket: StorageBucket,
  path: string,
  options?: { expiresInSeconds?: number; isDownload?: boolean }
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const result = await getSignedDownloadUrlAction({
      bucket,
      path,
      expiresInSeconds: options?.expiresInSeconds || 900,
      isDownload: options?.isDownload || false,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Gagal menghasilkan tautan berkas',
      };
    }

    return {
      success: true,
      url: result.data.signedUrl,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil URL berkas';
    return {
      success: false,
      error: msg,
    };
  }
}
