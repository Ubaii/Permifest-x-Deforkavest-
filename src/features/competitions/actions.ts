'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/session';
import { competitionRepository } from '@/lib/repositories';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  CompetitionUpsertSchema,
  RubricCriterionSchema,
  StageSchema,
  RubricCriterionInput,
  StageInput,
} from './schema';
import { Competition } from '@/lib/types';
import { z } from 'zod';

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Server Action: Membuat Cabang Lomba Baru
 */
export async function createCompetitionAction(formData: unknown): Promise<ActionResponse<Competition>> {
  try {
    const user = await requirePermission('competitions.write');
    const validated = CompetitionUpsertSchema.parse(formData);

    const created = await competitionRepository.create(validated as unknown as Omit<Competition, 'id' | 'created_at' | 'updated_at'>);

    // Audit log
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      action: 'competition.create',
      entity_type: 'competition',
      entity_id: created.id,
      competition_id: created.id,
      payload: { name: created.name, slug: created.slug, fee_idr: created.registration_fee },
    });

    revalidatePath('/dashboard/admin/kompetisi');
    revalidatePath('/kompetisi');
    revalidatePath('/');

    return { success: true, data: created };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validasi data kompetisi gagal.',
        fieldErrors: err.flatten().fieldErrors,
      };
    }
    const message = err instanceof Error ? err.message : 'Gagal membuat kompetisi.';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Memperbarui Data Lomba
 */
export async function updateCompetitionAction(
  id: string,
  formData: unknown
): Promise<ActionResponse<Competition>> {
  try {
    const user = await requirePermission('competitions.write');
    const validated = CompetitionUpsertSchema.parse(formData);

    const updated = await competitionRepository.update(id, validated as unknown as Partial<Competition>);

    // Audit log
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      action: 'competition.update',
      entity_type: 'competition',
      entity_id: id,
      competition_id: id,
      payload: { updated_fields: Object.keys(validated) },
    });

    revalidatePath('/dashboard/admin/kompetisi');
    revalidatePath(`/kompetisi/${updated.slug}`);
    revalidatePath('/kompetisi');

    return { success: true, data: updated };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validasi data kompetisi gagal.',
        fieldErrors: err.flatten().fieldErrors,
      };
    }
    const message = err instanceof Error ? err.message : 'Gagal memperbarui kompetisi.';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Menghapus Lomba
 */
export async function deleteCompetitionAction(id: string): Promise<ActionResponse> {
  try {
    const user = await requirePermission('competitions.write');

    await competitionRepository.delete(id);

    // Audit log
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      action: 'competition.delete',
      entity_type: 'competition',
      entity_id: id,
      payload: { deleted_id: id },
    });

    revalidatePath('/dashboard/admin/kompetisi');
    revalidatePath('/kompetisi');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus kompetisi.';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Toggle Status Publikasi Lomba
 */
export async function togglePublishCompetitionAction(
  id: string,
  currentStatus: boolean
): Promise<ActionResponse<Competition>> {
  try {
    const user = await requirePermission('competitions.write');
    const nextStatus = !currentStatus;

    const updated = await competitionRepository.update(id, { is_published: nextStatus });

    // Audit log
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      action: nextStatus ? 'competition.publish' : 'competition.unpublish',
      entity_type: 'competition',
      entity_id: id,
      competition_id: id,
      payload: { is_published: nextStatus },
    });

    revalidatePath('/dashboard/admin/kompetisi');
    revalidatePath('/kompetisi');
    revalidatePath(`/kompetisi/${updated.slug}`);

    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah status publikasi.';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Menyimpan Rubrik Penilaian (Total Bobot Wajib 100%)
 */
export async function saveRubricCriteriaAction(
  competitionId: string,
  criteriaList: RubricCriterionInput[]
): Promise<ActionResponse> {
  try {
    const user = await requirePermission('competitions.write');

    // Validasi tiap kriteria
    const validatedList = criteriaList.map((c, idx) =>
      RubricCriterionSchema.parse({ ...c, position: idx + 1, competition_id: competitionId })
    );

    // Validasi Golden Rule: Total bobot harus tepat 100%
    const totalWeight = validatedList.reduce((acc, curr) => acc + Number(curr.weight), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return {
        success: false,
        error: `Total bobot rubrik harus tepat 100%. Saat ini total bobot adalah ${totalWeight}%.`,
      };
    }

    const admin = createAdminClient();

    // Hapus kriteria lama untuk kompetisi ini, lalu ganti dengan yang baru
    const { error: delError } = await admin
      .from('rubric_criteria')
      .delete()
      .eq('competition_id', competitionId);

    if (delError) throw new Error(delError.message);

    if (validatedList.length > 0) {
      const dbPayload = validatedList.map((c) => ({
        competition_id: competitionId,
        name: c.name,
        description: c.description,
        max_score: c.max_score,
        weight: c.weight,
        position: c.position,
      }));

      const { error: insError } = await admin.from('rubric_criteria').insert(dbPayload);
      if (insError) throw new Error(insError.message);
    }

    // Audit log
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      action: 'rubric.update',
      entity_type: 'rubric',
      competition_id: competitionId,
      payload: { criteria_count: validatedList.length, total_weight: totalWeight },
    });

    revalidatePath('/dashboard/admin/kompetisi');
    revalidatePath('/dashboard/admin/penilaian');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan rubrik penilaian.';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Menyimpan Konfigurasi Tahapan Lomba (Penyisihan/Final)
 */
export async function saveStagesAction(
  competitionId: string,
  stagesList: StageInput[]
): Promise<ActionResponse> {
  try {
    const user = await requirePermission('competitions.write');
    const validatedList = stagesList.map((st, idx) =>
      StageSchema.parse({ ...st, position: idx + 1, competition_id: competitionId })
    );

    const admin = createAdminClient();

    // Upsert tahapan
    for (const st of validatedList) {
      const payload: Record<string, unknown> = {
        competition_id: competitionId,
        name: st.name,
        key: st.key,
        position: st.position,
        starts_at: st.starts_at || null,
        submission_deadline: st.submission_deadline || null,
        ends_at: st.ends_at || null,
      };

      if (st.id) {
        await admin.from('stages').update(payload).eq('id', st.id);
      } else {
        await admin.from('stages').insert(payload);
      }
    }

    // Audit log
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      action: 'stages.update',
      entity_type: 'stage',
      competition_id: competitionId,
      payload: { stages_count: validatedList.length },
    });

    revalidatePath('/dashboard/admin/kompetisi');
    revalidatePath('/kompetisi');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi tahapan.';
    return { success: false, error: message };
  }
}
