import { z, ZodTypeAny } from 'zod';
import { FormFieldConfig } from '@/lib/types';

/**
 * Membangun skema Zod secara dinamis berdasarkan konfigurasi form_fields kompetisi.
 * Digunakan di klien untuk validasi formulir dan di server untuk otoritas data.
 * Sepenuhnya kompatibel dengan Zod v4.
 */
export function buildDynamicFormSchema(fields: FormFieldConfig[]) {
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of fields) {
    let validator: ZodTypeAny;

    switch (field.type) {
      case 'number':
        validator = z.preprocess(
          (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
          field.required
            ? z.number()
            : z.number().optional()
        );
        break;

      case 'email':
        validator = field.required
          ? z.string().min(1, `${field.label} wajib diisi`).email('Format email tidak valid')
          : z.string().email('Format email tidak valid').optional().or(z.literal(''));
        break;

      case 'url':
        validator = field.required
          ? z.string().min(1, `${field.label} wajib diisi`).url('Format URL/tautan tidak valid')
          : z.string().url('Format URL/tautan tidak valid').optional().or(z.literal(''));
        break;

      case 'select':
        validator = field.required
          ? z.string().min(1, `Pilih salah satu ${field.label}`)
          : z.string().optional();
        break;

      case 'textarea':
      case 'text':
      default:
        validator = field.required
          ? z.string().trim().min(1, `${field.label} tidak boleh kosong`)
          : z.string().trim().optional();
        break;
    }

    shape[field.id] = validator;
  }

  return z.object(shape);
}

/**
 * Validasi payload form data dinamis pendaftaran kompetisi
 */
export function validateDynamicFormData(
  fields: FormFieldConfig[],
  data: Record<string, unknown>
): { success: boolean; data?: Record<string, unknown>; error?: string } {
  try {
    const schema = buildDynamicFormSchema(fields);
    const result = schema.safeParse(data);
    if (!result.success) {
      const flattened = result.error.flatten();
      const firstError = Object.values(flattened.fieldErrors)[0]?.[0] || 'Isian formulir tidak valid';
      return { success: false, error: firstError };
    }
    return { success: true, data: result.data as Record<string, unknown> };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal memvalidasi data formulir';
    return { success: false, error: msg };
  }
}
