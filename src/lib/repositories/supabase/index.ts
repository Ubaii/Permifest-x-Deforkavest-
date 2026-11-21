import {
  Competition,
  Registration,
  Submission,
  JudgeAssignment,
  User,
  UserRole,
} from '@/lib/types';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ICompetitionRepository,
  IRegistrationRepository,
  ISubmissionRepository,
  IScoreRepository,
  IUserRepository,
} from '../types';

export class SupabaseCompetitionRepository implements ICompetitionRepository {
  async getAll(): Promise<Competition[]> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('competitions')
      .select('*, stages(*), rubric_criteria(*)')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as unknown as Competition[];
  }

  async getBySlug(slug: string): Promise<Competition | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('competitions')
      .select('*, stages(*), rubric_criteria(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as unknown as Competition) || null;
  }

  async getById(id: string): Promise<Competition | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('competitions')
      .select('*, stages(*), rubric_criteria(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as unknown as Competition) || null;
  }

  async create(data: Omit<Competition, 'id' | 'created_at' | 'updated_at'>): Promise<Competition> {
    const admin = createAdminClient();
    const { data: created, error } = await admin
      .from('competitions')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return created as unknown as Competition;
  }

  async update(id: string, data: Partial<Competition>): Promise<Competition> {
    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from('competitions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated as unknown as Competition;
  }

  async delete(id: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from('competitions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export class SupabaseRegistrationRepository implements IRegistrationRepository {
  async getAll(filters?: { competitionId?: string; status?: string }): Promise<Registration[]> {
    const supabase = await createServerSupabase();
    let query = supabase.from('registrations').select('*, competition:competitions(*), user:users(*), payment:payments(*)');

    if (filters?.competitionId) {
      query = query.eq('competition_id', filters.competitionId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as unknown as Registration[];
  }

  async getByUserId(userId: string): Promise<Registration[]> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('registrations')
      .select('*, competition:competitions(*), payment:payments(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as unknown as Registration[];
  }

  async getById(id: string): Promise<Registration | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('registrations')
      .select('*, competition:competitions(*), user:users(*), payment:payments(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as unknown as Registration) || null;
  }

  async create(data: {
    competition_id: string;
    user_id: string;
    form_data?: Record<string, unknown>;
  }): Promise<Registration> {
    const supabase = await createServerSupabase();
    const { data: created, error } = await supabase
      .from('registrations')
      .insert({
        competition_id: data.competition_id,
        user_id: data.user_id,
        form_data: data.form_data || {},
        status: 'pending_payment',
      })
      .select('*, competition:competitions(*)')
      .single();

    if (error) throw new Error(error.message);
    return created as unknown as Registration;
  }

  async updatePayment(
    registrationId: string,
    payload: {
      status: 'pending' | 'uploaded' | 'verified' | 'rejected';
      proof_url?: string;
      proof_name?: string;
      rejection_reason?: string;
    }
  ): Promise<Registration> {
    const admin = createAdminClient();
    const updateData: Record<string, unknown> = {
      status: payload.status,
    };
    if (payload.proof_url !== undefined) updateData.proof_url = payload.proof_url;
    if (payload.proof_name !== undefined) updateData.proof_name = payload.proof_name;
    if (payload.rejection_reason !== undefined) updateData.rejection_reason = payload.rejection_reason;
    if (payload.status === 'uploaded') updateData.uploaded_at = new Date().toISOString();
    if (payload.status === 'verified') updateData.verified_at = new Date().toISOString();

    const { error: payErr } = await admin
      .from('payments')
      .update(updateData)
      .eq('registration_id', registrationId);

    if (payErr) throw new Error(payErr.message);

    if (payload.status === 'verified') {
      await admin.from('registrations').update({ status: 'verified' }).eq('id', registrationId);
    }

    const updated = await this.getById(registrationId);
    if (!updated) throw new Error('Registrasi tidak ditemukan');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from('registrations').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export class SupabaseSubmissionRepository implements ISubmissionRepository {
  async getAll(filters?: { competitionId?: string; stageId?: string }): Promise<Submission[]> {
    const supabase = await createServerSupabase();
    let query = supabase.from('submissions').select('*, registration:registrations(*, competition:competitions(*), user:users(*))');

    if (filters?.stageId) {
      query = query.eq('stage_id', filters.stageId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as unknown as Submission[];
  }

  async getByRegistrationId(registrationId: string): Promise<Submission[]> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('registration_id', registrationId)
      .order('version', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as unknown as Submission[];
  }

  async getById(id: string): Promise<Submission | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('submissions')
      .select('*, registration:registrations(*, user:users(*))')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as unknown as Submission) || null;
  }

  async create(data: {
    registration_id: string;
    stage_id: string;
    file_name?: string;
    file_url?: string;
    link_url?: string;
    notes?: string;
  }): Promise<Submission> {
    const supabase = await createServerSupabase();

    // Dapatkan nomor versi berikutnya
    const { data: latest } = await supabase
      .from('submissions')
      .select('version')
      .eq('registration_id', data.registration_id)
      .eq('stage_id', data.stage_id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latest?.version || 0) + 1;

    // Set is_latest false untuk entri sebelumnya
    await supabase
      .from('submissions')
      .update({ is_latest: false })
      .eq('registration_id', data.registration_id)
      .eq('stage_id', data.stage_id);

    const { data: created, error } = await supabase
      .from('submissions')
      .insert({
        registration_id: data.registration_id,
        stage_id: data.stage_id,
        version: nextVersion,
        file_name: data.file_name,
        file_url: data.file_url,
        link_url: data.link_url,
        notes: data.notes,
        is_latest: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return created as unknown as Submission;
  }

  async delete(id: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from('submissions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export class SupabaseScoreRepository implements IScoreRepository {
  async getAssignmentsByJudge(judgeId: string): Promise<JudgeAssignment[]> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('judge_assignments')
      .select('*, submission:submissions(*, registration:registrations(*, user:users(*))), scores:scores(*)')
      .eq('judge_id', judgeId);

    if (error) throw new Error(error.message);
    return (data || []) as unknown as JudgeAssignment[];
  }

  async submitScore(
    assignmentId: string,
    scores: Array<{ criteriaId: string; score: number; comment?: string }>
  ): Promise<void> {
    const supabase = await createServerSupabase();
    for (const item of scores) {
      const { error } = await supabase.from('scores').upsert(
        {
          assignment_id: assignmentId,
          rubric_criteria_id: item.criteriaId,
          score: item.score,
          comment: item.comment || '',
        },
        { onConflict: 'assignment_id,rubric_criteria_id' }
      );
      if (error) throw new Error(error.message);
    }
  }

  async lockScores(competitionId: string): Promise<void> {
    const admin = createAdminClient();
    // Kunci nilai via database function atau update tabel scores
    const { error } = await admin.rpc('lock_competition_scores', {
      p_competition_id: competitionId,
    });
    if (error) {
      // Fallback update langsung jika RPC belum dieksekusi
      await admin
        .from('scores')
        .update({ is_locked: true })
        .not('id', 'is', null);
    }
  }
}

export class SupabaseUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as unknown as User) || null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as unknown as User) || null;
  }

  async getAll(filters?: { role?: UserRole }): Promise<User[]> {
    const supabase = await createServerSupabase();
    let query = supabase.from('users').select('*');
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as unknown as User[];
  }

  async updateRole(userId: string, newRole: UserRole): Promise<User> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as User;
  }
}
